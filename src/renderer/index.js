/* eslint-disable react/jsx-filename-extension */

import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import MainWindow from './mainWindow/MainWindow';
import MissionWindow from './missionWindow/MissionWindow';

import 'leaflet/dist/leaflet.css';
import 'react-virtualized/styles.css';

import './index.css';

import { fixtures, geolocation } from '../config/index';

const isDevelopment = process.env.NODE_ENV !== 'production';

const windows = {
  '#main': MainWindow,
  '#mission': MissionWindow,
};

function runGeolocationAndFixtures() {
  /*
   * Forces this function to only run once, when it is loaded through the main window.
   * Running this function more than once (through both main and mission windows) causes
   * fixtures to be sent twice a second, as well as the setMapToUserLocation command,
   * and we want to prevent this.
   */
  if (window.location.hash !== '#main') return;

  if (geolocation) {
    ipcRenderer.send('post', 'setMapToUserLocation');
  }

  if (isDevelopment && fixtures) {
    require('./fixtures/index'); // eslint-disable-line global-require
  }
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

ReactDOM.render(<Index />, document.getElementById('app'), runGeolocationAndFixtures);
