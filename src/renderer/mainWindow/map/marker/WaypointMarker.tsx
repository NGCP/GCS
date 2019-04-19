import Leaflet from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import { imageConfig, Location } from '../../../../static/index';

import ipc from '../../../../util/ipc';

export interface WaypointMarkerProps {
  name: string;
  location: Location;
  locked: boolean;
}

export default class WaypointMarker extends PureComponent<WaypointMarkerProps> {
  public constructor(props: WaypointMarkerProps) {
    super(props);

    this.postUpdateWaypoint = this.postUpdateWaypoint.bind(this);
  }

  private postUpdateWaypoint(event: Leaflet.LeafletEvent): void {
    const { name } = this.props;
    const location: Location = event.target.latlng;

    ipc.postUpdateWaypoint({ name, location });
  }

  public render(): ReactNode {
    const {
      locked,
      name,
      location,
    } = this.props;

    return (
      <Marker
        draggable={!locked}
        ondrag={this.postUpdateWaypoint}
        position={[location.lat, location.lng]}
        icon={Leaflet.icon({
          iconUrl: imageConfig.pin as string,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
          popupAnchor: [0, -25],
        })}
      >
        <Tooltip
          direction="top"
          offset={[0, -20]}
        >
          <p><b>{name}</b></p>
        </Tooltip>
      </Marker>
    );
  }
}
