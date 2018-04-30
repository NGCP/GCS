const {app, ipcMain, BrowserWindow, Menu, dialog, shell} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const xbee = require('./build/Release/xbee');

// =============================================================================
//       Global program-wide variables
// =============================================================================


global.vehicles = {};


// =============================================================================
//       Set up the application window
// =============================================================================


let menuBar;
let theWindow;
global.defaultLocation = null;


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', setup);

// Create the program window when the 'activate' signal is received
// The activate should do the same as the setup
app.on('activate', setup);

// This method to be called to do any setup work required prior to
// actually displaying the BrowserWindow. Called when app receives the
// "ready" signal.
function setup() {
   //only do this once
   if(theWindow == null) {
      setMenuBar();
      createWindow();
      xbeeConnect();
   }
}

// This method creates a new window by loading index.html and setting the
// size of the window to fill screen
function createWindow() {

   // Still using my key because new key doesnt have geolocation api enabled
   process.env.GOOGLE_API_KEY = 'AIzaSyB1gepR_EONqgEcxuADmEZjizTuOU_cfnU';

   theWindow = new BrowserWindow({width:1500, height:1000});
   theWindow.maximize();

   theWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
   }));
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
   // On macOS it is common for applications and their menu bar
   // to stay active until the user quits explicitly with Cmd + Q
   if (process.platform !== 'darwin') {
      app.quit();
   }
});



// =============================================================================
//       Set up the application listeners, and configuration save/load
// =============================================================================

/*
 * Listener to forward all notification posts to all other renderer processes
 * notif: (string) the name of the notification that is being sent
 * value: the data to send to the object
 */
ipcMain.on('post', (event, notif, value) => {
   theWindow.webContents.send(notif, value);
});

/*
 * Retrieve a global variable.
 */
ipcMain.on('getGlobal', (event, globName) => {
   event.returnValue = global[globName];
});

/*
 * Set the global value to the given value. Also notifies that variable
 * has changed so that all objects
 */
ipcMain.on('updateGlobal', (event, globName, value) => {
   global[globName] = value;
   theWindow.webContents.send('refreshGlobal', globName, value);
});



/*
 * Request user with information about configuration save location; if
 * successful, notify all modules to save the configuration to file
 */
function saveConfig() {

   var path = dialog.showSaveDialog(theWindow, {
      title: "Save Configuration",
      defaultPath: "./Untitled.mcconf",
      filters: [
         {name: 'Mission Control Saved Configuration', extensions: ['mcconf']},
         {name: 'All Files', extensions: ['*']}
      ]
   });
   if(path == undefined) return; //user canceled operation

   var data = {};
   var fileInfo = { fname: path, dataToWrite: data };

   /*
      Because of the async nature of the configuration save, there is no
      way to know when all the modules responding to the notification are
      finished processing the data. Thus, each responding module must put the
      data in the shared object, and write it to file.
   */
   theWindow.webContents.send("saveConfig", fileInfo);
}

/*
 * Request user with information about configuration save location; if
 * successful, load information and notify all modules to load configuration
 * from the object read from file.
 */
function loadConfig() {

   var paths = dialog.showOpenDialog(theWindow, {
      title: "Open Configuration",
      filters: [
         {name: 'Mission Control Saved Configuration', extensions: ['mcconf']},
         {name: 'All Files', extensions: ['*']}
      ],
      properties: ["openFile"]
   });
   if(paths == undefined) return; //user canceled operation

   //read entire file and send to listeners
   fs.readFile(paths[0], "utf8", (err, dataString) => {
      if (err) throw err;
      var data = JSON.parse(dataString);
      theWindow.webContents.send("loadConfig", data);
   });

}



// =============================================================================
//       Set up xbee bindings & begin listening for incoming messages
// =============================================================================

// default message read interval of 100ms
const messageReadInterval = 100;
var pois = {};
var waitingVehicleQueue = [];


/*
 * Handles creating the quadcopter destinations (MSN) messages and
 * sends the start command (START) once completed
 */
