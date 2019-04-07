/*
 * Defines all the available jobs for vehicles, as well as the jobs' corresponding tasks.
 * Also has a function to check whether or not a task is valid for a certain job.
 */

interface TaskBase {
  /**
   * Information related to complete the task.
   */
  missionInfo: object;
}

/**
 * Takeoff task.
 */
export interface Takeoff extends TaskBase {
  missionInfo: {
    taskType: 'takeoff';

    lat: number;
    lng: number;
    alt: number;
    loiter: {
      lat: number;
      lng: number;
      alt: number;
      radius: number;
      direction: number;
    };
  };
}

/**
 * Update loiter task.
 */
export interface Loiter extends TaskBase {
  missionInfo: {
    taskType: 'loiter';

    lat: number;
    lng: number;
    alt: number;
    radius: number;
    direction: number;
  };
}

/**
 * ISR search task.
 */
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearch extends TaskBase {
  missionInfo: {
    taskType: 'isrSearch';

    alt: number;
    waypoints: [
      {
        lat: number;
        lng: number;
      },
      {
        lat: number;
        lng: number;
      },
      {
        lat: number;
        lng: number;
      }
    ];
  };
}

/**
 * Payload drop task.
 */
export interface PayloadDrop extends TaskBase {
  missionInfo: {
    taskType: 'payloadDrop';

    waypoints: [
      {
        lat: number;
        lng: number;
        alt: number;
      },
      {
        lat: number;
        lng: number;
        alt: number;
      }
    ];
  };
}

/**
 * Land task.
 */
export interface Land extends TaskBase {
  missionInfo: {
    taskType: 'land';

    waypoints: [
      {
        lat: number;
        lng: number;
        alt: number;
      },
      {
        lat: number;
        lng: number;
        alt: number;
      }
    ];
  };
}

/**
 * Retrieve target task for UGV.
 */
export interface UGVRetrieveTarget extends TaskBase {
  missionInfo: {
    taskType: 'retrieveTarget';

    lat: number;
    lng: number;
  };
}

/**
 * Deliver target task.
 */
export interface DeliverTarget extends TaskBase {
  missionInfo: {
    taskType: 'deliverTarget';

    lat: number;
    lng: number;
  };
}

/**
 * Retrieve target task for UUV.
 */
export interface UUVRetrieveTarget extends TaskBase {
  missionInfo: {
    taskType: 'retrieveTarget';
  };
}

/**
 * Quick scan task.
 */
export interface QuickScan extends TaskBase {
  missionInfo: {
    taskType: 'quickScan';

    searchArea: {
      center: [number, number];
      rad1: number;
      rad2: number;
    };
  };
}

/**
 * Detailed search task.
 */
export interface DetailedSearch extends TaskBase {
  missionInfo: {
    taskType: 'detailedSearch';

    lat: number;
    lng: number;
  };
}

/**
 * An operation that the vehicle can perform given its job.
 */
export type Task = Takeoff | Loiter | ISRSearch | PayloadDrop | Land | UGVRetrieveTarget
| DeliverTarget | UUVRetrieveTarget | QuickScan | DetailedSearch;

/**
 * All vehicle jobs with their corresponding tasks.
 */
export interface Jobs {
  /**
   * Vehicle is capable of performing ISR search.
   */
  isrSearch: {
    takeoff: Takeoff;
    loiter: Loiter;
    isrSearch: ISRSearch;
    land: Land;
  };

  /**
   * Vehicle is capable of performing payload drop.
   */
  payloadDrop: {
    takeoff: Takeoff;
    loiter: Loiter;
    payloadDrop: PayloadDrop;
    land: Land;
  };

  /**
   * Vehicle is capable of performing retrieving target on land.
   */
  ugvRetrieve: {
    retrieveTarget: UGVRetrieveTarget;
    deliverTarget: DeliverTarget;
  };

  /**
   * Vehicle is capable of performing retrieving target underwater.
   */
  uuvRetrieve: {
    retrieveTarget: UUVRetrieveTarget;
  };

  /**
   * Vehicle is capable of performing quick scan.
   */
  quickScan: {
    quickScan: QuickScan;
  };

  /**
   * Vehicle is capable of performing detailed search.
   */
  detailedSearch: {
    detailedSearch: DetailedSearch;
  };
}

function contains(array: string[], value: string): boolean {
  return array.indexOf(value) >= 0;
}

/**
 * Type guard to see if a task is valid for a certain job.
 */
export function isValidTaskForJob(task: Task, jobType: string): boolean {
  const { taskType } = task.missionInfo;

  switch (jobType) {
    case 'isrSearch':
      return contains(['takeoff', 'loiter', 'isrSearch', 'land'], taskType);
    case 'payloadDrop':
      return contains(['takeoff', 'loiter', 'payloadDrop', 'land'], taskType);
    case 'ugvRetrieve':
      return contains(['retrieveTarget', 'deliverTarget'], taskType);
    case 'uuvRetrieve':
      return taskType === 'retrieveTarget';
    case 'quickScan':
      return taskType === 'quickScan';
    case 'detailedSearch':
      return taskType === 'detailedSearch';
    default:
      return false;
  }
}

export default {
  isValidTaskForJob,
};
