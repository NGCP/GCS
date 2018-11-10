import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import fs from 'fs';
import moment from 'moment';
import outdent from 'outdent';
import path from 'path';
import { format as formatUrl } from 'url';

import Orchestrator from './control/Orchestrator';
import Mission from './control/Mission';
import ISRMission from './control/ISRMission';


require('dotenv').config();
process.env.GOOGLE_API_KEY = 'AIzaSyB1gepR_EONqgEcxuADmEZjizTuOU_cfnU';

const blankLocationJSON = outdent`
  ${outdent}
  {
    "startLocation": "",
    "locations": {
      "Example Location": {
        "latitude": 0,
        "longitude": 0,
        "zoom": 18
      }
    }
  }`;
const configFilter = { name: 'GCS Configuration', extensions: ['json'] };
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
    {
      label: 'Quit',
      accelerator: 'CommandOrControl+Q',
      click() {
        window.destroy();
      },
    },
  ],
};
const isDevelopment = process.env.NODE_ENV !== 'production';
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
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'toggledevtools' },
    ],
  },
  {
    label: 'Locations',
    submenu: [
      {
        label: 'Edit Locations',
        accelerator: 'CommandOrControl+E',
        click() {
          const locationFilePath = ensureLocationFileExists();
          shell.openItem(locationFilePath);
        },
      },
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

let window;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    window.destroy();
    app.quit();
  }
});

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

ipcMain.on('post', (event, notification, data) => window.webContents.send(notification, data));

function createMainWindow() {
  window = new BrowserWindow({
    title: 'NGCP Ground Control Station',
    icon: path.resolve(__dirname, '..', '..', 'resources', 'images', 'icon.png'),
    show: false,
    width: 1024,
    minWidth: 1024,
    height: 576,
    minHeight: 576,
  });

  if (isDevelopment) {
    // window.webContents.openDevTools();
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(formatUrl({
      pathname: path.resolve(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    }));
  }

  // window.maximize();

  window.on('ready-to-show', () => {
    window.show();
    window.focus();
  });

  // this is Command + W on macOS
  window.on('close', event => {
    event.preventDefault();
    window.hide();
  });

  // this is Command + Q on macOS
  window.on('closed', () => {
    window = null;
    app.quit();
  });


  const isrmission = new ISRMission(null, null, null);
  console.log(isrmission);

  return window;
}

function createMenu() {
  setLocationMenu();

  if (process.platform === 'darwin') {
    menu.unshift(darwinMenu);
  } else {
    menu.push({ role: 'quit' });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function setLocationMenu() {
  ensureLocationFileExists();
  const locationMenu = menu.find(m => m.label === 'Locations').submenu;
  const { locations } = require('../../resources/locations.json');

  if (!locations || locations.length === 0) {
    locationMenu.push({
      label: 'No locations defined',
      enabled: false,
    });
    return;
  }

  for (const label of Object.keys(locations)) {
    const { latitude, longitude, zoom } = locations[label];
    locationMenu.push({
      label: label,
      data: {
        latitude: latitude,
        longitude: longitude,
        zoom: zoom,
      },
      click(menuItem) { window.webContents.send('updateMapLocation', menuItem.data); },
    });
  }
}

function saveConfig() {
  const fileName = moment().format('[GCS Configuration] YYYY-MM-DD [at] h.mm.ss A');
  const filePath = dialog.showSaveDialog(window, {
    title: 'Save Configuration',
    filters: [configFilter],
    defaultPath: `./${fileName}.${configFilter.extensions[0]}`,
  });

  if (!filePath) return;

  const data = {};
  window.webContents.send('saveConfig', {
    filePath: filePath,
    data: data,
  });
}

function loadConfig() {
  const filePaths = dialog.showOpenDialog(window, {
    title: 'Open Configuration',
    filters: [configFilter],
    properties: ['openFile', 'createDirectory'],
  });

  if (!filePaths || filePaths.length === 0) return;

  const data = JSON.parse(fs.readFileSync(filePaths[0]), 'utf8');

  if (!data) return;

  window.webContents.send('loadConfig', data);
}

function ensureLocationFileExists() {
  const locationFilePath = path.resolve(__dirname, '..', '..', 'resources', 'locations.json');

  if (!fs.existsSync(locationFilePath)) {
    fs.writeFileSync(locationFilePath, blankLocationJSON);
  }

  return locationFilePath;
}
