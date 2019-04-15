import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType } from '../../static/index';

import {
  ISRSearchMissionParameters,
  JSONMessage,
  messageTypeGuard,
  missionParametersTypeGuard,
  MissionName,
  POIMessage,
  Task,
  toFloat,
  toHexFloat,
  VTOLSearchMissionParameters,
} from '../../types/messages';
import { LatLngZoom } from '../../types/types';

import ipc from '../../util/ipc';

export const missionName: MissionName = 'isrSearch';

export const jobTypes: JobType[] = ['isrSearch'];

class ISRSearch extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  /**
   * List of point of interests to get parameters for next mission (VTOL Search).
   */
  private missionData: LatLngZoom[] = [];

  protected generateTasks(): DictionaryList<Task> {
    // Check if options and parameters line up.
    if (!this.options.isrSearch
      || missionParametersTypeGuard.isISRSearchMissionParameters(this.parameters)) {
      throw new Error('Failed to generate tasks as options/parameters were invalid');
    }
    const missionParameters = this.parameters as ISRSearchMissionParameters;

    const tasks = new DictionaryList<Task>();

    // Add takeoff to our tasks.
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

  protected generateCompletionParameters(): VTOLSearchMissionParameters | undefined {
    // Will be changed depending on what VTOL wants from UAV.
    if (this.missionData.length === 0) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'No points of interests were found in the mission',
      });
      return undefined;
    }

    let bottom: number = Number.MIN_VALUE;
    let top: number = Number.MAX_VALUE;

    let left: number = Number.MIN_VALUE;
    let right: number = Number.MAX_VALUE;

    this.missionData.forEach((data): void => {
      if (!bottom || data.lat < bottom) bottom = data.lat;
      if (!top || data.lat > top) top = data.lat;

      if (!left || data.lng < left) left = data.lng;
      if (!right || data.lng > right) right = data.lng;
    });

    return {
      quickScan: {
        waypoints: [
          {
            lat: toHexFloat(top),
            lng: toHexFloat(left),
          },
          {
            lat: toHexFloat(top),
            lng: toHexFloat(right),
          },
          {
            lat: toHexFloat(bottom),
            lng: toHexFloat(left),
          },
          {
            lat: toHexFloat(bottom),
            lng: toHexFloat(right),
          },
        ],
      },
    };
  }

  public update(jsonMessage: JSONMessage): void {
    super.update(jsonMessage);

    if (messageTypeGuard.isPOIMessage(jsonMessage)) {
      const poiMessage = jsonMessage as POIMessage;
      this.missionData.push({
        lat: toFloat(poiMessage.lat),
        lng: toFloat(poiMessage.lng),
      });
    }
  }
}

export default {
  missionName,
  jobTypes,
  Mission: ISRSearch,
};
