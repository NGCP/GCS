import PropTypes from 'prop-types';
import React, { Component } from 'react';

import MissionTable from './MissionTable';

import './mission.css';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
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
          description: 'Deliver payload to targets',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
        {
          description: 'Retreive targets',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
        {
          description: 'Return to home base',
          status: {
            message: 'Not started',
            type: 'failure',
          },
        },
      ],
    };
  }

  render() {
    const { theme } = this.props;
    const { missions } = this.state;

    return (
      <div className={`missionContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <MissionTable theme={theme} missions={missions} />
      </div>
    );
  }
}

MissionContainer.propTypes = propTypes;
