import { ipcRenderer } from 'electron';

import { vehicleInfos } from '../../static/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { VehicleStatus } from '../../util/types'; // eslint-disable-line import/named

import { Job } from './Jobs'; // eslint-disable-line import/named
import { Message, StartMessage, UpdateMessage } from './Messages'; // eslint-disable-line import/named
import UpdateHandler from './UpdateHandler';

type ErrorCallback = (message?: string) => void;

/**
 * Options to initialize a vehicle.
 */
export interface VehicleOptions {
  sid: number;
  jobs: string[];
  status?: VehicleStatus;
}

/**
 * Publicly accessible object that contains information about the vehicle. Modifying
 * information of this object will not modify the actual vehicle class.
 */
export interface VehicleObject {
  /**
   * ID of the vehicle.
   */
  vehicleId: number;

  /**
   * Current status of the vehicle.
   */
  status: VehicleStatus;

  /**
   * Jobs that the vehicle can perform.
   */
  jobs: string[];

  /**
   * Current latitude of the vehicle. Starts at 0.
   */
  lat: number;

  /**
   * Current longitude of the vehicle. Starts at 0.
   */
  lng: number;

  /**
   * Current altitude of the vehicle.
   */
  alt?: number;
  /**
   *
   * Current battery of the vehicle, expressed as a decimal. Will vary from 0 to 1.
   */
  battery?: number;

  /**
   * Current vehicle heading. Value is in degrees.
   */
  heading?: number;
}

/**
 * Contains data held by a vehicle as well as functions used by the vehicle.
 */
export default class Vehicle {
  /**
   * ID of the vehicle.
   */
  private vehicleId: number;

  /**
   * Currently assigned job.
   */
  private assignedJob: string = '';

  /**
   * Whether or not the vehicle is currently in the state of being assigned a job.
   * When the vehicle is assigned a job, it will be waiting for job info until it gets that.
   * During that time, this variable will be true. False otherwise.
   */
  private waitingForJobInfo: boolean = false;

  /**
   * Current status of the vehicle.
   */
  private status: VehicleStatus = 'disconnected';

  /**
   * Jobs that the vehicle can perform.
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

    if (options.status) this.status = options.status;

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
      if (battery > 1) {
        const vehicleInfo = message && message.sid && vehicleInfos[message.sid];

        ipcRenderer.send('post', 'updateMessages', {
          type: 'failure',
          message: `Received a battery status of more than 100% (${battery * 100}%) from ${(vehicleInfo && vehicleInfo.name) || 'an unknown vehicle'}`,
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
   *
   * @param message The message from the vehicle itself.
   */
  public update(message: UpdateMessage): void {
    this.updateEventHandler.events(message);
  }

  /**
   * Sets lastConnectionTime to current time when function is called. Called
   * by the Orchestrator whenever GCS receives a message from the vehicle.
   */
  public updateLastConnectionTime(): void {
    this.lastConnectionTime = Date.now();
  }

  /**
   * Assigns a job to the vehicle.
   */
  public assignJob(
    job: string,
    options?: object,
    completionCallback?: () => void,
    disconnectionCallback?: () => void,
    errorCallback?: ErrorCallback,
  ): void {
    if (this.waitingForJobInfo) {
      throw new Error('Vehicle has already been assigned a job and is waiting for info.');
    }

    this.assignedJob = job;
    this.waitingForJobInfo = true;
    if (errorCallback) this.errorCallback = errorCallback;

    const startMessage: StartMessage = {
      type: 'start',
      jobType: this.assignedJob,
    };

    if (options) startMessage.options = options;

    // Sends the start message to the vehicle with corresponding job name.
    this.sendMessage({
      type: 'start',
      jobType: this.assignedJob,
    });

    /*
     * Create handler that will call completion callback and when vehicle goes back to
     * "ready" status.
     *
     * Vehicle goes back to "ready" status once it either finishes a job or gets its job done and
     * is ready for another job to be assigned.
     *
     * There will be a callback that can be provided in the case when the vehicle is in a state
     * other than "ready" and it gets disconnected. We do not need to worry about a disconnection
     * callback when the vehicle is "ready" since it is in a stable state.
     */
    this.updateEventHandler.addHandler<VehicleStatus>('status', (value): boolean => {
      if (value === 'ready') {
        if (completionCallback) completionCallback();
        this.waitingForJobInfo = false;
      } else if (value === 'disconnected') {
        if (disconnectionCallback) disconnectionCallback();
      }
      return value === 'ready';
    });
  }

  /**
   * Starts the vehicle's job by giving the vehicle information. This will be called by the
   * Orchestrator when the user interface provides it with information for the job.
   */
  public startJob(job: Job): void {
    if (!this.waitingForJobInfo) {
      throw new Error('Vehicle has not been assigned a job yet. Assign the job before telling the vehicle to start.');
    }

    this.sendMessage({
      type: 'addMission',
      missionInfo: job.missionInfo,
    });
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

  // TODO: Make this function and get it to send message using Xbee.
  private sendMessage(message: Message): void { // eslint-disable-line
    /*
     * Xbee.send(this.vehicleId, message); or use MAC address, probably better to get this from
     * Xbee class though
     */
  }
}
