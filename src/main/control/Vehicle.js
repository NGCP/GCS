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
  }

  assignTask(task) {
    if (this.assignedTask !== null) {
      throw new RangeError('Vehicle task has already been assigned!');
    }

    if (task.jobRequired !== this.assignedJob) {
      throw new RangeError('Task job required does not match with the job assigned!');
    }

    this.vehicleStatus = 'READY';
    this.assignedTask = task;
  }

  toString() {
    return `${this.vehicleId} ${this.vehicleJobs} ${this.vehicleStatus}`;
  }
}
