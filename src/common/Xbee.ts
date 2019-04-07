import { ipcRenderer } from 'electron';
import SerialPort from 'serialport';
import { constants as C, Frame, XBeeAPI } from 'xbee-api';

import { VehicleInfo, vehicleInfos } from '../static/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { Message } from './struct/Messages'; // eslint-disable-line import/named

/*
 * TODO: Add a feature with Vehicle container to change this dynamically and reconnect.
 * With that feature, no need to have this at all in config.
 */
const port: string | undefined = 'COM5';

const serialport = new SerialPort(port, { baudRate: 57600 }, (err): void => {
  if (err) {
    ipcRenderer.send('post', 'updateMessages', {
      type: 'failure',
      message: `Failed to initialize Xbee: ${err.message}`,
    });
  }
});

const xbeeAPI = new XBeeAPI();

/**
 * Sends a message through the Xbee to a given vehicle. Will not execute if Xbee port
 * is not open.
 *
 * @param id The unique message id.
 * @param vehicleId The vehicle id to send this message to.
 * @param message The message to send to the vehicle.
 */
export function sendMessage(id: number, vehicleId: number, message: Message): void {
  // Cannot send messages if port is not open.
  if (!serialport.isOpen) return;

  // Check to ensure the vehicle we are sending this to is valid.
  const vehicleInfoObject = vehicleInfos[vehicleId];
  if (!vehicleInfoObject) {
    ipcRenderer.send('post', 'updateMessages', {
      type: 'failure',
      message: `Failed to send message to vehicle with id ${vehicleId}`,
    });
    return;
  }

  const { macAddress } = vehicleInfoObject as VehicleInfo;

  xbeeAPI.builder.write({
    type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_STATUS,
    destination64: macAddress,
    data: {
      id,
      sid: 0,
      tid: vehicleId,
      time: Date.now(),
      ...message,
    },
  });
}

export function openConnection(): boolean {
  if (serialport.isOpen) return false;
  serialport.open();
  return true;
}

export function closeConnection(): boolean {
  if (!serialport.isOpen) return false;
  serialport.close();
  return true;
}

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport as NodeJS.WritableStream);

serialport.on('open', (): void => {
  ipcRenderer.send('post', 'updateMessages', {
    type: 'success',
    message: 'Xbee connection has opened',
  });
});

serialport.on('error', (error: Error): void => {
  ipcRenderer.send('post', 'updateMessages', {
    type: 'failure',
    message: `An error has occured with the Xbee connection: ${error.message}`,
  });
});

serialport.on('close', (): void => {
  ipcRenderer.send('post', 'updateMessages', {
    type: 'failure',
    message: 'Xbee connection has closed',
  });
});

xbeeAPI.parser.on('data', (frame: Frame): void => {
  if (frame.type !== C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET || !frame.data) return;

  // Sends notification to process the message (either a valid JSON string or not).
  ipcRenderer.send('post', 'processMessage', frame.data.toString());
});

export default {
  closeConnection,
  openConnection,
  sendMessage,
};
