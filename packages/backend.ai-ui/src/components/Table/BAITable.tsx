/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The antd-v6-shaped adapter over ui-common `DataGrid` (FR-4096, ADR 0009).
 DataGrid owns the table: plugins, paging, sorting, selection, pinning,
 expansion, and the column settings and CSV export dialogs. This file keeps
 the frozen vocabulary the call sites use (`.claude/rules/component-props-extension.md`)
 and translates it:

 | BAITable (antd-shaped)                    | DataGrid                                   |
 |-------------------------------------------|--------------------------------------------|
 | `dataSource` / `rowKey`                   | `data` / `idKey`                           |
 | `columns` (`title`, `dataIndex`, `render`, `sorter`, `fixed`, `onCell`, …) | `columns` (`header`, `renderCell`, `sortKey` + `compare`, `pin`, `getCellProps`, …) |
 | column groups (`children`)                | flattened; the group title is `groupHeader` |
 | `order` / `onChangeOrder` (`-field`)      | `sort` / `onSortChange`                    |
 | `pagination` (`current`, `total`, `showSizeChanger`, `hideOnSinglePage`, `extraContent`) | `pagination` (`page`, `totalItems`, `hasPageSizeSelector`, `isHiddenOnSinglePage`, `endContent`) |
 | `rowSelection`                            | `selection`                                |
 | `tableSettings` / `exportSettings`        | `columnSettings` / `csvExport`             |
 | `expandable`                              | `expansion`                                |
 | `size` / `bordered`                       | `density` / `dividers`                     |
 | `scroll.x` / `scroll.y`                   | `scrollWidth` / `maxHeight`                |
 | `loading` / `spinnerLoading`              | `isLoading`                                |
 | `showHeader` / `locale.emptyText` / `onRow` | `isHeaderHidden` / `emptyState` / `getRowProps` |

 Multi-level headers render one header row with the group title as a caption;
 `expandedRowRender` rows span the table; `loading` dims without a spinner.
 Row virtualization is deferred by a product decision (2026-08-07).
*/
import { useBAIi18n } from '../../hooks/useBAIi18n';
import {
  flattenColumns,
  sortKeyOf,
  toDataGridColumns,
} from './dataGridColumns';
import {
  type BAIAnyObject,
  type BAIColumnType,
  type BAIColumnsType,
  type BAIExportSettings,
  type BAITableSettings,
} from './tableTypes';
import {
  DataGrid,
  type DataGridPagination,
  type DataGridProps,
  type DataGridSort,
} from '@lablup/ui-common/components/DataGrid';
import * as _ from 'lodash-es';
import React, { type ReactNode } from 'react';

type AnyRecord = BAIAnyObject;

export interface BAITableRowSelection<RecordType> {
  /** Only `'checkbox'` is implemented. */
  type?: 'checkbox';
  selectedRowKeys?: ReadonlyArray<React.Key>;
  onChange?: (
    selectedRowKeys: Array<React.Key>,
    selectedRows: Array<RecordType>,
  ) => void;
  /** Only `disabled` is honoured. */
  getCheckboxProps?: (record: RecordType) => { disabled?: boolean };
  /** Keys of rows that are not on the current page survive a select-all. */
  preserveSelectedRowKeys?: boolean;
  /**
   * The row's display name for its checkbox label, e.g. `record => record.name`.
   * Without it the checkbox is named by position ("row 3"), never the key.
   */
  getRowLabel?: (record: RecordType) => string;
}

export interface BAITablePaginationConfig extends Omit<
  DataGridPagination,
  | 'page'
  | 'defaultPage'
  | 'totalItems'
  | 'hasPageSizeSelector'
  | 'isHiddenOnSinglePage'
  | 'endContent'
> {
  current?: number;
  defaultCurrent?: number;
  /**
   * Omit it and the table slices `dataSource` itself. A `total` greater than
   * `dataSource.length` declares the rows already sliced server-side.
   */
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
  /** `false` withholds the page-size choice. */
  showSizeChanger?: boolean;
  /** Hides the pager while everything fits on one page. */
  hideOnSinglePage?: boolean;
  /** Extra node rendered at the end of the bottom bar. */
  extraContent?: ReactNode;
}

export interface BAITableExpandable<RecordType> {
  expandedRowRender?: (record: RecordType, index: number) => ReactNode;
  rowExpandable?: (record: RecordType) => boolean;
  expandedRowKeys?: ReadonlyArray<React.Key>;
  defaultExpandedRowKeys?: ReadonlyArray<React.Key>;
  onExpandedRowsChange?: (expandedKeys: ReadonlyArray<React.Key>) => void;
  /** Header content of the chevron column. */
  columnTitle?: ReactNode;
  columnWidth?: number;
}

