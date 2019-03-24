/*
 * The mission container will be in charge of managing which missions are not started, started,
 * and completed.
 * Any other code that wants to interact with missions must go through the mission container.
 * For example, if the mission window wants to know which missions are not done or not done,
 * the mission
 * container can provide this information.
 */

import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import MissionTable from './MissionTable';

import './mission.css';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

/*
 * Variable is -1 if no mission is running, otherwise it's the index of the mission in missions.
 * If a mission is paused, it will still be the index of that mission.
 */
let startedMissionIndex = -1;

const statusTypes = {
  notStarted: {
    name: 'notStarted',
    message: 'Not started',
    type: 'failure',
  },
  started: {
    name: 'started',
    message: 'Started',
    type: 'progress',
  },
  paused: {
    name: 'paused',
    message: 'Paused',
    type: 'progress',
  },
  finished: {
    name: 'completed',
    message: 'Completed',
    type: 'success',
  },
};

export default class MissionContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /*
       * Index of the mission that is currently opened in mission window.
       * Value of -1 means that no mission is currently opened.
       */
      openedMissionIndex: -1,

      /*
       * We have four missions in the mission state, with each mission having a certain
       * number of jobs required to accomplish that mission.
       *
       * The name field allows the mission window to determine which layout to load for which
       * mission. The description and status are for the mission container to render.
       *
       * 1) isrSearch: UAV will search for the target. The jobs are the following:
       *    step 1: Assign `takeoff`  to UAV.
       *    step 2: Assign `isrSearch` to UAV.
       *    step 3: Assign `quickSearch` to VTOL 1.
       *    step 4: Assign `detailedSearch` to VTOL 2.
       *    step 5: Assign `land` to UAV. (optional)
       *
       * 2) payloadDrop: UAV will drop a payload to the target. The jobs are the following:
       *    step 1: Assign `takeoff` to UAV. (not needed if UAV did not land from isrSearch)
       *    step 2: Assign `payloadDrop` to UAV.
       *    step 3: Assign `land` to UAV.
       *
       * 3) retrieveTarget: UGV/UUV will go and retrieve the target. The jobs are the following:
       *    step 1: Assign `retrieveTarget` to UGV/UUV.
       *
       * 4) deliverTarget: UGV/UUV will go and deliver the target. The jobs are the following:
       *    step 1: Assign `deliverTarget` to UGV/UUV.
       */
      missions: [
        {
          name: 'findTarget',
          description: "Find target's location",
          status: statusTypes.notStarted,
        },
        {
          name: 'deliverPayload',
          description: 'Deliver payload to target',
          status: statusTypes.notStarted,
        },
        {
          name: 'getTarget',
          description: 'Get the target',
          status: statusTypes.notStarted,
        },
      ],
    };

    this.setSelectedMission = this.setSelectedMission.bind(this);
    this.updateMission = this.updateMission.bind(this);
    this.completeMission = this.completeMission.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('setSelectedMission', (event, index) => this.setSelectedMission(index));

    ipcRenderer.on('startMission', () => this.updateMission('started'));
    ipcRenderer.on('stopMission', () => this.updateMission('notStarted'));
    ipcRenderer.on('pauseMission', () => this.updateMission('paused'));
    ipcRenderer.on('resumeMission', () => this.updateMission('started'));

    ipcRenderer.on('completeMission', this.completeMission);
  }

  /**
   * Selects mission to show on mission window by its index in the missions state.
   * Also allows the mission container to update its display on which mission is being shown on the
   * mission window.
   *
   * In other words, function will command the mission window to change which mission to display,
   * as well as update the mission container to show which mission is currently opened.
   *
   * @param {index} number index that points to mission to open, -1 means mission window was closed.
   */
  setSelectedMission(index) {
    const { missions, openedMissionIndex } = this.state;

    // Opens mission window for specified mission.
    if (index !== -1) {
      // Does not open any window for completed missions.
      if (missions[index].status.name === 'completed') return;

      ipcRenderer.send('post', 'showMissionWindow', missions[index]);
    }

    /*
     * Updates the mission container to reflect opened/closed mission window.
     * Exits function if the same mission was chosen.
     */
    if (openedMissionIndex === index) return;

    const newMissions = missions;

    /*
     * Set previously opened mission to its default closed state.
     * The mission container will not display opened to this mission.
     * (eg. "Not started (Open)" => "Not started")
     */
    if (openedMissionIndex !== -1) {
      const { status } = newMissions[openedMissionIndex];
      newMissions[openedMissionIndex].status = statusTypes[status.name];
    }

    /*
     * Set new opened mission to opened. If the mission window is being closed,
     * then this if statement will not execute.
     * The mission container will display opened to this mission.
     * (eg. "Not started" => "Not started (Open)")
     */
    if (index !== -1) {
      const { status } = newMissions[index];

      newMissions[index].status = {
        ...status,
        message: `${statusTypes[status.name].message} (Open)`,
      };
    }

    this.setState({
      openedMissionIndex: index,
      missions: newMissions,
    });
  }

  /**
   * Updates mission description in mission container whenever a start/stop/pause/resume
   * mission notification is sent.
   *
   * @param {string} name Consists of notStarted/started/paused. See the componentDidMount
   * function to see which name corresponds with which notification.
   */
  updateMission(name) {
    const { missions, openedMissionIndex } = this.state;
    const newMissions = missions;

    /*
     * All four actions can only be done through the mission window,
     * so we can assume that the mission is currently open, hence we can add (Open) to the
     * end of the mission description.
     */
    newMissions[openedMissionIndex].status = {
      ...statusTypes[name],
      message: `${statusTypes[name].message} (Open)`,
    };

    if (name === 'started') {
      startedMissionIndex = openedMissionIndex;
    } else if (name === 'notStarted') {
      startedMissionIndex = -1;

      // Closes the mission window.
      ipcRenderer.send('post', 'hideMissionWindow');
    }

    this.setState({ missions: newMissions });
  }

  completeMission() {
    const { missions } = this.state;
    const newMissions = missions;

    newMissions[startedMissionIndex].status = statusTypes.completed;
    startedMissionIndex = -1;

    // Closes the mission window.
    ipcRenderer.send('post', 'hideMissionWindow');

    this.setState({ missions: newMissions });
  }

  render() {
    const { theme } = this.props;
    const { missions } = this.state;

    return (
      <div className={`missionContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <MissionTable
          theme={theme}
          missions={missions}
        />
      </div>
    );
  }
}

MissionContainer.propTypes = propTypes;
