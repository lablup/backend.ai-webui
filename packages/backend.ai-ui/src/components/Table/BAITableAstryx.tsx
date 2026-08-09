/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 25 — the Astryx-native successor to `BAITable`.

 `BAITable` (antd) is a MONOLITH: `columns` / `dataSource` / `rowSelection` /
 `pagination` / `expandable` / sorting are all internal to one component.
 Astryx's `Table` is a PRIMITIVE plus a plugin pipeline — selection, sorting,
 column settings and resizing are each an opt-in hook whose state the CONSUMER
 owns. Nothing here is "ported"; the behaviour is re-assembled.

 ## The migration seam (read this before touching a call site)

 The public prop contract is deliberately kept **antd/BUI-shaped**:
 `columns` (`BAIColumnsType`, i.e. `title`/`dataIndex`/`render`/`sorter`/
 `required`/`defaultHidden`), `dataSource`, `rowKey`, `rowSelection`,
 `pagination`, `expandable`, `order`/`onChangeOrder`, `tableSettings`,
 `exportSettings`. That is the whole point of this file: a consumer moves off
 the antd table by swapping ONE import, not by rewriting its column model.

   - import { BAITable }       from 'backend.ai-ui';  // antd engine (legacy)
   + import { BAITableAstryx } from 'backend.ai-ui';  // Astryx engine

 **Ticket 30-D completed that flip.** All 71 consumers are across, the antd
 engine (`BAITable.tsx` / `BAITableSettingModal.tsx` / `BAITable.css`) is
 deleted, and this is the only table engine in the package. `BAITableProps` is
 kept as an alias of `BAIAstryxTableProps` because ~30 components embed it in
 their own public prop interfaces; the column model and the persisted-override
 shape moved to the engine-neutral `tableTypes.ts`.

 ## The plugin composition

   columnSettings  visibility + display order (BUI `columnOverrides`)
   sort            header sort controls  <-> the `-field` order string
   selection       checkbox column       <-> antd `rowSelection`
   resize          drag-to-resize widths (persisted into `columnOverrides`)
   sticky          column-level `fixed: 'left' | 'right' | true`
   expansion       antd `expandedRowRender` (local plugin, see below)
   cellRow         antd `onCell` / `onRow` escape hatches (local plugin)

 Astryx's canonical plugin order is columnSettings -> sort -> tree ->
 selection -> pagination, with unknown names appended in insertion order — so
 `resize` / `sticky` / `cellRow` / `expansion` run last, which is what they
 want (they read the FINAL column list).

 Pagination is deliberately NOT the `useTablePagination` plugin: BUI's tables
 are server-paginated (the data is already sliced) and BUI renders its own
 bottom bar next to the settings gear. The plugin also hides itself when there
 is a single page, which antd never does.

 ## PILOT-DECISIONs (see the ticket file for the full list)

 - **Multi-level headers** (`columns[].children`) have NO Astryx counterpart —
   there is no `colSpan` header contract. Column groups are FLATTENED and each
   child header renders the group title above it in muted small text. The
   information survives; the spanning cell does not.
 - **`expandedRowRender`** has no Astryx counterpart either (`useTableTreeData`
   / `useTableRowExpansion` only do *inherited-column* child rows). Rebuilt as
   a local plugin: detail rows are interleaved into `data` and the plugin
   replaces that row's cells with a single full-span `<td>`.
 - **`loading`** — antd dims the existing rows under a centred spinner. Astryx
   has no table loading state; the dim + `pointer-events: none` wrapper is
   reproduced, the spinner is not.
 - **`scroll`** is accepted and ignored — Astryx's own scroll wrapper already
   handles horizontal overflow. `scroll.y` (sticky-header body scrolling) is
   DROPPED.
 - **Column-level `fixed`** IS wired, via `useTableStickyColumns` — 40 of the
   74 call sites use it. antd pins per column; Astryx pins a contiguous RUN
   from each edge, so the adapter derives the run from the LEADING
   `fixed: 'left' | true` columns and the TRAILING `fixed: 'right'` ones. A
   `fixed` column in the middle of the table silently stops pinning; no call
   site does that today.
 - **Virtualization is DEFERRED** by an explicit product decision (2026-08-07).
   Do not add it here without re-opening that decision.