ipcMain.on('missionStart', (event, data) => {

   //Clear leftover POIs (only the target should be left)
   for(var key in pois) {
      theWindow.webContents.send("removeMarker", pois[key]);
      delete pois[key];
   }

   //TODO: check correctness
   //TODO: create algorithm to diving search area based on number of vehicles in quick search

   const R = 6371008.8; //mean radius of earth in meters
   const bottomLat = Math.min(data[0].lat, data[1].lat);
   const bottomlng = Math.min(data[0].lng, data[1].lng);
   const topLat = Math.max(data[0].lat, data[1].lat);
   const topLng = Math.max(data[0].lng, data[1].lng);

   const bLatR = bottomLat * (Math.PI / 180);
   const bLngR = bottomlng * (Math.PI / 180);
   const tLatR = topLat * (Math.PI / 180);
   const tLngR = topLng * (Math.PI / 180);

   var angle = Math.acos( Math.sin(bLatR) * Math.sin(tLatR) + Math.cos(bLatR) * Math.cos(tLatR) * Math.cos(tLngR - bLngR) );


   for(var key in global.vehicles) {

      if(global.vehicles[key].role == 0) { //quick search device

         // TODO: Use previous code to implement area partitioning for searches between the devices.

         /*
          May have to being by detecting all devices that are quicksearch,
          then using alg to partition, then send messages to all of them
          */

         var message = "NEWMSG,MSN," +
            "Q" + global.vehicles[key].markerID.substring(5,) + "," +
            "P" + bottomLat.toFixed(10) + " " + bottomlng.toFixed(10) + " 0," +
            "H" + ( Math.acos(((tLatR - bLatR) * R) / (angle * R)) * (180 / Math.PI) ).toFixed(10) + "," +
            "F" + "0" + "," +
            "D" + (angle * R).toFixed(10);

         // send destinations to the connected quads
         xbeeSend({
            message: message,
            address: global.vehicles[key].mac
         });
         xbeeSend({
            message: "NEWMSG,START",
            address: global.vehicles[key].mac
         });

      } else if(global.vehicles[key].role == 1) { //Detailed search device

         // Insert Quad to queue: ready to act when first POI is detected
         waitingVehicleQueue.push(global.vehicle[key]);

      }

   }
});

/*
 * Stops the mission already in progress (STOP)
 */
ipcMain.on('missionStop', (event) => {
   for(var key in global.vehicles) {
      xbeeSend({
         message: "NEWMSG,STOP",
         address: global.vehicles[key].mac
      });
   }

   //clear previous mission data
   pois = {};
   waitingVehicleQueue = [];
});


/*
* Attempts to connect with a vehicle by setting its ROLE to the specified value
*/
ipcMain.on('connectWithNewVehicle', (event, vehicle) => {

  xbeeSend({
     message: "NEWMSG,ROLE,Q"+ vehicle.markerID.substring(5,) +",R"+vehicle.role,
     address: vehicle.mac
  });

});



function xbeeConnect() {
   //TODO: detect location of xbee before connection COM port/tty0/etc...
   //uncomment for macOS
   //var res = xbee.connect("/dev/tty.usbserial-DJ00I0E5");

   //uncomment for linux
   var res = xbee.connect("/dev/ttyUSB0");

   //connection failed
   if(res == -1) {
      dialog.showErrorBox("Connection Error", "Unable to connect to xbee radio. Please check connection, and restart program.");
   }

   //begin listening
   xbeeListener();
}

/*
 * Use the data object to send a message.
 * data must contain a 'message' field and a 64-bit 'address' field.
 * It can optionally contain a 16-bit destination address 'fieldAddress'.
 */
function xbeeSend(data) {
   if(data.message == undefined || data.address == undefined) {
      throw "Message or address field is not defined";
   }

   //ensure the 0x hex prefix is present
   if(data.address.substring(0,2) !== "0x") {
      data.address = "0x" + data.address;
   }

   theWindow.webContents.send("logMessage", { type: "SUCCESS", content: data.address + ": " + data.message });

   if(data.fieldAddress != undefined) {
      xbee.sendData(data.message, data.address, data.fieldAddress);
   } else {
      xbee.sendData(data.message, data.address);
   }
}

/*
 * Listener that will check and process incoming messages.
 * Listener will call itself endlessly every second.
 *
 * TODO: modify xbee addon & this function to support interrupt type check rather than polling
 */
function xbeeListener() {
   var startTime = Date.now();

   var messageResponses = xbee.getData();
   for(var i = 0; i < messageResponses.length; i++) {
      //log each COMM message
      theWindow.webContents.send("logMessage", { type: "COMM", content: messageResponses[i] });
      //process each message
      try {
         processMessage(messageResponses[i]);
      } catch(err) {
         theWindow.webContents.send("logMessage", { type: "ERROR", content:  err.message + " ORIGINAL MESSAGE: " + messageResponses[i]});
      }
   }

   setTimeout(xbeeListener, messageReadInterval - (Date.now() - startTime));
}

