import { ipcRenderer } from 'electron';
import net from 'net';

import { port, host } from '../../resources/config.json';

const client = net.connect(port, host);

client.on('connect', () => {});

client.on('close', () => {});

client.on('error', () => {});

client.on('data', handleMessage);

function handleMessage(message) {}
