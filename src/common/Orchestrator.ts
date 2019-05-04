import { ipcRenderer, Event } from 'electron';

import {
  config,
  vehicleConfig,
  VehicleInfo,
} from '../static/index';

import * as Message from '../types/message';
import * as MissionInformation from '../types/missionInformation';
import * as Task from '../types/task';

import ipc from '../util/ipc';

import missionObject from './missions/index';

import Mission from './struct/Mission';
import Vehicle from './struct/Vehicle';

import './MessageHandler';

class Orchestrator {
  /**
   * Posts error message when error happens in Orchestrator.
   */
  private static postOrchestratorError(error: string): void {
    ipc.postLogMessages({
      type: 'failure',
      message: `Something wrong happened in Orchestrator: ${error}`,
    });
  }

  /**
   * Acknowledges a message. All messages are passed here through the MessageHandler.
   * Only messages that are no acknowledged are bad messages and acknowledgements.
   */
  private static acknowledgeMessage(jsonMessage: Message.JSONMessage): void {
    ipc.postSendMessage(jsonMessage.sid, {
      type: 'ack',
      ackid: jsonMessage.id,
    });
  }

  /**
   * List of mission names and information for each mission.
   */
  private missions: MissionInformation.Information[] = [];

  /**
   * Current index of missions that mission is performing.
   * Value is -1 if no mission is being performed.
   */
  private currentMissionIndex = -1;

  /**
   * True if a mission is running, false otherwise.
   */
  private running = false;

  /**
   * True if user wants confirmation between missions, false otherwise.
   */
  private requireConfirmation = false;

  /**
   * Current Mission being performed. Value is null
   * if no mission is being performed.
   */
  private currentMission: Mission | null = null;

  /**
   * All vehicles that have connected to the GCS.
   */
  private vehicles: { [vehicleId: number]: Vehicle } = {};

  /**
   * Used for a mission to process which vehicle is doing which job.
   */
  private activeVehicleMapping: MissionInformation.ActiveVehicleMapping | null = null;

  /**
   * Used for a mission to know options for specific missions.
   */
  private options: MissionInformation.MissionOptions | null = null;

  public constructor() {
    ipcRenderer.on('connectToVehicle', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean, shouldAcknowledge: boolean): void => this.connectToVehicle(jsonMessage, newMessage, shouldAcknowledge));
    ipcRenderer.on('disconnectFromVehicle', (_: Event, vehicleId: number): void => this.disconnectFromVehicle(vehicleId));

