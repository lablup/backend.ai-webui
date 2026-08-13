/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UsageProgressFragment_usageFrgmt$key } from '../__generated__/UsageProgressFragment_usageFrgmt.graphql';
import { bytesToGB } from '../helper';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const UsageProgress: React.FC<{
  usageProgressFrgmt: UsageProgressFragment_usageFrgmt$key | null;
}> = ({ usageProgressFrgmt: usageFrgmt }) => {
  'use memo';
  const { t } = useTranslation();

  const usage = useFragment(
    graphql`
      fragment UsageProgressFragment_usageFrgmt on QuotaScope {
        details {
          usage_bytes
          hard_limit_bytes
        }
      }
    `,
    usageFrgmt,
  );

  const usageBytes = parseFloat(usage?.details?.usage_bytes) || 0;
  const hardLimitBytes = parseFloat(usage?.details?.hard_limit_bytes) || 0;
  const percent = (
    hardLimitBytes > 0 ? ((usageBytes / hardLimitBytes) * 100)?.toFixed(2) : 0
  ) as number;

  return (
    <BAIFlex direction="column">
      {/* MAPPING §3.11: `percent` -> `value`, and `strokeColor` is NONE —
          `ProgressBar.variant` is a closed semantic enum, so the three literal
          RGB values `usageIndicatorColor` returned (green / amber / red at the
          70% and 90% thresholds) become the matching semantic variants.
          PILOT-DECISION: the antd `size={[180, 15]}` geometry is dropped —
          the bar fills its column like every other Astryx progress bar, and
          `status="exception"` collapses into the same `error` variant the
          >=90% threshold already selects. `label` is required and hidden: the
          "Used / Limit" row below IS the visible caption. */}
      <ProgressBar
        label={t('data.Used')}
        isLabelHidden
        value={percent}
        variant={percent < 70 ? 'success' : percent < 90 ? 'warning' : 'error'}
      />
      <BAIFlex direction="row" gap="xxs">
        <Text type="supporting">{t('data.Used')}:</Text>
        <Text type="supporting" color="primary">
          {bytesToGB(usage?.details?.usage_bytes)} GB
        </Text>
        <Text type="supporting">{' / '}</Text>
        <Text type="supporting">{t('data.Limit')}:</Text>
        <Text type="supporting" color="primary">
          {bytesToGB(usage?.details?.hard_limit_bytes)} GB
        </Text>
      </BAIFlex>
    </BAIFlex>
  );
};

export default UsageProgress;
