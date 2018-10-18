import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet';

export default class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: 51.505,
      longitude: -0.09,
      zoom: 13,
    };

    ipcRenderer.on('updateMapLocation', (event, data) => this.updateMapLocation(data));

    this.updateMapLocation = this.updateMapLocation.bind(this);
  }

  updateMapLocation(data) {
    this.setState(data);
  }

  render() {
    const { latitude, longitude, zoom } = this.state;
    const center = [latitude, longitude];

    return (
      <Map className='mapContainer container' center={center} zoom={zoom}>
        <TileLayer
          attribution='&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
      </Map>

    );
  }
}