    ipcRenderer.on('handleAcknowledgementMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleAcknowledgementMessage(jsonMessage, newMessage));
    ipcRenderer.on('handleBadMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleBadMessage(jsonMessage, newMessage));
    ipcRenderer.on('handleUpdateMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleUpdateMessage(jsonMessage, newMessage));
    ipcRenderer.on('handlePOIMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handlePOIMessage(jsonMessage, newMessage));
    ipcRenderer.on('handleCompleteMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleCompleteMessage(jsonMessage, newMessage));

    ipcRenderer.on('startMissions', (
      _: Event,
      missions: MissionInformation.Information[],
      activeVehicleMapping: MissionInformation.ActiveVehicleMapping,
      options: MissionInformation.MissionOptions,
      requireConfirmation: boolean,
    ): void => this.startMissions(missions, activeVehicleMapping, options, requireConfirmation));
    ipcRenderer.on('pauseMission', (): void => this.pauseMission());
    ipcRenderer.on('resumeMission', (): void => this.resumeMission());
    ipcRenderer.on('startNextMission', (): void => this.startNextMission());
    ipcRenderer.on('completeMission', (_: Event, missionName: string, completionParameters: Task.TaskParameters[]): void => this.completeMission(missionName, completionParameters));
    ipcRenderer.on('stopMissions', (): void => this.stopMissions());
  }

  /**
   * Connects to vehicle specified by the connect message from message handler.
   * @param jsonMessage The connect message.
   */
  private connectToVehicle(
    jsonMessage: Message.JSONMessage,
    newMessage: boolean,
    shouldAcknowledge: boolean,
  ): void {
    if (newMessage) {
      if (!this.vehicles[jsonMessage.sid]) {
        this.vehicles[jsonMessage.sid] = new Vehicle({
          sid: jsonMessage.sid,
          jobs: (jsonMessage as Message.ConnectMessage).jobsAvailable,
          status: 'ready',
        });

        setTimeout(
          (): void => this.ping(this.vehicles[jsonMessage.sid]),
          config.vehicleDisconnectionTime * 1000,
        );
      } else {
        this.vehicles[jsonMessage.sid].connect();
      }

      ipc.postLogMessages({
        type: 'success',
        message: `${(vehicleConfig.vehicleInfos[jsonMessage.sid] as VehicleInfo).name} has connected`,
      });
    }

    if (shouldAcknowledge) ipc.postSendMessage(jsonMessage.sid, { type: 'connectionAck' });
  }

  /**
   * Checks if the vehicle is still connected. Does not send a message to the vehicle,
   * simply checks the last time the vehicle has connected with the GCS and uses that.
   * @param vehicle Vehicle to "ping".
   */
  private ping(vehicle: Vehicle): void {
    const delta = Math.max(0, Date.now() - vehicle.getLastConnectionTime());

    ipc.postLogMessages({ message: `Pinging vehicle with delta = ${delta}` });

    if (delta <= config.vehicleDisconnectionTime * 1000) {
      // Handler that expires and creates itself everytime it "pings" the vehicle.
      setTimeout(
        (): void => { this.ping(vehicle); },
        config.vehicleDisconnectionTime * 1000 - delta,
      );
    } else {
      this.disconnectFromVehicle(vehicle.getVehicleId());
    }
  }

  /**
   * Disconnects from a vehicle.
   * @param vehicleId ID of vehicle to disconnect from.
   */
  private disconnectFromVehicle(vehicleId: number): void {
    if (this.vehicles[vehicleId].getStatus() === 'disconnected') return;

    this.vehicles[vehicleId].disconnect();
    ipc.postUpdateVehicles(this.vehicles[vehicleId].toObject());

    ipc.postLogMessages({
      type: 'failure',
      message: `${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name} has disconnected`,
    });
  }

  /**
   * Handles acknowledgement messages from the message handler.
   * @param jsonMessage Message from vehicle.
   */
  private handleAcknowledgementMessage(
    jsonMessage: Message.JSONMessage,
    newMessage: boolean,
  ): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    if (!newMessage) return;

    this.vehicles[jsonMessage.sid].update(jsonMessage);

    ipc.postStopSendingMessage(jsonMessage);
  }

  /**
   * Handles bad messages from the message handler.
   * @param jsonMessage Message from vehicle.
   */
  private handleBadMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    if (!newMessage) return;

    this.vehicles[jsonMessage.sid].update(jsonMessage);

    const badMessage = jsonMessage as Message.BadMessage;
    ipc.postLogMessages({
      type: 'failure',
      message: `Received bad message from ${(vehicleConfig.vehicleInfos[jsonMessage.sid] as VehicleInfo).name}: ${badMessage.error || 'No error message specified'}}`,
    });
  }

  /**
   * Handles update messages from the message handler.
   * @param jsonMessage Message from vehicle.
   */
  private handleUpdateMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;

    if (newMessage) {
      this.vehicles[jsonMessage.sid].update(jsonMessage);
      if (this.currentMission && this.currentMission.getVehicles()[jsonMessage.sid]) {
        this.currentMission.update(jsonMessage);
      } else {
        const status = this.vehicles[jsonMessage.sid].getStatus();
        if (!config.fixtures && (status === 'waiting' || status === 'running' || status === 'paused')) {
          this.vehicles[jsonMessage.sid].stop();
        }
      }

      ipc.postUpdateVehicles(this.vehicles[jsonMessage.sid].toObject());
    }

    Orchestrator.acknowledgeMessage(jsonMessage);
  }

  /**
   * Handles point of interest messages from the message handler.
   * @param jsonMessage Message from vehicle.
   */
  private handlePOIMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;

    if (newMessage) {
      if (this.currentMission && !this.currentMission.getVehicles()[jsonMessage.sid]) {
        ipc.postLogMessages({
          type: 'failure',
          message: `Received point of interest message from ${vehicleConfig.vehicleInfos[jsonMessage.sid]} while it is not assigned to mission`,
        });
        return;
      }

      this.vehicles[jsonMessage.sid].update(jsonMessage);
      if (this.currentMission) this.currentMission.update(jsonMessage);
    }

    Orchestrator.acknowledgeMessage(jsonMessage);
  }

  /**
   * Handles complete messages from the message handler.
   * @param jsonMessage Message from vehicle.
   */
  private handleCompleteMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;

