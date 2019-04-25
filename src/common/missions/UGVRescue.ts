import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType } from '../../static/index';

import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

import Vehicle from '../struct/Vehicle';

export const missionName: MissionInformation.MissionName = 'ugvRescue';

export const jobTypes: JobType[] = ['ugvRescue'];

export class UGVRescue extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  protected information: MissionInformation.UGVRescueInformation;

  public constructor(
    vehicles: { [vehicleId: number]: Vehicle },
    information: MissionInformation.UGVRescueInformation,
    activeVehicleMapping: MissionInformation.ActiveVehicleMapping,
    options: MissionInformation.MissionOptions,
  ) {
    super(vehicles, information, activeVehicleMapping, options);
    this.information = information;
  }

  protected generateTasks(): DictionaryList<Task> | undefined {
    const missionParameters = this.information.parameters;
    const tasks = new DictionaryList<Task>();

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
  constructor: UGVRescue,
};
