import { ipcRenderer, Event } from 'electron';

import { config, vehicleConfig, VehicleInfo } from '../static/index';

import * as Message from '../types/message';
import * as MissionInformation from '../types/missionInformation';
import * as Task from '../types/task';

import ipc from '../util/ipc';

import missionObject, { MissionObject } from './missions/index';

import Mission from './struct/Mission';
import UpdateHandler from './struct/UpdateHandler';
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

  private vehicles: { [vehicleId: number]: Vehicle } = {};

  /**
   * Keeps track of the vehicle and ensures it is connected.
   */
  private vehiclePinger = new UpdateHandler();

  public constructor() {
    ipcRenderer.on('connectToVehicle', (_: Event, jsonMessage: Message.JSONMessage): void => this.connectToVehicle(jsonMessage));
    ipcRenderer.on('disconnectFromVehicle', (_: Event, vehicleId: number): void => this.disconnectFromVehicle(vehicleId));

    ipcRenderer.on('handleAcknowledgementMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleAcknowledgementMessage(jsonMessage, newMessage));
    ipcRenderer.on('handleBadMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleBadMessage(jsonMessage, newMessage));
    ipcRenderer.on('handleUpdateMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleUpdateMessage(jsonMessage, newMessage));
    ipcRenderer.on('handlePOIMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handlePOIMessage(jsonMessage, newMessage));
    ipcRenderer.on('handleCompleteMessage', (_: Event, jsonMessage: Message.JSONMessage, newMessage: boolean): void => this.handleCompleteMessage(jsonMessage, newMessage));

    ipcRenderer.on('startMissions', (
      _: Event,
      missions: MissionInformation.Information[],
      requireConfirmation: boolean,
    ): void => this.startMissions(missions, requireConfirmation));


    ipcRenderer.on('startNextMission', this.startNextMission);
    ipcRenderer.on('completeMission', (_: Event, missionName: string, completionParameters: Task.TaskParameters[]): void => this.completeMission(missionName, completionParameters));
    ipcRenderer.on('stopMissions', this.stopMissions);
  }

  /**
   * Connects to vehicle specified by the connect message.
   * @param jsonMessage The connect message.
   */
  private connectToVehicle(jsonMessage: Message.JSONMessage): void {
    if (this.vehicles[jsonMessage.sid] && this.vehicles[jsonMessage.sid].getStatus() !== 'disconnected') return;

    ipc.postSendMessage(jsonMessage.sid, { type: 'connectionAck' });

    this.vehicles[jsonMessage.sid] = new Vehicle({
      sid: jsonMessage.sid,
      jobs: (jsonMessage as Message.ConnectMessage).jobsAvailable,
      status: 'ready',
    });

    ipc.postLogMessages({
      type: 'success',
      message: `${(vehicleConfig.vehicleInfos[jsonMessage.sid] as VehicleInfo).name} has connected`,
    });

    this.ping(this.vehicles[jsonMessage.sid]);
  }

  /**
   * Checks if the vehicle is still connected. Does not send a message to the vehicle,
   * simply checks the last time the vehicle has connected with the GCS and uses that.
   * @param vehicle Vehicle to "ping".
   */
  private ping(vehicle: Vehicle): void {
    const delta = Date.now() - vehicle.getLastConnectionTime();

    if (delta >= 0 && delta <= config.vehicleDisconnectionTime * 1000) {
      // Handler that expires and creates itself everytime it "pings" the vehicle.
      this.vehiclePinger.addHandler(`${vehicle.getVehicleId()}`, (): boolean => false, {
        callback: (): void => this.ping(vehicle),
        time: delta,
      });
    } else {
      this.disconnectFromVehicle(vehicle.getVehicleId());
    }
  }

  /**
   * Disconnects from a vehicle.
   * @param vehicleId ID of vehicle to disconnect from.
   */
  private disconnectFromVehicle(vehicleId: number): void {
    if (!this.vehicles[vehicleId]) {
      Orchestrator.postOrchestratorError(`Tried to disconnect from nonexisting vehicle id ${vehicleId}`);
      return;
    }

    this.vehicles[vehicleId].disconnect();
    ipc.postUpdateVehicles(this.vehicles[vehicleId].toObject());

    ipc.postLogMessages({
      type: 'failure',
      message: `${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name} has disconnected`,
    });
  }

  /**
   * Handles acknowledgement messages.
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
   * Handles bad messages.
   * @param jsonMessage Message from vehicle.
   */
  private handleBadMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    if (!newMessage) return;

    this.vehicles[jsonMessage.sid].update(jsonMessage);

    const badMessage = jsonMessage as Message.BadMessage;
    ipc.postLogMessages({
      type: 'failure',
      message: `Received bad message from ${(vehicleConfig.vehicleInfos[jsonMessage.sid] as VehicleInfo).name}: ${badMessage.error || 'No error message specified'}}`,
    });
  }

  /**
   * Handles update messages.
   * @param jsonMessage Message from vehicle.
   */
  private handleUpdateMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    if (!newMessage) return;

    Orchestrator.acknowledgeMessage(jsonMessage);

    // This function updates the lastConnectionTime variable of the vehicle too.
    this.vehicles[jsonMessage.sid].update(jsonMessage);
    if (this.currentMission && this.currentMission.getVehicles()[jsonMessage.sid]) {
      this.currentMission.update(jsonMessage);
    }

    ipc.postUpdateVehicles(this.vehicles[jsonMessage.sid].toObject());
  }

  /**
   * Handles point of interest messages.
   * @param jsonMessage Message from vehicle.
   */
  private handlePOIMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    if (!newMessage) return;

    if (this.currentMission && !this.currentMission.getVehicles()[jsonMessage.sid]) {
      ipc.postLogMessages({
        type: 'failure',
        message: `Received point of interest message from ${vehicleConfig.vehicleInfos[jsonMessage.sid]} while it is not assigned to mission`,
      });
      return;
    }

    Orchestrator.acknowledgeMessage(jsonMessage);

    this.vehicles[jsonMessage.sid].update(jsonMessage);
    if (this.currentMission) this.currentMission.update(jsonMessage);
  }

  /**
   * Handles complete messages.
   * @param jsonMessage Message from vehicle.
   */
  private handleCompleteMessage(jsonMessage: Message.JSONMessage, newMessage: boolean): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    if (!newMessage) return;

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

    Orchestrator.acknowledgeMessage(jsonMessage);

    this.currentMission.update(jsonMessage);
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
    this.requireConfirmation = requireConfirmation;
    this.currentMissionIndex = 0;

    this.startMission();
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
    }

    if (this.requireConfirmation) {
      ipc.postConfirmCompleteMission(); // Start next mission on "startNextMission" notification.
    } else {
      this.startNextMission();
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
    if (!missionObj) {
      Orchestrator.postOrchestratorError('Tried to start mission with unknown mission name');
      return;
    }

    const mission = missionObj as MissionObject;

    this.currentMissionIndex += 1;
    this.currentMission = new mission.constructor(
      this.vehicles,
      this.missions[this.currentMissionIndex],
      this.missions[this.currentMissionIndex].activeVehicleMapping,
    );
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
    this.requireConfirmation = false;
  }
}

/*
 * This allows only one instance of the Orchestrator to be used.
 * All requests are passed through an ipcRenderer notification.
 */
export default new Orchestrator();
