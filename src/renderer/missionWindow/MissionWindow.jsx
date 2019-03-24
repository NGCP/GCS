import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import DeliverPayload from './missions/DeliverPayload';
import FindTarget from './missions/FindTarget';
import GetTarget from './missions/GetTarget';

import './mission.css';

const layouts = {
  deliverPayload: DeliverPayload,
  findTarget: FindTarget,
  getTarget: GetTarget,
};

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

const div = () => <div />;

export default class MissionWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedMission: '',
    };
  }

  componentDidMount() {
    ipcRenderer.on('showMissionWindow', (event, mission) => {
      this.setState({ openedMission: mission.name });
    });
  }

  render() {
    const { theme } = this.props;
    const { openedMission } = this.state;

    const Layout = layouts[openedMission] || div;

    return (
      <div className={`missionWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <Layout theme={theme} />
      </div>
    );
  }
}

MissionWindow.propTypes = propTypes;
