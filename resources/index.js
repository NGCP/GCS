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

import geolocation_img_hover from './images/other/geolocation_hover.png';
import geolocation_img from './images/other/geolocation.png';
import moon_hover from './images/other/moon_hover.png';
import moon from './images/other/moon.png';
import sun_hover from './images/other/sun_hover.png';
import sun from './images/other/sun.png';

import { cache, fixtures, geolocation } from './config.json';
import { startLocation, locations } from './locations.json';
import * as macAddress from './mac-address.json';

export {
  cache, fixtures, geolocation, startLocation, locations, macAddress,
};

export const images = {
  arrow,
  icon,
  pin,
  logo: {
    ngcp_calpoly,
    ngcp_pomona,
  },
  markers: {
    poi_fp,
    poi_unknwn,
    poi_vld,
    vehicles: {
      uav_red,
      uav,
      ugv_red,
      ugv,
    },
  },
  other: {
    geolocation_hover: geolocation_img_hover,
    geolocation: geolocation_img,
    moon_hover,
    moon,
    sun_hover,
    sun,
  },
};
