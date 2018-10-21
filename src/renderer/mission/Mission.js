import React, { Component } from 'react';

import './mission.css';

export default class MissionContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      missions: [
        {
          description: 'Find targets',
          status: 'Not started',
          type: 'failure',
        },
        {
          description: 'Verify target locations',
          status: 'Not started',
          type: 'failure',
        },
        {
          description: 'Deliver payload to targets',
          status: 'Not started',
          type: 'failure',
        },
        {
          description: 'Determine which target to retreive',
          status: 'Not started',
          type: 'failure',
        },
        {
          description: 'Retreive target',
          status: 'Not started',
          type: 'failure',
        },
        {
          description: 'Bring target to home base',
          status: 'Not started',
          type: 'failure',
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
                <tr key={missions.indexOf(mission)}>
                  <td>{mission.description}</td>
                  <td className={mission.type}>{mission.status}</td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    );
  }
}
