/* eslint-disable react/jsx-filename-extension */

import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { fixtures, geolocation } from '../../resources/index';

import MainWindow from './mainWindow/MainWindow';
import MissionWindow from './missionWindow/MissionWindow';

import 'leaflet/dist/leaflet.css';
import 'react-virtualized/styles.css';

import './global.css';
import './index.css';

const isDevelopment = process.env.NODE_ENV !== 'production';

function Router({ routes }) {
  const route = new URLSearchParams(window.location.search).get('route') || 'default';

  return routes[route] || routes.default;
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

    return (
      <Router
        routes={{
          default: <MainWindow theme={theme} />,
          mission: <MissionWindow theme={theme} />,
        }}
      />
    );
  }
}

ReactDOM.render(<Index />, document.getElementById('app'), () => {
  if (geolocation) ipcRenderer.send('post', 'setMapToUserLocation');

  if (isDevelopment && fixtures) {
    require('./fixtures/index.js'); // eslint-disable-line global-require
  }
});
