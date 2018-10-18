import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import LogContainer from './log/Log.js';
import MapContainer from './map/Map.js';
import MissionContainer from './mission/Mission.js';
import VehicleContainer from './vehicle/Vehicle.js';

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

ReactDOM.render(<Index />, document.getElementById('app'));
