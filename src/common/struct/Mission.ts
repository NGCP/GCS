import { JobType, vehicleConfig, VehicleInfo } from '../../static/index';

import * as Message from '../../types/message';
import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

import ipc from '../../util/ipc';
import { searchIndex } from '../../util/util';

import DictionaryList from './DictionaryList';
import Vehicle from './Vehicle';
import UpdateHandler from './UpdateHandler';

export type MissionStatus = 'ready' | 'initializing' | 'waiting' | 'running';

export type CompareTaskFunction = (a: Task, b: Task) => number;

/**
 * Mission backend for the GCS. Automatically creates and assigns tasks. No provided value should
 * be undefined (specifically the vehicle mapping).
 */
export default abstract class Mission {
  /**
   * Name of mission.
   */
  protected abstract missionName: MissionInformation.MissionName;

  /**
   * Related job types to the mission.
   */
  protected abstract jobTypes: Set<JobType>;

  /**
   * All connected vehicles (at least when this class was created).
   */
  protected vehicles: { [vehicleId: number]: Vehicle };

  /**
   * Current status of mission.
   */
  private status: MissionStatus = 'ready';

  /**
   * Information for this mission, has three fields:
   * 1. The mission's name.
   * 2. Options for the mission. Generated from the constructor's parameters variable.
   *    This can determine which tasks are generated as well as other potential things.
   *    Subclasses implement which tasks get generated so this variable is protected.
   * 3. Parameters for the mission. Used to generate tasks.
   *    Subclasses implement which tasks get generated so this variable is protected.
   */
  protected information: MissionInformation.Information;

  /**
   * Map of the id of the vehicle that is currently performing all tasks
   * to the job they're for.
   *
   * There will be no job types in this mapping that are irrelevant to the mission.
   */
  protected activeVehicleMapping: MissionInformation.ActiveVehicleMapping;

  /**
   * Options to generate tasks for the mission.
   */
  protected options: MissionInformation.MissionOptions;

  /**
   * Comparison to how tasks are added to the waiting task list. If there is no
   * comparison function specified for the jobType, then jobs will be added and taken
   * on a FILO order (queue).
   */
  protected abstract addTaskCompare:
  { [jobType: string]: CompareTaskFunction | undefined };

  /**
   * Map of the id of the vehicle to the task it is performing.
   */
  private activeTasks = new Map<number, Task>();

  /**
   * All tasks waiting to be executed, mapped by their job type.
   *
   * Note that these tasks will be set in the Mission superclass. Subclasses are in charge
   * of generating the tasks from the generateTasks() function. Subclasses can also add more
   * tasks as the mission goes through the update function.
   */
  private waitingTasks = new DictionaryList<Task>();

  /**
   * All vehicles waiting to be assigned a task, mapped by their job type.
   */
  private waitingVehicles = new DictionaryList<Vehicle>();

  /**
   * Automates the mission by handling its different states.
   */
  private statusEventHandler = new UpdateHandler();

  public constructor(
    vehicles: { [vehicleId: number]: Vehicle },
    information: MissionInformation.Information,
    activeVehicleMapping: MissionInformation.ActiveVehicleMapping,
    options: MissionInformation.MissionOptions,
  ) {
    this.vehicles = vehicles;
    this.information = information;
    this.options = options;
    this.activeVehicleMapping = activeVehicleMapping;

    /*
     * Create event handler that will handle all changes of mission status:
     * 1. Runs assignJobs() when status changes to "initializing".
     * 2. Runs startMission() when status changs to "waiting".
     * 3. Removes this handler when status goes back to "ready", which means:
     *    - mission was terminated
     *    - mission was completed
     */
    this.statusEventHandler.addHandler<MissionStatus>('status', (status): boolean => {
      this.status = status;

      if (status === 'initializing') {
        this.assignJobs();
      } else if (status === 'waiting') {
        this.startMission();
      }

      return status === 'ready';
    });
  }

