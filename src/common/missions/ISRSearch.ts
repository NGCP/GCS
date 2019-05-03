import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType, Location } from '../../static/index';

import * as Message from '../../types/message';
import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

import ipc from '../../util/ipc';
import { getBoundingBox } from '../../util/util';

export const missionName: MissionInformation.MissionName = 'isrSearch';

export const jobTypes: JobType[] = ['isrSearch'];

export class ISRSearch extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  /**
   * List of point of interests.
   */
  private missionData: Location[] = [];

  protected generateTasks(): DictionaryList<Task> | undefined {
    const information = this.information as MissionInformation.ISRSearchInformation;
    const missionParameters = information.parameters;
    const tasks = new DictionaryList<Task>();

    if (!missionParameters) return undefined;

    if (!this.options.isrSearch.noTakeoff) {
      tasks.push('isrSearch', {
        taskType: 'takeoff',
        ...missionParameters.takeoff,
      });
    }

    tasks.push('isrSearch', {
      taskType: 'isrSearch',
      ...missionParameters.isrSearch,
    });

    if (!this.options.isrSearch.noLand) {
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
      && this.activeVehicleMapping[this.missionName][jsonMessage.sid] === 'isrSearch') {
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
  Mission: ISRSearch,
};
