/**
 * This is a stub class implemented just to allow for testing.
 * This class still needs to be fully fleshed out.
 */

export default class Vehicle {
  constructor(vehicleId, vehicleJobs, vehicleReady) {
    this.vehicleId = vehicleId;
    this.vehicleJobs = vehicleJobs;
    this.vehicleReady = vehicleReady;
  }

  get jobs() {
    return this.vehicleJobs;
  }

  get id() {
    return this.vehicleId;
  }

  get ready() {
    return this.vehicleReady;
  }

  toString() {
    return `${this.vehicleId  } ${  this.vehicleJobs}`;
  }
}
