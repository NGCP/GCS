import DictionaryList from '../struct/DictionaryList';
import Mission from '../struct/Mission';

import { JobType, Location } from '../../static/index';

import * as Message from '../../types/message';
import * as MissionInformation from '../../types/missionInformation';
import * as Task from '../../types/task';

import ipc from '../../util/ipc';
import { getDistance } from '../../util/util';

import Vehicle from '../struct/Vehicle';

export const missionName: MissionInformation.MissionName = 'vtolSearch';

export const jobTypes: JobType[] = ['quickScan', 'detailedSearch'];

export class VTOLSearch extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {
    detailedSearch: (a: Task.Task, b: Task.Task): number => {
      if (!Task.TypeGuard.isDetailedSearchTask(a)) return 1;
      if (!Task.TypeGuard.isDetailedSearchTask(b)) return 1;

      const vehicle = this.getDetailedSearchVehicle();
      if (!vehicle) return 1;

      const xa = a as Task.DetailedSearchTask;
      const xb = b as Task.DetailedSearchTask;

      return getDistance({ lat: vehicle.getLat(), lng: vehicle.getLng() }, xa)
        - getDistance({ lat: vehicle.getLat(), lng: vehicle.getLng() }, xb);
    },
  };

  protected information: MissionInformation.VTOLSearchInformation;

  /**
   * Point of interest.
   */
  private missionData: Location | null = null;

  public constructor(
    vehicles: { [vehicleId: number]: Vehicle },
    information: MissionInformation.VTOLSearchInformation,
    activeVehicleMapping: { [vehicleId: number]: JobType },
  ) {
    super(vehicles, information, activeVehicleMapping);
    this.information = information;
  }

  private getDetailedSearchVehicle(): Vehicle | undefined {
    const vehicleIdString = Object.keys(this.activeVehicleMapping)
      .find((idString): boolean => {
        const id = parseInt(idString, 10);
        return this.activeVehicleMapping[id] === 'detailedSearch';
      });
    if (!vehicleIdString) return undefined;

    const vehicleId = parseInt(vehicleIdString, 10);
    return this.vehicles[vehicleId];
  }

  protected generateTasks(): DictionaryList<Task.Task> | undefined {
    const missionParameters = this.information.parameters;
    const tasks = new DictionaryList<Task.Task>();

    tasks.push('quickScan', {
      taskType: 'quickScan',
      ...missionParameters.quickScan,
    });

    return tasks;
  }

  public update(jsonMessage: Message.JSONMessage): void {
    super.update(jsonMessage);

    if (Message.TypeGuard.isPOIMessage(jsonMessage)) {
      const poiMessage = jsonMessage as Message.POIMessage;

      if (this.activeVehicleMapping[jsonMessage.sid] === 'quickScan') {
        this.addTask('detailedSearch', {
          taskType: 'detailedSearch',
          lat: poiMessage.lat,
          lng: poiMessage.lng,
        });
      } else if (this.activeVehicleMapping[jsonMessage.sid] === 'detailedSearch') {
        this.missionData = { lat: poiMessage.lat, lng: poiMessage.lng };
      }
    }
  }

  protected generateCompletionParameters(): { [key: string]: Task.TaskParameters } | undefined {
    if (!this.missionData) {
      ipc.postLogMessages({
        type: 'failure',
        message: 'No points of interest was found in detailed search',
      });
      return undefined; // Mission will stop from this, not complete.
    }

    return {
      payloadDrop: {
        lat: this.missionData.lat,
        lng: this.missionData.lng,
      },
      /*
       * TODO: ensure this data passes on correctly to payload drop, cannnot do automatically
       * w/o calculations? Will require mission to be run separately for now.
       */
    };
  }
}

export default {
  missionName,
  jobTypes,
  constructor: VTOLSearch,
};
