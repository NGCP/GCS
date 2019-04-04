import { ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { ThemeProps } from '../../../../util/types';

import Control from './Control';

/**
 * Control that toggles theme when clicked.
 */
export default class ThemeControl extends Component<ThemeProps> {
  private static onClick(): void {
    ipcRenderer.send('post', 'toggleTheme');
  }

  public render(): ReactNode {
    const { theme } = this.props;

    return (
      <Control
        className={`theme-control${theme === 'dark' ? '_dark' : ''}`}
        onClick={ThemeControl.onClick}
        position="topright"
        title="Toggle theme"
      />
    );
  }
}
