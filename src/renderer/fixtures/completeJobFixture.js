import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

export default function completeJob() {
  // Sends completeJob notification after receiving startJob notification.
  ipcRenderer.on('startJob', () => {
    setTimeout(() => {
      ipcRenderer.send('post', 'completeJob');
    }, 5000);
  });
}
