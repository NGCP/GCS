/*
 * Ignore for now
 * We will work on this when we finish writing
 * the GUI for Webpack

const { app, BrowserWindow } = require('electron');

function createWindow() {
  const w = new BrowserWindow();
  w.maximize();

  w.loadURL();
}

app.on('ready', createWindow);
*/

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Index extends Component {
  render() {
    return <div>Hello React!</div>;
  }
}

ReactDOM.render(<Index />, document.getElementById('root'));