  /**
   * Gets current status of mission.
   */
  public getStatus(): MissionStatus {
    return this.status;
  }

  /**
   * Gets vehicles passed on to mission when mission started.
   */
  public getVehicles(): { [vehicleId: number]: Vehicle } {
    return this.vehicles;
  }

  /**
   * Initializes the mission. Called from the Message's constructor.
   * Will set status to "initializing" if mission successfully initializes.
   */
  public initialize(): void {
    if (this.status !== 'ready') {
      this.stop(false, `Something wrong happened in ${this.missionName} mission`);
      return;
    }

    // Fails to initialize if provided job types do not match up to this mission's job types.
    if (!this.checkActiveVehicleMapping()) {
      this.stop(false, `Provided active vehicle mapping for ${this.missionName} is incomplete`);
      return;
    }

    this.statusEventHandler.event<MissionStatus>('status', 'initializing');
  }

  /**
   * Assigns vehicles the jobs to complete this mission. Called by statusEventHandler
   * after initialize(). Will set status to "waiting" if mission successfully
   * assigns jobs to vehicles.
   */
  private assignJobs(): void {
    if (this.status !== 'initializing') {
      this.stop(false, `Something wrong happened in ${this.missionName} mission`);
      return;
    }

    const pendingAssignVehicleIds = Object.keys(this.activeVehicleMapping[this.missionName])
      .map((vehicleIdString): number => parseInt(vehicleIdString, 10));

    const allVehiclesReady = pendingAssignVehicleIds.every((vehicleId): boolean => this.vehicles[vehicleId].getStatus() === 'ready');

    if (!allVehiclesReady) {
      this.stop(false, `Cannot assign jobs to all vehicles in ${this.missionName} as some are not in a ready state`);
      return;
    }

    /**
     * Callback when a vehicle successfully receives the job assignment.
     * Go to "waiting" state when all vehicles have been assigned a job.
     */
    const onSuccess = (vehicleId: number): void => {
      pendingAssignVehicleIds.splice(pendingAssignVehicleIds.indexOf(vehicleId), 1);

      if (pendingAssignVehicleIds.length === 0) {
        ipc.postLogMessages({
          type: 'success',
          message: `Assigned jobs to all vehicles for ${this.missionName} mission`,
        });

        this.statusEventHandler.event<MissionStatus>('status', 'waiting');
      }
    };

    /**
     * Callback when a vehicle fails to acknowledge the job assignment.
     */
    const onDisconnect = (vehicleId: number): void => {
      ipc.postStopSendingMessages();
      this.stop(false, `Failed to assign job to ${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name}, as it has disconnected`);
    };

    /**
     * Callback when a vehicle performing a job enters an error state.
     */
    const onError = (vehicleId: number, message?: string): void => {
      ipc.postLogMessages({
        type: 'failure',
        message: `${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name} has entered an error state in ${this.missionName}: ${message || 'No error message specified'}`,
      });

      this.handleUnresponsiveVehicle(vehicleId);
    };

    pendingAssignVehicleIds.forEach((vehicleId): void => {
      const jobType = this.activeVehicleMapping[this.missionName][vehicleId];

      this.vehicles[vehicleId].assignJob(jobType,
        (): void => onSuccess(vehicleId),
        (): void => onDisconnect(vehicleId),
        (message): void => onError(vehicleId, message));
    });
  }

