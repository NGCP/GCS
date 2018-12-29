/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 */
import Mission from './Mission';
import Task from './Task';

export default class ISRMission extends Mission {
  constructor(completionCallback, vehicleList, logger) {
    super(completionCallback, vehicleList, logger);

    this.missionJobTypes = ['ISR_Plane'];
    this.missionDataInformationRequirements = ['lat', 'lng'];
    this.missionSetupTracker = { plane_start_action: false, plane_end_action: false };
    this.missionSetup = {};

    this.missionStatus = 'WAITING';

    this.activeVehicleMapping = new Map();

    // Waiting tasks are an object with the different jobTypes as keys, and the values as arrays of Tasks
    this.waitingTasks = {};
    // Active tasks are objects with the vehicles as keys, and the values as the task assigned to them
    this.activeTasks = {};
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
    // If not already in the READY state, attempt to init the mission.
    if (this.missionStatus !== 'READY') {
      this.missionInit();
    }

    // Check that the missionData provides the required input information.
    // Consider changing so that the requiresments are in the task objects instead.
    for (let index = 0; index < this.missionDataInformationRequirements.length; index++) {
      const key = this.missionDataInformationRequirements[index];
      if (!(key in missionData)) {
        throw new RangeError(`Value '${key}' is a required mission parameter`);
      }
    }

    // Create tasks based on mission & create an assignment

    // ISR only has one task
    const task = new Task(missionData.lat, missionData.lng);
    this.waitingTasks[task.jobRequired] = [task];

    // Create the initial task assignment (go through all vehicles and assign a task)
    for (const vehc of this.activeVehicleMapping.keys()) {
      const vehcJob = this.activeVehicleMapping.get(vehc);

      // Assumption made that the array exists (has been defined already)...
      if (this.waitingTasks[vehcJob].length > 0) {
        const vehcTask = this.waitingTasks[vehcJob].pop();

        // Set task to active
        vehc.assignTask(vehcTask);
        this.activeTasks[vehc] = vehcTask;
      }
    }

    // Start the mission
    this.missionStatus = 'RUNNING';

    const run_promise = new Promise((resolve, reject) => {
      this.run();

      resolve('ok');
    });

    run_promise
      .then(() => {
        this.completionCallback();
      })
      .catch(() => {
        throw new RangeError('An error occurred when running!');
      });
  }

  /**
   * Run the mission. Should be called asynchronously.
   */
  run() {

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
      throw new RangeError('Cannot initialize mission: not in WAITING state');
    }

    // Check mission setup completeness & accuraccy
    const missionIsReady = this.missionSetupComplete();
    if (missionIsReady !== true) {
      throw new RangeError(`Failed to initialize mission: ${missionIsReady}`);
    }

    // Assign job type to each of the vehicles in the mapping
    for (const vehc of this.activeVehicleMapping.keys()) {
      vehc.assignJob(this.activeVehicleMapping.get(vehc));
    }

    this.missionStatus = 'READY';
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
        message_string = `'${key}' Mission property is not set`;
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
        message_string = `No vehicle assigned for the job type: '${job}'`;
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

  vehicleUpdate() {
    return null;
  }
}
