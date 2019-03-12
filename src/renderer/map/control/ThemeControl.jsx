import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component } from 'react';

import Control from './Control';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default class ThemeControl extends Component {
  static onClick() {
    ipcRenderer.send('post', 'toggleTheme');
  }

  render() {
    const { theme } = this.props;

    return (
      <Control
        className={`theme-control${theme === 'dark' ? '_dark' : ''}`}
        onClick={ThemeControl.onClick}
        position="topright"
        title="Toggle theme"
      />
    );
  }
}

ThemeControl.propTypes = propTypes;
