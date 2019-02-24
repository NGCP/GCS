import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import Control from 'react-leaflet-control';

/**
 * switch button to control the theme of UI
 * when clicked the theme changes
 *  Dark -> Light
 *  Light -> Dark
 */
export default class ThemeControl extends Component {
  static propTypes = {
    theme: PropTypes.string,
  };

  onClick = () => {
    ipcRenderer.send('post', 'toggleTheme');
  };

  render() {
    return (
      <Control className='leaflet-bar' position='topright'>
        <a
          className={`theme-control${this.props.theme === 'dark' ? '_dark' : ''}`}
          onClick={this.onClick}
        />
      </Control>
    );
  }
}
