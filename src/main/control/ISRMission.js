/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 */
import Mission from './Mission';

export default class ISRMission extends Mission {
  constructor(completionCallback, vehicleList, logger) {
    super(completionCallback, vehicleList, logger);

    this.activeVehicleMapping = {};
    this.taskList = [];
  }

  /**
   * Get the vehicle assignment for this particular mission.
   * Uses the mission data to filter all vehicles that are valid, returning a
   * vehicle to job mapping (vehicle used as key, job as value.)
   *
   * @returns {Object} mapping of vehicle to jobs
   */
  getVehicleMapping() {
    const valid_vehicles = this.filterVehicles();
    const mapping = {};
    // Go through all the job types required for this mission type
    for (let i = 0; i < this.missionJobTypes.length; i++) {
      // Go through all the valid vehicles
      for (let j = 0; j < valid_vehicles.length; j++) {
        const current_vehicle_jobs = valid_vehicles[j].jobs;

        // Check that the current vehicle is of the current jobs and that it has only one function (for now, multi-job vehicles can only be user-defined)
        if (current_vehicle_jobs.includes(this.missionJobTypes[i]) && current_vehicle_jobs.length === 1) {
          mapping[valid_vehicles[j].id] = this.missionJobTypes[i];
        }
      }
    }
    return mapping;
  }

  filterVehicles() {
    return this.vehicleList.filter(vehc => {
      const jobsList = vehc.jobs;
      let isValid = false;
      for (let job = 0; job < jobsList.length; job++) {
        isValid = isValid || this.missionJobTypes.includes(jobsList[job]);
      }
      return isValid;
    });
  }

  /**
   * Triggers the mission to start with the given mission data object.
   * The Mission data object for the ISR must be a single point and a radius
   * indicating the area to be searched.
   *
   * An exception is thrown if the mission is not properly configured.
   *
   * @param  {Object} missionData Object containing a point and a radius (x, y, r)
   */
  start(missionData) {
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

  vehicleUpdate() {
    return null;
  }
}

/**
 * Static variables for the ISRMission class
 */
ISRMission.prototype.missionJobTypes = ['ISR_Plane'];
