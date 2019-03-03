import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  AutoSizer, CellMeasurer, CellMeasurerCache, Column, Table,
} from 'react-virtualized';

import './mission.css';

const width = {
  description: 0.6,
  status: 0.4,
};

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default class MissionContainer extends Component {
  static statusRenderer({ dataKey, rowData }) {
    const { type, message } = rowData.status;

    return <span key={dataKey} className={type}>{message}</span>;
  }

  constructor(props) {
    super(props);

    this.state = {
      missions: [
        {
          description: 'Find targets',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
        {
          description: 'Verify target locations',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
        {
          description: 'Deliver payload to targets',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
        {
          description: 'Determine which target to retreive',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
        {
          description: 'Retreive target',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
        {
          description: 'Bring target to home base',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
      ],
    };

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
    const { missions } = this.state;

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
    const { theme } = this.props;
    const { missions } = this.state;

    return (
      <div className={`missionContainer container${theme === 'dark' ? '_dark' : ''}`}>
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
                cellRenderer={MissionContainer.statusRenderer}
                rowClassName={this.rowClassName}
              />
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }
}

MissionContainer.propTypes = propTypes;
