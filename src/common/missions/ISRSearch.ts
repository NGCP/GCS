import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType, Location } from '../../static/index';

import * as Message from '../../types/message';
import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

import ipc from '../../util/ipc';
import { getBoundingBox } from '../../util/util';

import Vehicle from '../struct/Vehicle';

export const missionName: MissionInformation.MissionName = 'isrSearch';

export const jobTypes: JobType[] = ['isrSearch'];

export class ISRSearch extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  protected information: MissionInformation.ISRSearchInformation;

  /**
   * List of point of interests.
   */
  private missionData: Location[] = [];

  public constructor(
    vehicles: { [vehicleId: number]: Vehicle },
    information: MissionInformation.ISRSearchInformation,
    activeVehicleMapping: { [vehicleId: number]: JobType },
  ) {
    super(vehicles, information, activeVehicleMapping);
    this.information = information;
  }

  protected generateTasks(): DictionaryList<Task> | undefined {
    const missionParameters = this.information.parameters;
    const tasks = new DictionaryList<Task>();

    if (!this.information.options.noTakeoff) {
      tasks.push('isrSearch', {
        taskType: 'takeoff',
        ...missionParameters.takeoff,
      });
    }

    tasks.push('isrSearch', {
      taskType: 'isrSearch',
      ...missionParameters.isrSearch,
    });

    if (!this.information.options.noLand) {
      tasks.push('isrSearch', {
        taskType: 'land',
        ...missionParameters.land,
      });
    }

    return tasks;
  }

  public update(jsonMessage: Message.JSONMessage): void {
    super.update(jsonMessage);

    if (Message.TypeGuard.isPOIMessage(jsonMessage)
      && this.activeVehicleMapping[jsonMessage.sid] === 'isrSearch') {
      const poiMessage = jsonMessage as Message.POIMessage;
      this.missionData.push({
        lat: poiMessage.lat,
        lng: poiMessage.lng,
      });
    }
  }

  protected generateCompletionParameters(): { [key: string]: TaskParameters } | undefined {
    if (this.missionData.length === 0) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'No points of interests were found in ISR search',
      });
      return undefined; // Mission will stop from this, not complete.
    }

    const boundingBox = getBoundingBox(this.missionData, 15);

    return {
      quickScan: {
        waypoints: [
          {
            lat: boundingBox.top,
            lng: boundingBox.left,
          },
          {
            lat: boundingBox.top,
            lng: boundingBox.right,
          },
          {
            lat: boundingBox.bottom,
            lng: boundingBox.left,
          },
          {
            lat: boundingBox.bottom,
            lng: boundingBox.right,
          },
        ],
      },
    };
  }
}

export default {
  missionName,
  jobTypes,
  constructor: ISRSearch,
};
