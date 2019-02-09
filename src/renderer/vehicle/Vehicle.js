import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';

import './vehicle.css';


export default class VehicleContainer extends Component {
  state = {
    vehicles: {},
  };

  componentDidMount() {
    ipcRenderer.on('updateVehicles', (event, data) => this.updateVehicles(data));
  }

  width = {
    id: 0.15,
    name: 0.4,
    status: 0.45,
  };

  onRowClick = ({ rowData }) => {
    this.centerMapToVehicle(this.state.vehicles[rowData.id]);
  };

  rowGetter = ({ index }) => {
    const { vehicles } = this.state;
    const v = Object.keys(this.state.vehicles).sort((a, b) => parseInt(a) - parseInt(b));
    return vehicles[v[index]];
  };

  statusRenderer = ({ rowData }) => <span className={rowData.status.type}>{rowData.status.message}</span>;

  centerMapToVehicle = vehicle => {
    ipcRenderer.send('post', 'centerMapToVehicle', vehicle);
  };

  updateVehicles = vehicles => {
    const currentVehicles = this.state.vehicles;
    for (const vehicle of vehicles) {
      currentVehicles[vehicle.id] = vehicle;
    }
    this.setState({ vehicles: currentVehicles });
  };

  render() {
    return (
      <div className='vehicleContainer container'>
        <AutoSizer>
          {({ height, width }) =>
            <Table
              width={width}
              height={height}
              headerHeight={40}
              rowHeight={40}
              rowCount={Object.keys(this.state.vehicles).length}
              rowGetter={this.rowGetter}
              onRowClick={this.onRowClick}
            >
              <Column
                label='ID'
                dataKey='id'
                width={width * this.width.id}
              />
              <Column
                label='Name'
                dataKey='name'
                width={width * this.width.name}
              />
              <Column
                label='Status'
                dataKey='status'
                width={width * this.width.status}
                cellRenderer={this.statusRenderer}
              />
            </Table>
          }
        </AutoSizer>
      </div>
    );
  }
}
