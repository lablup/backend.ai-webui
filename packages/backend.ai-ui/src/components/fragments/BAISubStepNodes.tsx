/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAISubStepNodes` — the sub-steps of one scheduling-history attempt, drawn as
 a vertical timeline inside the parent row's expanded area.

 The backend flattens `PhaseRecord` groups on write, so what the API returns is
 a plain time-ordered list. Deployment rows carry one extra trailing entry that
 restates the row itself — see `isLifecycleMarkerEntry` — and it renders as an
 open dashed node capping the solid ones.

 Every font size, weight and colour comes from the theme through Astryx `Text`
 semantic types (`code` / `supporting`) and the `primary` / `secondary` colour
 ramp — the co-located CSS carries geometry only.
*/
import {
  BAISubStepNodesFragment$data,
  BAISubStepNodesFragment$key,
} from '../../__generated__/BAISubStepNodesFragment.graphql';
import { filterOutNullAndUndefined, newLineToBrElement } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAISchedulingResultBadge, {
  SchedulingResult,
  resultSemanticColorMap,
} from '../BAISchedulingResultBadge';
import './BAISubStepNodes.css';
import { Text } from '@astryxdesign/core/Text';
import classNames from 'classnames';
import dayjs from 'dayjs';
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';

export type SubStepInList = NonNullable<BAISubStepNodesFragment$data[number]>;

const TIME_FORMAT = 'HH:mm:ss.SSS';

/**
 * Both timestamps are non-null in practice (the recorder always stamps them),
 * so the elapsed time is a value the timeline can always show. Sub-steps are
 * short — milliseconds to seconds — hence the two significant sub-second
 * digits rather than a `HH:mm:ss` clock.
 */
export const formatElapsed = (
  startedAt: string | null | undefined,
  endedAt: string | null | undefined,
): string | null => {
  if (!startedAt || !endedAt) return null;
  const ms = dayjs(endedAt).diff(dayjs(startedAt));
  if (!Number.isFinite(ms) || ms < 0) return null;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`;
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${String(totalSeconds % 60).padStart(2, '0')}s`;
  }
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

/** `deploying-rolling-back` and `deploying_rolling_back` are the same name. */
const normalizeStepName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-');

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
export const isLifecycleMarkerEntry = (
  record: Pick<SubStepInList, 'step'>,
  index: number,
  total: number,
  parentPhase: string | null | undefined,
): boolean =>
  index === total - 1 &&
  !!parentPhase &&
  normalizeStepName(record.step) === normalizeStepName(parentPhase);

/**
 * Sub-steps that record actual work — the lifecycle marker excluded. A row
 * whose `sub_steps` hold nothing else has no detail to expand into: the marker
 * alone would just repeat the row above it.
 */
export const countExecutedSubSteps = (
  subSteps: ReadonlyArray<Pick<SubStepInList, 'step'> | null | undefined>,
  parentPhase: string | null | undefined,
): number => {
  const entries = filterOutNullAndUndefined(subSteps);
  return entries.filter(
    (entry, index) =>
      !isLifecycleMarkerEntry(entry, index, entries.length, parentPhase),
  ).length;
};

const toSchedulingResult = (
  result: SubStepInList['result'],
): SchedulingResult | null =>
  result && result !== '%future added value' ? result : null;

export interface BAISubStepNodesProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  subStepsFrgmt: BAISubStepNodesFragment$key;
  /**
   * The owning history row's `phase`. It is what identifies the trailing
   * lifecycle marker; without it every entry renders as an executed step.
   */
  parentPhase?: string | null;
}

const BAISubStepNodes = ({
  subStepsFrgmt,
  parentPhase,
  className,
  ...divProps
}: BAISubStepNodesProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const subSteps = useFragment<BAISubStepNodesFragment$key>(
    graphql`
      fragment BAISubStepNodesFragment on SubStepResultGQL
      @relay(plural: true) {
        step
        result
        errorCode
        message
        startedAt
        endedAt
      }
    `,
    subStepsFrgmt,
  );

  // Ascending, as the API returns it — the timeline reads top-down and the
  // trailing result marker must stay last.
  const dataSource = filterOutNullAndUndefined(subSteps);
  const lastIndex = dataSource.length - 1;

  return (
    <div
      className={classNames('bai-substep-timeline', className)}
      {...divProps}
    >
      <div className="bai-substep-list">
        {dataSource.map((record, index) => {
          const result = toSchedulingResult(record.result);
          const isLast = index === lastIndex;
          const isResultMarker = isLifecycleMarkerEntry(
            record,
            index,
            dataSource.length,
            parentPhase,
          );
          const elapsed = formatElapsed(record.startedAt, record.endedAt);

          return (
            <div className="bai-substep-item" key={`${record.step}-${index}`}>
              <div className="bai-substep-rail" aria-hidden>
                <span
                  className={classNames(
                    'bai-substep-dot',
                    isResultMarker && 'bai-substep-dot--marker',
                  )}
                  data-variant={
                    result ? resultSemanticColorMap[result] : 'default'
                  }
                />
                {!isLast ? <span className="bai-substep-connector" /> : null}
              </div>
              <div
                className={classNames(
                  'bai-substep-body',
                  isResultMarker && 'bai-substep-body--marker',
                )}
              >
                <div className="bai-substep-header">
                  <Text
                    type="code"
                    weight="medium"
                    color={isResultMarker ? 'secondary' : 'primary'}
                  >
                    {record.step}
                  </Text>
                  <BAISchedulingResultBadge result={result} />
                  {isResultMarker ? (
                    <span className="bai-substep-pill">
                      <Text type="supporting">
                        {t('comp:BAISubStepNodes.ResultMarker')}
                      </Text>
                    </span>
                  ) : elapsed ? (
                    <Text type="code" size="sm" color="secondary">
                      {elapsed}
                    </Text>
                  ) : null}
                </div>
                {!isResultMarker && record.message ? (
                  <div className="bai-substep-detail">
                    <Text type="supporting">
                      {newLineToBrElement(record.message)}
                    </Text>
                  </div>
                ) : null}
                {!isResultMarker && result === 'FAILURE' ? (
                  <div className="bai-substep-error-code">
                    <Text type="supporting">
                      {t('comp:BAISubStepNodes.ErrorCode')}
                    </Text>
                    <span className="bai-substep-chip">
                      <Text type="code" size="sm" color="secondary">
                        {record.errorCode ?? '-'}
                      </Text>
                    </span>
                  </div>
                ) : null}
                {!isResultMarker && record.startedAt && record.endedAt ? (
                  <div className="bai-substep-detail bai-substep-detail--time">
                    <Text type="code" size="sm" color="secondary">
                      {`${dayjs(record.startedAt).format(TIME_FORMAT)} → ${dayjs(
                        record.endedAt,
                      ).format(TIME_FORMAT)}`}
                    </Text>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BAISubStepNodes;
