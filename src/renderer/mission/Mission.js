import React, { Component } from 'react';
import { AutoSizer, Column, Table } from 'react-virtualized';

import './mission.css';

const WIDTH = {
  description: 0.6,
  status: 0.4,
};

export default class MissionContainer extends Component {
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

    this._rowGetter = this._rowGetter.bind(this);
    this._statusRenderer = this._statusRenderer.bind(this);
  }

  _rowGetter({ index }) {
    return this.state.missions[index];
  }

  _statusRenderer({ rowData }) {
    return <span className={rowData.status.type}>{rowData.status.message}</span>;
  }
  render() {
    return (
      <div className='missionContainer container'>
        <AutoSizer>
          {({ height, width }) =>
            <Table
              width={width}
              height={height}
              headerHeight={40}
              rowHeight={40}
              rowCount={this.state.missions.length}
              rowGetter={this._rowGetter}
              onRowClick={this._onRowClick}
            >
              <Column
                label='Description'
                dataKey='description'
                width={width * WIDTH.description}
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
