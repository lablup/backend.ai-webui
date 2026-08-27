/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The project's table: Astryx's `Table` primitive plus a plugin pipeline, behind
 an antd-v6-shaped prop contract.

 ## The prop contract (read this before touching a call site)

 The public surface is deliberately antd-v6-shaped — `dataSource`, `rowKey`,
 `size`, `bordered`, `columns` (`BAIColumnsType`) and friends. Several hundred
 call sites carried over from the antd era use those names; renaming them buys
 nothing and breaks all of them. See
 `.claude/rules/component-props-extension.md` ("Frozen antd-v6-shaped prop
 vocabulary"). Everything Astryx exposes that this file does NOT rename is
 inherited rather than restated — `InheritedTableProps` (FR-3564).

 ## Plugin order is load-bearing

 Astryx runs columnSettings -> sort -> tree -> selection -> pagination, then
 unknown names in insertion order. `resize` / `sticky` / `scrollX` / `scrollY` /
 `cellRow` / `expansion` must stay last: most read the FINAL column list, and
 `scrollY` must run before `cellRow` so a consumer's `onCell` wins.

 Pagination is deliberately NOT the `useTablePagination` plugin: BUI renders its
 own bottom bar next to the settings gear, and the plugin hides itself on a
 single page, which antd never does.

 ## Deliberate capability drops

 Each is documented where it happens: multi-level headers (`flattenColumns`),
 `expandedRowRender` (`astryxData`), `loading`'s spinner (the dim wrapper),
 column-level `fixed` (`stickyConfig`), `scroll.x`/`.y` (the `scroll` prop).
 Row virtualization is DEFERRED by an explicit product decision (2026-08-07) —
 do not add it without re-opening that decision.
*/
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { theme } from '../../theme-shim';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import BAIPaginationInfoText from './BAIPaginationInfoText';
import './BAITable.css';
import BAITableColumnCSVExportModal from './BAITableColumnCSVExportModal';
import BAITableSettingModal from './BAITableSettingModal';
import type {
  BAIAnyObject,
  BAIColumnType,
  BAIColumnsType,
  BAIExportSettings,
  BAITableColumnOverrideItem,
  BAITableSettings,
} from './tableTypes';
import {
  columnTitleToPlainText,
  isColumnVisible,
  renderColumnTitle,
} from './tableTypes';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Pagination } from '@astryxdesign/core/Pagination';
import type { PaginationProps } from '@astryxdesign/core/Pagination';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import {
  Table,
  pixel,
  proportional,
  useTableColumnResize,
  useTableColumnSettings,
  useTableSelection,
  useTableSortable,
  useTableStickyColumns,
} from '@astryxdesign/core/Table';
import type {
  TableColumn,
  TableDensity,
  TablePlugin,
  TableProps,
  TableSortState,
} from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import {
  ChevronDown,
  ChevronRight,
  FileDown,
  Inbox,
  Settings,
} from 'lucide-react';
import React, { useState, type ReactNode } from 'react';

/** Internal row shape Astryx's generic constraint requires. */
type AnyRow = Record<string, unknown>;
/**
 * PUBLIC record constraint. Deliberately looser than `AnyRow` so the ~70
 * consumers that write `BAITableProps<SomeRelayNode>` type-check — a Relay
 * node interface does not satisfy Astryx's `Record<string, unknown>`. Rows are
 * cast to `AnyRow` at the Astryx boundary.
 */
type AnyRecord = BAIAnyObject;

/** Synthetic key of the injected expand-chevron column. */
const EXPAND_COLUMN_KEY = '__bai_expand__';
/**
 * Key Astryx's selection plugin gives its injected checkbox column. Not
 * exported by the package, so it is mirrored here — only used to keep the
 * checkbox inside the pinned start run.
 */
const SELECTION_COLUMN_KEY = '__xds_selection';
/**
 * Width of that injected column: the 24px first-column inset Astryx applies to
 * a bleeding table + the 20px checkbox + the 8px trailing cell pad. Without it
 * the plugin's default 36px leaves 4px of content box and the checkbox
 * overhangs its own cell (FR-3482 QA finding Q-14).
 */
const SELECTION_COLUMN_WIDTH = 52;
/**
 * Width of the injected expand-chevron column, derived the same way as
 * SELECTION_COLUMN_WIDTH: first-column inset + the 24px `size="sm"` IconButton
 * + the 8px trailing cell pad. A flat 40 left the chevron's 24px hover pill
 * ending exactly on the cell's right border edge, where the cell's
 * `overflow: hidden` sheared its rounded corner flat (FR-3556).
 */
const EXPAND_COLUMN_WIDTH_FIRST = 56;
/** Behind a selection column the chevron is no longer `:first-child`, so it
 * gets the ordinary 8px lead-in instead of the 24px inset. */
const EXPAND_COLUMN_WIDTH_AFTER_SELECTION = 40;
/** Marker field placed on the synthetic detail rows. */
const DETAIL_ROW_MARKER = '__bai_detail_for__';

const isDetailRow = (item: unknown): item is Record<string, unknown> =>
  !!item &&
  typeof item === 'object' &&
  DETAIL_ROW_MARKER in (item as Record<string, unknown>);

/** Scroll-mode cell styles; module-scope so cells keep a stable identity. */
const X_HEADER_RELEASE: React.CSSProperties = {
  width: 'auto',
  maxWidth: 'none',
};
const X_BODY_RELEASE: React.CSSProperties = { maxWidth: 'none' };
// Inline beats every @layer, restoring the pinned header's z 3 over the
// sticky-header rule. Why: BAITable.css.
const Y_PINNED_HEADER_STACK: React.CSSProperties = { zIndex: 3 };

/** antd scroll values: numbers are px, strings pass through. */
const toCssLength = (value: number | string): string =>
  typeof value === 'number' ? `${value}px` : value;

