import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { fixtures, geolocation } from '../../resources/index.js';
import LogContainer from './log/LogContainer.js';
import MapContainer from './map/MapContainer.js';
import MissionContainer from './mission/MissionContainer.js';
import VehicleContainer from './vehicle/VehicleContainer.js';

import 'leaflet/dist/leaflet.css';
import 'react-virtualized/styles.css';
import './global.css';
import './index.css';

class Index extends Component {
  render() {
    return (
      <div className='gridWrapper'>
        <MapContainer />
        <LogContainer />
        <MissionContainer />
        <VehicleContainer />
      </div>
    );
  }
}

/*
 * Renders Index then...
 *
 * If geolocation is true, the program will trigger a geolocation request to set map center to user location
 * If devMode is true, the program will run all tests (all located in "../test")
 */
ReactDOM.render(<Index />, document.getElementById('app'), () => {
  if (geolocation) ipcRenderer.send('post', 'setMapToUserLocation');

  if (fixtures) require('./fixtures/index.js');
});
