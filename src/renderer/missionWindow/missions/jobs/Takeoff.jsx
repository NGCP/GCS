import PropTypes from 'prop-types';
import React from 'react';

import Job from './Job';

const propTypes = {
  job: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    pausable: PropTypes.bool.isRequired,
  }).isRequired,
  lastJob: PropTypes.bool.isRequired,
};

export default function Takeoff(props) {
  return <Job {...props} />;
}

Takeoff.propTypes = propTypes;
