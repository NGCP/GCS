import {
  app,
  BrowserWindow,
  dialog,
  Event,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  shell,
  Tray,
} from 'electron';
import fs from 'fs';
import moment from 'moment';

import { imageConfig, locationConfig } from '../static/index';

/**
 * This key is required to enable geolocation in the application.
 * Others cannot use this key outside of geolocation access so no need to hide it.
 */
process.env.GOOGLE_API_KEY = 'AIzaSyB1gepR_EONqgEcxuADmEZjizTuOU_cfnU';

/**
 * Filter constant for all configuration files.
 */
const FILTER = { name: 'GCS Configuration', extensions: ['json'] };

/**
 * Width of the application. Main window will have this width while mission window
 * will have 1/3rd of it.
 */
const WIDTH = 1024;

/**
 * Height of the application. Both main and mission windows will have this height.
 */
const HEIGHT = 576;

/**
 * Returns true if running as development (npm start) but false if running in build
 * (the app that has come from npm build).
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

// TODO: Put icon tray back to macOS but resize it so that its not huge on macOS's menu.
const icon = nativeImage.createFromDataURL(imageConfig.icon as string);

/**
 * Variable to keep track when the app will quit, which is different from hiding the app.
 */
let quitting = false;

/**
 * Reference to the main window of the application.
 */
let mainWindow: BrowserWindow | null;

/**
 * Reference to the mission window of the application.
 */
let missionWindow: BrowserWindow | null;

/**
 * Reference to the tray object of the application.
 */
let tray: Tray;

/**
 * Role added to menus to allow the user to quit the app. Shortcut is Ctrl/Cmd + Q.
 */
const quitRole: MenuItemConstructorOptions = {
  label: 'Quit',
  accelerator: 'CommandOrControl+Q',
  click: (): void => {
    app.quit();
  },
};

/**
 * Menu prepended to menu if application is running on a Darwin-based OS.
 */
const darwinMenu: MenuItemConstructorOptions = {
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
function saveConfig(): void {
  if (!mainWindow) return;

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

  if (missionWindow) {
    missionWindow.webContents.send('saveConfig', {
      filePath,
      data,
    });
  }
}

/**
 * Runs when the user wants to load a configuration of the GCS.
 * The configuration currently includes the map location loaded.
 */
function loadConfig(): void {
  if (!mainWindow) return;

  // Loads a window that allows the user to choose the filePath of the file to be loaded.
  const filePaths = dialog.showOpenDialog(mainWindow, {
    title: 'Open Configuration',
    filters: [FILTER],
    properties: ['openFile', 'createDirectory'],
  });

  // Returns if the user chooses to close the window instead of choosing a file path.
  if (!filePaths || filePaths.length === 0) return;

  // TODO: Add type for data.
  const data = JSON.parse(fs.readFileSync(filePaths[0]).toString());

  if (!data) return;

  // Loads parsed data into main and mission windows.
  mainWindow.webContents.send('loadConfig', data);
  if (missionWindow) {
    missionWindow.webContents.send('loadConfig', data);
  }
}

/**
 * Reference to the menu displayed on main window.
 */
const menu: MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File...',
        accelerator: 'CommandOrControl+O',
        click: (): void => { loadConfig(); },
      },
      { type: 'separator' },
      { role: 'close' },
      { type: 'separator' },
      {
        label: 'Save As...',
        accelerator: 'CommandOrControl+S',
        click: (): void => { saveConfig(); },
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
        click: (): void => {
          if (mainWindow) {
            mainWindow.webContents.send('setMapToUserLocation');
          }
        },
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
        click: (): void => { shell.openExternal('https://github.com/NGCP/missioncontrol'); },
      },
    ],
  },
];

/**
 * Adds a list of locations on the menu to allow user to pan to specific location in the map.
 * The list of locations comes from ../../resources/locations.json.
 */
