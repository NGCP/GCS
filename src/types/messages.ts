/*
 * Definitions and typeguards for all messages that are sent between GCS and vehicles.
 * See the wiki for more information: https://github.com/NGCP/GCS/wiki/GCS-JSON-Messages
 *
 * Includes definitions for jobs and tasks too, as those are part of a message.
 */

import { vehicleConfig } from '../static/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { isVehicleStatus, VehicleStatus } from './types'; // eslint-disable-line import/named

// Definitions for all tasks.

interface TaskBase {
  taskType: string;
}

export interface Takeoff extends TaskBase {
  taskType: 'takeoff';

  lat: number;
  lng: number;
  alt: number;
  loiter: {
    lat: number;
    lng: number;
    alt: number;
    radius: number;
    direction: number;
  };
}

export interface Loiter extends TaskBase {
  taskType: 'loiter';

  lat: number;
  lng: number;
  alt: number;
  radius: number;
  direction: number;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearch extends TaskBase {
  taskType: 'isrSearch';

  alt: number;
  waypoints: [
    {
      lat: number;
      lng: number;
    },
    {
      lat: number;
      lng: number;
    },
    {
      lat: number;
      lng: number;
    }
  ];
}

export interface PayloadDrop extends TaskBase {
  taskType: 'payloadDrop';

  waypoints: [
    {
      lat: number;
      lng: number;
      alt: number;
    },
    {
      lat: number;
      lng: number;
      alt: number;
    }
  ];
}

export interface Land extends TaskBase {
  taskType: 'land';

  waypoints: [
    {
      lat: number;
      lng: number;
      alt: number;
    },
    {
      lat: number;
      lng: number;
      alt: number;
    }
  ];
}

export interface UGVRetrieveTarget extends TaskBase {
  taskType: 'retrieveTarget';

  lat: number;
  lng: number;
}

export interface DeliverTarget extends TaskBase {
  taskType: 'deliverTarget';

  lat: number;
  lng: number;
}

export interface UUVRetrieveTarget extends TaskBase {
  taskType: 'retrieveTarget';
}

export interface QuickScan extends TaskBase {
  taskType: 'quickScan';

  searchArea: {
    center: [number, number];
    rad1: number;
    rad2: number;
  };
}

export interface DetailedSearch extends TaskBase {
  taskType: 'detailedSearch';

  lat: number;
  lng: number;
}

export type Task = Takeoff | Loiter | ISRSearch | PayloadDrop | Land | UGVRetrieveTarget
| DeliverTarget | UUVRetrieveTarget | QuickScan | DetailedSearch;

/*
 * Definitions for all messages from GCS to vehicles. No need for type guards, TypeScript
 * will handle all of it as we write up the message.
 */

interface MessageBase {
  /**
   * Type of message.
   */
  type: string;
}

export interface StartMessage extends MessageBase {
  type: 'start';

  /**
   * Name of job to perform.
   */
  jobType: string;

  /**
   * Any other information the vehicle should have before performing the job.
   */
  options?: object;
}

export interface AddMissionMessage extends MessageBase {
  type: 'addMission';

  /**
   * Information related to accomplishing specific job.
   */
  missionInfo: Task;
}

export interface PauseMessage extends MessageBase {
  type: 'pause';
}

export interface ResumeMessage extends MessageBase {
  type: 'resume';
}

export interface StopMessage extends MessageBase {
  type: 'stop';
}

export interface ConnectionAckMessage extends MessageBase {
  type: 'connectionAck';
}

/*
 * Definitions for all messages from vehicles to GCS. Type guards are needed for these,
 * as we do not know the types of the messages we are receiving and whether or not they're
 * valid.
 */

/**
 * Checks if the object is a proper message.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMessage(message: { [key: string]: any }): boolean {
  const typeCheck = message.type && [
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
  ].indexOf(message.type) >= 0;

  // Check if id is a number.
  const idCheck = message.id !== '' && message.id !== true && !Number.isNaN(message.id);

  // Check if tid is a number and that tid is 0 (vehicle id of GCS).
  const tidCheck = !Number.isNaN(message.tid) && message.tid === 0;

  // Check if sid is a number and is valid.
  const sidCheck = !Number.isNaN(message.sid)
     && vehicleConfig.vehicleInfos[message.sid] !== undefined;

  return typeCheck && idCheck && tidCheck && sidCheck;
}

export interface UpdateMessage extends MessageBase {
  type: 'update';

  /**
   * Latitude of the vehicle.
   */
  lat: number;

  /**
   * Longitude of the vehicle.
   */
  lng: number;

  /**
   * Altitude of the vehicle.
   */
  alt?: number;

  /**
   * Current vehicle heading. Value is in degrees.
   */
  heading?: number;

  /**
   * Current battery of the vehicle, expressed as a decimal. Will vary from 0 to 1.
   */
  battery?: number;

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

/* eslint-disable @typescript-eslint/no-unused-vars */

export function isUpdateMessage(message: Message): boolean {
  // Check if message type is "update".
  return message.type === 'update'

    // Check if lat is a number.
    && !Number.isNaN(message.lat)

    // Check if lng is a number.
    && !Number.isNaN(message.lng)

    // Check if status is a valid vehicle status.
    && isVehicleStatus(message.status);
}

export interface POIMessage extends MessageBase {
  type: 'poi';

  /**
   * Latitude of the point of interest.
   */
  lat: number;

  /**
   * Longitude of the point of interest.
   */
  lng: number;
}

export function isPOIMessage(message: Message): boolean {
  // Check if message type is "poi".
  return message.type === 'poi'

    // Check if lat is a number.
    && !Number.isNaN(message.lat)

    // Check if lng is a number.
    && !Number.isNaN(message.lng);
}

export interface CompleteMessage extends MessageBase {
  type: 'complete';
}

export function isCompleteMessage(message: Message): boolean {
  // Check if message type is "complete".
  return message.type === 'complete';
}

export interface ConnectMessage extends MessageBase {
  type: 'connect';

  /**
   * List of all the different jobs the vehicle is capable of doing.
   */
  jobsAvailable: string[];
}

export function isConnectMessage(message: Message): boolean {
  // Check if message type is "connect".
  return message.type === 'connect'

    // Check if jobsAvailable is a string array of valid job types.
    && message.jobsAvailable.every(vehicleConfig.isJobType);
}

// 4. Definitions for all other message types.

export interface AcknowledgementMessage extends MessageBase {
  type: 'ack';

  /**
   * ID of the message that is being acknowledged.
   */
  ackid: number;
}

export function isAcknowledgementMessage(message: Message): boolean {
  // Check if message type is "ack".
  return message.type === 'ack'

    // Check if ackid is a number.
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
  // Check if message type is "badMessage".
  return message.type === 'badMessage';
}

export type Message = StartMessage | AddMissionMessage | PauseMessage | ResumeMessage | StopMessage
| ConnectionAckMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectMessage
| AcknowledgementMessage | BadMessageMessage;

export default {
  isMessage,
  isUpdateMessage,
  isPOIMessage,
  isCompleteMessage,
  isConnectMessage,
  isAcknowledgementMessage,
  isBadMessageMessage,
};
