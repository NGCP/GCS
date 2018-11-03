import { ipcRenderer, remote } from 'electron';
import fs from 'fs';
import L from 'leaflet';
import path from 'path';
import React, { Component, createRef } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

import CachedTileLayer from './CachedTileLayer.js';
import GeolocationControl from './GeolocationControl.js';

import 'leaflet/dist/leaflet.css';
import './map.css';

const vehicleIcons = {};
const mapOptions = {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  id: 'mapbox.satellite',
  accessToken: remote.getGlobal('process').env.MAPBOX_TOKEN,
};

for (const file of fs.readdirSync(path.resolve(__dirname, '../../../resources/images/markers/vehicles'))) {
  const name = file.split('.').slice(0, -1).join('.');
  vehicleIcons[name] = require(`../../../resources/images/markers/vehicles/${file}`);
}

function getStartLocation() {
  const { startLocation, locations } = require('../../../resources/locations.json');
  if (!startLocation || !locations[startLocation]) {
    return { latitude: 0, longitude: 0 };
  }
  return locations[startLocation];
}

export default class MapContainer extends Component {
  constructor(props) {
    super(props);

    const { latitude, longitude, zoom } = getStartLocation();

    this.state = {
      vehicles: {},
      latitude: latitude,
      longitude: longitude,
      zoom: zoom || 18,
      viewport: {
        center: [latitude, longitude],
        zoom: zoom || 18,
      },
    };
    this.vehicleRefs = {};
    this.ref = createRef();

    this.loadConfig = this.loadConfig.bind(this);
    this.saveConfig = this.saveConfig.bind(this);

    this.centerMapToVehicle = this.centerMapToVehicle.bind(this);
    this.onViewportChanged = this.onViewportChanged.bind(this);
    this.setMapToUserLocation = this.setMapToUserLocation.bind(this);
    this.updateMapLocation = this.updateMapLocation.bind(this);
    this.updateVehicles = this.updateVehicles.bind(this);

    ipcRenderer.on('loadConfig', (event, data) => this.loadConfig(data));
    ipcRenderer.on('saveConfig', (event, file) => this.saveConfig(file));

    ipcRenderer.on('centerMapToVehicle', (event, data) => this.centerMapToVehicle(data));
    ipcRenderer.on('setMapToUserLocation', this.setMapToUserLocation);
    ipcRenderer.on('updateMapLocation', (event, data) => this.updateMapLocation(data));
    ipcRenderer.on('updateVehicles', (event, data) => this.updateVehicles(data));
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
    this.vehicleRefs[vehicle.id].current.leafletElement.togglePopup();
    this.updateMapLocation(vehicle);
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

  updateMapLocation({ position, latitude, longitude, zoom }) {
    this.setState({ position, latitude, longitude, zoom: zoom || this.state.viewport.zoom });

    this.onViewportChanged({
      center: position || [latitude, longitude],
      zoom: zoom || this.state.zoom,
    });
  }

  updateVehicles(vehicles) {
    const currentVehicles = this.state.vehicles;
    for (const vehicle of vehicles) {
      if (!this.vehicleRefs[vehicle.id]) {
        this.vehicleRefs[vehicle.id] = createRef();
      }
      currentVehicles[vehicle.id] = vehicle;
    }
    this.setState({ vehicles: currentVehicles });
  }

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
                  iconUrl: vehicleIcons[`${type}${status.type === 'failure' ? '_red' : ''}`],
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
