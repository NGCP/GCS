import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

// TODO: Make this component more pretty.
const Default = ({ job }) => (
  <div className="job">
    <div className="infoContainer">
      <h2>{job.description}</h2>
    </div>
    <div className="buttonContainer">
      <button type="button">Start Mission</button>
    </div>
  </div>
);

Default.propTypes = {
  job: PropTypes.shape({
    description: PropTypes.string.isRequired,
  }).isRequired,
};

const propTypes = {
  mission: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      layout: PropTypes.func.isRequired,
      pausable: PropTypes.bool.isRequired,
      optional: PropTypes.bool.isRequired,
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

    console.log('completed', jobs[currentJobIndex].name);

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
    const { mission, jobs } = this.props;

    console.log('now going to', currentJobIndex >= 0 ? jobs[currentJobIndex].name : 'main page');

    const Layout = currentJobIndex >= 0 ? jobs[currentJobIndex].layout : Default;

    return (
      <div className="mission">
        <Layout
          lastJob={currentJobIndex === jobs.length - 1}
          job={currentJobIndex >= 0 ? jobs[currentJobIndex] : mission}
        />
      </div>
    );
  }
}

Mission.propTypes = propTypes;
