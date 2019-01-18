import Mission from '../Mission';
import Task from '../Task';

export default class ISRMission extends Mission {
  constructor(completionCallback, vehicleList, logger) {
    super(completionCallback, vehicleList, logger);

    this.missionJobTypes = ['ISR_Plane'];
    this.missionDataInformationRequirements = ['lat', 'lng'];
    this.missionSetupTracker = { plane_start_action: false, plane_end_action: false };

    this.missionDataResults = {};
  }

  generateTasks(missionData) {
    return new Map([
      ['ISR_Plane', [new Task(missionData.lat, missionData.lng)]],
    ]);
  }

  missionUpdate(mesg, sender) {
    // handle 'complete' type messages
    if (super.missionUpdate(mesg, sender)) return;

    // handle custom type messages
    if (mesg.type === 'POI') {
      if (!('POI' in this.missionDataResults)) {
        this.missionDataResults.POI = [];
      }
      this.missionDataResults.POI.push({ lat: mesg.lat, lng: mesg.lng });
    } else {
      throw new Error(`Unknown Mission message type ${mesg.type}. This either should have been handled by the message parser, or was incorrectly marked as a Mission update message by the Orchestrator.`);
    }
  }

  getTerminatedData() {
    return this.missionDataResults;
  }
}
