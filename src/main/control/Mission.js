/**
 * The Mission abstract class describes the methods that a mission should contain
 * All implementing subclasses must ensure to override the stub methods
 */


export default class Mission {
  constructor(vehicleList, completionCallback) {
    if (new.target === Mission) {
      throw new TypeError('Cannot instantiate abstract class Mission');
    }
    for (let i = 0; i < this.requiredOverrideMethods.length; i++) {
      if (this[this.requiredOverrideMethods[i]] === undefined) {
        throw new TypeError(`Method ${this.requiredOverrideMethods[i]} must be overridden in subclass`);
      }
    }

    this.vehicleList = vehicleList;
    this.completionCallback = completionCallback;
  }
}


/*
* Define static class variables
* This variable contains the names of all the functions that must be defined
* by subclasses.
*/
Mission.prototype.requiredOverrideMethods = ['filterVehicles'];
