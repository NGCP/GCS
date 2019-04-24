import * as Task from './task';

export type MissionName = 'isrSearch' | 'vtolSearch' | 'payloadDrop' | 'ugvRescue' | 'uuvRescue';

interface InformationBase {
  /**
   * Name of mission.
   */
  missionName: MissionName;

  /**
   * Parameters for the mission. Both user and mission generated.
   */
  parameters: {};

  /**
   * Options for the mission. User generated.
   */
  options: {};
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchInformation extends InformationBase {
  missionName: 'isrSearch';
  parameters: {
    takeoff: Task.TakeoffTaskParameters;
    isrSearch: Task.ISRSearchTaskParameters;
    land: Task.LandTaskParameters;
  };
  options: {
    /**
     * Will not require takeoff task if true.
     */
    noTakeoff: boolean;

    /**
     * Will not require land task if true.
     */
    noLand: boolean;
  };
}

/**
 * Type guard for ISR Search mission information.
 */
function isISRSearchInformation(information: Information): boolean {
  return information.missionName === 'isrSearch';
}

export interface VTOLSearchInformation extends InformationBase {
  missionName: 'vtolSearch';
  parameters: {
    quickScan: Task.QuickScanTaskParameters;
  };
}

/**
 * Type guard for VTOL Search mission information.
 */
function isVTOLSearchInformation(information: Information): boolean {
  return information.missionName === 'vtolSearch';
}

/**
 * Type guard for Payload Drop mission information.
 */
export interface PayloadDropInformation extends InformationBase {
  missionName: 'payloadDrop';
  parameters: {
    takeoff: Task.TakeoffTaskParameters;
    payloadDrop: Task.PayloadDropTaskParameters;
    land: Task.LandTaskParameters;
  };
  options: {
    /**
     * Will not require takeoff task if true.
     */
    noTakeoff: boolean;

    /**
     * Will not require land task if true.
     */
    noLand: boolean;
  };
}

function isPayloadDropInformation(information: Information): boolean {
  return information.missionName === 'payloadDrop';
}

export interface UGVRescueInformation extends InformationBase {
  missionName: 'ugvRescue';
  parameters: {
    retrieveTarget: Task.UGVRetrieveTargetTask;
    deliverTarget: Task.DeliverTargetTaskParameters;
  };
}

function isUGVRetreiveInformation(information: Information): boolean {
  return information.missionName === 'ugvRescue';
}

export interface UUVRescueInformation extends InformationBase {
  missionName: 'uuvRescue';
}

function isUUVRetrieveInformation(information: Information): boolean {
  return information.missionName === 'uuvRescue';
}

/**
 * All types of information that can be provided to a mission.
 */
export type Information = ISRSearchInformation | VTOLSearchInformation
| PayloadDropInformation | UGVRescueInformation | UUVRescueInformation;


/**
 * Checks if an object is a mission information.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMissionInformation(object: { [key: string]: any }): boolean {
  if (!object.missionName) return false;

  const information = object as Information;

  return isISRSearchInformation(information)
   || isVTOLSearchInformation(information)
   || isPayloadDropInformation(information)
   || isUGVRetreiveInformation(information)
   || isUUVRetrieveInformation(information)
   || isMissionInformation(information);
}

/**
 * Type guards for a mission information.
 */
export const TypeGuard = {
  isISRSearchInformation,
  isVTOLSearchInformation,
  isPayloadDropInformation,
  isUGVRetreiveInformation,
  isUUVRetrieveInformation,
  isMissionInformation,
};
