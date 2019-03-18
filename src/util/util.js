import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

import {
  vehicleInfos, vehicleStatuses,
} from '../../resources/index';

export function updateVehicles(component, vehicles) {
  const { vehicles: thisVehicles } = component.state;
  const currentVehicles = thisVehicles;

  vehicles.forEach((vehicle) => {
    currentVehicles[vehicle.sid] = {
      ...vehicle,
      ...vehicleInfos[vehicle.sid],
      status: vehicleStatuses[vehicle.status],
    };
  });

  component.setState({ vehicles: currentVehicles });
}

export function startMission() {
  ipcRenderer.send('post', 'startMission');
}

export function stopMission() {
  ipcRenderer.send('post', 'stopMission');
}

export function completeMission() {
  ipcRenderer.send('post', 'completeMission');
}

/* eslint-disable no-bitwise */

// Bitshifting allows us to switch between hex and float

export function floatToHexString(float) {
  const getHex = i => `00${i.toString(16)}`.slice(-2);
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, float);
  return [0, 0, 0, 0].map((_, i) => getHex(view.getUint8(i))).join('');
}

export function hexStringToFloat(hexString) {
  const int = parseInt(hexString, 16);
  if (int > 0 || int < 0) {
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

  return 0;
}

/* eslint-enable no-bitwise */

export default {
  updateVehicles,
  startMission,
  stopMission,
  completeMission,
  floatToHexString,
  hexStringToFloat,
};
