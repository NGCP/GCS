/*
 * Set up the Spectron testing environment for unit tests
 */

const chai = require('chai');

const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const beforeEach = mocha.beforeEach;

import ISRMission from '../main/control/ISRMission';
import Vehicle from '../main/control/Vehicle';
import Task from '../main/control/Task';

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
  log: () => {},
};

describe('ISRMission', () => {
  describe('+ getVehicleMapping()', () => {
    // Using dummy vehicle objects until vehicle is implemented
    const vh1 = new Vehicle(1, ['ISR_Plane'], 'UNASSIGNED');
    const vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], 'UNASSIGNED');
    const vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], 'UNASSIGNED');
    const vh4 = new Vehicle(4, ['ISR_Plane'], 'UNASSIGNED');

    it('should return a valid mapping (with simple maps)', () => {
      const vehicleList = [vh1, vh2];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal(new Map([[vh1, 'ISR_Plane']]));
    });

    it('should return a valid mapping (with more complex maps)', () => {
      const vehicleList = [vh1, vh2, vh3, vh4];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal(new Map([[vh1, 'ISR_Plane'], [vh4, 'ISR_Plane']]));
    });

    it('should return a valid mapping when no maps can be made (empty map)', () => {
      const vehicleList = [vh2, vh3];
      const mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
      const mapping = mission.getVehicleMapping();

      chai.expect(mapping).to.deep.equal(new Map());
    });
  });


  describe('+ setVehicleMapping()', () => {
    // Using dummy vehicle objects until vehicle is implemented
    const vh1 = new Vehicle(1, ['ISR_Plane'], 'UNASSIGNED');
    const vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], 'UNASSIGNED');
    const vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], 'UNASSIGNED');
    const vh4 = new Vehicle(4, ['ISR_Plane'], 'UNASSIGNED');
    const vehicleList = [vh1, vh2, vh3, vh4];

    let mission;

    beforeEach(() => {
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('should accept a valid mapping (with simple maps)', () => {
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(mapping);
    });

    it('should accept a valid mapping (with complex maps)', () => {
      const mapping = new Map([[vh1, 'ISR_Plane'], [vh3, 'ISR_Plane'], [vh4, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(mapping);
    });

    it('should reject invalid mappings (with simple maps)', () => {
      const mapping = new Map([[vh2, 'Quick_Search']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(new Map());
    });

    it('should reject invalid mappings (with complex maps)', () => {
      const mapping = new Map([[vh2, 'Quick_Search'], [vh3, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);

      chai.expect(mission.activeVehicleMapping).to.deep.equal(new Map());
    });

    it('should reject invalid mappings with invalid vehicles', () => {
      const vh5 = new Vehicle(5, ['ISR_Plane'], 'UNASSIGNED');
      const mapping = new Map([[vh1, 'ISR_Plane'], [vh5, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      chai.expect(mission.activeVehicleMapping).to.deep.equal(new Map());
    });

    it('should reject any mapping when mission is not in WAITING state', () => {
      const mapping = new Map([[vh1, 'ISR_Plane']]);
      mission.missionStatus = 'READY';

      chai.expect(() => mission.setVehicleMapping(mapping)).to.throw();
    });
  });


  describe('+ setMissionInfo()', () => {
    const vehicleList = [];
    let mission;

    beforeEach(() => {
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('should accept mission specific information when all entries are valid', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetup).to.deep.equal(missionSetup);
    });

    it('should accept mission specific information even with extreneous data entries', () => {
      const missionSetup = { plane_end_action: 'land', repeat_information: 'UNASSIGNED' };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetup).to.deep.equal({ plane_end_action: 'land' });
    });

    it('should accept mission specific information even when given only invalid entries', () => {
      const missionSetup = { invalid_entry: true, repeat_information: true };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetup).to.deep.equal({ });
    });

    it('should reject mission setup information when Mission is not in WAITING state', () => {
      const missionSetup = { invalid_entry: true, repeat_information: true };
      mission.missionStatus = 'READY';

      chai.expect(() => mission.setMissionInfo(missionSetup)).to.throw();
    });
  });


  describe('+ missionSetupComplete()', () => {
    const vh1 = new Vehicle(1, ['ISR_Plane'], 'UNASSIGNED');
    const vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], 'UNASSIGNED');
    const vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], 'UNASSIGNED');
    const vh4 = new Vehicle(4, ['ISR_Plane'], 'UNASSIGNED');
    const vehicleList = [vh1, vh2, vh3, vh4];
    let mission;

    beforeEach(() => {
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('should accept a valid mission setup (simple)', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetupComplete()).to.equal(true);
    });


    it('should accept a valid mission setup (more complex)', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane'], [vh4, 'ISR_Plane'], [vh3, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetupComplete()).to.equal(true);
    });

    it('should reject an invalid mission setup when mission setup is not complete', () => {
      const missionSetup = { plane_end_action: 'land' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetupComplete()).to.be.a('string').that.includes('Mission property is not set');
    });

    it('should reject an invalid mission setup when vehicles assignments are missing', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };

      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionSetupComplete()).to.be.a('string').that.includes('No vehicle assigned for the job');
    });

    it('should reject an invalid mission setup when nothing is set', () => {
      chai.expect(mission.missionSetupComplete()).to.be.a('string');
    });
  });


  describe('+ missionInit()', () => {
    let vh1;
    let vh2;
    let vh3;
    let vh4;
    let mission;
    let vehicleList;

    beforeEach(() => {
      vh1 = new Vehicle(1, ['ISR_Plane'], 'UNASSIGNED');
      vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], 'UNASSIGNED');
      vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], 'UNASSIGNED');
      vh4 = new Vehicle(4, ['ISR_Plane'], 'UNASSIGNED');
      vehicleList = [vh1, vh2, vh3, vh4];
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('should accept a valid mission setup', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      chai.expect(mission.missionStatus).to.equal('WAITING');
      mission.missionInit();
      chai.expect(mission.missionStatus).to.equal('READY');
    });

    it('should reject a mission setup when the setup is incomplete', () => {
      const missionSetup = { plane_end_action: 'land' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);
      chai.expect(() => mission.missionInit()).to.throw();
    });

    it('should reject a mission setup when the vehicle mapping is incomplete', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map();

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);
      chai.expect(() => mission.missionInit()).to.throw();
    });

    it('should reject a mission setup when the vehicle is not available (not in master vehicle list)', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      vh1.assignJob('ISR_Plane');
      const mapping = new Map([[vh1, 'ISR_Plane'], [vh4, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);
      chai.expect(() => mission.missionInit()).to.throw();
    });

    it('should reject a mission setup when Mission is not in WAITING state', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      mission.missionInit();
      chai.expect(() => mission.missionInit()).to.throw();
    });
  });


  describe('+ missionStart()', () => {
    let vh1;
    let vh2;
    let vh3;
    let vh4;
    let mission;
    let vehicleList;

    beforeEach(() => {
      vh1 = new Vehicle(1, ['ISR_Plane'], 'UNASSIGNED');
      vh2 = new Vehicle(2, ['VTOL', 'Quick_Search'], 'UNASSIGNED');
      vh3 = new Vehicle(3, ['ISR_Plane', 'Payload_drop'], 'UNASSIGNED');
      vh4 = new Vehicle(4, ['ISR_Plane'], 'UNASSIGNED');
      vehicleList = [vh1, vh2, vh3, vh4];
      mission = new ISRMission(dummyCompletionCallback, vehicleList, dummyLogger);
    });

    it('should start a mission that has been initialized', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);
      mission.missionInit();

      const missionData = { lat: 10.000, lng: 10.000 };

      mission.missionStart(missionData);
      chai.expect(mission.missionStatus).to.equal('RUNNING');
      chai.expect(mission.waitingTasks).to.deep.equal({ ISR_Plane: [] });
      chai.expect(mission.activeTasks).to.deep.equal({ [vh1]: new Task(missionData.lat, missionData.lng) });
      chai.expect(vh1.status).to.equal('READY');
      chai.expect(vh1.assignedJob).to.equal('ISR_Plane');
      chai.expect(vh1.assignedTask).to.deep.equal(new Task(missionData.lat, missionData.lng));
    });

    it('should start a mission that has not been initialized, but all required information is present', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);

      const missionData = { lat: 10.000, lng: 10.000 };

      mission.missionStart(missionData);
      chai.expect(mission.missionStatus).to.equal('RUNNING');
      chai.expect(mission.waitingTasks).to.deep.equal({ ISR_Plane: [] });
      chai.expect(mission.activeTasks).to.deep.equal({ [vh1]: new Task(missionData.lat, missionData.lng) });
      chai.expect(vh1.status).to.equal('READY');
      chai.expect(vh1.assignedJob).to.equal('ISR_Plane');
      chai.expect(vh1.assignedTask).to.deep.equal(new Task(missionData.lat, missionData.lng));
    });

    it('should reject (throw exception) a mission that has not been initialized and not all information is present', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };

      mission.setMissionInfo(missionSetup);

      const missionData = { lat: 10.000, lng: 10.000 };
      chai.expect(() => mission.missionStart(missionData)).to.throw();
    });

    it('should reject a mission if the input data is insufficient', () => {
      const missionSetup = { plane_end_action: 'land', plane_start_action: 'takeoff' };
      const mapping = new Map([[vh1, 'ISR_Plane']]);

      mission.setVehicleMapping(mapping);
      mission.setMissionInfo(missionSetup);
      mission.missionInit();

      const missionData = { lat: 10.000 };

      chai.expect(() => mission.missionStart(missionData)).to.throw();
    });
  });


  describe('- run()', () => {
    // Add tests for the run function.
  });
});
