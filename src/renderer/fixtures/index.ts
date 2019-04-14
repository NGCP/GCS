// Import all fixtures in here. Feel free to enable/disable fixtures by commenting them out.

import updateMessages from './updateMessagesFixtures';
import updateVehicles from './updateVehiclesFixtures';

setInterval((): void => {
  updateMessages();
  updateVehicles();
}, 1000);
