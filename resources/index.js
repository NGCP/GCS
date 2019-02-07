/* When importing anything inside resources, please import through this file */

/* eslint-disable camelcase */

import arrow from './images/arrow.png';
import icon from './images/icon.png';
import pin from './images/pin.png';

import ngcp_calpoly from './images/logo/ngcp_calpoly.png';
import ngcp_pomona from './images/logo/ngcp_pomona.png';

import poi_fp from './images/markers/poi_fp.png';
import poi_unknwn from './images/markers/poi_unkwn.png';
import poi_vld from './images/markers/poi_vld.png';

import uav_red from './images/markers/vehicles/uav_red.png';
import uav from './images/markers/vehicles/uav.png';
import ugv_red from './images/markers/vehicles/ugv_red.png';
import ugv from './images/markers/vehicles/ugv.png';

import geolocation_hover from './images/other/geolocation_hover.png';
import geolocation from './images/other/geolocation.png';

export { default as config, cache, devMode, geolocation, locations, startLocation } from './config.json';
export * as macAddress from './mac-address.json';

export const images = {
  arrow: arrow,
  icon: icon,
  pin: pin,
  logo: {
    ngcp_calpoly: ngcp_calpoly,
    ngcp_pomona: ngcp_pomona,
  },
  markers: {
    poi_fp: poi_fp,
    poi_unknwn: poi_unknwn,
    poi_vld: poi_vld,
    vehicles: {
      uav_red: uav_red,
      uav: uav,
      ugv_red: ugv_red,
      ugv: ugv,
    },
  },
  other: {
    geolocation_hover: geolocation_hover,
    geolocation: geolocation,
  },
};
