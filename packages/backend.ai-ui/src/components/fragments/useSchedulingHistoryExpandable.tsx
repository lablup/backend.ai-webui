import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import { SchedulingResult } from '../BAISchedulingResultBadge';
import { Dropdown, theme, type TableProps } from 'antd';
import * as _ from 'lodash-es';
import {
  type LucideIcon,
  SquareMinusIcon,
  SquarePlusIcon,
  SquareSlashIcon,
} from 'lucide-react';
import * as React from 'react';
import { useEffect, useEffectEvent, useState } from 'react';

/**
 * Minimal shape shared by every scheduling-history row type
 * (session / deployment / route). A row is expandable when it has sub-steps,
 * and it is expanded by default unless its result is a success.
 */
export interface SchedulingHistoryExpandableRow {
  readonly id: string;
  readonly result?: SchedulingResult | '%future added value' | null;
  readonly subSteps?: ReadonlyArray<unknown> | null;
}

/**
 * The three master modes for the expand-icon column. The mode is controlled by
 * the caller (so it can be persisted across reloads / navigations).
 */
export type SchedulingHistoryExpandMode =
  | 'expand-all'
  | 'collapse-all'
  | 'errors-only';

export const DEFAULT_SCHEDULING_HISTORY_EXPAND_MODE: SchedulingHistoryExpandMode =
  'errors-only';

/**
 * The square icon used for each mode. The same lucide square family is reused
 * for the per-row expand/collapse icons (see `getExpandIcon`) so the header
 * control and the table body share one visual language.
 */
const MODE_ICON: Record<SchedulingHistoryExpandMode, LucideIcon> = {
  'expand-all': SquarePlusIcon,
  'collapse-all': SquareMinusIcon,
  'errors-only': SquareSlashIcon,
};

const isRowExpandable = (record: SchedulingHistoryExpandableRow) =>
  !_.isEmpty(record.subSteps);

// "Collapse success only": every non-success row stays open by default so
// failures / retries / expirations are visible at a glance.
const shouldExpandByDefault = (record: SchedulingHistoryExpandableRow) =>
  isRowExpandable(record) && record.result !== 'SUCCESS';

const computeExpandedRowKeysForMode = (
  dataSource: ReadonlyArray<SchedulingHistoryExpandableRow>,
  mode: SchedulingHistoryExpandMode,
): React.Key[] =>
  mode === 'expand-all'
    ? dataSource.filter(isRowExpandable).map((record) => record.id)
    : mode === 'collapse-all'
      ? []
      : dataSource.filter(shouldExpandByDefault).map((record) => record.id);

/** The shape Ant Design expects for a table's `expandable.expandIcon`. */
type ExpandIconRenderer<R> = NonNullable<
  NonNullable<TableProps<R>['expandable']>['expandIcon']
>;

export interface UseSchedulingHistoryExpandableResult {
  /**
   * The effective master mode (the controlled `mode`, or the default
   * "errors-only" when uncontrolled). Callers use this to filter the nested
   * sub-step table to non-success rows when the mode is `errors-only`.
   */
  mode: SchedulingHistoryExpandMode;
  expandedRowKeys: React.Key[];
  onExpandedRowsChange: (expandedKeys: readonly React.Key[]) => void;
  /**
   * Header content for the expand-icon column: a hover dropdown offering the
   * three master modes (expand-all / collapse-all / errors-only). `null` when
   * no row in the current data set is expandable.
   */
  expandColumnTitle: React.ReactNode;
  /**
   * Per-row expand/collapse icon renderer for the table's `expandable.expandIcon`.
   * Renders the same lucide square icons as the header control so both share one
   * visual language. Generic over the table's record type; call it as
   * `getExpandIcon<MyRecord>()` at the `expandable` call site.
   */
  getExpandIcon: <R>() => ExpandIconRenderer<R>;
}

/**
 * Controls expand/collapse state for a scheduling-history table.
 *
 * - Initial state derives from `mode` (default "errors-only"): rows with
 *   sub-steps whose result is not `SUCCESS` are expanded; success rows stay
 *   collapsed.
 * - `expandColumnTitle` renders a hover dropdown in the expand-column header
 *   that switches between the three modes (expand-all / collapse-all /
 *   errors-only).
 * - Individual rows remain manually expandable via `onExpandedRowsChange`.
 * - When the underlying data meaningfully changes (e.g. a refetch), the
 *   current mode is re-applied — so a refresh always returns to the selected
 *   mode even after the user toggled individual rows.
 */
export const useSchedulingHistoryExpandable = <
  T extends SchedulingHistoryExpandableRow,
