import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import VehicleTable from './VehicleTable';

import { updateVehicles } from '../../../util/util';

import './vehicle.css';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default class VehicleContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vehicles: {},
    };
  }

  componentDidMount() {
    ipcRenderer.on('updateVehicles', (event, data) => updateVehicles(this, data));
  }

  render() {
    const { theme } = this.props;
    const { vehicles } = this.state;

    return (
      <div className={`vehicleContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <VehicleTable theme={theme} vehicles={vehicles} />
      </div>
    );
  }
}

VehicleContainer.propTypes = propTypes;
