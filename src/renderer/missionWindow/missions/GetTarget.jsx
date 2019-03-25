import PropTypes from 'prop-types';
import React from 'react';

import DeliverTarget from './jobs/DeliverTarget';
import RetrieveTarget from './jobs/RetrieveTarget';

import Mission from './Mission';

const jobs = [
  {
    name: 'retrieveTarget',
    description: 'Retrieve the target',
    layout: RetrieveTarget,
  },
  {
    name: 'deliverTarget',
    description: 'Deliver the target back to base',
    layout: DeliverTarget,
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
