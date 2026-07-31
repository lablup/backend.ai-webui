import { SchedulingResult } from '../components/BAISchedulingResultBadge';

/**
 * Minimal shape of one scheduling-history sub-step. Parent fragments select
 * `result` alongside the `BAISubStepNodesFragment` spread — without it Relay's
 * data masking hides the field, and a parent cannot tell what the nested
 * sub-step table will actually render.
 */
export interface SchedulingHistoryExpandableSubStep {
  readonly result?: SchedulingResult | '%future added value' | null;
}

/**
 * The rule the "errors-only" view mode applies to sub-steps.
 *
 * It lives here, apart from both users, because two of them must agree:
 * `BAISubStepNodes` filters its rows by this test, and
 * `useSchedulingHistoryExpandable` decides whether a row is worth an expand
 * icon by the same one. The moment those two definitions drift, an expandable
 * row can open onto an empty table again (FR-3425).
 *
 * Deliberately broader than `FAILURE_RESULTS` in `BAISubStepNodes`, which is a
 * styling-only "hard failure" set.
 */
export const isNonSuccessSubStep = (
  subStep: SchedulingHistoryExpandableSubStep | null | undefined,
) => subStep?.result !== 'SUCCESS';
