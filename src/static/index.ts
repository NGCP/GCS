/* When importing anything inside resources, please import through this file */

/* eslint-disable @typescript-eslint/camelcase */

import { fixtures, geolocation } from './config.json';
import { startLocation, locations as locationsObject } from './locations.json';
import {
  vehicleIds as vehicleIdsObject,
  vehicleInfos as vehicleInfosObject,
  vehicleStatuses as vehicleStatusesObject,
} from './vehicle.json';

import arrow from './images/arrow.png';
import icon from './images/icon.png';
import pin from './images/pin.png';

import ngcp_calpoly from './images/logo/ngcp_calpoly.png';
import ngcp_pomona from './images/logo/ngcp_pomona.png';

import poi_fp from './images/markers/poi_fp.png';
import poi_unknwn from './images/markers/poi_unkwn.png';
import poi_vld from './images/markers/poi_vld.png';

import plane_red from './images/markers/vehicles/plane_red.png';
import plane from './images/markers/vehicles/plane.png';
import rover_red from './images/markers/vehicles/rover_red.png';
import rover from './images/markers/vehicles/rover.png';

import fullmoon_hover from './images/other/fullmoon_hover.png';
import fullmoon from './images/other/fullmoon.png';
import geolocation_img_hover from './images/other/geolocation_hover.png';
import geolocation_img from './images/other/geolocation.png';
import moon_hover from './images/other/moon_hover.png';
import moon from './images/other/moon.png';

// Export json objects with signature to allow us to access it with TypeScript.
export const locations: {
  [name: string]: { lat: number; lng: number; zoom?: number };
} = locationsObject;

export const vehicleIds: {
  [name: string]: number;
} = vehicleIdsObject;

export const vehicleInfos: {
  [id: string]: { macAddress: string; name: string; 'type': string };
} = vehicleInfosObject;

export const vehicleStatuses: {
  [status: string]: { 'type': string; message: string };
} = vehicleStatusesObject;

export {
  fixtures,
  geolocation,
  startLocation,
};

/**
 * A given key for an image will give either a string or an object with similar structure.
 */
export interface RecursiveImageSignature {
  [key: string]: string | RecursiveImageSignature;
}

export const images: RecursiveImageSignature = {
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
  fixtures,
  geolocation,
  images,
  locations,
  startLocation,
  vehicleIds,
  vehicleInfos,
  vehicleStatuses,
};
