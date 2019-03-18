import PropTypes from 'prop-types';
import React from 'react';

import { startMission, stopMission, completeMission } from '../../../util/util';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default function DeliverTarget({ theme }) {
  return (
    <div className={`deliverTarget${theme === 'dark' ? '_dark' : ''}`}>
      <h2>Deliver Target</h2>
      <button type="button" onClick={startMission}>Start Mission</button>
      <button type="button" onClick={stopMission}>Stop Mission</button>
      <button type="button" onClick={completeMission}>Complete Mission</button>
    </div>
  );
}

DeliverTarget.propTypes = propTypes;
