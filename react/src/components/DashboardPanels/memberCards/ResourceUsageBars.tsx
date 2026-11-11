/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { UsageRow } from './memberCardData';
import { ProgressBar } from '@lablup/ui-common/ProgressBar';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  ResourceTypeIcon,
  convertToBinaryUnit,
  useBAIResourceSlots,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Formats a raw slot amount (cores, bytes, devices) with the slot's display unit. */
export const useFormatSlotAmount = () => {
  'use memo';
  const { mergedResourceSlots } = useBAIResourceSlots();
  return (resourceType: string, value: number | string) => {
    const slot = mergedResourceSlots[resourceType];
    if (slot?.number_format.binary) {
      return `${Number(convertToBinaryUnit(String(value), 'g', 2, true)?.numberFixed ?? 0)} GiB`;
    }
    const roundLength = slot?.number_format.round_length ?? 0;
    const amount =
      roundLength > 0 ? Number(value).toFixed(roundLength) : String(value);
    return slot?.display_unit ? `${amount} ${slot.display_unit}` : amount;
  };
};

/** One used-vs-limit bar per slot; an unlimited slot shows its usage only. */
const ResourceUsageBars: React.FC<{ rows: ReadonlyArray<UsageRow> }> = ({
  rows,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useBAIResourceSlots();
  const formatAmount = useFormatSlotAmount();

  if (rows.length === 0) {
    return <Text type="supporting">{t('dashboard.card.NoAllocation')}</Text>;
  }
  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      {rows.map((row) => {
        const name =
          mergedResourceSlots[row.resourceType]?.human_readable_name ??
          row.resourceType;
        const limitText =
          row.limit === null
            ? t('dashboard.card.Unlimited')
            : formatAmount(row.resourceType, row.limit);
        return (
          <BAIFlex key={row.resourceType} direction="column" align="stretch">
            <BAIFlex justify="between" align="center" gap="xs">
              <BAIFlex gap="xxs" align="center">
                <ResourceTypeIcon type={row.resourceType} />
                <Text>{name}</Text>
              </BAIFlex>
              <Text type="supporting">
                {`${formatAmount(row.resourceType, row.used)} / ${limitText}`}
              </Text>
            </BAIFlex>
            {row.limit === null ? null : (
              <ProgressBar
                label={name}
                isLabelHidden
                value={Math.min(row.used, row.limit)}
                max={row.limit > 0 ? row.limit : 1}
                variant={
                  row.limit > 0 && row.used >= row.limit ? 'warning' : 'accent'
                }
              />
            )}
          </BAIFlex>
        );
      })}
    </BAIFlex>
  );
};

export default ResourceUsageBars;
