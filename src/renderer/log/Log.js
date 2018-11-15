import { ipcRenderer } from 'electron';
import moment from 'moment';
import React, { Component } from 'react';
import { AutoSizer, CellMeasurerCache, CellMeasurer, List } from 'react-virtualized';

import './log.css';

export default class LogContainer extends Component {
  state = {
    filter: '',
    messages: [],
    filteredMessages: [],
  };

  componentDidMount() {
    ipcRenderer.on('updateMessages', (event, data) => this.updateMessages(data));
  }

  heightCache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 20,
  });

  _rowRenderer = ({ index, key, parent, style }) => {
    const message = this.state.filteredMessages[index];

    return (
      <CellMeasurer
        cache={this.heightCache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        <div className='row' style={style}>
          <div className='time'>{message.time}</div>
          <div className={`message ${message.type}`}>{message.message}</div>
        </div>
      </CellMeasurer>
    );
  };

  clearMessages = () => {
    this.heightCache.clearAll();
    this.setState({ filter: '', messages: [], filteredMessages: [] });
  };

  updateFilter = event => {
    this.heightCache.clearAll();
    const newFilter = event.target.value;

    this.setState({
      filter: newFilter,
      filteredMessages: newFilter === '' ? this.state.messages.slice(0) : this.state.messages.filter(message => message.type === newFilter),
    });
  };

  updateMessages = messages => {
    const currentMessages = this.state.messages;
    const currentFilteredMessages = this.state.filteredMessages;

    for (const message of messages) {
      if (!message.type) {
        message.type = '';
      }
      if (!message.time) {
        message.time = moment().format('HH:mm:ss.SSS');
      }
      if (this.state.filter === '' || message.type === this.state.filter) {
        currentFilteredMessages.push(message);
      }
      currentMessages.push(message);
    }

    this.setState({
      messages: currentMessages,
      filteredMessages: currentFilteredMessages,
    });
  };

  render() {
    return (
      <div className='logContainer container'>
        <div className='messages'>
          <AutoSizer>
            {({ height, width }) =>
              <List
                deferredMeasurementCache={this.heightCache}
                height={height}
                width={width}
                overscanRowCount={0}
                rowCount={this.state.filteredMessages.length}
                rowHeight={this.heightCache.rowHeight}
                rowRenderer={this._rowRenderer}
                scrollToIndex={this.state.filteredMessages.length - 1}
              />
            }
          </AutoSizer>
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
