import { app, BrowserWindow } from 'electron';
import path from 'path';
import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow;

function createMainWindow() {
  const w = new BrowserWindow({
    title: 'Ground Control Station',
  });

  if (isDevelopment) {
    w.webContents.openDevTools();
    w.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    w.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    }));
  }

  w.maximize();

  w.on('closed', () => {
    mainWindow = null;
  });

  w.webContents.on('devtools-opened', () => {
    w.focus();
    setImmediate(() => {
      w.focus();
    });
  });

  return w;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();
});