*/
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { theme } from '../../theme-shim';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import BAIPaginationInfoText from './BAIPaginationInfoText';
import './BAITableAstryx.css';
import BAITableAstryxSettingModal from './BAITableAstryxSettingModal';
import BAITableColumnCSVExportModal from './BAITableColumnCSVExportModal';
import type {
  BAIAnyObject,
  BAIColumnType,
  BAIColumnsType,
  BAIExportSettings,
  BAITableColumnOverrideItem,
  BAITableSettings,
} from './tableTypes';
import { isColumnVisible } from './tableTypes';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Pagination } from '@astryxdesign/core/Pagination';
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
  TableSortState,
} from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { useControllableValue } from 'ahooks';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import { ChevronDown, ChevronRight, FileDown, Settings } from 'lucide-react';
import React, { useMemo, useState, type ReactNode } from 'react';

/** Internal row shape Astryx's generic constraint requires. */
type AnyRow = Record<string, unknown>;
/**
 * PUBLIC record constraint. Deliberately looser than `AnyRow`: it is the same
 * shape antd's `AnyObject` had, so the ~70 consumers that write
 * `BAITableProps<SomeRelayNode>` keep type-checking unchanged after the flip.
 * Rows are cast to `AnyRow` at the Astryx boundary.
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
/** Marker field placed on the synthetic detail rows. */
const DETAIL_ROW_MARKER = '__bai_detail_for__';

const isDetailRow = (item: unknown): item is Record<string, unknown> =>
  !!item &&
  typeof item === 'object' &&
  DETAIL_ROW_MARKER in (item as Record<string, unknown>);

/* -------------------------------------------------------------------------- */
/* Public prop contract                                                        */
/* -------------------------------------------------------------------------- */

