import PropTypes from 'prop-types';
import React from 'react';

import DetailedSearch from './jobs/DetailedSearch';
import Land from './jobs/Land';
import ISRSearch from './jobs/ISRSearch';
import QuickScan from './jobs/QuickScan';
import Takeoff from './jobs/Takeoff';

import Mission from './Mission';

const jobs = [
  {
    name: 'takeoff',
    description: 'Takeoff',
    layout: Takeoff,
    optional: false,
    pausable: false,
  },
  {
    name: 'isrSearch',
    description: 'ISR Search',
    layout: ISRSearch,
    optional: false,
    pausable: false,
  },
  {
    name: 'quickScan',
    description: 'Quick Scan',
    layout: QuickScan,
    optional: false,
    pausable: true,
  },
  {
    name: 'detailedSearch',
    description: 'Detailed Search',
    layout: DetailedSearch,
    optional: false,
    pausable: true,
  },
  {
    name: 'land',
    description: 'Land',
    layout: Land,
    optional: true,
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