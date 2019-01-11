/**
 * This is a stub class implemented just to allow for testing.
 * This class still needs to be fully fleshed out.
 */

export default class Vehicle {
  constructor(vehicleId, vehicleJobs, vehicleStatus) {
    this.vehicleId = vehicleId;
    this.vehicleJobs = vehicleJobs;
    this.vehicleStatus = vehicleStatus;
    this.assignedJob = null;
    this.assignedTask = null;

    this.vehicleValues = undefined;

    this.updateEventHandlers = [];


    this.pendingInitialization = false;
    this.pendingCompletion = null;
    this.pendingFailure = null;
    this.pendingInitializationTimeout = null;

    // Time (in ms) before considering that a vehicle has timed out
    this.vehicleTimeoutLength = 15000;
  }

  get jobs() {
    return this.vehicleJobs;
  }

  get id() {
    return this.vehicleId;
  }

  get status() {
    return this.vehicleStatus;
  }

  /**
   * Triggers an update: happens when a vehicle update occurs.
   * @param {Object} updateValue the object value of the update message.
   */
  vehicleUpdate(updateValue) {
    this.vehicleValues = updateValue;

  }


  assignJob(job, completion, timeout) {
    if (this.pendingInitialization) {
      throw new Error('Initialization is already pending; cannot assign job until current initialization is finished');
    }

    this.assignedJob = job;
    this.pendingInitialization = true;
    this.pendingCompletion = completion;
    this.pendingFailure = timeout;
    /*
     Create the timeout function (after 15 seconds) to handle if the vehicle
     does not update in time. Revert the changes, and run the timeout handler.
    */
    this.pendingInitializationTimeout = setTimeout(() => {
      this.assignedJob = null;
      this.pendingInitialization = false;
      this.pendingFailure();
    }, this.vehicleTimeoutLength);

    // Send a message to the vehicle indicating the job assignment
    this.sendMessage({ type: 'start', jobType: this.assignedJob });
  }

  assignTask(task) {
    if (task.jobRequired !== this.assignedJob) {
      throw new RangeError('Task job required does not match with the job assigned!');
    }

    this.assignedTask = task;

    this.sendMessage({ type: 'addMission', missionInfo: this.assignedTask.generateStartMessage() });
  }

  toString() {
    return `${this.vehicleId} ${this.vehicleJobs} ${this.vehicleStatus}`;
  }

  /*
   * This would send a message to the vehicle.
   * All messages are assumed to be successful.
   * If a parse error happens, a badMessage will be raised, at which point the user
   * will be warned and debugging can proceed. If bad data is sent, the current
   * message scheme will depend on the 'error' state being set and a descriptive
   * errorMessage.
   */
  sendMessage(mesg) {
    // send a message using mesg
  }
}
