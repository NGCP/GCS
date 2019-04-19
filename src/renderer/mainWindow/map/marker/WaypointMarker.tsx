import L from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import { imageConfig, Location } from '../../../../static/index';

export interface WaypointMarkerProps {
  name: string;
  location: Location;
}

export default class WaypointMarker extends PureComponent<WaypointMarkerProps> {
  public render(): ReactNode {
    const { name, location } = this.props;

    return (
      <Marker
        draggable
        position={[location.lat, location.lng]}
        icon={L.icon({
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
