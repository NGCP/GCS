import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import VehicleTable from './VehicleTable';

import './vehicle.css';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default class VehicleContainer extends PureComponent {
  render() {
    const { theme } = this.props;

    return (
      <div className={`vehicleContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <VehicleTable theme={theme} />
      </div>
    );
  }
}

VehicleContainer.propTypes = propTypes;
