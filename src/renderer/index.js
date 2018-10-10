import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Log from './log/Log.js';
import Map from './map/Map.js';
import Mission from './mission/Mission.js';
import Vehicle from './vehicle/Vehicle.js';

import './global.css';
import './index.css';

class Index extends Component {
  render() {
    return (
      <div className='gridWrapper'>
        <Map />
        <Log />
        <Mission />
        <Vehicle />
      </div>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById('app'));
