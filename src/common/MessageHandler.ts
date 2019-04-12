// Do not interact with this file outside the Orchestrator class.

import { Event, ipcRenderer } from 'electron';

import { config } from '../static/index';
import {
  AcknowledgementMessage,
  messageTypeGuard,
  JSONMessage,
  Message,
} from '../types/messages';
import { isJSON } from '../util/util';

import DictionaryList from './struct/DictionaryList';
import UpdateHandler from './struct/UpdateHandler';

import xbee from './Xbee';

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
   * ID of message being sent.
   */
  private id = 0;

  /**
   * Map of last message ID received from specific vehicle.
   */
  private receivedMessageId: { [key: string]: number | undefined } = {};

  public constructor() {
    ipcRenderer.on('sendMessage', (_: Event, vehicleId: number, message: Message): void => this.sendMessage(vehicleId, message));

    ipcRenderer.on('receiveMessage', (_: Event, text: string): void => this.receiveMessage(text));
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
    const expiry = setInterval(
      (): void => xbee.sendMessage(jsonMessage), config.messageSendRate * 1000,
    );

    /*
     * Removes respective message from "outbox" when an ack message is received
     * and value passed is true.
     *
     * If no ack message is received within a certain amount of time (vehicleDisconnectionTime),
     * then the GCS will disconnect itself from the vehicle.
     */

    const hash = `${jsonMessage.tid}#${jsonMessage.id}`;

    this.updateHandler.addHandler<boolean>(hash, (value: boolean): boolean => {
      clearInterval(expiry);
      this.removeMessage('outbox', jsonMessage.id);
      return value;
    }, {
      time: config.vehicleDisconnectionTime * 1000,
      callback: (): void => {
        this.removeMessage('outbox', jsonMessage.id);
        ipcRenderer.send('post', 'deactivateVehicle', vehicleId);
      },
    });
  }

  /**
   * Send a bad message.
   *
   * @param jsonMessage The bad message (needs to have at least an sid field).
   * @param error Error message.
   */
  private sendBadMessage(jsonMessage: JSONMessage, error?: string): void {
    this.sendMessage(jsonMessage.sid, {
      type: 'badMessage',
      error,
    });
  }

  /**
   * Processes a message that was received.
   *
   * @param string The raw string. Either can contain the message (a valid JSON) or some
   * random stuff.
   */
  private receiveMessage(text: string): void {
    // Filter out text that are not valid json.
    if (!isJSON(text)) {
      ipcRenderer.send('post', 'updateMessages', {
        message: `Received text from Xbee that is not a JSON, could not send bad message to sender ${text}`,
      });
      return;
    }

    // Filter out json that are not valid messages.
    const json = JSON.parse(text);
    if (!messageTypeGuard.isJSONMessage(json)) {
      if (json.sid) {
        this.sendBadMessage(json, 'Invalid message, does not meet requirements for a message');
      } else {
        ipcRenderer.send('post', 'updateMessages', {
          message: `Received JSON from Xbee that is not a valid message, could not send bad message to sender: ${text}`,
        });
      }
    }

    const jsonMessage = json as JSONMessage;

    /*
     * Update the last message id received from the vehicle or discard message completely.
     * This is to be able to properly acknowledge a message. See the note on the following:
     *
     * https://ground-control-station.readthedocs.io/en/latest/communications/other-messages.html#acknowledgement-message
     */
    if (!this.receivedMessageId[jsonMessage.sid]
      || this.receivedMessageId[jsonMessage.sid] as number < jsonMessage.id
    ) {
      /*
       * If this statement passes, it means that GCS is recieving a completely new message
       * from the vehicle.
       */
      this.receivedMessageId[jsonMessage.sid] = jsonMessage.id;
      this.messageDictionary.push('received', jsonMessage);
    } else {
      // If the statement fails, it means that the GCS is receiving an old message. Discard it.
      return;
    }

    /*
     * Handles acknowledgement messages from any source (even vehicles not connected).
     * DO NOT ACKNOWLEDGE.
     * Stops sending the message that the ack message has ascknowledged.
     */
    if (messageTypeGuard.isAcknowledgementMessage(jsonMessage)) {
      const { ackid } = jsonMessage as AcknowledgementMessage;

      const hash = `${jsonMessage.sid}#${ackid}`;
      this.updateHandler.event(hash, true);
      return;
    }

    /*
     * All messages that get here will be forwarded to the Orchestrator and will
     * be acknowledged there, because the MessageHandler does not know if the message
     * comes from a connected vehicle or not. If the vehicle is not connected, the
     * Orchestrator will simply ignore the message.
     */
    if (messageTypeGuard.isConnectMessage(jsonMessage)) {
      ipcRenderer.send('post', 'handleConnectMessage', jsonMessage);
      return;
    }

    if (messageTypeGuard.isCompleteMessage(jsonMessage)) {
      ipcRenderer.send('post', 'handleCompleteMessage', jsonMessage);
      return;
    }

    if (messageTypeGuard.isPOIMessage(jsonMessage)) {
      ipcRenderer.send('post', 'handlePOIMessage', jsonMessage);
      return;
    }

    if (messageTypeGuard.isUpdateMessage(jsonMessage)) {
      ipcRenderer.send('post', 'handleUpdateMessage', jsonMessage);
      return;
    }

    // Exception is this message. DO NOT ACKNOWLEDGE.
    if (messageTypeGuard.isBadMessageMessage(jsonMessage)) {
      ipcRenderer.send('post', 'handleBadMessage', jsonMessage);

      /*
       * ipcRenderer.send('post', 'updateMessages', {
       *   type: 'failure',
       *   message: `Received bad message from ${name}: ${error || 'No error message
       * was specified'}`,
       * });
       */
      return;
    }
    /*
     * Any message that reaches here is a message (has a valid type, id, sid, tid, and time)
     * but does not have valid properties, or is a message GCS should not receive from vehicles
     * (e.g. GCS should not receive a "start" message from a vehicle).
     */
    this.sendBadMessage(jsonMessage, `Message of type ${jsonMessage.type} is invalid`);
  }
}
