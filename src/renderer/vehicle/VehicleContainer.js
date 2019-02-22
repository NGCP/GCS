import PropTypes from 'prop-types';
import React, { Component } from 'react';

import VehicleTable from './VehicleTable.js';

import './vehicle.css';

export default class VehicleContainer extends Component {
  state = {
    xbeeConnected: false,
  };

  static propTypes = {
    theme: PropTypes.string,
  };

  render() {
    return (
      <div className={`vehicleContainer container${this.props.theme === 'dark' ? '_dark' : ''}`}>
        {<VehicleTable />}
      </div>
    );
  }
}
