/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useKeypairResourceUsage } from '../../hooks/useKeypairResourceUsage';
import { sessionMonitorFetchKeyAtom } from '../../hooks/useSessionMonitor';
import { Text } from '@lablup/ui-common/Text';
import { useAtomValue } from 'jotai';
import * as _ from 'lodash-es';
import React from 'react';

/**
 * "GPU 5/8": the accelerator the user's keypair uses most, against its
 * policy limit. Suspends; mount under the header's Suspense with a null
 * fallback. Reads the current project, so keep it off project-agnostic pages.
 */
const SessionMonitorAcceleratorSummary: React.FC<{
  separator?: React.ReactNode;
}> = ({ separator }) => {
  'use memo';
  const fetchKey = useAtomValue(sessionMonitorFetchKeyAtom);
  const rows = useKeypairResourceUsage(fetchKey);
  const accelerators = rows.filter((row) => row.isAccelerator);
  const shown = _.maxBy(accelerators, (a) => a.using) ?? accelerators[0];
  if (!shown) return null;

  return (
    <>
      {separator}
      <Text type="inherit" textWrap="nowrap">
        {shown.name} {shown.using}
        {shown.limit !== null ? `/${shown.limit}` : ''}
      </Text>
    </>
  );
};

export default SessionMonitorAcceleratorSummary;
