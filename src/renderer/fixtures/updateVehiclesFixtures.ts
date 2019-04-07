import { ipcRenderer } from 'electron';

import Vehicle, { VehicleOptions } from '../../common/struct/Vehicle';

import { locationConfig, vehicleConfig } from '../../static/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { VehicleObject, VehicleStatus } from '../../types/types'; // eslint-disable-line import/named

const fixtureOptions: VehicleOptions[] = [
  {
    sid: 100,
    jobs: ['takeoff', 'loiter', 'isrSearch', 'payloadDrop', 'land'],
  },
  {
    sid: 200,
    jobs: ['retrieveTarget', 'deliverTarget'],
  },
  {
    sid: 300,
    jobs: ['retrieveTarget'],
  },
  {
    sid: 400,
    jobs: ['quickScan'],
  },
  {
    sid: 401,
    jobs: ['detailedSearch'],
  },
  {
    sid: 500,
    jobs: [],
  },
  {
    sid: 600,
    jobs: [],
  },
];

const status = Object.keys(vehicleConfig.vehicleStatuses);

const vehicles = fixtureOptions.map((options): Vehicle => new Vehicle(options));
vehicles.forEach((vehicle): void => {
  vehicle.getUpdateEventHandler().events({
    lat: locationConfig.startLocation.lat + (Math.random() / 1000) - 0.0005,
    lng: locationConfig.startLocation.lng + (Math.random() / 1000) - 0.0005,
  });
});

const fixtures: VehicleObject[] = [];

/**
 * Sends an updateVehicle notification with random vehicle fixtures.
 */
export default function updateVehicles(): void {
  for (let i = 0; i < vehicles.length; i += 1) {
    vehicles[i].getUpdateEventHandler().events({
      lat: vehicles[i].getLat() + (Math.random() / 5000) - 0.0001,
      lng: vehicles[i].getLng() + (Math.random() / 5000) - 0.0001,
      status: status[Math.floor(Math.random() * status.length)] as VehicleStatus,
    });

    fixtures[i] = vehicles[i].toPlainObject();
  }

  ipcRenderer.send('post', 'updateVehicles', ...fixtures);
}
