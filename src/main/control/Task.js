/**
 * This is a stub class implemented just to allow for testing.
 * This class still needs to be fully fleshed out.
 * The Task class should eventually become an Object factory to create the
 * different kinds of tasks that are available for the mission.
 */

export default class Task {
  constructor(lat, lng) {
    this.jobRequired = 'ISR_Plane';
    this.lat = lat;
    this.lng = lng;
  }
}
