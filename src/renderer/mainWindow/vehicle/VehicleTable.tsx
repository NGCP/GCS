import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import React, { Component, ReactNode } from 'react';
import {
  AutoSizer,
  Column,
  Index,
  RowMouseEventHandlerParams,
  Table,
  TableCellProps,
} from 'react-virtualized';

import { ThemeProps, VehicleUI } from '../../../util/types';

interface WidthSignature {
  [column: string]: number;
}

/**
 * Width for columns in table.
 */
const width: WidthSignature = {
  id: 0.2,
  name: 0.4,
  status: 0.4,
};

/**
 * Props for the vehicle table.
 */
export interface VehicleTableProps extends ThemeProps {
  /**
   * Object of vehicles.
   */
  vehicles: { [sid: string]: VehicleUI };
}

/**
 * Table to render all vehicles in the vehicle container.
 */
export default class VehicleTable extends Component<VehicleTableProps> {
  /**
   * Renderer for the status column.
   */
  private static statusRenderer(props: TableCellProps): ReactNode {
    const { rowData } = props;
    return <span className={rowData.status.type}>{rowData.status.message}</span>;
  }

  public constructor(props: VehicleTableProps) {
    super(props);

    this.width = width;

    this.onRowClick = this.onRowClick.bind(this);
    this.rowGetter = this.rowGetter.bind(this);
    this.rowClassName = this.rowClassName.bind(this);
  }

  /**
   * Callback when a row is clicked in the table.
   */
  private onRowClick(info: RowMouseEventHandlerParams): void {
    const { rowData } = info;
    const { vehicles } = this.props;

    ipcRenderer.send('post', 'centerMapToVehicle', vehicles[rowData.sid]);
  }

  /**
   * Width for columns in table.
   */
  private width: WidthSignature;

  /**
   * Callback to obtain data for a certain row in the table.
   */
  private rowGetter({ index }: Index): VehicleUI {
    const { vehicles } = this.props;

    const v = Object.keys(vehicles).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return vehicles[v[index]];
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

  public render(): ReactNode {
    const { theme, vehicles } = this.props;

    return (
      <AutoSizer>
        {({ height, width: tableWidth }) => (
          <Table
            width={tableWidth}
            height={height}
            headerHeight={40}
            rowHeight={40}
            rowCount={Object.keys(vehicles).length}
            rowGetter={this.rowGetter}
            onRowClick={this.onRowClick}
            className={theme === 'dark' ? 'ReactVirtualized__Table_dark' : ''}
            rowClassName={this.rowClassName}
          >
            <Column
              label="ID"
              dataKey="sid"
              width={tableWidth * this.width.id}
            />
            <Column
              label="Name"
              dataKey="name"
              width={tableWidth * this.width.name}
            />
            <Column
              label="Status"
              dataKey="status"
              width={tableWidth * this.width.status}
              cellRenderer={VehicleTable.statusRenderer}
            />
          </Table>
        )}
      </AutoSizer>
    );
  }
}