function processMessage(message) {
   var messageArr = message.split(",");
   if(messageArr[1] === "UPDT") {
      var updatedPos = {
         markerID: "Quad " + messageArr[2].substring(1,),
         lat: parseFloat(messageArr[3].substring(1,).split(" ")[0]),
         lng: parseFloat(messageArr[3].substring(1,).split(" ")[1]),
         status: { type: messageArr[4].substring(1,).toUpperCase(), message: messageArr[4].substring(1,) },
         role: parseInt(messageArr[5].substring(1,))
      };
      theWindow.webContents.send("onVehicleUpdate", updatedPos);

   } else if(messageArr[1] === "TGT") {
      var poiObj = {
         lat: parseFloat(messageArr[6].substring(1,).split(" ")[0]),
         lng: parseFloat(messageArr[6].substring(1,).split(" ")[1]),
         id: messageArr[7].substring(1,),
         active: "INACTIVE"
      };
      pois[messageArr[7].substring(1,)] = poiObj; //push poi to queue

      //check if there are vehicles in the queue waiting for a POI
      if(waitingVehicleQueue.length > 0) { //send POI to first vehicle
         poiObj.active = "RUNNING";
         xbeeSend({
            message: "NEWMSG,POI,Q" + vehicle.markerID.substring(5,) + ",P" + poiObj.lat.toFixed(10) + " " + poiObj.lng.toFixed(10),
            address: waitingVehicleQueue.pop().mac
         });
      }

      poiObj.markerID = poiObj.id;
      poiObj.iconType = 'poi_unkwn';

      theWindow.webContents.send("moveMarker", poiObj);

   } else if(messageArr[1] === "FP") { //handle a false positive

      //get the vehicle that sent the message
      var vehicle = global.vehicles["Quad " + messageArr[2].substring(1,)];
      //set the marker as false positive
      var poiObj = pois[messageArr[3].substring(1,)];
      poiObj.active = "FALSE POSITIVE";
      poiObj.iconType = 'poi_fp';
      theWindow.webContents.send("moveMarker", poiObj);

      //pick the next POI to scan
      var nextPOI = pickPOI(vehicle);

      if(nextPOI != undefined) { // next POI is defined, tell this quad its next destination
         nextPOI.active = "RUNNING";
         xbeeSend({
            message: "NEWMSG,POI,Q" + messageArr[2].substring(1,) + ",P" + nextPOI.lat.toFixed(10) + " " + nextPOI.lng.toFixed(10),
            address: vehicle.mac
         });
      } else { //no POIs waiting, push vehicle to queue
         waitingVehicleQueue.push(vehicle);
      }

   } else if(messageArr[1] === "ROLE") {
      //update GUI with role switch data
      var updatedPos = {
         markerID: "Quad " + messageArr[2].substring(1,),
         lat: parseFloat(messageArr[3].substring(1,).split(" ")[0]),
         lng: parseFloat(messageArr[3].substring(1,).split(" ")[1]),
         status: { type: messageArr[4].substring(1,).toUpperCase(), message: messageArr[4].substring(1,) },
         role: parseInt(messageArr[5].substring(1,))
      };
      theWindow.webContents.send("onVehicleUpdate", updatedPos);
      //find the next POI to scan for the current quad

      var vehicle = global.vehicles["Quad " + messageArr[2].substring(1,)];
      var nextPOI = pickPOI(vehicle);

      if(nextPOI != undefined) { // next POI is defined, tell this quad its next destination
         nextPOI.active = "RUNNING";
         xbeeSend({
            message: "NEWMSG,POI,Q" + messageArr[2].substring(1,) + ",P" + nextPOI.lat.toFixed(10) + " " + nextPOI.lng.toFixed(10) + ",I" + nextPOI.id,
            address: vehicle.mac
         });
      } else { //no POIs waiting, push vehicle to queue
         waitingVehicleQueue.push(vehicle);
      }
   } else if(messageArr[1] == "VLD") {
      //target found, end mission
      for(var key in global.vehicles) {
         xbeeSend({
            message: "NEWMSG,STOP",
            address: global.vehicles[key].mac
         });
      }

      var poiObj = pois[messageArr[3].substring(1,)];
      poiObj.iconType = 'poi_vld';
      poiObj.active = "TARGET";
      theWindow.webContents.send("moveMarker", poiObj);

      theWindow.webContents.send("logMessage", { type: "SUCCESS", content: "TARGET FOUND: "});

      //clear previous mission data
      for(var key in pois) {
         if(pois[key].active != "TARGET") {
            theWindow.webContents.send("removeMarker", pois[key]);
            delete pois[key];
         }
      }
      console.log(pois);
      waitingVehicleQueue = [];
   }
}


