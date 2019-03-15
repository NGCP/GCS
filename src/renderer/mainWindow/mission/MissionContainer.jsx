import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import MissionTable from './MissionTable';

import './mission.css';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

let started = false;

const statusTypes = {
  notStarted: {
    message: 'Not started',
    type: 'failure',
  },
  open: {
    message: 'Currently open',
    type: 'progress',
  },
  started: {
    message: 'Started',
    type: 'progress',
  },
  finished: {
    message: 'Finished',
    type: 'success',
  },
};

export default class MissionContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedMissionIndex: -1,
      missions: [
        {
          description: 'Find targets',
          status: statusTypes.notStarted,
        },
        {
          description: 'Deliver payload to targets',
          status: statusTypes.notStarted,
        },
        {
          description: 'Retreive targets',
          status: statusTypes.notStarted,
        },
        {
          description: 'Return to home base',
          status: statusTypes.notStarted,
        },
      ],
    };

    this.setSelectedMission = this.setSelectedMission.bind(this);
    this.completeMission = this.completeMission.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('setSelectedMission', (event, index) => this.setSelectedMission(index));

    ipcRenderer.on('startMission', () => { started = true; });
    ipcRenderer.on('stopMission', () => { started = false; });
    ipcRenderer.on('completeMission', (event, index) => this.completeMission(index));
  }

  /**
   * Select mission based on index and open corresponding mission window
   * @param {index} number 0 <= index < this.state.missions.length, -1 means close mission window
   */
  setSelectedMission(index) {
    const { missions, openedMissionIndex } = this.state;

    // exit function for any finished missions
    if (index !== -1 && missions[index].status === statusTypes.finished) return;

    // opens mission window for specified mission
    if (index !== -1) {
      ipcRenderer.send('post', 'showMissionWindow', index);
    }

    // exit function if selected mission is selected again
    if (openedMissionIndex === index) return;

    // update mission status to new selected mission
    const newMissions = missions;

    if (openedMissionIndex !== -1) {
      newMissions[openedMissionIndex].status = statusTypes.notStarted;
    }
    if (index !== -1) {
      newMissions[index].status = statusTypes.open;
    } else if (started) {
      newMissions[openedMissionIndex].status = statusTypes.started;
    } else {
      newMissions[openedMissionIndex].status = statusTypes.notStarted;
    }

    this.setState({
      openedMissionIndex: index,
      missions: newMissions,
    });
  }

  completeMission(index) {
    const { missions } = this.state;
    const newMissions = missions;

    newMissions[index].status = statusTypes.finished;
    this.setState({ missions: newMissions });
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
