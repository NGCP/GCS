/**
 * Import all fixtures in here. Feel free to enable/disable fixtures by commenting them out.
 *
 * Note we do not use fs in here since building the app will not properly link the items.
 * We shouldn't have fixtures enabled when building in the first place, but we are preventing
 * errors from happening in the first place.
 */

import * as updateMessages from './updateMessagesFixtures';
import * as updateVehicles from './updateVehiclesFixtures';

setInterval(() => {
  updateMessages.sendFixtures();
  updateVehicles.sendFixtures();
}, 1000);