/*
 * Picks the next POI to process
 * finds the closest POI that isnt a false positive to the given vehicle
 */
function pickPOI(vehicle) {

   const R = 6371008.8; //mean radius of earth in meters
   var vLat = vehicle.lat * (Math.PI / 180);
   var vLng = vehicle.lng * (Math.PI / 180);
   var closestPOI = undefined;
   var poi = undefined;

   for(var key in pois) {
      var poiLat = pois[key].lat * (Math.PI / 180);
      var poiLng = pois[key].lng * (Math.PI / 180);

      var dist = Math.acos( Math.sin(vLat) * Math.sin(poiLat) + Math.cos(vLat) * Math.cos(poiLat) * Math.cos(Math.abs(poiLng - vLng)) ) * R;
      if((closestPOI == undefined || dist < closestPOI) && pois[key].active ===  "INACTIVE") {
         closestPOI = dist;
         poi = pois[key];
      }

   }

   return poi;
}





// =============================================================================

// Method to generate and set the menu bar of the application
function setMenuBar() {

   var locations = [
      {
         label: "Edit Locations...",
         click() {
            var fname = path.join(__dirname, '..', 'resources', 'locations.conf');
            if(!fs.existsSync(fname)) {
               fs.writeFileSync(fname, '{\n   "defaultLocation": null,\n   "locations":\n   [\n   ]\n}');
            }
            shell.openItem(fname);

         }
      },
      {
         label: "My Location",
         click() {
            theWindow.webContents.send('moveToMyLocation');
         }
      },
      {type: 'separator'},
      {
         label: "No locations defined",
         enabled: false
      }
   ];
   //read entire locations.conf file
   try {
      var dataString = fs.readFileSync(path.join(__dirname, '..', 'resources', 'locations.conf'), {encoding: "utf8", flags: "r"});
      var data = JSON.parse(dataString);
      var offset = locations.length-1;

      for(var i = 0; i < data.locations.length; i++) {
         locations.splice(i+offset, 1,
            {
               label: data.locations[i].label,
               data: data.locations[i],
               sublabel: (data.locations[i].label == data.defaultLocation) ? "Default Starting Location" : undefined,
               click(menuItem) {
                  theWindow.webContents.send('mapSetLocation', menuItem.data);
               }
            }
         );

         //set the starting location, if the default starting location is legal
         if(global.defaultLocation == null && data.defaultLocation == data.locations[i].label) {
            global.defaultLocation = data.locations[i];
         }

      }
   } catch(err) {
      console.log("An error occurred opening locations.conf... Skipping...");
      console.log(err);
   }


   menuBar = [
      {
         label: 'File',
         submenu:
         [
            {
               label: 'Save Configuration',
               click () {
                  saveConfig();
               }
            },
            {
               label: 'Open Configuration',
               click () {
                  loadConfig();
               }
            }
         ]
      },
      {
         label: 'Edit',
         submenu:
         [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'selectall'}
         ]
      },
      {
         label: 'View',
         submenu:
         [
            {role: 'reload'},
            {role: 'toggledevtools'},
            {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {role: 'togglefullscreen'}
         ]
      },
      {
         role: 'window',
         submenu:
         [
            {role: 'minimize'},
            {role: 'close'}
         ]
      },
      {
         label: 'Mission',
         submenu:
         [
            {
               label: 'Edit Mission',
               click () {
                  theWindow.webContents.send('modifyCurrentMission');
               }
            },
            {
               label: 'Start Mission',
               click () {
                  theWindow.webContents.send('startCurrentMission');
               }
            },
            {
               label: 'Stop Mission',
               click() {
                  theWindow.webContents.send('stopCurrentMission');
               }
            }
         ]
      },
      {
         label: 'Locations',
         submenu: locations
      }
   ]

   if(process.platform === 'darwin') {
      menuBar.unshift({
         label: app.getName(),
         submenu:
         [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services', submenu: []},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'},
         ]
      });
   } else {
      // add quit to the file menu on mac/windows
      menuBar[0].submenu.push({type: 'separator'}, {role: 'quit'});
   }

   const menu = Menu.buildFromTemplate(menuBar);
   Menu.setApplicationMenu(menu);
}
