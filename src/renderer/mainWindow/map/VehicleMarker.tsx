import L from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import {
  imageConfig,
  RecursiveImageSignature,
  vehicleConfig,
  VehicleInfo,
  VehicleStatus,
} from '../../../static/index';

import { MessageType, VehicleObject } from '../../../types/types';

const vehicleIcons = (imageConfig.markers as RecursiveImageSignature)
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
    const { name, type } = vehicleConfig.vehicleInfos[vehicle.vehicleId] as VehicleInfo;

    const {
      type: vehicleStatusTypeString,
      message,
    } = vehicleConfig.vehicleStatuses[vehicle.status] as VehicleStatus;
    const vehicleStatusType = vehicleStatusTypeString as MessageType;
    const vehicleType = `${type}${vehicleStatusType === 'failure' ? '_red' : ''}`;

    return (
      <Marker
        position={[vehicle.lat, vehicle.lng]}
        icon={L.icon({
          iconUrl: vehicleIcons[(vehicleType || imageConfig.pin as string)] as string,
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
