import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

const fixtures = [
  {
    type: 'failure',
    message: 'swb fnijnfineifnioen fineig rejnlj qvjevefijn eiofqoifn jnl,a dnv kjveqjnffn jalvlkavhuevenfije eve ve j fjnfuiefn ijcads fhuf a',
  },
  {
    type: 'failure',
    message: 'Test failure message',
  },
  {
    type: 'success',
    message: 'zxvdfn uvoewnfnekjnan oieunqo nfrcvdfsvnad dfionfkldasklaj nio niqdnc djacnkl adsniojnjkla dvlkjvienvio anklvdnkven inkv adnklv ndanvoi',
  },
  {
    type: 'success',
    message: 'Test success message',
  },
  {
    message: 'Random message',
  },
];

export function sendFixtures() {
  const fixture = fixtures[Math.floor(Math.random() * 5)];
  ipcRenderer.send('post', 'updateMessages', [fixture]);
}

export default { sendFixtures };
