import { // eslint-disable-line import/no-extraneous-dependencies
  app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell, Tray,
} from 'electron';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import url from 'url';

import { images, locations } from '../../resources/index';

process.env.GOOGLE_API_KEY = 'AIzaSyB1gepR_EONqgEcxuADmEZjizTuOU_cfnU';

const FILTER = { name: 'GCS Configuration', extensions: ['json'] };
const WIDTH = 1024;
const HEIGHT = 576;

const icon = nativeImage.createFromDataURL(images.icon);
const isDevelopment = process.env.NODE_ENV !== 'production';

let quitting = false;
let window;
let missionWindow;
let tray;

const quitRole = {
  label: 'Quit',
  accelerator: 'CommandOrControl+Q',
  click() {
    quitting = true;
    app.quit();
  },
};

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
    const { lat, lng, zoom } = locations[label];
    locationMenu.push({
      label,
      data: { lat, lng, zoom },
      click(menuItem) { window.webContents.send('updateMapLocation', menuItem.data); },
    });
  });
}

function createMainWindow() {
  window = new BrowserWindow({
    title: 'NGCP Ground Control Station',
    icon,
    show: false,
    width: WIDTH,
    minWidth: WIDTH,
    height: HEIGHT,
    minHeight: HEIGHT,
  });

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(url.format({
      pathname: path.resolve(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    }));
  }

  window.on('ready-to-show', () => {
    window.show();
  });

  window.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      window.hide();
      if (missionWindow) {
        window.webContents.send('setSelectedMission', -1);
        missionWindow.hide();
      }
    } else {
      window = null;
    }
  });
}

function createMissionWindow() {
  missionWindow = new BrowserWindow({
    title: 'NGCP Mission User Interface',
    show: false,
    width: WIDTH,
    minWidth: WIDTH,
    height: HEIGHT,
    minHeight: HEIGHT,
  });

  missionWindow.loadURL(url.format({
    pathname: path.resolve(__dirname, 'ui.html'),
    protocol: 'file',
    slashes: true,
  }));

  missionWindow.show();

  /*
  missionWindow.on('ready-to-show', () => {
    missionWindow.show();
  });
  */

  missionWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      // following line allows MissionContainer to update to closed mission window
      window.webContents.send('setSelectedMission', -1);
      missionWindow.hide();
    } else {
      missionWindow = null;
    }
  });
}

function showWindow() {
  if (!window) {
    createMainWindow();
  } else {
    window.show();
  }
}

function showMissionWindow() {
  if (!missionWindow) {
    createMissionWindow();
  } else {
    missionWindow.show();
  }
}

const trayMenu = [
  {
    label: 'NGCP Ground Control Station',
    click() { showWindow(); },
  },
  { type: 'separator' },
  quitRole,
];

function createMenu() {
  setLocationMenu();

  if (process.platform === 'darwin') {
    menu.unshift(darwinMenu);
  } else {
    tray = new Tray(icon);
    tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
    tray.on('click', () => { showWindow(); });

    menu.push(quitRole);
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

app.on('activate', showWindow);

app.on('ready', () => {
  showWindow();
  createMenu();
});

app.on('before-quit', () => {
  quitting = true;
});

ipcMain.on('post', (event, notification, data) => {
  if (notification === 'showMissionWindow') {
    showMissionWindow();
  }

  window.webContents.send(notification, data);
  if (missionWindow) {
    missionWindow.webContents.send(notification, data);
  }
});
