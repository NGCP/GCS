import React, { Component, ReactNode } from 'react';

import ipc from '../../../../util/ipc';

import Control from './Control';

/**
 * Control that centers map when clicked.
 */
export default class GeolocationControl extends Component {
  private static onClick(): void{
    ipc.postSetMapToUserLocation();
  }

  public render(): ReactNode {
    return (
      <Control
        className="fas fa-location-arrow"
        onClick={GeolocationControl.onClick}
        position="topright"
        title="Show location"
      />
    );
  }
}
