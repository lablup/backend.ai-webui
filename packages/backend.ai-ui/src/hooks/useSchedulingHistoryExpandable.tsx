import BAIFlex from '../components/BAIFlex';
import { SchedulingResult } from '../components/BAISchedulingResultBadge';
import { useBAIi18n } from './useBAIi18n';
import { Dropdown, theme, Tooltip } from 'antd';
import * as _ from 'lodash-es';
import { EllipsisVerticalIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

/**
 * Minimal shape shared by every scheduling-history row type
 * (session / deployment / route). A row is expandable when the current mode
 * would render at least one sub-step, and it is expanded by default unless its
 * result is a success.
 *
 * Parent fragments must select `result` on `subSteps` alongside the
 * `BAISubStepNodesFragment` spread — without it Relay's data masking hides the
 * field, and a parent cannot tell what the nested sub-step table will render.
 */
export interface SchedulingHistoryExpandableRow {
  readonly id: string;
  readonly result?: SchedulingResult | '%future added value' | null;
  readonly subSteps?: ReadonlyArray<{
    readonly result?: SchedulingResult | '%future added value' | null;
  } | null> | null;
}

/**
 * The three master modes for the expand-icon column. The mode is controlled by
 * the caller (so it can be persisted across reloads / navigations).
 */
export type SchedulingHistoryExpandMode =
  'expand-all' | 'collapse-all' | 'errors-only';

export const DEFAULT_SCHEDULING_HISTORY_EXPAND_MODE: SchedulingHistoryExpandMode =
  'errors-only';

const hasSubSteps = (record: SchedulingHistoryExpandableRow) =>
  !_.isEmpty(record.subSteps);

// "errors-only" hides successful sub-steps inside the expanded row — the same
// test BAISubStepNodes filters by — so in that mode a row is only expandable
// when at least one sub-step failed. Otherwise the expand icon would open a
// table with nothing in it (FR-3425).
const isRowExpandableInMode = (
  record: SchedulingHistoryExpandableRow,
  mode: SchedulingHistoryExpandMode,
) =>
  mode === 'errors-only'
    ? _.some(record.subSteps, (subStep) => subStep?.result !== 'SUCCESS')
    : hasSubSteps(record);

// "Collapse success only": every non-success row stays open by default so
// failures / retries / expirations are visible at a glance. "expand-all" opens
// every expandable row instead.
const shouldExpandByDefaultInMode = (
  record: SchedulingHistoryExpandableRow,
  mode: SchedulingHistoryExpandMode,
) =>
  isRowExpandableInMode(record, mode) &&
  (mode === 'expand-all' || record.result !== 'SUCCESS');

const computeExpandedRowKeysForMode = (
  dataSource: ReadonlyArray<SchedulingHistoryExpandableRow>,
  mode: SchedulingHistoryExpandMode,
): React.Key[] =>
  mode === 'collapse-all'
    ? []
    : dataSource
        .filter((record) => shouldExpandByDefaultInMode(record, mode))
        .map((record) => record.id);

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
   * Predicate for Ant Design's `expandable.rowExpandable`. It is mode-aware and
   * derived from the same rule as `expandedRowKeys`, so a row never offers an
   * expand icon that would open an empty sub-step table.
   */
  rowExpandable: (record: { readonly id: string }) => boolean;
  /**
   * Header content for the expand-icon column: a kebab (vertical ellipsis)
   * hover menu offering the three view actions (expand all / collapse all /
   * expand errors only). It reads as an action menu, not a stateful toggle, so
   * there is no "active" indication. `null` when no row in the current data set
   * has sub-steps at all — a mode-independent test, so the menu stays reachable
   * even when the active mode leaves every row unexpandable. Per-row rows keep
   * Ant Design's default +/- expand icon.
   */
  expandColumnTitle: React.ReactNode;
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
 * - Individual rows remain manually expandable via `onExpandedRowsChange`, but
 *   only where `rowExpandable` says the active mode has something to show —
 *   in "errors-only" an all-success row offers no expand icon, because the
 *   nested table would filter every one of its sub-steps away.
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
    // Booleans, not counts: expandability only turns on whether the row has
    // *any* sub-step and whether *any* of them failed, so a retry taking the
    // failure count from 1 to 2 must not re-apply the master mode and discard
    // the user's manual toggles.
    .map(
      (record) =>
        `${record.id}:${record.result ?? ''}:${hasSubSteps(record)}:${_.some(
          record.subSteps,
          (subStep) => subStep?.result !== 'SUCCESS',
        )}`,
    )
    .join('|');

  // Manual per-row toggles persist until a refetch (data signature) or a
  // `mode` change re-applies the master mode.
  const [prevDataSignature, setPrevDataSignature] = useState(dataSignature);
  const [prevMode, setPrevMode] = useState(mode);
  if (dataSignature !== prevDataSignature || mode !== prevMode) {
    setPrevDataSignature(dataSignature);
    setPrevMode(mode);
    setExpandedRowKeys(computeExpandedRowKeysForMode(dataSource, mode));
  }

  // Deliberately mode-independent: were this mode-aware, an all-success data set
  // in "errors-only" mode would hide the very menu that switches back to
  // "expand all", leaving the user with no way out of the filtered view.
  const hasAnyExpandableRow = _.some(dataSource, hasSubSteps);

  // Ant Design calls `rowExpandable` once per row, so index the rows instead of
  // scanning `dataSource` on every call.
  const rowsById = new Map(dataSource.map((record) => [record.id, record]));

  const rowExpandable = (record: { readonly id: string }) => {
    const row = rowsById.get(record.id);
    return !!row && isRowExpandableInMode(row, mode);
  };

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
  ).map((m) => ({ key: m, label: modeLabel[m] }));

  const onMenuClick = ({ key }: { key: string }) => {
    const next = key as SchedulingHistoryExpandMode;
    // Apply eagerly so the uncontrolled case (no onModeChange) still reacts. In
    // the controlled case onModeChange updates `mode`, and the `[mode]` effect
    // re-applies the same (idempotent) keys — a harmless redundant set.
    setExpandedRowKeys(computeExpandedRowKeysForMode(dataSource, next));
    options?.onModeChange?.(next);
  };

  const expandColumnTitle = hasAnyExpandableRow ? (
    // Center the trigger in the header cell so it lines up with the
    // per-row expand icons, which Ant Design centers in their column.
    <BAIFlex justify="center">
      <Dropdown
        // Click (not hover) so the menu is operable by keyboard (Enter/Space
        // on the focused trigger) and by touch, not mouse-only.
        trigger={['click']}
        // A kebab (vertical ellipsis) action menu — no `selectedKeys`, so no
        // item is shown as "active". The three modes read as actions you
        // trigger, not a stateful toggle.
        menu={{
          items: menuItems,
          onClick: onMenuClick,
        }}
      >
        {/* Tooltip (not aria-label) surfaces the affordance on hover for
              sighted users; screen-reader support is out of scope for this
              feature. Keeps `comp:BAITable.ExpandOptions` (+ its locale
              entries) in use. */}
        <Tooltip title={t('comp:BAITable.ExpandOptions')}>
          <button
            type="button"
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              padding: 0,
              display: 'inline-flex',
              color: token.colorTextSecondary,
            }}
          >
            <EllipsisVerticalIcon size={token.fontSizeLG} />
          </button>
        </Tooltip>
      </Dropdown>
    </BAIFlex>
  ) : null;

  return {
    mode,
    expandedRowKeys,
    onExpandedRowsChange,
    rowExpandable,
    expandColumnTitle,
  };
};

export default useSchedulingHistoryExpandable;
