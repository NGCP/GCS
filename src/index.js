const { app, BrowserWindow } = require('electron');

function createWindow() {
  const w = new BrowserWindow();
  w.maximize();

  w.loadURL('https://www.google.com/');
}

app.on('ready', createWindow);