  /**
   * Gets all the tasks and starts assigning them to vehicles. Called by statusEventHandler
   * after assignJobs(). Will set status to "running" if mission successfully
   * assign tasks to vehicles.
   */
  private startMission(): void {
    if (this.status !== 'waiting') {
      this.stop(false, `Something wrong happened in ${this.missionName} mission`);
      return;
    }

    const jobTasks = this.generateTasks();
    if (!jobTasks) {
      this.stop(false, `No tasks were generated from ${this.missionName}`);
      return;
    }

    const allValidTasksForJobs = jobTasks.keys()
      .every((jobType): boolean => vehicleConfig.isValidJobType(jobType as JobType)
        || jobTasks.every(jobType, (task): boolean => !vehicleConfig.isValidTaskTypeForJob(
          task.taskType,
          jobType as JobType,
        )));

    if (!allValidTasksForJobs) {
      this.stop(false, `Generated tasks in ${this.missionName} are invalid for their respective jobs`);
      return;
    }

    jobTasks.keys().forEach((jobType): void => {
      if (this.jobTypes.has(jobType as JobType)) {
        // Adds tasks in custom order if there is a compare provided for that job type.
        if (this.addTaskCompare[jobType]) {
          jobTasks.forEach(jobType, (task): void => {
            const index = searchIndex(
              this.waitingTasks.get(jobType) || [],
              task,
              this.addTaskCompare[jobType] as CompareTaskFunction,
            );

            this.waitingTasks.insert(jobType, index, task);
          });
        } else {
          this.waitingTasks.push(jobType, ...(jobTasks.get(jobType) || []));
        }
      }
    });

    const pendingAssignVehicleIds = Object.keys(this.activeVehicleMapping[this.missionName]).map(
      (vehicleIdString): number => parseInt(vehicleIdString, 10),
    );

    // Puts vehicles in activeVehicleMapping to waitingVehicles.
    pendingAssignVehicleIds.forEach((vehicleId): void => {
      const jobType = this.activeVehicleMapping[this.missionName][vehicleId];
      const vehicle = this.vehicles[vehicleId];

      this.waitingVehicles.push(jobType, vehicle);
    });

    const allVehiclesWaiting = pendingAssignVehicleIds.some(
      (vehicleId): boolean => this.vehicles[vehicleId].getStatus() !== 'waiting',
    );

    if (!allVehiclesWaiting) {
      this.stop(false, `Cannot assign tasks to all vehicles in ${this.missionName} as some are not in a waiting state`);
      return;
    }

    /*
     * Assign tasks to vehicles. Will keep assigning tasks to vehicles until there is either
     * no more available waiting vehicles or no more available waiting tasks.
     *
     * The mission is done when there are no more tasks inside activeTasks, as well as no more
     * tasks in waitingTasks.
     */
    this.waitingVehicles.keys().forEach((jobType): void => {
      while (this.waitingTasks.size(jobType) > 0 && this.waitingVehicles.size(jobType) > 0) {
        const task = this.waitingTasks.shift(jobType) as Task;
        const vehicle = this.waitingVehicles.shift(jobType) as Vehicle;

        this.assignTask(vehicle, task);
        this.activeTasks.set(vehicle.getVehicleId(), task);
      }
    });

    this.statusEventHandler.event('status', 'running');
  }

  /**
   * This will be called from the Orchestrator. The Orchestrator should make sure that the
   * vehicleId being provided is a valid vehicleId of a vehicle that was connected when the
   * mission was initialized.
   *
   * Subclasses can override this to check for even more types of messages.
   */
  public update(jsonMessage: Message.JSONMessage): void {
    if (Message.TypeGuard.isUpdateMessage(jsonMessage)) {
      this.vehicles[jsonMessage.sid].update(jsonMessage);
    }

    if (Message.TypeGuard.isCompleteMessage(jsonMessage)) {
      const jobType = this.activeVehicleMapping[this.missionName][jsonMessage.sid];

      /*
       * Mission is not yet finished, continue to assign tasks. One of the following will happen:
       * 1. Assigns next task to vehicle.
       * 2. Puts vehicle to waitingVehicles until new task for that job arrives.
       */
      if (this.waitingTasks.size(jobType) > 0) {
        const newTask = this.waitingTasks.shift(jobType) as Task;

        if (!this.assignTask(this.vehicles[jsonMessage.sid], newTask)) return;
        this.activeTasks.set(jsonMessage.sid, newTask);
      } else {
        this.waitingVehicles.push(jobType, this.vehicles[jsonMessage.sid]);
        this.activeTasks.delete(jsonMessage.sid);
      }

      // Mission is finished.
      if (this.activeTasks.size === 0 && this.waitingTasks.size() === 0) {
        this.stop(true);
      } else {
        this.stop(false, `${this.missionName} is not able to complete`); // Should never happen.
      }
    }
  }

