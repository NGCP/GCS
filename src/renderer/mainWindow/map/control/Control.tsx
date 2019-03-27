/* eslint-disable max-len, jsx-a11y/anchor-has-content, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid, react/prefer-stateless-function */

import React, { Component, ReactNode } from 'react';
import LeafletControl from 'react-leaflet-control';

type ControlPosition = 'topleft' | 'topright' | 'bottomleft' | 'bottomright';

export interface ControlProps {
  className: string;
  onClick: () => void;
  position: ControlPosition;
  title: string;
}

export default class Control extends Component<ControlProps> {
  public render(): ReactNode {
    const {
      className, onClick, position, title,
    } = this.props;

    return (
      <LeafletControl className="leaflet-bar" position={position}>
        <a
          className={`leaflet-control-custom ${className}`}
          href={window.location.hash}
          title={title}
          role="button"
          aria-label={title}
          onClick={onClick}
        />
      </LeafletControl>
    );
  }
}
