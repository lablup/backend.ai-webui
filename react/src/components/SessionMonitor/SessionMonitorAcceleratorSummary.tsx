/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { Text } from '@lablup/ui-common/Text';
import * as _ from 'lodash-es';
import React from 'react';

/**
 * "GPU 5": the accelerator the watched sessions hold most of, else their CPU
 * cores. Suspends; mount under a Suspense with a null fallback.
 */
const SessionMonitorAcceleratorSummary: React.FC<{
  allocated: Record<string, number>;
  separator?: React.ReactNode;
}> = ({ allocated, separator }) => {
  'use memo';
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const accelerators = _.pickBy(
    allocated,
    (value, key) => key !== 'cpu' && key !== 'mem' && value > 0,
  );
  const key =
    _.maxBy(_.keys(accelerators), (k) => accelerators[k]) ??
    (allocated.cpu ? 'cpu' : undefined);
  if (!key) return null;
  const name = mergedResourceSlots?.[key]?.human_readable_name ?? key;

  return (
    <>
      {separator}
      <Text type="inherit" textWrap="nowrap">
        {name} {_.round(allocated[key] ?? 0, 2)}
      </Text>
    </>
  );
};

export default SessionMonitorAcceleratorSummary;
