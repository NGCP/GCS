import { Event, ipcRenderer } from 'electron';

import { config, vehicleConfig } from '../static/index';

import {
  AcknowledgementMessage,
  messageTypeGuard,
  JSONMessage,
  Message,
} from '../types/messages';

import ipc from '../util/ipc';
import { isJSON } from '../util/util';

import DictionaryList from './struct/DictionaryList';
import UpdateHandler from './struct/UpdateHandler';

import xbee from './Xbee';

class MessageHandler {
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
   * Handler that listens for different update events.
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
    ipcRenderer.on('stopSendingMessages', this.stopSendingMessages);
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

    this.messageDictionary.push('sent', jsonMessage);

    if (messageTypeGuard.isAcknowledgementMessage(message)
      || messageTypeGuard.isBadMessage(message)) {
      xbee.sendMessage(jsonMessage);
      return;
    }

    this.messageDictionary.push('outbox', jsonMessage);

    const expiry = setInterval(
      (): void => xbee.sendMessage(jsonMessage),
      config.messageSendRate * 1000,
    );

    // Keep track of message, to stop sending it once acknowledged.
    const hash = `${jsonMessage.tid}#${jsonMessage.id}`;
    this.updateHandler.addHandler<boolean>(hash, (): boolean => {
      clearInterval(expiry);
      this.removeMessage('outbox', jsonMessage.id);
      return true;
    }, {
      time: config.vehicleDisconnectionTime * 1000,
      callback: (): void => {
        clearInterval(expiry);
        this.removeMessage('outbox', jsonMessage.id);
        ipc.postDisconnectFromVehicle(vehicleId);
      },
    });
  }

  /**
   * Send a bad message.
   *
   * @param jsonMessage The bad message.
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
   * @param text The raw string in the message.
   */
  private receiveMessage(text: string): void {
    // Filter out all invalid messages.
    if (!isJSON(text)) {
      ipc.postLogMessages({
        message: `Received text from Xbee that is not a JSON, could not send bad message to sender ${text}`,
      });
      return;
    }

    const json = JSON.parse(text);
    if (!messageTypeGuard.isJSONMessage(json)) {
      if (!Number.isNaN(json.sid) && vehicleConfig.isValidVehicleId(json.sid as number)) {
        this.sendBadMessage(json as JSONMessage, 'Invalid message, does not meet requirements for a message');
      } else {
        ipc.postLogMessages({
          message: `Received JSON from Xbee that is not a valid message, could not send bad message to sender: ${text}`,
        });
      }
      return;
    }

    json.type = (json.type as string).toLowerCase();
    const jsonMessage = json as JSONMessage;

    // Ignore messages from unrecognized vehicles.
    if (!vehicleConfig.isValidVehicleId(jsonMessage.sid)) return;

    const newMessage = !this.receivedMessageId[jsonMessage.sid]
      || this.receivedMessageId[jsonMessage.sid] as number < jsonMessage.id;

    if (messageTypeGuard.isConnectMessage(jsonMessage)) {
      ipc.postAcknowledgeMessage(jsonMessage);
      if (newMessage) ipc.postConnectToVehicle(jsonMessage);
    } else if (messageTypeGuard.isCompleteMessage(jsonMessage)) {
      ipc.postAcknowledgeMessage(jsonMessage);
      if (newMessage) ipc.postHandleCompleteMessage(jsonMessage);
    } else if (messageTypeGuard.isPOIMessage(jsonMessage)) {
      ipc.postAcknowledgeMessage(jsonMessage);
      if (newMessage) ipc.postHandlePOIMessage(jsonMessage);
    } else if (messageTypeGuard.isUpdateMessage(jsonMessage)) {
      ipc.postAcknowledgeMessage(jsonMessage);
      if (newMessage) ipc.postHandleUpdateMessage(jsonMessage);
    } else if (messageTypeGuard.isBadMessage(jsonMessage)) {
      ipc.postHandleBadMessage(jsonMessage);
    } else if (messageTypeGuard.isAcknowledgementMessage(jsonMessage)) {
      const { ackid } = jsonMessage as AcknowledgementMessage;

      if (newMessage) {
        const hash = `${jsonMessage.sid}#${ackid}`;
        this.updateHandler.event(hash, true); // Stop sending message that this message acknowleges.
        ipc.postHandleAcknowledgementMessage(jsonMessage);
      }
    } else {
      this.sendBadMessage(jsonMessage, `Message of type ${jsonMessage.type} is invalid or is not acceptable by GCS`);
    }

    // Logic: https://ground-control-station.readthedocs.io/en/latest/communications/messages/other-messages.html#acknowledgement-message
    if (newMessage) {
      this.receivedMessageId[jsonMessage.sid] = jsonMessage.id;
      this.messageDictionary.push('received', jsonMessage);
    }
  }

  /**
   * Stops sending all messages.
   */
  private stopSendingMessages(): void {
    const outbox = this.messageDictionary.get('outbox');
    if (!outbox) return;

    outbox.forEach((jsonMessage): void => {
      const hash = `${jsonMessage.tid}#${jsonMessage.id}`;
      this.updateHandler.event(hash, true);
    });
  }
}

/*
 * This allows only one instance of the MessageHandler to be used.
 * All requests are passed through an ipcRenderer notification.
 */
export default new MessageHandler();
