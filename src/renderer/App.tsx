import { ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { ThemeProps } from '../types/componentStyle';

import MainWindow from './mainWindow/MainWindow';
import MissionWindow from './missionWindow/MissionWindow';
import ManualWindow from './manualWindow/ManualWindow';

import '@fortawesome/fontawesome-free/css/all.css';
import 'leaflet/dist/leaflet.css';
import 'react-virtualized/styles.css';
import 'rc-slider/assets/index.css';

import './app.css';

const windows: { [hash: string]: React.ElementType } = {
  '#main': MainWindow as React.ElementType,
  '#mission': MissionWindow,
  '#manual': ManualWindow,
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
    if (window.location.hash !== '#main' && window.location.hash !== '#mission' && window.location.hash !== '#manual') {
      return (
        <div>
          <h1>404 Not Found</h1>
        </div>
      );
    }

    const Window = windows[window.location.hash];

    return <Window theme={theme} />;
  }
}
