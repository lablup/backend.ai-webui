/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useResourceLimitAndRemainingFragment$key } from '../__generated__/useResourceLimitAndRemainingFragment.graphql';
import { Image } from '../components/ImageEnvironmentSelectFormItems';
import {
  computeRemaining,
  computeResourceGroupResourceSize,
  computeResourceLimits,
  getImageMinMem,
  type ResourceAllocation,
  type ResourceSlots,
} from '../features/session-launcher/domain/resourceLimits';
import { useResourceSlots } from '../hooks/backendai';
import { useSuspenseTanQuery } from './reactQueryAlias';
import { useResourceGroupsForCurrentProject } from './useCurrentProject';
import * as _ from 'lodash-es';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

export {
  isMatchingMaxPerContainer,
  type MergedResourceLimits,
  type RemainingSlots,
  type ResourceAllocation,
  type ResourcePreset,
  type ResourceSlots,
} from '../features/session-launcher/domain/resourceLimits';

interface Props {
  currentProjectName: string;
  currentImage?: Image;
  currentResourceGroup?: string;
  currentResourceGroupFrgmtForLimit?: useResourceLimitAndRemainingFragment$key | null;
  ignorePerContainerConfig?: boolean;
  fetchKey?: string;
  /** Valid resource groups of `currentProjectName`; replaces the ambient-project
   * guard on `scaling_group`. Required for explicit-project callers (ADR 0001). */
  accessibleResourceGroupNames?: string[];
}

// determine resource limits and remaining for current resource group and current image in current project
export const useResourceLimitAndRemaining = ({
  currentImage,
  currentResourceGroup = '',
  currentResourceGroupFrgmtForLimit: currentResourceGroupFrgmt = null,
  currentProjectName,
  ignorePerContainerConfig = false,
  fetchKey,
  accessibleResourceGroupNames,
}: Props) => {
  const baiClient = useSuspendedBackendaiClient();
  const [resourceSlots] = useResourceSlots();
  const acceleratorSlots = _.omit(resourceSlots, ['cpu', 'mem', 'shmem']);
  const { nonSftpResourceGroups } = useResourceGroupsForCurrentProject();

  const currentResourceGroupForLimit = useFragment(
    graphql`
      fragment useResourceLimitAndRemainingFragment on ScalingGroup {
        name
        resource_allocation_limit_for_sessions
      }
    `,
    currentResourceGroupFrgmt,
  );

  const currentResourceGroupSlotLimits = useMemo(() => {
    return JSON.parse(
      currentResourceGroupForLimit?.resource_allocation_limit_for_sessions ||
        '{}',
    ) as ResourceSlots;
  }, [currentResourceGroupForLimit]);

  const {
    data: checkPresetInfo,
    refetch,
    isRefetching,
  } = useSuspenseTanQuery<ResourceAllocation | null>({
    queryKey: [
      'check-presets',
      currentProjectName,
      currentResourceGroup,
      fetchKey,
    ],
    queryFn: () => {
      const params: { group: string; scaling_group?: string } = {
        group: currentProjectName,
      };

      const validResourceGroupNames =
        accessibleResourceGroupNames ?? _.map(nonSftpResourceGroups, 'name');
      if (
        currentResourceGroup &&
        _.includes(validResourceGroupNames, currentResourceGroup)
      ) {
        params.scaling_group = currentResourceGroup;
      }

      return baiClient.resourcePreset.check(params).catch(() => null);
    },
    staleTime: 1000,
  });

  const currentImageMinM = getImageMinMem(currentImage?.resource_limits);

  const resourceGroupResourceSize = computeResourceGroupResourceSize({
    acceleratorSlots,
    checkPresetInfo,
    resourceGroup: currentResourceGroup,
  });

  const limitsInput = {
    resourceSlots,
    acceleratorSlots,
    imageResourceLimits: currentImage?.resource_limits,
    imageMinMem: currentImageMinM,
    config: baiClient._config,
    ignorePerContainerConfig,
    checkPresetInfo,
    resourceGroupSlotLimits: currentResourceGroupSlotLimits,
  };
  const resourceLimits = computeResourceLimits({
    ...limitsInput,
    includeResourceGroupLimits: true,
  });
  const resourceLimitsWithoutResourceGroup = computeResourceLimits({
    ...limitsInput,
    includeResourceGroupLimits: false,
  });

  const remaining = computeRemaining({
    acceleratorSlots,
    checkPresetInfo,
    includeScalingGroupRemaining: true,
  });
  const remainingWithoutResourceGroup = computeRemaining({
    acceleratorSlots,
    checkPresetInfo,
    includeScalingGroupRemaining: false,
  });

  return [
    {
      resourceGroupResourceSize,
      resourceLimits,
      resourceLimitsWithoutResourceGroup,
      remaining,
      remainingWithoutResourceGroup,
      currentImageMinM,
      isRefetching,
      checkPresetInfo,
    },
    {
      refetch,
    },
  ] as const;
};
