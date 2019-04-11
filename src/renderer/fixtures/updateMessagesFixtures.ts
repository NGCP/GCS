import { ipcRenderer } from 'electron';

import { MessageType } from '../../types/types';

const fixtures: { type?: MessageType; message: string }[] = [
  {
    type: 'failure',
    message: 'Test failure message',
  },
  {
    type: 'success',
    message: 'Test success message',
  },
  {
    message: 'Random message',
  },
  {
    type: 'progress',
    message: 'Test progress message',
  },
];

/**
 * Sends an updateMessages notification with random message fixtures.
 */
export default function updateMessages(): void {
  const fixture = fixtures[Math.floor(Math.random() * fixtures.length)];
  ipcRenderer.send('post', 'updateMessages', fixture);
}
