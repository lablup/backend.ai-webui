"""PHASE 5 — re-base BAITableAstryx props on Astryx idioms."""
import pathlib
import re

f = pathlib.Path('react/src/components/astryx-bui/BAITableAstryx.tsx')
s = f.read_text()

s = s.replace(""" antd-shaped so `VFolderNodes` and the page keep compiling.""",
""" PHASE 5 — the prop surface is now **Astryx-idiomatic**, not antd-shaped:

   RENAMED  `dataSource` -> `data`            (Astryx `Table.data`)
   RENAMED  `columns[].title` -> `.header`    (Astryx `TableColumn.header`)
   RENAMED  `columns[].render` -> `.renderCell(item)`  — value-first `(value,
            record, index)` becomes Astryx's item-only signature
   RENAMED  `columns[].sorter` -> `.sortable`
   RENAMED  `rowKey` -> `idKey`
   RENAMED  `loading` -> `isLoading`
   RENAMED  `resizable` -> `isColumnResizable`
   RENAMED  `size` -> `density` ('compact' | 'balanced' | 'spacious')
   REMOVED  `scroll`, `showSorterTooltip`     (no Astryx counterpart)
   KEPT     `order`/`onChangeOrder`, `rowSelection`, `pagination`,
            `tableSettings` — these are the Backend.AI contracts (URL-state
            ordering, Relay-driven server pagination, persisted column
            overrides) that are the whole reason this component exists.""")

s = s.replace("""/** antd-shaped column definition, as used across this repo. */
export interface BAITableAstryxColumn<T> {
  key: string;
  title?: React.ReactNode;
  dataIndex?: string;
  render?: (value: never, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  required?: boolean;
  width?: number;
  hidden?: boolean;
  /** Hidden until the user opts in via column settings. */
  defaultHidden?: boolean;
}""",
"""/**
 * Extends Astryx's `TableColumn` with the three things the Backend.AI column
 * model adds: a settings-visibility triple (`isRequired` / `isHiddenByDefault`
 * / `isHidden`) and `dataIndex` for the default cell renderer.
 */
export interface BAITableAstryxColumn<T extends Record<string, unknown>>
  extends Omit<TableColumn<T>, 'width'> {
  /** Property read for the default cell render when `renderCell` is absent. */
  dataIndex?: string;
  /** Cannot be hidden through column settings. */
  isRequired?: boolean;
  /** Hidden until the user opts in through column settings. */
  isHiddenByDefault?: boolean;
  /** Always hidden. */
  isHidden?: boolean;
  /** Pixel width; resizing overrides it. */
  width?: number;
}""")

s = s.replace("""export interface BAITableAstryxProps<T extends Record<string, unknown>> {
  dataSource?: Array<T>;
  columns?: Array<BAITableAstryxColumn<T>>;
  rowKey?: (record: T) => string;
  loading?: boolean;
  order?: string | null;""",
"""export interface BAITableAstryxProps<T extends Record<string, unknown>>
  extends Omit<
    TableProps<T>,
    'data' | 'columns' | 'idKey' | 'plugins' | 'children'
  > {
  data?: Array<T>;
  columns?: Array<BAITableAstryxColumn<T>>;
  idKey?: (item: T) => string;
  isLoading?: boolean;
  /** Backend.AI order string, e.g. `-created_at`. Mapped to Astryx sort state. */
  order?: string | null;""")

s = s.replace("""  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: Array<React.Key>;
    preserveSelectedRowKeys?: boolean;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
    onChange?: (selectedRowKeys: Array<React.Key>) => void;
  };""",
"""  rowSelection?: {
    selectedKeys?: Array<string>;
    /** Keys from other pages survive a select-all. */
    isPreservingKeys?: boolean;
    getIsItemEnabled?: (item: T) => boolean;
    onChange?: (selectedKeys: Array<string>) => void;
  };""")

s = s.replace("""  /** Accepted and ignored — see the PILOT-DECISION notes above. */
  resizable?: boolean;
  showSorterTooltip?: boolean;
  scroll?: { x?: number | string; y?: number | string };
  size?: 'small' | 'middle' | 'large';
}""",
"""  /** Drag-to-resize column borders. */
  isColumnResizable?: boolean;
}""")

s = s.replace("""function BAITableAstryx<T extends Record<string, unknown>>({
  dataSource,
  columns,
  rowKey,
  loading,
  order,
  onChangeOrder,
  rowSelection,
  pagination,
  tableSettings,
  resizable = false,
  size = 'middle',
}: BAITableAstryxProps<T>) {""",
"""function BAITableAstryx<T extends Record<string, unknown>>({
  data: dataProp,
  columns,
  idKey,
  isLoading,
  order,
  onChangeOrder,
  rowSelection,
  pagination,
  tableSettings,
  isColumnResizable = false,
  density = 'balanced',
  ...tableProps
}: BAITableAstryxProps<T>) {""")

