import msgpack from 'msgpack-lite';
import SerialPort from 'serialport';
import { constants as C, Frame, XBeeAPI } from 'xbee-api';

import { VehicleInfo, vehicleConfig } from '../static/index';

import { JSONMessage } from '../types/message';

import ipc from '../util/ipc';

// TODO: Add a feature with Vehicle container to change this dynamically and reconnect.
const port: string | undefined = '/dev/tty.SLAB_USBtoUART';

const serialport = new SerialPort(port, { baudRate: 57600 }, (error): void => {
  if (error) {
    ipc.postLogMessages({
      type: 'failure',
      message: `Failed to initialize Xbee: ${error.message}`,
    });
  }
});

const xbeeAPI = new XBeeAPI();

/**
 * Sends a message through the Xbee to a given vehicle. Will not execute if Xbee port
 * is not open.
 *
 * @param vehicleId The vehicle id to send this message to.
 * @param message The message to send to the vehicle.
 */
function sendMessage(message: JSONMessage): void {
  if (!serialport.isOpen) return;

  const vehicleInfoObject = vehicleConfig.vehicleInfos[message.tid];
  if (!vehicleInfoObject) {
    ipc.postLogMessages({
      type: 'failure',
      message: `Failed to send message to vehicle with id ${message.tid}`,
    });
    return;
  }

  const { macAddress } = vehicleInfoObject as VehicleInfo;

  xbeeAPI.builder.write({
    type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
    destination64: macAddress,
    data: msgpack.encode(message),
  });
}

// TODO: Open connection from MessageHandler.
function openConnection(): boolean {
  if (serialport.isOpen) return false;
  serialport.open();
  return true;
}

// TODO: Close connection from MessageHandler.
function closeConnection(): boolean {
  if (!serialport.isOpen) return false;
  serialport.close();
  return true;
}

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport as NodeJS.WritableStream);

serialport.on('open', (): void => {
  ipc.postLogMessages({
    type: 'success',
    message: 'Xbee connection has opened',
  });
});

serialport.on('error', (error: Error): void => {
  ipc.postLogMessages({
    type: 'failure',
    message: `An error has occured with the Xbee connection: ${error.message}`,
  });
});

serialport.on('close', (): void => {
  ipc.postLogMessages({
    type: 'failure',
    message: 'Xbee connection has closed',
  });
});

xbeeAPI.parser.on('data', (frame: Frame): void => {
  if (frame.type !== C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET || !frame.data) return;
  ipc.postReceiveMessage(msgpack.decode(frame.data));
});

export default {
  closeConnection,
  openConnection,
  sendMessage,
};
