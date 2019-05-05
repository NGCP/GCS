/* eslint-disable import/no-named-as-default */

import { JobType } from '../../static/index';

import { MissionName } from '../../types/missionInformation';

import Mission from '../struct/Mission';

import ISRSearch from './ISRSearch';
import PayloadDrop from './PayloadDrop';
import UGVRescue from './UGVRescue';
import UUVRescue from './UUVRescue';
import VTOLSearch from './VTOLSearch';

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
   * Mission class itself.
   */
  Mission: MissionWrapper;
}

const missionObject: { [missionName in MissionName]: MissionObject } = {
  isrSearch: ISRSearch,
  vtolSearch: VTOLSearch,
  payloadDrop: PayloadDrop,
  ugvRescue: UGVRescue,
  uuvRescue: UUVRescue,
};

export default missionObject;
