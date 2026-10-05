import { BAIAnyObject, BAIColumnType, BAIColumnsType, BAIExportSettings, BAITableSettings } from './tableTypes';
import { PaginationProps } from '@astryxdesign/core/Pagination';
import { TableProps } from '@astryxdesign/core/Table';
import { default as React, ReactNode } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** Internal row shape Astryx's generic constraint requires. */
type AnyRow = Record<string, unknown>;
/**
 * PUBLIC record constraint. Deliberately looser than `AnyRow` so the ~70
 * consumers that write `BAITableProps<SomeRelayNode>` type-check — a Relay
 * node interface does not satisfy Astryx's `Record<string, unknown>`. Rows are
 * cast to `AnyRow` at the Astryx boundary.
 */
type AnyRecord = BAIAnyObject;
export interface BAITableRowSelection<RecordType> {
    /** Only `'checkbox'` is implemented; `'radio'` is dropped (see ticket 25). */
    type?: 'checkbox';
    selectedRowKeys?: ReadonlyArray<React.Key>;
    onChange?: (selectedRowKeys: Array<React.Key>, selectedRows: Array<RecordType>) => void;
    /** antd parity: only `disabled` is honoured. */
    getCheckboxProps?: (record: RecordType) => {
        disabled?: boolean;
    };
    /** Keys of rows that are not on the current page survive a select-all. */
    preserveSelectedRowKeys?: boolean;
    /** Accessible per-row checkbox label, e.g. `record => record.name`. */
    getRowLabel?: (record: RecordType) => string;
}
/**
 * Astryx's `Pagination` props, minus what the bottom bar renames or owns.
 * `pageSize` / `pageSizeOptions` / `size` / `variant` and the rest are
 * inherited and forwarded, so the bar gains Astryx's knobs without restating
 * them (FR-3564).
 */
type InheritedPaginationProps = Omit<PaginationProps, 'page' | 'totalItems' | 'onChange' | 'onPageSizeChange' | 'label' | 'ref' | 'totalPages' | 'hasMore'>;
export interface BAITablePaginationConfig extends InheritedPaginationProps {
    current?: number;
    defaultCurrent?: number;
    defaultPageSize?: number;
    /**
     * Omit it and the table slices `dataSource` itself. Pass a `total` greater
     * than `dataSource.length` to declare the rows already sliced server-side,
     * and the table leaves them alone (antd's `pageData` rule).
     */
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
    /**
     * antd parity. Astryx's `Pagination` renders the size selector exactly when
     * `pageSizeOptions` is passed, so `false` here simply withholds them — the
     * page-size dropdown is noise inside the small fixed-page modals
     * (`BAIBulkErrorModal`, the artifact modals) that ask for it.
     */
    showSizeChanger?: boolean;
    /**
     * antd parity: suppress the whole bottom bar while everything fits on one
     * page. Only `BAIBulkErrorModal` asks for it (a 3-row failure list should
     * not grow a pager).
     */
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
    /** Header content of the chevron column (the scheduling-history kebab menu). */
    columnTitle?: ReactNode;
    columnWidth?: number;
}
/**
 * Astryx's own props, minus everything this wrapper renames or owns. The
 * renamed ones (`data`/`columns`/`idKey`) are also the only generic-in-`T`
 * props, so the remainder is instantiated at `AnyRow` — which keeps the public
 * `RecordType` constraint loose enough for the Relay node types call sites
 * pass, while Astryx's own is `Record<string, unknown>`.
 */
type InheritedTableProps = Omit<TableProps<AnyRow>, 'data' | 'columns' | 'idKey' | 'density' | 'dividers' | 'rowIndexStart' | 'rowCount' | 'children' | 'scrollWrapper' | 'ref' | 'emptyState' | 'className' | 'style' | 'plugins' | 'onChange'>;
export interface BAITableProps<RecordType extends AnyRecord = AnyRecord> extends InheritedTableProps {
    columns?: BAIColumnsType<RecordType>;
    dataSource?: ReadonlyArray<RecordType>;
    rowKey?: string | ((record: RecordType) => React.Key);
    /** antd density names, mapped to Astryx `density`. */
    size?: 'small' | 'middle' | 'large';
    /** Dims the rows while a refetch is in flight (no spinner — see header). */
    loading?: boolean;
    /** Kept for parity with the retired antd engine; behaves like `loading`. */
    spinnerLoading?: boolean;
    /** Drag-to-resize column borders. Defaults to on; pass `false` to opt out. */
    resizable?: boolean;
    /** Backend.AI order string, e.g. `-created_at`. */
    order?: string | null;
    onChangeOrder?: (order?: string) => void;
    rowSelection?: BAITableRowSelection<RecordType>;
    pagination?: false | BAITablePaginationConfig;
    tableSettings?: BAITableSettings;
    exportSettings?: BAIExportSettings;
    expandable?: BAITableExpandable<RecordType>;
    /**
     * Rendered in place of the body when `dataSource` is empty. A string is
     * wrapped in the default `EmptyState` (icon + padding); any other node is
     * rendered as-is; `false` renders nothing.
     */
    emptyState?: ReactNode | false;
    /** antd parity shim — only `emptyText` is honoured, same wrapping rules. */
    locale?: {
        emptyText?: ReactNode;
    };
    /** antd `onRow` — only the returned handlers/style/className are applied. */
    onRow?: (record: RecordType, index?: number) => React.HTMLAttributes<HTMLTableRowElement>;
    /**
     * Column pinning. `true` when any column declares `fixed`; the contiguous
     * run of `fixed: 'left' | true` columns is pinned to the start edge and the
     * run of `fixed: 'right'` columns to the end edge (Astryx
     * `useTableStickyColumns` semantics).
     */
    sticky?: boolean;
    /** antd `bordered` -> Astryx `dividers="grid"`. */
    bordered?: boolean;
    /**
     * antd `scroll`, both axes. `x`: width-less columns drop their proportional
     * width so content defines them and the table goes `table-layout: auto`;
     * pixel/resized columns stay fixed and keep truncating. `y`: the wrapper is
     * capped at `y` and every `<th>` sticks. The header's bottom rule belongs to
     * the COLLAPSED table border, so it scrolls away with the rows.
     */
    scroll?: {
        x?: number | string | true;
        y?: number | string;
    };
    /**
     * Hide the header row. Astryx's `Table` has no such prop (its header carries
     * the sort controls and the select-all checkbox), so this is done in CSS:
     * a wrapper class collapses `thead`. Only use it for list-shaped tables with
     * a single unlabelled column — the ChatPage history drawer is the one call
     * site. Sorting / selection remain unreachable while it is on.
     */
    showHeader?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
declare const BAITable: <RecordType extends AnyRecord = AnyRecord>({ columns, dataSource, rowKey, size, loading, spinnerLoading, resizable, order, onChangeOrder, rowSelection, pagination, tableSettings, exportSettings, expandable, emptyState, locale, onRow, sticky, bordered, isStriped, hasHover, textOverflow, verticalAlign, scroll, showHeader, className, style, ...restTableProps }: BAITableProps<RecordType>) => React.ReactElement;
export default BAITable;
/** Re-exported so a migrated call site does not need a second import. */
export type { BAIColumnType, BAIColumnsType };
