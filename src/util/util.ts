import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import { Component } from 'react';

import {
  vehicleInfos as vehicleInfosConfig, vehicleStatuses as vehicleStatusesConfig,
} from '../config/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import {
  MessageType, // eslint-disable-line import/named
  Vehicle,
  VehicleInfoSignature,
  VehicleStatusSignature,
  VehicleUI,
} from './types';

const vehicleInfos: VehicleInfoSignature = vehicleInfosConfig;
const vehicleStatuses: VehicleStatusSignature = vehicleStatusesConfig;

// Called by map container and vehicle container to update vehicles being shown.
export function updateVehicles(
  component: Component<{}, { vehicles: { [sid: string]: VehicleUI } }>, vehicles: Vehicle[],
): void {
  const { vehicles: thisVehicles } = component.state;
  const currentVehicles = thisVehicles;

  vehicles.forEach((vehicle) => {
    currentVehicles[vehicle.sid] = {
      ...vehicle,
      ...vehicleInfos[vehicle.sid],
      status: vehicleStatuses[vehicle.status] as { type: MessageType; message: string },
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

function sendStartMission(): void {
  ipcRenderer.send('post', 'startMission');
}

function sendStopMission(): void {
  ipcRenderer.send('post', 'stopMission');
}

function sendCompleteMission(index: number): void {
  ipcRenderer.send('post', 'completeMission', index);
}

export const mission = {
  sendStartMission,
  sendStopMission,
  sendCompleteMission,
};

// We can have this or directly call function from Orchestrator.
function sendStartJob(data: { jobType: string; missionInfo: {} }): void {
  ipcRenderer.send('post', 'startJob', data);
}

// We can have this or directly call function from Orchestrator.
function sendPauseJob(): void {
  ipcRenderer.send('post', 'pauseJob');
}

// We can have this or directly call function from Orchestrator.
function sendResumeJob(): void {
  ipcRenderer.send('post', 'resumeJob');
}

// Orchestrator should call this function, or send the notification directly.
function sendCompleteJob(): void {
  ipcRenderer.send('post', 'completeJob');
}

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

function toHexString(float: number): string {
  const getHex = (i: number): string => `00${i.toString(16)}`.slice(-2);

  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, float);
  return [0, 0, 0, 0].map((_, i) => getHex(view.getUint8(i))).join('');
}

function toFloat(hexString: string): number {
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
