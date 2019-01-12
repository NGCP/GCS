/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 */
import Mission from './Mission';
import Task from './Task';
import ListDict from './ListDict';

export default class ISRMission extends Mission {
  constructor(completionCallback, vehicleList, logger) {
    super(completionCallback, vehicleList, logger);

    this.missionJobTypes = ['ISR_Plane'];
    this.missionDataInformationRequirements = ['lat', 'lng'];
    this.missionSetupTracker = { plane_start_action: false, plane_end_action: false };

    this.missionSetup = {};
    this.missionStatus = 'WAITING';

    this.activeVehicleMapping = new Map();

    // Keep track of waiting tasks and waiting vehicles using the job as the key
    this.waitingTasks = new ListDict();
    this.waitingVehicles = new ListDict();

    // Active tasks are objects with the vehicles as keys, and the values as the task assigned to them
    this.activeTasks = new Map();

    // Save all the mission results
    this.missionDataResults = {};
  }


  // +-----------------------------------------------------------------------+
  // |                        Mission Start Functions                        |
  // +-----------------------------------------------------------------------+

  /**
   * Triggers the mission to start with the given mission data object.
   * The Mission data object for the ISR must be a single point and a radius
   * indicating the area to be searched.
   *
   * @param  {Object} missionData Object containing a point and a radius (x, y, r)
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

    // Create the tasks and insert into the waitingTasks (ISR only has 1 task)
    const task = new Task(missionData.lat, missionData.lng);
    this.waitingTasks.push(task.jobRequired, task);

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
   * Update the mission based on the information received in the message.
   * MissionUpdate happens when a message directly relating to the mission
   * is received and the mission must take reasonable measures to apply the information.
   *
   * @param {Object} mesg received
   * @param {Vehicle} sender the vehicle object of the sender of the message.
   */
  missionUpdate(mesg, sender) {
    if (mesg.type === 'POI') {
      if (!('POI' in this.missionDataResults)) {
        this.missionDataResults.POI = [];
      }
      this.missionDataResults.POI.push({ lat: mesg.lat, lng: mesg.lng });
    } else if (mesg.type === 'complete') {
      // Get the sending vehicle
      const vehcJob = this.activeVehicleMapping.get(sender);

      // Reassign task if any are waiting.
      if (this.waitingTasks.countItemsForKey(vehcJob) > 0) {
        const newTask = this.waitingTasks.get(vehcJob);

        sender.assignTask(newTask);
        this.activeTasks.set(sender, newTask);
      } else {
        this.activeTasks.delete(sender);
      }

      // If there are no active tasks and no waiting tasks, then mission is considered done.
      if (this.activeTasks.size === 0 && this.waitingTasks.count === 0) {
        this.completionCallback(this.missionDataResults);
      } else if (this.activeTasks.size === 0 && this.waitingTasks.count > 0) {
        throw new Error('No active tasks, but there remain tasks to do. Did vehicle jobs get messed up?');
      }
    } else {
      throw new Error(`Unknown Mission message type ${mesg.type}. This either should have been handled by the message parser, or was incorrectly marked as a Mission update message by the Orchestrator.`);
    }
  }

  /**
   * Initializes the mission. Does this by verifying that all settings are set
   * and complete. Does all pre-mission tasks (committing assigned vehicles &
   * sending intial messages to all the vehicles).
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
        this.logger.log(`Mission initialization timed out while waiting for the vehicle ${vehc} to initialize`);
        this.missionStatus = 'WAITING';
      });
    }

    // Set to pending initialization
    this.missionStatus = 'INITIALIZING';
  }

  // +-----------------------------------------------------------------------+
  // |                        Mission Setup Function                         |
  // +-----------------------------------------------------------------------+

  /**
   * Checks to see if the mission info is ready, complete and error-free.
   *
   * @returns {boolean|string} true if the mission is valid and ready; String message otherwise
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
   * @param {Object} setupData - the data about the mission at hand.
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
   * Will check for validity before setting.
   *
   * @param {Object} mapping of vehicle objects to an assigned job.
   */
  setVehicleMapping(mapping) {
    if (this.missionStatus !== 'WAITING') {
      throw new RangeError('Mission already initialized: cannot change vehicle mapping!');
    }

    let isValid = true;

    for (const vehc of mapping.keys()) {
      // Check mission supports job assigned and check vehicle supports job assigned
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
   * Get the vehicle assignment for this particular mission.
   * Uses the mission data to filter all vehicles that are valid, returning a
   * vehicle to job mapping (vehicle used as key, job as value.)
   * Note that this does NOT SET the vehicles, it just returns a possible valid mapping.
   *
   * @returns {Object} mapping of vehicle to jobs
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
}
