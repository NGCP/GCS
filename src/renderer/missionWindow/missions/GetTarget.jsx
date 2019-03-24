import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component } from 'react';

import DeliverTarget from './jobs/DeliverTarget';
import RetrieveTarget from './jobs/RetrieveTarget';

import { mission } from '../../../util/util';

const layouts = {
  deliverTarget: DeliverTarget,
  retrieveTarget: RetrieveTarget,
};

/*
 * We can create a Mission class that this class extends that will have these functions.
 * The Mission class can take in a parameter that will define all the jobs for that mission.
 * All Mission classes have very similar logic so this is why I add this comment here.
 * Stuff that we probably can pass to the Mission class:
 * 1. Jobs and their respective layout
 * 2. Description of Mission to load to the h2 component in the info container (see below).
 * TODO: Add a Mission class that this class extends. The class can be in the same directory.
 */

const Default = () => (
  <div className="job">
    <div className="infoContainer">
      <h2>Get the target</h2>
    </div>
    <div className="buttonContainer">
      <button type="button" onClick={mission.sendStartMission}>Start Mission</button>
    </div>
  </div>
);

export default class GetTarget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentJobIndex: -1,
      jobs: [
        {
          name: 'retrieveTarget',
        },
        {
          name: 'deliverTarget',
        },
      ],
    };

    this.completeJob = this.completeJob.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('startMission', () => {
      this.setState({ currentJobIndex: 0 });
    });

    ipcRenderer.on('stopMission', () => {
      this.setState({ currentJobIndex: -1 });
    });

    ipcRenderer.on('completeJob', this.completeJob);
    ipcRenderer.on('nextJob', this.nextJob);
  }

  nextJob() {
    const { currentJobIndex } = this.state;
    this.setState({ currentJobIndex: currentJobIndex + 1 });
  }

  completeJob() {
    const { currentJobIndex, jobs } = this.state;

    if (currentJobIndex === jobs.length - 1) {
      /*
       * This will forward a notification to the job window that will create a button
       * that, when clicked, will send the "completeMission" notification. The
       * mission container will handle closing the mission window when the notification
       * is sent.
       */
      ipcRenderer.send('post', 'showCompleteMissionButton');
    } else {
      ipcRenderer.send('post', 'showNextJobButton');
    }
  }

  render() {
    const { currentJobIndex } = this.state;

    const Layout = currentJobIndex >= 0 ? layouts[currentJobIndex] : Default;

    return (
      <div className="mission">
        <Layout />
      </div>
    );
  }
}