>(
  dataSource: ReadonlyArray<T>,
  options?: {
    mode?: SchedulingHistoryExpandMode;
    onModeChange?: (mode: SchedulingHistoryExpandMode) => void;
  },
): UseSchedulingHistoryExpandableResult => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();

  const mode = options?.mode ?? DEFAULT_SCHEDULING_HISTORY_EXPAND_MODE;

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>(() =>
    computeExpandedRowKeysForMode(dataSource, mode),
  );

  // The signature changes only on real data changes — not on the new array
  // identity that `filterOutNullAndUndefined(...)` produces every render — so
  // manual per-row toggles persist until the data actually reloads.
  const dataSignature = dataSource
    .map(
      (record) =>
        `${record.id}:${record.result ?? ''}:${isRowExpandable(record) ? 1 : 0}`,
    )
    .join('|');

  const resetToDefault = useEffectEvent(() => {
    setExpandedRowKeys(computeExpandedRowKeysForMode(dataSource, mode));
  });

  useEffect(() => {
    resetToDefault();
  }, [dataSignature]);

  // Re-apply the master mode whenever the controlled mode prop changes so
  // selecting a menu item immediately re-expands / collapses. `dataSource` is
  // read fresh via the effect event without being a reactive dependency.
  const applyMode = useEffectEvent(() => {
    setExpandedRowKeys(computeExpandedRowKeysForMode(dataSource, mode));
  });

  useEffect(() => {
    applyMode();
  }, [mode]);

  const expandableRowKeys = dataSource
    .filter(isRowExpandable)
    .map((record) => record.id);

  const onExpandedRowsChange = (expandedKeys: readonly React.Key[]) => {
    setExpandedRowKeys([...expandedKeys]);
  };

  const modeLabel: Record<SchedulingHistoryExpandMode, string> = {
    'expand-all': t('comp:BAITable.ExpandAll'),
    'collapse-all': t('comp:BAITable.CollapseAll'),
    'errors-only': t('comp:BAITable.ExpandErrorsOnly'),
  };

  const menuItems = (
    ['expand-all', 'collapse-all', 'errors-only'] as const
  ).map((m) => {
    const Icon = MODE_ICON[m];
    return { key: m, icon: <Icon size={14} />, label: modeLabel[m] };
  });

  const onMenuClick = ({ key }: { key: string }) => {
    const next = key as SchedulingHistoryExpandMode;
    setExpandedRowKeys(computeExpandedRowKeysForMode(dataSource, next));
    options?.onModeChange?.(next);
  };

  const CurrentModeIcon = MODE_ICON[mode];

  // Per-row expand/collapse icon: reuses the same square-plus / square-minus
  // glyphs as the header control (a collapsed row offers "expand" → plus; an
  // expanded row offers "collapse" → minus). Colours come from theme tokens so
  // both light and dark mode render correctly.
  const getExpandIcon = <R,>(): ExpandIconRenderer<R> =>
    function SchedulingHistoryExpandIcon({
      expanded,
      onExpand,
      record,
      expandable,
    }) {
      if (!expandable) {
        return null;
      }
      // In errors-only mode an expanded row shows a *filtered* (errors-only)
      // nested table, so its icon is square-slash — matching the header's
      // errors-only glyph — instead of the plain collapse (minus) icon.
      const Icon = expanded
        ? mode === 'errors-only'
          ? SquareSlashIcon
          : SquareMinusIcon
        : SquarePlusIcon;
      return (
        <button
          type="button"
          aria-label={
            expanded ? t('comp:button.Collapse') : t('comp:button.Expand')
          }
          onClick={(e) => onExpand(record, e)}
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            color: token.colorTextSecondary,
          }}
        >
          <Icon size={14} />
        </button>
      );
    };

  const expandColumnTitle =
    expandableRowKeys.length > 0 ? (
      // Center the trigger in the header cell so it lines up with the
      // per-row expand icons, which Ant Design centers in their column.
      <BAIFlex justify="center">
        <Dropdown
          trigger={['hover']}
          menu={{
            items: menuItems,
            onClick: onMenuClick,
            selectedKeys: [mode],
          }}
        >
          <button
            type="button"
            aria-label={modeLabel[mode]}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              padding: 0,
              display: 'inline-flex',
              color: token.colorTextSecondary,
            }}
          >
            <CurrentModeIcon size={14} />
          </button>
        </Dropdown>
      </BAIFlex>
    ) : null;

  return {
    mode,
    expandedRowKeys,
    onExpandedRowsChange,
    expandColumnTitle,
    getExpandIcon,
  };
};

export default useSchedulingHistoryExpandable;
