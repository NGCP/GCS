const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');

let menuBar;
let theWindow;


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
// size of the window to its default (1500 by 1000)
function createWindow() {
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


// =============================================================================


// Method to generate and set the menu bar of the application
function setMenuBar() {
   menuBar = [
      {
         label: 'File',
         submenu:
         [
            {
               label: 'Save configuration',
               click () { console.log("Save the current config"); }
            },
            {
               label: 'Open configuration',
               click () { console.log("Open configuration from file"); }
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
               label: 'New Mission',
               click () { console.log("New Mission Started"); }
            },
            {
               label: 'Edit Mission',
               click () { console.log("Editing Mission"); }
            },
            {
               label: 'Start Mission',
               click () { console.log("Starting mission"); }
            }
         ]
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
      menuBar[1].submenu.push({role: 'quit'});
   }

   const menu = Menu.buildFromTemplate(menuBar);
   Menu.setApplicationMenu(menu);
}