function setLocationMenu(): void {
  const location = menu.find((m): boolean => m.label === 'Locations');
  if (!location) return;

  const { submenu } = location;
  if (!submenu) return;

  // Cast the submenu variable to locationMenu as a MenuItemContsturctorOptions array.
  const locationMenu: MenuItemConstructorOptions[] = submenu as MenuItemConstructorOptions[];

  if (!locationConfig.locations || Object.keys(locationConfig.locations).length === 0) {
    locationMenu.push({
      label: 'No locations defined',
      enabled: false,
    });
    return;
  }

  Object.keys(locationConfig.locations).forEach((label): void => {
    locationMenu.push({
      label,
      click: (menuItem): void => {
        if (mainWindow) {
          mainWindow.webContents.send('updateMapLocation', locationConfig.locations[menuItem.label]);
        }
      },
    });
  });
}

/**
 * Hides the mission window.
 */
function hideMissionWindow(): void {
  if (mainWindow) {
    mainWindow.webContents.send('setSelectedMission', -1);
  }
  if (missionWindow) {
    missionWindow.hide();
  }
}

/**
 * Creates the main window. This window's hash is #main.
 */
function createMainWindow(): void {
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

  mainWindow.on('ready-to-show', (): void => {
    if (mainWindow) mainWindow.show();
  });

  mainWindow.on('close', (event): void => {
    if (!quitting) {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
      if (missionWindow) {
        hideMissionWindow();
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
function createMissionWindow(): void {
  missionWindow = new BrowserWindow({
    title: 'NGCP Mission User Interface',
    icon,
    show: false,
    width: Math.floor(WIDTH / 3),
    minWidth: Math.floor(WIDTH / 3),
    height: HEIGHT,
    autoHideMenuBar: true,
    minHeight: HEIGHT,
  });

  if (isDevelopment) {
    missionWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#mission`);
  } else {
    missionWindow.loadURL(`file:///${__dirname}/index.html#mission`);

    /*
     * Generally we should not have a menu on the mission window, but the menu helps us when
     * developing the mission window (mainly gives us access to developer console, which then
     * allows us to see which elements are loaded, as well as the browser's console log).
     */
    missionWindow.setMenu(null);
  }


  missionWindow.on('close', (event): void => {
    if (!quitting) {
      event.preventDefault();
      // This allows the mission container to update to closed mission window.
      hideMissionWindow();
    } else {
      missionWindow = null;
    }
  });
}

/**
 * Shows the main window.
 */
function showMainWindow(): void {
  if (!mainWindow) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
}

/**
 * Shows the mission window.
 */
function showMissionWindow(): void {
  if (!missionWindow) {
    createMissionWindow();
  } else {
    missionWindow.show();
  }
}

/**
 * Small menu displayed on the bottom-right corner of windows, or upper-right corner of macOS.
 */
const trayMenu: MenuItemConstructorOptions[] = [
  {
    label: 'NGCP Ground Control Station',
    click: (): void => { showMainWindow(); },
  },
  { type: 'separator' },
  quitRole,
];

/**
 * Creates the menu object by adding locations and other platform specific menu to it.
 */
function createMenu(): void {
  setLocationMenu();

  if (process.platform === 'darwin') {
    menu.unshift(darwinMenu);
  } else {
    menu.push(quitRole);
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

/**
 * Creates the tray object.
 */
function createTray(): void {
  tray = new Tray(icon);

  tray.setContextMenu(Menu.buildFromTemplate(trayMenu));

  tray.on('click', (): void => { showMainWindow(); });
}

app.on('activate', showMainWindow);

app.on('ready', (): void => {
  /*
   * Prevents the app from starting if MapBox token is not set up.
   * This is necessary to run the map container.
   */
  if (!process.env.MAPBOX_TOKEN) {
    throw new Error('Set the MapBox token in .env before launching the application');
  }

  createMainWindow();
  createMenu();

  createMissionWindow();
  createTray();
});

app.on('before-quit', (): void => {
  quitting = true;
});

ipcMain.on('post', (_: Event, notification: string, ...data: any[]): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (notification === 'showMissionWindow') {
    showMissionWindow();
  } else if (notification === 'hideMissionWindow') {
    hideMissionWindow();
  }

  /*
   * We must forward ipc notifications to both windows or else
   * some notifications will not be picked up. Of course we can filter out which
   * notifications go for which window, but its simpler to have it forwarded to both.
   */
  if (mainWindow) {
    mainWindow.webContents.send(notification, ...data);
  }
  if (missionWindow) {
    missionWindow.webContents.send(notification, ...data);
  }
});
