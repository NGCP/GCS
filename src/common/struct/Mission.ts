import { ipcRenderer } from 'electron';

import {
  config,
  JobType,
  vehicleConfig,
  VehicleInfo,
} from '../../static/index';

import {
  JSONMessage,
  messageTypeGuard,
  MissionInformation,
  MissionOptions,
  MissionParameters,
  Task,
  UpdateMessage,
} from '../../types/messages';
import { VehicleStatus } from '../../types/types';

import DictionaryList from './DictionaryList';
import Vehicle from './Vehicle';
import UpdateHandler from './UpdateHandler';

interface VehicleSignature { [vehicleId: string]: Vehicle }

interface VehicleMappingSignature { [vehicleId: string]: JobType }

type MissionStatus = 'ready' | 'initializing' | 'waiting' | 'running' | 'error';

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
   * Parameters for the mission. Used to generate tasks.
   * Subclasses implement which tasks get generated so this variable is protected.
   */
  protected parameters: MissionParameters;

  /**
   * Map of the id of the vehicle that is currently performing all tasks
   * related to the job type value. This is used from mission initliaization until
   * assigning jobs to vehicles. When mission starts, this gets reassigned to
   * waitingVehicles
   *
   * The values put together as an array must include all of the mission's job types.
   */
  private vehicleMapping: VehicleMappingSignature;

  /**
   * Map of the id of the vehicle to the task it is performing.
   */
  private activeTasks = new Map<number, Task>();

  /**
   * All tasks waiting to be executed, mapped by their job type.
   *
   * Note that these tasks will be set in the Mission superclass, but each subclass is responsible
   * of implementing the list of Tasks that are to be performed, in the order they are to be
   * performed.
   */
  private waitingTasks = new DictionaryList<Task>();

  /**
   * All vehicles waiting to be assigned a task, mapped by their job type.
   */
  private waitingVehicles = new DictionaryList<Vehicle>();

  /**
   * Callback to occur when
   */
  private completionCallback: (information: MissionInformation) => void;

  /**
   * Handles different states of the vehicle.
   */
  private statusEventHandler = new UpdateHandler();

  public constructor(
    completionCallback: (information: MissionInformation) => void,
    vehicles: VehicleSignature,
    information: MissionInformation,
    vehicleMapping: VehicleMappingSignature,
  ) {
    this.completionCallback = completionCallback;
    this.vehicles = vehicles;
    this.parameters = information.parameters;
    this.options = information.options;
    this.vehicleMapping = vehicleMapping;

    /*
     * Create event handler that will handle all changes of status:
     * 1. Will assignJobs if status changes to "initializing".
     * 2. Will start mission if status changs to "waiting".
     * 3. Will remove this handler if status goes back to "ready", which means:
     *    - mission was terminated before it completed
     *    - mission was terminated after it completed
     */
    this.statusEventHandler.addHandler<MissionStatus>('status', (status): boolean => {
      this.status = status;

      if (status === 'initializing') {
        this.assignJobs();
      } else if (status === 'waiting') {
        this.start();
      }

      return status === 'ready';
    });

    this.initialize();
  }

  /**
   * Initializes the mission. This is run first, and will run assignJobs if run successfully.
   * Will set status to "initlializing" after running successfully.
   */
  private initialize(): void {
    // Stops mission if mission is not in the "ready" state.
    if (this.status !== 'ready') {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Something wrong happened in ${this.missionName}`,
      });
      this.stop();
      this.statusEventHandler.event<MissionStatus>('status', 'ready');
      return;
    }

    // Fails to initialize if provided job types do not match up to this mission's job types
    if (!this.checkJobTypesAndActiveVehicles()) {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Provided jobs and/or assigned vehicles for ${this.missionName} is incorrect. Stopping mission`,
      });
      this.statusEventHandler.event<MissionStatus>('status', 'ready');
      return;
    }

    /*
     * Sets mission status to "initializing". This will trigger the assignJobs function.
     */
    this.statusEventHandler.event<MissionStatus>('status', 'initializing');
  }

  /**
   * Assigns vehicles the jobs. Will set the mission status to "waiting" once
   * all vehicles have been assigned their jobs successfully.
   */
  private assignJobs(): void {
    // Fails to assign jobs if mission is not in the "initializing" state.
    if (this.status !== 'initializing') {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Something wrong happened in ${this.missionName}`,
      });
      this.stop();
      this.statusEventHandler.event<MissionStatus>('status', 'ready');
      return;
    }

    let pendingVehicleIds = Object.keys(this.vehicleMapping);
    const assignedVehicleIds: string[] = [];

    /*
     * The three functions below are callbacks to when the vehicles connect.
     * I put them here for readability.
     */

    /**
     * Triggers when vehicle successfully receives the job assignment.
     */
    const onSuccess = (vehicleId: string): void => {
      // Remove pendingId when vehicle is assigned the job successfully.
      pendingVehicleIds = pendingVehicleIds.filter((v): boolean => v !== vehicleId);
      assignedVehicleIds.push(vehicleId);


      /*
       * Go to "waiting" state when all vehicles have been assigned a job.
       * This will trigger this.start().
       */
      if (pendingVehicleIds.length === 0) {
        ipcRenderer.send('post', 'updateMessages', {
          type: 'success',
          message: `Assigned jobs to all vehicles for ${this.missionName}`,
        });

        this.statusEventHandler.event<MissionStatus>('status', 'waiting');
      }
    };

    /**
     * Triggers when vehicle has disconnected.
     */
    const onDisconnect = (): void => {
      /*
       * Stop mission if any vehicle failed to get the job. Also stops sending messages
       * to any other vehicle if there is somehow a "start" message on queue.
       */
      ipcRenderer.send('post', 'stopSendingMessages');
      this.stop();
    };

    /**
     * Triggers when vehicle enters an error state.
     */
    const onError = (vehicleId: string, message?: string): void => {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'success',
        message: `${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name} has entered an error state in ${this.missionName}: ${message || 'No error message specified'}`,
      });

      this.handleUnresponsiveVehicle(vehicleId);
    };


    // Assign jobs to vehicles (only if that vehicle's job is relatable to this mission).
    pendingVehicleIds.forEach((vehicleId): void => {
      const jobType = this.vehicleMapping[vehicleId];
      if (this.jobTypes.has(jobType)) {
        this.vehicles[vehicleId].assignJob(jobType,
          (): void => onSuccess(vehicleId),
          (): void => onDisconnect(),
          (message): void => onError(vehicleId, message));
      }
    });
  }

  /**
   * Gets all the tasks and starts assigning them to vehicles.
   */
  private start(): void {
    // Fails to initialize if mission is not in the "ready" state.
    if (this.status !== 'waiting') {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Something wrong happened in ${this.missionName}`,
      });
      this.stop();
      this.statusEventHandler.event<MissionStatus>('status', 'ready');
      return;
    }

    // Adds all the tasks to the waitingTasks, if the jobType relates to this mission.
    const jobTasks = this.generateTasks();
    Object.keys(jobTasks).forEach((jobType): void => {
      if (vehicleConfig.isJobType(jobType) && this.jobTypes.has(jobType as JobType)) {
        this.waitingTasks.push(jobType, ...jobTasks.get(jobType) as Task[]);
      }
    });

    // Remaps the vehicleMapping to waitingVehicles (vehicleId => jobType to jobType => Vehicle[]).
    Object.keys(this.vehicleMapping).forEach((vehicleId): void => {
      const jobType = this.vehicleMapping[vehicleId];
      const vehicle = this.vehicles[vehicleId];

      this.waitingVehicles.push(jobType, vehicle);
    });

    /*
     * Assign tasks to vehicles. Will keep assigning tasks to vehicles until there is either
     * waiting vehicles or waiting tasks.
     */
    this.waitingVehicles.keys().forEach((jobType): void => {
      while (
        (this.waitingTasks.get(jobType) as Task[]).length > 0
        && (this.waitingVehicles.get(jobType) as Vehicle[]).length > 0
      ) {
        const task = this.waitingTasks.shift(jobType) as Task;
        const vehicle = this.waitingVehicles.shift(jobType) as Vehicle;

        vehicle.assignTask(task);
        this.activeTasks.set(vehicle.getVehicleId(), task);
      }
    });

    // Update mission status to "running".
    this.statusEventHandler.event('status', 'running');
  }

  /**
   * This will be called from the Orchestrator. The Orchestrator should make sure that the
   * vehicleId being provided is a valid vehicleId of a vehicle that was connected when the
   * mission was initialized.
   *
   * This is the event when a complete message has been sent from a vehicle. The mission
   * will either give that vehicle the next task or complete the mission.
   *
   * Subclasses can override this to check for even more types of messages.
   */
  public update(message: JSONMessage): void {
    /*
     * We run this statement in the case a vehicle goes to error, we keep track of its update
     * messages and see if it goes back to "running". Otherwise we will have to stop the
     * mission. See the handler that is created in the handleUnresponsiveVehicle() function.
     */
    if (this.status === 'error' && messageTypeGuard.isUpdateMessage(message)) {
      this.statusEventHandler.event('vehicleStatus', (message as UpdateMessage).status);
    }

    // The base mission class only checks for completion messages.
    if (messageTypeGuard.isCompleteMessage(message)) {
      const jobType = this.vehicleMapping[message.sid];

      if ((this.waitingTasks.get(jobType) as Task[]).length > 0) {
        // Assigns the next task in that job to the vehicle.
        const newTask = this.waitingTasks.shift(jobType) as Task;

        this.vehicles[message.sid].assignTask(newTask);
        this.activeTasks.set(message.sid, newTask);
      } else {
        // All tasks in that jobType are complete, so this vehicle will go back to waiting vehicles.
        this.waitingVehicles.push(jobType, this.vehicles[message.sid]);
        this.activeTasks.delete(message.sid);
      }

      /*
       * Will execute if mission is finally complete (no waiting tasks, no tasks happening).
       * This includes sending completeMission to the user interface and the Orchestrator as well
       * as perform a callback function that will use the terminated data (data that was obtained)
       * throughout the mission.
       */
      if (this.activeTasks.size === 0 && this.waitingTasks.size() === 0) {
        ipcRenderer.send('post', 'completeMission', this.missionName);
        this.completionCallback(this.generateTerminatedData());
        this.stop();
        this.statusEventHandler.event('status', 'ready');
      } else {
        // This should never happen. There is a big issue in the system if this somehow happens.
        ipcRenderer.send('post', 'updateMessages', {
          type: 'failure',
          message: `Mission completion failed in ${this.missionName}. Stopping mission`,
        });
        this.stop();
        this.statusEventHandler.event<MissionStatus>('status', 'ready');
      }
    }
  }

  /**
   * Adds a new task to the mission. Should only be called on its subclasses (probably through
   * an overriden update() function).
   */
  protected addTask(jobType: string, task: Task): void {
    // Fails to initialize if mission is not in the "ready" state.
    if (this.status !== 'running') {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Tried to add ${task.taskType} task while ${this.missionName} is not running`,
      });
      this.stop();
      this.statusEventHandler.event<MissionStatus>('status', 'ready');
      return;
    }

    /*
     * Assign the task right away if there is a vehicle waiting for a task for that
     * specific jobType. Otherwise just store it in waiting tasks so that when a vehicle
     * is available, it can perform that task.
     */
    if (this.waitingVehicles.get(jobType)
      && (this.waitingVehicles.get(jobType) as Vehicle[]).length > 0
    ) {
      const vehicle = this.waitingVehicles.shift(jobType) as Vehicle;
      vehicle.assignTask(task);
      this.activeTasks.set(vehicle.getVehicleId(), task);
    } else {
      this.waitingTasks.push(jobType, task);
    }
  }

  /**
   * Stops the mission (either means mission was stopped manually or mission was completed).
   */
  private stop(): void {
    Object.keys(this.vehicleMapping).forEach((vehicleId): void => {
      this.vehicles[vehicleId].stop();
    });
    /*
     * TODO: Print out the output data for this mission, so that we do not have to start over from
     * step 1.
     */
  }

  /**
   * Check to ensure the following:
   * 1. All job types provided cover the required job types for this mission.
   * 2. There is a vehicle assigned to each job type.
   *
   * @param vehicleMapping User provided map of vehicle to their job type, function will check
   * if this mapping is valid.
   */
  private checkJobTypesAndActiveVehicles(): boolean {
    const vehicleIds = Object.keys(this.vehicleMapping);

    // Create a set of the job types provided by vehicleMapping
    const activeJobTypes = new Set<JobType>();
    vehicleIds.forEach((vehicleId): void => {
      activeJobTypes.add(this.vehicleMapping[vehicleId]);
    });

    // Check #1: ensure the jobs in the vehicleMapping cover the required jobs for this mission.
    if (!Array.from(this.jobTypes).every((jobType): boolean => activeJobTypes.has(jobType))) {
      return false;
    }

    /*
     * Check #2: if all jobs in the vehicleMapping cover the required jobs for the mission, then
     * there is a vehicle mapped for every job already. We need to check that all these vehicles
     * are in the "ready" state too.
     */
    if (!vehicleIds.every((vehicleId): boolean => this.vehicles[vehicleId].getStatus() === 'ready')) {
      return false;
    }

    return true;
  }

  /**
   * Handles a vehicle in an error state. We will give the vehicle a few seconds to get
   * out of error state before ending the mission and log that user should take manual
   * control of the vehicle as soon as possible.
   */
  private handleUnresponsiveVehicle(vehicleId: string): void {
    ipcRenderer.send('post', 'updateMessages', {
      type: 'progress',
      message: `Will see if the vehicle will exit the error state within ${config.vehicleAllowedErrorTime} seconds`,
    });

    this.status = 'error';

    this.statusEventHandler.addHandler('vehicleStatus',
      (status: VehicleStatus): boolean => status !== 'error',
      {
        callback: (): void => {
          ipcRenderer.send('post', 'updateMessages', {
            type: 'progress',
            message: `${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name} failed to exit the error state on time. Stopping mission. User, take manual control of vehicle as soon as possible`,
          });
        },
        time: config.vehicleDisconnectionTime * 1000,
      });
  }

  /**
   * Generates all tasks to perform, given this.options and this.parameters.
   */
  protected abstract generateTasks(): DictionaryList<Task>;

  /**
   * Generates data that comes out of the specific mission, either to be given to the user
   * or to the next mission. The data should be formatted to support the next mission.
   */
  protected abstract generateTerminatedData(): MissionInformation;
}
