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

export default {
  updateVehicles, startMission, stopMission, completeMission,
};
