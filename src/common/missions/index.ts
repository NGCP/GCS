import { JobType } from '../../static/index';

import { MissionName } from '../../types/messages';

import Mission from '../struct/Mission';

import ISRSearch from './ISRSearch';

type MissionType = typeof Mission;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MissionWrapper extends MissionType { }

/**
 * Representation of a Mission subclass in this directory.
 */
export interface MissionObject {
  /**
   * Name of mission.
   */
  missionName: MissionName;

  /**
   * Jobs related to mission.
   */
  jobTypes: JobType[];

  /**
   * Constructor of the mission.
   */
  constructor: MissionWrapper;
}

const missionObject: { [missionName: string]: MissionObject | undefined } = {
  isrSearch: ISRSearch,
};

export default missionObject;
