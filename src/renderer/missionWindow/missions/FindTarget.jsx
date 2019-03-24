import PropTypes from 'prop-types';
import React from 'react';

import { mission } from '../../../util/util';

export default function FindTarget({ index }) {
  return (
    <div className="mission">
      <h2>Find the target</h2>
      <button type="button" onClick={mission.sendStartMission}>Start Mission</button>
      <button type="button" onClick={mission.sendStopMission}>Stop Mission</button>
      <button type="button" onClick={() => mission.sendCompleteMission(index)}>Complete Mission</button>
    </div>
  );
}

FindTarget.propTypes = {
  index: PropTypes.number.isRequired,
};
