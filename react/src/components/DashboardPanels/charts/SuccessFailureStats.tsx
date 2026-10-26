/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { failureSentiment, type SuccessFailureCounts } from '../countAliases';
import TrendStat from './TrendStat';
import { BAIFlex, BAILink } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface SuccessFailureStatsProps {
  counts: SuccessFailureCounts;
  /** Draws each count's bucket sparkline; off when a chart beside it shows the buckets. */
  showTrend?: boolean;
  /** Makes the failure count a link, e.g. to turn on "failures only". */
  onClickFailure?: () => void;
}

/** Succeeded and failed counts with their change from the previous range. */
const SuccessFailureStats: React.FC<SuccessFailureStatsProps> = ({
  counts,
  showTrend = true,
  onClickFailure,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex direction="row" gap="lg" wrap="wrap" align="stretch">
      <BAIFlex style={{ flex: '1 1 140px' }} direction="column">
        <TrendStat
          label={t('dashboard.card.Succeeded')}
          value={String(counts.success)}
          description={t('dashboard.card.VsPreviousRange')}
          delta={counts.successDelta}
          trend={showTrend ? counts.successTrend : undefined}
          trendColor="positive"
        />
      </BAIFlex>
      <BAIFlex style={{ flex: '1 1 140px' }} direction="column">
        <TrendStat
          label={t('dashboard.card.Failed')}
          value={
            onClickFailure && counts.failure > 0 ? (
              <BAILink onClick={onClickFailure}>{counts.failure}</BAILink>
            ) : (
              String(counts.failure)
            )
          }
          description={t('dashboard.card.VsPreviousRange')}
          delta={{
            ...counts.failureDelta,
            sentiment: failureSentiment(counts.failureDelta),
          }}
          trend={showTrend ? counts.failureTrend : undefined}
          trendColor="negative"
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default SuccessFailureStats;
