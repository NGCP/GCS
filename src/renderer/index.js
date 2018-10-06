import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Index extends Component {
  render() {
    return <div>Hello React!</div>;
  }
}

ReactDOM.render(<Index />, document.getElementById('app'));
