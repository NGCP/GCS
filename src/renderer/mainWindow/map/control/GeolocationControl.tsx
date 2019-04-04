import { ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import Control from './Control';

/**
 * Control that centers map when clicked.
 */
export default class GeolocationControl extends Component {
  private static onClick(): void{
    ipcRenderer.send('post', 'setMapToUserLocation');
  }

  public render(): ReactNode {
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
