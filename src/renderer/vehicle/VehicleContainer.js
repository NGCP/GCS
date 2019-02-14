import React, { Component } from 'react';

import VehicleTable from './VehicleTable.js';

import './vehicle.css';

export default class VehicleContainer extends Component {
  state = {
    xbeeConnected: false,
  };

  render() {
    return (
      <div className='vehicleContainer container'>
        {<VehicleTable />}
      </div>
    );
  }
}
