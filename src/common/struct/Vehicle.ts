import { JobType, vehicleConfig } from '../../static/index';

import {
  JSONMessage,
  Message,
  StartMessage,
  Task,
  UpdateMessage,
} from '../../types/messages';
import { VehicleObject, VehicleStatus } from '../../types/types';

import ipc from '../../util/ipc';

import UpdateHandler from './UpdateHandler';

type ErrorCallback = (message?: string) => void;

/**
 * Options to initialize a vehicle.
 */
export interface VehicleOptions {
  sid: number;
  jobs: JobType[];
}

/**
 * Contains data about a specific physical vehicle that the GCS will need to keep track
 * of it (missions, information, etc).
 *
 * Also has functions that allows the GCS to command the physical vehicle by sending it
 * tasks.
 */
export default class Vehicle {
  /**
   * ID of the vehicle.
   */
  private vehicleId: number;

  /**
   * Current assigned job.
   */
  private assignedJob: JobType | '' = '';

  /**
   * Current status of the vehicle.
   */
  private status: VehicleStatus = 'disconnected';

  /**
   * Jobs the vehicle has. These define the tasks the vehicle is capable of performing.
   */
  private jobs: string[];

  /**
   * Current latitude of the vehicle. Starts at 0.
   */
  private lat = 0;

  /**
   * Current longitude of the vehicle. Starts at 0.
   */
  private lng = 0;

  /**
   * Current altitude of the vehicle.
   */
  private alt?: number;

  /**
   * Current battery of the vehicle, expressed as a decimal. Will vary from 0 to 1.
   */
  private battery?: number;

  /**
   * Current vehicle heading. Value is in degrees.
   */
  private heading?: number;

  /**
   * Callback to when the vehicle enters the error state.
   */
  private errorCallback: ErrorCallback = (): void => {};

  /**
   * Handler that listens for different events from the vehicle connected.
   */
  private updateEventHandler = new UpdateHandler();

  /**
   * Last time that GCS received any message from the vehicle.
   * Time is in number of milliseconds since Epoch.
   */
  private lastConnectionTime = Date.now();

  public constructor(options: VehicleOptions) {
    this.vehicleId = options.sid;
    this.jobs = options.jobs;

    // We never want these handlers to disappear so always return false on their callback functions.

    this.updateEventHandler.addHandler<VehicleStatus>('status', (status, message): boolean => {
      this.status = status;
      if (status === 'error') {
        // Calls the errorCallback function and provides errorMessage to it.
        this.errorCallback(message && message.errorMessage);
      }
      return false;
    });

    this.updateEventHandler.addHandler<number>('lat', (lat): boolean => {
      this.lat = lat;
      return false;
    });

    this.updateEventHandler.addHandler<number>('lng', (lng): boolean => {
      this.lng = lng;
      return false;
    });

    this.updateEventHandler.addHandler<number>('alt', (alt): boolean => {
      this.alt = alt;
      return false;
    });

    this.updateEventHandler.addHandler<number>('battery', (battery, message): boolean => {
      if (battery > 1 || battery < 0) {
        const vehicleInfo = message && message.sid && vehicleConfig.vehicleInfos[message.sid];

        ipc.postLogMessages({
          type: 'failure',
          message: `Received an invalid battery status (${battery * 100}%) from ${(vehicleInfo && vehicleInfo.name) || 'an unknown vehicle'}`,
        });
      } else {
        this.battery = battery;
      }
      return false;
    });

    this.updateEventHandler.addHandler<number>('heading', (heading): boolean => {
      this.heading = heading;
      return false;
    });
  }

  public getVehicleId(): number { return this.vehicleId; }

  public getStatus(): VehicleStatus { return this.status; }

  public getJobs(): string[] { return this.jobs; }

  public getLat(): number { return this.lat; }

  public getLng(): number { return this.lng; }

  public getAlt(): number | undefined { return this.alt; }

  public getBattery(): number | undefined { return this.battery; }

  public getHeading(): number | undefined { return this.heading; }

  public getLastConnectionTime(): number { return this.lastConnectionTime; }

  public getUpdateEventHandler(): UpdateHandler { return this.updateEventHandler; }

