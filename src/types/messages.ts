/*
 * Definitions and typeguards for all messages that are sent between GCS and vehicles.
 * https://ground-control-station.readthedocs.io/en/latest/communications/messages.html
 *
 * Includes definitions for tasks too, as those are part of a message.
 * https://ground-control-station.readthedocs.io/en/latest/communications/jobs.html
 */

import { JobType, vehicleConfig } from '../static/index';

import { isVehicleStatus, VehicleStatus } from './types';

/**
 * A float represented as a hexadecimal string.
 * This is used to reduce the size of messages being sent between vehicles.
 * Uses IEEE 754 standard to convert float to hex (and vice versa).
 */
export type HexFloat = string;

/**
 * Type guard for a hex float.
 */
export function isHexFloat(hex: string): boolean {
  const modifiedHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return modifiedHex.match(/^[0-9a-fA-F]+$/) !== null;
}

/**
 * Converts a float number to a hex float.
 */
/* eslint-disable no-bitwise */
export function toHexFloat(float: number): HexFloat {
  const getHex = (index: number): string => `00${index.toString(16)}`.slice(-2);

  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, float);
  return `0x${[0, 0, 0, 0].map((_, index): string => getHex(view.getUint8(index))).join('')}`;
}

/**
 * Converts a hex string to a float number.
 */
export function toFloat(hex: HexFloat): number {
  const int = parseInt(hex, 16);
  if (int === 0) return 0;

  const sign = (int >>> 31) ? -1 : 1;
  let exp = ((int >>> 23) & 0xff) - 127;
  const mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
  let float = 0;

  for (let i = 0; i < mantissa.length; i += 1, exp -= 1) {
    if (parseInt(mantissa[i], 10)) {
      float += 2 ** exp;
    }
  }

  return float * sign;
}
/* eslint-enable no-bitwise */

// Definitions for all tasks.

interface TaskBase {
  taskType: string;
}

interface TakeoffTaskParameters {
  lat: HexFloat;
  lng: HexFloat;
  alt: HexFloat;
  loiter: {
    lat: HexFloat;
    lng: HexFloat;
    alt: HexFloat;
    radius: HexFloat;
    direction: HexFloat;
  };
}

export interface TakeoffTask extends TaskBase, TakeoffTaskParameters {
  taskType: 'takeoff';
}

function isTakeoffTask(task: Task): boolean {
  return task.taskType === 'takeoff'
    && isHexFloat(task.lat)
    && isHexFloat(task.lng)
    && isHexFloat(task.alt)

    && task.loiter
    && isHexFloat(task.loiter.lat)
    && isHexFloat(task.loiter.lng)
    && isHexFloat(task.loiter.alt)
    && isHexFloat(task.loiter.radius)
    && isHexFloat(task.loiter.direction);
}

interface LoiterTaskParameters {
  lat: HexFloat;
  lng: HexFloat;
  alt: HexFloat;
  radius: HexFloat;
  direction: HexFloat;
}

export interface LoiterTask extends TaskBase, LoiterTaskParameters {
  taskType: 'loiter';
}

