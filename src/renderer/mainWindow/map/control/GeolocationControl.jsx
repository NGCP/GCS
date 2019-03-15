import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component } from 'react';

import Control from './Control';

export default class GeolocationControl extends Component {
  static onClick() {
    ipcRenderer.send('post', 'setMapToUserLocation');
  }

  render() {
    return (
      <Control
        className="geolocation-control"
        onClick={GeolocationControl.onClick}
        position="topleft"
        title="Show location"
      />
    );
  }
}
