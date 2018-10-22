import React, { Component } from 'react';

import TableRow from '../../util/TableRow.js';

import './mission.css';

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
  }

  render() {
    const { missions } = this.state;

    return (
      <div className='missionContainer container'>
        <table>
          <thead>
            <tr>
              <th className='row-mission'>Mission Description</th>
              <th className='row-status'>Status</th>
            </tr>
          </thead>
          <tbody>
            {
              missions.map(mission =>
                <TableRow key={missions.indexOf(mission)}>
                  <td>{mission.description}</td>
                  <td className={mission.status.type}>{mission.status.message}</td>
                </TableRow>
              )
            }
          </tbody>
        </table>
      </div>
    );
  }
}
