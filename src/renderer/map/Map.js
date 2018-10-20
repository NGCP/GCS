import { ipcRenderer } from 'electron';
import fs from 'fs';
import L from 'leaflet';
import path from 'path';
import React, { createRef, Component } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

import './map.css';

const vehicleIcons = {};
const mapOptions = {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  id: 'mapbox.satellite',
  accessToken: process.env.MAPBOX_TOKEN,
  useCache: true,
  crossOrigin: true,
};

// fill vehicleIcons with all images from directory below
for (const file of fs.readdirSync(path.resolve(__dirname, '../../../resources/images/markers/vehicles'))) {
  const name = file.split('.').slice(0, -1).join('.');
  vehicleIcons[name] = require(`../../../resources/images/markers/vehicles/${file}`);
}

/**
 * Allows our map to cache online using PouchDB. Run this before loading the map.
 * Credit to https://github.com/MazeMap/Leaflet.TileLayer.PouchDBCached
 */
function injectCacheIntoWebpage() {
  const pouchDBScript = document.createElement('script');
  const pouchDBCacheScript = document.createElement('script');

  pouchDBScript.src = '../../../resources/ext/pouchdb.js';
  pouchDBCacheScript.src = '../../../resources/ext/pouchdb-cached.js';

  document.body.appendChild(pouchDBScript);
  document.body.appendChild(pouchDBCacheScript);
}

function getStartLocation() {
  const { startLocation, locations } = require('../../../resources/locations.json');
  if (!startLocation || !locations[startLocation]) {
    return { latitude: 0, longitude: 0, zoom: 18 };
  }
  return locations[startLocation];
}

export default class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      markers: {},
      ...getStartLocation(),
    };
    this.ref = createRef();

    this.updateMapLocation = this.updateMapLocation.bind(this);
    this.setMapToUserLocation = this.setMapToUserLocation.bind(this);
    this.updateMarkers = this.updateMarkers.bind(this);

    ipcRenderer.on('updateMapLocation', (event, data) => this.updateMapLocation(data));
    ipcRenderer.on('updateMarkers', (event, data) => this.updateMarkers(data));
    ipcRenderer.on('setMapToUserLocation', this.setMapToUserLocation);

    injectCacheIntoWebpage();
  }

  updateMapLocation(data) {
    this.setState(data);
  }

  setMapToUserLocation() {
    const map = this.ref.current;
    if (map) {
      map.leafletElement.locate();
    }
  }

  updateMarkers(markers) {
    const currentMarkers = this.state.markers;
    for (const marker of markers) {
      currentMarkers[marker.id] = marker;
    }
    this.setState({ markers: currentMarkers });
  }

  render() {
    const { latitude, longitude, zoom, markers } = this.state;
    const center = [latitude, longitude];

    return (
      <Map
        className='mapContainer container'
        center={center}
        zoom={zoom}
        ref={this.ref}
        onLocationfound={this.updateMapLocation}
      >
        <TileLayer {...mapOptions} />
        {
          Object.keys(markers).map(id => {
            const { position, latitude: lat, longitude: lng, type, name } = markers[id];

            return (
              <Marker
                key={id}
                position={position || [lat, lng]}
                icon={L.icon({
                  iconUrl: vehicleIcons[type],
                  iconSize: [50, 50],
                  iconAnchor: [25, 25],
                  popupAnchor: [0, -25],
                })}
              >
                <Popup>{name}</Popup>
              </Marker>
            );
          })
        }
      </Map>
    );
  }
}
