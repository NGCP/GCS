import { ipcRenderer } from 'electron';
import moment from 'moment';
import React, { Component } from 'react';

import './log.css';

export default class LogContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      messages: [],
    };

    this.clearMessages = this.clearMessages.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.updateMessages = this.updateMessages.bind(this);

    ipcRenderer.on('updateMessages', (event, data) => this.updateMessages(data));
  }

  clearMessages() {
    this.setState({ messages: [], filter: '' });
  }

  updateFilter(event) {
    this.setState({ filter: event.target.value });
  }

  updateMessages(messages) {
    const currentMessages = this.state.messages;
    for (const message of messages) {
      if (!message.type) message.type = '';
      if (!message.time) message.time = moment().format('HH:mm:ss.SSS');
      currentMessages.push(message);
    }
    this.setState({ messages: currentMessages });
  }

  render() {
    const { messages, filter } = this.state;
    const display = filter === '' ? messages : messages.filter(message => message.type === filter);

    return (
      <div className='logContainer container'>
        <div className='messages'>
          {
            display.map(message =>
              <pre key={messages.indexOf(message)} className={message.type}>{`${message.time}   ${message.message}`}</pre>
            )
          }
        </div>
        <div className='controls'>
          <select onChange={this.updateFilter} value={this.state.filter}>
            <option value=''>No Filter</option>
            <option className='success' value='success'>Success</option>
            <option className='failure' value='failure'>Failure</option>
          </select>
          <button onClick={this.clearMessages}>Clear Log</button>
        </div>
      </div>
    );
  }
}
