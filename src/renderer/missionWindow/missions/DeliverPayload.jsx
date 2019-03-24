import React from 'react';

import { mission } from '../../../util/util';

export default function DeliverPayload() {
  return (
    <div className="mission">
      <h2>Deliver payload to target</h2>
      <button type="button" onClick={mission.startMission}>Start Mission</button>
      <button type="button" onClick={mission.stopMission}>Stop Mission</button>
      <button type="button" onClick={mission.completeMission}>Complete Mission</button>
    </div>
  );
}
