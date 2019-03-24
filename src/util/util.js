import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

import {
  vehicleInfos, vehicleStatuses,
} from '../../resources/index';

// Called by map container and vehicle container to update vehicles being shown.
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

/*
 * These functions will allow us to maintain mission states (starting missions, job, etc.)
 * I'll add explanation here soon. All explanations are in Slack right now.
 * The way we should name functions that interact with ipcRenderer are the following:
 * Assuming we have the notification "startMission", the function startMission() is the
 * callback to when the notification is received. The function sendStartMission() is the
 * function that sends out this notification.
 */

function sendStartMission() {
  ipcRenderer.send('post', 'startMission');
}

function sendStopMission() {
  ipcRenderer.send('post', 'stopMission');
}

function sendCompleteMission() {
  ipcRenderer.send('post', 'completeMission');
}

// We can have this or directly call function from Orchestrator.
function sendStartJob(data) {
  ipcRenderer.send('post', 'startJob', data);
}

// We can have this or directly call function from Orchestrator.
function sendPauseJob() {
  ipcRenderer.send('post', 'pauseJob');
}

// We can have this or directly call function from Orchestrator.
function sendResumeJob() {
  ipcRenderer.send('post', 'resumeJob');
}

// Orchestrator should call this function, or send the notification directly.
function sendCompleteJob() {
  ipcRenderer.send('post', 'completeJob');
}

export const mission = { sendStartMission, sendStopMission, sendCompleteMission };
export const job = {
  sendStartJob,
  sendPauseJob,
  sendResumeJob,
  sendCompleteJob,
};

/* eslint-disable no-bitwise */

/*
 * Bitshifting allows us to switch between hex and float.
 * We will use hex for all floats so these functions will be in help.
 */

function toHexString(float) {
  const getHex = i => `00${i.toString(16)}`.slice(-2);
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, float);
  return [0, 0, 0, 0].map((_, i) => getHex(view.getUint8(i))).join('');
}

function toFloat(hexString) {
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

export const floatHex = { toHexString, toFloat };

/* eslint-enable no-bitwise */

export default {
  updateVehicles,
  job,
  mission,
  floatHex,
};
