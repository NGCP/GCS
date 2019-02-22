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
  onClick = () => {
    ipcRenderer.send('post', 'switchTheme');
  };

  render() {
    return (
      <Control className='leaflet-bar' position='topright'>
        <a
          className='theme-control'
          onClick={this.onClick}
        />
      </Control>
    );
  }
}
