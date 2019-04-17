import { ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { ThemeProps } from '../types/componentStyle';

import MainWindow from './mainWindow/MainWindow';
import MissionWindow from './missionWindow/MissionWindow';

import 'leaflet/dist/leaflet.css';
import 'react-virtualized/styles.css';

import './app.css';

const windows: { [hash: string]: ReactNode } = {
  '#main': MainWindow,
  '#mission': MissionWindow,
};

type State = ThemeProps;

export default class App extends Component<{}, State> {
  public constructor(props: {}) {
    super(props);

    this.state = {
      theme: 'light',
    };

    this.toggleTheme = this.toggleTheme.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('toggleTheme', this.toggleTheme);
  }

  public toggleTheme(): void {
    const { theme } = this.state;

    this.setState({ theme: theme === 'light' ? 'dark' : 'light' });
  }

  public render(): ReactNode {
    const { theme } = this.state;

    // In the case another hash was somehow loaded.
    if (window.location.hash !== '#main' && window.location.hash !== '#mission') {
      return <div />;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Window = windows[window.location.hash] as any;

    return <Window theme={theme} />;
  }
}
