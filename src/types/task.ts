interface TaskBase {
  /**
   * Type of task.
   */
  taskType: string;
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface TakeoffTaskParameters {
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
}

export interface TakeoffTask extends TaskBase, TakeoffTaskParameters {
  taskType: 'takeoff';
}

/**
 * Type guard for Takeoff task.
 */
function isTakeoffTask(task: Task): boolean {
  return task.taskType === 'takeoff';
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface LoiterTaskParameters {
  lat: number;
  lng: number;
  alt: number;
  radius: number;
  direction: number;
}

export interface LoiterTask extends TaskBase, LoiterTaskParameters {
  taskType: 'loiter';
}

/**
 * Type guard for Loiter task.
 */
export function isLoiterTask(task: Task): boolean {
  return task.taskType === 'loiter';
}

/**
 * Do not import this outside of types/missionInformation.
 */
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchTaskParameters {
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
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchTask extends TaskBase, ISRSearchTaskParameters {
  taskType: 'isrSearch';
}

/**
 * Type guard for ISR Search task.
 */
function isISRSearchTask(task: Task): boolean {
  return task.taskType === 'isrSearch'
    && task.waypoints && task.waypoints.length === 3;
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface PayloadDropTaskParameters {
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
}

export interface PayloadDropTask extends TaskBase, PayloadDropTaskParameters {
  taskType: 'payloadDrop';
}

/**
 * Type guard for PayloadDrop task.
 */
function isPayloadDropTask(task: Task): boolean {
  return task.taskType === 'payloadDrop';
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface LandTaskParameters {
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
}

export interface LandTask extends TaskBase, LandTaskParameters {
  taskType: 'land';
}

/**
 * Type guard for Land task.
 */
function isLandTask(task: Task): boolean {
  return task.taskType === 'land';
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface UGVRetrieveTargetTaskParameters {
  lat: number;
  lng: number;
}

export interface UGVRetrieveTargetTask extends TaskBase, UGVRetrieveTargetTaskParameters {
  taskType: 'retrieveTarget';
}

/**
 * Type guard for UGV's RetriveTarget task.
 */
function isUGVRetrieveTargetTask(task: Task): boolean {
  if (task.taskType !== 'retrieveTarget') return false;
  return Object.keys(task).length === 3; // Keys are taskType, lat, lng.
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface DeliverTargetTaskParameters {
  lat: number;
  lng: number;
}

export interface DeliverTargetTask extends TaskBase, DeliverTargetTaskParameters {
  taskType: 'deliverTarget';
}

/**
 * Type guard for DeliverTarget task.
 */
function isDeliverTargetTask(task: Task): boolean {
  return task.taskType === 'deliverTarget';
}

export interface UUVRetrieveTargetTask extends TaskBase {
  taskType: 'retrieveTarget';
}

/**
 * Type guard for UUV's RetrieveTarget task.
 */
function isUUVRetrieveTargetTask(task: Task): boolean {
  if (task.taskType !== 'retrieveTarget') return false;
  return Object.keys(task).length === 1; // Only key is taskType.
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface QuickScanTaskParameters {
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
    },
    {
      lat: number;
      lng: number;
    }
  ];
}

export interface QuickScanTask extends TaskBase, QuickScanTaskParameters {
  taskType: 'quickScan';
}

/**
 * Type guard for QuickScan task.
 */
function isQuickScanTask(task: Task): boolean {
  return task.taskType === 'quickScan';
}

/**
 * Do not import this outside of types/missionInformation.
 */
export interface DetailedSearchParameters {
  lat: number;
  lng: number;
}


export interface DetailedSearchTask extends TaskBase, DetailedSearchParameters {
  taskType: 'detailedSearch';
}

/**
 * Type guard for quickScan task.
 */
function isDetailedSearchTask(task: Task): boolean {
  return task.taskType === 'detailedSearch';
}

/**
 * A task for a vehicle to perform. Check which specific task it is by
 * checking through the type guards.
 */
export type Task = TakeoffTask | LoiterTask | ISRSearchTask | PayloadDropTask | LandTask
| UGVRetrieveTargetTask | DeliverTargetTask | UUVRetrieveTargetTask | QuickScanTask
| DetailedSearchTask;

/**
 * Special type for missions only to use. This is to ensure that missions can properly
 * pass in tasks.
 */
export type TaskParameters = TakeoffTaskParameters | LoiterTaskParameters | ISRSearchTaskParameters
| PayloadDropTaskParameters | LandTaskParameters | UGVRetrieveTargetTaskParameters
| DeliverTargetTaskParameters | UUVRetrieveTargetTask | QuickScanTaskParameters
| DetailedSearchParameters;

/**
 * Checks if an object is a task.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTask(object: { [key: string]: any }): boolean {
  if (!object.taskType) return false;

  const task = object as Task;

  return isTakeoffTask(task)
   || isLoiterTask(task)
   || isISRSearchTask(task)
   || isPayloadDropTask(task)
   || isLandTask(task)
   || isUGVRetrieveTargetTask(task)
   || isDeliverTargetTask(task)
   || isUUVRetrieveTargetTask(task)
   || isQuickScanTask(task)
   || isDetailedSearchTask(task);
}

/**
 * Type guards for a task.
 */
export const TypeGuard = {
  isTakeoffTask,
  isLoiterTask,
  isISRSearchTask,
  isPayloadDropTask,
  isLandTask,
  isUGVRetrieveTargetTask,
  isDeliverTargetTask,
  isUUVRetrieveTargetTask,
  isQuickScanTask,
  isDetailedSearchTask,
  isTask,
};
