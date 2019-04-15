import { ipcRenderer, Event } from 'electron';

import {
  config,
  vehicleConfig,
  VehicleInfo,
} from '../static/index';

import {
  BadMessage,
  ConnectMessage,
  JSONMessage,
  MissionDescription,
  MissionParameters,
} from '../types/messages';

import ipc from '../util/ipc';

import missionObject, { MissionObject } from './missions/index';

import Mission from './struct/Mission';
import UpdateHandler from './struct/UpdateHandler';
import Vehicle from './struct/Vehicle';

import './MessageHandler';

class Orchestrator {
  /**
   * Acknowledges a message. All messages are passed here through the MessageHandler.
   * Only messages that are no acknowledged are bad messages and acknowledgements.
   */
  private static acknowledge(jsonMessage: JSONMessage): void {
    ipc.postSendMessage(jsonMessage.sid, {
      type: 'ack',
      ackid: jsonMessage.id,
    });
  }

  /**
   * List of mission names and information for each mission.
   */
  private missions: MissionDescription[] = [];

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
    ipcRenderer.on('connectToVehicle', (_: Event, jsonMessage: JSONMessage): void => this.connectToVehicle(jsonMessage));
    ipcRenderer.on('disconnectFromVehicle', (_: Event, vehicleId: number): void => this.disconnectFromVehicle(vehicleId));

    ipcRenderer.on('handleAcknowledgementMessage', (_: Event, jsonMessage: JSONMessage): void => this.handleAcknowledgementMessage(jsonMessage));
    ipcRenderer.on('handleBadMessage', (_: Event, jsonMessage: JSONMessage): void => this.handleBadMessage(jsonMessage));
    ipcRenderer.on('handleUpdateMessage', (_: Event, jsonMessage: JSONMessage): void => this.handleUpdateMessage(jsonMessage));
    ipcRenderer.on('handlePOIMessage', (_: Event, jsonMessage: JSONMessage): void => this.handlePOIMessage(jsonMessage));
    ipcRenderer.on('handleCompleteMessage', (_: Event, jsonMessage: JSONMessage): void => this.handleCompleteMessage(jsonMessage));

    ipcRenderer.on('startMissions', (
      _: Event,
      missions: MissionDescription[],
      requireConfirmation: boolean,
    ): void => this.startMissions(missions, requireConfirmation));


