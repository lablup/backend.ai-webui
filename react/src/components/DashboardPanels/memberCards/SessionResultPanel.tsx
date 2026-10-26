/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  SessionResultPanelQuery,
  SessionV2Filter,
  SessionV2Result,
} from '../../../__generated__/SessionResultPanelQuery.graphql';
import TrendStat from '../charts/TrendStat';
import { bucketize, type DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import {
  bucketCounts,
  bucketVariables,
  countDelta,
  previousWindow,
  withinWindow,
} from './memberCardData';
import { BAIFlex } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// SessionV2Filter has no createdAt: these count the sessions that ended in the range.
const endedFilter =
  (projectId: string, result: SessionV2Result) =>
  (window: DateTimeWindow): SessionV2Filter => ({
    projectId: { equals: projectId },
    result: { equals: result },
    ...withinWindow('terminatedAt', window),
  });

const SessionResultStats: React.FC<{
  projectId: string;
  range: string;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ projectId, range, timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const success = endedFilter(projectId, 'SUCCESS');
  const failure = endedFilter(projectId, 'FAILURE');
  const buckets = bucketize(range, new Date(timeRange.before).getTime());
  const previous = previousWindow(timeRange);
  const variables = {
    success: success(timeRange),
    failure: failure(timeRange),
    previousSuccess: success(previous),
    previousFailure: failure(previous),
    ...bucketVariables('s', buckets, success),
    ...bucketVariables('f', buckets, failure),
  } as SessionResultPanelQuery['variables'];
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<SessionResultPanelQuery>(
    graphql`
      query SessionResultPanelQuery(
        $success: SessionV2Filter!
        $failure: SessionV2Filter!
        $previousSuccess: SessionV2Filter!
        $previousFailure: SessionV2Filter!
        $s0: SessionV2Filter
        $s0On: Boolean!
        $s1: SessionV2Filter
        $s1On: Boolean!
        $s2: SessionV2Filter
        $s2On: Boolean!
        $s3: SessionV2Filter
        $s3On: Boolean!
        $s4: SessionV2Filter
        $s4On: Boolean!
        $s5: SessionV2Filter
        $s5On: Boolean!
        $s6: SessionV2Filter
        $s6On: Boolean!
        $s7: SessionV2Filter
        $s7On: Boolean!
        $f0: SessionV2Filter
        $f0On: Boolean!
        $f1: SessionV2Filter
        $f1On: Boolean!
        $f2: SessionV2Filter
        $f2On: Boolean!
        $f3: SessionV2Filter
        $f3On: Boolean!
        $f4: SessionV2Filter
        $f4On: Boolean!
        $f5: SessionV2Filter
        $f5On: Boolean!
        $f6: SessionV2Filter
        $f6On: Boolean!
        $f7: SessionV2Filter
        $f7On: Boolean!
      ) {
        success: mySessionsV2(filter: $success, limit: 1) {
          count
        }
        failure: mySessionsV2(filter: $failure, limit: 1) {
          count
        }
        previousSuccess: mySessionsV2(filter: $previousSuccess, limit: 1) {
          count
        }
        previousFailure: mySessionsV2(filter: $previousFailure, limit: 1) {
          count
        }
        s0: mySessionsV2(filter: $s0, limit: 1) @include(if: $s0On) {
          count
        }
        s1: mySessionsV2(filter: $s1, limit: 1) @include(if: $s1On) {
          count
        }
        s2: mySessionsV2(filter: $s2, limit: 1) @include(if: $s2On) {
          count
        }
        s3: mySessionsV2(filter: $s3, limit: 1) @include(if: $s3On) {
          count
        }
        s4: mySessionsV2(filter: $s4, limit: 1) @include(if: $s4On) {
          count
        }
        s5: mySessionsV2(filter: $s5, limit: 1) @include(if: $s5On) {
          count
        }
        s6: mySessionsV2(filter: $s6, limit: 1) @include(if: $s6On) {
          count
        }
        s7: mySessionsV2(filter: $s7, limit: 1) @include(if: $s7On) {
          count
        }
        f0: mySessionsV2(filter: $f0, limit: 1) @include(if: $f0On) {
          count
        }
        f1: mySessionsV2(filter: $f1, limit: 1) @include(if: $f1On) {
          count
        }
        f2: mySessionsV2(filter: $f2, limit: 1) @include(if: $f2On) {
          count
        }
        f3: mySessionsV2(filter: $f3, limit: 1) @include(if: $f3On) {
          count
        }
        f4: mySessionsV2(filter: $f4, limit: 1) @include(if: $f4On) {
          count
        }
        f5: mySessionsV2(filter: $f5, limit: 1) @include(if: $f5On) {
          count
        }
        f6: mySessionsV2(filter: $f6, limit: 1) @include(if: $f6On) {
          count
        }
        f7: mySessionsV2(filter: $f7, limit: 1) @include(if: $f7On) {
          count
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  const successCount = data.success?.count ?? 0;
  const failureCount = data.failure?.count ?? 0;
  const successDelta = countDelta(
    successCount,
    data.previousSuccess?.count ?? 0,
  );
  const failureDelta = countDelta(
    failureCount,
    data.previousFailure?.count ?? 0,
  );

  return (
    <BAIFlex direction="row" gap="lg" wrap="wrap" align="stretch">
      <BAIFlex style={{ flex: '1 1 140px' }} direction="column">
        <TrendStat
          label={t('dashboard.card.Succeeded')}
          value={String(successCount)}
          description={t('dashboard.card.VsPreviousRange')}
          delta={successDelta}
          trend={bucketCounts(data, 's', buckets.length)}
          trendColor="positive"
        />
      </BAIFlex>
      <BAIFlex style={{ flex: '1 1 140px' }} direction="column">
        <TrendStat
          label={t('dashboard.card.Failed')}
          value={String(failureCount)}
          description={t('dashboard.card.VsPreviousRange')}
          delta={{
            ...failureDelta,
            sentiment:
              failureDelta.direction === 'up'
                ? 'negative'
                : failureDelta.direction === 'down'
                  ? 'positive'
                  : 'neutral',
          }}
          trend={bucketCounts(data, 'f', buckets.length)}
          trendColor="negative"
        />
      </BAIFlex>
    </BAIFlex>
  );
};

/** Sessions of the viewer that ended in the range, by result, against the previous range. */
const SessionResultPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  return (
    <MemberCard
      title={t('dashboard.card.SessionResults')}
      tooltip={t('dashboard.card.SessionResultsTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <SessionResultStats
            projectId={projectId}
            range={vars.range}
            timeRange={vars.timeRange}
            fetchKey={key}
          />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default SessionResultPanel;
