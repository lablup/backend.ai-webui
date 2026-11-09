import { BAIAnyObject, BAIColumnType, BAIColumnsType, BAIExportSettings, BAITableSettings } from './tableTypes';
import { DataGridPagination, DataGridProps } from '@lablup/ui-common/components/DataGrid';
import { default as React, ReactNode } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
type AnyRecord = BAIAnyObject;
export interface BAITableRowSelection<RecordType> {
    /** Only `'checkbox'` is implemented. */
    type?: 'checkbox';
    selectedRowKeys?: ReadonlyArray<React.Key>;
    onChange?: (selectedRowKeys: Array<React.Key>, selectedRows: Array<RecordType>) => void;
    /** Only `disabled` is honoured. */
    getCheckboxProps?: (record: RecordType) => {
        disabled?: boolean;
    };
    /** Keys of rows that are not on the current page survive a select-all. */
    preserveSelectedRowKeys?: boolean;
    /** Accessible per-row checkbox label, e.g. `record => record.name`. */
    getRowLabel?: (record: RecordType) => string;
}
export interface BAITablePaginationConfig extends Omit<DataGridPagination, 'page' | 'defaultPage' | 'totalItems' | 'hasPageSizeSelector' | 'isHiddenOnSinglePage' | 'endContent'> {
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
export interface BAITableProps<RecordType extends AnyRecord = AnyRecord> extends Omit<DataGridProps<RecordType>, 'data' | 'columns' | 'idKey' | 'density' | 'dividers' | 'isLoading' | 'isResizable' | 'sort' | 'defaultSort' | 'onSortChange' | 'selection' | 'pagination' | 'columnSettings' | 'csvExport' | 'expansion' | 'getRowProps' | 'scrollWidth' | 'maxHeight' | 'isHeaderHidden'> {
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
    locale?: {
        emptyText?: ReactNode;
    };
    /** Only the returned handlers / style / className are applied. */
    onRow?: (record: RecordType, index?: number) => React.HTMLAttributes<HTMLTableRowElement>;
    /** Pins the `fixed` columns. Defaults to on. */
    sticky?: boolean;
    /** Column borders (`dividers="grid"`). */
    bordered?: boolean;
    /** `x`: the table's width in a horizontal scroll; `y`: caps the rows' height. */
    scroll?: {
        x?: number | string | true;
        y?: number | string;
    };
    /** Hides the header row, and with it sorting and select-all. */
    showHeader?: boolean;
}
declare const BAITable: <RecordType extends AnyRecord = AnyRecord>({ columns, dataSource, rowKey, size, loading, spinnerLoading, resizable, order, onChangeOrder, rowSelection, pagination, tableSettings, exportSettings, expandable, emptyState, locale, onRow, sticky, bordered, scroll, showHeader, ...dataGridProps }: BAITableProps<RecordType>) => React.ReactElement;
export default BAITable;
export type { BAIColumnType, BAIColumnsType };
