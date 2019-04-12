// import { ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import {
  ISRSearchMissionParameters,
  PayloadDropMissionParameters,
  UGVRetreiveMissionParameters,
} from '../../types/messages';
import { ThemeProps } from '../../types/types';

import ISRSearch from './missionParameterLayouts/ISRSearch';
import PayLoadDrop from './missionParameterLayouts/PayloadDrop';
import UGVRetrieveTarget from './missionParameterLayouts/UGVRetrieveTarget';

const layouts: { [missionName: string]: () => JSX.Element } = {
  payloadDrop: PayLoadDrop,
  isrSearch: ISRSearch,
  ugvRetrieve: UGVRetrieveTarget,
};

interface Parameters {
  isrSearch: ISRSearchMissionParameters;
  payloadDrop: PayloadDropMissionParameters;
  ugvRetrieve: UGVRetreiveMissionParameters;
}

type MissionName = 'isrSearch' | 'vtolSearch' | 'payloadDrop' | 'ugvRetrieve' | 'uuvRetrieve';

interface State {
  firstMission: MissionName;
  parameters?: Parameters;
}

/**
 *
 */
export default class MissionWindow extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

    this.state = {
      firstMission: 'isrSearch',
    };
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { firstMission } = this.state;

    const Layout = layouts[firstMission];

    return (
      <div className={`missionWrapper${theme} === 'dark' ? '_dark : ''}`}>
        <Layout />
        <button type="button">Start Mission</button>
      </div>
    );
  }
}
