import React, { ReactNode } from 'react';

import { ThemeProps } from '../../util/types';

import LogContainer from './log/LogContainer';
import MapContainer from './map/MapContainer';
import MissionContainer from './mission/MissionContainer';
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
      <MissionContainer theme={theme} />
      <VehicleContainer theme={theme} />
    </div>
  );
}
