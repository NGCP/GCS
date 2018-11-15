import SerialPort from 'serialport';
import { costants as C, XBeeAPI } from 'xbee-api';

const port = new SerialPort('/dev/tty.usbserial-ddd', { baudRate: 57600 });
const xbeeAPI = new XBeeAPI({ api_mode: 1 });

port.write('main screen turn on', err => {
  if (err) {
    console.error('error on write', err.message);
  } else {
    console.log('message written');
  }
});

port.on('error', err => {
  console.error('Error:', err.message);
});

/**
let id;

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport.on('open', () => {
  setInterval(() => {
    id = xbeeAPI.nextFrameId();

    xbeeAPI.builder.write({
      id: id,
      type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
      destination64: '0013A20040917A31',
      data: 'TxData0A',
    });
  }, 1000);
});

xbeeAPI.parser.on('data', console.log);
*/
