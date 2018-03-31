const {app, ipcMain, BrowserWindow, Menu, dialog, shell} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const xbee = require('./build/Release/xbee');

// =============================================================================
//       Global program-wide variables
// =============================================================================


let vehicles = {};
/*
ipcMain.on('glob_vehicles', (event) => {
   event.
});
*/

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

// default message read interval of 1 second
const messageReadInterval = 1000;
const pingInterval = 1000;



function xbeeConnect() {
   //TODO: detect location of xbee before connection
   console.log(xbee.connect());

   //begin listening
   xbeeListener();
   pingDevices();
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
   //convert address to hex string -- due to v8 limitations where unsigned long long doesnt maintain leading bit
   var addressToHexStr = "0x" + data.address.toString(16);

   if(data.fieldAddress != undefined) {
      xbee.sendData(data.message, addressToHexStr, data.fieldAddress);
   } else {
      xbee.sendData(data.message, addressToHexStr);
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
      console.log(messageResponses[i]);
      //process each message
   }

   setTimeout(xbeeListener, messageReadInterval - (Date.now() - startTime));
}

function pingDevices() {
   var startTime = Date.now();

   console.log("pinging...");
   console.log(global["vehicles"]);
   for(var key in global["vehicles"]) {
      //console.log(key);
   }

   setTimeout(pingDevices, pingInterval - (Date.now() - startTime));
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