    if (newMessage) {
      if (!this.currentMission) {
        ipc.postLogMessages({
          type: 'failure',
          message: `Received complete message from ${vehicleConfig.vehicleInfos[jsonMessage.sid]} while no mission is running`,
        });
        return;
      }

      if (!this.currentMission.getVehicles()[jsonMessage.sid]) {
        ipc.postLogMessages({
          type: 'failure',
          message: `Received complete message from ${vehicleConfig.vehicleInfos[jsonMessage.sid]} while it is not assigned to the mission`,
        });
        return;
      }

      this.currentMission.update(jsonMessage);
    }

    Orchestrator.acknowledgeMessage(jsonMessage);
  }

  /**
   * Checks if all missionName fields in each mission is valid, then runs the FIRST mission of
   * the provided missions.
   *
   * @param missions Description for all missions. Includes name of mission and information
   * required for mission.
   */
  private startMissions(
    missions: MissionInformation.Information[],
    activeVehicleMapping: MissionInformation.ActiveVehicleMapping,
    options: MissionInformation.MissionOptions,
    requireConfirmation: boolean,
  ): void {
    if (this.running) {
      Orchestrator.postOrchestratorError('Cannot start new missions while missions are already running');
      return;
    }

    if (missions.length === 0) {
      Orchestrator.postOrchestratorError('Cannot start new missions with no missions provided');
      return;
    }

    this.running = true;
    this.missions = missions;
    this.activeVehicleMapping = activeVehicleMapping;
    this.options = options;
    this.requireConfirmation = requireConfirmation;
    this.currentMissionIndex = 0;

    this.startMission();
  }

  /**
   * Sends pause message to all vehicles (regardless if they're running a mission or not).
   */
  private pauseMission(): void {
    if (!this.running) return;

    Object.values(this.vehicles).forEach((vehicle): void => {
      ipc.postSendMessage(vehicle.getVehicleId(), {
        type: 'pause',
      });
    });
  }

  /**
   * Sends pause message to all vehicles (regardless if they're running a mission or not).
   */
  private resumeMission(): void {
    if (!this.running) return;

    Object.values(this.vehicles).forEach((vehicle): void => {
      ipc.postSendMessage(vehicle.getVehicleId(), {
        type: 'resume',
      });
    });
  }

  /**
   * Happens when a mission completes. Either starts the next mission automatically,
   * ask user for confirmation before starting next mission, or ends missions.
   *
   * @param missionName Name of mission that has completed. Used for ensuring missions are
   * being kept track of.
   * @param completionParameters Paramters for next mission.
   */
  private completeMission(missionName: string, completionParameters: Task.TaskParameters[]): void {
    if (!this.running
      || (this.currentMissionIndex >= 0
        && this.missions[this.currentMissionIndex].missionName !== missionName)) {
      Orchestrator.postOrchestratorError('Invalid mission was completed');
      return;
    }

    if (this.currentMissionIndex === this.missions.length - 1) {
      ipc.postFinishMissions(completionParameters);
      this.stopMissions();
    } else {
      this.missions[this.currentMissionIndex + 1].parameters = completionParameters;

      if (this.requireConfirmation) {
        ipc.postConfirmCompleteMission(); // Start next mission on "startNextMission" notification.
      } else {
        this.startNextMission();
      }
    }
  }

  /**
   * Starts next mission.
   */
  private startNextMission(): void {
    if (!this.running) {
      Orchestrator.postOrchestratorError('Tried to start next mission while no missions are running');
      return;
    }

    this.currentMissionIndex += 1;
    this.startMission();
  }

  /**
   * Support function to start a mission. Uses currentMissionIndex to determine which
   * mission to start. Ensure to set the currentMissionIndex properly before calling
   * this function.
   */
  private startMission(): void {
    const missionObj = missionObject[this.missions[this.currentMissionIndex].missionName];

    if (!this.options || !this.activeVehicleMapping) {
      Orchestrator.postOrchestratorError('Tried to start mission while options/mapping are null');
      return;
    }

    this.currentMission = new missionObj.Mission(
      this.vehicles,
      this.missions[this.currentMissionIndex],
      this.activeVehicleMapping,
      this.options,
    );

    this.currentMission.initialize();
  }

  /**
   * Clears all missions in Orchestrator. Run after all missions are completed or
   * mission is stopped.
   */
  private stopMissions(): void {
    this.currentMissionIndex = -1;
    this.currentMission = null;
    this.missions = [];
    this.running = false;
    this.requireConfirmation = true;
    this.activeVehicleMapping = null;
    this.options = null;
  }
}

/*
 * This allows only one instance of the Orchestrator to be used.
 * All requests are passed through an ipcRenderer notification.
 */
export default new Orchestrator();
