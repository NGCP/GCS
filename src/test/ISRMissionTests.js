/*
 * Set up the Spectron testing environment for unit tests
 */

const Application = require('spectron').Application;
const chai = require('chai');
const electronPath = require('electron');
const path = require('path');

const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const beforeEach = mocha.beforeEach;

import ISRMission from '../main/control/ISRMission';
import Vehicle from '../main/control/Vehicle';

/*
 * Mission & Mission Subclass tests
 * Insert code specific to creating new Mission Subclasses & to test
 * the functions
 */


/*
 * Define a dummy completionCallback function that is run automatically
 * after the mission is determined to be completed.
 */
let completionCallbackCalled = false;
function dummyCompletionCallback() {
  completionCallbackCalled = true;
}

describe('ISRMission', () => {
  describe('#getVehicleMapping', () => {
    // Using dummy vehicle objects until vehicle is implemented
    const vh1 = new Vehicle(1, ['ISR_Plane']);
    const vh2 = new Vehicle(2, ['VTOL', 'Quick_Search']);
    const vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop']);
    const vh4 = new Vehicle(4, ['ISR_Plane']);

    it('returns a valid mapping -- with simple maps', () => {
      const vehicleList = [vh1, vh2];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, console);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal({ [vh1.id]: 'ISR_Plane' });
    });

    it('returns a valid mapping -- with more complex maps', () => {
      const vehicleList = [vh1, vh2, vh3, vh4];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, console);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal({ [vh1.id]: 'ISR_Plane', [vh4.id]: 'ISR_Plane' });
    });

    it('returns a valid mapping -- when no maps can be made (empty map)', () => {
      const vehicleList = [vh2, vh3];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, console);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal({ });
    });
  });
});
