import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
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

import { imageConfig, Location, locationConfig } from '../static/index';

import { FileSaveOptions } from '../types/fileOption';

import ipc from '../util/ipc';

/**
 * This key is required to enable geolocation in the application.
 * Others cannot use this key outside of geolocation access so no need to hide it.
 */
process.env.GOOGLE_API_KEY = 'AIzaSyB1gepR_EONqgEcxuADmEZjizTuOU_cfnU';

/**
 * Filter constant for all configuration files.
 */
const CONFIG_FILTER = { name: 'GCS Configuration', extensions: ['json'] };

/**
 * Filter constant for log files.
 */
const LOG_FILTER = { name: 'GCS Log', extensions: ['log'] };

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
    { role: 'hideOthers' },
    { role: 'unhide' },
    { type: 'separator' },
    quitRole,
  ],
};

/**
 * Runs when the user wants to save a configuration of the GCS.
 * The configuration currently includes the map location loaded.
 */
function postSaveConfig(): void {
  if (!mainWindow) return;

  const fileName = moment().format('[GCS Configuration] YYYY-MM-DD [at] h.mm.ss A');

  // Loads a window that allows the user to choose the file path for the file to be saved.
  dialog.showSaveDialog(mainWindow, {
    title: 'Save Configuration',
    filters: [CONFIG_FILTER],
    defaultPath: `./${fileName}.${CONFIG_FILTER.extensions[0]}`,
  }).then((saveDialogReturnValue) => {
    if (saveDialogReturnValue.canceled) {
      return;
    }

    const saveOptions: FileSaveOptions = {
      filePath: saveDialogReturnValue.filePath as string,
      data: {
        map: {
          lat: 0,
          lng: 0,
          zoom: 18,
        },
      },
    };

    ipc.postSaveConfig(saveOptions, mainWindow, missionWindow);
  });
}

/**
 * Runs when the user wants to load a configuration of the GCS.
 * The configuration currently includes the map location loaded.
 */
function postLoadConfig(): void {
  if (!mainWindow) return;

  // Loads a window that allows the user to choose the filePath of the file to be loaded.
  dialog.showOpenDialog(mainWindow, {
    title: 'Open Configuration',
    filters: [CONFIG_FILTER],
    properties: ['openFile', 'createDirectory'],
  }).then((loadDialogReturnValue) => {
    if (loadDialogReturnValue.canceled) {
      return;
    }

    const data = JSON.parse(fs.readFileSync(loadDialogReturnValue.filePaths[0]).toString());
    if (data) {
      ipc.postLoadConfig(data, mainWindow, missionWindow);
    }
  });
}

/**
 * Save all the messages from the console log to a .log file
 */
function saveLog(messages: string): void {
  if (!mainWindow) return;

  const fileName = moment().format('[GCS Log] YYYY-MM-DD [at] h.mm.ss A');

  // Loads a window that allows the user to choose the file path for the file to be saved.
  dialog.showSaveDialog(mainWindow, {
    title: 'Save Logs',
    filters: [LOG_FILTER],
    defaultPath: `./${fileName}.${LOG_FILTER.extensions[0]}`,
  }).then((saveDialogReturnValue) => {
    if (saveDialogReturnValue.canceled) {
      return;
    }
    fs.writeFileSync((saveDialogReturnValue.filePath as string), messages);
  });
}

/**
 * Hides the mission window.
 */
function hideMissionWindow(): void {
  if (missionWindow) {
    missionWindow.hide();
  }
}

function createWindow(
  title: string,
  width: number,
  height: number,
  options?: BrowserWindowConstructorOptions,
) {
  return new BrowserWindow({
    title,
    icon,
    show: false,
    width,
    minWidth: width,
    height,
    minHeight: height,
    webPreferences: {
      nodeIntegration: true,
    },
    ...options,
  });
}

/**
 * Creates the main window. This window's hash is #main.
 */
function createMainWindow(): void {
  mainWindow = createWindow('NGCP Ground Control Station', WIDTH, HEIGHT);

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
  missionWindow = createWindow(
    'NGCP Mission User Interface',
    Math.floor((WIDTH * 4) / 3),
    Math.floor((HEIGHT * 4) / 3),
    { autoHideMenuBar: true },
  );

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
 * Reference to the menu displayed on main window.
 */
const menu: MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File...',
        accelerator: 'CommandOrControl+O',
        click: (): void => { postLoadConfig(); },
      },
      { type: 'separator' },
      { role: 'close' },
      { type: 'separator' },
      {
        label: 'Save As...',
        accelerator: 'CommandOrControl+S',
        click: (): void => { postSaveConfig(); },
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
      { role: 'pasteAndMatchStyle' },
      { role: 'selectAll' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'toggleDevTools' },
    ],
  },
  {
    label: 'Locations',
    submenu: [
      {
        label: 'My Location',
        click: (): void => {
          if (mainWindow) {
            ipc.postSetMapToUserLocation(mainWindow, missionWindow);
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
      {
        label: 'Mission',
        click: (): void => {
          if (mainWindow) {
            showMissionWindow();
          }
        },
      },
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
 * The list of locations comes from static/location.json.
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
        ipc.postUpdateMapLocation(
          locationConfig.locations[menuItem.label] as Location,
          mainWindow,
          missionWindow,
        );
      },
    });
  });
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
    return;
  }

  if (notification === 'hideMissionWindow') {
    hideMissionWindow();
    return;
  }

  if (notification === 'saveLog') {
    if (data.length > 0 && typeof data[0] === 'string') {
      saveLog(data[0]);
    }
    return;
  }

  /*
   * We must forward notifications to both windows or else some notifications will not
   * be picked up.
   */
  if (mainWindow) {
    mainWindow.webContents.send(notification, ...data);
  }
  if (missionWindow) {
    missionWindow.webContents.send(notification, ...data);
  }
});
