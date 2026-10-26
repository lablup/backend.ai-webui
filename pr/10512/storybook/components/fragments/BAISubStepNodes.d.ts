import { BAISubStepNodesFragment$data, BAISubStepNodesFragment$key } from '../../__generated__/BAISubStepNodesFragment.graphql';
import * as React from 'react';
export type SubStepInList = NonNullable<BAISubStepNodesFragment$data[number]>;
/**
 * Both timestamps are non-null in practice (the recorder always stamps them),
 * so the elapsed time is a value the timeline can always show. Sub-steps are
 * short — milliseconds to seconds — hence the two significant sub-second
 * digits rather than a `HH:mm:ss` clock.
 */
export declare const formatElapsed: (startedAt: string | null | undefined, endedAt: string | null | undefined) => string | null;
/**
 * Only the DEPLOYMENT coordinator appends a lifecycle entry to `sub_steps`
 * (`_build_history_sub_steps`); the session and route coordinators return the
 * recorder's steps untouched. That entry restates the row it belongs to — its
 * `step` is the phase's own name and its result is the row's result — so it
 * caps the timeline as a marker instead of reading as work that was done.
 *
 * Identify it by that restatement, not by `started_at == ended_at`: real steps
 * do finish inside one clock tick (measured — a session's
 * `All kernels ready for PREPARED` reports 0 ms), which made the timestamp
 * test label genuine session steps as markers.
 */
export declare const isLifecycleMarkerEntry: (record: Pick<SubStepInList, "step">, index: number, total: number, parentPhase: string | null | undefined) => boolean;
/**
 * Sub-steps that record actual work — the lifecycle marker excluded. A row
 * whose `sub_steps` hold nothing else has no detail to expand into: the marker
 * alone would just repeat the row above it.
 */
export declare const countExecutedSubSteps: (subSteps: ReadonlyArray<Pick<SubStepInList, "step"> | null | undefined>, parentPhase: string | null | undefined) => number;
export interface BAISubStepNodesProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    subStepsFrgmt: BAISubStepNodesFragment$key;
    /**
     * The owning history row's `phase`. It is what identifies the trailing
     * lifecycle marker; without it every entry renders as an executed step.
     */
    parentPhase?: string | null;
}
declare const BAISubStepNodes: ({ subStepsFrgmt, parentPhase, className, ...divProps }: BAISubStepNodesProps) => React.JSX.Element;
export default BAISubStepNodes;
