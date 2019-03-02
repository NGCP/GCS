import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, Column, Table } from 'react-virtualized';

import './mission.css';

export default class MissionContainer extends Component {
    static propTypes = {
      theme: PropTypes.oneOf(['light', 'dark']).isRequired,
    };

    state = {
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

    width = {
      description: 0.6,
      status: 0.4,
    };

    heightCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 40,
    });

    rowGetter = ({ index }) => this.state.missions[index];

    rowClassName = ({ index }) => {
      if (this.props.theme === 'dark' && index === -1) {
        return 'ReactVirtualized__Table__headerRow_dark';
      } else if (this.props.theme === 'dark') {
        return 'ReactVirtualized__Table__row_dark';
      } else {
        return '';
      }
    };
    descriptionRenderer = ({ dataKey, parent, rowIndex, cellData }) =>
      <CellMeasurer
        cache={this.heightCache}
        columnIndex={0}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}
      >
        <div className='descriptionColumn'>
          {cellData ? String(cellData) : ''}
        </div>
      </CellMeasurer>;

    statusRenderer = ({ dataKey, rowData }) => <span key={dataKey} className={rowData.status.type}>{rowData.status.message}</span>;

    render() {
      return (
        <div className={`missionContainer container${this.props.theme === 'dark' ? '_dark' : ''}`}>
          <AutoSizer>
            {({ height, width }) =>
              <Table
                width={width}
                height={height}
                headerHeight={40}
                rowHeight={this.heightCache.rowHeight}
                rowCount={this.state.missions.length}
                rowGetter={this.rowGetter}
                onRowClick={this.onRowClick}
                className={this.props.theme === 'dark' ? 'ReactVirtualized__Table_dark' : ''}
                rowClassName={this.rowClassName}
              >
                <Column
                  label='Description'
                  dataKey='description'
                  width={width * this.width.description}
                  cellRenderer={this.descriptionRenderer}
                  rowClassName={this.rowClassName}
                />
                <Column
                  label='Status'
                  dataKey='status'
                  width={width * this.width.status}
                  cellRenderer={this.statusRenderer}
                  rowClassName={this.rowClassName}
                />
              </Table>
            }
          </AutoSizer>
        </div>
      );
    }
}
