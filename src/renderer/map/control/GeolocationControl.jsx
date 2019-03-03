/* eslint-disable jsx-a11y/anchor-has-content,
                  jsx-a11y/click-events-have-key-events,
                  jsx-a11y/no-static-element-interactions,
                  jsx-a11y/anchor-is-valid,
*/

import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import Control from 'react-leaflet-control';

/**
 * Control on the upper-left corner of the leaflet map to force geolocation whenever it is clicked.
 */
export default class GeolocationControl extends Component {
  static onClick() {
    ipcRenderer.send('post', 'setMapToUserLocation');
  }

  render() {
    return (
      <Control className="leaflet-bar" position="topleft">
        <a
          className="leaflet-control-geolocation"
          onClick={GeolocationControl.onClick}
        />
      </Control>
    );
  }
}
