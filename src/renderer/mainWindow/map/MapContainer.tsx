import { Event, ipcRenderer } from 'electron';
import fs from 'fs';
import { LocationEvent } from 'leaflet';
import React, {
  Component,
  createRef,
  Fragment,
  ReactNode,
  RefObject,
} from 'react';
import { Map, TileLayer, Viewport } from 'react-leaflet';

import { locationConfig } from '../../../static/index';

import {
  FileLoadOptions,
  FileSaveOptions,
  LatLngZoom,
  ThemeProps,
  VehicleObject,
} from '../../../types/types';
import { updateVehicles } from '../../../util/util';

import GeolocationControl from './control/GeolocationControl';
import ThemeControl from './control/ThemeControl';

// import CachedTileLayer from './CachedTileLayer';
import VehicleMarker from './VehicleMarker';

import './map.css';

const mapOptions = {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  id: 'mapbox.satellite',
  accessToken: process.env.MAPBOX_TOKEN,
};

/**
 * State of the map container.
 */
interface State extends LatLngZoom {
  /**
   * Object of vehicles displayed in the user interface.
   */
  vehicles: { [vehicleId: string]: VehicleObject };

  /**
   * Viewport storing locations on location of map. This is more precise than
   * the (lat, lng, zoom) coordinates.
   */
  viewport: Viewport;
}

/**
 * Container that displays all vehicles and mission related info in a map.
 */
export default class MapContainer extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

    const { startLocation } = locationConfig;

    this.state = {
      vehicles: {},
      ...startLocation,
      viewport: {
        center: [startLocation.lat, startLocation.lng],
        zoom: startLocation.zoom,
      },
    };

    this.ref = createRef();

    this.onViewportChanged = this.onViewportChanged.bind(this);
    this.onlocationfound = this.onlocationfound.bind(this);
    this.setMapToUserLocation = this.setMapToUserLocation.bind(this);
    this.loadConfig = this.loadConfig.bind(this);
    this.saveConfig = this.saveConfig.bind(this);
    this.centerMapToVehicle = this.centerMapToVehicle.bind(this);
    this.updateMapLocation = this.updateMapLocation.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('loadConfig', (_: Event, data: FileLoadOptions): void => this.loadConfig(data));
    ipcRenderer.on('saveConfig', (_: Event, data: FileSaveOptions): void => this.saveConfig(data));

    ipcRenderer.on('centerMapToVehicle', (_: Event, vehicle: VehicleObject): void => this.centerMapToVehicle(vehicle));
    ipcRenderer.on('setMapToUserLocation', this.setMapToUserLocation);
    ipcRenderer.on('updateMapLocation', (_: Event, location: LatLngZoom): void => this.updateMapLocation(location));
    ipcRenderer.on('updateVehicles', (_: Event, ...vehicles: VehicleObject[]): void => updateVehicles(this, ...vehicles));
  }

  /**
   * Callback to whenever map viewport is changed.
   */
  private onViewportChanged(viewport: Viewport): void {
    this.setState({ viewport });
  }

  /**
   * Callback to whenever geolocation call is successful.
   */
  private onlocationfound(location: LocationEvent): void {
    this.updateMapLocation(location.latlng);
  }

  /**
   * Centers map to user location using geolocation (if possible).
   */
  private setMapToUserLocation(): void {
    const map = this.ref.current;
    if (map) {
      map.leafletElement.locate();
    }
  }

  /**
   * Reference to map (to access its leaflet element).
   */
  private ref: RefObject<Map>;

  /**
   * Callback whenever a "loadConfig" notification is received.
   */
  private loadConfig({ map }: FileLoadOptions): void {
    this.updateMapLocation(map);
  }

  /**
   * Callback whenever a "saveConfig" notification is received.
   */
  private saveConfig(file: FileSaveOptions): void {
    // Performs a hard copy of this.state, deletes vehicles from it, and saves it to file.
    const data = { ...this.state };
    delete data.vehicles;

    fs.writeFileSync(file.filePath, JSON.stringify({
      ...file.data,
      map: data,
    }, null, 2));
  }

  /**
   * Centers map around a certain vehicle.
   */
  private centerMapToVehicle(vehicle: VehicleObject): void {
    this.updateMapLocation(vehicle);
  }

  /**
   * Callback to whenever the map location has been changed.
   */
  public updateMapLocation(location: LatLngZoom): void {
    const { lat, lng, zoom } = location;

    const { viewport } = this.state;

    this.setState({
      lat,
      lng,
      zoom: zoom || (viewport.zoom as number | undefined),
    });

    this.onViewportChanged({
      center: [lat, lng],
      zoom: zoom || viewport.zoom,
    });
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { viewport, vehicles } = this.state;

    const markers = Object
      .keys(vehicles)
      .map((vehicleId): ReactNode => (
        <VehicleMarker
          key={vehicleId}
          vehicle={vehicles[vehicleId]}
        />
      ));

    return (
      <Map
        className="mapContainer container"
        center={viewport.center as [number, number]}
        zoom={viewport.zoom as number | undefined}
        ref={this.ref}
        onlocationfound={this.onlocationfound}
        onViewportChanged={this.onViewportChanged}
      >
        <GeolocationControl />
        <ThemeControl theme={theme} />
        <TileLayer {...mapOptions} />
        <Fragment>{markers}</Fragment>
      </Map>
    );
  }
}
