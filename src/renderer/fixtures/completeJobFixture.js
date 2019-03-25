import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

export default function completeJob() {
  ipcRenderer.send('post', 'completeJob');
}