export interface BAIAstryxRowSelection<RecordType> {
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

export interface BAIAstryxPaginationConfig {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  pageSizeOptions?: Array<number>;
  onChange?: (page: number, pageSize: number) => void;
  size?: 'sm' | 'md';
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

export interface BAIAstryxExpandable<RecordType> {
  expandedRowRender?: (record: RecordType, index: number) => ReactNode;
  rowExpandable?: (record: RecordType) => boolean;
  expandedRowKeys?: ReadonlyArray<React.Key>;
  defaultExpandedRowKeys?: ReadonlyArray<React.Key>;
  onExpandedRowsChange?: (expandedKeys: ReadonlyArray<React.Key>) => void;
  /** Header content of the chevron column (the scheduling-history kebab menu). */
  columnTitle?: ReactNode;
  columnWidth?: number;
}

export interface BAIAstryxTableProps<RecordType extends AnyRecord = AnyRecord> {
  columns?: BAIColumnsType<RecordType>;
  dataSource?: ReadonlyArray<RecordType>;
  rowKey?: string | ((record: RecordType) => React.Key);
  /** antd density names, mapped to Astryx `density`. */
  size?: 'small' | 'middle' | 'large';
  /** Dims the rows while a refetch is in flight (no spinner — see header). */
  loading?: boolean;
  /** Kept for prop parity with `BAITable`; behaves like `loading` here. */
  spinnerLoading?: boolean;
  /** Drag-to-resize column borders. */
  resizable?: boolean;
  /** Backend.AI order string, e.g. `-created_at`. */
  order?: string | null;
  onChangeOrder?: (order?: string) => void;
  rowSelection?: BAIAstryxRowSelection<RecordType>;
  pagination?: false | BAIAstryxPaginationConfig;
  tableSettings?: BAITableSettings;
  exportSettings?: BAIExportSettings;
  expandable?: BAIAstryxExpandable<RecordType>;
  /** Rendered in place of the body when `dataSource` is empty. */
  emptyState?: ReactNode | false;
  /** antd parity shim — only `emptyText` is honoured. */
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
  isStriped?: boolean;
  hasHover?: boolean;
  textOverflow?: 'wrap' | 'truncate';
  /** Accepted and ignored — Astryx's scroll wrapper owns overflow. */
  scroll?: unknown;
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
 * True when a column declares no `dataIndex` at all. rc-table treats such a
 * column as "the whole row is the cell value" (see `hasDataIndex` below).
 */
const isMissingDataIndex = (dataIndex: unknown): boolean =>
  dataIndex == null ||
  dataIndex === '' ||
  (Array.isArray(dataIndex) && dataIndex.length === 0);

/**
 * BUG FOUND WHILE CONVERTING (to-astryx approved-2), not a policy choice —
 * recorded so it is not re-introduced. rc-table's `getPathValue` returns the
 * RECORD ITSELF when a column has no `dataIndex`:
 *
 * ```js
 * function getPathValue(record, path) {
 *   if (!path && typeof path !== 'number') return record;  // <- the whole row
 *   ...
 * }
 * ```
 *
 * so under antd `render: (row) => …` on a `dataIndex`-less column is a
 * *correct and widespread* idiom, not a mistake. This table originally
 * returned `undefined` there, silently blanking every such cell (the
 * Environments image-list full-path column rendered as a lone copy button)
 * and throwing outright where the render body dereferenced the row
 * (`BAIArtifactTable`'s controls column). Match rc-table.
 */
const readDataIndex = (record: AnyRow, dataIndex: unknown): unknown => {
  if (isMissingDataIndex(dataIndex)) return record;
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

const renderTitle = (column: { title?: unknown }): ReactNode =>
  typeof column.title === 'function'
    ? (column.title as (props: unknown) => ReactNode)({})
    : (column.title as ReactNode);

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

const BAITableAstryx = <RecordType extends AnyRecord = AnyRecord>({
  columns,
  dataSource,
  rowKey = 'id',
  size = 'small',
  loading,
  spinnerLoading,
  resizable = false,
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
  showHeader = true,
  className,
  style,
}: BAIAstryxTableProps<RecordType>): React.ReactElement => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();

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

  const effectiveColumnOverrides = useMemo(
    () => ({
      ...(tableSettings?.defaultColumnOverrides ?? {}),
      ...(columnOverrides ?? {}),
    }),
    [tableSettings, columnOverrides],
  );

  const isColumnReorderEnabled =
    !!tableSettings && !tableSettings.disableColumnReorder;

  const flatColumns = useMemo(
    () => flattenColumns<RecordType>(columns),
    [columns],
  );

  /* ---- resized widths ---------------------------------------------------- */

  // Widths live in `columnOverrides[key].width` when the table wires
  // `tableSettings` (so a resize survives a reload exactly like a visibility
  // toggle); otherwise they are local component state.
  const [localColumnWidths, setLocalColumnWidths] = useState<
    Record<string, number>
  >({});

  const columnWidths = useMemo(() => {
    if (!tableSettings) return localColumnWidths;
    const fromOverrides: Record<string, number> = {};
    _.forEach(effectiveColumnOverrides, (override, key) => {
      if (typeof override?.width === 'number')
        fromOverrides[key] = override.width;
    });
    return fromOverrides;
  }, [tableSettings, effectiveColumnOverrides, localColumnWidths]);

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
   * Row identity. `rowKey` defaults to `'id'` here, but antd's `Table`
   * defaulted to `'key'` — and 10 call sites relied on that default rather
   * than declaring one. A missing key is not a cosmetic problem: every row
   * would resolve to the string `"undefined"`, which collapses React's
   * reconciliation keys, row selection and expansion onto a single identity
   * (observed live on `ErrorLogList`). So an unresolved lookup falls back to
   * antd's `key`, then `id`, and finally to the row's position.
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

  const rows = useMemo(() => {
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
  }, [dataSource, isOrderControlled, activeOrder, flatColumns]);

  /* ---- expandable -------------------------------------------------------- */

  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] = useState<
    Array<React.Key>
  >(() => [...(expandable?.defaultExpandedRowKeys ?? [])]);

  const expandedKeys = expandable?.expandedRowKeys
    ? expandable.expandedRowKeys
    : uncontrolledExpandedKeys;
  const expandedKeySet = useMemo(
    () => new Set(_.map(expandedKeys, String)),
    [expandedKeys],
  );

  const hasExpandable = !!expandable?.expandedRowRender;

  const toggleExpanded = (key: string) => {
    const next = expandedKeySet.has(key)
      ? _.filter(expandedKeys, (k) => String(k) !== key)
      : [...expandedKeys, key];
    if (!expandable?.expandedRowKeys) setUncontrolledExpandedKeys(next);
    expandable?.onExpandedRowsChange?.(next);
  };

