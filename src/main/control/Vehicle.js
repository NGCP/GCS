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

  assignJob(job) {
    if (this.assignedJob !== null) {
      throw new RangeError('Vehicle job has already been assigned!');
    }

    this.vehicleStatus = 'WAITING';
    this.assignedJob = job;

    // Send a message to the vehicle indicating the job assignment

    this.sendMessage({ type: 'start', jobType: this.assignedJob });
  }

  assignTask(task) {
    if (task.jobRequired !== this.assignedJob) {
      throw new RangeError('Task job required does not match with the job assigned!');
    }

    this.vehicleStatus = 'READY';
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
