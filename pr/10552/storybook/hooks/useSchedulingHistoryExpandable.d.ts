import { SchedulingResult } from '../components/BAISchedulingResultBadge';
import * as React from 'react';
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
export type SchedulingHistoryExpandMode = 'expand-all' | 'collapse-all' | 'errors-only';
export declare const DEFAULT_SCHEDULING_HISTORY_EXPAND_MODE: SchedulingHistoryExpandMode;
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
export declare const useSchedulingHistoryExpandable: <T extends SchedulingHistoryExpandableRow>(dataSource: ReadonlyArray<T>, options?: {
    mode?: SchedulingHistoryExpandMode;
    onModeChange?: (mode: SchedulingHistoryExpandMode) => void;
    /**
     * Which rows have detail worth opening. Defaults to "has any sub-step",
     * but a caller that can tell a real sub-step from the trailing lifecycle
     * marker should pass the same predicate it gives `rowExpandable`, so the
     * master modes never open a row the table renders as non-expandable.
     */
    isExpandable?: (record: T) => boolean;
}) => UseSchedulingHistoryExpandableResult;
export default useSchedulingHistoryExpandable;
