import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';

const width = {
  id: 0.15,
  name: 0.4,
  status: 0.45,
};

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default class VehicleTable extends Component {
  static statusRenderer({ rowData }) {
    return <span className={rowData.status.type}>{rowData.status.message}</span>;
  }

  static centerMapToVehicle(vehicle) {
    ipcRenderer.send('post', 'centerMapToVehicle', vehicle);
  }

  constructor(props) {
    super(props);

    this.state = {
      vehicles: {},
    };

    this.width = width;

    this.onRowClick = this.onRowClick.bind(this);
    this.updateVehicles = this.updateVehicles.bind(this);
    this.rowGetter = this.rowGetter.bind(this);
    this.rowClassName = this.rowClassName.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('updateVehicles', (event, data) => this.updateVehicles(data));
  }


  onRowClick({ rowData }) {
    const { vehicles } = this.state;

    VehicleTable.centerMapToVehicle(vehicles[rowData.id]);
  }

  updateVehicles(vehicles) {
    const { vehicles: thisVehicles } = this.state;
    const currentVehicles = thisVehicles;

    vehicles.forEach((vehicle) => {
      currentVehicles[vehicle.id] = vehicle;
    });

    this.setState({ vehicles: currentVehicles });
  }

  rowGetter({ index }) {
    const { vehicles } = this.state;

    const v = Object.keys(vehicles).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return vehicles[v[index]];
  }

  rowClassName({ index }) {
    const { theme } = this.props;

    if (theme === 'dark' && index === -1) {
      return 'ReactVirtualized__Table__headerRow_dark';
    } if (theme === 'dark') {
      return 'ReactVirtualized__Table__row_dark';
    }
    return '';
  }

  render() {
    const { theme } = this.props;
    const { vehicles } = this.state;

    return (
      <AutoSizer>
        {({ height, width: tableWidth }) => (
          <Table
            style={{
              position: 'relative',
              top: 0,
              right: 0,
            }}
            width={tableWidth}
            height={height}
            headerHeight={40}
            rowHeight={40}
            rowCount={Object.keys(vehicles).length}
            rowGetter={this.rowGetter}
            onRowClick={this.onRowClick}
            className={theme === 'dark' ? 'ReactVirtualized__Table_dark' : ''}
            rowClassName={this.rowClassName}
          >
            <Column
              label="ID"
              dataKey="id"
              width={width * this.width.id}
              rowClassName={this.rowClassName}
            />
            <Column
              label="Name"
              dataKey="name"
              width={width * this.width.name}
              rowClassName={this.rowClassName}
            />
            <Column
              label="Status"
              dataKey="status"
              width={width * this.width.status}
              cellRenderer={VehicleTable.statusRenderer}
              rowClassName={this.rowClassName}
            />
          </Table>
        )}
      </AutoSizer>
    );
  }
}

VehicleTable.propTypes = propTypes;
