import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Log from './log/Log';
import Map from './map/Map';
import Mission from './mission/Mission';
import Vehicle from './vehicle/Vehicle';

import './global.css';
import './index.css';

class Index extends Component {
  render() {
    return (
      <div className='gridWrapper'>
        <Map/>
        <Log/>
        <Mission/>
        <Vehicle/>
      </div>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById('app'));
