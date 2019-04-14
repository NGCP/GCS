import { ipcRenderer } from 'electron';

import {
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

import { searchIndex } from '../../util/util';

import DictionaryList from './DictionaryList';
import Vehicle from './Vehicle';
import UpdateHandler from './UpdateHandler';

type MissionStatus = 'ready' | 'initializing' | 'waiting' | 'running';

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
  private vehicles: { [vehicleId: string]: Vehicle };

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
   * The values put together as an array must equal all of the mission's job types.
   * There will be no job types in this mapping that are irrelevant to the mission.
   */
  private activeVehicleMapping: { [vehicleId: string]: JobType } = {};

  /**
   * Comparison to how tasks are added to the waiting task list. If there is no
   * comparison function specified for the jobType, then jobs will be added and taken
   * on a FILO order (queue).
   */
  protected abstract addTaskCompare: { [jobType: string]: (a: Task, b: Task) => number };

  /**
   * Map of the id of the vehicle to the task it is performing.
   */
  private activeTasks = new Map<string, Task>();

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
    vehicles: { [vehicleId: string]: Vehicle },
    information: MissionInformation,
    activeVehicleMapping: { [vehicleId: string]: JobType },
  ) {
    this.completionCallback = completionCallback;
    this.vehicles = vehicles;
    this.parameters = information.parameters;
    this.options = information.options;

    /*
     * TODO: Allow the user to select more than one vehicle for a job. The vehicles can be used
     * as backup in the case that the first vehicle goes on an error state.
     */

    /*
     * Filters out any irrelevant jobs when adding to activeVehicleMapping in the case that
     * extra jobs were included in the mapping.
     */
    Object.keys(activeVehicleMapping).forEach((vehicleId): void => {
      const jobType = activeVehicleMapping[vehicleId];
      if (this.jobTypes.has(jobType)) {
        this.activeVehicleMapping[vehicleId] = jobType;
      }
    });

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
      this.stop(false);
      return;
    }

    // Fails to initialize if provided job types do not match up to this mission's job types.
    if (!this.checkJobTypesAndActiveVehicles()) {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Provided vehicles for ${this.missionName} is incomplete. Stopping mission`,
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
      this.stop(false);
      return;
    }

    let pendingVehicleIds = Object.keys(this.activeVehicleMapping);
    const assignedVehicleIds: string[] = [];

    /*
     * The three functions below are callbacks to when we assign the vehicle its job.
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
     * Triggers when vehicle fails to accept the job assignment.
     */
    const onDisconnect = (): void => {
      /*
       * Stop mission if any vehicle failed to get the job. Also stops sending messages
       * to any other vehicle if there is somehow a "start" message on queue.
       */
      ipcRenderer.send('post', 'stopSendingMessages');
      this.stop(false);
    };

    /**
     * Triggers when vehicle performing job enters an error state.
     */
    const onError = (vehicleId: string, message?: string): void => {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'success',
        message: `${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name} has entered an error state in ${this.missionName}: ${message || 'No error message specified'}`,
      });

      this.handleUnresponsiveVehicle(vehicleId);
    };

    // Assign jobs to vehicles.
    pendingVehicleIds.forEach((vehicleId): void => {
      const jobType = this.activeVehicleMapping[vehicleId];

      this.vehicles[vehicleId].assignJob(jobType,
        (): void => onSuccess(vehicleId),
        (): void => onDisconnect(),
        (message): void => onError(vehicleId, message));
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
      this.stop(false);
      return;
    }

    // Adds all the tasks to the waitingTasks, if the task's jobType relates to this mission.
    const jobTasks = this.generateTasks();
    Object.keys(jobTasks).forEach((jobType): void => {
      if (vehicleConfig.isJobType(jobType) && this.jobTypes.has(jobType as JobType)) {
        if (this.addTaskCompare[jobType]) {
          // Will happen if there is a compare for this job type.
          (jobTasks.get(jobType) as Task[]).forEach((task): void => {
            const index = searchIndex(
              this.waitingTasks.get(jobType) || [],
              task,
              this.addTaskCompare[jobType],
            );
            this.waitingTasks.insert(jobType, index, task);
          });
        } else {
          this.waitingTasks.push(jobType, ...jobTasks.get(jobType) as Task[]);
        }
      }
    });

    /*
     * Remaps the activeVehicleMapping to waitingVehicles
     * (vehicleId => jobType to jobType => Vehicle[]).
     *
     * Using waitingVehicles to assign vehicles tasks is faster than using activeVehicleMapping,
     * hence we need waitingVehicles. It is also more easy to understand.
     */
    Object.keys(this.activeVehicleMapping).forEach((vehicleId): void => {
      const jobType = this.activeVehicleMapping[vehicleId];
      const vehicle = this.vehicles[vehicleId];

      this.waitingVehicles.push(jobType, vehicle);
    });

    /*
     * Assign tasks to vehicles. Will keep assigning tasks to vehicles until there is either
     * no more available waiting vehicles or no more available waiting tasks.
     *
     * We add these tasks to activeTasks, where we keep track of all tasks that are being executed.
     * The mission is done when there are no more tasks inside activeTasks, as well as no more
     * tasks in waitingTasks.
     */
    this.waitingVehicles.keys().forEach((jobType): void => {
      while (
        (this.waitingTasks.get(jobType) as Task[]).length > 0
        && (this.waitingVehicles.get(jobType) as Vehicle[]).length > 0
      ) {
        const task = this.waitingTasks.shift(jobType) as Task;
        const vehicle = this.waitingVehicles.shift(jobType) as Vehicle;

        vehicle.assignTask(task);
        this.activeTasks.set(`${vehicle.getVehicleId()}`, task);
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
   * Subclasses can override this to check for even more types of messages.
   */
  public update(message: JSONMessage): void {
    /*
     * The base mission class only checks for update and completion messages. The base class will
     * either reassign the vehicle the task, put the vehicle to wait for further tasks,
     * or complete the mission when it receives a completion message. The update message
     * is to simply keep its track of vehicles up to date.
     */

    if (messageTypeGuard.isUpdateMessage(message)) {
      this.vehicles[message.sid].update(message as UpdateMessage);
    }

    if (messageTypeGuard.isCompleteMessage(message)) {
      const jobType = this.activeVehicleMapping[message.sid];

      if ((this.waitingTasks.get(jobType) as Task[]).length > 0) {
        // Assigns the next task in that job to the vehicle.
        const newTask = this.waitingTasks.shift(jobType) as Task;

        this.vehicles[message.sid].assignTask(newTask);
        this.activeTasks.set(`${message.sid}`, newTask);
      } else {
        // All tasks in that jobType are complete, so this vehicle will go back to waiting vehicles.
        this.waitingVehicles.push(jobType, this.vehicles[message.sid]);
        this.activeTasks.delete(`${message.sid}`);
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
        this.stop(true);
      } else {
        // This should never happen. There is a big issue in the system if this somehow happens.
        ipcRenderer.send('post', 'updateMessages', {
          type: 'failure',
          message: `Mission completion failed in ${this.missionName}. Stopping mission`,
        });
        this.stop(false);
      }
    }
  }

  /**
   * Adds a new task to the mission. Should only be called on its subclasses to add a task.
   * For example, add tasks as certain information is found while the mission happens, or
   * when user needs a vehicle to manually perform a task before another.
   *
   * @param jobType The job to add the task to.
   * @param task The task object itself.
   * @param addToFront True if the task should be added to the front of the queue
   * instead of the back.
   */
  protected addTask(jobType: string, task: Task, addToFront?: boolean): void {
    // Fails to initialize if mission is not in the "ready" state.
    if (this.status !== 'running') {
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: `Tried to add ${task.taskType} task while ${this.missionName} is not running`,
      });
      this.stop(false);
      return;
    }

    if (this.waitingVehicles.get(jobType)
      && (this.waitingVehicles.get(jobType) as Vehicle[]).length > 0
    ) {
      /*
       * Assign the task right away if there is a vehicle waiting for a task for that
       * specific jobType.
       */
      const vehicle = this.waitingVehicles.shift(jobType) as Vehicle;
      vehicle.assignTask(task);
      this.activeTasks.set(`${vehicle.getVehicleId()}`, task);
    } else if (addToFront) {
      // Add to front of waitingTasks if requested.
      this.waitingTasks.unshift(jobType, task);
    } else if (this.addTaskCompare[jobType] && this.waitingTasks.get(jobType)) {
      /*
       * Add to proper spot in task (these tasks in this job are ordered) if there
       * is a compare function.
       */
      const index = searchIndex(
        this.waitingTasks.get(jobType) as Task[],
        task,
        this.addTaskCompare[jobType],
      );
      this.waitingTasks.insert(jobType, index, task);
    } else {
      // Simply add the task to the back of the list.
      this.waitingTasks.push(jobType, task);
    }
  }

  /**
   * Stops the mission (either means mission was stopped manually or mission was completed).
   * Will print out terminated data (this mission's parameters) if the mission was
   * stopped through an error (or manually stopped).
   *
   * @param success True if the mission was completed, false if the mission was stopped
   * manually/through error.
   */
  private stop(success: boolean): void {
    Object.keys(this.activeVehicleMapping).forEach((vehicleId): void => {
      this.vehicles[vehicleId].stop();
    });

    this.statusEventHandler.event('status', 'ready');

    if (!success) {
      ipcRenderer.send('post', 'updateMessage', {
        type: 'success',
        message: `Terminated data: ${JSON.stringify(this.parameters)}`,
      });
    }
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
   * @param activeVehicleMapping User provided map of vehicle to their job type, function will check
   * if this mapping is valid.
   */
  private checkJobTypesAndActiveVehicles(): boolean {
    const vehicleIds = Object.keys(this.activeVehicleMapping);

    /*
     * Check #1: ensure the jobs in the activeVehicleMapping cover the required jobs for this
     * mission.
     */
    if (!Array.from(Object.keys(this.activeVehicleMapping)).every(
      (vehicleId): boolean => this.jobTypes.has(this.activeVehicleMapping[vehicleId]),
    )) {
      return false;
    }

    /*
     * Check #2: if all jobs in the activeVehicleMapping cover the required jobs for the mission,
     * then there is a vehicle mapped for every job already. We need to check that all these
     * vehicles are in the "ready" state too.
     */
    if (!vehicleIds.every((vehicleId): boolean => this.vehicles[vehicleId].getStatus() === 'ready')) {
      return false;
    }

    return true;
  }

  /**
   * Handles a vehicle that is assigned a job when it goes to an error state. Tries to assign
   * another vehicle that can perform the same task and remove that vehicle. If not possible,
   * simply stops the mission.
   *
   * If no tasks is being executed, stop the mission.
   *
   * This never gets executed while mission's status is "ready", since no vehicles are assigned
   * then.
   */
  private handleUnresponsiveVehicle(vehicleId: string): void {
    /*
     * In the case that a vehicle that is not performing a job is in an error state
     * and somehow this function gets called (which it shouldn't), let the vehicle
     * be.
     *
     * Again, this should never be called for a vehicle that is not performing a job.
     * All vehicles in the "ready" state are assumed to be stable (whether they're airborne,
     * underwater, or on land).
     */
    if (!this.activeVehicleMapping[vehicleId]) return;

    if (this.status === 'waiting') {
      // Simply exit the mission if we are in the "waiting" stage.
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: 'Exiting mission due to vehicle in error state, take manual control over vehicle',
      });
      this.stop(false);
    } else if (this.status === 'initializing') {
      /*
       * Stop sending all extra start messages and exit the mission.
       * See assignJobs for similar logic.
       */
      ipcRenderer.send('post', 'updateMessages', {
        type: 'failure',
        message: 'Exiting mission due to vehicle in error state, take manual control over vehicle',
      });
      ipcRenderer.send('post', 'stopSendingMessages');
      this.stop(false);
    } else {
      const jobType = this.activeVehicleMapping[vehicleId];

      // Delete the error vehicle from vehicle mapping.
      delete this.activeVehicleMapping[vehicleId];

      /*
       * Delete the task related to error vehicle and insert it to front of waitingTasks.
       * It is possible that there is no tasks related to the vehicle and that the
       * vehicle has errored out while waiting to be assigned a task (vehicle status was
       * "waiting").
       */
      if (this.activeTasks.has(vehicleId)) {
        const task = this.activeTasks.get(vehicleId) as Task;
        this.activeTasks.delete(vehicleId);

        this.addTask(jobType, task, true);
      }

      /*
       * Try to reassign that task (if there was one) to a waiting vehicle that can
       * perform that job.
       */
      const newVehicle = this.waitingVehicles.shift(jobType);
      const task = this.waitingTasks.shift(jobType);
      if (newVehicle && task) {
        this.activeVehicleMapping[`${newVehicle.getVehicleId()}`] = jobType;

        newVehicle.assignTask(task);
        this.activeTasks.set(`${newVehicle.getVehicleId()}`, task);
      } else {
        ipcRenderer.send('post', 'updateMessages', {
          type: 'failure',
          message: 'Exiting mission due to vehicle in error state, take manual control over vehicle',
        });
        this.stop(false);
      }
    }
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
