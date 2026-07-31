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
  'expand-all' | 'collapse-all' | 'errors-only';

export const DEFAULT_SCHEDULING_HISTORY_EXPAND_MODE: SchedulingHistoryExpandMode =
  'errors-only';

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
   * Header content for the expand-icon column: a kebab (vertical ellipsis)
   * hover menu offering the three view actions (expand all / collapse all /
   * expand errors only). It reads as an action menu, not a stateful toggle, so
   * there is no "active" indication. `null` when no row in the current data set
   * is expandable. Per-row rows keep Ant Design's default +/- expand icon.
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

  // Manual per-row toggles persist until a refetch (data signature) or a
  // `mode` change re-applies the master mode.
  const [prevDataSignature, setPrevDataSignature] = useState(dataSignature);
  const [prevMode, setPrevMode] = useState(mode);
  if (dataSignature !== prevDataSignature || mode !== prevMode) {
    setPrevDataSignature(dataSignature);
    setPrevMode(mode);
    setExpandedRowKeys(computeExpandedRowKeysForMode(dataSource, mode));
  }

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
  ).map((m) => ({ key: m, label: modeLabel[m] }));

  const onMenuClick = ({ key }: { key: string }) => {
    const next = key as SchedulingHistoryExpandMode;
    // Apply eagerly so the uncontrolled case (no onModeChange) still reacts. In
    // the controlled case onModeChange updates `mode`, and the `[mode]` effect
    // re-applies the same (idempotent) keys — a harmless redundant set.
    setExpandedRowKeys(computeExpandedRowKeysForMode(dataSource, next));
    options?.onModeChange?.(next);
  };

  const expandColumnTitle =
    expandableRowKeys.length > 0 ? (
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
    expandColumnTitle,
  };
};

export default useSchedulingHistoryExpandable;
