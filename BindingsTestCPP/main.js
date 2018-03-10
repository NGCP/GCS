const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');

let menuBar;
let theWindow;


// This method to be called to do any setup work required prior to
// actually displaying the BrowserWindow. Called when app receives the
// "ready" signal.
function setup() {

   // now create the window
   if(theWindow == null) {
      createWindow();
   }
}

// This method creates a new window by loading index.html and setting the
// size of the window to its default (1500 by 1000)
function createWindow() {
   theWindow = new BrowserWindow({width:800, height:400});

   theWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
   }));

   theWindow.toggleDevTools();
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
