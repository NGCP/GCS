import { Event, ipcRenderer } from 'electron';

import { config, vehicleConfig } from '../static/index';

import * as Message from '../types/message';

import ipc from '../util/ipc';

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
  private messageDictionary = new DictionaryList<Message.JSONMessage>();

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
    ipcRenderer.on('sendMessage', (_: Event, vehicleId: number, message: Message.Message): void => this.sendMessage(vehicleId, message));
    ipcRenderer.on('receiveMessage', (_: Event, message: any): void => this.receiveMessage(message)); // eslint-disable-line @typescript-eslint/no-explicit-any

    ipcRenderer.on('stopSendingMessage', (_: Event, ackMessage: Message.JSONMessage): void => this.stopSendingMessage(ackMessage));
    ipcRenderer.on('stopSendingMessages', this.stopSendingMessages);
  }

  /**
   * Removes a message from the outbox.
   *
   * @param id Message id
   */
  private removeMessage(key: 'outbox' | 'sent' | 'received', id: number): Message.JSONMessage | undefined {
    return this.messageDictionary.remove(key,
      (message: Message.JSONMessage): boolean => message.id === id);
  }

  /**
   * Sends message to vehicle through Xbee.
   *
   * @param vehicleId Vehicle id to send the message to.
   * @param message Message format (note this does not have sid, tid, id, and time).
   */
  private sendMessage(vehicleId: number, message: Message.Message): void {
    const jsonMessage: Message.JSONMessage = {
      id: this.id,
      sid: 0,
      tid: vehicleId,
      time: Date.now(),
      ...message,
    };

    this.id += 1;

    xbee.sendMessage(jsonMessage);
    this.messageDictionary.push('sent', jsonMessage);

    if (Message.TypeGuard.isAcknowledgementMessage(message)
      || Message.TypeGuard.isBadMessage(message)) {
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
  private sendBadMessage(jsonMessage: Message.JSONMessage, error?: string): void {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private receiveMessage(message: any): void {
    if (!message) return;

    if (!Message.TypeGuard.isJSONMessage(message)) {
      if (!Number.isNaN(message.sid) && vehicleConfig.isValidVehicleId(message.sid as number)) {
        this.sendBadMessage(message as Message.JSONMessage, 'Invalid message, does not meet requirements for a message');
      } else {
        ipc.postLogMessages({
          message: `Received JSON from Xbee that is not a valid message, could not send bad message to sender: ${message}`,
        });
      }
      return;
    }

    message.type = message.type.toLowerCase(); // eslint-disable-line no-param-reassign
    const jsonMessage = message as Message.JSONMessage;

    // Ignore messages from unrecognized vehicles.
    if (!vehicleConfig.isValidVehicleId(jsonMessage.sid)) return;

    const newMessage = !this.receivedMessageId[jsonMessage.sid]
      || this.receivedMessageId[jsonMessage.sid] as number < jsonMessage.id;

    if (Message.TypeGuard.isConnectMessage(jsonMessage)) {
      ipc.postConnectToVehicle(jsonMessage, newMessage);
    } else if (Message.TypeGuard.isCompleteMessage(jsonMessage)) {
      ipc.postHandleCompleteMessage(jsonMessage, newMessage);
    } else if (Message.TypeGuard.isPOIMessage(jsonMessage)) {
      ipc.postHandlePOIMessage(jsonMessage, newMessage);
    } else if (Message.TypeGuard.isUpdateMessage(jsonMessage)) {
      ipc.postHandleUpdateMessage(jsonMessage, newMessage);
    } else if (Message.TypeGuard.isBadMessage(jsonMessage)) {
      if (newMessage) ipc.postHandleBadMessage(jsonMessage, newMessage);
    } else if (Message.TypeGuard.isAcknowledgementMessage(jsonMessage)) {
      ipc.postHandleAcknowledgementMessage(jsonMessage, newMessage);
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
   * Stops sending certain message, specified by ackid and tid of message.
   */
  private stopSendingMessage(ackMessage: Message.JSONMessage): void {
    const hash = `${ackMessage.sid}#${(ackMessage as Message.AcknowledgementMessage).ackid}`;
    this.updateHandler.event(hash, true);
  }

  /**
   * Stops sending all messages.
   */
  private stopSendingMessages(): void {
    this.messageDictionary.forEach('outbox', (jsonMessage): void => {
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
