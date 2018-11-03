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

setInterval(() => {
  const fixture = fixtures[Math.floor(Math.random() * 3)];
  // ipcRenderer.send('post', 'updateMessages', [fixture]);
}, 1000);
