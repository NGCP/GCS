/**
 * This is a stub class implemented just to allow for testing.
 * This class still needs to be fully fleshed out.
 */

export default class Vehicle {
  constructor(vehicleId, vehicleJobs) {
    this.vehicleId = vehicleId;
    this.vehicleJobs = vehicleJobs;
  }

  get jobs() {
    return this.vehicleJobs;
  }

  get id() {
    return this.vehicleId;
  }
}
