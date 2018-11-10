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

  filterVehicles() {
    return this.vehicleList.filter(vec => {
      const jobsList = vec.getJobs();
      let isValid = false;
      for (let job = 0; job < jobsList.length; job++) {
        isValid = isValid || this.vehicleTypes.includes(jobsList[job]);
      }
      return isValid;
    });
  }

  start(missionData) {
    // Get only vehicles relevant to the current mission (match job & is ready)
    const missionVehicles = this.vehicleList.filter(vec => {
      const jobsList = vec.getJobs();
      let isValid = false;
      for (let job = 0; job < jobsList.length; job++) {
        isValid = isValid || this.vehicleTypes.includes(jobsList[job]);
      }
      return isValid && vec.isReady();
    });

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
ISRMission.prototype.vehicleTypes = ['ISR_Plane'];
