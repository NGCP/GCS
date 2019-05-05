import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType } from '../../static/index';

import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

export const missionName: MissionInformation.MissionName = 'payloadDrop';

export const jobTypes: JobType[] = ['payloadDrop'];

export class PayloadDrop extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  protected generateTasks(): DictionaryList<Task> | undefined {
    const information = this.information as MissionInformation.PayloadDropInformation;
    const missionParameters = information.parameters;
    const tasks = new DictionaryList<Task>();

    if (!missionParameters) return undefined;

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

  // eslint-disable-next-line class-methods-use-this
  protected generateCompletionParameters(): { [key: string]: TaskParameters } | undefined {
    return {};
  }
}

export default {
  missionName,
  jobTypes,
  Mission: PayloadDrop,
};
