import { ipcRenderer } from 'electron';

const testData = true;

function testUpdateMarkers() {
  // data to test the map while backend is building
  // data types can always change
  const fixtures = [
    {
      id: 1,
      latitude: 34.055869,
      longitude: -117.819964,
      type: 'uav1',
      name: 'ISR',
    },
    {
      id: 2,
      latitude: 34.045869,
      longitude: -117.829964,
      type: 'uav2',
      name: 'Multirotor',
    },
    {
      id: 3,
      latitude: 34.054869,
      longitude: -117.919964,
      type: 'ugv1',
      name: 'UGV',
    },
  ];

  ipcRenderer.send('post', 'updateMarkers', fixtures);
}

if (testData) {
  setTimeout(() => {
    testUpdateMarkers();
  }, 3000);
}
