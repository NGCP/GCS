/* eslint-disable react/jsx-filename-extension */

import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { config } from '../static/index';

import MainWindow from './mainWindow/MainWindow';
import MissionWindow from './missionWindow/MissionWindow';

import 'leaflet/dist/leaflet.css';
import 'react-virtualized/styles.css';

import './index.css';

const isDevelopment = process.env.NODE_ENV !== 'production';

const windows = {
  '#main': MainWindow,
  '#mission': MissionWindow,
};

/**
 * Function runs only once, when it is loaded through the main window.
 * Running this function more than once (through both main and mission windows) causes
 * the information below to be run twice, and we do not want that to happen.
 */
function runOnce() {
  /* eslint-disable global-require */

  if (window.location.hash !== '#main') return;

  // Set up Orchestrator.
  require('../common/Orchestrator');

  // Set up geolocation if geolocation is enabled in config.
  if (config.geolocation) {
    ipcRenderer.send('post', 'setMapToUserLocation');
  }

  // Sets up fixtures if in development and fixtures are enabled in config.
  if (isDevelopment && config.fixtures) {
    require('./fixtures/index');
  }

  /* eslint-enable global-require */
}

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      theme: 'light',
    };

    this.toggleTheme = this.toggleTheme.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('toggleTheme', this.toggleTheme);
  }

  toggleTheme() {
    const { theme } = this.state;

    this.setState({ theme: theme === 'light' ? 'dark' : 'light' });
  }

  render() {
    const { theme } = this.state;

    const Window = windows[window.location.hash];

    return <Window theme={theme} />;
  }
}

ReactDOM.render(<Index />, document.getElementById('app'), runOnce);
