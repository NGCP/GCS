import { Event, ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component, ReactNode } from 'react';

import MissionTable from './MissionTable';

import { Mission, MissionStatus, ThemeProps } from '../../../util/types';

import './mission.css';

const statusTypes: { [key: string]: MissionStatus } = {
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
  completed: {
    name: 'completed',
    message: 'Completed',
    type: 'success',
  },
};

/**
 * State of the mission container.
 */
interface State {
  /**
   * Index of the mission that is currently opened in mission window.
   * Value of -1 means that no mission is currently opened.
   */
  openedMissionIndex: number;

  /**
   * Array of missions that needs to be performed.
   */
  missions: Mission[];
}

/**
 * Container that is in charge of managing which missions are not started, started,
 * and completed. Any other code that wants to interact with missions must
 * go through the mission container.
 *
 * For example, if the mission window wants to know which missions are not done or not done,
 * the mission container can provide this information.
 */
export default class MissionContainer extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
    super(props);

    this.state = {
      openedMissionIndex: -1,

      /*
       * Missions to perform:
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
  }

  public componentDidMount(): void {
    ipcRenderer.on('setSelectedMission', (_: Event, index: number) => this.setSelectedMission(index));

    ipcRenderer.on('startMission', () => this.updateMission('started'));
    ipcRenderer.on('stopMission', () => this.updateMission('notStarted'));
    ipcRenderer.on('completeMission', () => this.updateMission('completed'));

    ipcRenderer.on('pauseJob', () => this.updateMission('paused'));
    ipcRenderer.on('resumeJob', () => this.updateMission('started'));
  }

  /**
   * Selects mission to show on mission window by its index in the missions state.
   * Also allows the mission container to update its display on which mission is being shown on the
   * mission window.
   *
   * In other words, function will command the mission window to change which mission to display,
   * as well as update the mission container to show which mission is currently opened.
   *
   * @param index Index that points to mission to open, -1 means mission window was closed.
   */
  private setSelectedMission(index: number): void {
    const { missions, openedMissionIndex } = this.state;

    // Opens mission window for specified mission.
    if (index !== -1) {
      // Does not open any window for completed missions.
      if (missions[index].status.name === 'completed') return;

      /*
       * Passes index to mission window so that when mission is completed, the mission
       * window can forward that index back to the mission container to update.
       * This helps us have multiple missions running at once.
       */
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
   * @param statusName Consists of notStarted/started/paused. See the componentDidMount
   * function to see which name corresponds with which notification.
   */
  private updateMission(statusName: 'notStarted' |'started' | 'paused' | 'completed'): void {
    const { missions, openedMissionIndex } = this.state;
    const newMissions = missions;

    if (statusName === 'completed' && missions[openedMissionIndex].status.name !== 'started') {
      throw new Error('Mission must be started before completing it');
    }

    /*
     * All of the actions that change status are done while mission window is opened,
     * so we can assume that the mission is currently open, hence we can add (Open) to the
     * end of the mission description.
     */
    newMissions[openedMissionIndex].status = {
      ...statusTypes[statusName],
      message: `${statusTypes[statusName].message} (Open)`,
    };

    // Closes the mission window on stop mission.
    if (statusName === 'notStarted' || statusName === 'completed') {
      ipcRenderer.send('post', 'hideMissionWindow');
    }

    this.setState({ missions: newMissions });
  }

  public render(): ReactNode {
    const { theme } = this.props;
    const { missions } = this.state;

    return (
      <div className={`missionContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <MissionTable theme={theme} missions={missions} />
      </div>
    );
  }
}
