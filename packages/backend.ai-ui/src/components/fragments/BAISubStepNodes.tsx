/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAISubStepNodes` — the sub-steps of one scheduling-history attempt, drawn as
 a vertical timeline inside the parent row's expanded area.

 The backend flattens `PhaseRecord` groups on write, so what the API returns is
 a plain time-ordered list; and `_build_history_sub_steps` appends one trailing
 entry whose result mirrors the parent's and whose `started_at == ended_at` —
 a RESULT MARKER rather than an executed step. Both facts are what the timeline
 renders: solid nodes for the steps, an open dashed node for the marker.
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

/**
 * The trailing entry appended by `_build_history_sub_steps` — it carries the
 * parent's own result and a zero-length interval, so it is a marker, not a
 * step. Only the LAST entry can be one: an interior zero-length step is a real
 * (very fast) step.
 */
export const isResultMarkerEntry = (
  record: Pick<SubStepInList, 'startedAt' | 'endedAt'>,
  index: number,
  total: number,
): boolean =>
  index === total - 1 &&
  !!record.startedAt &&
  record.startedAt === record.endedAt;

const toSchedulingResult = (
  result: SubStepInList['result'],
): SchedulingResult | null =>
  result && result !== '%future added value' ? result : null;

export interface BAISubStepNodesProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  subStepsFrgmt: BAISubStepNodesFragment$key;
}

const BAISubStepNodes = ({
  subStepsFrgmt,
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
      {dataSource.map((record, index) => {
        const result = toSchedulingResult(record.result);
        const isLast = index === lastIndex;
        const isResultMarker = isResultMarkerEntry(
          record,
          index,
          dataSource.length,
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
            <div className="bai-substep-body">
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
                    <Text type="supporting" color="secondary">
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
                  <Text size="sm" color="secondary">
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
                <div className="bai-substep-detail">
                  <Text type="code" size="sm" color="disabled">
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
  );
};

export default BAISubStepNodes;
