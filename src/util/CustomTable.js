import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, Table } from 'react-virtualized';

export default class CustomTable extends Component {
  constructor(props) {
    super(props);

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: props.minHeight || 40,
      defaultHeight: props.defaultHeight || 40,
    });
  }

  _rowRenderer({
    className,
    columns,
    index,
    key,
    onRowClick,
    onRowDoubleClick,
    onRowMouseOut,
    onRowMouseOver,
    onRowRightClick,
    rowData,
    style,
  }) {
    const a11yProps = { 'aria-rowindex': index + 1 };

    if (
      onRowClick ||
      onRowDoubleClick ||
      onRowMouseOut ||
      onRowMouseOver ||
      onRowRightClick
    ) {
      a11yProps['aria-label'] = 'row';
      a11yProps.tabIndex = 0;

      if (onRowClick) {
        a11yProps.onClick = event => onRowClick({ event, index, rowData });
      }
      if (onRowDoubleClick) {
        a11yProps.onDoubleClick = event =>
          onRowDoubleClick({ event, index, rowData });
      }
      if (onRowMouseOut) {
        a11yProps.onMouseOut = event => onRowMouseOut({ event, index, rowData });
      }
      if (onRowMouseOver) {
        a11yProps.onMouseOver = event => onRowMouseOver({ event, index, rowData });
      }
      if (onRowRightClick) {
        a11yProps.onContextMenu = event =>
          onRowRightClick({ event, index, rowData });
      }
    }

    return (
      <CellMeasurer
        {...a11yProps}
        className={className}
        key={key}
        cache={this.cache}
        role='row'
        style={style}
        parent={parent}
        columnIndex={0}
        rowIndex={index + 1}
      >
        {columns}
      </CellMeasurer>
    );
  }

  render() {
    const { data, children } = this.props;
    return (
      <AutoSizer>
        {({ height, width }) =>
          <Table
            width={width}
            height={height}
            headerHeight={40}
            rowHeight={this.cache.rowHeight}
            rowRenderer={this._rowRenderer}
            rowCount={data.length}
          >
            {children}
          </Table>
        }
      </AutoSizer>
    );
  }
}

CustomTable.propTypes = {
  children: PropTypes.any,
  data: PropTypes.array.isRequired,
  defaultHeight: PropTypes.number,
  minHeight: PropTypes.number,
};
