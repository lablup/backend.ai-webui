/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2 (cn-oss-removal / ticket 10) — local Astryx-backed `BAITable`.

 This is the single biggest rebuild in the pilot and the clearest demonstration
 of the antd-vs-Astryx architectural difference:

   antd `Table`  = a MONOLITH. `columns`/`dataSource`/`rowSelection`/
                   `pagination`/`expandable`/`scroll`/sorting are all internal.
   Astryx `Table` = a PRIMITIVE plus a plugin pipeline. Selection, sorting,
                   pagination and column settings are each an opt-in hook whose
                   state YOU own.

 Nothing is "ported" here; the behaviour is re-assembled. The public prop
 contract stays antd/BUI-shaped so `VFolderNodes` and the page keep compiling.

 Built (what this page actually uses):
 - `columns` with `title`/`dataIndex`/`render`/`sorter`/`required`
 - `dataSource` + `rowKey`
 - `order` string ('-created_at') <-> Astryx's structured sort state
 - `rowSelection` (checkbox, selectedRowKeys, onChange, getCheckboxProps)
 - `pagination` (server-side: data already sliced)
 - `tableSettings.columnOverrides` (hidden + order) via `useTableColumnSettings`
 - `loading`

 NOT built, because this page does not use them (each is real remaining cost):
 - virtualization (antd `virtual`), `expandable` / `expandedRowRender`,
   `scroll={{y}}` sticky-header body scrolling, `summary`, row `onRow` handlers.

 PILOT-DECISIONs:
 - `loading` — antd renders a dimming overlay + spinner ON TOP of the existing
   rows, preserving layout during a refetch. Astryx has no table loading state
   at all. Reproduced with a wrapping div at `opacity: .5` +
   `pointer-events: none`. The spinner is gone.
 - `resizable` — WIRED (phase 3) via Astryx's `useTableColumnResize`. Widths
   live in component state as `Record<columnKey, px>`. It composes cleanly with
   the sort/selection/pagination plugins (all four are independent entries in
   the same `plugins` record) — but it needs every resizable column to carry an
   explicit `width`, and it wants `pixel()` widths to resize freely: a
   `proportional()` column resizes its NEIGHBOUR to keep the table full-width,
   which is a different feel from antd's `react-resizable` (that one just grows
   the table and lets it scroll).
 - `scroll={{ x: 'max-content' }}` — Astryx's Table always renders inside its
   own `astryx-table-scroll-wrapper`, so horizontal overflow already scrolls.
   Accepted and ignored.
 - `showSorterTooltip` / `size` — no counterparts; `size="small"` maps to
   `density="compact"`, `showSorterTooltip` is dropped.
 - Column settings UI — BUI ships a whole `BAITableSettingModal` (drag-reorder,
   CSV export). `useTableColumnSettings` is headless: it returns filtered
   columns + MultiSelector options but NO UI. Only the *filtering/ordering* half
   is wired here; the settings modal itself is not rebuilt.
*/
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
} from '@astryxdesign/core/DropdownMenu';
import { Pagination } from '@astryxdesign/core/Pagination';
import { HStack } from '@astryxdesign/core/Stack';
import {
  Table,
  pixel,
  proportional,
  useTableColumnResize,
  useTableColumnSettings,
  useTableColumnSettingsState,
  useTableSelection,
  useTableSortable,
} from '@astryxdesign/core/Table';
import { SettingsIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** antd-shaped column definition, as used across this repo. */
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
}

export interface BAITableAstryxColumnOverride {
  hidden?: boolean;
  order?: number;
}

export interface BAITableAstryxProps<T extends Record<string, unknown>> {
  dataSource?: Array<T>;
  columns?: Array<BAITableAstryxColumn<T>>;
  rowKey?: (record: T) => string;
  loading?: boolean;
  order?: string | null;
  onChangeOrder?: (order?: string) => void;
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: Array<React.Key>;
    preserveSelectedRowKeys?: boolean;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
    onChange?: (selectedRowKeys: Array<React.Key>) => void;
  };
  pagination?: {
    pageSize?: number;
    current?: number;
    total?: number;
    onChange?: (current: number, pageSize: number) => void;
  };
  tableSettings?: {
    columnOverrides?: Record<string, BAITableAstryxColumnOverride>;
    onColumnOverridesChange?: (
      next: Record<string, BAITableAstryxColumnOverride>,
    ) => void;
  };
  /** Drag-to-resize column borders. Wired in phase 3. */
  resizable?: boolean;
  showSorterTooltip?: boolean;
  scroll?: { x?: number | string; y?: number | string };
  size?: 'small' | 'middle' | 'large';
}

