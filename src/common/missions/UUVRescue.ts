import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType } from '../../static/index';

import * as MissionInformation from '../../types/missionInformation';
import { Task, TaskParameters } from '../../types/task';

import Vehicle from '../struct/Vehicle';

const missionName: MissionInformation.MissionName = 'uuvRescue';

const jobTypes: JobType[] = ['uuvRescue'];

class UUVRescue extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {};

  protected information: MissionInformation.UUVRescueInformation;

  public constructor(
    vehicles: { [vehicleId: number]: Vehicle },
    information: MissionInformation.UUVRescueInformation,
    activeVehicleMapping: { [vehicleId: number]: JobType },
  ) {
    super(vehicles, information, activeVehicleMapping);
    this.information = information;
  }

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
  constructor: UUVRescue,
};
