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

/*
 * Define a dummy logger object so that no logging output is created
 */
const dummyLogger = {
  log: () => {}
};

describe('ISRMission', () => {
  describe('#getVehicleMapping', () => {
    // Using dummy vehicle objects until vehicle is implemented
    const vh1 = new Vehicle(1, ['ISR_Plane'], true);
    const vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], true);
    const vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], true);
    const vh4 = new Vehicle(4, ['ISR_Plane'], true);

    it('returns a valid mapping -- with simple maps', () => {
      const vehicleList = [vh1, vh2];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal(new Map([[vh1, 'ISR_Plane']]));
    });

    it('returns a valid mapping -- with more complex maps', () => {
      const vehicleList = [vh1, vh2, vh3, vh4];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal(new Map([[vh1, 'ISR_Plane'], [vh4, 'ISR_Plane']]));
    });

    it('returns a valid mapping -- when no maps can be made (empty map)', () => {
      const vehicleList = [vh2, vh3];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal(new Map());
    });
  });


  describe('#setVehicleMapping', () => {
    // Using dummy vehicle objects until vehicle is implemented
    const vh1 = new Vehicle(1, ['ISR_Plane'], true);
    const vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], true);
    const vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], true);
    const vh4 = new Vehicle(4, ['ISR_Plane'], true);
    const vehicleList = [vh1, vh2, vh3, vh4];

    let mission;

    beforeEach(() => {
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('accepts a valid mapping -- with simple maps', () => {
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(mapping);
    });

    it('accepts a valid mapping -- with complex maps', () => {
      const mapping = new Map([[vh1, 'ISR_Plane'], [vh3, 'ISR_Plane'], [vh4, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(mapping);
    });

    it('rejects invalid mappings -- with simple maps', () => {
      const mapping = new Map([[vh2, 'Quick_Search']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(new Map());
    });

    it('rejects invalid mappings -- with complex maps', () => {
      const mapping = new Map([[vh2, 'Quick_Search'], [vh3, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);

      chai.expect(mission.activeVehicleMapping).to.deep.equal(new Map());
    });

    it('rejects invalid mappings -- with invalid vehicles', () => {
      const vh5 = new Vehicle(5, ['ISR_Plane'], true);
      const mapping = new Map([[vh1, 'ISR_Plane'], [vh5, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(new Map());
    });
  });


  describe('#setMissionInfo', () => {
    const vehicleList = [];
    let mission;

    beforeEach(() => {
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('accepts mission specific information -- all valid entries', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetup).to.deep.equal(missionSetup);
    });

    it('accepts mission specific information -- with extreneous entries', () => {
      const missionSetup = { plane_end_action: 'land', repeat_information: true };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetup).to.deep.equal({ plane_end_action: 'land' });
    });

    it('accepts mission specific information -- with only invalid entries', () => {
      const missionSetup = { invalid_entry: true, repeat_information: true };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetup).to.deep.equal({ });
    });
  });


  describe('#missionInfoReady', () => {
    const vh1 = new Vehicle(1, ['ISR_Plane'], true);
    const vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], true);
    const vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], true);
    const vh4 = new Vehicle(4, ['ISR_Plane'], true);
    const vehicleList = [vh1, vh2, vh3, vh4];
    let mission;

    beforeEach(() => {
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('accepts a valid mission setup -- simple', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionInfoReady()).to.equal(true);
    });


    it('accepts a valid mission setup -- more complex', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane'], [vh4, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionInfoReady()).to.equal(true);
    });

    it('rejects an invalid mission setup -- mission setup not complete', () => {
      const missionSetup = { plane_end_action: 'land' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionInfoReady()).to.be.a('string').that.includes('Mission property is not set');
    });

    it('rejects an invalid mission setup -- vehicles assignment missing', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionInfoReady()).to.be.a('string').that.includes('No vehicle assigned to');
    });

    it('rejects an invalid mission setup -- nothing set', () => {
      chai.expect(mission.missionInfoReady()).to.be.a('string');
    });
  })
});
