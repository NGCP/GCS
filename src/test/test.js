import { ipcRenderer } from 'electron';

// run any functions you want to run to test the program
testUpdateVehicles();

/** Tests the 'updateVehicles' notification */
function testUpdateVehicles() {
  const fixtures = [
    {
      id: 1,
      latitude: 34.056482,
      longitude: -117.823912,
      type: 'uav',
      name: 'Valiant',
      status: 'Connected',
    },
    {
      id: 2,
      latitude: 34.053095,
      longitude: -117.821970,
      type: 'uav',
      name: 'Multirotor',
      status: 'Connected',
    },
    {
      id: 3,
      latitude: 34.053509,
      longitude: -117.818452,
      type: 'ugv',
      name: 'UGV',
      status: 'Connected',
    },
  ];

  ipcRenderer.send('post', 'updateVehicles', fixtures);
}
