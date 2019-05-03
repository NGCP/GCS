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

interface POITracker {
  location: Location;
  valid: boolean;
}

export class VTOLSearch extends Mission {
  protected missionName = missionName;

  protected jobTypes = new Set<JobType>(jobTypes);

  protected addTaskCompare = {
    detailedSearch: (a: Task.Task, b: Task.Task): number => {
      const vehicle = this.getDetailedSearchVehicle();
      if (!vehicle) return 1;

      const xa = a as Task.DetailedSearchTask;
      const xb = b as Task.DetailedSearchTask;

      return getDistance({ lat: vehicle.getLat(), lng: vehicle.getLng() }, xa)
        - getDistance({ lat: vehicle.getLat(), lng: vehicle.getLng() }, xb);
    },
  };

  /**
   * Point of interest.
   */
  private missionData: Location | null = null;

  /**
   * Keeps track of the current detailed search task to see if the POI is valid or not.
   */
  private currentDetailedSearchTask: {
    [vehicleId: number]: POITracker | undefined;
  } = {};

  private getDetailedSearchVehicle(): Vehicle | undefined {
    const vehicleIdString = Object.keys(this.activeVehicleMapping)
      .find((idString): boolean => {
        const id = parseInt(idString, 10);
        return this.activeVehicleMapping[this.missionName][id] === 'detailedSearch';
      });
    if (!vehicleIdString) return undefined;

    const vehicleId = parseInt(vehicleIdString, 10);
    return this.vehicles[vehicleId];
  }

  protected generateTasks(): DictionaryList<Task.Task> | undefined {
    const information = this.information as MissionInformation.VTOLSearchInformation;
    const missionParameters = information.parameters;
    const tasks = new DictionaryList<Task.Task>();

    if (!missionParameters) return undefined;

    tasks.push('quickScan', {
      taskType: 'quickScan',
      ...missionParameters.quickScan,
    });

    return tasks;
  }

  protected assignTask(vehicle: Vehicle, task: Task.Task): boolean {
    if (Task.TypeGuard.isDetailedSearchTask(task)) {
      const dtask = task as Task.DetailedSearchTask;
      this.currentDetailedSearchTask[vehicle.getVehicleId()] = {
        location: { lat: dtask.lat, lng: dtask.lng },
        valid: false,
      };
    }

    return super.assignTask(vehicle, task);
  }

  public update(jsonMessage: Message.JSONMessage): void {
    super.update(jsonMessage);

    if (Message.TypeGuard.isPOIMessage(jsonMessage)) {
      const poiMessage = jsonMessage as Message.POIMessage;

      if (this.activeVehicleMapping[this.missionName][jsonMessage.sid] === 'quickScan') {
        const location = { lat: poiMessage.lat, lng: poiMessage.lng };
        this.addTask('detailedSearch', {
          taskType: 'detailedSearch',
          ...location,
        });

        ipc.postUpdatePOIs({
          location,
          type: 'unknown',
        });

        return;
      }

      if (this.activeVehicleMapping[this.missionName][jsonMessage.sid] === 'detailedSearch') {
        this.missionData = { lat: poiMessage.lat, lng: poiMessage.lng };

        // Sets current task POI as valid, with a check if there is a task right now or not.
        const tracker = this.currentDetailedSearchTask[jsonMessage.sid];
        if (tracker) tracker.valid = true;
      }
      return;
    }

    if (Message.TypeGuard.isCompleteMessage(jsonMessage)) {
      if (this.activeVehicleMapping[this.missionName][jsonMessage.sid] === 'detailedSearch') {
        const tracker = this.currentDetailedSearchTask[jsonMessage.sid];
        if (tracker) {
          ipc.postUpdatePOIs({
            location: tracker.location,
            type: tracker.valid ? 'valid' : 'invalid',
          });
        }
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
  Mission: VTOLSearch,
};
