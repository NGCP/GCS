import React from 'react';

import { mission } from '../../../util/util';

export default function DeliverPayload() {
  return (
    <div className="mission">
      <h2>Deliver payload to target</h2>
      <button type="button" onClick={mission.sendStartMission}>Start Mission</button>
      <button type="button" onClick={mission.sendStopMission}>Stop Mission</button>
      <button type="button" onClick={mission.sendCompleteMission}>Complete Mission</button>
    </div>
  );
}
