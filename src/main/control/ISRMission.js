/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 */
import Mission from './Mission';

export default class ISRMission extends Mission {
  constructor(vehicleList, completionCallback) {
    super(vehicleList, completionCallback);
    this.test = null;
  }

  filterVehicles() {
    this.vehicleList = this.vehicleList.filter(vec => {
      const jobsList = vec.getJobs();
      let isValid = false;
      for (let job = 0; job < jobsList.length; job++) {
        isValid = isValid || this.vehicleTypes.includes(jobsList[job]);
      }
      return isValid;
    });
  }
}

/**
 * Static variables for the ISRMission class
 */
ISRMission.prototype.vehicleTypes = ['ISR_Plane'];
