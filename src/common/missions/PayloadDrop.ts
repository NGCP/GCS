import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType, Location } from '../../static/index';

import * as Message from '../../types/message';
import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

import ipc from '../../util/ipc';

export const missionName: MissionInformation.MissionName = 'payloadDrop';

export const jobTypes: JobType[] = ['payloadDrop'];

export class PayloadDrop extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  /**
   * Point of interest.
   */
  private missionData: Location | null = null;

  protected generateTasks(): DictionaryList<Task> | undefined {
    const information = this.information as MissionInformation.PayloadDropInformation;
    const missionParameters = information.parameters;
    const tasks = new DictionaryList<Task>();

    if (!this.options.payloadDrop.noTakeoff) {
      tasks.push('payloadDrop', {
        taskType: 'takeoff',
        ...missionParameters.takeoff,
      });
    }

    tasks.push('payloadDrop', {
      taskType: 'payloadDrop',
      ...missionParameters.payloadDrop,
    });

    if (!this.options.payloadDrop.noLand) {
      tasks.push('payloadDrop', {
        taskType: 'land',
        ...missionParameters.land,
      });
    }

    return tasks;
  }

  public update(jsonMessage: Message.JSONMessage): void {
    super.update(jsonMessage);

    if (Message.TypeGuard.isPOIMessage(jsonMessage)
      && this.activeVehicleMapping[this.missionName][jsonMessage.sid] === 'payloadDrop') {
      const poiMessage = jsonMessage as Message.POIMessage;
      this.missionData = {
        lat: poiMessage.lat,
        lng: poiMessage.lng,
      };
    }
  }

  protected generateCompletionParameters(): { [key: string]: TaskParameters } | undefined {
    if (!this.missionData) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'No target location was provided in payload drop',
      });
      return undefined; // Mission will stop from this, not complete.
    }

    return {
      retrieveTarget: {
        lat: this.missionData.lat,
        lng: this.missionData.lng,
      },
      // TODO: generate data for deliverTarget
    };
  }
}

export default {
  missionName,
  jobTypes,
  Mission: PayloadDrop,
};
