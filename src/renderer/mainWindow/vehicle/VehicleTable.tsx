import React, { Component, ReactNode } from 'react';
import {
  AutoSizer,
  Column,
  Index,
  RowMouseEventHandlerParams,
  Table,
  TableCellProps,
} from 'react-virtualized';

import {
  vehicleConfig,
  VehicleInfo,
  VehicleStatusStyle,
} from '../../../static/index';

import { ThemeProps } from '../../../types/componentStyle';
import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';

interface WidthSignature {
  [column: string]: number;
}

/**
 * Width for columns in table.
 */
const width: WidthSignature = {
  vehicleId: 0.2,
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
  vehicles: VehicleObject[];
}

/**
 * Table to render all vehicles in the vehicle container.
 */
export default class VehicleTable extends Component<VehicleTableProps> {
  /**
   * Renderer for the status column.
   */
  private static nameRenderer(props: TableCellProps): string {
    const { rowData: vehicle }: { rowData: VehicleObject } = props;
    const { name } = vehicleConfig.vehicleInfos[vehicle.vehicleId] as VehicleInfo;
    return name;
  }

  /**
   * Renderer for the status column.
   */
  private static statusRenderer(props: TableCellProps): ReactNode {
    const { rowData }: { rowData: VehicleObject } = props;
    const vehicleStatus = vehicleConfig.vehicleStatuses[rowData.status] as VehicleStatusStyle;
    return <span className={vehicleStatus.type}>{vehicleStatus.message}</span>;
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
    const { vehicles } = this.props;
    ipc.postCenterMapToVehicle(vehicles[info.index]);
  }

  /**
   * Width for columns in table.
   */
  private width: WidthSignature;

  /**
   * Callback to obtain data for a certain row in the table.
   */
  private rowGetter({ index }: Index): VehicleObject {
    const { vehicles } = this.props;
    return vehicles[index];
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
        {({ height, width: tableWidth }): ReactNode => (
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
              dataKey="vehicleId"
              width={tableWidth * this.width.vehicleId}
            />
            <Column
              label="Name"
              dataKey="name"
              width={tableWidth * this.width.name}
              cellRenderer={VehicleTable.nameRenderer}
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
