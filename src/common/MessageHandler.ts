import { Event, ipcRenderer } from 'electron';

import { config } from '../static/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import DictionaryList from './struct/DictionaryList';
import { JSONMessage, Message } from '../types/messages'; // eslint-disable-line import/named
import UpdateHandler from './struct/UpdateHandler';

import xbee from './Xbee'; // eslint-disable-line import/named

export default class MessageHandler {
  /**
   * Dictionary for all messages that are being sent, sent and acknowledged, and received.
   *
   * Description of keys:
   * "outbox": will have a list of messages that are being sent, but are awaiting
   * acknowledgement.
   * "sent": will have a list of messages that have been sent.
   * "received": will have a list of messages that have been received.
   */
  private messageDictionary = new DictionaryList<JSONMessage>();

  /**
   * Handler that listens for different update events for the message handler.
   */
  private updateHandler = new UpdateHandler();

  /**
   * Message id being sent so far.
   */
  private id = 0;

  public constructor() {
    ipcRenderer.on('sendMessage', (_: Event, vehicleId: number, message: Message): void => this.sendMessage(vehicleId, message));

    ipcRenderer.on('receiveMessage', (_: Event, string: string): void => this.receiveMessage(string));
  }

  /**
   * Removes a message from the outbox.
   *
   * @param id Message id
   */
  private removeMessage(key: 'outbox' | 'sent' | 'received', id: number): JSONMessage | undefined {
    return this.messageDictionary.remove(key, (message: JSONMessage): boolean => message.id === id);
  }

  /**
   * Sends message to vehicle through Xbee.
   *
   * @param vehicleId Vehicle id to send the message to.
   * @param message Message format (note this does not have sid, tid, id, and time).
   */
  private sendMessage(vehicleId: number, message: Message): void {
    const jsonMessage: JSONMessage = {
      id: this.id,
      sid: 0,
      tid: vehicleId,
      time: Date.now(),
      ...message,
    };

    this.id += 1;

    /*
     * Adds the json message to "sent" and "outbox" on messageDictionary. If it's an ack
     * or badMessage message, it is only added to "sent", since that message does not need to be
     * acknowledged.
     */
    this.messageDictionary.push('sent', jsonMessage);

    if (jsonMessage.type === 'ack' || jsonMessage.type === 'badMessage') {
      /*
       * Will only send these types of messages once, but everything else will be sent
       * continuously until acknowleged.
       */
      xbee.sendMessage(jsonMessage);
      return;
    }

    this.messageDictionary.push('outbox', jsonMessage);

    /*
     * Keep sending the message in a certain rate (see messageSendRate).
     * This will end when the message is acknowledged (the updateHandler will clear
     * the interval).
     */
    const expiry = setInterval((): void => {
      xbee.sendMessage(jsonMessage);
    }, config.messageSendRate * 1000);

    /*
     * Removes json message from "outbox" when an ack message is received from the vehicle.
     * If no ack message is received within a certain amount of time (vehicleDisconnectionTime),
     * then the GCS will disconnect itself from the vehicle.
     */
    this.updateHandler.addHandler<void>(`${jsonMessage.tid}#${jsonMessage.id}`, (): boolean => {
      clearInterval(expiry);
      this.removeMessage('outbox', jsonMessage.id);
      return true;
    }, {
      time: config.vehicleDisconnectionTime * 1000,
      callback: (): void => {
        this.removeMessage('outbox', jsonMessage.id);
        ipcRenderer.send('post', 'deactivateVehicle', vehicleId);
      },
    });
  }

  /**
   * Acknowledge a message received.
   *
   * @param message The message to acknowledge.
   * TODO: remove ? from message
   */
  private acknowledge(message?: JSONMessage): void { // eslint-disable-line
    if (!message) return; // TODO: remove this line
    this.sendMessage(message.sid, {
      type: 'ack',
      ackid: message.id,
    });
  }

  /**
   * Processes a message that was received.
   *
   * @param string The raw string. Either can contain the message (a valid JSON) or some
   * random stuff.
   */
  private receiveMessage(string: string): void {
    if (string === 'asdffdasfdas') this.acknowledge(); // TODO: remove this line
  }
}
