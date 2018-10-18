import { ipcRenderer } from 'electron';
import L from 'leaflet';
import React, { createRef, Component } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

import './map.css';

import temp_img from '../../../resources/images/markers/poi_fp.png';

/**
 * Allows our map to cache online using PouchDB. Run before our map is loaded
 * Credit to https://github.com/MazeMap/Leaflet.TileLayer.PouchDBCached
 * Note: no need to load leaflet (according to README tutorial) as react-leaflet includes leaflet already
 */
function injectCacheIntoWebpage() {
  const pouchDBScript = document.createElement('script');
  const pouchDBCacheScript = document.createElement('script');

  pouchDBScript.src = '../../../resources/ext/pouchdb.js';
  pouchDBCacheScript.src = '../../../resources/ext/pouchdb-cached.js';

  document.body.appendChild(pouchDBScript);
  document.body.appendChild(pouchDBCacheScript);
}

export default class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: 51.505,
      longitude: -0.09,
      zoom: 15,
      markers: {},
    };
    this.ref = createRef();

    this.updateMapLocation = this.updateMapLocation.bind(this);
    this.updateMapLocationToUser = this.updateMapLocationToUser.bind(this);
    this.updateMarkers = this.updateMarkers.bind(this);

    ipcRenderer.on('updateMapLocation', (event, data) => this.updateMapLocation(data));

    injectCacheIntoWebpage();
  }

  updateMapLocation(data) {
    this.setState(data);
  }

  updateMapLocationToUser() {
    const map = this.ref.current;
    if (map) {
      // the following statement will trigger onLocationfound or onLocationerror event
      map.leafletElement.locate();
    }
  }

  updateMarkers(marker) {

  }

  render() {
    const { latitude, longitude, zoom } = this.state;
    const center = [latitude, longitude];
    return (
      <Map
        className='mapContainer container'
        center={center}
        zoom={zoom}
        ref={this.ref}
        onClick={this.updateMapLocationToUser}
        onLocationfound={this.updateMapLocation}
        onLocationerror={console.error}
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          url='https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'
          id='mapbox.streets'
          accessToken={process.env.MAPBOX_TOKEN}
          useCache={true}
          crossOrigin={true}
        />
        <Marker position={center} icon={L.icon({
          iconUrl: temp_img,
          popupAnchor: [25, 0],
        })}
        >
          <Popup>You are here</Popup>
        </Marker>
      </Map>

    );
  }
}
