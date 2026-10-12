/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../../hooks/useResourceLimitAndRemaining';
import { sessionMonitorFetchKeyAtom } from '../../hooks/useSessionMonitor';
import { Text } from '@lablup/ui-common/Text';
import { convertToNumber } from 'backend.ai-ui';
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
  const currentProject = useCurrentProjectValue();
  const fetchKey = useAtomValue(sessionMonitorFetchKeyAtom);
  const { resourceSlotsInRG } = useResourceSlotsDetails();
  const [{ checkPresetInfo, resourceLimitsWithoutResourceGroup }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name ?? '',
      ignorePerContainerConfig: true,
      fetchKey,
    });

  const accelerators = _.map(
    _.omit(resourceSlotsInRG, ['cpu', 'mem']),
    (slot, key) => ({
      key,
      name: slot?.human_readable_name ?? key,
      using: convertToNumber(
        (
          checkPresetInfo?.keypair_using as Record<string, string | undefined>
        )?.[key] ?? 0,
      ),
      limit: resourceLimitsWithoutResourceGroup.accelerators[key]?.max,
    }),
  );
  const shown = _.maxBy(accelerators, (a) => a.using) ?? accelerators[0];
  if (!shown) return null;

  const limit = convertToNumber(shown.limit);
  return (
    <>
      {separator}
      <Text type="inherit" textWrap="nowrap">
        {shown.name} {shown.using}
        {Number.isFinite(limit) ? `/${limit}` : ''}
      </Text>
    </>
  );
};

export default SessionMonitorAcceleratorSummary;
