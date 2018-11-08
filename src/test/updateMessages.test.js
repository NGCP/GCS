import { ipcRenderer } from 'electron';

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
];

for (let i = 0; i < 14; i++) {
  const fixture = fixtures[Math.floor(Math.random() * 3)];
  ipcRenderer.send('post', 'updateMessages', [fixture]);
}
