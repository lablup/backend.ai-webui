import { SchedulingResult } from '../components/BAISchedulingResultBadge';
import { useBAIi18n } from './useBAIi18n';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@astryxdesign/core/DropdownMenu';
import { HStack } from '@astryxdesign/core/Stack';
import * as _ from 'lodash-es';
import { EllipsisVerticalIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

/**
 * Minimal shape shared by every scheduling-history row type
 * (session / deployment / route). A row is expandable when `isExpandable` says
 * so, and it is expanded by default unless its result is a success.
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

const hasAnySubStep = (record: SchedulingHistoryExpandableRow) =>
  !_.isEmpty(record.subSteps);

const computeExpandedRowKeysForMode = (
  dataSource: ReadonlyArray<SchedulingHistoryExpandableRow>,
  mode: SchedulingHistoryExpandMode,
  isExpandable: (record: SchedulingHistoryExpandableRow) => boolean,
): React.Key[] =>
  mode === 'expand-all'
    ? dataSource.filter(isExpandable).map((record) => record.id)
    : mode === 'collapse-all'
      ? []
      : // "Collapse success only": every non-success row that HAS detail stays
        // open by default so failures / retries / expirations are visible at a
        // glance.
        dataSource
          .filter(
            (record) => isExpandable(record) && record.result !== 'SUCCESS',
          )
          .map((record) => record.id);

export interface UseSchedulingHistoryExpandableResult {
  /**
   * The effective master mode (the controlled `mode`, or the default
   * "errors-only" when uncontrolled). It decides which rows start expanded —
   * never what an expanded row shows (FR-3425).
   */
  mode: SchedulingHistoryExpandMode;
  expandedRowKeys: React.Key[];
  onExpandedRowsChange: (expandedKeys: readonly React.Key[]) => void;
  /**
   * Header content for the expand-icon column: a kebab (vertical ellipsis)
   * menu offering the three view actions (expand all / collapse all /
   * expand errors only). It reads as an action menu, not a stateful toggle, so
   * there is no "active" indication. `null` when no row in the current data set
   * is expandable. Individual rows keep the table's default +/- expand icon.
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
    /**
     * Which rows have detail worth opening. Defaults to "has any sub-step",
     * but a caller that can tell a real sub-step from the trailing lifecycle
     * marker should pass the same predicate it gives `rowExpandable`, so the
     * master modes never open a row the table renders as non-expandable.
     */
    isExpandable?: (record: T) => boolean;
  },
): UseSchedulingHistoryExpandableResult => {
  'use memo';
  const { t } = useBAIi18n();

  const mode = options?.mode ?? DEFAULT_SCHEDULING_HISTORY_EXPAND_MODE;
  const isExpandable = (record: SchedulingHistoryExpandableRow) =>
    options?.isExpandable
      ? options.isExpandable(record as T)
      : hasAnySubStep(record);

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>(() =>
    computeExpandedRowKeysForMode(dataSource, mode, isExpandable),
  );

  // The signature changes only on real data changes — not on the new array
  // identity that `filterOutNullAndUndefined(...)` produces every render — so
  // manual per-row toggles persist until the data actually reloads.
  const dataSignature = dataSource
    .map(
      (record) =>
        `${record.id}:${record.result ?? ''}:${isExpandable(record) ? 1 : 0}`,
    )
    .join('|');

  // Manual per-row toggles persist until a refetch (data signature) or a
  // `mode` change re-applies the master mode.
  const [prevDataSignature, setPrevDataSignature] = useState(dataSignature);
  const [prevMode, setPrevMode] = useState(mode);
  if (dataSignature !== prevDataSignature || mode !== prevMode) {
    setPrevDataSignature(dataSignature);
    setPrevMode(mode);
    setExpandedRowKeys(
      computeExpandedRowKeysForMode(dataSource, mode, isExpandable),
    );
  }

  const expandableRowKeys = dataSource
    .filter(isExpandable)
    .map((record) => record.id);

  const onExpandedRowsChange = (expandedKeys: readonly React.Key[]) => {
    setExpandedRowKeys([...expandedKeys]);
  };

  const modeLabel: Record<SchedulingHistoryExpandMode, string> = {
    'expand-all': t('comp:BAITable.ExpandAll'),
    'collapse-all': t('comp:BAITable.CollapseAll'),
    'errors-only': t('comp:BAITable.ExpandErrorsOnly'),
  };

  const applyMode = (next: SchedulingHistoryExpandMode) => {
    // Apply eagerly so the uncontrolled case (no onModeChange) still reacts. In
    // the controlled case onModeChange updates `mode`, and the `[mode]` effect
    // re-applies the same (idempotent) keys — a harmless redundant set.
    setExpandedRowKeys(
      computeExpandedRowKeysForMode(dataSource, next, isExpandable),
    );
    options?.onModeChange?.(next);
  };

  // A kebab (vertical ellipsis) ACTION menu — `DropdownMenuItemData` carries no
  // selected/checked state and none is wanted here: the three modes read as
  // actions you trigger, not a stateful toggle (the antd `Dropdown` it replaced
  // deliberately passed no `selectedKeys` for the same reason).
  const menuItems: Array<DropdownMenuOption> = (
    ['expand-all', 'collapse-all', 'errors-only'] as const
  ).map((m) => ({
    label: modeLabel[m],
    onClick: () => applyMode(m),
  }));

  const expandColumnTitle =
    expandableRowKeys.length > 0 ? (
      // Center the trigger in the header cell so it lines up with the per-row
      // expand icons, which the table centers in their column.
      <HStack justify="center">
        {/* PILOT-DECISION (to-astryx final-B): antd `Dropdown` + `Tooltip` +
            hand-rolled bare `<button>` -> Astryx `DropdownMenu` with a `button`
            config, the same composition `BAINameActionCell` already uses for
            its overflow kebab. The bare button carried its own reset styles and
            a `colorTextSecondary` fix-up; the ghost icon-only `Button` Astryx
            renders supplies focus ring, hit area and hover/pressed states that
            the hand-rolled trigger never had. `trigger={['click']}` is dropped
            because click IS DropdownMenu's only trigger. The tooltip moves onto
            `button.tooltip` (and doubles as the accessible name via `label`),
            so `comp:BAITable.ExpandOptions` and its locale entries stay in
            use. `hasChevron={false}` keeps the kebab from growing a caret. */}
        <DropdownMenu
          items={menuItems}
          button={{
            variant: 'ghost',
            size: 'sm',
            isIconOnly: true,
            icon: <EllipsisVerticalIcon size="1em" />,
            label: t('comp:BAITable.ExpandOptions'),
            tooltip: t('comp:BAITable.ExpandOptions'),
          }}
          hasChevron={false}
        />
      </HStack>
    ) : null;

  return {
    mode,
    expandedRowKeys,
    onExpandedRowsChange,
    expandColumnTitle,
  };
};

export default useSchedulingHistoryExpandable;
