import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import VehicleTable from './VehicleTable';

import { updateVehicles } from '../../../util/util';
import { ThemeProps, VehicleUpdate, VehicleUI } from '../../../util/types';

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
    ipcRenderer.on('updateVehicles', (_: Event, ...vehicles: VehicleUpdate[]): void => updateVehicles(this, ...vehicles));
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { vehicles } = this.state;

    /*
     * Put the sids of the vehicles in order (least to greatest) and maps those sids to their
     * respective values in the vehicles object. Time complexity is O(nlogn).
     */
    const vehicleArray = Object.keys(vehicles)
      .sort((a, b): number => parseInt(a, 10) - parseInt(b, 10))
      .map((sid): VehicleUI => vehicles[sid]);

    return (
      <div className={`vehicleContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <VehicleTable theme={theme} vehicles={vehicleArray} />
      </div>
    );
  }
}
