import L from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import { VehicleObject } from '../../../common/struct/Vehicle';

import {
  images,
  RecursiveImageSignature,
  VehicleInfo,
  vehicleInfos,
  VehicleStatus,
  vehicleStatuses,
} from '../../../static/index';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { MessageType } from '../../../util/types'; // eslint-disable-line import/named

const vehicleIcons = (images.markers as RecursiveImageSignature)
  .vehicles as RecursiveImageSignature;

export interface VehicleMarkerProps {
  vehicle: VehicleObject;
}

/**
 * Marker that will represent a vehicle. Used by the map container.
 */
export default class VehicleMarker extends PureComponent<VehicleMarkerProps> {
  public render(): ReactNode {
    const { vehicle } = this.props;
    const { name, type } = vehicleInfos[vehicle.vehicleId] as VehicleInfo;

    const {
      type: vehicleStatusTypeString,
      message,
    } = vehicleStatuses[vehicle.status] as VehicleStatus;
    const vehicleStatusType = vehicleStatusTypeString as MessageType;
    const vehicleType = `${type}${vehicleStatusType === 'failure' ? '_red' : ''}`;

    return (
      <Marker
        position={[vehicle.lat, vehicle.lng]}
        icon={L.icon({
          iconUrl: vehicleIcons[(vehicleType || images.pin as string)] as string,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
          popupAnchor: [0, -25],
        })}
      >
        <Tooltip
          direction="top"
          offset={[0, -20]}
        >
          <p><b>{`#${vehicle.vehicleId}: ${name}`}</b></p>
          <p>
            {'Status: '}
            <span className={vehicleStatusType}>{message}</span>
          </p>
        </Tooltip>
      </Marker>
    );
  }
}
