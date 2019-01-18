/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 *
 * Refer to https://github.com/NGCP/GCS/wiki/Mission-Implementations---A-Guide
 * for information on how to implement a Mission object
 */
import ListDict from './DataStructures/ListDict';

export default class Mission {
  /**
   * Constructs a Mission object.
   * Cannot be instatiated directly: must be executed from a subclass.
   *
   * @param {Function} completionCallback - function to call when the mission ends
   * @param {Array} vehicleList - list of all the vehicles in the system.
   * @param {Object} logger - logger reference to enable logging to GUI console
   */
  constructor(completionCallback, vehicleList, logger) {
    if (new.target === Mission) {
      throw new TypeError('Cannot instantiate abstract class Mission');
    }

    /* ====================================================================== */
    /* Mission required information. These should be overridden by subclasses */
    /* ====================================================================== */
    this.missionJobTypes = [];
    this.missionDataInformationRequirements = [];
    this.missionSetupTracker = {};
    /* ====================================================================== */

    // Reference to the global vehicle list is kept
    this.vehicleList = vehicleList;
    // Reference to the logger to enable logging output to the GUI console
    this.logger = logger;
    // Reference to the completion callback function in the Orchestrator
    this.completionCallback = completionCallback;

    // Mission status / setup data
    this.missionSetup = {};
    this.missionStatus = 'WAITING';
    this.activeVehicleMapping = new Map();

    // Keep track of waiting tasks and waiting vehicles using the job as the key
    this.waitingTasks = new ListDict();
    this.waitingVehicles = new ListDict();

    // Active tasks are objects with the vehicles as keys, and the values as the task assigned to them
    this.activeTasks = new Map();
  }

  /**
   * Creates a Map for each of the job types to a list of Task objects. These tasks are
   * assigned to vehicles available. If there are leftover tasks or leftover vehicles,
   * they are stored into a queue until a task or vehicle becomes available.
   *
   * @param  {Object} missionData Object containing the required input data. Note
   *                              that the missionData object is unmodified from the
   *                              missionStart function.
   * @returns {Map} the jobs and the task list associated with it (String => Task[])
   */
  generateTasks(missionData) {
    throw new EvalError('generateTasks function must be overridden in subclasses!');
  }

  /**
    * Starts the mission with the given mission data input. The input would be the
    * data that the previous mission has generated/found (e.g. a confirmed location)
    *
    * @param  {Object} missionData   Object containing the required input data
    */
  missionStart(missionData) {
    if (this.missionStatus !== 'READY') {
      throw new Error('Mission must be initialized before starting!');
    }

    // Check that the missionData provides the required input information.
    // Consider changing so that the requiresments are in the task objects instead.
    for (let index = 0; index < this.missionDataInformationRequirements.length; index++) {
      const key = this.missionDataInformationRequirements[index];
      if (!(key in missionData)) {
        throw new Error(`Value '${key}' is a required mission parameter`);
      }
    }

    // Create tasks based on mission & create an assignment

    // Get the tasks and insert into waitingTasks
    const job_to_task_map = this.generateTasks(missionData);
    for (const job_required of job_to_task_map.keys()) {
      for (const task of job_to_task_map.get(job_required)) {
        this.waitingTasks.push(job_required, task);
      }
    }

    // Get the vehicles and insert into the waitingVehicles
    for (const vehc of this.activeVehicleMapping.keys()) {
      const vehcJob = this.activeVehicleMapping.get(vehc);

      this.waitingVehicles.push(vehcJob, vehc);
    }

    // Create the initial task assignment using the waiting vehicles and the waiting tasks
    // We will go through all the vehicles an attempt to assign it a task
    for (const vehcJob of this.waitingVehicles.keys) {
      while (this.waitingTasks.countItemsForKey(vehcJob) > 0 &&
        this.waitingVehicles.countItemsForKey(vehcJob) > 0) {
        // Space
        const current_vehc = this.waitingVehicles.get(vehcJob);
        const current_task = this.waitingTasks.get(vehcJob);

        current_vehc.assignTask(current_task);
        this.activeTasks.set(current_vehc, current_task);
      }
    }

    // Start the mission
    this.missionStatus = 'RUNNING';
  }

  /**
   * Used to add a task to a currently running mission. This function handles
   * the assigning of the task to a waiting vehicle if there are any. Otherwise,
   * it saves the task into the waitingTasks until a vehicle becomes available.
   *
   * @param  {string} jobType   the vehicle job requirement for the new task
   * @param  {Task}   task      new task to insert
   */
  missionNewTask(jobType, task) {
    if (this.missionStatus !== 'RUNNING' && this.missionStatus !== 'PAUSED') {
      throw new Error('Cannot add a new task to a mission that is not actively running');
    }

    // Assign the task right away if a vehicle capable of doing the task is waiting, else add to waitingTasks
    if (this.waitingVehicles.countItemsForKey(jobType) > 0) {
      const new_vehc = this.waitingVehicles.get(jobType);
      this.activeTasks.set(new_vehc, task);
    } else {
      this.waitingTasks.push(jobType, task);
    }
  }

