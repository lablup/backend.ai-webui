import { useBAIi18n } from '../../hooks/useBAIi18n';
import { Tooltip } from 'antd';
import * as _ from 'lodash-es';
import * as React from 'react';
import { useEffect, useEffectEvent, useState } from 'react';

/**
 * Minimal shape shared by every scheduling-history row type
 * (session / deployment / route). A row is expandable when it has sub-steps,
 * and it is expanded by default unless its result is a success.
 */
export interface SchedulingHistoryExpandableRow {
  readonly id: string;
  readonly result?: string | null;
  readonly subSteps?: ReadonlyArray<unknown> | null;
}

const isRowExpandable = (record: SchedulingHistoryExpandableRow) =>
  !_.isEmpty(record.subSteps);

// "Collapse success only": every non-success row stays open by default so
// failures / retries / expirations are visible at a glance.
const shouldExpandByDefault = (record: SchedulingHistoryExpandableRow) =>
  isRowExpandable(record) && record.result !== 'SUCCESS';

const computeDefaultExpandedRowKeys = (
  dataSource: ReadonlyArray<SchedulingHistoryExpandableRow>,
): React.Key[] =>
  dataSource.filter(shouldExpandByDefault).map((record) => record.id);

export interface UseSchedulingHistoryExpandableResult {
  expandedRowKeys: React.Key[];
  onExpandedRowsChange: (expandedKeys: readonly React.Key[]) => void;
  /**
   * Header content for the expand-icon column: an expand-all / collapse-all
   * master toggle. `null` when no row in the current data set is expandable.
   */
  expandColumnTitle: React.ReactNode;
}

/**
 * Controls expand/collapse state for a scheduling-history table.
 *
 * - Initial state ("collapse success only"): rows with sub-steps whose result
 *   is not `SUCCESS` are expanded; success rows stay collapsed.
 * - `expandColumnTitle` renders a master toggle in the expand-column header
 *   that switches between expand-all and collapse-all (binary).
 * - Individual rows remain manually expandable via `onExpandedRowsChange`.
 * - When the underlying data meaningfully changes (e.g. a refetch), the
 *   default ("collapse success only") is re-applied — so a refresh always
 *   returns to the smart default even after the user toggled everything open.
 */
export const useSchedulingHistoryExpandable = <
  T extends SchedulingHistoryExpandableRow,
>(
  dataSource: ReadonlyArray<T>,
): UseSchedulingHistoryExpandableResult => {
  'use memo';
  const { t } = useBAIi18n();

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>(() =>
    computeDefaultExpandedRowKeys(dataSource),
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
    setExpandedRowKeys(computeDefaultExpandedRowKeys(dataSource));
  });

  useEffect(() => {
    resetToDefault();
  }, [dataSignature]);

  const expandableRowKeys = dataSource
    .filter(isRowExpandable)
    .map((record) => record.id);
  const allExpanded =
    expandableRowKeys.length > 0 &&
    expandableRowKeys.every((key) => expandedRowKeys.includes(key));

  const onExpandedRowsChange = (expandedKeys: readonly React.Key[]) => {
    setExpandedRowKeys([...expandedKeys]);
  };

  const toggleAll = () => {
    setExpandedRowKeys(allExpanded ? [] : expandableRowKeys);
  };

  const toggleLabel = allExpanded
    ? t('comp:BAITable.CollapseAll')
    : t('comp:BAITable.ExpandAll');

  // Reuse Ant Design's native row-expand-icon classes so the master toggle is
  // visually identical to the per-row +/- expand icons in the nested table.
  // The +/- glyph is drawn by antd's CSS pseudo-elements on these classes.
  const expandColumnTitle =
    expandableRowKeys.length > 0 ? (
      // Center the toggle in the header cell so it lines up with the
      // per-row expand icons, which Ant Design centers in their column.
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={toggleLabel}>
          <button
            type="button"
            aria-label={toggleLabel}
            onClick={toggleAll}
            className={`ant-table-row-expand-icon ${
              allExpanded
                ? 'ant-table-row-expand-icon-expanded'
                : 'ant-table-row-expand-icon-collapsed'
            }`}
          />
        </Tooltip>
      </div>
    ) : null;

  return { expandedRowKeys, onExpandedRowsChange, expandColumnTitle };
};

export default useSchedulingHistoryExpandable;
