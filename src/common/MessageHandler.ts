import { Event, ipcRenderer } from 'electron';

import { config, vehicleConfig } from '../static/index';

import * as Message from '../types/message';

import ipc from '../util/ipc';

import DictionaryList from './struct/DictionaryList';
import UpdateHandler from './struct/UpdateHandler';

import xbee from './Xbee';

class MessageHandler {
  /**
   * Dictionary for all messages to be sent. Messages are in a list mapped by the vehicle
   * id they are to be sent to.
   */
  private outbox = new DictionaryList<Message.JSONMessage>();

  /**
   * Messages that are currently being sent, map by the vehicle id it is being sent to.
   */
  private sending = new Map<number, Message.JSONMessage>();

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
  private receivedMessageId: { [vehicleId: number]: number | undefined } = {};

  public constructor() {
    ipcRenderer.on('sendMessage', (_: Event, vehicleId: number, message: Message.Message): void => this.sendMessage(vehicleId, message));
    ipcRenderer.on('receiveMessage', (_: Event, message: any): void => this.receiveMessage(message)); // eslint-disable-line @typescript-eslint/no-explicit-any

    ipcRenderer.on('stopSendingMessage', (_: Event, ackMessage: Message.JSONMessage): void => this.stopSendingMessage(ackMessage));
    ipcRenderer.on('stopSendingMessages', (): void => this.stopSendingMessages());
  }

  /**
   * Sends message to vehicle through Xbee.
   * Acknowledgement/Connection Acknowledgement/Bad messages are all sent here, but
   * all other messages are forwarded to sendMessageAsync. All messages except the
   * three mentioned above are only sent one at a time (and everything else will)
   * be stored in the outbox to be sent afterwards.
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

    if (Message.TypeGuard.isAcknowledgementMessage(message)
      || Message.TypeGuard.isConnectionAcknowledgementMessage(message)
      || Message.TypeGuard.isBadMessage(message)) {
      xbee.sendMessage(jsonMessage);
      return;
    }

    if (this.sending.has(jsonMessage.sid)) {
      this.outbox.push(`${jsonMessage.sid}`, jsonMessage);
      return;
    }

    this.sendMessageAsync(jsonMessage);
  }

  /**
   * Either sends the message repeatedly or adds it to the outbox to be
   * sent later. Once the message is acknowledged, the next one will be sent,
   * if one is in the outbox.
   */
  private sendMessageAsync(jsonMessage: Message.JSONMessage): void {
    xbee.sendMessage(jsonMessage);
    const expiry = setInterval(
      (): void => xbee.sendMessage(jsonMessage),
      config.messageSendRate * 1000,
    );

    // Keep track of message, to stop sending it once acknowledged.
    const hash = `${jsonMessage.tid}#${jsonMessage.id}`;
    this.sending.set(jsonMessage.tid, jsonMessage);

    // Callback when this message is acknowledged.
    const onAcknowledge = (): boolean => {
      clearInterval(expiry);
      if (this.outbox.size(`${jsonMessage.tid}`) > 0) {
        const nextMessage = this.outbox.shift(`${jsonMessage.tid}`) as Message.JSONMessage;
        this.sendMessageAsync(nextMessage);
      } else {
        this.sending.delete(jsonMessage.tid);
      }
      return true;
    };

    const onDisconnect = (): void => {
      clearInterval(expiry);
      this.sending.delete(jsonMessage.tid);
      this.outbox.clear(`${jsonMessage.tid}`);
      ipc.postDisconnectFromVehicle(jsonMessage.tid);
    };

    this.updateHandler.addHandler<boolean>(hash,
      (): boolean => onAcknowledge(), {
        time: config.vehicleDisconnectionTime * 1000,
        callback: (): void => onDisconnect(),
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
    this.outbox.clear();

    this.sending.forEach((jsonMessage): void => {
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