s = s.replace("  const data = dataSource ?? [];", "  const data = dataProp ?? [];")
s = s.replace("""  const getKey = (record: T) =>
    rowKey ? rowKey(record) : String((record as Record<string, unknown>).id);""",
"""  const getKey = (item: T) =>
    idKey ? idKey(item) : String((item as Record<string, unknown>).id);""")

s = s.replace("""      if (c.required) return true;
      if (c.hidden) return false;
      const override = overrides[c.key]?.hidden;
      // An explicit override always wins over the column's own default.
      return override != null ? !override : !c.defaultHidden;""",
"""      if (c.isRequired) return true;
      if (c.isHidden) return false;
      const override = overrides[c.key]?.hidden;
      // An explicit override always wins over the column's own default.
      return override != null ? !override : !c.isHiddenByDefault;""")

s = s.replace("""  const astryxColumns = visibleColumns.map((column) => ({
    key: column.key,
    header: column.title,
    // Resize needs a concrete starting width; without `resizable` the columns
    // stay proportional so the table still fills its container.
    width:
      resizable && columnWidths[column.key] != null
        ? pixel(columnWidths[column.key])
        : column.width
          ? pixel(column.width)
          : proportional(1),
    sortable: column.sorter ? true : undefined,
    renderCell: (item: T) => {
      const value = column.dataIndex
        ? (item as Record<string, unknown>)[column.dataIndex]
        : undefined;
      if (column.render) {
        // antd's render signature is (value, record, index); the index is not
        // available inside Astryx's per-item renderer, so it is passed as -1.
        // No column on this page reads it.
        return column.render(value as never, item, -1);
      }
      return value == null ? null : String(value);
    },
  }));""",
"""  const astryxColumns = visibleColumns.map((column) => ({
    ...column,
    // Resize needs a concrete starting width; otherwise columns stay
    // proportional so the table still fills its container.
    width:
      isColumnResizable && columnWidths[column.key] != null
        ? pixel(columnWidths[column.key])
        : column.width
          ? pixel(column.width)
          : proportional(1),
    renderCell:
      column.renderCell ??
      ((item: T) => {
        const value = column.dataIndex
          ? (item as Record<string, unknown>)[column.dataIndex]
          : undefined;
        return value == null ? null : String(value);
      }),
  }));""")

s = s.replace("""  const selectedKeys = new Set(
    (rowSelection?.selectedRowKeys ?? []).map(String),
  );""",
"""  const selectedKeys = new Set(rowSelection?.selectedKeys ?? []);""")

s = s.replace("""    getIsItemEnabled: (item) =>
      !rowSelection?.getCheckboxProps?.(item)?.disabled,""",
"""    getIsItemEnabled: (item) => rowSelection?.getIsItemEnabled?.(item) ?? true,""")

s = s.replace("""      // `preserveSelectedRowKeys` semantics: keys from other pages survive.
      const next = new Set(
        rowSelection?.preserveSelectedRowKeys ? selectedKeys : [],
      );""",
"""      // `isPreservingKeys` semantics: keys from other pages survive.
      const next = new Set(rowSelection?.isPreservingKeys ? selectedKeys : []);""")

s = s.replace("""    label: typeof column.title === 'string' ? column.title : column.key,
    isAlwaysVisible: !!column.required,""",
"""    label: typeof column.header === 'string' ? column.header : column.key,
    isAlwaysVisible: !!column.isRequired,""")
s = s.replace("""    defaultColumnKeys: (columns ?? [])
      .filter((column) => column.required || !column.defaultHidden)""",
"""    defaultColumnKeys: (columns ?? [])
      .filter((column) => column.isRequired || !column.isHiddenByDefault)""")
s = s.replace("""      (columns ?? []).forEach((column) => {
        if (column.required) return;""",
"""      (columns ?? []).forEach((column) => {
        if (column.isRequired) return;""")

s = s.replace("  if (resizable) plugins.resize = resizePlugin;",
              "  if (isColumnResizable) plugins.resize = resizePlugin;")
s = s.replace("""          ...(loading
            ? { opacity: 0.5, pointerEvents: 'none', transition: 'opacity .2s' }
            : null),
        }}
        aria-busy={loading || undefined}""",
"""          ...(isLoading
            ? { opacity: 0.5, pointerEvents: 'none', transition: 'opacity .2s' }
            : null),
        }}
        aria-busy={isLoading || undefined}""")
s = s.replace("""        density={size === 'small' ? 'compact' : 'balanced'}
        hasHover
        textOverflow="truncate"
        rowCount={pagination?.total}""",
"""        density={density}
        hasHover
        textOverflow="truncate"
        rowCount={pagination?.total}
        {...tableProps}""")

s = s.replace("""import {
  Table,
  pixel,""", """import type { TableColumn, TableProps } from '@astryxdesign/core/Table';
import {
  Table,
  pixel,""")
f.write_text(s)
print('table re-based')
