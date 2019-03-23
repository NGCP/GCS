import React from 'react';

import { startMission, stopMission, completeMission } from '../../../util/util';

export default function ISRSearch() {
  return (
    <div className="mission">
      <h2>ISR Search</h2>
      <button type="button" onClick={startMission}>Start Mission</button>
      <button type="button" onClick={stopMission}>Stop Mission</button>
      <button type="button" onClick={completeMission}>Complete Mission</button>
    </div>
  );
}
