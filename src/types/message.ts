/*
 * Definitions and typeguards for all messages that are sent between GCS and vehicles.
 * https://ground-control-station.readthedocs.io/en/latest/communications/messages.html
 *
 * Includes definitions for tasks too, as those are part of a message.
 * https://ground-control-station.readthedocs.io/en/latest/communications/jobs.html
 */

import { JobType, vehicleConfig } from '../static/index';

import { isVehicleStatus, VehicleStatus } from './vehicle';

import * as Task from './task';

interface MessageBase {
  /**
   * Type of message.
   */
  type: string;
}

// Definitions for all messages from GCS to vehicles.

export interface StartMessage extends MessageBase {
  type: 'start';

  /**
   * Name of job to perform.
   */
  jobType: JobType;
}

/**
 * Type guard for Start Message.
 */
function isStartMessage(message: Message): boolean {
  return message.type === 'start'
    && vehicleConfig.isValidJobType(message.jobType);
}

export interface AddMissionMessage extends MessageBase {
  type: 'addMission';

  /**
   * Information related to accomplishing specific job.
   */
  missionInfo: Task.Task;
}

/**
 * Type guard for AddMission Message.
 */
function isAddMissionMessage(message: Message): boolean {
  return message.type === 'addMission'
    && message.missionInfo && Task.TypeGuard.isTask(message.missionInfo);
}

export interface PauseMessage extends MessageBase {
  type: 'pause';
}

/**
 * Type guard for Pause Message.
 */
function isPauseMessage(message: Message): boolean {
  return message.type === 'pause';
}

export interface ResumeMessage extends MessageBase {
  type: 'resume';
}

/**
 * Type guard for Resume Message.
 */
function isResumeMessage(message: Message): boolean {
  return message.type === 'resume';
}

export interface StopMessage extends MessageBase {
  type: 'stop';
}

/**
 * Type guard for Stop Message.
 */
function isStopMessage(message: Message): boolean {
  return message.type === 'stop';
}

export interface ConnectionAckMessage extends MessageBase {
  type: 'connectionAck';
}

/**
 * Type guard for Connection Acknowledge Message.
 */
function isConnectionAcknowledgementMessage(message: Message): boolean {
  return message.type === 'connectionAck';
}

// Definitions for all messages from vehicles to GCS.

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

/**
 * Type guard for Update Message.
 */
function isUpdateMessage(message: Message): boolean {
  const mandatoryCheck = message.type === 'update'
    && !Number.isNaN(message.lat)
    && !Number.isNaN(message.lng)
    && isVehicleStatus(message.status);

  if (!mandatoryCheck) return false;

  const updateMessage = message as UpdateMessage;

  if (updateMessage.alt && Number.isNaN(updateMessage.alt)) return false;
  if (updateMessage.heading && Number.isNaN(updateMessage.heading)) return false;
  if (updateMessage.battery && Number.isNaN(updateMessage.battery)) return false;

  return true;
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

/**
 * Type guard for Point of Interest Message.
 */
function isPOIMessage(message: Message): boolean {
  return message.type === 'poi'
    && !Number.isNaN(message.lat)
    && !Number.isNaN(message.lng);
}

export interface CompleteMessage extends MessageBase {
  type: 'complete';
}

/**
 * Type guard for Complete Message.
 */
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


/**
 * Type guard for Connect Message.
 */
export function isConnectMessage(message: Message): boolean {
  return message.type === 'connect'

    // Check if jobsAvailable is a string array of valid job types.
    && message.jobsAvailable.every(vehicleConfig.isValidJobType);
}

// Definitions for all other message types.

export interface AcknowledgementMessage extends MessageBase {
  type: 'ack';

  /**
   * ID of the message that is being acknowledged.
   */
  ackid: number;
}

/**
 * Type guard for Acknowledgement Message.
 */
export function isAcknowledgementMessage(message: Message): boolean {
  return message.type === 'ack'
    && !Number.isNaN(message.ackid);
}

export interface BadMessage extends MessageBase {
  type: 'badMessage';

  /**
   * Description of why message was bad.
   *
   * It is best practice to provide this value to be able to see why the message received
   * is bad.
   */
  error?: string;
}

/**
 * Type guard for Bad Message.
 */
export function isBadMessage(message: Message): boolean {
  return message.type === 'badMessage';
}

/**
 * All types of messages sent to and from the GCS.
 */
export type Message = StartMessage | AddMissionMessage | PauseMessage | ResumeMessage | StopMessage
| ConnectionAckMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectMessage
| AcknowledgementMessage | BadMessage;

/**
 * Simply checks if the message has a valid type field. This is different from the type
 * guards from types/missionInformation and types/task.
 *
 * Use the more specific checks for each message to see which message it its.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMessage(message: { [key: string]: any }): boolean {
  return message.type && typeof message.type === 'string' && [
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
  ].includes(message.type.toLowerCase());
}

/**
 * Same as a message, but has the required id, tid, sid, time fields.
 */
export type JSONMessage = Message & {
  id: number;
  tid: number;
  sid: number;
  time: number;
};

/**
 * Type guard for a JSON Message. Check the type guard for a Message for information.
 */
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

/**
 * Type guards for a message.
 */
export const TypeGuard = {
  isStartMessage,
  isAddMissionMessage,
  isPauseMessage,
  isResumeMessage,
  isStopMessage,
  isConnectionAcknowledgementMessage,
  isUpdateMessage,
  isPOIMessage,
  isCompleteMessage,
  isConnectMessage,
  isAcknowledgementMessage,
  isBadMessage,
  isMessage,
  isJSONMessage,
};
