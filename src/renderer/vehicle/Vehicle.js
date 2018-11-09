import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';

import CustomTable from '../../util/CustomTable.js';

import './vehicle.css';

const WIDTH = {
  id: 0.15,
  name: 0.4,
  status: 0.45,
};

export default class VehicleContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vehicles: {},
    };

    this._onRowClick = this._onRowClick.bind(this);
    this._rowGetter = this._rowGetter.bind(this);
    this._statusRenderer = this._statusRenderer.bind(this);
    this.centerMapToVehicle = this.centerMapToVehicle.bind(this);
    this.updateVehicles = this.updateVehicles.bind(this);

    ipcRenderer.on('updateVehicles', (event, data) => this.updateVehicles(data));
  }

  _onRowClick({ rowData }) {
    this.centerMapToVehicle(this.state.vehicles[rowData.id]);
  }

  _rowGetter({ index }) {
    const { vehicles } = this.state;
    const v = Object.keys(this.state.vehicles).sort((a, b) => parseInt(a) - parseInt(b));
    return vehicles[v[index]];
  }

  _statusRenderer({ rowData }) {
    return <span className={rowData.status.type}>{rowData.status.message}</span>;
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
              rowGetter={this._rowGetter}
              onRowClick={this._onRowClick}
            >
              <Column
                label='ID'
                dataKey='id'
                width={width * WIDTH.id}
              />
              <Column
                label='Name'
                dataKey='name'
                width={width * WIDTH.name}
              />
              <Column
                label='Status'
                dataKey='status'
                width={width * WIDTH.status}
                cellRenderer={this._statusRenderer}
              />
            </Table>
          }
        </AutoSizer>
      </div>
    );
  }
}
