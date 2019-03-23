import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import DeliverTarget from './missions/DeliverTarget';
import ISRSearch from './missions/ISRSearch';
import PayloadDrop from './missions/PayloadDrop';
import RetrieveTarget from './missions/RetrieveTarget';

import './mission.css';

const layouts = {
  deliverTarget: DeliverTarget,
  isrSearch: ISRSearch,
  payloadDrop: PayloadDrop,
  retrieveTarget: RetrieveTarget,
};

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

function BlankMission() {
  return <div />;
}

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

    const Layout = layouts[openedMission] || BlankMission;

    return (
      <div className={`missionWrapper${theme === 'dark' ? '_dark' : ''}`}>
        <Layout theme={theme} />
      </div>
    );
  }
}

MissionWindow.propTypes = propTypes;
