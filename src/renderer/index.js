import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import LogContainer from './log/Log.js';
import MapContainer from './map/Map.js';
import MissionContainer from './mission/Mission.js';
import VehicleContainer from './vehicle/Vehicle.js';
import { devMode, geolocation } from '../../resources/config.json';

import '../util/xbee.js';

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

  if (devMode) {
    for (const file of fs.readdirSync(path.resolve(__dirname, '..', 'test'))) {
      require(`../test/${file}`);
    }
  }
});
