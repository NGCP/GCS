import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { job as jobUtil, mission } from '../../../../util/util';

const propTypes = {
  job: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    pausable: PropTypes.bool.isRequired,
  }).isRequired,
  lastJob: PropTypes.bool.isRequired,
};

const defaultState = {
  // True if the button should be shown, false if it should be hidden.
  startJobButton: true,
  stopMissionButton: true,
  pauseJobButton: false,
  resumeJobButton: false,
  nextJobButton: false,
  completeMissionButton: false,
};

export default class Job extends Component {
  constructor(props) {
    super(props);

    const { lastJob, job } = this.props;

    this.state = { ...defaultState };

    this.sendStartJob = this.sendStartJob.bind(this);
    this.sendStopMission = this.sendStopMission.bind(this);
    this.sendPauseJob = this.sendPauseJob.bind(this);
    this.sendResumeJob = this.sendResumeJob.bind(this);
    this.sendNextJob = this.sendNextJob.bind(this);
    this.sendCompleteMission = this.sendCompleteMission.bind(this);

    this.buttons = {
      startJobButton: <button type="button" onClick={this.sendStartJob}>Start</button>,
      stopMissionButton: <button type="button" onClick={this.sendStopMission}>Stop</button>,
      pauseJobButton: <button type="button" disabled={!job.pausable} onClick={this.sendPauseJob}>Pause</button>,
      resumeJobButton: <button type="button" onClick={this.sendResumeJob}>Resume</button>,
      nextJobButton: <button type="button" onClick={this.sendNextJob}>Next</button>,
      completeMissionButton: <button type="button" onClick={this.sendCompleteMission}>Complete Mission</button>,
      skipJobButton: <button type="button" onClick={lastJob ? this.sendCompleteMission : this.sendNextJob}>Skip</button>,
    };
  }

  componentDidMount() {
    ipcRenderer.on('showNextJobButton', () => {
      this.setState({ nextJobButton: true });
    });
    ipcRenderer.on('showCompleteMissionButton', () => {
      this.setState({ completeMissionButton: true });
    });
  }

  sendStartJob() {
    const { job } = this.props;

    this.setState({
      startJobButton: false,
      pauseJobButton: true,
    });

    jobUtil.sendStartJob({
      jobType: job.name,
      // TODO: Add missionInfo.
    });
  }

  sendStopMission() {
    // Reset state for future use of this job.
    this.setState({ ...defaultState });

    mission.sendStopMission();
  }

  sendPauseJob() {
    this.setState({
      pauseJobButton: false,
      resumeJobButton: true,
    });

    jobUtil.sendPauseJob();
  }

  sendResumeJob() {
    this.setState({
      resumeJobButton: false,
      pauseJobButton: true,
    });

    jobUtil.sendResumeJob();
  }

  sendNextJob() {
    // Reset state for future use of this job.
    this.setState({ ...defaultState });

    ipcRenderer.send('post', 'nextJob');
  }

  sendCompleteMission() {
    // Reset state for future use of this job.
    this.setState({ ...defaultState });

    mission.sendCompleteMission();
  }

  render() {
    const { job } = this.props;
    const {
      startJobButton,
      stopMissionButton,
      pauseJobButton,
      resumeJobButton,
      nextJobButton,
      completeMissionButton,
    } = this.state;

    return (
      <div className="job">
        <div className="infoContainer">
          <h2>{job.description}</h2>
        </div>
        <div className="buttonContainer">
          {startJobButton && this.buttons.startJobButton}
          {!nextJobButton && !completeMissionButton
            && pauseJobButton && this.buttons.pauseJobButton}
          {!nextJobButton && !completeMissionButton
            && resumeJobButton && this.buttons.resumeJobButton}
          {nextJobButton && this.buttons.nextJobButton}
          {completeMissionButton && this.buttons.completeMissionButton}
          {stopMissionButton && this.buttons.stopMissionButton}
          {!nextJobButton && !completeMissionButton && job.optional && this.buttons.skipJobButton}
        </div>
      </div>
    );
  }
}

Job.propTypes = propTypes;
