import { Event, ipcRenderer } from 'electron';

import './Xbee';

ipcRenderer.on('processMessage', (_: Event, messageString: string): void => {
  console.log(messageString);
});