function isLoiterTask(task: Task): boolean {
  return task.taskType === 'loiter'
    && isHexFloat(task.lat)
    && isHexFloat(task.lng)
    && isHexFloat(task.alt)
    && isHexFloat(task.radius)
    && isHexFloat(task.direction);
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISRSearchTaskParameters {
  alt: HexFloat;
  waypoints: [
    {
      lat: HexFloat;
      lng: HexFloat;
    },
    {
      lat: HexFloat;
      lng: HexFloat;
    },
    {
      lat: HexFloat;
      lng: HexFloat;
    }
  ];
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchTask extends TaskBase, ISRSearchTaskParameters {
  taskType: 'isrSearch';
}

function isISRSearchTask(task: Task): boolean {
  return task.taskType === 'isrSearch'
    && isHexFloat(task.alt)

    && task.waypoints && task.waypoints.length === 3
    && task.waypoints.every(
      (waypoint): boolean => isHexFloat(waypoint.lat) && isHexFloat(waypoint.lng),
    );
}

interface PayloadDropTaskParameters {
  waypoints: [
    {
      lat: HexFloat;
      lng: HexFloat;
      alt: HexFloat;
    },
    {
      lat: HexFloat;
      lng: HexFloat;
      alt: HexFloat;
    }
  ];
}

export interface PayloadDropTask extends TaskBase, PayloadDropTaskParameters {
  taskType: 'payloadDrop';
}

function isPayloadDropTask(task: Task): boolean {
  return task.taskType === 'payloadDrop'
    && task.waypoints && task.waypoints.length === 2
    && task.waypoints.every(
      (waypoint): boolean => isHexFloat(waypoint.lat)
        && isHexFloat(waypoint.lng)
        && isHexFloat(waypoint.alt),
    );
}

interface LandTaskParameters {
  waypoints: [
    {
      lat: HexFloat;
      lng: HexFloat;
      alt: HexFloat;
    },
    {
      lat: HexFloat;
      lng: HexFloat;
      alt: HexFloat;
    }
  ];
}

export interface LandTask extends TaskBase, LandTaskParameters {
  taskType: 'land';
}

function isLandTask(task: Task): boolean {
  return task.taskType === 'land'
    && task.waypoints && task.waypoints.length === 2
    && task.waypoints.every(
      (waypoint): boolean => isHexFloat(waypoint.lat)
        && isHexFloat(waypoint.lng)
        && isHexFloat(waypoint.alt),
    );
}

interface UGVRetrieveTargetTaskParameters extends TaskBase {
  lat: HexFloat;
  lng: HexFloat;
}

export interface UGVRetrieveTargetTask extends TaskBase, UGVRetrieveTargetTaskParameters {
  taskType: 'retrieveTarget';
}

function isUGVRetrieveTargetTask(task: Task): boolean {
  if (task.taskType !== 'retrieveTarget') return false;

  const retrieveTargetTask = task as UGVRetrieveTargetTask;

  return isHexFloat(retrieveTargetTask.lat) && isHexFloat(retrieveTargetTask.lng);
}

interface DeliverTargetTaskParameters {
  taskType: 'deliverTarget';

  lat: HexFloat;
  lng: HexFloat;
}

export interface DeliverTargetTask extends TaskBase, DeliverTargetTaskParameters {
  taskType: 'deliverTarget';
}

function isDeliverTargetTask(task: Task): boolean {
  return task.taskType === 'deliverTarget'
    && isHexFloat(task.lat)
    && isHexFloat(task.lng);
}

// UUVRetrieveTargetTask does not have any parameters.

export interface UUVRetrieveTargetTask extends TaskBase {
  taskType: 'retrieveTarget';
}

function isUUVRetrieveTargetTask(task: Task): boolean {
  if (task.taskType !== 'retrieveTarget') return false;

  // Cast task to UGV retrieve to ensure that this task is not UGV task, and is UUV.
  const retrieveTargetTask = task as UGVRetrieveTargetTask;

  // Check if values for lat and lng are undefined, since UUV version should not have these.
  return !retrieveTargetTask.lat && !retrieveTargetTask.lng;
}

export interface QuickScanTaskParameters {
  waypoints: [
    {
      lat: HexFloat;
      lng: HexFloat;
    },
    {
      lat: HexFloat;
      lng: HexFloat;
    },
    {
      lat: HexFloat;
      lng: HexFloat;
    },
    {
      lat: HexFloat;
      lng: HexFloat;
    }
  ];
}

export interface QuickScanTask extends TaskBase, QuickScanTaskParameters {
  taskType: 'quickScan';
}

function isQuickScanTask(task: Task): boolean {
  return task.taskType === 'quickScan'
    && task.waypoints && task.waypoints.length === 4
    && task.waypoints.every(
      (waypoint): boolean => isHexFloat(waypoint.lat) && isHexFloat(waypoint.lng),
    );
}

/*
 * DetailedSearchTask parameters are provided by QuickScan and are generated
 * autonomously, no need for user interaction.
 */

export interface DetailedSearchTask extends TaskBase {
  taskType: 'detailedSearch';

  lat: HexFloat;
  lng: HexFloat;
}

function isDetailedSearchTask(task: Task): boolean {
  return task.taskType === 'detailedSearch'
    && isHexFloat(task.lat)
    && isHexFloat(task.lng);
}

export type Task = TakeoffTask | LoiterTask | ISRSearchTask | PayloadDropTask | LandTask
| UGVRetrieveTargetTask | DeliverTargetTask | UUVRetrieveTargetTask | QuickScanTask
| DetailedSearchTask;

/**
 * Checks if an object is a task. To be a task, the object must match one of the tasks above.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTask(task: { [key: string]: any }): boolean {
  if (!task.taskType) return false;

  const specificTask = task as Task;

  return isTakeoffTask(specificTask)
   || isLoiterTask(specificTask)
   || isISRSearchTask(specificTask)
   || isPayloadDropTask(specificTask)
   || isLandTask(specificTask)
   || isUGVRetrieveTargetTask(specificTask)
   || isDeliverTargetTask(specificTask)
   || isUUVRetrieveTargetTask(specificTask)
   || isQuickScanTask(specificTask)
   || isDetailedSearchTask(specificTask);
}

export const taskTypeGuard = {
  isTakeoffTask,
  isLoiterTask,
  isISRSearchTask,
  isPayloadDropTask,
  isLandTask,
  isUGVRetrieveTargetTask,
  isDeliverTargetTask,
  isUUVRetrieveTargetTask,
  isQuickScanTask,
  isDetailedSearchTask,
  isTask,
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchMissionParameters {
  takeoff: TakeoffTaskParameters;
  isrSearch: ISRSearchTaskParameters;
  land: LandTaskParameters;
}

export interface VTOLSearchMissionParameters {
  quickScan: QuickScanTaskParameters;
}

export interface PayloadDropMissionParameters {
  takeoff: TakeoffTaskParameters;
  payloadDrop: PayloadDropTaskParameters;
  land: LandTaskParameters;
}

export interface UGVRetreiveMissionParameters {
  retrieveTarget: UGVRetreiveMissionParameters;
  deliverTarget: DeliverTargetTaskParameters;
}

// UUVRetrieveMission does not need parameters, as its one task does not need any.

/**
 * Options for the mission. All variables are optional so the UI should
 * be able to detech which of the variables are required or not.
 */
export interface MissionOptions {
  isrSearch?: {
    /**
     * Will not require takeoff parameters if this is true.
     */
    noTakeoff: boolean;

    /**
     * Will not require land parameters if this is true.
     */
    noLand: boolean;
  };

  payloadDrop?: {
    /**
     * Will not require takeoff parameters if this is true.
     */
    noTakeoff: boolean;

    /**
     * Will not require land parameters if this is true.
     */
    noLand: boolean;
  };
}

/**
 * Type of information that should be passed from mission window to the Orchestrator.
 */
export interface MissionParameters {
  info: ISRSearchMissionParameters
  | VTOLSearchMissionParameters
  | PayloadDropTaskParameters
  | UGVRetreiveMissionParameters
  | {}; // The {} stands for UUVRetrieveMissionParameters, an empty object.

  options: MissionOptions;
}

interface MessageBase {
  /**
   * Type of message.
   */
  type: string;
}

/*
 * Definitions for all messages from GCS to vehicles. No need for type guards, TypeScript
 * will handle all of it as we write up the message.
 *
 * MessageHex types are the same as their normal Message class, however, their
 */

export interface StartMessage extends MessageBase {
  type: 'start';

  /**
   * Name of job to perform.
   */
  jobType: JobType;

  /**
   * Any other information the vehicle should have before performing the job.
   */
  options?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function isStartMessage(message: Message): boolean {
  return message.type === 'start'
    && vehicleConfig.isJobType(message.jobType);
}

export interface AddMissionMessage extends MessageBase {
  type: 'addMission';

  /**
   * Information related to accomplishing specific job.
   */
  missionInfo: Task;
}

function isAddMissionMessage(message: Message): boolean {
  return message.type === 'addMission'
    && message.missionInfo && isTask(message.missionInfo);
}

export interface PauseMessage extends MessageBase {
  type: 'pause';
}

function isPauseMessage(message: Message): boolean {
  return message.type === 'pause';
}

export interface ResumeMessage extends MessageBase {
  type: 'resume';
}

function isResumeMessage(message: Message): boolean {
  return message.type === 'resume';
}

export interface StopMessage extends MessageBase {
  type: 'stop';
}

function isStopMessage(message: Message): boolean {
  return message.type === 'stop';
}

export interface ConnectionAckMessage extends MessageBase {
  type: 'connectionAck';
}

function isConnectionAckMessage(message: Message): boolean {
  return message.type === 'connectionAck';
}

// Definitions for all messages from vehicles to GCS.

export interface UpdateMessage extends MessageBase {
  type: 'update';

  /**
   * Latitude of the vehicle.
   */
  lat: HexFloat;

  /**
   * Longitude of the vehicle.
   */
  lng: HexFloat;

  /**
   * Altitude of the vehicle.
   */
  alt?: HexFloat;

  /**
   * Current vehicle heading. Value is in degrees.
   */
  heading?: HexFloat;

  /**
   * Current battery of the vehicle, expressed as a decimal. Will vary from 0 to 1.
   */
  battery?: HexFloat;

  /**
   * Status of the vehicle.
   */
  status: VehicleStatus;

  /**
   * Message generated if vehicle is in an error state.
   *
   * It is best practice to provide this value to be able to see why the the vehicle's
   * status is error.
   */
  errorMessage?: string;
}

function isUpdateMessage(message: Message): boolean {
  const mandatoryCheck = message.type === 'update'
    && isHexFloat(message.lat)
    && isHexFloat(message.lng)
    && isVehicleStatus(message.status);

  if (!mandatoryCheck) return false;

  const updateMessage = message as UpdateMessage;

  if (updateMessage.alt && !isHexFloat(updateMessage.alt)) return false;
  if (updateMessage.heading && !isHexFloat(updateMessage.heading)) return false;
  if (updateMessage.battery && !isHexFloat(updateMessage.battery)) return false;

  return true;
}

export interface POIMessage extends MessageBase {
  type: 'poi';

  /**
   * Latitude of the point of interest.
   */
  lat: HexFloat;

  /**
   * Longitude of the point of interest.
   */
  lng: HexFloat;
}

function isPOIMessage(message: Message): boolean {
  return message.type === 'poi'
    && isHexFloat(message.lat)
    && isHexFloat(message.lng);
}

export interface CompleteMessage extends MessageBase {
  type: 'complete';
}

function isCompleteMessage(message: Message): boolean {
  return message.type === 'complete';
}

export interface ConnectMessage extends MessageBase {
  type: 'connect';

  /**
   * List of all the different jobs the vehicle is capable of doing.
   */
  jobsAvailable: JobType[];
}

export function isConnectMessage(message: Message): boolean {
  return message.type === 'connect'

    // Check if jobsAvailable is a string array of valid job types.
    && message.jobsAvailable.every(vehicleConfig.isJobType);
}

// Definitions for all other message types.

export interface AcknowledgementMessage extends MessageBase {
  type: 'ack';

  /**
   * ID of the message that is being acknowledged.
   */
  ackid: number;
}

export function isAcknowledgementMessage(message: Message): boolean {
  return message.type === 'ack'
    && !Number.isNaN(message.ackid);
}

export interface BadMessageMessage extends MessageBase {
  type: 'badMessage';

  /**
   * Description of why message was bad.
   *
   * It is best practice to provide this value to be able to see why the message received
   * is bad.
   */
  error?: string;
}

export function isBadMessageMessage(message: Message): boolean {
  return message.type === 'badMessage';
}

export type Message = StartMessage | AddMissionMessage | PauseMessage | ResumeMessage | StopMessage
| ConnectionAckMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectMessage
| AcknowledgementMessage | BadMessageMessage;

/**
 * Logic for this function is slightly different from isTask since the GCS does not need to know
 * which task it is sending to the vehicle. It just needs to know that the task is a valid task,
 * and contains a valid taskType and task information for a task.
 *
 * For this function, GCS does need to know what messages it receives. GCS needs to check if
 * an object is a message (if the object has a type field then it is a message). If not, GCS
 * can alert the sender that the object sent is not a message.
 *
 * After this function, the GCS will check which message the sender has sent with the functions
 * above, and if the functions fail (which means that the fields that have been included with
 * the message are wrong), then the GCS will tell the sender that the format for the message
 * is wrong.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMessage(message: { [key: string]: any }): boolean {
  return message.type && [
    'start',
    'addMission',
    'pause',
    'resume',
    'stop',
    'connectionAck',
    'update',
    'poi',
    'complete',
    'connect',
    'ack',
    'badMessage',
  ].includes(message.type);
}

export type JSONMessage = Message & {
  id: number;
  tid: number;
  sid: number;
  time: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isJSONMessage(message: { [key: string]: any }): boolean {
  if (!isMessage(message)) return false;

  // Check if id is a number.
  const idCheck = message.id !== '' && message.id !== true && !Number.isNaN(message.id);

  // Check if tid is a number and is valid.
  const tidCheck = !Number.isNaN(message.tid)
     && vehicleConfig.vehicleInfos[message.tid] !== undefined;

  // Check if sid is a number and is valid.
  const sidCheck = !Number.isNaN(message.sid)
     && vehicleConfig.vehicleInfos[message.sid] !== undefined;

  return idCheck && tidCheck && sidCheck;
}

export const messageTypeGuard = {
  isStartMessage,
  isAddMissionMessage,
  isPauseMessage,
  isResumeMessage,
  isStopMessage,
  isConnectionAckMessage,
  isUpdateMessage,
  isPOIMessage,
  isCompleteMessage,
  isConnectMessage,
  isAcknowledgementMessage,
  isBadMessageMessage,
  isMessage,
  isJSONMessage,
};

export default { taskTypeGuard, messageTypeGuard };