  /**
   * Update the mission based on the information received in the message.
   * MissionUpdate happens when a message directly relating to the mission
   * is received and the mission must take reasonable measures to apply the
   * information.
   *
   * Note that the abstract class missionUpdate only processes 'complete' type
   * messages. Subclasses must process the other types of messages.
   *
   * @param {Object} mesg received message
   * @param {Vehicle} sender the vehicle object of the sender of the message.
   * @returns {boolean} true if the message was of type complete, false otherwise
   */
  missionUpdate(mesg, sender) {
    if (mesg.type === 'complete') {
      // Get the sending vehicle
      const vehcJob = this.activeVehicleMapping.get(sender);

      // Reassign task if any are waiting.
      if (this.waitingTasks.countItemsForKey(vehcJob) > 0) {
        const newTask = this.waitingTasks.get(vehcJob);

        sender.assignTask(newTask);
        this.activeTasks.set(sender, newTask);
      } else {
        // No tasks available for vehicle, add to waitingVehicles & remove from active
        this.waitingVehicles.push(vehcJob, sender);
        this.activeTasks.delete(sender);
      }

      // If there are no active tasks and no waiting tasks, then mission is considered done.
      if (this.activeTasks.size === 0 && this.waitingTasks.count === 0) {
        this.missionTerminate();
      } else if (this.activeTasks.size === 0 && this.waitingTasks.count > 0) {
        throw new Error('No active tasks, but there remain tasks to do. Did vehicle jobs get messed up?');
      }
      return true;
    }
    return false;
  }

  /**
   * Initializes the mission. Does this by verifying that all settings are set
   * and complete. Does all pre-mission tasks (committing assigned vehicles &
   * sending intial messages to all the vehicles). It does not create the tasks as
   * tasks are only created at mission start time.
   * Essentially: does everything to prepare for the mission, but does not start.
   *
   * If the mission cannot be initialized, an exception will be thrown.
   */
  missionInit() {
    // Can only initialize missions that are in the waiting state
    if (this.missionStatus !== 'WAITING') {
      throw new Error('Cannot initialize mission: not in WAITING state');
    }

    // Check mission setup completeness & accuraccy
    const missionIsReady = this.missionSetupComplete();
    if (missionIsReady !== true) {
      throw new Error(`Cannot initialize mission: ${missionIsReady}`);
    }

    // Assign job type to each of the vehicles in the mapping
    this.pendingInitializingVehicles = Array.from(this.activeVehicleMapping.keys());

    for (const vehc of this.pendingInitializingVehicles) {
      vehc.assignJob(this.activeVehicleMapping.get(vehc), () => {
        this.pendingInitializingVehicles = this.pendingInitializingVehicles.filter(v => vehc !== v);

        if (this.pendingInitializingVehicles.length === 0) {
          // Mission is ready (done initializing)
          this.logger.log('Mission initialization successful');
          this.missionStatus = 'READY';
        }
      }, () => {
        this.logger.log(`Mission initialization timed out while waiting for the vehicle '${vehc}' to initialize`);
        this.missionStatus = 'WAITING';
      }, mesg => {
        this.logger.log(`'${vehc}' entered an ERROR state: ${mesg}`);
        this.handleUnresponsiveVehicle(vehc);
      });
    }

    // Set to pending initialization
    this.missionStatus = 'INITIALIZING';
  }

  /**
   * Get the data at the end of the mission. This data is what is then forwarded
   * through the Orchestrator to the next mission (as the missionStart input data)
   *
   * This function should be overridden by the subclasses
   *
   * @returns {Object} the data generated by the mission
   */
  getTerminatedData() {
    throw new EvalError('getTerminatedData function must be overridden in subclasses!');
  }

  /**
   * Terminates the current mission by advancing the current mission state.
   * By default, this is only called when there are no more tasks for the
   * mission to consume, however it can be called at any time to immediately
   * enter the terminating condition.
   *
   * Calls the callback to trigger the Orchestrator to schedule the next mission.
   */
  missionTerminate() {
    for (const vehc in this.activeVehicleMapping.keys()) {
      vehc.terminate();
    }

    this.missionStatus = 'COMPLETE';
    this.completionCallback(this.getTerminatedData());
  }

  // +-----------------------------------------------------------------------+
  // |                        Mission Setup Function                         |
  // +-----------------------------------------------------------------------+

  /**
   * Checks to see if the mission is ready for initialization.
   * Checks that all data is complete and that the vehicle mapping is complete
   * and error-free.
   *
   * @returns {boolean|string} true   if the mission is valid and ready;
   *                           String message indicating what went wrong otherwise
   */
  missionSetupComplete() {
    // check that mission setup is complete
    let complete = true;
    let message_string = '';


    for (const key in this.missionSetupTracker) {
      if (!this.missionSetupTracker[key]) {
        complete = false;
        message_string = `'${key}' mission parameter property is not set`;
      }
    }

    // check that vehicle assignment is complete.
    // only checking that at least one of each job type is present; assuming
    // that the setVehicleMapping is used an properly checks vehicle job validity.
    const jobSet = new Set();
    for (const vehc of this.activeVehicleMapping.keys()) {
      jobSet.add(this.activeVehicleMapping.get(vehc));
    }

    for (const job of this.missionJobTypes) {
      if (!jobSet.has(job)) {
        complete = false;
        message_string = `No vehicle assigned for job type '${job}'`;
      }
    }

    if (complete) {
      return true;
    } else {
      return message_string;
    }
  }

