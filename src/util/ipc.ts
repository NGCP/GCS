/*
 * Write all ipcRenderer post functions here to ensure that all developers know the type
 * of what are included into these messages. When writing the function, write where
 * these notifications are received. Write the functions in ALPHABETICAL ORDER (of notification).
 * A simple note on which file (assume going from src directory) will help developers out a lot.
 * Do not forget to include the function in the default export!
 *
 * When writing the receiving side of ipcRenderer, the function called by the callback
 * function must be the EXACT SAME NAME as the notification message and have parameters with
 * SAME EXACT NAMES as the parameters of the ipc function below.
 *
 * Look at all code for examples. Do not forget that the first parameter of the callback function
 * of the receiving side of ipcRenderer will have an Event object passed to it. Name this object "_"
 * unless you plan on using the object, then name it "event".
 */

import { BrowserWindow, ipcRenderer } from 'electron';

import { Location } from '../static/index';

import { BoundingBoxBounds, LogMessage } from '../types/componentStyle';
import * as FileOptions from '../types/fileOption';
import * as Message from '../types/message';
import { Information } from '../types/missionInformation';
import * as Task from '../types/task';
import { VehicleObject } from '../types/vehicle';

/**
 * Post "centerMapToVehicle" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 */
function postCenterMapToVehicle(vehicle: VehicleObject): void {
  ipcRenderer.send('post', 'centerMapToVehicle', vehicle);
}

/**
 * Post "competeMission" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postCompleteMission(
  missionName: string,
  completionParameters: { [key: string]: Task.TaskParameters },
): void {
  ipcRenderer.send('post', 'completeMission', missionName, completionParameters);
}

/**
 * Post "confirmCompleteMission" notification.
 *
 * Files that take this notification:
 */
function postConfirmCompleteMission(): void {
  ipcRenderer.send('post', 'confirmCompleteMission');
}

/**
 * Post "connectToVehicle" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postConnectToVehicle(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
  ipcRenderer.send('post', 'connectToVehicle', jsonMessage, newMessage);
}

/**
 * Post "disconnectFromVehicle" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postDisconnectFromVehicle(vehicleId: number): void {
  ipcRenderer.send('post', 'disconnectFromVehicle', vehicleId);
}

/**
 * Post "finishMissions" notification. This is different from the "completeMission"
 * notification in that this is sent once all missions to run are completed.
 *
 * Files that take this notification:
 */
function postFinishMissions(completionParameters: Task.TaskParameters[]): void {
  ipcRenderer.send('post', 'finishMissions', completionParameters);
}

/**
 * Post "handleAcknowledgementMessage" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postHandleAcknowledgementMessage(
  jsonMessage: Message.JSONMessage,
  newMessage: boolean,
): void {
  ipcRenderer.send('post', 'handleAcknowledgementMessage', jsonMessage, newMessage);
}

/**
 * Post "handleBadMessage" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postHandleBadMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
  ipcRenderer.send('post', 'handleBadMessage', jsonMessage, newMessage);
}

/**
 * Post "handleCompleteMessage" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postHandleCompleteMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
  ipcRenderer.send('post', 'handleCompleteMessage', jsonMessage, newMessage);
}

/**
 * Post "handlePOIMessage" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postHandlePOIMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
  ipcRenderer.send('post', 'handlePOIMessage', jsonMessage, newMessage);
}

/**
 * Post "handleUpdateMessage" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postHandleUpdateMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
  ipcRenderer.send('post', 'handleUpdateMessage', jsonMessage, newMessage);
}

/**
 * Post "hideMissionWindow" notification.
 *
 * Files that take this notification:
 * - main/index
 */
function postHideMissionWindow(): void {
  ipcRenderer.send('post', 'hideMissionWindow');
}

/**
 * Post "loadConfig" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 */
function postLoadConfig(
  loadOptions: FileOptions.FileLoadOptions,
  mainWindow?: BrowserWindow | null,
  missionWindow?: BrowserWindow | null,
): void {
  if (mainWindow !== undefined) {
    if (mainWindow) mainWindow.webContents.send('loadConfig', loadOptions);
    if (missionWindow) missionWindow.webContents.send('loadConfig', loadOptions);
  } else {
    ipcRenderer.send('post', 'loadConfig', loadOptions);
  }
}

/**
 * Post "logMessages" notification. Please never end the messages to log with a period.
 *
 * Files that take this notification:
 * - renderer/mainWindow/log/LogContainer
 */
function postLogMessages(...messages: LogMessage[]): void {
  ipcRenderer.send('post', 'logMessages', ...messages);
}

/**
 * Post "pauseMission" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postPauseMission(): void {
  ipcRenderer.send('post', 'pauseMission');
}

/**
 * Post "receiveMessage" notification.
 *
 * Files that take this notification:
 * - common/MessageHandler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function postReceiveMessage(message: any): void {
  ipcRenderer.send('post', 'receiveMessage', message);
}

/**
 * Post "resumeMission" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postResumeMission(): void {
  ipcRenderer.send('post', 'resumeMission');
}

/**
 * Post "saveConfig" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 */
