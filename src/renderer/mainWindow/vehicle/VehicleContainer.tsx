import { Event, ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component, ReactNode } from 'react';

import VehicleTable from './VehicleTable';

import { updateVehicles } from '../../../util/util';
import { ThemeProps, Vehicle, VehicleUI } from '../../../util/types';

import './vehicle.css';

/**
 * State of the mission container.
 */
interface State {
  /**
   * Object of vehicles.
   */
  vehicles: { [sid: string]: VehicleUI };
}

/**
 * Container that shows statuses of all vehicles that are connected to the GCS.
 */
export default class VehicleContainer extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

    this.state = {
      vehicles: {},
    };
  }

  public componentDidMount(): void {
    ipcRenderer.on('updateVehicles', (_: Event, data: Vehicle[]) => updateVehicles(this, data));
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { vehicles } = this.state;

    /*
     * TODO: Map vehicles to an array by sid to increase performance by preventing VehicleTable
     * from remapping the table N times.
     * Will improve the time complexity from O(N^2logN) to O(NlogN)
     */

    return (
      <div className={`vehicleContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <VehicleTable theme={theme} vehicles={vehicles} />
      </div>
    );
  }
}
