import { ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Column,
  Index,
  RowMouseEventHandlerParams,
  Table,
  TableCellProps,
} from 'react-virtualized';

import { Mission, ThemeProps } from '../../../util/types';

interface WidthSignature {
  [column: string]: number;
}

const width: WidthSignature = {
  description: 0.6,
  status: 0.4,
};

/**
 * Props for the misson table.
 */
export interface MissionTableProps extends ThemeProps {
  /**
   * Array of missions that needs to be displayed.
   */
  missions: Mission[];
}

/**
 * Table to render all missions in the mission container.
 */
export default class MissionTable extends Component<MissionTableProps> {
  /**
   * Renderer for the status column.
   */
  private static statusRenderer(props: TableCellProps): ReactNode {
    const { dataKey, rowData } = props;
    const { type, message } = rowData.status;

    return <span key={dataKey} className={`statusColumn ${type}`}>{message}</span>;
  }

  /**
   * Callback when a row is clicked in the table.
   */
  private static onRowClick(info: RowMouseEventHandlerParams): void {
    const { index } = info;
    ipcRenderer.send('post', 'setSelectedMission', index);
  }

  public constructor(props: MissionTableProps) {
    super(props);

    this.width = width;

    this.heightCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 40,
    });

    this.rowGetter = this.rowGetter.bind(this);
    this.rowClassName = this.rowClassName.bind(this);
    this.descriptionRenderer = this.descriptionRenderer.bind(this);
  }

  /**
   * Width for columns in table.
   */
  private width: WidthSignature;

  /**
   * Cache that stores the height for rows. Allows the messages to have proper height.
   */
  private heightCache: CellMeasurerCache;

  /**
   * Callback to obtain data for a certain row in the table.
   */
  private rowGetter({ index }: Index): Mission {
    const { missions } = this.props;
    return missions[index];
  }

  /**
   * Callback to generate classname for a certain row in the table.
   */
  private rowClassName({ index }: Index): string {
    const { theme } = this.props;

    if (theme === 'dark' && index === -1) {
      return 'ReactVirtualized__Table__headerRow_dark';
    } if (theme === 'dark') {
      return 'ReactVirtualized__Table__row_dark';
    }
    return '';
  }

  /**
   * Callback to render data for the description column.
   */
  private descriptionRenderer(props: TableCellProps): ReactNode {
    const {
      cellData,
      dataKey,
      parent,
      rowIndex,
    } = props;

    return (
      <CellMeasurer
        cache={this.heightCache}
        columnIndex={0}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}
      >
        <div className="descriptionColumn">
          {cellData ? String(cellData) : ''}
        </div>
      </CellMeasurer>
    );
  }

  public render(): ReactNode {
    const { theme, missions } = this.props;

    return (
      <AutoSizer>
        {({ height, width: tableWidth }): ReactNode => (
          <Table
            width={tableWidth}
            height={height}
            headerHeight={40}
            rowHeight={this.heightCache.rowHeight}
            rowCount={missions.length}
            rowGetter={this.rowGetter}
            onRowClick={MissionTable.onRowClick}
            className={`ReactVirtualized__Table${theme === 'dark' ? '_dark' : ''}`}
            rowClassName={this.rowClassName}
          >
            <Column
              label="Description"
              dataKey="description"
              width={tableWidth * this.width.description}
              cellRenderer={this.descriptionRenderer}
            />
            <Column
              label="Status"
              dataKey="status"
              width={tableWidth * this.width.status}
              cellRenderer={MissionTable.statusRenderer}
            />
          </Table>
        )}
      </AutoSizer>
    );
  }
}
