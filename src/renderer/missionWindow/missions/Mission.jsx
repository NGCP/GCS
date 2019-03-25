import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { mission as missionUtil } from '../../../util/util';

// TODO: Make this component more pretty.
const Default = ({ description }) => (
  <div className="job">
    <div className="infoContainer">
      <h2>{description}</h2>
    </div>
    <div className="buttonContainer">
      <button type="button" onClick={missionUtil.sendStartMission}>Start Mission</button>
    </div>
  </div>
);

Default.propTypes = {
  description: PropTypes.string.isRequired,
};

const propTypes = {
  mission: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      layout: PropTypes.func.isRequired,
    }).isRequired,
  ).isRequired,
};

export default class Mission extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentJobIndex: -1,
    };

    this.nextJob = this.nextJob.bind(this);
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
    const { currentJobIndex } = this.state;
    const { jobs } = this.props;

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
    const { currentJobIndex: index } = this.state;
    const { mission, jobs } = this.props;

    const Layout = index >= 0 ? jobs[index].layout : Default;

    return (
      <div className="mission">
        <Layout
          lastJob={index === jobs.length - 1}
          description={index >= 0 ? jobs[index].description : mission.description}
          optional={index >= 0 && jobs[index].optional}
        />
      </div>
    );
  }
}

Mission.propTypes = propTypes;
