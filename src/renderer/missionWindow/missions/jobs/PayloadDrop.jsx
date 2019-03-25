import PropTypes from 'prop-types';
import React from 'react';

import Job from './Job';

const propTypes = {
  description: PropTypes.string.isRequired,
  lastJob: PropTypes.bool.isRequired,
};

export default function PayloadDrop(props) {
  return <Job {...props} />;
}

PayloadDrop.propTypes = propTypes;
