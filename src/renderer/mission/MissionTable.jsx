import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  AutoSizer, CellMeasurer, CellMeasurerCache, Column, Table,
} from 'react-virtualized';

const width = {
  description: 0.6,
  status: 0.4,
};

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
  missions: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string.isRequired,
      status: PropTypes.shape({
        type: PropTypes.oneOf(['failure', 'progress', 'success']).isRequired,
        message: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
};

export default class MissionTable extends Component {
  static statusRenderer({ dataKey, rowData }) {
    const { type, message } = rowData.status;

    return <span key={dataKey} className={type}>{message}</span>;
  }

  constructor(props) {
    super(props);

    this.width = width;

    this.heightCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 40,
    });

    this.rowGetter = this.rowGetter.bind(this);
    this.rowClassName = this.rowClassName.bind(this);
    this.descriptionRenderer = this.descriptionRenderer.bind(this);
  }

  rowGetter({ index }) {
    const { missions } = this.props;

    return missions[index];
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

  descriptionRenderer({
    dataKey, parent, rowIndex, cellData,
  }) {
    return (
      <CellMeasurer
        cache={this.heightCache}
        columnIndex={0}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}
      >
        <div className="descriptionColumn">
          {cellData ? String(cellData) : ''}
        </div>
      </CellMeasurer>
    );
  }

  render() {
    const { theme, missions } = this.props;

    return (
      <AutoSizer>
        {({ height, width: tableWidth }) => (
          <Table
            width={tableWidth}
            height={height}
            headerHeight={40}
            rowHeight={this.heightCache.rowHeight}
            rowCount={missions.length}
            rowGetter={this.rowGetter}
            onRowClick={this.onRowClick}
            className={theme === 'dark' ? 'ReactVirtualized__Table_dark' : ''}
            rowClassName={this.rowClassName}
          >
            <Column
              label="Description"
              dataKey="description"
              width={tableWidth * this.width.description}
              cellRenderer={this.descriptionRenderer}
              rowClassName={this.rowClassName}
            />
            <Column
              label="Status"
              dataKey="status"
              width={tableWidth * this.width.status}
              cellRenderer={MissionTable.statusRenderer}
              rowClassName={this.rowClassName}
            />
          </Table>
        )}
      </AutoSizer>
    );
  }
}

MissionTable.propTypes = propTypes;
