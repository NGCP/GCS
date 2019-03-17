import { // eslint-disable-line import/no-extraneous-dependencies
  app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell, Tray,
} from 'electron';
import fs from 'fs';
import moment from 'moment';

import { images, locations } from '../../resources/index';

// This key is required to enable geolocation in the application.
// Others cannot use this key outside of geolocation access so no need to hide it.
process.env.GOOGLE_API_KEY = 'AIzaSyB1gepR_EONqgEcxuADmEZjizTuOU_cfnU';

const FILTER = { name: 'GCS Configuration', extensions: ['json'] };
const WIDTH = 1024;
const HEIGHT = 576;

const isDevelopment = process.env.NODE_ENV !== 'production';

// todo: put icon tray back to macOS but resize it so that its not huge on macOS's menu
const icon = nativeImage.createFromDataURL(images.icon);

// Variable to keep track when the app will quit, which is different from hiding the app.
let quitting = false;

// References to window objects
let mainWindow;
let missionWindow;

// Tray object
let tray;

// Role added to menus to allow the user to quit the app. Shortcut is Ctrl/Cmd + Q.
const quitRole = {
  label: 'Quit',
  accelerator: 'CommandOrControl+Q',
  click() {
    quitting = true;
    app.quit();
  },
};

// Menu prepended to menu if application is running on a Darwin-based OS.
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

/**
 * Runs when the user wants to save a configuration of the GCS.
 * The configuration currently includes the map location loaded.
 */
function saveConfig() {
  const fileName = moment().format('[GCS Configuration] YYYY-MM-DD [at] h.mm.ss A');

  // Loads a window that allows the user to choose the file path for the file to be saved.
  const filePath = dialog.showSaveDialog(mainWindow, {
    title: 'Save Configuration',
    filters: [FILTER],
    defaultPath: `./${fileName}.${FILTER.extensions[0]}`,
  });

  // Returns if the user chooses to close the window instead of choosing a file path.
  if (!filePath) return;

  // Loads data up with information returned from main and mission windows.
  const data = {};
  mainWindow.webContents.send('saveConfig', {
    filePath,
    data,
  });
  missionWindow.webContents.send('saveConfig', {
    filePath,
    data,
  });
}

/**
 * Runs when the user wants to load a configuration of the GCS.
 * The configuration currently includes the map location loaded.
 */
function loadConfig() {
  // Loads a window that allows the user to choose the filePath of the file to be loaded.
  const filePaths = dialog.showOpenDialog(mainWindow, {
    title: 'Open Configuration',
    filters: [FILTER],
    properties: ['openFile', 'createDirectory'],
  });

  // Returns if the user chooses to close the window instead of choosing a file path.
  if (!filePaths || filePaths.length === 0) return;

  const data = JSON.parse(fs.readFileSync(filePaths[0]), 'utf8');

  if (!data) return;

  // Loads parsed data into main and mission windows.
  mainWindow.webContents.send('loadConfig', data);
  missionWindow.webContents.send('loadConfig', data);
}

// Menu displayed on main window.
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
        click() { mainWindow.webContents.send('setMapToUserLocation'); },
      },
      { type: 'separator' },
    ],
  },
  {
    role: 'mainWindow',
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

/**
 * Adds a list of locations on the menu to allow user to pan to specific location in the map.
 * The list of locations comes from ../../resources/locations.json.
 */
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
      click(menuItem) { mainWindow.webContents.send('updateMapLocation', menuItem.data); },
    });
  });
}

/**
 * Creates the main window. This window's hash is #main.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'NGCP Ground Control Station',
    icon,
    show: false,
    width: WIDTH,
    minWidth: WIDTH,
    height: HEIGHT,
    minHeight: HEIGHT,
  });

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#main`);
  } else {
    mainWindow.loadURL(`file:///${__dirname}/index.html#main`);
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
      if (missionWindow) {
        mainWindow.webContents.send('setSelectedMission', -1);
        missionWindow.hide();
      }
    } else {
      mainWindow = null;
    }
  });
}

/**
 * Creates the mission window. This window's hash is #mission.
 * Does not show up once app is loaded (will be hidden) and is shown only when it is opened from
 * the main window.
 */
function createMissionWindow() {
  missionWindow = new BrowserWindow({
    title: 'NGCP Mission User Interface',
    icon,
    show: false,
    width: WIDTH,
    minWidth: WIDTH,
    height: HEIGHT,
    minHeight: HEIGHT,
  });

  if (isDevelopment) {
    missionWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#mission`);
  } else {
    missionWindow.loadURL(`file:///${__dirname}/index.html#mission`);
  }

  missionWindow.setMenu(null);

  missionWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      // following line allows MissionContainer to update to closed mission mainWindow
      mainWindow.webContents.send('setSelectedMission', -1);
      missionWindow.hide();
    } else {
      missionWindow = null;
    }
  });
}

function showWindow() {
  if (!mainWindow) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
}

function showMissionWindow() {
  if (!missionWindow) {
    createMissionWindow();
  } else {
    missionWindow.show();
  }
}

/**
 * Small menu displayed on the bottom-right corner of windows, or upper-right corner of macOS.
 */
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
    menu.push(quitRole);
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function createTray() {
  tray = new Tray(icon);

  tray.setContextMenu(Menu.buildFromTemplate(trayMenu));

  tray.on('click', () => { showWindow(); });
}

app.on('activate', showWindow);

app.on('ready', () => {
  createMainWindow();
  createMissionWindow();
  createMenu();
  createTray();
});

app.on('before-quit', () => {
  quitting = true;
});

ipcMain.on('post', (event, notification, data) => {
  if (notification === 'showMissionWindow') {
    showMissionWindow();
  }

  mainWindow.webContents.send(notification, data);
  if (missionWindow) {
    missionWindow.webContents.send(notification, data);
  }
});