/** Merges inline style onto a cell's html props, keeping what plugins set. */
const mergeCellStyle = <
  P extends { htmlProps: { style?: React.CSSProperties } },
>(
  props: P,
  extra: React.CSSProperties,
): P => ({
  ...props,
  htmlProps: {
    ...props.htmlProps,
    style: props.htmlProps.style
      ? { ...props.htmlProps.style, ...extra }
      : extra,
  },
});

/* -------------------------------------------------------------------------- */
/* Public prop contract                                                        */
/* -------------------------------------------------------------------------- */

export interface BAITableRowSelection<RecordType> {
  /** Only `'checkbox'` is implemented; `'radio'` is dropped (see ticket 25). */
  type?: 'checkbox';
  selectedRowKeys?: ReadonlyArray<React.Key>;
  onChange?: (
    selectedRowKeys: Array<React.Key>,
    selectedRows: Array<RecordType>,
  ) => void;
  /** antd parity: only `disabled` is honoured. */
  getCheckboxProps?: (record: RecordType) => { disabled?: boolean };
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
type InheritedPaginationProps = Omit<
  PaginationProps,
  // Renamed by the frozen antd vocabulary
  | 'page' // -> current
  | 'totalItems' // -> total
  | 'onChange' // -> onChange(page, pageSize)
  // Owned by the bottom bar: derived from the table's own state
  | 'onPageSizeChange'
  | 'label'
  | 'ref'
  // Unsupported: slicing, range text and row indices all derive from `total`,
  // which the bar always passes as `totalItems`, so neither can drive anything
  | 'totalPages'
  | 'hasMore'
>;

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
type InheritedTableProps = Omit<
  TableProps<AnyRow>,
  // Renamed by the frozen antd-v6-shaped vocabulary
  | 'data' // -> dataSource
  | 'columns' // -> BAIColumnsType, not TableColumn[]
  | 'idKey' // -> rowKey
  | 'density' // -> size
  | 'dividers' // -> bordered
  // Owned here: derived from `pagination`, or fixed internally
  | 'rowIndexStart'
  | 'rowCount'
  | 'children'
  | 'scrollWrapper'
  | 'ref'
  // Owned here: a string is wrapped in the default EmptyState (see below)
  | 'emptyState'
  // Owned here: these land on the dim/scroll WRAPPER, not on the `<table>`
  | 'className'
  | 'style'
  // Owned here: the pipeline is assembled below and its order is load-bearing
  | 'plugins'
  // Not offered: antd's `onChange(pagination, filters, sorter)` habit would
  // otherwise compile as a form handler on the `<table>`.
  | 'onChange'
>;

export interface BAITableProps<
  RecordType extends AnyRecord = AnyRecord,
> extends InheritedTableProps {
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
  locale?: { emptyText?: ReactNode };
  /** antd `onRow` — only the returned handlers/style/className are applied. */
  onRow?: (
    record: RecordType,
    index?: number,
  ) => React.HTMLAttributes<HTMLTableRowElement>;
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
  scroll?: { x?: number | string | true; y?: number | string };
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

/* -------------------------------------------------------------------------- */
/* Column adaptation                                                           */
/* -------------------------------------------------------------------------- */

const DENSITY_BY_SIZE: Record<string, TableDensity> = {
  small: 'compact',
  middle: 'balanced',
  large: 'spacious',
};

const toAstryxAlign = (align?: string) =>
  align === 'right' ? 'end' : align === 'center' ? 'center' : undefined;

/** antd `dataIndex` -> the field name the order string is built from. */
const sortKeyOf = (column: BAIColumnType<any>, key: string) =>
  column.dataIndex
    ? Array.isArray(column.dataIndex)
      ? column.dataIndex.join('.')
      : String(column.dataIndex)
    : key;

const columnKeyOf = (column: BAIColumnType<any>, index: number) =>
  column.key?.toString() ??
  (column.dataIndex ? String(column.dataIndex) : `index_${index}`);

/**
 * The cell VALUE for a column. A column with no `dataIndex` has no value, so
 * this returns `undefined`; the record reaches `render` through its SECOND
 * argument (`(value, record, index)`). Do NOT re-implement rc-table's quirk of
 * returning the whole record for an empty path — call sites write
 * `render: (_value, row) => …`. Pinned by `BAITable.cellValue.test.tsx`.
 */
const readDataIndex = (record: AnyRow, dataIndex: unknown): unknown => {
  if (dataIndex == null) return undefined;
  return Array.isArray(dataIndex)
    ? _.get(record, dataIndex as Array<string>)
    : (record as AnyRow)[String(dataIndex)];
};

/**
 * A column entry after group flattening — the leaf column plus the title of
 * the group it came from (`undefined` for top-level columns).
 */
interface FlatColumn<RecordType> {
  key: string;
  column: BAIColumnType<RecordType>;
  groupTitle?: ReactNode;
}

/**
 * PILOT-DECISION — multi-level headers. antd renders a spanning `<th>` above
 * the group's children (`colSpan`). Astryx's data-driven table has one header
 * row and no span contract, so the group is flattened and its title is
 * rendered as a muted caption above each child header. Nesting deeper than one
 * level is flattened recursively the same way (the captions concatenate with
 * ` / `).
 */
const flattenColumns = <RecordType extends AnyRecord>(
  columns: BAIColumnsType<RecordType> | undefined,
  groupTitle?: ReactNode,
): Array<FlatColumn<RecordType>> =>
  _.flatMap(columns ?? [], (column, index): Array<FlatColumn<RecordType>> => {
    if ('children' in column && !_.isEmpty(column.children)) {
      const ownTitle = renderTitle(column);
      const nextTitle =
        groupTitle == null ? (
          ownTitle
        ) : (
          <>
            {groupTitle} / {ownTitle}
          </>
        );
      return flattenColumns(
        column.children as BAIColumnsType<RecordType>,
        nextTitle,
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

/**
 * `renderColumnTitle` / `columnTitleToPlainText` live in `tableTypes` — they
 * are facts about the COLUMN MODEL, and the app's legacy
 * `TableColumnsSettingModal` needs the same flattening.
 */
const renderTitle = renderColumnTitle;

/**
 * The label a column carries in the settings / export modals: its own title,
 * prefixed by its group's when it has one, so a nested column reads
 * `Resources / CPU` rather than a bare `CPU` that collides with its siblings
 * under other groups. Falls back to the column key when the header is textless.
 */
const columnPlainLabel = <RecordType extends AnyRecord>({
  key,
  column,
  groupTitle,
}: FlatColumn<RecordType>): string => {
  const own = columnTitleToPlainText(renderTitle(column)).trim();
  const group = columnTitleToPlainText(groupTitle).trim();
  const label = group && own ? `${group} / ${own}` : own || group;
  return label || key;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

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
  isStriped,
  hasHover = true,
  textOverflow = 'truncate',
  verticalAlign,
  scroll,
  showHeader = true,
  className,
  style,
  ...restTableProps
}: BAITableProps<RecordType>): React.ReactElement => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();

  // rc-table's own mapping of `scroll` onto CSS lengths (`y` has no `true`).
  const scrollXWidth =
    scroll?.x == null
      ? undefined
      : scroll.x === true
        ? 'auto'
        : toCssLength(scroll.x);
  const isScrollX = scrollXWidth !== undefined;
  const scrollYHeight = scroll?.y == null ? undefined : toCssLength(scroll.y);
  const isScrollY = scrollYHeight !== undefined;

  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  /* ---- column overrides (visibility / order / width) --------------------- */

  const [columnOverrides, setColumnOverrides] = useControllableValue<
    Record<string, BAITableColumnOverrideItem>
  >(tableSettings || {}, {
    valuePropName: 'columnOverrides',
    defaultValuePropName: 'defaultColumnOverrides',
    trigger: 'onColumnOverridesChange',
    defaultValue: {},
  });

  const effectiveColumnOverrides = {
    ...(tableSettings?.defaultColumnOverrides ?? {}),
    ...(columnOverrides ?? {}),
  };

  const isColumnReorderEnabled =
    !!tableSettings && !tableSettings.disableColumnReorder;

  const flatColumns = flattenColumns<RecordType>(columns);

  /* ---- resized widths ---------------------------------------------------- */

  // Widths live in `columnOverrides[key].width` when the table wires
  // `tableSettings` (so a resize survives a reload exactly like a visibility
  // toggle); otherwise they are local component state.
  const [localColumnWidths, setLocalColumnWidths] = useState<
    Record<string, number>
  >({});

  const columnWidths = ((): Record<string, number> => {
    if (!tableSettings) return localColumnWidths;
    const fromOverrides: Record<string, number> = {};
    _.forEach(effectiveColumnOverrides, (override, key) => {
      if (typeof override?.width === 'number')
        fromOverrides[key] = override.width;
    });
    return fromOverrides;
  })();

  const handleColumnResizeEnd = (updates: Record<string, number>) => {
    if (!tableSettings) {
      setLocalColumnWidths((prev) => ({ ...prev, ...updates }));
      return;
    }
    const next: Record<string, BAITableColumnOverrideItem> = {
      ...(columnOverrides ?? {}),
    };
    _.forEach(updates, (width, key) => {
      // Never persist the synthetic chrome columns.
      if (key === EXPAND_COLUMN_KEY) return;
      next[key] = { ...next[key], width };
    });
    setColumnOverrides(next);
  };

  /* ---- row keys ---------------------------------------------------------- */

  /**
   * Row identity. Falls back `rowKey` -> `key` -> `id` -> position: 10 call
   * sites declare none and relied on antd's `'key'` default. Without the
   * fallback every row keys to `"undefined"`, collapsing reconciliation,
   * selection and expansion onto one identity (seen live on `ErrorLogList`).
   */
  const getRowKey = (record: RecordType): string => {
    if (typeof rowKey === 'function') return String(rowKey(record));
    const direct = (record as AnyRow)[rowKey as string];
    if (direct != null) return String(direct);
    const fallback = (record as AnyRow).key ?? (record as AnyRow).id;
    if (fallback != null) return String(fallback);
    const index = _.indexOf(dataSource, record);
    return `__row_${index}`;
  };

  /* ---- sort state (controlled `order`, or internal for client sorting) ---- */

  // A table that wires `onChangeOrder` (or drives `order` itself) is
  // SERVER-sorted: the header only reports intent and the data arrives already
  // ordered. A table that instead declares comparator `sorter`s and no order
  // plumbing is CLIENT-sorted — 9 call sites, mostly modals over an
  // already-fetched array. The antd engine sorted those rows itself; the sort
  // state and the actual sorting therefore live here for that case, seeded
  // from the first column that declares `defaultSortOrder`.
  const isOrderControlled = !!onChangeOrder || order != null;
  const [uncontrolledOrder, setUncontrolledOrder] = useState<
    string | undefined
  >(() => {
    const seed = _.find(
      flattenColumns<RecordType>(columns),
      ({ column }) => !!column.defaultSortOrder,
    );
    if (!seed) return undefined;
    const field = sortKeyOf(seed.column, seed.key);
    return seed.column.defaultSortOrder === 'descend' ? `-${field}` : field;
  });
  const activeOrder = isOrderControlled ? order : uncontrolledOrder;

  const sortedRows = ((): Array<RecordType> => {
    const source = dataSource ? [...dataSource] : [];
    if (isOrderControlled || !activeOrder) return source;
    const isDescending = activeOrder.startsWith('-');
    const field = isDescending ? activeOrder.slice(1) : activeOrder;
    const sorter = _.find(
      flatColumns,
      ({ key, column }) => sortKeyOf(column, key) === field,
    )?.column?.sorter;
    const compare =
      typeof sorter === 'function'
        ? sorter
        : sorter && typeof sorter === 'object'
          ? sorter.compare
          : undefined;
    if (!compare) return source;
    return source.sort((a, b) =>
      isDescending ? -compare(a, b, 'descend') : compare(a, b, 'ascend'),
    );
  })();

  /* ---- pagination -------------------------------------------------------- */

  const [currentPage, setCurrentPage] = useControllableValue<number>(
    pagination ? pagination : {},
    {
      valuePropName: 'current',
      defaultValuePropName: 'defaultCurrent',
      defaultValue: 1,
      trigger: 'no-trigger',
    },
  );
  const [currentPageSize, setCurrentPageSize] = useControllableValue<number>(
    pagination ? pagination : {},
    {
      valuePropName: 'pageSize',
      defaultValuePropName: 'defaultPageSize',
      defaultValue: 10,
      trigger: 'no-trigger',
    },
  );

  const total = pagination
    ? (pagination.total ?? sortedRows.length)
    : sortedRows.length;

  // Filtering can shrink the list under the page the user is on; clamp for
  // display instead of setting state during render, as antd's `usePagination`
  // does.
  const activePage = _.clamp(
    currentPage,
    1,
    Math.max(1, Math.ceil(total / currentPageSize)),
  );

  // The UNclamped page is what the caller's state / URL still holds. `total: 0`
  // is "no data", not an invalid page (FR-3703).
  const isPageOutOfRange =
    pagination !== false &&
    total > 0 &&
    (currentPage < 1 || currentPage > Math.ceil(total / currentPageSize));

  // A `total` larger than the rows we were handed is the caller declaring them
  // already sliced server-side, so honour that and never re-slice — otherwise
  // a page past the first indexes past the end and renders nothing.
  const isServerSliced = total > sortedRows.length;
  const rows =
    pagination !== false &&
    !isServerSliced &&
    sortedRows.length > currentPageSize
      ? sortedRows.slice(
          (activePage - 1) * currentPageSize,
          activePage * currentPageSize,
        )
      : sortedRows;

  /* ---- expandable -------------------------------------------------------- */

  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] = useState<
    Array<React.Key>
  >(() => [...(expandable?.defaultExpandedRowKeys ?? [])]);

  const expandedKeys = expandable?.expandedRowKeys
    ? expandable.expandedRowKeys
    : uncontrolledExpandedKeys;
  const expandedKeySet = new Set(_.map(expandedKeys, String));

  const hasExpandable = !!expandable?.expandedRowRender;
  const expandColumnWidth =
    expandable?.columnWidth ??
    (rowSelection
      ? EXPAND_COLUMN_WIDTH_AFTER_SELECTION
      : EXPAND_COLUMN_WIDTH_FIRST);
  /** Detail rows start where the first data column does: past the selection
   * and chevron columns. */
  const detailInsetStart =
    (rowSelection ? SELECTION_COLUMN_WIDTH : 0) + expandColumnWidth;

  const toggleExpanded = (key: string) => {
    const next = expandedKeySet.has(key)
      ? _.filter(expandedKeys, (k) => String(k) !== key)
      : [...expandedKeys, key];
    if (!expandable?.expandedRowKeys) setUncontrolledExpandedKeys(next);
    expandable?.onExpandedRowsChange?.(next);
  };

  /** Row index of the ORIGINAL record, needed by antd-shaped `render`. */
  const rowIndexByKey = new Map<string, number>();
  _.forEach(rows, (record, index) =>
    rowIndexByKey.set(getRowKey(record), index),
  );

  /**
   * The data actually handed to Astryx: the real rows with a synthetic detail
   * row interleaved after every expanded one. Detail rows are ordinary objects
   * carrying a marker field; the expansion plugin recognises them and replaces
   * their cells with a single full-span `<td>`.
   */
  const astryxData = ((): Array<AnyRow> => {
    if (!hasExpandable) return rows as Array<AnyRow>;
    const out: Array<AnyRow> = [];
    _.forEach(rows, (record) => {
      out.push(record as AnyRow);
      const key = getRowKey(record);
      if (
        expandedKeySet.has(key) &&
        (expandable?.rowExpandable?.(record) ?? true)
      ) {
        out.push({ [DETAIL_ROW_MARKER]: key, id: `${key}__detail` });
      }
    });
    return out;
  })();

  // Built from the FULL list, not the page: `emitSelection` resolves selected
  // keys through it, and `preserveSelectedRowKeys` keeps keys from other pages.
  const recordByKey = new Map<string, RecordType>();
  _.forEach(sortedRows, (record) => recordByKey.set(getRowKey(record), record));

  /* ---- Astryx columns ---------------------------------------------------- */

  const astryxColumns = ((): Array<TableColumn<AnyRow>> => {
    const built: Array<TableColumn<AnyRow>> = [];

    if (hasExpandable) {
      built.push({
        key: EXPAND_COLUMN_KEY,
        header: expandable?.columnTitle ?? '',
        width: pixel(expandColumnWidth),
        resizable: false,
        renderCell: (item) => {
          if (isDetailRow(item)) return null;
          const record = item as RecordType;
          if (!(expandable?.rowExpandable?.(record) ?? true)) return null;
          const key = getRowKey(record);
          const isExpanded = expandedKeySet.has(key);
          return (
            <IconButton
              label={String(t('comp:BAITable.ExpandRow'))}
              icon={isExpanded ? <ChevronDown /> : <ChevronRight />}
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(key)}
            />
          );
        },
      });
    }

    _.forEach(flatColumns, ({ key, column, groupTitle }) => {
      const width = column.width;
      const persistedWidth = columnWidths[key];
      const numericWidth =
        typeof persistedWidth === 'number'
          ? persistedWidth
          : typeof width === 'number'
            ? width
            : undefined;

      // Header text is clipped, not overflowed. Astryx puts a plain-string
      // `header` straight into the `<th>` (which is `overflow: visible`), so a
      // label longer than its column — `Sudo Session Enabled` in a 120px
      // column on the user list — visibly runs over the NEXT header instead of
      // truncating. Wrapping it restores the documented "header cells always
      // truncate" behaviour without reaching into any design-system class.
      const header = (
        <span
          style={{
            display: 'block',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {groupTitle == null ? (
            renderTitle(column)
          ) : (
            <VStack gap={0} align="start">
              <Text type="supporting" color="secondary">
                {groupTitle}
              </Text>
              <span>{renderTitle(column)}</span>
            </VStack>
          )}
        </span>
      );

      // x mode: a width-less column carries NO width so its content sizes it;
      // `column.minWidth` is deliberately ignored there (FR-3500).
      const astryxWidth =
        numericWidth != null
          ? pixel(numericWidth)
          : isScrollX
            ? undefined
            : proportional(
                1,
                typeof column.minWidth === 'number'
                  ? { minWidth: column.minWidth }
                  : undefined,
              );

      built.push({
        key,
        header,
        align: toAstryxAlign(column.align),
        sortable: column.sorter ? { sortKey: sortKeyOf(column, key) } : false,
        resizable: resizable,
        width: astryxWidth,
        renderCell: (item) => {
          if (isDetailRow(item)) return null;
          const record = item as RecordType;
          const value = readDataIndex(record, column.dataIndex);
          const content = column.render
            ? (column.render(
                value,
                record,
                rowIndexByKey.get(getRowKey(record)) ?? 0,
              ) as ReactNode)
            : value == null || value === ''
              ? null
              : String(value);
          // Over budget deliberately: external constraint (Astryx's own plugin
          // CSS) + a measured value. See comment-density.md.
          //
          // Body cells are clipped by the same wrapper the header above uses,
          // and for the same reason one rung down (FR-3482 QA finding Q-18).
          //
          // Astryx DOES clip at the cell — `overflowStyles.cell` sets
          // `overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
          // max-width:0` when `textOverflow="truncate"`, which this component
          // requests. But two of its own plugins then re-declare
          // `overflow: visible` on that same cell so their decoration can bleed
          // out: `useTableStickyColumns` for the pinned-column shadow, and
          // `useTableColumnResize` for the full-height drag handle. Only
          // `overflow` is cancelled — `white-space: nowrap` and `max-width: 0`
          // survive, so the content has a non-wrapping zero-width box with
          // nothing clipping it and paints sideways over the next column.
          // `text-overflow: ellipsis` is inert without `overflow: hidden`.
          //
          // Measured on the session scheduling-history nested table: the pinned
          // `step` cell escaped its box by +30px onto `result`, while an
          // identically sized NON-pinned cell with 255px of overflow escaped by
          // 0. Same on `/agent`'s pinned `row_id`.
          //
          // Wrapping the CONTENT rather than re-clipping the cell keeps the
          // plugins' bleed working: the shadow and the drag handle are painted
          // by the cell, not by this span.
          if (textOverflow !== 'truncate' || content == null) return content;
          return (
            <span
              style={{
                display: 'block',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {content}
            </span>
          );
        },
      });
    });

    return built;
  })();

  /* ---- visibility + order (feeds the columnSettings plugin) -------------- */

  const activeColumnKeys = ((): Array<string> => {
    const visible = tableSettings
      ? _.filter(flatColumns, ({ key, column }) =>
          isColumnVisible(column, key, effectiveColumnOverrides),
        )
      : flatColumns;
    const ordered = isColumnReorderEnabled
      ? _.sortBy(
          visible,
          ({ key }) =>
            effectiveColumnOverrides[key]?.order ?? Number.MAX_SAFE_INTEGER,
        )
      : visible;
    return [
      ...(hasExpandable ? [EXPAND_COLUMN_KEY] : []),
      ..._.map(ordered, ({ key }) => key),
    ];
  })();

  const columnSettingsPlugin = useTableColumnSettings<AnyRow>({
    columns: [
      ...(hasExpandable
        ? [
            {
              key: EXPAND_COLUMN_KEY,
              label: '',
              isAlwaysVisible: true,
            },
          ]
        : []),
      ..._.map(flatColumns, (flat) => ({
        key: flat.key,
        label: columnPlainLabel(flat),
        isAlwaysVisible: !!flat.column.required,
      })),
    ],
    activeColumnKeys,
    // The settings MODAL owns the write path (it also has to preserve `order`
    // and `width`), so the plugin's own mutation callback is a no-op.
    onChangeActiveColumnKeys: _.noop,
  });

  /* ---- sticky (antd column-level `fixed`) -------------------------------- */

  // antd pins per column; Astryx pins a contiguous RUN from each edge, so only
  // the last `fixed: 'left'` / first `fixed: 'right'` key matters. The
  // synthetic selection / expand columns sit before every user column, so they
  // ride along with the start run automatically.
  const stickyConfig = ((): {
    startKeys?: Array<string>;
    endKeys?: Array<string>;
  } => {
    if (!sticky) return {};
    const orderedKeys = _.without(activeColumnKeys, EXPAND_COLUMN_KEY);
    const columnByKey = _.keyBy(flatColumns, 'key');
    const startKeys: Array<string> = [];
    for (const key of orderedKeys) {
      const fixed = columnByKey[key]?.column?.fixed;
      if (fixed === 'left' || fixed === true) startKeys.push(key);
      else break;
    }
    const endKeys: Array<string> = [];
    for (const key of [...orderedKeys].reverse()) {
      if (columnByKey[key]?.column?.fixed === 'right') endKeys.unshift(key);
      else break;
    }
    if (_.isEmpty(startKeys) && _.isEmpty(endKeys)) return {};
    return {
      startKeys: _.isEmpty(startKeys)
        ? undefined
        : [
            ...(rowSelection ? [SELECTION_COLUMN_KEY] : []),
            ...(hasExpandable ? [EXPAND_COLUMN_KEY] : []),
            ...startKeys,
          ],
      endKeys: _.isEmpty(endKeys) ? undefined : endKeys,
    };
  })();

  const stickyPlugin = useTableStickyColumns<AnyRow>(stickyConfig);

  /* ---- per-cell / per-row escape hatches (antd `onCell` / `onRow`) ------- */

  const cellRowPlugin: TablePlugin<AnyRow> = {
    transformBodyCell: (props, column, item) => {
      if (isDetailRow(item)) return props;
      const source = _.find(flatColumns, { key: column.key })?.column;
      const extra = source?.onCell?.(item as RecordType, 0);
      if (!extra) return props;
      return {
        ...props,
        htmlProps: {
          ...props.htmlProps,
          ...(extra as React.TdHTMLAttributes<HTMLTableCellElement>),
          style: {
            ...props.htmlProps.style,
            ...(extra as { style?: React.CSSProperties }).style,
          },
        },
      };
    },
    transformBodyRow: (props, item) => {
      if (!onRow || isDetailRow(item)) return props;
      const record = item as RecordType;
      const extra = onRow(record, rowIndexByKey.get(getRowKey(record)));
      if (!extra) return props;
      return {
        ...props,
        htmlProps: {
          ...props.htmlProps,
          ...extra,
          style: { ...props.htmlProps.style, ...extra.style },
        },
      };
    },
  };

  /* ---- x-mode per-column max-width release ------------------------------- */

  // Astryx clips cells with `max-width: 0`; x mode releases width-LESS columns
  // only, so pixel/resized columns keep truncating (the header release also
  // cancels the stray % width `resolveColumnWidths` hands width-less columns).
  const scrollXPlugin: TablePlugin<AnyRow> = {
    transformHeaderCell: (props, column) =>
      column.width != null ? props : mergeCellStyle(props, X_HEADER_RELEASE),
    transformBodyCell: (props, column) =>
      column.width != null ? props : mergeCellStyle(props, X_BODY_RELEASE),
  };

  /* ---- y-mode pinned-header z-order restore ------------------------------ */

  const hasPinnedColumns = !!(stickyConfig.startKeys || stickyConfig.endKeys);

  const scrollYPlugin: TablePlugin<AnyRow> = (() => {
    const pinned = new Set([
      ...(stickyConfig.startKeys ?? []),
      ...(stickyConfig.endKeys ?? []),
    ]);
    return {
      transformHeaderCell: (props, column) =>
        pinned.has(column.key)
          ? mergeCellStyle(props, Y_PINNED_HEADER_STACK)
          : props,
    };
  })();

  /* ---- sorting ----------------------------------------------------------- */

  const sortState: TableSortState = ((): TableSortState => {
    if (!activeOrder) return [];
    const isDescending = activeOrder.startsWith('-');
    return [
      {
        sortKey: isDescending ? activeOrder.slice(1) : activeOrder,
        direction: isDescending ? 'descending' : 'ascending',
      },
    ];
  })();

  const sortPlugin = useTableSortable<AnyRow>({
    sort: sortState,
    allowUnsortedState: true,
    onSortChange: (next) => {
      const first = next[0];
      const nextOrder = !first
        ? undefined
        : first.direction === 'descending'
          ? `-${first.sortKey}`
          : first.sortKey;
      if (isOrderControlled) onChangeOrder?.(nextOrder);
      else setUncontrolledOrder(nextOrder);
    },
  });

  /* ---- selection --------------------------------------------------------- */

  const selectedKeySet = new Set(
    _.map(rowSelection?.selectedRowKeys ?? [], String),
  );

  const emitSelection = (keys: Array<string>) => {
    const selectedRows = _.compact(_.map(keys, (key) => recordByKey.get(key)));
    rowSelection?.onChange?.(keys, selectedRows);
  };

  const selectionPlugin = useTableSelection<AnyRow>({
    getIsItemSelectable: (item) => !isDetailRow(item),
    getIsItemSelected: (item) =>
      !isDetailRow(item) && selectedKeySet.has(getRowKey(item as RecordType)),
    getIsItemEnabled: (item) =>
      isDetailRow(item)
        ? false
        : !rowSelection?.getCheckboxProps?.(item as RecordType)?.disabled,
    getRowLabel: (item) =>
      isDetailRow(item)
        ? ''
        : (rowSelection?.getRowLabel?.(item as RecordType) ??
          getRowKey(item as RecordType)),
    getIsAllSelected: () =>
      rows.length > 0 &&
      _.every(rows, (record) => selectedKeySet.has(getRowKey(record))),
    getIsIndeterminate: () =>
      _.some(rows, (record) => selectedKeySet.has(getRowKey(record))) &&
      !_.every(rows, (record) => selectedKeySet.has(getRowKey(record))),
    onSelectItem: ({ item, isSelected }) => {
      if (isDetailRow(item)) return;
      const key = getRowKey(item as RecordType);
      const next = new Set(selectedKeySet);
      if (isSelected) next.add(key);
      else next.delete(key);
      emitSelection(Array.from(next));
    },
    onSelectAll: ({ isAllSelected }) => {
      // `preserveSelectedRowKeys` keeps rows selected on other pages, matching
      // antd's flag of the same name.
      const next = new Set(
        rowSelection?.preserveSelectedRowKeys ? selectedKeySet : [],
      );
      _.forEach(rows, (record) => {
        const key = getRowKey(record);
        if (isAllSelected) next.add(key);
        else next.delete(key);
      });
      emitSelection(Array.from(next));
    },
  });

  /* ---- resize ------------------------------------------------------------ */

  const resizePlugin = useTableColumnResize<AnyRow>({
    columns: astryxColumns,
    columnWidths,
    minWidth: 60,
    onColumnResizeEnd: handleColumnResizeEnd,
  });

  /* ---- expansion (custom plugin) ----------------------------------------- */

  const renderedColumnCount = activeColumnKeys.length + (rowSelection ? 1 : 0);

  const expansionPlugin: TablePlugin<AnyRow> = {
    transformBodyRow: (props, item) => {
      if (!isDetailRow(item)) return props;
      const parentKey = String(item[DETAIL_ROW_MARKER]);
      const record = recordByKey.get(parentKey);
      if (!record) return props;
      const index = rowIndexByKey.get(parentKey) ?? 0;
      return {
        ...props,
        children: (
          <td
            colSpan={renderedColumnCount}
            style={{
              padding: token.paddingSM,
              paddingInlineStart: detailInsetStart,
            }}
          >
            {expandable?.expandedRowRender?.(record, index)}
          </td>
        ),
      };
    },
  };

  /* ---- plugin record ----------------------------------------------------- */

  /**
   * Give the injected selection column room for its checkbox: the plugin's
   * default 36px leaves 4px of content box, so the 20px checkbox overhangs
   * 8px each side. Measured on sessions / admin-users: checkbox left 280 vs a
   * card content edge of 287 (FR-3482 QA finding Q-14).
   *
   * 24 (Astryx first-column inset) + 20 (checkbox) + 8 (trailing pad) = 52.
   */
  const selectionWidthPlugin: TablePlugin<AnyRow> = {
    transformColumns: (cols) =>
      _.map(cols, (column) =>
        column.key === SELECTION_COLUMN_KEY
          ? { ...column, width: pixel(SELECTION_COLUMN_WIDTH) }
          : column,
      ),
  };

  const plugins = ((): Record<string, TablePlugin<AnyRow>> => {
    const next: Record<string, TablePlugin<AnyRow>> = {
      // Canonical Astryx order is columnSettings -> sort -> tree -> selection
      // -> pagination; unknown names (here `resize` / `expansion`) run last.
      columnSettings: columnSettingsPlugin,
      sort: sortPlugin,
    };
    if (rowSelection) {
      next.selection = selectionPlugin;
      next.selectionWidth = selectionWidthPlugin;
    }
    if (resizable) next.resize = resizePlugin;
    next.sticky = stickyPlugin;
    // Before `cellRow`, so a consumer's `onCell` style still has the last word.
    if (isScrollX) next.scrollX = scrollXPlugin;
    // Without pinned columns the y plugin has nothing to lift; the sticky
    // header itself is pure CSS.
    if (isScrollY && hasPinnedColumns) next.scrollY = scrollYPlugin;
    next.cellRow = cellRowPlugin;
    if (hasExpandable) next.expansion = expansionPlugin;
    return next;
  })();

  // Split the BUI-only keys out; anything left in `paginationRest` is a real
  // `Pagination` prop and is forwarded as-is. The keys this bar computes
  // itself (`pageSize`, `pageSizeOptions`, `size`) stay in — the explicit
  // props after the spread win.
  const {
    current: _current,
    defaultCurrent: _defaultCurrent,
    defaultPageSize: _defaultPageSize,
    total: _total,
    onChange: _onChange,
    showSizeChanger: _showSizeChanger,
    hideOnSinglePage: _hideOnSinglePage,
    extraContent: _extraContent,
    ...paginationRest
  } = pagination || {};

  const rangeStart = total === 0 ? 0 : (activePage - 1) * currentPageSize + 1;
  const rangeEnd = Math.min(activePage * currentPageSize, total);

  const isDimmed = !!loading || !!spinnerLoading;

  // antd `hideOnSinglePage`: the pager (not the settings / export buttons)
  // disappears while everything fits on one page.
  const isPagerVisible =
    pagination !== false &&
    !(pagination?.hideOnSinglePage && total <= currentPageSize);

  const hasBottomBar = isPagerVisible || !!tableSettings || !!exportSettings;

  // Astryx's built-in empty state reads from ITS OWN message catalog
  // (`@astryx.table.noData`), which ships en/fr only — hence English under a
  // Korean UI. Owning the node moves the copy onto BUI's catalog and restores
  // the icon. `false` opts out; a ReactNode override passes through unwrapped.
  const resolvedEmptyState = emptyState ?? locale?.emptyText;
  const emptyStateNode = isPageOutOfRange ? (
    // Product decision (FR-3703): the recovery affordance outranks any
    // caller-provided empty node, `false` included.
    <EmptyState
      isCompact
      icon={<Icon icon={Inbox} size="lg" color="secondary" />}
      title={String(t('comp:BAITable.InvalidPageNumber'))}
      actions={
        <Button
          variant="primary"
          label={String(t('comp:BAITable.GoToFirstPage'))}
          onClick={() => {
            setCurrentPage(1);
            pagination?.onChange?.(1, currentPageSize);
          }}
        />
      }
    />
  ) : resolvedEmptyState === false ? (
    false
  ) : resolvedEmptyState == null || typeof resolvedEmptyState === 'string' ? (
    <EmptyState
      isCompact
      icon={<Icon icon={Inbox} size="lg" color="secondary" />}
      title={resolvedEmptyState ?? String(t('comp:BAITable.NoDataToDisplay'))}
    />
  ) : (
    resolvedEmptyState
  );

  return (
    <div className={className} style={style}>
      {/* PILOT-DECISION: antd's loading overlay (dim + centred spinner over the
          existing rows) has no Astryx equivalent. Dimming preserves "old data
          stays readable while refetching"; the spinner is lost. The wrapper
          holds ONLY the table — Astryx's scroll wrapper claims the full block,
          so a bottom bar inside it overlaps the last row.

          qa2-c: holding only the table also makes Astryx's scroll wrapper the
          wrapper's ONLY child, which is why it needs the block-bleed reset
          below — see BAITable.css. */}
      <div
        aria-busy={isDimmed || undefined}
        className={classNames(
          // Cancels Astryx's BLOCK-axis container bleed. See
          // BAITable.css for why this dim wrapper makes the bleed
          // misfire; without it every table page overlaps its filter row and
          // its pagination bar by 24px.
          'bai-table-astryx-dim-layer',
          !showHeader && 'bai-table-astryx-no-header',
          // dividers="grid" already draws real column borders; the header
          // split would double them. See BAITable.css.
          !bordered && 'bai-table-astryx-header-split',
          isScrollX && 'bai-table-astryx-scroll-x',
          isScrollY && 'bai-table-astryx-scroll-y',
        )}
        style={
          {
            transition: 'opacity .2s ease',
            ...(isDimmed ? { opacity: 0.5, pointerEvents: 'none' } : null),
            ...(isScrollX ? { '--bai-table-scroll-x': scrollXWidth } : null),
            ...(isScrollY ? { '--bai-table-scroll-y': scrollYHeight } : null),
          } as React.CSSProperties
        }
      >
        <Table<AnyRow>
          {...restTableProps}
          data={astryxData}
          columns={astryxColumns}
          idKey={(item: AnyRow) =>
            isDetailRow(item)
              ? `${String(item[DETAIL_ROW_MARKER])}__detail`
              : getRowKey(item as RecordType)
          }
          density={DENSITY_BY_SIZE[size] ?? 'compact'}
          dividers={bordered ? 'grid' : 'rows'}
          isStriped={isStriped}
          hasHover={hasHover}
          textOverflow={textOverflow}
          verticalAlign={verticalAlign}
          emptyState={emptyStateNode}
          rowCount={total || undefined}
          rowIndexStart={
            pagination !== false
              ? (activePage - 1) * currentPageSize + 1
              : undefined
          }
          plugins={plugins}
        />
      </div>

      {hasBottomBar ? (
        <HStack
          justify="end"
          align="center"
          gap={2}
          // Legacy rhythm (qa2-c): the antd `BAITable` root was
          // `<BAIFlex direction="column" gap="sm">` wrapping [table,
          // pagination row], i.e. a 12px table->pagination gap. `marginXS`
          // (8px) shrank it; `marginSM` restores the measured legacy value.
          style={{ marginTop: token.marginSM }}
        >
          {isPagerVisible ? (
            <>
              <Text type="supporting" color="secondary">
                <BAIPaginationInfoText
                  start={rangeStart}
                  end={rangeEnd}
                  total={total}
                />
              </Text>
              <Pagination
                variant="pages"
                {...paginationRest}
                page={activePage}
                pageSize={currentPageSize}
                totalItems={total}
                // Astryx renders the size selector exactly when options are
                // supplied, so antd's `showSizeChanger={false}` is "no options".
                pageSizeOptions={
                  pagination && pagination.showSizeChanger === false
                    ? undefined
                    : (pagination?.pageSizeOptions ?? [10, 20, 50])
                }
                size={pagination?.size ?? 'sm'}
                label={String(t('comp:BAITable.Pagination'))}
                onChange={(page) => {
                  setCurrentPage(page);
                  pagination?.onChange?.(page, currentPageSize);
                }}
                onPageSizeChange={(pageSize) => {
                  setCurrentPage(1);
                  setCurrentPageSize(pageSize);
                  pagination?.onChange?.(1, pageSize);
                }}
              />
            </>
          ) : null}
          {tableSettings ? (
            <IconButton
              label={String(t('comp:BAITable.SettingTable'))}
              icon={<Settings />}
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingModalOpen(true)}
            />
          ) : null}
          {exportSettings ? (
            <IconButton
              label={String(t('comp:BAITable.ExportCSV'))}
              icon={<FileDown />}
              variant="ghost"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
            />
          ) : null}
          {pagination !== false ? pagination?.extraContent : null}
        </HStack>
      ) : null}

      {tableSettings ? (
        <BAIUnmountAfterClose>
          <BAITableSettingModal
            open={isSettingModalOpen}
            columns={_.map(flatColumns, (flat) => ({
              key: flat.key,
              label: columnPlainLabel(flat),
              required: !!flat.column.required,
            }))}
            visibleColumnKeys={_.without(activeColumnKeys, EXPAND_COLUMN_KEY)}
            disableReorder={!isColumnReorderEnabled}
            onRequestClose={(result) => {
              setIsSettingModalOpen(false);
              if (!result) return;
              const naturalOrder = _.map(flatColumns, ({ key }) => key);
              const isReordered =
                isColumnReorderEnabled &&
                !_.isEqual(result.columnOrder, naturalOrder);
              const next: Record<string, BAITableColumnOverrideItem> = {};
              _.forEach(flatColumns, ({ key, column }) => {
                const override: BAITableColumnOverrideItem = {};
                const shouldBeVisible = _.includes(
                  result.selectedColumnKeys,
                  key,
                );
                if (shouldBeVisible === !!column.defaultHidden) {
                  override.hidden = !shouldBeVisible;
                }
                if (isReordered) {
                  const orderIndex = _.indexOf(result.columnOrder, key);
                  if (orderIndex !== -1) override.order = orderIndex;
                }
                // Resized widths are persisted in the same record; a settings
                // save must not silently reset them.
                const persistedWidth = effectiveColumnOverrides[key]?.width;
                if (typeof persistedWidth === 'number') {
                  override.width = persistedWidth;
                }
                if (!_.isEmpty(override)) next[key] = override;
              });
              setColumnOverrides(next);
            }}
          />
        </BAIUnmountAfterClose>
      ) : null}

      {exportSettings ? (
        <BAIUnmountAfterClose>
          <BAITableColumnCSVExportModal
            open={isExportModalOpen}
            onRequestClose={() => setIsExportModalOpen(false)}
            columns={_.map(flatColumns, ({ column }) => column)}
            supportedFields={exportSettings.supportedFields}
            onExport={exportSettings.onExport}
          />
        </BAIUnmountAfterClose>
      ) : null}
    </div>
  );
};

export default BAITable;

/** Re-exported so a migrated call site does not need a second import. */
export type { BAIColumnType, BAIColumnsType };
