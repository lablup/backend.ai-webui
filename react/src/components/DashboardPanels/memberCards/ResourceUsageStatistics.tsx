/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { UsageRow } from './memberCardData';
import { Text } from '@lablup/ui-common/Text';
import {
  ResourceStatistics,
  processMemoryValue,
  useBAIResourceSlots,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type SlotInfo = { human_readable_name?: string; display_unit?: string };
type Statistic = {
  used: { current: number; total?: number };
  free: { current: number; total?: number };
  metadata: { title: string; displayUnit: string };
};

/** A usage row in the slot's display unit; an unlimited limit is an infinite total. */
export const toStatistic = (
  row: UsageRow,
  slot: SlotInfo | undefined,
): Statistic => {
  const displayUnit = slot?.display_unit ?? '';
  const inUnit = (value: number) =>
    row.resourceType === 'mem' ? processMemoryValue(value, displayUnit) : value;
  const total =
    row.limit === null ? Number.POSITIVE_INFINITY : inUnit(row.limit);
  const used = inUnit(row.used);
  return {
    used: { current: used, total },
    free: { current: Math.max(0, total - used), total },
    metadata: {
      title: slot?.human_readable_name ?? row.resourceType,
      displayUnit,
    },
  };
};

/**
 * Used against the limit per slot, drawn like "Total Resources in Resource
 * Group": CPU and memory first, then the accelerators in their own row.
 */
const ResourceUsageStatistics: React.FC<{
  rows: ReadonlyArray<UsageRow>;
}> = ({ rows }) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useBAIResourceSlots();
  if (rows.length === 0) {
    return <Text type="supporting">{t('dashboard.card.NoAllocation')}</Text>;
  }
  const statisticOf = (row: UsageRow) =>
    toStatistic(row, mergedResourceSlots[row.resourceType]);
  const cpu = rows.find((row) => row.resourceType === 'cpu');
  const mem = rows.find((row) => row.resourceType === 'mem');
  return (
    <ResourceStatistics
      displayType="used"
      progressMode="normal"
      resourceData={{
        cpu: cpu ? statisticOf(cpu) : null,
        memory: mem ? statisticOf(mem) : null,
        accelerators: rows
          .filter((row) => row !== cpu && row !== mem)
          .map((row) => ({ key: row.resourceType, ...statisticOf(row) })),
      }}
    />
  );
};

export default ResourceUsageStatistics;
