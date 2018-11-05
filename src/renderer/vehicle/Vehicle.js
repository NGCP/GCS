import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import ScaleText from 'react-scale-text';

import TableRow from '../../util/TableRow.js';

import './vehicle.css';

export default class VehicleContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vehicles: {},
    };

    this.centerMapToVehicle = this.centerMapToVehicle.bind(this);
    this.updateVehicles = this.updateVehicles.bind(this);

    ipcRenderer.on('updateVehicles', (event, data) => this.updateVehicles(data));
  }

  centerMapToVehicle(vehicle) {
    ipcRenderer.send('post', 'centerMapToVehicle', vehicle);
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
        <ScaleText maxFontSize='15'>
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
                  <TableRow key={id} value={vehicles[id]} onClick={this.centerMapToVehicle}>
                    <td>{id}</td>
                    <td>{vehicles[id].name}</td>
                    <td className={vehicles[id].status.type}>{vehicles[id].status.message}</td>
                  </TableRow>
                )
              }
            </tbody>
          </table>
        </ScaleText>
      </div>
    );
  }
}
