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

const sendMe = [];
for (let i = 0; i < 14; i++) {
  sendMe.push(fixtures[Math.floor(Math.random() * 3)]);
}

ipcRenderer.send('post', 'updateMessages', sendMe);
