import React, { Component, ReactNode } from 'react';

import { ThemeProps } from '../../types/componentStyle';
// import * as MissionInformation from '../../types/missionInformation';

import ISRSearch from './parameters/ISRSearch';
import PayLoadDrop from './parameters/PayloadDrop';
import UGVRetrieveTarget from './parameters/UGVRetrieveTarget';
import UUVRetreiveTarget from './parameters/UUVRetrieveTarget';
import VTOLSearch from './parameters/VTOLSearch';

const layouts: { [missionName: string]: () => ReactNode } = {
  payloadDrop: PayLoadDrop,
  isrSearch: ISRSearch,
  ugvRescue: UGVRetrieveTarget,
  uuvRescue: UUVRetreiveTarget,
  vtolSearch: VTOLSearch,
};

type MissionName = 'isrSearch' | 'vtolSearch' | 'payloadDrop' | 'ugvRetrieve' | 'uuvRetrieve';

interface State {
  firstMission: MissionName;
  // information: Information;
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
