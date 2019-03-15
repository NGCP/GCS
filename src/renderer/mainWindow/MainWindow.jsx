import PropTypes from 'prop-types';
import React from 'react';

import LogContainer from './log/LogContainer';
import MapContainer from './map/MapContainer';
import MissionContainer from './mission/MissionContainer';
import VehicleContainer from './vehicle/VehicleContainer';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default function MainWindow({ theme }) {
  return (
    <div className={`gridWrapper${theme === 'dark' ? '_dark' : ''}`}>
      <MapContainer theme={theme} />
      <LogContainer theme={theme} />
      <MissionContainer theme={theme} />
      <VehicleContainer theme={theme} />
    </div>
  );
}

MainWindow.propTypes = propTypes;
