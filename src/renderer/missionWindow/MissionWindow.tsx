import React, { Component, ReactNode } from 'react';

import {
  ISRSearchMissionParameters,
  PayloadDropMissionParameters,
  UGVRetreiveMissionParameters,
} from '../../types/message';
import { ThemeProps } from '../../types/types';

import ISRSearch from './parameters/ISRSearch';
import PayLoadDrop from './parameters/PayloadDrop';
import UGVRetrieveTarget from './parameters/UGVRetrieveTarget';
import UUVRetreiveTarget from './parameters/UUVRetrieveTarget';
import VTOLSearch from './parameters/VTOLSearch';

const layouts: { [missionName: string]: () => ReactNode } = {
  payloadDrop: PayLoadDrop,
  isrSearch: ISRSearch,
  ugvRetrieve: UGVRetrieveTarget,
  uuvRetrieve: UUVRetreiveTarget,
  vtolSearch: VTOLSearch,
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
 * Mission window component.
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Layout = layouts[firstMission] as any;

    return (
      <div className={`missionWrapper${theme} === 'dark' ? '_dark : ''}`}>
        <Layout />
        <button type="button">Start Mission</button>
      </div>
    );
  }
}
