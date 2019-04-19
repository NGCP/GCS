import { Event, ipcRenderer } from 'electron';
import fs from 'fs';
import Leaflet from 'leaflet';
import React, {
  Component,
  createRef,
  Fragment,
  ReactNode,
  RefObject,
} from 'react';
import {
  Map,
  Rectangle,
  TileLayer,
  Viewport,
} from 'react-leaflet';

import { Location, locationConfig } from '../../../static/index';

import { BoundingBoxBounds, ThemeProps } from '../../../types/componentStyle';
import { FileLoadOptions, FileSaveOptions } from '../../../types/fileOption';
import { VehicleObject } from '../../../types/vehicle';

import { updateVehicles } from '../../../util/util';

import GeolocationControl from './control/GeolocationControl';
import ThemeControl from './control/ThemeControl';

// import CachedTileLayer from './CachedTileLayer';
import VehicleMarker from './marker/VehicleMarker';
import WaypointMarker from './marker/WaypointMarker';

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
interface State {
  /**
   * Latitude location of map.
   */
  lat: number;

  /**
   * Longitude location of map.
   */
  lng: number;

  /**
   * Zoom of map.
   */
  zoom?: number;

  /**
   * Viewport storing locations on location of map. This is more precise than
   * the (lat, lng, zoom) coordinates.
   */
  viewport: Viewport;

  /**
   * Object of vehicles displayed in the user interface.
   */
  vehicles: { [vehicleId: number]: VehicleObject };

  /**
   * Bounding boxes for the mission. Not all missions need bounding boxes.
   */
  boundingBoxes: {
    [name: string]: {
      /**
       * Boundaries of the bounding box.
       */
      bounds: BoundingBoxBounds;

      /**
       * Color of the bounding box.
       */
      color?: string;

      /**
       * Whether or not the box is modifiable (resizeable, etc).
       */
      locked: boolean;
    };
  };

  /**
   * Waypoints with radius. Basically points that are required for a mission.
   * Not all waypoints require a radius.
   */
  waypoints: {
    [name: string]: {
      /**
       * Location of the waypoint itself.
       */
      location: Location;

      /**
       * Whether or not the waypoint is modifiable (draggable, etc).
       */
      locked: boolean;
    };
  };
}

/**
 * Container that displays all vehicles and mission related info in a map.
 */
export default class MapContainer extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

    const { startLocation } = locationConfig;

    this.state = {
      lat: startLocation.lat,
      lng: startLocation.lng,
      zoom: startLocation.zoom,
      viewport: {
        center: [startLocation.lat, startLocation.lng],
        zoom: startLocation.zoom,
      },
      vehicles: {},
      boundingBoxes: {},
      waypoints: {},
    };

    this.ref = createRef();

    this.onViewportChanged = this.onViewportChanged.bind(this);
    this.onlocationfound = this.onlocationfound.bind(this);
    this.setMapToUserLocation = this.setMapToUserLocation.bind(this);
    this.loadConfig = this.loadConfig.bind(this);
    this.saveConfig = this.saveConfig.bind(this);
    this.centerMapToVehicle = this.centerMapToVehicle.bind(this);
    this.updateMapLocation = this.updateMapLocation.bind(this);
    this.updateWaypoints = this.updateWaypoints.bind(this);
    this.updateBoundingBoxes = this.updateBoundingBoxes.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('loadConfig', (_: Event, loadOptions: FileLoadOptions): void => this.loadConfig(loadOptions));
    ipcRenderer.on('saveConfig', (_: Event, saveOptions: FileSaveOptions): void => this.saveConfig(saveOptions));

    ipcRenderer.on('centerMapToVehicle', (_: Event, vehicle: VehicleObject): void => this.centerMapToVehicle(vehicle));
    ipcRenderer.on('setMapToUserLocation', this.setMapToUserLocation);
    ipcRenderer.on('updateMapLocation', (_: Event, location: Location): void => this.updateMapLocation(location));
    ipcRenderer.on('updateVehicles', (_: Event, ...vehicles: VehicleObject[]): void => updateVehicles(this, ...vehicles));
    ipcRenderer.on('updateWaypoints', (_: Event, ...waypoints: { name: string; location: Location }[]): void => this.updateWaypoints(...waypoints));
    ipcRenderer.on('updateBoundingBoxes', (_: Event, ...boundingBoxes: { name: string; bounds: BoundingBoxBounds}[]): void => this.updateBoundingBoxes(...boundingBoxes));
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
  private onlocationfound(location: Leaflet.LocationEvent): void {
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
    delete data.boundingBoxes;
    delete data.vehicles;
    delete data.waypoints;

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
   * Updates waypoints.
   */
  private updateWaypoints(...waypoints: { name: string; location: Location }[]): void {
    const { waypoints: thisWaypoints } = this.state;
    const currentWaypoints = thisWaypoints;

    waypoints.forEach((waypoint): void => {
      if (!currentWaypoints[waypoint.name]) {
        currentWaypoints[waypoint.name] = { location: waypoint.location, locked: false };
      } else {
        currentWaypoints[waypoint.name].location = waypoint.location;
      }
    });

    this.setState({ waypoints: currentWaypoints });
  }

  /**
   * Updates bounding boxes.
   */
  private updateBoundingBoxes(
    ...boundingBoxes: { name: string; bounds: BoundingBoxBounds }[]
  ): void {
    const { boundingBoxes: thisBoundingBoxes } = this.state;
    const currentBoundingBoxes = thisBoundingBoxes;

    boundingBoxes.forEach((boundingBox): void => {
      if (!currentBoundingBoxes[boundingBox.name]) {
        currentBoundingBoxes[boundingBox.name] = {
          bounds: boundingBox.bounds,
          locked: false,
        };
      } else {
        currentBoundingBoxes[boundingBox.name].bounds = boundingBox.bounds;
      }
    });

    this.setState({ boundingBoxes: currentBoundingBoxes });
  }

  /**
   * Callback to whenever the map location has been changed.
   */
  private updateMapLocation(location: Location): void {
    const { lat, lng, zoom } = location;

    const { viewport } = this.state;

    // Do not allow null for viewport zoom.
    const viewportZoom = viewport.zoom === null ? undefined : viewport.zoom;

    this.setState({
      lat,
      lng,
      zoom: zoom || viewportZoom,
    });

    this.onViewportChanged({
      center: [lat, lng],
      zoom: zoom || viewport.zoom,
    });
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const {
      boundingBoxes,
      vehicles,
      viewport,
      waypoints,
    } = this.state;

    const boundingBoxRectangles = Object.keys(boundingBoxes)
      .map((name): ReactNode => (
        <Rectangle
          key={name}
          color={boundingBoxes[name].color}
          bounds={[
            [boundingBoxes[name].bounds.bottom, boundingBoxes[name].bounds.left],
            [boundingBoxes[name].bounds.top, boundingBoxes[name].bounds.right],
          ]}
        />
      ));

    const vehicleMarkers = Object.keys(vehicles)
      .map((vehicleId): ReactNode => (
        <VehicleMarker
          key={vehicleId}
          vehicle={vehicles[parseInt(vehicleId, 10)]}
        />
      ));

    const waypointMarkers = Object.keys(waypoints)
      .map((name): ReactNode => (
        <WaypointMarker
          key={name}
          name={name}
          {...waypoints[name]}
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
        <Fragment>{boundingBoxRectangles}</Fragment>
        <Fragment>{vehicleMarkers}</Fragment>
        <Fragment>{waypointMarkers}</Fragment>
      </Map>
    );
  }
}
