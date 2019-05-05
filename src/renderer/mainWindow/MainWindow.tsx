import React, { ReactNode } from 'react';

import { ThemeProps } from '../../types/componentStyle';

import LogContainer from './log/LogContainer';
import MapContainer from './map/MapContainer';
import VehicleContainer from './vehicle/VehicleContainer';

import './main.css';

/**
 * Main window component.
 */
export default function MainWindow(props: ThemeProps): ReactNode {
  const { theme } = props;

  return (
    <div className={`mainWrapper${theme === 'dark' ? '_dark' : ''}`}>
      <MapContainer theme={theme} />
      <LogContainer theme={theme} />
      <VehicleContainer theme={theme} />
    </div>
  );
}
