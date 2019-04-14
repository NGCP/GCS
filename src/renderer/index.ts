/* eslint-disable global-require */

import React from 'react';
import ReactDOM from 'react-dom';

import statics from '../static/index';

import ipc from '../util/ipc';

import App from './App';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Function runs only once, when it is loaded through the main window.
 * Running this function more than once (through both main and mission windows) causes
 * the information below to be run twice, and we do not want that to happen.
 */
function runOnce(): void {
  if (window.location.hash !== '#main') return;

  // Set up Orchestrator.
  require('../common/Orchestrator');

  // Set up geolocation if geolocation is enabled in config.
  if (statics.config.geolocation) {
    ipc.postSetMapToUserLocation();
  }

  // Sets up fixtures if in development and fixtures are enabled in config.
  if (isDevelopment && statics.config.fixtures) {
    require('./fixtures/index');
  }
}

ReactDOM.render(React.createElement(App), document.getElementById('app'), runOnce);
