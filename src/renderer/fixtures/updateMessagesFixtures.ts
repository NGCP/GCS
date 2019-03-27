import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { MessageType } from '../../util/types'; // eslint-disable-line import/named

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

export default function updateMessages(): void {
  const fixture = fixtures[Math.floor(Math.random() * fixtures.length)];
  ipcRenderer.send('post', 'updateMessages', [fixture]);
}