/** `-created_at` <-> `[{sortKey:'created_at', direction:'descending'}]` */
function orderToSort(order?: string | null) {
  if (!order) return [];
  const isDescending = order.startsWith('-');
  return [
    {
      sortKey: isDescending ? order.slice(1) : order,
      direction: isDescending
        ? ('descending' as const)
        : ('ascending' as const),
    },
  ];
}

function BAITableAstryx<T extends Record<string, unknown>>({
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
}: BAITableAstryxProps<T>) {
  'use memo';

  // Resized widths are component state — BUI's `columnOverrides` record has no
  // width field, so persisting them would need a BUI schema change.
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const { t } = useTranslation();
  const data = dataSource ?? [];
  const getKey = (record: T) =>
    rowKey ? rowKey(record) : String((record as Record<string, unknown>).id);

  const overrides = tableSettings?.columnOverrides ?? {};

  // Column visibility + ordering. BUI persists this as a per-key record; the
  // Astryx plugin wants an ordered key ARRAY, so it is derived here.
  const visibleColumns = (columns ?? [])
    .filter((c) => {
      if (c.required) return true;
      if (c.hidden) return false;
      const override = overrides[c.key]?.hidden;
      // An explicit override always wins over the column's own default.
      return override != null ? !override : !c.defaultHidden;
    })
    .slice()
    .sort((a, b) => {
      const ao = overrides[a.key]?.order;
      const bo = overrides[b.key]?.order;
      if (ao == null && bo == null) return 0;
      if (ao == null) return 1;
      if (bo == null) return -1;
      return ao - bo;
    });

  const astryxColumns = visibleColumns.map((column) => ({
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
  }));

  const selectedKeys = new Set(
    (rowSelection?.selectedRowKeys ?? []).map(String),
  );

  const selectionPlugin = useTableSelection<T>({
    getIsItemSelected: (item) => selectedKeys.has(getKey(item)),
    getIsItemEnabled: (item) =>
      !rowSelection?.getCheckboxProps?.(item)?.disabled,
    getIsAllSelected: () =>
      data.length > 0 && data.every((item) => selectedKeys.has(getKey(item))),
    getIsIndeterminate: () =>
      data.some((item) => selectedKeys.has(getKey(item))) &&
      !data.every((item) => selectedKeys.has(getKey(item))),
    onSelectItem: ({ item, isSelected }) => {
      const next = new Set(selectedKeys);
      if (isSelected) next.add(getKey(item));
      else next.delete(getKey(item));
      rowSelection?.onChange?.(Array.from(next));
    },
    onSelectAll: ({ isAllSelected }) => {
      // `preserveSelectedRowKeys` semantics: keys from other pages survive.
      const next = new Set(
        rowSelection?.preserveSelectedRowKeys ? selectedKeys : [],
      );
      data.forEach((item) => {
        const key = getKey(item);
        if (isAllSelected) next.add(key);
        else next.delete(key);
      });
      rowSelection?.onChange?.(Array.from(next));
    },
  });

  const sortPlugin = useTableSortable({
    sort: orderToSort(order),
    onSortChange: (next) => {
      const first = next[0];
      if (!first) {
        onChangeOrder?.(undefined);
        return;
      }
      onChangeOrder?.(
        first.direction === 'descending' ? `-${first.sortKey}` : first.sortKey,
      );
    },
    allowUnsortedState: true,
  });

  // PHASE 4 — pagination is rendered as a STANDALONE `Pagination` in a
  // right-aligned bottom bar rather than via the `useTablePagination` plugin.
  //
  // Two reasons, both matching the original:
  //  1. The plugin deliberately renders NOTHING when there is a single page
  //     ("Don't render pagination when there's only one page and no more
  //     data"). antd always shows the bar, and the BEFORE screenshot shows it
  //     at total=3/pageSize=10 — so the plugin would have silently hidden it.
  //  2. BUI's own `BAITable` does exactly this: it sets antd's built-in
  //     pagination to `display: none` and renders its own `<Pagination>` in a
  //     `BAIFlex justify="end"` next to the column-settings gear. Composing the
  //     bar ourselves reproduces that anatomy directly.
  //
  // The Relay wiring is untouched: `onChange(page, pageSize)` still feeds
  // `useBAIPaginationOptionStateOnSearchParam`, which drives limit+offset —
  // never mixed with cursor args (see .claude/rules/graphql-pagination.md).

  // PHASE 4 — column settings. `useTableColumnSettingsState` owns the
  // visible/ordered key list; `useTableColumnSettings` is the plugin that
  // applies it. Both are HEADLESS: Astryx renders **no trigger and no
  // popover** — the surface is ours (BUI ships a whole `BAITableSettingModal`).
  //
  // Persistence matches the original exactly: the active-key list is projected
  // back into BUI's `columnOverrides` record (`{ [key]: { hidden } }`) and sent
  // to `tableSettings.onColumnOverridesChange`, which the page already persists
  // through `useBAISettingUserState('table_column_overrides.<Page>')`.
  const settingsColumns = (columns ?? []).map((column) => ({
    key: column.key,
    label: typeof column.title === 'string' ? column.title : column.key,
    isAlwaysVisible: !!column.required,
  }));
  const activeColumnKeys = visibleColumns.map((column) => column.key);

  const columnSettingsState = useTableColumnSettingsState({
    columns: settingsColumns,
    activeColumnKeys,
    defaultColumnKeys: (columns ?? [])
      .filter((column) => column.required || !column.defaultHidden)
      .map((column) => column.key),
    onChangeActiveColumnKeys: (keys) => {
      const active = new Set(keys);
      const next: Record<string, BAITableAstryxColumnOverride> = {
        ...overrides,
      };
      (columns ?? []).forEach((column) => {
        if (column.required) return;
        next[column.key] = {
          ...next[column.key],
          hidden: !active.has(column.key),
        };
      });
      tableSettings?.onColumnOverridesChange?.(next);
    },
  });

  const columnSettingsPlugin = useTableColumnSettings<T>(
    columnSettingsState.columnSettingsConfig,
  );

  const resizePlugin = useTableColumnResize<T>({
    // The plugin's `columns` is typed against the erased
    // `TableColumn<Record<string, unknown>>` rather than the generic `T`, so a
    // generic table cannot satisfy it without a cast. Minor Astryx typing gap.
    columns: astryxColumns as unknown as Parameters<
      typeof useTableColumnResize
    >[0]['columns'],
    columnWidths,
    minWidth: 80,
    onColumnResizeEnd: (updates) =>
      setColumnWidths((prev) => ({ ...prev, ...updates })),
  });

  const plugins: Record<string, unknown> = { sort: sortPlugin };
  if (resizable) plugins.resize = resizePlugin;
  if (rowSelection) plugins.selection = selectionPlugin;
  if (tableSettings) plugins.columnSettings = columnSettingsPlugin;

  return (
    // PILOT-DECISION: antd's loading overlay (dim + centred spinner over the
    // existing rows) has no Astryx equivalent. Dimming preserves the "old data
    // is still readable while refetching" behaviour; the spinner is lost.
    <div
      style={
        loading
          ? { opacity: 0.5, pointerEvents: 'none', transition: 'opacity .2s' }
          : undefined
      }
      aria-busy={loading || undefined}
    >
      <Table<T>
        data={data}
        columns={astryxColumns}
        idKey={(item) => getKey(item)}
        density={size === 'small' ? 'compact' : 'balanced'}
        hasHover
        textOverflow="truncate"
        rowCount={pagination?.total}
        rowIndexStart={
          pagination
            ? ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 10) + 1
            : undefined
        }
        plugins={plugins as React.ComponentProps<typeof Table<T>>['plugins']}
      />

      {/* Bottom bar — right-aligned pagination with the column-settings gear
          immediately to its right, matching BUI's `BAIFlex justify="end"`. */}
      {pagination || tableSettings ? (
        <HStack justify="end" align="center" gap={2} style={{ marginTop: 12 }}>
          {pagination ? (
            <Pagination
              page={pagination.current ?? 1}
              pageSize={pagination.pageSize ?? 10}
              totalItems={pagination.total ?? 0}
              // Same three options the original offers.
              pageSizeOptions={[10, 20, 50]}
              size="sm"
              variant="pages"
              label={t('general.Pagination', 'Pagination')}
              onChange={(page) =>
                pagination.onChange?.(page, pagination.pageSize ?? 10)
              }
              onPageSizeChange={(pageSize) =>
                pagination.onChange?.(1, pageSize)
              }
            />
          ) : null}
          {tableSettings ? (
            <DropdownMenu
              placement="above"
              alignment="end"
              hasChevron={false}
              button={{
                label: t('comp:BAITable.ColumnSettings', 'Column settings'),
                variant: 'ghost',
                size: 'sm',
                isIconOnly: true,
                icon: <SettingsIcon />,
              }}
            >
              {/* PILOT-DECISION: BUI opens a full modal with drag-to-reorder
                  AND CSV export. This rebuild covers visibility toggling only —
                  a checkbox menu. Reorder (`columnOverrides[key].order`) and
                  export are real remaining cost, not rebuilt here. */}
              {settingsColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  label={column.label}
                  value={columnSettingsState.isColumnActive(column.key)}
                  isDisabled={
                    !columnSettingsState.isColumnToggleable(column.key)
                  }
                  onChange={() => columnSettingsState.toggleColumn(column.key)}
                />
              ))}
            </DropdownMenu>
          ) : null}
        </HStack>
      ) : null}
    </div>
  );
}

export default BAITableAstryx;