export interface BAITableProps<
  RecordType extends AnyRecord = AnyRecord,
> extends Omit<
  DataGridProps<RecordType>,
  | 'data'
  | 'columns'
  | 'idKey'
  | 'density'
  | 'dividers'
  | 'isLoading'
  | 'isResizable'
  | 'sort'
  | 'defaultSort'
  | 'onSortChange'
  | 'selection'
  | 'pagination'
  | 'columnSettings'
  | 'csvExport'
  | 'expansion'
  | 'getRowProps'
  | 'scrollWidth'
  | 'maxHeight'
  | 'isHeaderHidden'
> {
  columns?: BAIColumnsType<RecordType>;
  dataSource?: ReadonlyArray<RecordType>;
  rowKey?: string | ((record: RecordType) => React.Key);
  /** antd density names. */
  size?: 'small' | 'middle' | 'large';
  /** Dims the rows while a refetch is in flight. */
  loading?: boolean;
  /** Behaves like `loading`. */
  spinnerLoading?: boolean;
  /** Drag-to-resize column borders. Defaults to on. */
  resizable?: boolean;
  /** Backend.AI order string, e.g. `-created_at`. */
  order?: string | null;
  onChangeOrder?: (order?: string) => void;
  rowSelection?: BAITableRowSelection<RecordType>;
  pagination?: false | BAITablePaginationConfig;
  tableSettings?: BAITableSettings;
  exportSettings?: BAIExportSettings;
  expandable?: BAITableExpandable<RecordType>;
  /** Only `emptyText` is honoured; `emptyState` wins over it. */
  locale?: { emptyText?: ReactNode };
  /** Only the returned handlers / style / className are applied. */
  onRow?: (
    record: RecordType,
    index?: number,
  ) => React.HTMLAttributes<HTMLTableRowElement>;
  /** Pins the `fixed` columns. Defaults to on. */
  sticky?: boolean;
  /** Column borders (`dividers="grid"`). */
  bordered?: boolean;
  /** `x`: the table's width in a horizontal scroll; `y`: caps the rows' height. */
  scroll?: { x?: number | string | true; y?: number | string };
  /** Hides the header row, and with it sorting and select-all. */
  showHeader?: boolean;
}

const DENSITY_BY_SIZE: Record<string, DataGridProps['density']> = {
  small: 'compact',
  middle: 'balanced',
  large: 'spacious',
};

const hasOwn = (object: object | undefined, key: string) =>
  !!object && Object.prototype.hasOwnProperty.call(object, key);

const toCssLength = (value: number | string): string =>
  typeof value === 'number' ? `${value}px` : value;

const toOrder = (sort: DataGridSort | null) =>
  !sort
    ? undefined
    : sort.direction === 'descending'
      ? `-${sort.sortKey}`
      : sort.sortKey;

const toSort = (order: string | null | undefined): DataGridSort | null =>
  !order
    ? null
    : order.startsWith('-')
      ? { sortKey: order.slice(1), direction: 'descending' }
      : { sortKey: order, direction: 'ascending' };

