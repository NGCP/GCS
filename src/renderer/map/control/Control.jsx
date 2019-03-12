/* eslint-disable jsx-a11y/anchor-has-content,
                  jsx-a11y/click-events-have-key-events,
                  jsx-a11y/no-static-element-interactions,
                  jsx-a11y/anchor-is-valid,
                  react/prefer-stateless-function,
*/

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import LeafletControl from 'react-leaflet-control';

const propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  position: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default class Control extends Component {
  render() {
    const {
      className, onClick, position, title,
    } = this.props;

    return (
      <LeafletControl className="leaflet-bar" position={position}>
        <a
          className={`leaflet-control-custom ${className}`}
          href="#"
          title={title}
          role="button"
          aria-label={title}
          onClick={onClick}
        />
      </LeafletControl>
    );
  }
}

Control.propTypes = propTypes;
