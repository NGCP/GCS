import L from 'leaflet';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import { images } from '../../../resources/index';

const propTypes = {
  sid: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  status: PropTypes.shape({
    type: PropTypes.oneOf(['failure', 'progress', 'success']).isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  vehicleRef: PropTypes.object.isRequired, // eslint-disable-line
};

export default class VehicleMarker extends Component {
  render() {
    const {
      sid, name, lat, lng, type, status, vehicleRef,
    } = this.props;

    return (
      <Marker
        position={[lat, lng]}
        ref={vehicleRef}
        icon={L.icon({
          iconUrl: images.markers.vehicles[`${type}${status.type === 'failure' ? '_red' : ''}`] || images.pin,
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

VehicleMarker.propTypes = propTypes;
