import PropTypes from 'prop-types';
import React, { Component } from 'react';

import VehicleTable from './VehicleTable.js';

import './vehicle.css';

export default class VehicleContainer extends Component {
  static propTypes = {
    theme: PropTypes.oneOf(['light', 'dark']).isRequired,
  };

  state = {
    xbeeConnected: false,
  };

  render() {
    return (
      <div className={`vehicleContainer container${this.props.theme === 'dark' ? '_dark' : ''}`}>
        {<VehicleTable theme={this.props.theme} />}
      </div>
    );
  }
}
