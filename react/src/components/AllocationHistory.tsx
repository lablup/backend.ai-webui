/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../form-engine';
import AllocationHistoryStatistics from './AllocationHistoryStatistics';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Banner } from '@astryxdesign/core/Banner';
import { Selector } from '@astryxdesign/core/Selector';
import { useUpdatableState, BAIFlex, BAIFetchKeyButton } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export type Period = '1D' | '1W';

const periodParam = parseAsStringLiteral(['1D', '1W'] as const).withDefault(
  '1D',
);

const AllocationHistory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useQueryState(
    'period',
    periodParam,
  );
  const { t } = useTranslation();

  const [usageFetchKey, updateUsageFetchKey] = useUpdatableState('first');
  const [isPendingUsageTransition, startUsageTransition] = useTransition();
  const periodOptions: Array<{
    label: string;
    value: Period;
  }> = [
    {
      label: t('statistics.1Day'),
      value: '1D',
    },
    {
      label: t('statistics.1Week'),
      value: '1W',
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Banner status="info" title={t('statistics.UsageHistoryNote')} />
      <BAIFlex gap={'sm'} justify="between">
        <Form.Item
          label={t('statistics.SelectPeriod')}
          style={{ marginBottom: 0 }}
        >
          {/* antd `Select` (2 static options, no form binding) -> Astryx
              `Selector`. `label` is required and `isLabelHidden` keeps the
              `Form.Item` label the only one rendered (flip recipe).
              `popupMatchSelectWidth={false}` has no destination — Astryx sizes
              its popup to the trigger. */}
          <Selector
            label={t('statistics.SelectPeriod')}
            isLabelHidden
            options={periodOptions}
            value={selectedPeriod}
            onChange={(value) => setSelectedPeriod(value as Period)}
          />
        </Form.Item>
        <BAIFetchKeyButton
          loading={isPendingUsageTransition}
          value={usageFetchKey}
          onChange={() => {
            startUsageTransition(() => {
              updateUsageFetchKey();
            });
          }}
        />
      </BAIFlex>
      <Suspense fallback={<BAISkeletonAstryx />}>
        <AllocationHistoryStatistics
          period={selectedPeriod || '1D'}
          fetchKey={usageFetchKey}
        />
      </Suspense>
    </BAIFlex>
  );
};

export default AllocationHistory;