function postSaveConfig(
  saveOptions: FileOptions.FileSaveOptions,
  mainWindow?: BrowserWindow | null,
  missionWindow?: BrowserWindow | null,
): void {
  if (mainWindow !== undefined) {
    if (mainWindow) mainWindow.webContents.send('saveConfig', saveOptions);
    if (missionWindow) missionWindow.webContents.send('saveConfig', saveOptions);
  } else {
    ipcRenderer.send('post', 'saveConfig', saveOptions);
  }
}

/**
 * Post "sendMessage" notification.
 *
 * Files that take this notification:
 * - common/MessageHandler
 */
function postSendMessage(vehicleId: number, message: Message.Message): void {
  ipcRenderer.send('post', 'sendMessage', vehicleId, message);
}

/**
 * Post "setMapToUserLocation" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 */
function postSetMapToUserLocation(
  mainWindow?: BrowserWindow | null,
  missionWindow?: BrowserWindow | null,
): void {
  if (mainWindow !== undefined) {
    if (mainWindow) mainWindow.webContents.send('setMapToUserLocation');
    if (missionWindow) missionWindow.webContents.send('setMapToUserLocation');
  } else {
    ipcRenderer.send('post', 'setMapToUserLocation');
  }
}

/**
 * Post "showMissionWindow" notification.
 *
 * Files that take this notification:
 * - main/index
 */
function postShowMissionWindow(): void {
  ipcRenderer.send('post', 'showMissionWindow');
}

/**
 * Post "startMissions" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 */
function postStartMissions(
  missions: Information[],
  requireConfirmation: boolean,
): void {
  ipcRenderer.send('post', 'startMissions', missions, requireConfirmation);
}

/**
 * Post "startNextMission" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 * - renderer/missionWindow/MissionWindow
 */
function postStartNextMission(): void {
  ipcRenderer.send('post', 'startNextMission');
}

/**
 * Post "stopMissions" notification.
 *
 * Files that take this notification:
 * - common/Orchestrator
 * - renderer/missionWindow/MissionWindow
 */
function postStopMissions(): void {
  ipcRenderer.send('post', 'stopMissions');
}

/**
 * Post "stopSendingMessage" notification.
 *
 * Files that take this notification:
 * - common/MessageHandler
 */
function postStopSendingMessage(ackMessage: Message.JSONMessage): void {
  ipcRenderer.send('post', 'stopSendingMessage', ackMessage);
}

/**
 * Post "stopSendingMessages" notification.
 *
 * Files that take this notification:
 * - common/MessageHandler
 */
function postStopSendingMessages(): void {
  ipcRenderer.send('post', 'stopSendingMessages');
}

/**
 * Post "toggleTheme" notification.
 *
 * Files that take this notification:
 * - renderer/index
 */
function postToggleTheme(): void {
  ipcRenderer.send('post', 'toggleTheme');
}

/**
 * Post "updateBoundingBoxes" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 */
function postUpdateBoundingBoxes(
  updateMap: boolean,
  ...boundingBoxes: { name: string; color?: string; bounds: BoundingBoxBounds }[]
): void {
  ipcRenderer.send('post', 'updateBoundingBoxes', updateMap, ...boundingBoxes);
}

/**
 * Post "updateMapLocation" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 */
function postUpdateMapLocation(
  location: Location,
  mainWindow?: BrowserWindow | null,
  missionWindow?: BrowserWindow | null,
): void {
  if (mainWindow !== undefined) {
    if (mainWindow) mainWindow.webContents.send('updateMapLocation', location);
    if (missionWindow) missionWindow.webContents.send('updateMapLocation', location);
  } else {
    ipcRenderer.send('post', 'updateMapLocation', location);
  }
}

/**
 * Post "updateVehicles" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 * - renderer/mainWindow/vehicle/VehicleContainer
 */
function postUpdateVehicles(...vehicles: VehicleObject[]): void {
  ipcRenderer.send('post', 'updateVehicles', ...vehicles);
}

/**
 * Post "updateWaypoints" notification.
 *
 * Files that take this notification:
 * - renderer/mainWindow/map/MapContainer
 *
 * @param updateMap Set this to true, except from the marker's drag event.
 */
function postUpdateWaypoint(
  updateMap: boolean,
  ...waypoints: { name: string; location: Location }[]
): void {
  ipcRenderer.send('post', 'updateWaypoints', updateMap, ...waypoints);
}

export default {
  postCenterMapToVehicle,
  postCompleteMission,
  postConfirmCompleteMission,
  postConnectToVehicle,
  postDisconnectFromVehicle,
  postFinishMissions,
  postHandleAcknowledgementMessage,
  postHandleBadMessage,
  postHandleCompleteMessage,
  postHandlePOIMessage,
  postHandleUpdateMessage,
  postHideMissionWindow,
  postLoadConfig,
  postLogMessages,
  postPauseMission,
  postReceiveMessage,
  postResumeMission,
  postSaveConfig,
  postSendMessage,
  postSetMapToUserLocation,
  postShowMissionWindow,
  postStartMissions,
  postStartNextMission,
  postStopMissions,
  postStopSendingMessage,
  postStopSendingMessages,
  postToggleTheme,
  postUpdateBoundingBoxes,
  postUpdateMapLocation,
  postUpdateVehicles,
  postUpdateWaypoint,
};
