/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAITable's antd-shaped columns, translated onto ui-common `DataGrid` columns.
 `BAIBulkErrorModal` shares the translation.
*/
import {
  renderColumnTitle,
  type BAIAnyObject,
  type BAIColumnType,
  type BAIColumnsType,
} from './tableTypes';
import type { DataGridColumn } from '@lablup/ui-common/components/DataGrid';
import * as _ from 'lodash-es';
import type { ReactNode } from 'react';

type AnyRecord = BAIAnyObject;

/** `sortKey` override, else the `dataIndex` path joined with `.`, else the key. */
export const sortKeyOf = (column: BAIColumnType<any>, key: string) =>
  column.sortKey ??
  (column.dataIndex
    ? Array.isArray(column.dataIndex)
      ? column.dataIndex.join('.')
      : String(column.dataIndex)
    : key);

const columnKeyOf = (column: BAIColumnType<any>, index: number) =>
  column.key?.toString() ??
  (column.dataIndex ? String(column.dataIndex) : `index_${index}`);

/**
 * The cell VALUE. A column without `dataIndex` has none; its `render` reads the
 * record from the second argument. Pinned by `BAITable.cellValue.test.tsx`.
 */
const readDataIndex = (record: AnyRecord, dataIndex: unknown): unknown => {
  if (dataIndex == null) return undefined;
  return Array.isArray(dataIndex)
    ? _.get(record, dataIndex as Array<string>)
    : record[String(dataIndex)];
};

/** A `px` string is a pixel width too (a token read arrives as `'48px'`). */
const pixelWidthOf = (width: BAIColumnType<any>['width']) =>
  typeof width === 'number'
    ? width
    : typeof width === 'string' && /^\d+(\.\d+)?px$/.test(width.trim())
      ? parseFloat(width)
      : undefined;

export interface FlatColumn<RecordType> {
  key: string;
  column: BAIColumnType<RecordType>;
  groupTitle?: ReactNode;
}

/** Column groups flatten to their leaves; nested group titles join with ` / `. */
export const flattenColumns = <RecordType extends AnyRecord>(
  columns: BAIColumnsType<RecordType> | undefined,
  groupTitle?: ReactNode,
): Array<FlatColumn<RecordType>> =>
  _.flatMap(columns ?? [], (column, index): Array<FlatColumn<RecordType>> => {
    if ('children' in column && !_.isEmpty(column.children)) {
      const ownTitle = renderColumnTitle(column);
      return flattenColumns(
        column.children as BAIColumnsType<RecordType>,
        groupTitle == null ? (
          ownTitle
        ) : (
          <>
            {groupTitle} / {ownTitle}
          </>
        ),
      );
    }
    return [
      {
        key: columnKeyOf(column, index),
        column: column as BAIColumnType<RecordType>,
        groupTitle,
      },
    ];
  });

/** BAITable columns, flattened, as DataGrid columns. */
export const toDataGridColumns = <RecordType extends AnyRecord>(
  flatColumns: Array<FlatColumn<RecordType>>,
  {
    isClientSorted = true,
    isPinning = true,
  }: { isClientSorted?: boolean; isPinning?: boolean } = {},
): Array<DataGridColumn<RecordType>> =>
  _.map(
    flatColumns,
    ({ key, column, groupTitle }): DataGridColumn<RecordType> => {
      const compareFn =
        typeof column.sorter === 'function'
          ? column.sorter
          : column.sorter && typeof column.sorter === 'object'
            ? column.sorter.compare
            : undefined;
      const exportKeys = column.exportKey
        ? _.castArray(column.exportKey)
        : column.dataIndex
          ? [
              Array.isArray(column.dataIndex)
                ? column.dataIndex.join('.')
                : _.toString(column.dataIndex),
            ]
          : [];
      return {
        key,
        header: renderColumnTitle(column),
        groupHeader: groupTitle,
        renderCell: (record, index) => {
          const value = readDataIndex(record, column.dataIndex);
          return column.render
            ? (column.render(value, record, index) as ReactNode)
            : value == null || value === ''
              ? null
              : String(value);
        },
        width: pixelWidthOf(column.width),
        minWidth: column.minWidth,
        align:
          column.align === 'right'
            ? 'end'
            : column.align === 'center'
              ? 'center'
              : undefined,
        sortKey: column.sorter ? sortKeyOf(column, key) : undefined,
        compare:
          compareFn && isClientSorted
            ? (a, b, direction) =>
                compareFn(
                  a,
                  b,
                  direction === 'descending' ? 'descend' : 'ascend',
                )
            : undefined,
        pin: !isPinning
          ? undefined
          : column.fixed === 'left' || column.fixed === true
            ? 'start'
            : column.fixed === 'right'
              ? 'end'
              : undefined,
        isAlwaysVisible: !!column.required,
        isHiddenByDefault: !!column.defaultHidden,
        exportKeys,
        getCellProps: column.onCell
          ? (record, index) => column.onCell!(record, index)
          : undefined,
      };
    },
  );
