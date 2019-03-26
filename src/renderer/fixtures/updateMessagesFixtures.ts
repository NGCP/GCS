import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

const fixtures = [
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
