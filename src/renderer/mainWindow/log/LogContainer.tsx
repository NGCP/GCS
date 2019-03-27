import { Event, ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import moment, { Moment } from 'moment';
import React, { ChangeEvent, Component, ReactNode } from 'react';
import {
  AutoSizer, CellMeasurerCache, CellMeasurer, List, ListRowProps,
} from 'react-virtualized';

// TODO: Remove disable line comment when issue gets fixed (https://github.com/benmosher/eslint-plugin-import/pull/1304)
import { MessageType, ThemeProps } from '../../../util/types'; // eslint-disable-line import/named

import './log.css';

interface Message {
  type: MessageType;
  message: string;
  time: Moment;
}

type Filter = '' | 'success' | 'failure';

function isFilter(filter: string): boolean {
  return filter === '' || filter === 'success' || filter === 'failure';
}

interface State {
  filter: Filter;
  messages: Message[];
  filteredMessages: Message[];
}

export default class LogContainer extends Component<ThemeProps, State> {
  public constructor(props: ThemeProps) {
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
    this.updateFilter = this.updateFilter.bind(this);
    this.updateMessages = this.updateMessages.bind(this);
  }

  public componentDidMount(): void {
    ipcRenderer.on('updateMessages', (_: Event, data: Message[]) => this.updateMessages(data));
  }

  // Must declare instance variables after componentDidMount function. See react/sort-comp.
  private heightCache: CellMeasurerCache;

  private rowRenderer(props: ListRowProps): ReactNode {
    const { filteredMessages } = this.state;
    const {
      index, key, parent, style,
    } = props;
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
          <div className="time">{message.time.format('HH:mm:ss.SSS')}</div>
          <div className={`message ${message.type}`}>{message.message}</div>
        </div>
      </CellMeasurer>
    );
  }

  private clearMessages(): void {
    this.heightCache.clearAll();

    this.setState({
      filter: '',
      messages: [],
      filteredMessages: [],
    });
  }

  private updateFilter(event: ChangeEvent): void {
    const { messages } = this.state;

    this.heightCache.clearAll();
    const newFilter = event.target.nodeValue;

    if (!newFilter || !isFilter(newFilter)) return;

    this.setState({
      filter: newFilter as Filter,
      filteredMessages: newFilter === '' ? messages.slice(0) : messages.filter(message => message.type === newFilter),
    });
  }

  private updateMessages(messages: Message[]): void {
    const { filteredMessages, messages: thisMessages, filter } = this.state;
    const currentMessages = thisMessages;
    const currentFilteredMessages = filteredMessages;

    messages.forEach((message) => {
      const msg: Message = {
        ...message,
        time: moment(),
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

  public render(): ReactNode {
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
          <button type="button" onClick={this.clearMessages}>Clear Log</button>
        </div>
      </div>
    );
  }
}
