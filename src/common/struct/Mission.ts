import { ipcRenderer } from 'electron';

import { JobType, vehicleConfig, VehicleInfo } from '../../static/index';

import {
  MissionOptions,
  MissionParameters,
//  Task,
} from '../../types/messages';
import { VehicleStatus } from '../../types/types';

// import DictionaryList from './DictionaryList';
import Vehicle from './Vehicle';

interface VehicleSignature { [vehicleId: string]: Vehicle }

interface ActiveVehicleSignature { [vehicleId: string]: JobType }

type MissionStatus = VehicleStatus | 'initializing';

/**
 * Mission backend for the GCS. Automatically creates and assigns tasks. No provided value should
 * be undefined (specifically the vehicle mapping).
 */
export default abstract class Mission {
  /**
   * Name of mission.
   */
  protected abstract missionName: string;

  /**
   * Related job types to the mission.
   */
  protected abstract jobTypes: Set<JobType>;

  /**
   * All connected vehicles (at least when this class was created).
   */
  private vehicles: VehicleSignature;

  /**
   * Current status of mission.
   */
  private status: MissionStatus = 'ready';

  /**
   * Options for the mission. Generated from the constructor's parameters variable.
   * This can determine which tasks are generated as well as other potential things.
   * Subclasses implement which tasks get generated so this variable is protected.
   */
  protected options: MissionOptions;

  /**
   * Map of the id of the vehicle that is currently performing all tasks
   * related to the job type value.
   *
   * The values put together as an array must include all of the mission's job types.
   */
  private activeVehicles: ActiveVehicleSignature;

  /**
   * All tasks waiting to be executed, mapped by their job type.
   *
   * Note that these tasks will be set in the Mission superclass, but each subclass is responsible
   * of implementing the list of Tasks that are to be performed, in the order they are to be
   * performed.
   */
  // private waitingTasks: DictionaryList<Task>;

  /**
   * All vehicles waiting to be assigned a task, mapped by their job type.
   */
  // private waitingVehicles: DictionaryList<Vehicle>;

  public constructor(
    vehicles: VehicleSignature,
    parameters: MissionParameters,
    activeVehicles: ActiveVehicleSignature,
  ) {
    this.vehicles = vehicles;
    this.options = parameters.options;
    this.activeVehicles = activeVehicles;
  }

  public initialize(): void {
    // Fails to initialize if mission is not in the "ready" state.
    if (this.status !== 'ready') {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Something wrong happened in ${this.missionName}`,
      });
      return;
    }

    // Fails to initialize if provided job types do not match up to this mission's job types
    if (!this.checkJobTypesAndActiveVehicles()) {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Provided jobs and/or assigned vehicles for ${this.missionName} is incorrect. Stopping mission`,
      });
      return;
    }

    let pendingVehicleIds = Object.keys(this.activeVehicles);
    const assignedVehicleIds: string[] = [];

    // TODO: improve readability by creating more functions.

    // Assign jobs to vehicles (only if that vehicle's job is relatable to this mission).
    pendingVehicleIds.forEach((vehicleId): void => {
      const jobType = this.activeVehicles[vehicleId];
      if (this.jobTypes.has(jobType)) {
        this.vehicles[vehicleId].assignJob(jobType, (): void => {
          // Remove pendingId when vehicle is assigned the job successfully.
          pendingVehicleIds = pendingVehicleIds.filter((v): boolean => v !== vehicleId);
          assignedVehicleIds.push(vehicleId);

          // Go to "waiting" state when all vehicles have been assigned a job.
          if (pendingVehicleIds.length === 0) {
            this.status = 'waiting';

            ipcRenderer.send('post', 'updateMessages', {
              type: 'success',
              message: `Assigned jobs to all vehicles for ${this.missionName}`,
            });
          }
        }, (): void => {
          /*
           * Stop mission if any vehicle failed to get the job.
           * TODO: Clear the outbox of the message handler, to stop any other start messages
           * to come to any othe vehicle.
           */
          this.stopMission();

          ipcRenderer.send('post', 'updateMessages', {
            type: 'success',
            message: `Assigning jobs took too long, stopped ${this.missionName}`,
          });
        }, (message): void => {
          ipcRenderer.send('post', 'updateMessages', {
            type: 'success',
            message: `${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name} has entered an error state in ${this.missionName}: ${message || 'No error message specified'}`,
          });
        });
      }
    });

    this.status = 'initializing';
  }

  /**
   * Check to ensure the following:
   * 1. All job types provided cover the required job types for this mission.
   * 2. There is a vehicle assigned to each job type.
   *
   * @param activeVehicles User provided map of vehicle to their job type, function will check
   * if this mapping is valid.
   */
  private checkJobTypesAndActiveVehicles(): boolean {
    const vehicleIds = Object.keys(this.activeVehicles);

    // Create a set of the job types provided by activeVehicles
    const activeJobTypes = new Set<JobType>();
    vehicleIds.forEach((vehicleId): void => {
      activeJobTypes.add(this.activeVehicles[vehicleId]);
    });

    // Check #1: ensure the jobs in the activeVehicles cover the required jobs for this mission.
    if (!Array.from(this.jobTypes).every((jobType): boolean => activeJobTypes.has(jobType))) {
      return false;
    }

    /*
     * Check #2: if all jobs in the activeVehicles cover the required jobs for the mission, then
     * there is a vehicle mapped for every job already. We need to check that all these vehicles
     * are in the "ready" state too.
     */
    if (!vehicleIds.every((vehicleId): boolean => this.vehicles[vehicleId].getStatus() === 'ready')) {
      return false;
    }

    return true;
  }

  /**
   * Stops the mission.
   */
  private stopMission(): void {
    Object.keys(this.activeVehicles).forEach((vehicleId): void => {
      this.vehicles[vehicleId].stop();
    });
  }
}