  /**
   * Sets the mission variables with the given fields.
   *
   * @param {Object} setupData the data about the mission at hand.
   */
  setMissionInfo(setupData) {
    if (this.missionStatus !== 'WAITING') {
      throw new RangeError('Mission already initialized: cannot change Mission info!');
    }

    for (const key in this.missionSetupTracker) {
      if (key in setupData) {
        this.missionSetup[key] = setupData[key];
        this.missionSetupTracker[key] = true;
      }
    }
  }

  /**
   * Set the vehicle mapping: the vehicles and the jobs that are assigned to them.
   * Will check for validity before setting. Can only be done when the mission is in
   * the WAITING state.
   *
   * @param {Object} mapping of vehicle objects to an assigned job (Vehicle => String)
   */
  setVehicleMapping(mapping) {
    if (this.missionStatus !== 'WAITING') {
      throw new RangeError('Mission already initialized: cannot change vehicle mapping!');
    }

    let isValid = true;

    for (const vehc of mapping.keys()) {
      // Check mission supports assigned job, and check vehicle supports job assigned, and vehicle in vehicleList
      isValid = isValid &&
        this.missionJobTypes.includes(mapping.get(vehc)) &&
        vehc.jobs.includes(mapping.get(vehc)) &&
        this.vehicleList.includes(vehc);
    }

    if (isValid) {
      this.activeVehicleMapping = mapping;
    } else {
      // Report to user (this is a temporary measure) that mapping was invalid
      this.logger.log('Invalid mapping was given');
    }
  }

  /**
   * Get a possible vehicle assignment for this particular mission.
   * Uses the mission data to filter all vehicles that are valid, returning a
   * vehicle to job mapping.
   * Note that this does NOT SET the vehicle jobs, it just returns a possible
   * valid mapping.
   *
   * @returns {Object} mapping of vehicle to jobs (Vehicle => String)
   */
  getVehicleMapping() {
    const valid_vehicles = this.vehicleList.filter(vehc => {
      const jobsList = vehc.jobs;
      let isValid = false;
      for (let job = 0; job < jobsList.length; job++) {
        isValid = isValid || this.missionJobTypes.includes(jobsList[job]);
      }
      return isValid;
    });
    const mapping = new Map();

    // Go through all the job types required for this mission type
    for (let i = 0; i < this.missionJobTypes.length; i++) {
      // Go through all the valid vehicles
      for (let j = 0; j < valid_vehicles.length; j++) {
        const current_vehicle_jobs = valid_vehicles[j].jobs;

        // Check that the current vehicle is of the current jobs and that it has only one function (for now, multi-job vehicles can only be user-defined)
        if (current_vehicle_jobs.includes(this.missionJobTypes[i]) && current_vehicle_jobs.length === 1) {
          mapping.set(valid_vehicles[j], this.missionJobTypes[i]);
        }
      }
    }
    return mapping;
  }

  /**
   * Handle when a vehicle gets flagged as being 'unresponsive'.
   * This can happen after a vehicle fails to send a message to the GCS after a
   * certain amount of time has passed.
   *
   * @param {Vehicle} vehc the vehicle object of the unresponsive vehicle
   */
  handleUnresponsiveVehicle(vehc) {
    // If initializing, let vehicle time out.
    if (this.missionStatus === 'READY') {
      if (this.activeVehicleMapping.has(vehc)) {
        // Reset the entire active vehicle mapping
        this.activeVehicleMapping.clear();
        this.missionStatus = 'WAITING';
      }
    } else if (this.missionStatus === 'RUNNING' || this.missionStatus === 'PAUSED') {
      if (this.activeVehicleMapping.has(vehc)) {
        // Get the job assigned to the vehicle
        const vehcJob = this.activeVehicleMapping.get(vehc);

        // Remove the vehicle from the vehicle mapping
        this.activeVehicleMapping.delete(vehc);

        // Remove the vehicle from the active tasks and reinsert the task into the waiting tasks
        if (this.activeTasks.has(vehc)) {
          const task_to_reassign = this.activeTasks.get(vehc);
          this.activeTasks.delete(vehc);

          this.missionNewTask(vehcJob, task_to_reassign);
        }

        // Remove the vehicle from the waitingVehicles
        this.waitingVehicles.remove(vehcJob, vehc);

        // Caution! IF there are NO vehicles capable of completing all the tasks, user interaction required.
        const jobSet = new Set();
        for (const activeVehc of this.activeVehicleMapping.keys()) {
          jobSet.add(this.activeVehicleMapping.get(activeVehc));
        }
        for (const job of this.missionJobTypes) {
          if (!jobSet.has(job)) {
            this.missionTerminate();
            throw new Error('Mission cannot complete because a required mission job cannot be completed with the current vehicles');
          }
        }
      }
    }
  }
}
