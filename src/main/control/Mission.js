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
   * Starts the mission with the given information and the given vehicles.
   *
   * The mission must have been successfully initialized first.
   *
   * @param {Object} missionData - the data about the mission at hand
   */
  missionStart(missionData) {
    throw new EvalError('missionStart must be overridden in Mission subclasses');
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
    throw new EvalError('missionInit must be overridden in Mission subclasses');
  }

  /**
   * Checks to see if the mission info is ready, complete and error-free.
   *
   * returns {boolean|string} true if the mission is valid and ready; String message otherwise
   */
  missionSetupComplete() {
    throw new EvalError('missionSetupComplete must be overridden in Mission subclasses');
  }

  /**
   * Sets the mission variables with the given fields.
   *
   * @param {Object} setupData - the data about the mission at hand.
   */
  setMissionInfo(setupData) {
    throw new EvalError('checkValid must be overridden in Mission subclasses');
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
   * Update the mission based on the information received in the message.
   * MissionUpdate happens when a message directly relating to the mission
   * is received and the mission must take reasonable measures to apply the information.
   *
   * @param {Object} mesg received.
   * @param {Vehicle} sender the vehicle object of the sender of the message.
   */
  missionUpdate(mesg, sender) {
    throw new EvalError('missionUpdate must be overrided in Mission subclasses');
  }
}
