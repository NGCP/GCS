import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';

const width = {
  id: 0.2,
  name: 0.4,
  status: 0.4,
};

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
  vehicles: PropTypes.objectOf(
    PropTypes.shape({
      sid: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.shape({
        type: PropTypes.oneOf(['failure', 'progress', 'success']).isRequired,
        message: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
};

export default class VehicleTable extends Component {
  static statusRenderer({ rowData }) {
    return <span className={rowData.status.type}>{rowData.status.message}</span>;
  }

  constructor(props) {
    super(props);

    this.width = width;

    this.onRowClick = this.onRowClick.bind(this);
    this.rowGetter = this.rowGetter.bind(this);
    this.rowClassName = this.rowClassName.bind(this);
  }


  onRowClick({ rowData }) {
    const { vehicles } = this.props;

    ipcRenderer.send('post', 'centerMapToVehicle', vehicles[rowData.sid]);
  }

  rowGetter({ index }) {
    const { vehicles } = this.props;

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
    const { theme, vehicles } = this.props;

    return (
      <AutoSizer>
        {({ height, width: tableWidth }) => (
          <Table
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
              dataKey="sid"
              width={tableWidth * this.width.id}
              rowClassName={this.rowClassName}
            />
            <Column
              label="Name"
              dataKey="name"
              width={tableWidth * this.width.name}
              rowClassName={this.rowClassName}
            />
            <Column
              label="Status"
              dataKey="status"
              width={tableWidth * this.width.status}
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
