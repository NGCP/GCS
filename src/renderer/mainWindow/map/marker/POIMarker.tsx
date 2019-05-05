import Leaflet from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker } from 'react-leaflet';

import { imageConfig, Location, RecursiveImageSignature } from '../../../../static/index';

const poiIcons = (imageConfig.markers as RecursiveImageSignature).poi as RecursiveImageSignature;

export interface POIMarkerProps {
  location: Location;
  type: 'valid' | 'invalid' | 'unknown';
}

export default class POIMarker extends PureComponent<POIMarkerProps> {
  public render(): ReactNode {
    const {
      location,
      type,
    } = this.props;

    return (
      <Marker
        position={[location.lat, location.lng]}
        icon={Leaflet.icon({
          iconUrl: (poiIcons[type]) as string,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
        })}
      />
    );
  }
}
