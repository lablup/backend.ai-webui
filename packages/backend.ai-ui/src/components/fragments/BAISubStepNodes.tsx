/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAISubStepNodes` — the sub-steps of one scheduling-history attempt, drawn as
 design 3a: a compact inline table, one 32px row per step, with an order
 connector in a narrow rail column.

 The backend flattens `PhaseRecord` groups on write, so what the API returns is
 a plain time-ordered list. Deployment rows carry one extra trailing entry that
 restates the row itself — see `isLifecycleMarkerEntry` — and it renders as a
 tinted row with an open dashed node.

 It is a hand-rolled `<table>` on purpose: an Astryx `TableCell` sets
 `overflow: hidden` unconditionally, which would clip the connector at every
 row boundary, and its densest row is taller than 32px.

 Every font size and colour comes from the theme — the co-located CSS carries
 geometry and the semantic hue triples only.
*/
import {
  BAISubStepNodesFragment$data,
  BAISubStepNodesFragment$key,
} from '../../__generated__/BAISubStepNodesFragment.graphql';
import { filterOutNullAndUndefined } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import {
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

/**
 * 3a gives the message one line. A `<br>` is a FORCED break that
 * `white-space: nowrap` never suppresses, so rendering the newlines as markup
 * (what `newLineToBrElement` does, and what the stacked 2a layout wanted) would
 * lay out one line box per fragment — a cell `height` is only a minimum, so the
 * 32px row would grow with the message. Multi-line messages are the norm on a
 * failed step: the recorder stores `str(e)`, and a placement failure joins its
 * per-agent reasons with newlines.
 *
 * Collapsing them to spaces keeps the row at 32px AND fixes the hover tooltip,
 * which Astryx builds from `textContent` — with `<br>`s that came back as
 * "line onelinetwo".
 */
const toSingleLine = (message: string | null | undefined): string =>
  message?.replace(/\s*\n\s*/g, ' ').trim() || '-';

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

  // Ascending, as the API returns it — the table reads top-down and the
  // trailing result marker must stay last.
  const dataSource = filterOutNullAndUndefined(subSteps);

  return (
    <div className={classNames('bai-substep-panel', className)} {...divProps}>
      <table className="bai-substep-table">
        <colgroup>
          <col className="bai-substep-col-rail" />
          <col className="bai-substep-col-step" />
          <col className="bai-substep-col-result" />
          <col className="bai-substep-col-duration" />
          <col className="bai-substep-col-time" />
          <col className="bai-substep-col-code" />
          <col />
        </colgroup>
        <thead>
          <tr>
            {/* The rail column is decoration, but the header cell has to exist
                for the column count to line up. */}
            <th scope="col" />
            {(
              [
                ['Step', undefined],
                ['Result', undefined],
                ['Duration', 'bai-substep-num'],
                ['Time', undefined],
                ['ErrorCode', undefined],
                ['Message', undefined],
              ] as const
            ).map(([key, cellClassName]) => (
              <th scope="col" key={key} className={cellClassName}>
                {/* `maxLines` for the ellipsis and the hover tooltip: the
                    columns are fixed-width, and a one-word label like ru
                    `Длительность` needs 103px in the 74px duration column. */}
                <Text type="supporting" weight="medium" maxLines={1}>
                  {t(`comp:BAISubStepNodes.${key}`)}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((record, index) => {
            const result = toSchedulingResult(record.result);
            const isResultMarker = isLifecycleMarkerEntry(
              record,
              index,
              dataSource.length,
              parentPhase,
            );
            const elapsed = formatElapsed(record.startedAt, record.endedAt);

            return (
              <tr
                key={`${record.step}-${index}`}
                className={classNames(
                  'bai-substep-row',
                  isResultMarker && 'bai-substep-row--marker',
                )}
                data-variant={
                  result ? resultSemanticColorMap[result] : 'default'
                }
              >
                {/* No `aria-hidden`: hiding it would leave the row owning
                    six cells against seven column headers. Empty is right —
                    the header cell above it is empty too. */}
                <td className="bai-substep-rail-cell" />
                <td>
                  <Text
                    type="code"
                    size="sm"
                    maxLines={1}
                    color={isResultMarker ? 'secondary' : 'primary'}
                  >
                    {record.step}
                  </Text>
                </td>
                <td>
                  {result ? (
                    <span className="bai-substep-result">
                      <Text type="supporting" color="inherit" maxLines={1}>
                        {result}
                      </Text>
                    </span>
                  ) : null}
                </td>
                <td className="bai-substep-num">
                  {/* The marker is an instant, not work — it has no duration. */}
                  {!isResultMarker && elapsed ? (
                    <Text type="code" size="sm" color="secondary">
                      {elapsed}
                    </Text>
                  ) : (
                    <Text type="supporting" color="disabled">
                      -
                    </Text>
                  )}
                </td>
                <td>
                  {record.startedAt ? (
                    <Text type="code" size="sm" color="secondary">
                      {dayjs(record.startedAt).format(TIME_FORMAT)}
                    </Text>
                  ) : null}
                </td>
                <td>
                  {record.errorCode ? (
                    <span className="bai-substep-code">
                      <Text
                        type="code"
                        size="sm"
                        color="secondary"
                        maxLines={1}
                      >
                        {record.errorCode}
                      </Text>
                    </span>
                  ) : (
                    <Text type="supporting" color="disabled">
                      -
                    </Text>
                  )}
                </td>
                <td>
                  <Text type="supporting" maxLines={1}>
                    {isResultMarker
                      ? t('comp:BAISubStepNodes.ResultMarker')
                      : toSingleLine(record.message)}
                  </Text>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BAISubStepNodes;
