import PropTypes from 'prop-types';
import React from 'react';

import { job, mission } from '../../../util/util';

export default function DeliverPayload({ index }) {
  return (
    <div className="mission">
      <h2>Deliver payload to target</h2>
      <button type="button" onClick={mission.sendStartMission}>Start Mission</button>
      <button type="button" onClick={job.sendPauseJob}>Pause Job</button>
      <button type="button" onClick={job.sendResumeJob}>Resume Job</button>
      <button type="button" onClick={mission.sendStopMission}>Stop Mission</button>
      <button type="button" onClick={() => mission.sendCompleteMission(index)}>Complete Mission</button>
    </div>
  );
}

DeliverPayload.propTypes = {
  index: PropTypes.number.isRequired,
};
