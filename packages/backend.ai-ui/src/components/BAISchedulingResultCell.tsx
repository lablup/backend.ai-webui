import BAISchedulingResultBadge, {
  SchedulingResult,
} from './BAISchedulingResultBadge';

/**
 * Minimal sub-step shape. Kept for backward compatibility with callers that
 * still pass a `subSteps` prop; no longer used by this cell.
 */
export interface SchedulingSubStepLike {
  readonly step?: string | null;
  readonly result?: string | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}

export interface BAISchedulingResultCellProps {
  result: SchedulingResult | null;
  /**
   * The row's sub-steps. Currently unused — kept so existing callers do not
   * need to change.
   */
  subSteps?: ReadonlyArray<SchedulingSubStepLike> | null;
}

/**
 * Renders a scheduling `result` badge.
 */
const BAISchedulingResultCell = ({ result }: BAISchedulingResultCellProps) => {
  'use memo';

  return <BAISchedulingResultBadge result={result} />;
};

export default BAISchedulingResultCell;
