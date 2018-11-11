import SerialPort from 'serialport';
import { XBeeAPI } from 'xbee-api';

import { usbport } from '../../resources/config.json';

const serialport = new SerialPort('/dev/tty.usbserial-DN018YGF', { baudRate: 57600 });
const xbee = new XBeeAPI({ api_mode: 1 });

let id;

serialport.pipe(xbee.parser);
xbee.builder.pipe(serialport);

serialport.on('open', () => {
  setInterval(() => {
    id = xbee.nextFrameId();

    xbee.builder.write({
      id: id,
      type: 0x10,
      destination64: '0013A20040917A31',
      data: 'heeee',
    });
  }, 1000);
});

xbee.parser.on('data', frame => {
  console.log(frame);
});
