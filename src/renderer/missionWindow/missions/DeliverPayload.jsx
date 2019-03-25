import PropTypes from 'prop-types';
import React from 'react';

import Land from './jobs/Land';
import PayloadDrop from './jobs/PayloadDrop';
import Takeoff from './jobs/Takeoff';

import Mission from './Mission';

const jobs = [
  {
    name: 'takeoff',
    description: 'Takeoff',
    layout: Takeoff,
    optional: true,
    pausable: false,
  },
  {
    name: 'payloadDrop',
    description: 'Drop payload to target',
    layout: PayloadDrop,
    optional: false,
    pausable: false,
  },
  {
    name: 'land',
    description: 'Land',
    layout: Land,
    optional: false,
    pausable: false,
  },
];

const propTypes = {
  mission: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
};

export default function GetTarget({ mission }) {
  return (
    <Mission mission={mission} jobs={jobs} />
  );
}

GetTarget.propTypes = propTypes;
