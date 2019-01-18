/**
 * Vehicle class describes data held by a vehicle as well as functions used
 * by a vehicle to describe how it functions with the rest of the system.
 */

import UpdateHandlers from './DataStructures/UpdateHandler';

export default class Vehicle {
  constructor(vehicleId, vehicleJobs, vehicleStatus) {
    // This is the information assigned to the vehicles by the system
    this.vehicleId = vehicleId;
    this.assignedJob = null;
    this.assignedTask = null;
    this.pendingInitialization = false;

    // These is information about the vehicles given by the vehicles (not set)
    this.vehicleStatus = vehicleStatus;
    this.vehicleJobs = vehicleJobs;
    this.lat = null;
    this.lng = null;
    this.errorMessage = '';
    this.errorHandler = () => {};

    // Event update handler object
    this.updateEventHandlers = new UpdateHandlers();

    // Add the default update event UpdateHandlers
    this.updateEventHandlers.addHandler('status', (value, full) => {
      this.vehicleStatus = value;
      if (value === 'ERROR') {
        this.errorMessage = full.errorMessage;
        this.errorHandler(this.errorMessage);
      }
    });

    this.updateEventHandlers.addHandler('lat', value => {
      this.lat = value;
    });

    this.updateEventHandlers.addHandler('lat', value => {
      this.lng = value;
    });

    // Variables & constants
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
   * Triggers an update on any value that changed relative to the
   * stored vehicle values. Happens when a vehicle update occurs.
   *
   * @param {Object} updateValue the object value of the update message.
   */
  vehicleUpdate(updateValue) {
    this.updateEventHandlers.events(updateValue);
  }

  /**
   * Assign Job to the vehicle.
   * Assigns the completion callback to call when the job has been successfully set
   * Assigns the timeout callback to call when the job setting has timed out
   * Assigns the error callback to call if the vehicle enters an error state
   * @param  {string} job        job string to assign for this vehicle
   * @param  {Function} completion the callback function to call when the vehicle enters the READY state
   * @param  {Function} timeout    the callback function to call when the vehicle fails to enter the READY state in time
   * @param  {Function} error      the callback function to call when the vehicle enters an ERROR state
   */
  assignJob(job, completion, timeout, error) {
    if (this.pendingInitialization) {
      throw new Error('Initialization is already pending; cannot assign job until current initialization is finished');
    }

    this.assignedJob = job;
    this.pendingInitialization = true;
    this.errorHandler = error;

    // Add a handler for when status is set to READY & timeout
    this.updateEventHandlers.addHandler('status', value => {
      if (value === 'READY') {
        completion();
        this.pendingInitialization = false;
        return true;
      }
      return false;
    }, () => {
      this.pendingInitialization = false;
      timeout();
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

  terminate() {
    // Send STOP message & do all terminate sequence
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