  /**
   * Converts vehicle to a plain object so that its private variables can be read
   * when it is sent through ipcRenderer.
   */
  public toPlainObject(): VehicleObject {
    return {
      vehicleId: this.vehicleId,
      status: this.status,
      jobs: this.jobs,
      lat: this.lat,
      lng: this.lng,
      alt: this.alt,
      battery: this.battery,
      heading: this.heading,
    };
  }

  /**
   * Updates all variables in this vehicle to the variables in the message. Called
   * by the Orchestrator when the GCS receives an update message from the vehicle.
   * Also updates the lastConnectionTime accordingly.
   *
   * @param message The message from the vehicle itself.
   */
  public update(jsonMessage: JSONMessage): void {
    const updateMessage = jsonMessage as UpdateMessage;

    this.lastConnectionTime = jsonMessage.time;
    this.updateEventHandler.events(updateMessage);
  }

  /**
   * Sets the vehicle as disconnected by changing it status to "disconnected".
   * The Orchestrator is in charge of preventing any more updates to the vehicle
   * if it is disconnected.
   */
  public disconnect(): void {
    this.status = 'disconnected';
  }

  /**
   * Sets lastConnectionTime to current time when function is called. Called
   * by the Orchestrator whenever GCS receives a message from the vehicle.
   */
  public updateLastConnectionTime(jsonMessage: JSONMessage): void {
    this.lastConnectionTime = jsonMessage.time;
  }

  /**
   * Forwards message to MessageHandler to send through Xbee.
   *
   * @param message Message to send.
   */
  private sendMessage(message: Message): void {
    ipc.postSendMessage(this.vehicleId, message);
  }

  /**
   * Notifies the vehicle that it will be performing a certain mission. We let the vehicle know of
   * the job type too, so that it knows which tasks to expect from us and discard any other
   * tasks that do not support their job.
   *
   * Will return true if the mission was assigned successfully.
   *
   * @param jobType The job that will be used to accomplish the mission.
   * @param completionCallback Optional callback when vehicle finishes/terminates the mission.
   * @param disconnectionCallback Optional callback when vehicle disconnects.
   * @param errorCallback Optional callback when vehicle goes in an error state.
   * @param options Optional information vehicle will need before performing any tasks.
   */
  public assignJob(
    jobType: JobType,
    completionCallback?: () => void,
    disconnectionCallback?: () => void,
    errorCallback?: ErrorCallback,
    options?: object,
  ): boolean {
    /*
     * Returns false if a vehicle has already been assigned a mission.
     * Vehicle's status is ready if it has not been assigned a mission.
     */
    if (this.status !== 'ready') {
      return false;
    }

    this.assignedJob = jobType;
    if (errorCallback) this.errorCallback = errorCallback;

    const startMessage: StartMessage = {
      type: 'start',
      jobType,
    };

    if (options) startMessage.options = options;

    // Sends the start message to the vehicle with corresponding job name.
    this.sendMessage(startMessage);

    /*
     * Create handler that will end when vehicle successfully receives the job and goes to a
     * waiting state.
     */
    this.updateEventHandler.addHandler<VehicleStatus>('status', (value): boolean => {
      if (value === 'waiting') {
        if (completionCallback) completionCallback();
      } else if (value === 'disconnected') {
        if (disconnectionCallback) disconnectionCallback();
      }
      return value === 'waiting';
    });

    return true;
  }

  /**
   * Gives the vehicle a task to perform (the task must be able to be done by the vehicle's job).
   * Will return true if the task was assigned successfully. The only way the task would not
   * be assigned successfully is if the task is not supported by the vehicle's job.
   *
   * @param task The task for the vehicle to perform. Must support the vehicle's job.
   */
  public assignTask(task: Task): boolean {
    /*
     * Returns false if the vehicle has not been assigned a mission or if the provided task
     * is not compatible with its job.
     * Vehicle's status is "waiting" if it has been assigned a mission but is awaiting a task.
     */
    if (this.status !== 'waiting' || !this.assignedJob || !vehicleConfig.isValidTaskTypeForJob(task.taskType, this.assignedJob)) {
      return false;
    }

    this.sendMessage({
      type: 'addMission',
      missionInfo: task,
    });

    return true;
  }

  /**
   * Sends stop message to vehicle.
   */
  public stop(): void {
    this.sendMessage({
      type: 'stop',
    });

    this.assignedJob = '';
  }
}
