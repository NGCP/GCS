import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import Control from 'react-leaflet-control';

export default class GeolocationControl extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    ipcRenderer.send('post', 'setMapToUserLocation');
  }

  render() {
    return (
      <Control className='leaflet-bar' position='topleft'>
        <a
          className='leaflet-control-geolocation'
          onClick={this.onClick}
        />
      </Control>
    );
  }
}
