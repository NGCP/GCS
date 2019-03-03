/* eslint-disable react/jsx-filename-extension */

import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies, electron must be a devDependency
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { fixtures, geolocation } from '../../resources/index';

import LogContainer from './log/LogContainer';
import MapContainer from './map/MapContainer';
import MissionContainer from './mission/MissionContainer';
import VehicleContainer from './vehicle/VehicleContainer';

import 'leaflet/dist/leaflet.css';
import 'react-virtualized/styles.css';

import './global.css';
import './index.css';

const isDevelopment = process.env.NODE_ENV !== 'production';

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

    return (
      <div className={`gridWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <MapContainer theme={theme} />
        <LogContainer theme={theme} />
        <MissionContainer theme={theme} />
        <VehicleContainer theme={theme} />
      </div>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById('app'), () => {
  if (geolocation) ipcRenderer.send('post', 'setMapToUserLocation');

  if (isDevelopment && fixtures) require('./fixtures/index.js'); // eslint-disable-line global-require
});