  /**
   * Support function to a new task to the mission. Should only be called on its subclasses
   * to add a task.
   *
   * @param jobType The job to add the task to.
   * @param task The task object itself.
   * @param addToFront True if the task should be added to the front of the queue
   * instead of the back.
   */
  protected addTask(jobType: JobType, task: Task, addToFront?: boolean): void {
    if (this.status !== 'running') {
      this.stop(false, `Tried to add ${task.taskType} task while ${this.missionName} is not running`);
      return;
    }

    /*
     * One of the four will happen:
     * 1. Assign task to vehicle right away, if a vehicle is in waitingVehicles.
     * 2. Add task to front of waitingTasks if user wants it in the front.
     * 3. Add tasks in custom order if there is a compare provided for that job type.
     * 4. Add task to the back of waitingTasks (default).
     */
    const vehicle = this.waitingVehicles.shift(jobType);
    if (vehicle) {
      if (!this.assignTask(vehicle, task)) return;
      this.activeTasks.set(vehicle.getVehicleId(), task);
    } else if (addToFront) {
      this.waitingTasks.unshift(jobType, task);
    } else if (this.addTaskCompare[jobType] && this.waitingTasks.get(jobType)) {
      const index = searchIndex(
        this.waitingTasks.get(jobType) as Task[],
        task,
        this.addTaskCompare[jobType] as CompareTaskFunction,
      );
      this.waitingTasks.insert(jobType, index, task);
    } else {
      this.waitingTasks.push(jobType, task);
    }
  }

  /**
   * Support function to assign a task to a vehicle. Stops mission if mission
   * fails to assign task to vehicle.
   *
   * @param vehicle Vehicle to assign task to.
   * @param task Task to assign vehicle.
   */
  private assignTask(vehicle: Vehicle, task: Task): boolean {
    const success = vehicle.assignTask(task);

    if (!success) {
      ipc.postStopSendingMessages();
      this.stop(false, `Failed to assign task to ${(vehicleConfig.vehicleInfos[vehicle.getVehicleId()] as VehicleInfo).name} as it was not in a waiting state`);
    }

    return success;
  }

  /**
   * Support function to stop the mission. Mission is stopped when an error occurs and it needs
   * to be terminated, or when all tasks are successfully finished.
   *
   * @param success True if the mission was completed, false if the mission was stopped
   * manually/through error.
   * @param error The error message (if success === false).
   */
  private stop(success: boolean, error?: string): void {
    if (this.status !== 'ready') {
      if (this.status === 'initializing') ipc.postStopSendingMessages();

      Object.keys(this.activeVehicleMapping[this.missionName]).forEach((vehicleIdString): void => {
        const vehicleId = parseInt(vehicleIdString, 10);
        this.vehicles[vehicleId].stop();
      });
    }

    this.statusEventHandler.event('status', 'ready');

    /*
     * Generates and prints out parameters. Completion parameters are parameters used
     * for the next mission, and termination parameters are the parameters used for this
     * mission.
     */
    if (success) {
      const completionParameters = this.generateCompletionParameters();
      if (!completionParameters) {
        this.stop(false, `No parameters were generated from ${this.missionName}`);
        return;
      }

      ipc.postCompleteMission(this.missionName, completionParameters);
      ipc.postLogMessages({
        type: 'success',
        message: `Completion parameters for ${this.missionName}: ${JSON.stringify(completionParameters)}`,
      });
    } else {
      ipc.postStopMissions();
      ipc.postLogMessages({
        type: 'failure',
        message: `Stopped ${this.missionName} mission: ${error}`,
      }, {
        message: `Terminated parameters for ${this.missionName}: ${JSON.stringify(this.information.parameters)}`,
      });
    }
  }

