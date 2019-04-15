/* eslint-disable @typescript-eslint/camelcase */

import { LatLngZoom } from '../types/types';

import ngcp_calpoly from './images/logo/ngcp_calpoly.png';
import ngcp_pomona from './images/logo/ngcp_pomona.png';

import plane_red from './images/markers/vehicles/plane_red.png';
import plane from './images/markers/vehicles/plane.png';
import rover_red from './images/markers/vehicles/rover_red.png';
import rover from './images/markers/vehicles/rover.png';

import poi_fp from './images/markers/poi_fp.png';
import poi_unknwn from './images/markers/poi_unkwn.png';
import poi_vld from './images/markers/poi_vld.png';

import fullmoon_hover from './images/other/fullmoon_hover.png';
import fullmoon from './images/other/fullmoon.png';
import geolocation_img_hover from './images/other/geolocation_hover.png';
import geolocation_img from './images/other/geolocation.png';
import moon_hover from './images/other/moon_hover.png';
import moon from './images/other/moon.png';

import arrow from './images/arrow.png';
import icon from './images/icon.png';
import pin from './images/pin.png';

import config from './config.json';
import { startLocation as startLocationString, locations as locationsObject } from './location.json';
import {
  vehicleIds as vehicleIdsObject,
  vehicleInfos as vehicleInfosObject,
  vehicleJobs as vehicleJobsObject,
  vehicleStatuses as vehicleStatusesObject,
} from './vehicle.json';

// Add signature to json objects to allow us to access it with TypeScript.
const locations: {
  [name: string]: { lat: number; lng: number; zoom?: number } | undefined;
} = locationsObject;

export const vehicleIds: {
  [name: string]: number | undefined;
} = vehicleIdsObject;

/**
 * Object contained in vehicleInfos in vehicle.json.
 */
export interface VehicleInfo {
  macAddress: string;
  name: string;
  'type': string;
}

/**
 * All valid job types. This should always match up to the job types in vehicle.json.
 */
export type JobType = 'isrSearch' | 'payloadDrop' | 'ugvRetrieve' | 'uuvRetrieve'
| 'quickScan' | 'detailedSearch';

const vehicleInfos: {
  [vehicleId: number]: VehicleInfo | undefined;
} = vehicleInfosObject;

const vehicleJobs: {
  [jobType: string]: string[] | undefined;
} = vehicleJobsObject;

/**
 * Object contained in vehicleStatuses in vehicle.json.
 */
export interface VehicleStatus {
  'type': string;
  message: string;
}

const vehicleStatuses: {
  [status: string]: VehicleStatus | undefined;
} = vehicleStatusesObject;

// Add logic to set startLocation.
const startLocation: LatLngZoom = startLocationString && locations[startLocationString]
  ? locations[startLocationString] as LatLngZoom : {
    lat: 0,
    lng: 0,
    zoom: 18,
  };

/**
 * Checks if a number is a valid vehicle id.
 */
function isValidVehicleId(vehicleId: number): boolean {
  return vehicleInfos[vehicleId] !== undefined;
}

/**
 * Checks if a string is a valid job type.
 */
function isValidJobType(jobType: string): boolean {
  return jobType === 'isrSearch'
    || jobType === 'payloadDrop'
    || jobType === 'ugvRetrieve'
    || jobType === 'uuvRetrieve'
    || jobType === 'quickScan'
    || jobType === 'detailedSearch';
}

/**
 * Checks if a task is a valid task type for that job.
 */
function isValidTaskTypeForJob(taskType: string, jobType: JobType): boolean {
  return (vehicleJobs[jobType] as string[]).includes(taskType);
}

export const locationConfig = {
  locations,
  startLocation,
};

export const vehicleConfig = {
  isValidJobType,
  isValidTaskTypeForJob,
  isValidVehicleId,
  vehicleIds,
  vehicleInfos,
  vehicleStatuses,
  vehicleJobs,
};

export { default as config } from './config.json';

/**
 * A given key for an image will give either a string or an object with similar structure.
 */
export interface RecursiveImageSignature {
  [key: string]: string | RecursiveImageSignature;
}

export const imageConfig: RecursiveImageSignature = {
  arrow,
  icon,
  pin,
  logo: { ngcp_calpoly, ngcp_pomona },
  markers: {
    poi_fp,
    poi_unknwn,
    poi_vld,
    vehicles: {
      plane_red,
      plane,
      rover_red,
      rover,
    },
  },
  other: {
    fullmoon_hover,
    fullmoon,
    geolocation_hover: geolocation_img_hover,
    geolocation: geolocation_img,
    moon_hover,
    moon,
  },
};

export default {
  config,
  imageConfig,
  locationConfig,
  vehicleConfig,
};
