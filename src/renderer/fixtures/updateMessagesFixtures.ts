import { ipcRenderer } from 'electron';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { MessageType } from '../../types/types'; // eslint-disable-line import/named

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
