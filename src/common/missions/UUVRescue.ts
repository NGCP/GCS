import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType } from '../../static/index';

import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

export const missionName: MissionInformation.MissionName = 'uuvRescue';

export const jobTypes: JobType[] = ['uuvRescue'];

export class UUVRescue extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  // eslint-disable-next-line class-methods-use-this
  protected generateTasks(): DictionaryList<Task> | undefined {
    const tasks = new DictionaryList<Task>();

    tasks.push('uuvRescue', {
      taskType: 'retrieveTarget',
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
  Mission: UUVRescue,
};
