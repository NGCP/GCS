import { ipcRenderer } from 'electron';
import fs from 'fs';
import L from 'leaflet';
import React, { Component, createRef } from 'react';
import { Map, Marker, Popup } from 'react-leaflet';

import { cache, images, locations, startLocation } from '../../../resources/index.js';
import CachedTileLayer from './CachedTileLayer.js';
import GeolocationControl from './GeolocationControl.js';

import './map.css';

const mapOptions = {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  id: 'mapbox.satellite',
  accessToken: process.env.MAPBOX_TOKEN,
  useCache: cache,
  crossOrigin: true,
};

let start = { latitude: 0, longitude: 0, zoom: 18 };
if (startLocation && locations[startLocation]) {
  start = { ...start, ...locations[startLocation] };
}

export default class MapContainer extends Component {
  state = {
    vehicles: {},
    latitude: start.latitude,
    longitude: start.longitude,
    zoom: start.zoom,
    viewport: {
      center: [start.latitude, start.longitude],
      zoom: start.zoom,
    },
  };

  componentDidMount() {
    ipcRenderer.on('loadConfig', (event, data) => this.loadConfig(data));
    ipcRenderer.on('saveConfig', (event, file) => this.saveConfig(file));

    ipcRenderer.on('centerMapToVehicle', (event, data) => this.centerMapToVehicle(data));
    ipcRenderer.on('setMapToUserLocation', this.setMapToUserLocation);
    ipcRenderer.on('updateMapLocation', (event, data) => this.updateMapLocation(data));
    ipcRenderer.on('updateVehicles', (event, data) => this.updateVehicles(data));
  }

  vehicleRefs = {};

  ref = createRef();

  loadConfig = data => {
    this.updateMapLocation(data);
  };

  saveConfig = file => {
    // performs a hard copy of this.state, deletes vehicles from it, and saves it to file
    const data = { ...this.state };
    delete data.vehicles;

    fs.writeFileSync(file.filePath, JSON.stringify({ ...file.data, ...data }, null, 2));
  };

  centerMapToVehicle = vehicle => {
    this.updateMapLocation(vehicle);
    this.vehicleRefs[vehicle.id].current.leafletElement.togglePopup();
  };

  onViewportChanged = viewport => {
    this.setState({ viewport });
  };

  setMapToUserLocation = () => {
    const map = this.ref.current;
    if (map) {
      map.leafletElement.locate();
    }
  };

  updateMapLocation = ({ position, latitude, longitude, zoom }) => {
    this.setState({ position, latitude, longitude, zoom: zoom || this.state.viewport.zoom });

    this.onViewportChanged({
      center: position || [latitude, longitude],
      zoom: zoom || this.state.zoom,
    });
  };

  updateVehicles = vehicles => {
    const currentVehicles = this.state.vehicles;
    for (const vehicle of vehicles) {
      if (!this.vehicleRefs[vehicle.id]) {
        this.vehicleRefs[vehicle.id] = createRef();
      }
      currentVehicles[vehicle.id] = vehicle;
    }
    this.setState({ vehicles: currentVehicles });
  };

  render() {
    const { viewport, vehicles } = this.state;

    return (
      <Map
        className='mapContainer container'
        center={viewport.center}
        zoom={viewport.zoom}
        ref={this.ref}
        onLocationfound={this.updateMapLocation}
        onViewportChanged={this.onViewportChanged}
      >
        <GeolocationControl />
        <CachedTileLayer {...mapOptions} />
        {
          Object.keys(vehicles).map(id => {
            const { position, latitude: lat, longitude: lng, type, name, status } = vehicles[id];

            return (
              <Marker
                key={id}
                position={position || [lat, lng]}
                ref={this.vehicleRefs[id]}
                icon={L.icon({
                  iconUrl: images.markers.vehicles[`${type}${status.type === 'failure' ? '_red' : ''}`] || images.pin,
                  iconSize: [50, 50],
                  iconAnchor: [25, 25],
                  popupAnchor: [0, -25],
                })}
              >
                <Popup>
                  <p><b>{`#${id}: ${name} `}</b></p>
                  <p>{`Position: [${position || [lat, lng]}]`}</p>
                  <p>Status: <span className={status.type}>{status.message}</span></p>
                </Popup>
              </Marker>
            );
          })
        }
      </Map>
    );
  }
}
