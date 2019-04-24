import React, { Component, ReactNode } from 'react';

import { ThemeProps } from '../../types/componentStyle';
import * as MissionInformation from '../../types/missionInformation';

import ISRSearch from './parameters/ISRSearch';
import PayloadDrop from './parameters/PayloadDrop';
import UGVRetrieveTarget from './parameters/UGVRetrieveTarget';
import UUVRetreiveTarget from './parameters/UUVRetrieveTarget';
import VTOLSearch from './parameters/VTOLSearch';

import ipc from '../../util/ipc';

const layoutsLandMission = [ISRSearch, VTOLSearch, PayloadDrop, UGVRetrieveTarget];
const layoutsUnderwaterMission = [ISRSearch, VTOLSearch, PayloadDrop, UUVRetreiveTarget];

interface State {
  missionType: 'land' | 'underwater';
  requireConfirmation: boolean;
  startMissionIndex: number;
  endMissionIndex: number;
  information: {
    landMission: MissionInformation.Information[];
    underwaterMission: MissionInformation.Information[];
  };
}

/**
 * Mission window component.
 */
export default class MissionWindow extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

    this.state = {
      missionType: 'land',
      requireConfirmation: true,
      startMissionIndex: 0,
      endMissionIndex: 0,
      information: {
        landMission: [],
        underwaterMission: [],
      },
    };

    this.postStartMissions = this.postStartMissions.bind(this);
  }

  private postStartMissions(): void {
    const {
      missionType,
      requireConfirmation,
      startMissionIndex,
      endMissionIndex,
      information,
    } = this.state;

    const missionInformation = missionType === 'land' ? information.landMission : information.underwaterMission;

    ipc.postStartMissions(
      missionInformation.slice(startMissionIndex, endMissionIndex + 1),
      requireConfirmation,
    );
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { missionType, startMissionIndex } = this.state;

    const Layout = (missionType === 'land' ? layoutsLandMission[startMissionIndex]
      : layoutsUnderwaterMission[startMissionIndex]) as React.ElementType;

    return (
      <div className={`missionWrapper${theme} === 'dark' ? '_dark : ''}`}>
        <Layout />
        <button type="button" onClick={this.postStartMissions}>Start Mission</button>
      </div>
    );
  }
}
