import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

import { vehicleStatuses } from '../../config/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { Vehicle, VehicleStatus } from '../../util/types'; // eslint-disable-line import/named

let fixtures: Vehicle[] = [
  {
    sid: 100,
    lat: 34.056482,
    lng: -117.823912,
    status: 'disconnected',
  },
  {
    sid: 400,
    lat: 34.053095,
    lng: -117.821970,
    status: 'disconnected',
  },
  {
    sid: 200,
    lat: 34.053509,
    lng: -117.818452,
    status: 'disconnected',
  },
];

const status = Object.keys(vehicleStatuses);

/**
 * Sends an updateVehicle notification with random vehicle fixtures.
 */
export default function updateVehicles(): void {
  const newFixtures = fixtures.map((fixture): Vehicle => ({
    ...fixture,
    lat: fixture.lat + (Math.random() / 5000) - 0.0001,
    lng: fixture.lng + (Math.random() / 5000) - 0.0001,
    status: status[Math.floor(Math.random() * status.length)] as VehicleStatus,
  }));

  fixtures = newFixtures;
  ipcRenderer.send('post', 'updateVehicles', fixtures);
}
