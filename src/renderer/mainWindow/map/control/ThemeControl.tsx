import React, { Component, ReactNode } from 'react';

import { ThemeProps } from '../../../../types/componentStyle';

import ipc from '../../../../util/ipc';

import Control from './Control';

/**
 * Control that toggles theme when clicked.
 */
export default class ThemeControl extends Component<ThemeProps> {
  private static onClick(): void {
    ipc.postToggleTheme();
  }

  public render(): ReactNode {
    const { theme } = this.props;

    return (
      <Control
        className={`${theme === 'dark' ? 'fas' : 'far'} fa-moon`}
        onClick={ThemeControl.onClick}
        position="topright"
        title="Toggle theme"
      />
    );
  }
}
