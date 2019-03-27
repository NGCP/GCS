import L from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import { images } from '../../../config/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { VehicleUI } from '../../../util/types'; // eslint-disable-line import/named

interface VehicleSignature {
  [key: string]: string;
}

const { vehicles }: { vehicles: VehicleSignature } = images.markers;

export default class VehicleMarker extends PureComponent<VehicleUI> {
  public render(): ReactNode {
    const {
      sid, name, lat, lng, type, status,
    } = this.props;

    return (
      <Marker
        position={[lat, lng]}
        icon={L.icon({
          iconUrl: vehicles[`${type}${status.type === 'failure' ? '_red' : ''}`] || images.pin,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
          popupAnchor: [0, -25],
        })}
      >
        <Tooltip
          direction="top"
          offset={[0, -20]}
        >
          <p><b>{`#${sid}: ${name}`}</b></p>
          <p>
            {'Status: '}
            <span className={status.type}>{status.message}</span>
          </p>
        </Tooltip>
      </Marker>
    );
  }
}
