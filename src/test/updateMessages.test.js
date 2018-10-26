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
  // until console log is fixed, I'm turning this off for anyone else
  // not working on it since this is annoying lol
  // ipcRenderer.send('post', 'updateMessages', [fixture]);
}, 1000);
