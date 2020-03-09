import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { ThemeProps } from '../../types/componentStyle';


import ipc from '../../util/ipc';
import { updateVehicles } from '../../util/util';

import './manual.css';

export default class ManualWindow extends Component<ThemeProps> {
  public constructor(props: ThemeProps) {
    super(props);
  }

  public componentDidMount(): void {

  }

  public render(): ReactNode {
    const { theme } = this.props;

    return (
      <div className={`manualWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <h1> Test </h1>
      </div>
    )
  }
}