const BAITable = <RecordType extends AnyRecord = AnyRecord>({
  columns,
  dataSource,
  rowKey = 'id',
  size = 'small',
  loading,
  spinnerLoading,
  resizable = true,
  order,
  onChangeOrder,
  rowSelection,
  pagination,
  tableSettings,
  exportSettings,
  expandable,
  emptyState,
  locale,
  onRow,
  sticky = true,
  bordered,
  scroll,
  showHeader = true,
  ...dataGridProps
}: BAITableProps<RecordType>): React.ReactElement => {
  'use memo';
  const { t } = useBAIi18n();
  const keyOf = (record: RecordType) =>
    String(
      typeof rowKey === 'function'
        ? rowKey(record)
        : (record as AnyRecord)[rowKey],
    );
  const positionByKey = new Map(
    _.map(dataSource ?? [], (record, index) => [keyOf(record), index]),
  );
  // Never the row key: it is often an opaque global id, long and meaningless
  // to assistive tech and agents reading the accessibility tree.
  const rowLabelOf = (record: RecordType) =>
    rowSelection?.getRowLabel?.(record) ||
    String(
      t('comp:BAITable.RowNumber', {
        number: (positionByKey.get(keyOf(record)) ?? 0) + 1,
      }),
    );

  // A table that wires `onChangeOrder` or drives `order` is server-sorted: its
  // columns report intent only. Otherwise comparator `sorter`s sort locally.
  const isOrderControlled = !!onChangeOrder || order != null;

  const flatColumns = flattenColumns<RecordType>(columns);

  const gridColumns = toDataGridColumns(flatColumns, {
    isClientSorted: !isOrderControlled,
    isPinning: sticky,
  });

  // Client-sorted tables seed their sort from the first `defaultSortOrder`.
  const seed = _.find(flatColumns, ({ column }) => !!column.defaultSortOrder);
  const defaultSort: DataGridSort | null = seed
    ? {
        sortKey: sortKeyOf(seed.column, seed.key),
        direction:
          seed.column.defaultSortOrder === 'descend'
            ? 'descending'
            : 'ascending',
      }
    : null;

  const gridPagination = ((): DataGridProps['pagination'] => {
    if (pagination === false) return false;
    if (!pagination) return undefined;
    const {
      current,
      defaultCurrent,
      total,
      onChange,
      showSizeChanger,
      hideOnSinglePage,
      extraContent,
      pageSize,
      ...rest
    } = pagination;
    return {
      ...rest,
      // Present-but-undefined still counts as controlled here, as it did.
      page: hasOwn(pagination, 'current') ? (current ?? 1) : undefined,
      defaultPage: defaultCurrent,
      pageSize: hasOwn(pagination, 'pageSize') ? (pageSize ?? 10) : undefined,
      totalItems: total,
      onChange,
      hasPageSizeSelector: showSizeChanger !== false,
      isHiddenOnSinglePage: hideOnSinglePage,
      endContent: extraContent,
    };
  })();

  return (
    <DataGrid<RecordType>
      {...dataGridProps}
      data={dataSource}
      columns={gridColumns}
      idKey={
        typeof rowKey === 'function'
          ? (record) => String(rowKey(record))
          : rowKey
      }
      density={DENSITY_BY_SIZE[size] ?? 'compact'}
      dividers={bordered ? 'grid' : 'rows'}
      isLoading={!!loading || !!spinnerLoading}
      isResizable={resizable}
      sort={isOrderControlled ? toSort(order) : undefined}
      defaultSort={defaultSort}
      onSortChange={
        onChangeOrder ? (next) => onChangeOrder(toOrder(next)) : undefined
      }
      selection={
        rowSelection
          ? {
              selectedKeys: _.map(rowSelection.selectedRowKeys ?? [], String),
              onChange: rowSelection.onChange,
              getIsItemEnabled: rowSelection.getCheckboxProps
                ? (record) => !rowSelection.getCheckboxProps!(record)?.disabled
                : undefined,
              getRowLabel: rowLabelOf,
              isPreservingOtherPages: rowSelection.preserveSelectedRowKeys,
            }
          : undefined
      }
      pagination={gridPagination}
      columnSettings={
        tableSettings
          ? {
              overrides: hasOwn(tableSettings, 'columnOverrides')
                ? (tableSettings.columnOverrides ?? {})
                : undefined,
              defaultOverrides: tableSettings.defaultColumnOverrides,
              onOverridesChange: tableSettings.onColumnOverridesChange,
              isReorderable: !tableSettings.disableColumnReorder,
            }
          : undefined
      }
      csvExport={
        exportSettings
          ? {
              supportedKeys: exportSettings.supportedFields,
              onExport: exportSettings.onExport,
              notice: exportSettings.notice,
            }
          : undefined
      }
      expansion={
        expandable?.expandedRowRender
          ? {
              renderExpandedRow: expandable.expandedRowRender,
              getIsRowExpandable: expandable.rowExpandable,
              expandedKeys: expandable.expandedRowKeys,
              defaultExpandedKeys: expandable.defaultExpandedRowKeys,
              onExpandedKeysChange: expandable.onExpandedRowsChange,
              columnHeader: expandable.columnTitle,
              columnWidth: expandable.columnWidth,
            }
          : undefined
      }
      emptyState={emptyState ?? locale?.emptyText}
      getRowProps={onRow}
      scrollWidth={
        scroll?.x == null
          ? undefined
          : scroll.x === true
            ? 'auto'
            : toCssLength(scroll.x)
      }
      maxHeight={scroll?.y == null ? undefined : toCssLength(scroll.y)}
      isHeaderHidden={!showHeader}
    />
  );
};

export default BAITable;

export type { BAIColumnType, BAIColumnsType };
