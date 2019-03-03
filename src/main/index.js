import {
  app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell, Tray,
} from 'electron';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { format as formatUrl } from 'url';

import { images, locations } from '../../resources/index';

let quitting = false;
let window;

const FILTER = { name: 'GCS Configuration', extensions: ['json'] };
const quitRole = {
  label: 'Quit',
  accelerator: 'CommandOrControl+Q',
  click() {
    quitting = true;
    app.quit();
  },
};

process.env.GOOGLE_API_KEY = 'AIzaSyB1gepR_EONqgEcxuADmEZjizTuOU_cfnU';

const darwinMenu = {
  label: 'NGCP Ground Control System',
  submenu: [
    { role: 'about' },
    { type: 'separator' },
    {
      role: 'services',
      submenu: [],
    },
    { type: 'separator' },
    { role: 'hide' },
    { role: 'hideothers' },
    { role: 'unhide' },
    { type: 'separator' },
    quitRole,
  ],
};
const icon = nativeImage.createFromDataURL(images.icon);
const isDevelopment = process.env.NODE_ENV !== 'production';

function saveConfig() {
  const fileName = moment().format('[GCS Configuration] YYYY-MM-DD [at] h.mm.ss A');
  const filePath = dialog.showSaveDialog(window, {
    title: 'Save Configuration',
    filters: [FILTER],
    defaultPath: `./${fileName}.${FILTER.extensions[0]}`,
  });

  if (!filePath) return;

  const data = {};
  window.webContents.send('saveConfig', {
    filePath,
    data,
  });
}

function loadConfig() {
  const filePaths = dialog.showOpenDialog(window, {
    title: 'Open Configuration',
    filters: [FILTER],
    properties: ['openFile', 'createDirectory'],
  });

  if (!filePaths || filePaths.length === 0) return;

  const data = JSON.parse(fs.readFileSync(filePaths[0]), 'utf8');

  if (!data) return;

  window.webContents.send('loadConfig', data);
}

const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File...',
        accelerator: 'CommandOrControl+O',
        click() { loadConfig(); },
      },
      { type: 'separator' },
      { role: 'close' },
      { type: 'separator' },
      {
        label: 'Save As...',
        accelerator: 'CommandOrControl+S',
        click() { saveConfig(); },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'selectall' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'toggledevtools' },
    ],
  },
  {
    label: 'Locations',
    submenu: [
      {
        label: 'My Location',
        click() { window.webContents.send('setMapToUserLocation'); },
      },
      { type: 'separator' },
    ],
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Help',
        click() { shell.openExternal('https://github.com/NGCP/missioncontrol'); },
      },
    ],
  },
];
const trayMenu = [
  {
    label: 'NGCP Ground Control Station',
    click() { window.show(); },
  },
  { type: 'separator' },
  quitRole,
];

let tray;

function setLocationMenu() {
  const locationMenu = menu.find(m => m.label === 'Locations').submenu;

  if (!locations || locations.length === 0) {
    locationMenu.push({
      label: 'No locations defined',
      enabled: false,
    });
    return;
  }

  Object.keys(locations).forEach((label) => {
    const { latitude, longitude, zoom } = locations[label];
    locationMenu.push({
      label,
      data: {
        latitude,
        longitude,
        zoom,
      },
      click(menuItem) { window.webContents.send('updateMapLocation', menuItem.data); },
    });
  });
}

function createMainWindow() {
  window = new BrowserWindow({
    title: 'NGCP Ground Control Station',
    icon,
    show: false,
    width: 1024,
    minWidth: 1024,
    height: 576,
    minHeight: 576,
  });

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(formatUrl({
      pathname: path.resolve(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    }));
  }

  window.on('ready-to-show', () => {
    window.show();
    window.focus();
  });

  window.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      window.hide();
    }
  });

  return window;
}

function createMenu() {
  setLocationMenu();

  if (process.platform === 'darwin') {
    menu.unshift(darwinMenu);
  } else {
    menu.push(quitRole);
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  tray = new Tray(icon);
  tray.setContextMenu(Menu.buildFromTemplate(trayMenu));

  tray.on('click', () => window.show());
}


app.on('activate', () => {
  if (window === null) {
    createMainWindow();
  } else {
    window.show();
  }
});

app.on('ready', () => {
  createMainWindow();
  createMenu();
});

app.on('before-quit', () => {
  quitting = true;
});

ipcMain.on('post', (event, notification, data) => window.webContents.send(notification, data));
