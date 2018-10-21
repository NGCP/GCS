import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import './vehicle.css';

export default class VehicleContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vehicles: {},
    };

    this.updateVehicles = this.updateVehicles.bind(this);

    ipcRenderer.on('updateVehicles', (event, data) => this.updateVehicles(data));
  }

  updateVehicles(vehicles) {
    const currentVehicles = this.state.vehicles;
    for (const vehicle of vehicles) {
      currentVehicles[vehicle.id] = vehicle;
    }
    this.setState({ vehicles: currentVehicles });
  }

  render() {
    const { vehicles } = this.state;

    return (
      <div className='vehicleContainer container'>
        <div className='vehicleData'>
          <table>
            <thead>
              <tr>
                <th className='row-id'>ID</th>
                <th className='row-name'>Vehicle Name</th>
                <th className='row-status'>Status</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(vehicles).sort().map(id =>
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{vehicles[id].name}</td>
                    <td className={vehicles[id].status.type}>{vehicles[id].status.message}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
