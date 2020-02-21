import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import './parameters.css';

import { ThemeProps } from '../../../types/componentStyle';

import { missionName } from '../../../common/missions/UGVRescue';

import { Location } from '../../../static/index';

import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';
import { readyToStart } from '../../../util/parameter';

interface State {
  ready: boolean;
}
export class Geofencing extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

this.state = {
  ready: false,
};

}
};

export default {
  missionName,
  layout: Geofencing
};
