import { locationConfig } from '../../static/index';

import ipc from '../../util/ipc';

const waypoint = {
  name: 'Test Marker',
  location: locationConfig.startLocation,
};

ipc.postUpdateWaypoint(true, waypoint);
