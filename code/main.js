const {app, ipcMain, BrowserWindow, Menu, dialog, shell} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let menuBar;
let theWindow;
global.defaultLocation = null;


// This method to be called to do any setup work required prior to
// actually displaying the BrowserWindow. Called when app receives the
// "ready" signal.
function setup() {
   setMenuBar();

   // now create the window
   if(theWindow == null) {
      createWindow();
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', setup);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create the program window when the 'activate' signal is received
app.on('activate', () => {
   if(theWindow == null) {
      createWindow();
   }
});



/*
 * Listener to forward all notification posts to all other renderer processes
 * notif: (string) the name of the notification that is being sent
 * value: the data to send to the object
 */
ipcMain.on('post', (event, notif, value) => {
   theWindow.webContents.send(notif, value);
});


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

   theWindow.webContents.send("saveConfig", fileInfo);

   /*
   fs.writeFile(path, data, (err) => {
      if(err) {
         dialog.showErrorBox("Error Saving Configuration File!", err.message)
         throw err;
      }

   });
   */
}

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
