import PropTypes from 'prop-types';
import React from 'react';

import { startMission, stopMission, completeMission } from '../../../util/util';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default function RetrieveTarget({ theme }) {
  return (
    <div className={`retrieveTarget${theme === 'dark' ? '_dark' : ''}`}>
      <h2>Retrieve Target</h2>
      <button type="button" onClick={startMission}>Start Mission</button>
      <button type="button" onClick={stopMission}>Stop Mission</button>
      <button type="button" onClick={completeMission}>Complete Mission</button>
    </div>
  );
}

RetrieveTarget.propTypes = propTypes;
