/*
 * Definitions for all messages that are sent between GCS and vehicles. See the wiki for more
 * information: https://github.com/NGCP/GCS/wiki/GCS-JSON-Messages
 *
 * These definitions will not have the time, sid, tid, and id fields.
 */

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { VehicleStatus } from '../../util/types'; // eslint-disable-line import/named

// From GCS to vehicles.

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
  missionInfo: object;
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

// From vehicles to GCS.

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
   */
  errorMessage?: string;
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

export interface CompleteMessage extends MessageBase {
  type: 'complete';
}

export interface ConnectionMessage extends MessageBase {
  type: 'connect';

  /**
   * List of all the different jobs the vehicle is capable of doing.
   */
  jobsAvailable: string[];
}

// Other message types.

export interface AckMessage extends MessageBase {
  type: 'ack';

  /**
   * ID of the message that is being acknowledged.
   */
  ackid: number;
}

export interface BadMessageMessage extends MessageBase {
  type: 'badMessage';

  /**
   * Description of why message was bad.
   */
  error: string;
}

export type Message = StartMessage | AddMissionMessage | PauseMessage | ResumeMessage | StopMessage
| ConnectionAckMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectionMessage
| AckMessage | BadMessageMessage;
