/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../../helper';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';

/**
 * "CPU 4 · RAM 8G · GPU 2": what the watched sessions hold, in the popover
 * rows' format, as one row item that renders nothing when no slot is held.
 * Suspends; mount under a Suspense with a null fallback.
 */
const SessionMonitorAllocationSummary: React.FC<{
  allocated: Record<string, number>;
  separator?: React.ReactNode;
}> = ({ allocated, separator }) => {
  'use memo';
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const keys = _.sortBy(
    _.keys(_.pickBy(allocated, (value) => value > 0)),
    (key) => (key === 'cpu' ? 0 : key === 'mem' ? 1 : 2),
    (key) => key,
  );
  if (keys.length === 0) return null;
  const text = keys
    .map((key) => {
      const name = mergedResourceSlots?.[key]?.human_readable_name ?? key;
      if (key === 'mem') {
        const gib =
          convertToBinaryUnit(String(allocated.mem), 'g', 1)?.number ?? 0;
        return `${name} ${Number.isInteger(gib) ? gib : gib.toFixed(1)}G`;
      }
      return `${name} ${_.round(allocated[key] ?? 0, 2)}`;
    })
    .join(' · ');

  return (
    <BAIFlex direction="row" align="center" gap="xs">
      {separator}
      <Text type="inherit" textWrap="nowrap">
        {text}
      </Text>
    </BAIFlex>
  );
};

export default SessionMonitorAllocationSummary;
