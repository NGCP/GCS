/*
 * https://github.com/NGCP/GCS/wiki/List-of-Job-Types
 *
 * These definitions will not have the time, sid, tid, and id fields.
 */

export interface JobBase {
  /**
   * Name of the job.
   */
  jobType: string;

  /**
   * Information related to complete the job.
   */
  missionInfo: object;
}

export interface Takeoff extends JobBase {
  jobType: 'takeoff';
  missionInfo: {
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

export interface Loiter extends JobBase {
  jobType: 'loiter';
  missionInfo: {
    lat: number;
    lng: number;
    alt: number;
    radius: number;
    direction: number;
  };
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearch extends JobBase {
  jobType: 'isrSearch';
  missionInfo: {
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

export interface PayloadDrop extends JobBase {
  jobType: 'payloadDrop';
  missionInfo: {
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

export interface Land extends JobBase {
  jobType: 'land';
  missionInfo: {
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

export interface RetrieveTargetUGV extends JobBase {
  jobType: 'retrieveTarget';
  missionInfo: {
    lat: number;
    lng: number;
  };
}

export interface DeliverTarget extends JobBase {
  jobType: 'deliverTarget';
  missionInfo: {
    lat: number;
    lng: number;
  };
}

export interface RetrieveTargetUUV extends JobBase {
  jobType: 'retrieveTarget';
  missionINfo: {};
}

export interface QuickScan extends JobBase {
  jobType: 'quickScan';
  missionInfo: {
    lat: number;
    lng: number;
    innerRadius: number;
    outerRadius: number;
  };
}

export interface DetailedSearch extends JobBase {
  jobType: 'detailedSearch';
  missionInfo: {
    lat: number;
    lng: number;
  };
}

export type Job = Takeoff | Loiter | ISRSearch | PayloadDrop | Land | RetrieveTargetUGV
| DeliverTarget | RetrieveTargetUUV | QuickScan | DetailedSearch;
