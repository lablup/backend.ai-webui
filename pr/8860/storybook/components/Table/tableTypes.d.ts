import { Key, ReactNode, TdHTMLAttributes } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** Loose record constraint, mirroring antd's `AnyObject`. */
export type BAIAnyObject = Record<PropertyKey, any>;
/** antd `DataIndex` — a field name, or a path into a nested record. */
export type BAIDataIndex = string | number | readonly (string | number)[];
export type BAIColumnAlign = 'left' | 'right' | 'center';
/** antd `fixed`: `true` is an alias of `'left'`. */
export type BAIColumnFixed = 'left' | 'right' | boolean;
export type BAICompareFn<RecordType> = (a: RecordType, b: RecordType, sortOrder?: 'ascend' | 'descend') => number;
/**
 * antd's sorter shape. Only its TRUTHINESS reaches the Astryx engine (a column
 * with a `sorter` gets a sort control whose key is its `dataIndex`); the
 * comparator itself is dead weight for the server-sorted tables but is kept in
 * the type because a handful of client-sorted tables still pass one.
 */
export type BAIColumnSorter<RecordType> = boolean | BAICompareFn<RecordType> | {
    compare?: BAICompareFn<RecordType>;
    multiple?: number;
};
/**
 * Column override properties that can be customized.
 * Used to override default column behavior like visibility.
 */
export interface BAITableColumnOverrideItem {
    /** Override the default visibility of a column */
    hidden?: boolean;
    /**
     * Override the column display order. Lower values come first. Persisted in
     * the same overrides record as `hidden`, so reordering needs no extra
     * persistence plumbing. Only set when the user has reordered columns away
     * from their natural (declaration) order; see `disableColumnReorder`.
     */
    order?: number;
    /**
     * Persisted column width in pixels. Written by `BAITable` when the
     * user drags a column border, so a resize survives a reload exactly like a
     * visibility toggle (ticket 25).
     */
    width?: number;
}
/**
 * Record type mapping column keys to their override configurations
 */
export type BAITableColumnOverrideRecord = Record<string, BAITableColumnOverrideItem>;
/**
 * Configuration for table settings including column overrides
 * Supports controllable column visibility and customization
 */
export interface BAITableSettings {
    /** Current column property overrides that differ from defaults (controllable) */
    columnOverrides?: BAITableColumnOverrideRecord;
    /** Default column overrides to use initially */
    defaultColumnOverrides?: BAITableColumnOverrideRecord;
    /** Callback function called when column overrides change */
    onColumnOverridesChange?: (overrides: BAITableColumnOverrideRecord) => void;
    /**
     * Disable drag-to-reorder in the settings modal. Reorder is **on by default**
     * for every table that passes `tableSettings`: users can reorder columns via
     * drag-and-drop, and the chosen order is persisted in
     * `columnOverrides[key].order` (riding the same record as `hidden`, so no
     * extra persistence plumbing is needed). Set to `true` only when reorder is
     * not appropriate — e.g. a table whose column order is semantically fixed.
     */
    disableColumnReorder?: boolean;
}
export interface BAIExportSettings {
    supportedFields: string[];
    onExport: (selectedExportKeys: string[]) => Promise<void>;
}
/**
 * Column model for `BAITable`.
 *
 * antd-shaped (see the file header) but antd-free.
 */
