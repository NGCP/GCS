import Leaflet from 'leaflet';
import React, { PureComponent, ReactNode } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import {
  imageConfig,
  RecursiveImageSignature,
  vehicleConfig,
  VehicleInfo,
  VehicleStatusStyle,
} from '../../../../static/index';

import { MessageType } from '../../../../types/componentStyle';
import { VehicleObject } from '../../../../types/vehicle';

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
    } = vehicleConfig.vehicleStatuses[vehicle.status] as VehicleStatusStyle;
    const vehicleStatusType = vehicleStatusTypeString as MessageType;
    const vehicleType = `${type}${vehicleStatusType === 'failure' ? '_red' : ''}`;

    return (
      <Marker
        position={[vehicle.lat, vehicle.lng]}
        icon={Leaflet.icon({
          iconUrl: (vehicleIcons[vehicleType] || imageConfig.pin) as string,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
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
