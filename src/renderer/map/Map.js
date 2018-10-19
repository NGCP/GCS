import { ipcRenderer } from 'electron';
import L from 'leaflet';
import React, { createRef, Component } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

import './map.css';

import uav1 from '../../../resources/images/markers/uav1.png';
import uav2 from '../../../resources/images/markers/uav2.png';
import ugv1 from '../../../resources/images/markers/ugv1.png';
import ugv2 from '../../../resources/images/markers/ugv2.png';

const images = { uav1: uav1, uav2: uav2, ugv1: ugv1, ugv2: ugv2 };

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
    ipcRenderer.on('updateMarkers', (event, data) => this.updateMarkers(data));

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

  updateMarkers(markers) {
    const currentMarkers = this.state.markers;
    for (const marker of markers) {
      currentMarkers[marker.id] = marker;
    }
    this.setState({ markers: currentMarkers });
  }

  render() {
    this.updateMapLocationToUser();

    const { latitude, longitude, zoom, markers } = this.state;
    const center = [latitude, longitude];
    return (
      <Map
        className='mapContainer container'
        center={center}
        zoom={zoom}
        ref={this.ref}
        onLocationfound={this.updateMapLocation}
        onLocationerror={console.error}
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          url='https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'
          id='mapbox.satellite'
          accessToken={process.env.MAPBOX_TOKEN}
          useCache={true}
          crossOrigin={true}
        />
        {
          Object.keys(markers).map(id =>
            <Marker
              key={id}
              position={markers[id].position || [markers[id].latitude, markers[id].longitude]}
              icon={L.icon({
                iconUrl: images[markers[id].type],
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25],
              })}
            >
              <Popup>{markers[id].name}</Popup>
            </Marker>
          )
        }
      </Map>
    );
  }
}
