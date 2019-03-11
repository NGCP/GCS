/* eslint-disable jsx-a11y/anchor-has-content,
                  jsx-a11y/click-events-have-key-events,
                  jsx-a11y/no-static-element-interactions,
                  jsx-a11y/anchor-is-valid,
*/

import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component } from 'react';
import Control from 'react-leaflet-control';


const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

/**
 * Control on the upper-right corner of the leaflet mapto control the theme of UI.
 */
export default class ThemeControl extends Component {
  static onClick() {
    ipcRenderer.send('post', 'toggleTheme');
  }

  render() {
    const { theme } = this.props;

    return (
      <Control className="leaflet-bar" position="topright">
        <a
          className={`theme-control${theme === 'dark' ? '_dark' : ''}`}
          onClick={ThemeControl.onClick}
        />
      </Control>
    );
  }
}

ThemeControl.propTypes = propTypes;
