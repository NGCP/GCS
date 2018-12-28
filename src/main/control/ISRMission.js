/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 */
import Mission from './Mission';

export default class ISRMission extends Mission {
  constructor(completionCallback, vehicleList, logger) {
    super(completionCallback, vehicleList, logger);

    this.missionSetup = {};
    this.missionSetupTracker = { plane_start_action: false, plane_end_action: false };

    this.activeVehicleMapping = new Map();
    this.taskList = [];
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
    // Get only vehicles relevant to the current mission (match job & is ready)
    const missionVehicles = this.vehicleList.filter(vec => {
      const jobsList = vec.getJobs();
      let isValid = false;
      for (let job = 0; job < jobsList.length; job++) {
        isValid = isValid || this.missionJobTypes.includes(jobsList[job]);
      }
      return isValid && vec.isReady();
    });

    for (let i = 0; i < missionVehicles.length; i++) {
      if (missionVehicles[i].getJobs().length() === 1) {
        // pass
      }
    }

    // Check that there exists at least one of each kind of vehicle
    // Start by mapping all vehicles with only one job first
    // Then check with the multi job vehicles

    // Create tasks based on mission
    // Create an initial assignment
    // Start the mission
  }


  // +-----------------------------------------------------------------------+
  // |                        Mission Setup Function                         |
  // +-----------------------------------------------------------------------+

  /**
   * Checks to see if the mission info is ready, complete and error-free.
   *
   * @returns {boolean|string} true if the mission is valid and ready; String message otherwise
   */
  missionInfoReady() {
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
        message_string = `No vehicle assigned to '${job}'`;
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


/**
 * Static variables for the ISRMission class
 */
ISRMission.prototype.missionJobTypes = ['ISR_Plane'];