export interface BAIColumnType<RecordType = any> {
    /** Stable identity — the key column overrides, resize widths and sort state use. */
    key?: Key;
    title?: ReactNode | ((props: any) => ReactNode);
    dataIndex?: BAIDataIndex;
    /** antd render signature; `index` is the index in the FULL `dataSource`. */
    render?: (value: any, record: RecordType, index: number) => ReactNode;
    /** Pixel width. A numeric width pins the column; otherwise it flexes. */
    width?: number | string;
    /** Lower bound for a flexing column. */
    minWidth?: number;
    align?: BAIColumnAlign;
    /** Pin the column to the start (`'left'` / `true`) or end (`'right'`) edge. */
    fixed?: BAIColumnFixed;
    sorter?: BAIColumnSorter<RecordType>;
    /**
     * Field name for the server order string (`order` / `onChangeOrder`).
     * Defaults to the dataIndex path joined with `.` — set this when that path
     * is not the field the server sorts by (e.g. a nested display path).
     */
    sortKey?: string;
    /**
     * Initial sort direction for this column. Honoured only by CLIENT-sorted
     * tables (no `order` / `onChangeOrder` wiring); a server-sorted table drives
     * its initial state through the `order` string instead, exactly as antd
     * ignores `defaultSortOrder` once `sortOrder` is controlled.
     */
    defaultSortOrder?: 'ascend' | 'descend';
    ellipsis?: boolean | {
        showTitle?: boolean;
    };
    className?: string;
    /** antd escape hatch — extra `<td>` attributes for this column's cells. */
    onCell?: (record: RecordType, index?: number) => TdHTMLAttributes<HTMLTableCellElement>;
    /** Whether this column should be hidden by default */
    defaultHidden?: boolean;
    /** Whether this column is required and cannot be hidden by users */
    required?: boolean;
    /** Key(s) to use for CSV export. If not provided, dataIndex will be used.
     * When multiple columns share the same exportKey(s), they are grouped
     * together in the export modal (toggling one toggles all). */
    exportKey?: string | string[];
}
/**
 * A header group. Both engines flatten these (Astryx's table has a single
 * header row and no `colSpan` contract); measured usage in this repo is zero.
 */
export interface BAIColumnGroupType<RecordType = BAIAnyObject> extends Omit<BAIColumnType<RecordType>, 'dataIndex'> {
    children: BAIColumnsType<RecordType>;
}
/**
 * Array type for BAI table columns
 */
export type BAIColumnsType<RecordType = any> = (BAIColumnGroupType<RecordType> | BAIColumnType<RecordType>)[];
/**
 * Utility function to determine if a column should be visible
 * Takes into account required columns, overrides, and default visibility
 *
 * @param column - The column configuration
 * @param columnKey - The unique key for the column
 * @param overrides - Column override settings
 * @returns Whether the column should be visible
 */
export declare const isColumnVisible: (column: BAIColumnType<any>, columnKey: string, overrides?: BAITableColumnOverrideRecord) => boolean;
/**
 * Filters columns to return only visible ones based on overrides
 *
 * @param columns - Array of column configurations
 * @param overrides - Column override settings
 * @returns Filtered array of visible columns
 */
export declare const getVisibleColumns: (columns: BAIColumnsType, overrides?: BAITableColumnOverrideRecord) => BAIColumnsType;
/**
 * Restores a specific column to its default settings by removing its override
 *
 * @param overrides - Current column overrides
 * @param columnKey - Key of the column to restore
 * @returns New overrides object without the specified column override
 */
export declare const restoreColumnToDefault: (overrides: BAITableColumnOverrideRecord, columnKey: string) => BAITableColumnOverrideRecord;
/**
 * Restores all columns to their default settings by clearing all overrides
 *
 * @returns Empty overrides object
 */
export declare const restoreAllColumnsToDefault: () => BAITableColumnOverrideRecord;
/**
 * Flatten a column `title` down to plain text.
 *
 * `title` is a `ReactNode`, but the column-settings and CSV-export surfaces
 * need a `string` for their checkbox labels. Both used to reach for
 * `String(title)`, which on a React element is the literal `"[object Object]"`
 * — the defect reported on the Deployments column list (QA-FINDINGS Q-12). The
 * app's own legacy `TableColumnsSettingModal` had a narrower version of the
 * same bug: it picked only the DIRECT string children of an element, so a
 * header that nested its text one level deeper came out blank.
 *
 * Walking `props.children` recovers the text for every shape a header actually
 * uses: elements, fragments and arrays. Anything genuinely textless — an
 * icon-only header — yields `''`, and callers fall back to the column key.
 *
 * Lives here rather than in the engine because it is a fact about the COLUMN
 * MODEL, and both the engine's own modal and the app's legacy one need it.
 */
export declare const columnTitleToPlainText: (node: ReactNode) => string;
/**
 * Resolve a column's `title`, which may be a render function, to a node.
 */
export declare const renderColumnTitle: (column: {
    title?: unknown;
}) => ReactNode;
