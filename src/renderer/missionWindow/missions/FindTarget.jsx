import React from 'react';

import { mission } from '../../../util/util';

export default function FindTarget() {
  return (
    <div className="mission">
      <h2>Find the target</h2>
      <button type="button" onClick={mission.startMission}>Start Mission</button>
      <button type="button" onClick={mission.stopMission}>Stop Mission</button>
      <button type="button" onClick={mission.completeMission}>Complete Mission</button>
    </div>
  );
}
