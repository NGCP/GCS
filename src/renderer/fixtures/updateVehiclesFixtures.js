import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

let fixtures = [
  {
    id: 1,
    latitude: 34.056482,
    longitude: -117.823912,
    type: 'uav',
    name: 'Valiant',
  },
  {
    id: 2,
    latitude: 34.053095,
    longitude: -117.821970,
    type: 'uav',
    name: 'Multirotor',
  },
  {
    id: 3,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 4,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 5,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 6,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 7,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 8,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 9,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 10,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 11,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 12,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 13,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
  {
    id: 14,
    latitude: 34.053509,
    longitude: -117.818452,
    type: 'ugv',
    name: 'UGV',
  },
];
const status = [
  {
    type: 'success',
    message: 'Connected',
  },
  {
    type: 'failure',
    message: 'Disconnected',
  },
];

setInterval(() => {
  const newFixtures = fixtures.map(fixture => ({
    ...fixture,
    latitude: fixture.latitude + (Math.random() / 5000) - 0.0001,
    longitude: fixture.longitude + (Math.random() / 5000) - 0.0001,
    status: status[Math.floor(Math.random() * 2)],
  }));

  fixtures = newFixtures;
  ipcRenderer.send('post', 'updateVehicles', fixtures);
}, 1000);
