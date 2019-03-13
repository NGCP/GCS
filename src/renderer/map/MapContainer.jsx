import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import fs from 'fs';
import PropTypes from 'prop-types';
import React, { Component, createRef, Fragment } from 'react';
import { Map } from 'react-leaflet';

import {
  cache, locations, startLocation,
} from '../../../resources/index';

import { updateVehicles } from '../../util/util';

import GeolocationControl from './control/GeolocationControl';
import ThemeControl from './control/ThemeControl';

import CachedTileLayer from './CachedTileLayer';
import VehicleMarker from './VehicleMarker';

import './map.css';

const mapOptions = {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  id: 'mapbox.satellite',
  accessToken: process.env.MAPBOX_TOKEN,
  useCache: cache,
  crossOrigin: true,
};

// default location is (0, 0) unless there is a locations file defined already
let start = { lat: 0, lng: 0, zoom: 18 };
if (startLocation && locations[startLocation]) {
  start = { ...start, ...locations[startLocation] };
}

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vehicles: {},
      ...start,
      viewport: {
        center: [start.lat, start.lng],
        zoom: start.zoom,
      },
    };

    this.ref = createRef();

    this.onViewportChanged = this.onViewportChanged.bind(this);
    this.setMapToUserLocation = this.setMapToUserLocation.bind(this);
    this.loadConfig = this.loadConfig.bind(this);
    this.saveConfig = this.saveConfig.bind(this);
    this.centerMapToVehicle = this.centerMapToVehicle.bind(this);
    this.updateMapLocation = this.updateMapLocation.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('loadConfig', (event, data) => this.loadConfig(data));
    ipcRenderer.on('saveConfig', (event, file) => this.saveConfig(file));

    ipcRenderer.on('centerMapToVehicle', (event, data) => this.centerMapToVehicle(data));
    ipcRenderer.on('setMapToUserLocation', this.setMapToUserLocation);
    ipcRenderer.on('updateMapLocation', (event, data) => this.updateMapLocation(data));
    ipcRenderer.on('updateVehicles', (event, data) => updateVehicles(this, data));
  }

  onViewportChanged(viewport) {
    this.setState({ viewport });
  }

  setMapToUserLocation() {
    const map = this.ref.current;
    if (map) {
      map.leafletElement.locate();
    }
  }

  loadConfig(data) {
    this.updateMapLocation(data);
  }

  saveConfig(file) {
    // performs a hard copy of this.state, deletes vehicles from it, and saves it to file
    const data = { ...this.state };
    delete data.vehicles;

    fs.writeFileSync(file.filePath, JSON.stringify({ ...file.data, ...data }, null, 2));
  }

  centerMapToVehicle(vehicle) {
    this.updateMapLocation(vehicle);
  }

  updateMapLocation(location) {
    const { zoom } = location;

    // we default to (lat, lng), however geolocation api calls provide (latitude, longitude)
    const lat = location.lat || location.latitude;
    const lng = location.lng || location.longitude;

    const { viewport } = this.state;

    this.setState({
      lat, lng, zoom: zoom || viewport.zoom,
    });

    this.onViewportChanged({
      center: [lat, lng],
      zoom: zoom || viewport.zoom,
    });
  }

  render() {
    const { theme } = this.props;
    const { viewport, vehicles } = this.state;

    const markers = Object.keys(vehicles).map(sid => (
      <VehicleMarker
        {...vehicles[sid]}
        key={sid}
      />
    ));

    return (
      <Map
        className="mapContainer container"
        center={viewport.center}
        zoom={viewport.zoom}
        ref={this.ref}
        onLocationfound={this.updateMapLocation}
        onViewportChanged={this.onViewportChanged}
      >
        <GeolocationControl />
        <ThemeControl theme={theme} />
        <CachedTileLayer {...mapOptions} />
        <Fragment>{markers}</Fragment>
      </Map>
    );
  }
}

MapContainer.propTypes = propTypes;