  /**
   * Support function to check that the provided activeVehicleMapping variable is properly set.
   * Performs check after the mission class has filtered out all irrelevant jobs from the
   * activeVehicleMapping.
   *
   * Ensures the following:
   * 1. All job types provided cover the required job types for this mission.
   * 2. There is a vehicle assigned to each job type.
   *
   * @param activeVehicleMapping User provided map of vehicle to their job type.
   */
  private checkActiveVehicleMapping(): boolean {
    if (Object.keys(this.activeVehicleMapping[this.missionName]).length === 0) return false;

    const providedJobTypes = new Set<JobType>(
      Object.values(this.activeVehicleMapping[this.missionName]),
    );

    const hasRequiredJobTypes = Array.from(this.jobTypes).every(
      (requiredJobType): boolean => providedJobTypes.has(requiredJobType),
    );

    if (!hasRequiredJobTypes) return false;

    const hasValidVehicleAssigned = Object.keys(this.activeVehicleMapping[this.missionName]).map(
      (vehicleIdString): number => parseInt(vehicleIdString, 10),
    ).every((vehicleId): boolean => vehicleConfig.isValidVehicleId(vehicleId)
      && this.vehicles[vehicleId]
      && this.vehicles[vehicleId]
        .getJobs()
        .includes(this.activeVehicleMapping[this.missionName][vehicleId]));

    if (!hasValidVehicleAssigned) return false;

    return true;
  }

  /**
   * Handles a vehicle that is assigned a job when it goes to an error state. Tries to assign
   * another vehicle that can perform the same task and remove that vehicle. If not possible,
   * simply stops the mission.
   */
  private handleUnresponsiveVehicle(vehicleId: number): void {
    // Ignore vehicles that are not related to the mission.
    if (!this.activeVehicleMapping[this.missionName][vehicleId]) return;

    if (this.status === 'waiting') {
      this.stop(false, `Take manual control over ${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name}`);
    } else if (this.status === 'initializing') {
      ipc.postStopSendingMessages();
      this.stop(false, `Take manual control over ${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name}`);
    } else {
      const jobType = this.activeVehicleMapping[this.missionName][vehicleId];

      delete this.activeVehicleMapping[this.missionName][vehicleId];

      // Put the task vehicle is performing back to the front of waitingTasks.
      if (this.activeTasks.has(vehicleId)) {
        const task = this.activeTasks.get(vehicleId) as Task;
        this.activeTasks.delete(vehicleId);
        this.addTask(jobType, task, true);
      }

      // Get the next vehicle that can perform the job to start doing that task.
      const newVehicle = this.waitingVehicles.shift(jobType);
      const task = this.waitingTasks.shift(jobType);
      if (newVehicle && task) {
        this.activeVehicleMapping[this.missionName][newVehicle.getVehicleId()] = jobType;

        if (!this.assignTask(newVehicle, task)) return;
        this.activeTasks.set(newVehicle.getVehicleId(), task);

        ipc.postLogMessages({
          type: 'success',
          message: `Reassigned ${jobType} job to ${(vehicleConfig.vehicleInfos[newVehicle.getVehicleId()] as VehicleInfo).name}`,
        });
      } else {
        this.stop(false, `Failed to assign manual control over ${(vehicleConfig.vehicleInfos[vehicleId] as VehicleInfo).name}`);
      }
    }
  }

  /**
   * Generates all tasks to perform, given this.options and this.parameters.
   * Returns undefined if not able to generate tasks.
   */
  protected abstract generateTasks(): DictionaryList<Task> | undefined;

  /**
   * Generates new mission parameters after the mission has completed, either to be given to the
   * user or to the next mission. For example, data produced here for an ISR Search mission should
   * be data for the VTOL Search mission (of type VTOLSearchMissionParameters).
   * Returns undefined if not able to generate parameters.
   */
  protected abstract generateCompletionParameters(): { [key: string]: TaskParameters } | undefined;
}
