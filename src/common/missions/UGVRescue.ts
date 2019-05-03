import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType } from '../../static/index';

import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

export const missionName: MissionInformation.MissionName = 'ugvRescue';

export const jobTypes: JobType[] = ['ugvRescue'];

export class UGVRescue extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  protected generateTasks(): DictionaryList<Task> | undefined {
    const information = this.information as MissionInformation.UGVRescueInformation;
    const missionParameters = information.parameters;
    const tasks = new DictionaryList<Task>();

    if (!missionParameters) return undefined;

    tasks.push('ugvRescue', {
      taskType: 'retrieveTarget',
      ...missionParameters.retrieveTarget,
    });

    tasks.push('ugvRescue', {
      taskType: 'deliverTarget',
      ...missionParameters.deliverTarget,
    });

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
  Mission: UGVRescue,
};