  /** Row index of the ORIGINAL record, needed by antd-shaped `render`. */
  const rowIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    _.forEach(rows, (record, index) => map.set(getRowKey(record), index));
    return map;
    // `getRowKey` is derived from `rowKey`, which is in the dep list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, rowKey]);

  /**
   * The data actually handed to Astryx: the real rows with a synthetic detail
   * row interleaved after every expanded one. Detail rows are ordinary objects
   * carrying a marker field; the expansion plugin recognises them and replaces
   * their cells with a single full-span `<td>`.
   */
  const astryxData = useMemo(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, hasExpandable, expandedKeySet, expandable, rowKey]);

  const recordByKey = useMemo(() => {
    const map = new Map<string, RecordType>();
    _.forEach(rows, (record) => map.set(getRowKey(record), record));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, rowKey]);

  /* ---- Astryx columns ---------------------------------------------------- */

  const astryxColumns = useMemo(() => {
    const built: Array<TableColumn<AnyRow>> = [];

    if (hasExpandable) {
      built.push({
        key: EXPAND_COLUMN_KEY,
        header: expandable?.columnTitle ?? '',
        width: pixel(expandable?.columnWidth ?? 40),
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

      built.push({
        key,
        header,
        align: toAstryxAlign(column.align),
        sortable: column.sorter ? { sortKey: sortKeyOf(column, key) } : false,
        resizable: resizable,
        width:
          numericWidth != null
            ? pixel(numericWidth)
            : proportional(
                1,
                typeof column.minWidth === 'number'
                  ? { minWidth: column.minWidth }
                  : undefined,
              ),
        renderCell: (item) => {
          if (isDetailRow(item)) return null;
          const record = item as RecordType;
          const value = readDataIndex(record, column.dataIndex);
          if (column.render) {
            const index = rowIndexByKey.get(getRowKey(record)) ?? 0;
            return column.render(value, record, index) as ReactNode;
          }
          // Without a `render`, a `dataIndex`-less column has nothing to print
          // — `value` is the record, and `String(record)` would emit
          // "[object Object]". antd would throw on the same input.
          if (isMissingDataIndex(column.dataIndex)) return null;
          return value == null || value === '' ? null : String(value);
        },
      });
    });

    return built;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    flatColumns,
    columnWidths,
    resizable,
    hasExpandable,
    expandable,
    expandedKeySet,
    rowIndexByKey,
    rowKey,
    t,
  ]);

  /* ---- visibility + order (feeds the columnSettings plugin) -------------- */

  const activeColumnKeys = useMemo(() => {
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
  }, [
    flatColumns,
    tableSettings,
    effectiveColumnOverrides,
    isColumnReorderEnabled,
    hasExpandable,
  ]);

  const columnSettingsPlugin = useTableColumnSettings<AnyRow>({
    columns: useMemo(
      () => [
        ...(hasExpandable
          ? [
              {
                key: EXPAND_COLUMN_KEY,
                label: '',
                isAlwaysVisible: true,
              },
            ]
          : []),
        ..._.map(flatColumns, ({ key, column }) => ({
          key,
          label: String(renderTitle(column) ?? key),
          isAlwaysVisible: !!column.required,
        })),
      ],
      [flatColumns, hasExpandable],
    ),
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
  const stickyConfig = useMemo(() => {
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
  }, [sticky, activeColumnKeys, flatColumns, rowSelection, hasExpandable]);

  const stickyPlugin = useTableStickyColumns<AnyRow>(stickyConfig);

  /* ---- per-cell / per-row escape hatches (antd `onCell` / `onRow`) ------- */

  const cellRowPlugin: TablePlugin<AnyRow> = useMemo(
    () => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flatColumns, onRow, rowIndexByKey, rowKey],
  );

  /* ---- sorting ----------------------------------------------------------- */

  const sortState: TableSortState = useMemo(() => {
    if (!activeOrder) return [];
    const isDescending = activeOrder.startsWith('-');
    return [
      {
        sortKey: isDescending ? activeOrder.slice(1) : activeOrder,
        direction: isDescending ? 'descending' : 'ascending',
      },
    ];
  }, [activeOrder]);

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

  const selectedKeySet = useMemo(
    () => new Set(_.map(rowSelection?.selectedRowKeys ?? [], String)),
    [rowSelection],
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

  const expansionPlugin: TablePlugin<AnyRow> = useMemo(
    () => ({
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
                background: token.colorFillQuaternary,
              }}
            >
              {expandable?.expandedRowRender?.(record, index)}
            </td>
          ),
        };
      },
    }),
    [
      recordByKey,
      rowIndexByKey,
      renderedColumnCount,
      expandable,
      token.paddingSM,
      token.colorFillQuaternary,
    ],
  );

  /* ---- plugin record ----------------------------------------------------- */

  const plugins = useMemo(() => {
    const next: Record<string, TablePlugin<AnyRow>> = {
      // Canonical Astryx order is columnSettings -> sort -> tree -> selection
      // -> pagination; unknown names (here `resize` / `expansion`) run last.
      columnSettings: columnSettingsPlugin,
      sort: sortPlugin,
    };
    if (rowSelection) next.selection = selectionPlugin;
    if (resizable) next.resize = resizePlugin;
    next.sticky = stickyPlugin;
    next.cellRow = cellRowPlugin;
    if (hasExpandable) next.expansion = expansionPlugin;
    return next;
  }, [
    columnSettingsPlugin,
    sortPlugin,
    rowSelection,
    selectionPlugin,
    resizable,
    resizePlugin,
    stickyPlugin,
    cellRowPlugin,
    hasExpandable,
    expansionPlugin,
  ]);

  /* ---- pagination -------------------------------------------------------- */

  const [currentPage, setCurrentPage] = useControllableValue<number>(
    pagination ? pagination : {},
    { valuePropName: 'current', defaultValue: 1, trigger: 'no-trigger' },
  );
  const [currentPageSize, setCurrentPageSize] = useControllableValue<number>(
    pagination ? pagination : {},
    { valuePropName: 'pageSize', defaultValue: 10, trigger: 'no-trigger' },
  );

  const total = pagination ? (pagination.total ?? rows.length) : rows.length;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const rangeEnd = Math.min(currentPage * currentPageSize, total);

  const isDimmed = !!loading || !!spinnerLoading;

  // antd `hideOnSinglePage`: the pager (not the settings / export buttons)
  // disappears while everything fits on one page.
  const isPagerVisible =
    pagination !== false &&
    !(pagination?.hideOnSinglePage && total <= currentPageSize);

  const hasBottomBar = isPagerVisible || !!tableSettings || !!exportSettings;

  return (
    <div className={className} style={style}>
      {/* PILOT-DECISION: antd's loading overlay (dim + centred spinner over the
          existing rows) has no Astryx equivalent. Dimming preserves "old data
          stays readable while refetching"; the spinner is lost. The wrapper
          holds ONLY the table — Astryx's scroll wrapper claims the full block,
          so a bottom bar inside it overlaps the last row.

          qa2-c: holding only the table also makes Astryx's scroll wrapper the
          wrapper's ONLY child, which is why it needs the block-bleed reset
          below — see BAITableAstryx.css. */}
      <div
        aria-busy={isDimmed || undefined}
        className={classNames(
          // Cancels Astryx's BLOCK-axis container bleed. See
          // BAITableAstryx.css for why this dim wrapper makes the bleed
          // misfire; without it every table page overlaps its filter row and
          // its pagination bar by 24px.
          'bai-table-astryx-dim-layer',
          !showHeader && 'bai-table-astryx-no-header',
        )}
        style={
          isDimmed
            ? {
                opacity: 0.5,
                pointerEvents: 'none',
                transition: 'opacity .2s ease',
              }
            : { transition: 'opacity .2s ease' }
        }
      >
        <Table<AnyRow>
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
          emptyState={emptyState ?? locale?.emptyText}
          rowCount={total || undefined}
          rowIndexStart={
            pagination !== false
              ? (currentPage - 1) * currentPageSize + 1
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
                page={currentPage}
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
                variant="pages"
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
          <BAITableAstryxSettingModal
            open={isSettingModalOpen}
            columns={_.map(flatColumns, ({ key, column }) => ({
              key,
              label: String(renderTitle(column) ?? key),
              required: !!column.required,
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

export default BAITableAstryx;

/** Re-exported so a migrated call site does not need a second import. */
export type { BAIColumnType, BAIColumnsType };
