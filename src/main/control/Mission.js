/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 */


export default class Mission {
  /**
   * Constructs a Mission, but does not start it.
   * Cannot be instatiated directly: must be executed from a subclass.
   * @param {Function} completionCallback - function to call when the mission ends
   * @param {Array} vehicleList - list of all the vehicles in the system.
   * @param {Object} logger - logger reference to enable logging to GUI console
   */
  constructor(completionCallback, vehicleList, logger) {
    if (new.target === Mission) {
      throw new TypeError('Cannot instantiate abstract class Mission');
    }

    /*
    for (let i = 0; i < this.requiredOverrideMethods.length; i++) {
      if (!(this[this.requiredOverrideMethods[i]] instanceof Function)) {
        throw new EvalError(`Method ${this.requiredOverrideMethods[i]} must be overridden in subclass`);
      }
    }
    */

    // Reference to the global vehicle list is kept
    this.vehicleList = vehicleList;
    // Reference to the logger to enable logging output to the GUI console
    this.logger = logger;
    // Reference to the completion callback function in the Orchestrator
    this.completionCallback = completionCallback;
  }

  /**
   * Method to call when this mission has completed to trigger starting the next one.
   * @param {Object} passBackData - the data to send to the next mission
   */
  onComplete(passBackData) {
    if (passBackData === undefined) {
      throw new TypeError('Mission passback cannot be undefined');
    }
    this.completionCallback(passBackData);
  }


  /**
   * Starts the mission with the given information and the given vehicles
   * @param {Object} missionData - the data about the mission at hand
   */
  start(missionData) {
    throw new EvalError('start must be overridden in Mission subclasses');
  }

  /**
   * Get a vehicle mapping
   *
   * return {Object}  An object containing the mappings between the Vehicle and its assigned job (String)
   */
  getVehicleMapping() {
    throw new EvalError('getVehicleMapping must be overridden in Mission subclasses');
  }

  /**
   * Triggered by the Orchestrator to signal that vehicle information has changed
   * Causes a check to be performed to ensure that all vehicles are still active
   * and handles reallocation of tasks as needed.
   */
  vehicleUpdate() {
    throw new EvalError('vehicleUpdate must be overridden in Mission subclasses');
  }
}


/*
* Define static class variables
* This variable contains the names of all the functions that must be defined
* by subclasses.
*/
// Mission.prototype.requiredOverrideMethods = ['start', 'vehicleUpdate'];
