import Leaflet from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import { Location } from '../../../../static/index';

import ipc from '../../../../util/ipc';

export interface WaypointMarkerProps {
  name: string;
  location: Location;
  locked: boolean;
}

/* eslint-disable */

// See this issue for the following logic: https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-269750542.
delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;

Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/* eslint-disable */

export default class WaypointMarker extends PureComponent<WaypointMarkerProps> {
  public constructor(props: WaypointMarkerProps) {
    super(props);

    this.ondrag = this.ondrag.bind(this);
  }

  private ondrag(event: Leaflet.LeafletMouseEvent): void {
    const { name } = this.props;

    ipc.postUpdateWaypoints(false, { name, location: event.latlng });
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
        ondrag={this.ondrag}
        position={[location.lat, location.lng]}
      >
        <Tooltip
          direction="top"
          offset={[0, -10]}
        >
          <p><b>{name}</b></p>
        </Tooltip>
      </Marker>
    );
  }
}