    ipcRenderer.on('startNextMission', this.startNextMission);
    ipcRenderer.on('completeMission', (_: Event, missionName: string, completionParameters: MissionParameters): void => this.completeMission(missionName, completionParameters));
    ipcRenderer.on('stopMission', this.stopMission);
  }

  /**
   * Connects to vehicle specified by the connect message.
   * @param jsonMessage The connect message.
   */
  private connectToVehicle(jsonMessage: JSONMessage): void {
    const connectMessage = jsonMessage as ConnectMessage;

    this.vehicles[jsonMessage.sid] = new Vehicle({
      sid: jsonMessage.sid,
      jobs: connectMessage.jobsAvailable,
    });
  }

  /**
   * Checks if the vehicle is still connected. Does not send a message to the vehicle,
   * simply checks the last time the vehicle has connected with the GCS and uses that.
   * @param vehicle Vehicle to "ping".
   */
  private ping(vehicle: Vehicle): void {
    const delta = Date.now() - vehicle.getLastConnectionTime();
    if (delta >= 0 && delta <= config.vehicleDisconnectionTime) {
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
   * Disconnects from a vehicle (if it does not communicate recently enough).
   * @param vehicleId ID of vehicle to disconnect from.
   */
  private disconnectFromVehicle(vehicleId: number): void {
    // Just in case, the statement should never pass.
    if (!this.vehicles[vehicleId]) return;
    this.vehicles[vehicleId].disconnect();

    ipc.postUpdateVehicles(this.vehicles[vehicleId].toPlainObject());
  }

  private handleAcknowledgementMessage(jsonMessage: JSONMessage): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    this.vehicles[jsonMessage.sid].updateLastConnectionTime(jsonMessage);
  }

  private handleBadMessage(jsonMessage: JSONMessage): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;
    this.vehicles[jsonMessage.sid].updateLastConnectionTime(jsonMessage);

    const badMessage = jsonMessage as BadMessage;
    ipc.postLogMessages({
      type: 'failure',
      message: `Received bad message from ${(vehicleConfig.vehicleInfos[jsonMessage.sid] as VehicleInfo).name}: ${badMessage.error || 'No error message specified'}}`,
    });
  }

  private handleUpdateMessage(jsonMessage: JSONMessage): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;

    this.vehicles[jsonMessage.sid].update(jsonMessage);
    if (this.currentMission) this.currentMission.update(jsonMessage);
    Orchestrator.acknowledge(jsonMessage);

    ipc.postUpdateVehicles(this.vehicles[jsonMessage.sid].toPlainObject());
  }

  private handlePOIMessage(jsonMessage: JSONMessage): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;

    if (this.currentMission) {
      this.currentMission.update(jsonMessage);
    }
    Orchestrator.acknowledge(jsonMessage);
  }

  private handleCompleteMessage(jsonMessage: JSONMessage): void {
    if (!this.vehicles[jsonMessage.sid] || this.vehicles[jsonMessage.sid].getStatus() === 'disconnected') return;

    if (!this.currentMission) {
      ipc.postLogMessages({
        type: 'failure',
        message: `Received complete message from ${vehicleConfig.vehicleInfos[jsonMessage.sid]} while no mission was running`,
      });
      return;
    }

    this.currentMission.update(jsonMessage);
    Orchestrator.acknowledge(jsonMessage);
  }

  /**
   * Checks if all missionName fields in each mission is valid, then runs the FIRST mission of
   * the provided missions.
   *
   * @param missions Description for all missions. Includes name of mission and information
   * required for mission.
   */
  private startMissions(
    missions: MissionDescription[],
    requireConfirmation: boolean,
  ): void {
    if (this.running) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'Cannot start new missions while missions are already running',
      });
      return;
    }

    if (missions.length === 0) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'Cannot start new mission with no specified mission',
      });
      return;
    }

    this.running = true;
    this.missions = missions;
    this.requireConfirmation = requireConfirmation;

    this.currentMissionIndex = 0;
    const missionObj = missionObject[this.missions[this.currentMissionIndex].missionName];
    if (!missionObj) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'Cannot start mission with unknown mission name',
      });
    }

    const mission = missionObj as MissionObject;

    this.currentMissionIndex += 1;
    this.currentMission = new mission.constructor(
      this.vehicles,
      this.missions[this.currentMissionIndex].information,
      this.missions[this.currentMissionIndex].activeVehicleMapping,
    );
  }

  /**
   * Happens when a mission completes. Either starts the next mission automatically,
   * ask user for confirmation before starting next mission, or ends missions.
   *
   * @param missionName Name of mission that has completed. Used for ensuring missions are
   * being kept track of.
   * @param completionParameters Paramters for next mission.
   */
  private completeMission(missionName: string, completionParameters: MissionParameters): void {
    /*
     * The following should not happen. Only happens if the currentMissionIndex somehow
     * does not match up with the mission that just finished, or if no mission was running for
     * some reason.
     */
    if (!this.running || (this.currentMissionIndex >= 0
      && this.missions[this.currentMissionIndex].missionName !== missionName)) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'Received invalid completion for a mission',
      });
      return;
    }

    if (this.currentMissionIndex === this.missions.length - 1) {
      this.stopMission();
      ipc.postFinishMissions(completionParameters);
    } else if (this.requireConfirmation) {
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
      ipc.postLogMessages({
        type: 'failure',
        message: 'Cannot start next mission while no missions are running',
      });
      return;
    }
    const missionObj = missionObject[this.missions[this.currentMissionIndex].missionName];
    if (!missionObj) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'Cannot start mission with unknown mission name',
      });
    }

    const mission = missionObj as MissionObject;

    this.currentMissionIndex += 1;
    this.currentMission = new mission.constructor(
      this.vehicles,
      this.missions[this.currentMissionIndex].information,
      this.missions[this.currentMissionIndex].activeVehicleMapping,
    );
  }

  /**
   * Clears all missions in Orchestrator.
   */
  private stopMission(): void {
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
