import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import React, { Component } from 'react';
import {
  AutoSizer, CellMeasurerCache, CellMeasurer, List,
} from 'react-virtualized';

import './log.css';

const propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default class LogContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      messages: [],
      filteredMessages: [],
    };

    this.heightCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 20,
    });

    this.rowRenderer = this.rowRenderer.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
    this.updateMessages = this.updateMessages.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('updateMessages', (event, data) => this.updateMessages(data));
  }

  rowRenderer({
    index, key, parent, style,
  }) {
    const { filteredMessages } = this.state;
    const message = filteredMessages[index];

    return (
      <CellMeasurer
        cache={this.heightCache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        <div className="row" style={style}>
          <div className="time">{message.time}</div>
          <div className={`message ${message.type}`}>{message.message}</div>
        </div>
      </CellMeasurer>
    );
  }

  clearMessages() {
    this.heightCache.clearAll();
    this.setState({ filter: '', messages: [], filteredMessages: [] });
  }

  updateFilter(event) {
    const { messages } = this.state;

    this.heightCache.clearAll();
    const newFilter = event.target.value;

    this.setState({
      filter: newFilter,
      filteredMessages: newFilter === '' ? messages.slice(0) : messages.filter(message => message.type === newFilter),
    });
  }

  updateMessages(messages) {
    const { filteredMessages, messages: thisMessages, filter } = this.state;
    const currentMessages = thisMessages;
    const currentFilteredMessages = filteredMessages;

    messages.forEach((message) => {
      const msg = {
        type: '',
        tile: moment().format('HH:mm:ss.SSS'),
        ...message,
      };

      if (filter === '' || msg.type === filter) {
        currentFilteredMessages.push(msg);
      }
      currentMessages.push(msg);
    });

    this.setState({
      messages: currentMessages,
      filteredMessages: currentFilteredMessages,
    });
  }

  render() {
    const { theme } = this.props;
    const { filter, filteredMessages } = this.state;

    return (
      <div className={`logContainer container${theme === 'dark' ? '_dark' : ''}`}>
        <div className={`messages${theme === 'dark' ? '_dark' : ''}`}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                deferredMeasurementCache={this.heightCache}
                height={height}
                width={width}
                overscanRowCount={0}
                rowCount={filteredMessages.length}
                rowHeight={this.heightCache.rowHeight}
                rowRenderer={this.rowRenderer}
                scrollToIndex={filteredMessages.length - 1}
              />
            )}
          </AutoSizer>
        </div>
        <div className="control">
          <select onChange={this.updateFilter} value={filter}>
            <option value="">No Filter</option>
            <option className="success" value="success">Success</option>
            <option className="failure" value="failure">Failure</option>
          </select>
          <button onClick={this.clearMessages}>Clear Log</button>
        </div>
      </div>
    );
  }
}

LogContainer.propTypes = propTypes;
