/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { failureSentiment, type SuccessFailureCounts } from '../countAliases';
import type { DateTimeWindow } from '../timeRange';
import StatRow from './StatRow';
import { BAILink } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface SuccessFailureStatsProps {
  counts: SuccessFailureCounts;
  /** The bucket windows behind the trends, for the sparkline tooltips. */
  buckets?: ReadonlyArray<DateTimeWindow>;
  /** Makes the failure count a link, e.g. to turn on "failures only". */
  onClickFailure?: () => void;
}

/** Succeeded and failed counts with their change from the previous range and a bucket sparkline each. */
const SuccessFailureStats: React.FC<SuccessFailureStatsProps> = ({
  counts,
  buckets,
  onClickFailure,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <StatRow
      items={[
        {
          key: 'success',
          label: t('dashboard.card.Succeeded'),
          value: String(counts.success),
          description: t('dashboard.card.VsPreviousRange'),
          delta: counts.successDelta,
          trend: counts.successTrend,
          buckets,
          trendColor: 'positive',
        },
        {
          key: 'failure',
          label: t('dashboard.card.Failed'),
          value:
            onClickFailure && counts.failure > 0 ? (
              <BAILink onClick={onClickFailure}>{counts.failure}</BAILink>
            ) : (
              String(counts.failure)
            ),
          description: t('dashboard.card.VsPreviousRange'),
          delta: {
            ...counts.failureDelta,
            sentiment: failureSentiment(counts.failureDelta),
          },
          trend: counts.failureTrend,
          buckets,
          trendColor: 'negative',
        },
      ]}
    />
  );
};

export default SuccessFailureStats;
