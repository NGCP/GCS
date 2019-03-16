import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import { vehicleStatuses } from '../../../resources/index';

let fixtures = [
  {
    sid: 100,
    lat: 34.056482,
    lng: -117.823912,
  },
  {
    sid: 400,
    lat: 34.053095,
    lng: -117.821970,
  },
  {
    sid: 200,
    lat: 34.053509,
    lng: -117.818452,
  },
];

const status = Object.keys(vehicleStatuses);

export function sendFixtures() {
  const newFixtures = fixtures.map(fixture => ({
    ...fixture,
    // lat: fixture.lat + (Math.random() / 5000) - 0.0001,
    lng: fixture.lng + (Math.random() / 5000) - 0.0001,
    status: status[Math.floor(Math.random() * status.length)],
  }));

  fixtures = newFixtures;
  ipcRenderer.send('post', 'updateVehicles', fixtures);
}

export default { sendFixtures };
