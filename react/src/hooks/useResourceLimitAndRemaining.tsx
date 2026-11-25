/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useResourceLimitAndRemainingFragment$key } from '../__generated__/useResourceLimitAndRemainingFragment.graphql';
import { Image } from '../components/ImageEnvironmentSelectFormItems';
import { AUTOMATIC_DEFAULT_SHMEM } from '../components/SessionFormItems/ResourceAllocationFormItems';
import { addNumberWithUnits, convertToBinaryUnit } from '../helper';
import { ResourceSlotName, useResourceSlots } from '../hooks/backendai';
import { useSuspenseTanQuery } from './reactQueryAlias';
import { useResourceGroupsForCurrentProject } from './useCurrentProject';
import { useEffectiveLoginConfig } from './useWebUIConfig';
import * as _ from 'lodash-es';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

const maxPerContainerRegex = /^max([A-Za-z0-9]+)PerContainer$/;

export const isMatchingMaxPerContainer = (configName: string, key: string) => {
  const match = configName.match(maxPerContainerRegex);
  if (match) {
    const configLowerCase = match[1].toLowerCase();
    const keyLowerCase = key.replaceAll(/[.-]/g, '').toLowerCase();
    // Because some accelerator names are not the same as the config name, we need to check if the config name is a substring of the accelerator name
    // cuda.shares => maxCUDASharesPerContainer
    // cuda.device => maxCUDADevicesPerContainer (Not maxCUDADevicePerContainer)
    return (
      configLowerCase === keyLowerCase || configLowerCase === keyLowerCase + 's'
    );
  }
  return false;
};
/** A `max*PerContainer` value as a cap; unset (or a non-number) is no cap. */
export const toPerContainerCap = (value: unknown): number | undefined =>
  _.isFinite(value) ? (value as number) : undefined;

/**
 * The shmem cap in `g` from `maxShmPerContainer` (GiB); 0 or less, or a
 * non-number, sets no cap. The memory bound is the current `mem`, applied by
 * the shmem input and its validator, so a group's `mem.max` never moves the cap.
 */
export const getShmemMaxLimit = (
  maxShmPerContainer: unknown,
): string | undefined =>
  _.isFinite(maxShmPerContainer) && (maxShmPerContainer as number) > 0
    ? `${maxShmPerContainer}g`
    : undefined;

/** Whether the launcher can allocate in the current resource group at all. */
export type ResourceAvailability = 'available' | 'empty' | 'loadFailed';

/**
 * `checkPresetInfo` is null when the preset check failed; a resource group
 * whose total CPU or memory (using + remaining) is 0 has nothing to allocate.
 */
export const getResourceAvailability = (
  checkPresetInfo: ResourceAllocation | null | undefined,
  resourceGroupCPU: number | undefined,
  resourceGroupMemGiB: number | undefined,
): ResourceAvailability =>
  checkPresetInfo === null
    ? 'loadFailed'
    : (_.isNumber(resourceGroupCPU) && resourceGroupCPU <= 0) ||
        (_.isNumber(resourceGroupMemGiB) && resourceGroupMemGiB <= 0)
      ? 'empty'
      : 'available';

export interface MergedResourceLimits {
  accelerators: {
    [key: string]:
      | {
          min?: number;
          max?: number;
        }
      | undefined;
  };
  cpu?: {
    min?: number;
    max?: number;
  };
  mem?: {
    min?: string;
    max?: string;
  };
  shmem?: {
    min?: string;
    max?: string;
  };
}

type ResourceLimits = {
  [key in ResourceSlotName]?: string | 'Infinity' | 'NaN';
};
type ResourceUsing = ResourceLimits;
type ResourceRemaining = ResourceLimits;
type ScalingGroup = {
  using: ResourceUsing;
  remaining: ResourceRemaining;
};

export type ResourceSlots = {
  cpu: string;
  mem: string;
  [key: string]: string;
};

export type RemainingSlots = {
  cpu?: number;
  mem?: number;
  accelerators: {
    [key: string]: number | undefined;
  };
};

export type ResourcePreset = {
  id: string;
  name: string;
  resource_slots: ResourceSlots;
  shared_memory: string | null;
  allocatable: boolean;
};

export type ResourceAllocation = {
  keypair_limits: ResourceLimits;
  keypair_using: ResourceUsing;
  keypair_remaining: ResourceRemaining;
  scaling_group_remaining: ResourceRemaining;
  scaling_groups: {
    [key: string]: ScalingGroup;
  };
  presets: ResourcePreset[];
  group_limits: ResourceLimits;
  group_using: ResourceUsing;
  group_remaining: ResourceRemaining;
};

interface Props {
  currentProjectName: string;
  currentImage?: Image;
  currentResourceGroup?: string;
  currentResourceGroupFrgmtForLimit?: useResourceLimitAndRemainingFragment$key | null;
  ignorePerContainerConfig?: boolean;
  fetchKey?: string;
  /**
   * Resource-group names known to be valid for the project identified by
   * `currentProjectName`. When provided, the guard that decides whether
   * `currentResourceGroup` may be sent as the preset check's
   * `scaling_group` param uses this list instead of the ambient current
   * project's derived resource-group atom. Callers that scope to an
   * explicit project (ADR-0001, e.g. `ResourceAllocationFormItems`) must
   * pass it so the check never depends on the ambient header selection.
   */
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
  const loginConfig = useEffectiveLoginConfig();
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

  const currentImageMinM =
    _.find(currentImage?.resource_limits, (i) => i?.key === 'mem')?.min || '0g';

  const resourceGroupResourceSize: {
    cpu?: number;
    mem?: string;
    accelerators: {
      [key: string]: number | undefined;
    };
  } = {
    // scaling group all cpu (using + remaining), string type
    cpu:
      !_.isEmpty(
        checkPresetInfo?.scaling_groups[currentResourceGroup]?.using?.cpu,
      ) &&
      !_.isEmpty(
        checkPresetInfo?.scaling_groups[currentResourceGroup]?.remaining?.cpu,
      )
        ? _.toNumber(
            checkPresetInfo?.scaling_groups[currentResourceGroup]?.using.cpu,
          ) +
          _.toNumber(
            checkPresetInfo?.scaling_groups[currentResourceGroup]?.remaining
              .cpu,
          )
        : undefined,
    mem:
      !_.isEmpty(
        checkPresetInfo?.scaling_groups[currentResourceGroup]?.using?.mem,
      ) &&
      !_.isEmpty(
        checkPresetInfo?.scaling_groups[currentResourceGroup]?.remaining?.mem,
      )
        ? convertToBinaryUnit(
            _.toNumber(
              checkPresetInfo?.scaling_groups[currentResourceGroup]?.using.mem,
            ) +
              _.toNumber(
                checkPresetInfo?.scaling_groups[currentResourceGroup]?.remaining
                  .mem,
              ),
            'g',
            2,
          )?.numberFixed + 'g'
        : undefined,
    accelerators: _.reduce(
      acceleratorSlots,
      (result, _value, key) => {
        result[key] =
          !_.isEmpty(
            // @ts-ignore
            checkPresetInfo?.scaling_groups[currentResourceGroup]?.using?.[key],
          ) &&
          !_.isEmpty(
            // @ts-ignore
            checkPresetInfo?.scaling_groups[currentResourceGroup]?.remaining?.[
              key
            ],
          )
            ? _.toNumber(
                // @ts-ignore
                checkPresetInfo?.scaling_groups[currentResourceGroup]?.using[
                  key
                ],
              ) +
              _.toNumber(
                // @ts-ignore
                checkPresetInfo?.scaling_groups[currentResourceGroup]
                  ?.remaining[key],
              )
            : undefined;
        return result;
      },
      {} as {
        [key: string]: number | undefined;
      },
    ),
  };
  // From the byte sum: `resourceGroupResourceSize.mem` is rounded to 2 decimals.
  const currentGroupSize =
    checkPresetInfo?.scaling_groups[currentResourceGroup];
  const resourceGroupMemGiB =
    !_.isEmpty(currentGroupSize?.using?.mem) &&
    !_.isEmpty(currentGroupSize?.remaining?.mem)
      ? convertToBinaryUnit(
          _.toNumber(currentGroupSize?.using.mem) +
            _.toNumber(currentGroupSize?.remaining.mem),
          'g',
        )?.number
      : undefined;
  const perContainerConfigs = _.omitBy(loginConfig, (_value, key) => {
    return !maxPerContainerRegex.test(key);
  }) as {
    [key: string]: number;
  };

  // Helper function to create resource limits with optional resource group limits
  const createResourceLimits = (
    includeResourceGroupLimits: boolean,
  ): MergedResourceLimits => ({
    cpu:
      resourceSlots?.cpu === undefined
        ? undefined
        : {
            min: _.max([
              _.toNumber(
                _.find(currentImage?.resource_limits, (i) => i?.key === 'cpu')
                  ?.min || '0',
              ),
            ]),
            max: _.min([
              ignorePerContainerConfig
                ? undefined
                : toPerContainerCap(loginConfig.maxCPUCoresPerContainer),
              limitParser(checkPresetInfo?.keypair_limits.cpu),
              limitParser(checkPresetInfo?.group_limits.cpu),
              includeResourceGroupLimits
                ? limitParser(currentResourceGroupSlotLimits.cpu)
                : undefined,
              includeResourceGroupLimits
                ? resourceGroupResourceSize.cpu
                : undefined,
            ]),
          },
    mem:
      resourceSlots?.mem === undefined
        ? undefined
        : {
            // M to max of [ image's mem min, AUTOMATIC_DEFAULT_SHMEM]
            // mem(M+S) should be larger than _.max([ image's mem min, AUTOMATIC_DEFAULT_SHMEM ]) + AUTOMATIC_DEFAULT_SHMEM (rule: S can not be larger than M)
            min:
              //handled by 'b' unit
              addNumberWithUnits(
                _.max([
                  convertToBinaryUnit(currentImageMinM, '')?.number,
                  convertToBinaryUnit(AUTOMATIC_DEFAULT_SHMEM, '')?.number,
                  0,
                ]) + '',
                AUTOMATIC_DEFAULT_SHMEM,
              ),
            max: (() => {
              // handled by 'g(GiB)' unit
              const minValue = _.min([
                ignorePerContainerConfig
                  ? undefined
                  : toPerContainerCap(loginConfig.maxMemoryPerContainer),
                limitParser(checkPresetInfo?.keypair_limits.mem) &&
                  convertToBinaryUnit(
                    limitParser(checkPresetInfo?.keypair_limits.mem) + '',
                    'g',
                  )?.number,
                limitParser(checkPresetInfo?.group_limits.mem) &&
                  convertToBinaryUnit(
                    limitParser(checkPresetInfo?.group_limits.mem) + '',
                    'g',
                  )?.number,
                includeResourceGroupLimits
                  ? limitParser(currentResourceGroupSlotLimits.mem) &&
                    convertToBinaryUnit(
                      limitParser(currentResourceGroupSlotLimits.mem) + '',
                      'g',
                    )?.number
                  : undefined,
                includeResourceGroupLimits ? resourceGroupMemGiB : undefined,
              ]);
              return minValue !== undefined ? minValue + 'g' : undefined;
            })(),
          },
    accelerators: _.reduce(
      acceleratorSlots,
      (result, _value, key) => {
        const perContainerLimit = _.find(
          perContainerConfigs,
          (_configValue, configName) =>
            isMatchingMaxPerContainer(configName, key),
        );

        result[key] = {
          min: parseInt(
            _.find(
              currentImage?.resource_limits,
              (supportedAcceleratorInfo) => {
                return supportedAcceleratorInfo?.key === key;
              },
            )?.min || '0',
          ),
          max: _.min([
            ignorePerContainerConfig
              ? undefined
              : toPerContainerCap(perContainerLimit),
            limitParser(
              checkPresetInfo?.keypair_limits[key as ResourceSlotName],
            ),
            limitParser(checkPresetInfo?.group_limits[key as ResourceSlotName]),
            includeResourceGroupLimits
              ? limitParser(
                  currentResourceGroupSlotLimits[key as ResourceSlotName],
                )
              : undefined,
            includeResourceGroupLimits
              ? resourceGroupResourceSize.accelerators[key]
              : undefined,
          ]),
        };
        return result;
      },
      {} as MergedResourceLimits['accelerators'],
    ),
    shmem:
      resourceSlots?.mem === undefined
        ? undefined
        : {
            max: getShmemMaxLimit(
              ignorePerContainerConfig
                ? undefined
                : loginConfig.maxShmPerContainer,
            ),
          },
  });

  const resourceLimits = createResourceLimits(true);

  const resourceLimitsWithoutResourceGroup = createResourceLimits(false);

  // Helper function to create remaining slots with optional scaling group remaining
  const createRemainingSlots = (
    includeScalingGroupRemaining: boolean,
  ): RemainingSlots => ({
    accelerators: _.reduce(
      acceleratorSlots,
      (result, _value, key) => {
        result[key] = _.min([
          _.toNumber(
            checkPresetInfo?.keypair_remaining[key as ResourceSlotName],
          ),
          _.toNumber(checkPresetInfo?.group_remaining[key as ResourceSlotName]),
          includeScalingGroupRemaining
            ? _.toNumber(
                checkPresetInfo?.scaling_group_remaining[
                  key as ResourceSlotName
                ],
              )
            : undefined,
        ]);
        return result;
      },
      {} as RemainingSlots['accelerators'],
    ),
    cpu: _.min([
      limitParser(checkPresetInfo?.keypair_remaining.cpu),
      limitParser(checkPresetInfo?.group_remaining.cpu),
      includeScalingGroupRemaining
        ? limitParser(checkPresetInfo?.scaling_group_remaining.cpu)
        : undefined,
    ]),
    mem: _.min([
      limitParser(checkPresetInfo?.keypair_remaining.mem),
      limitParser(checkPresetInfo?.group_remaining.mem),
      includeScalingGroupRemaining
        ? limitParser(checkPresetInfo?.scaling_group_remaining.mem)
        : undefined,
    ]),
  });

  const remaining = createRemainingSlots(true);

  const resourceAvailability = getResourceAvailability(
    checkPresetInfo,
    resourceGroupResourceSize.cpu,
    resourceGroupMemGiB,
  );

  const remainingWithoutResourceGroup = createRemainingSlots(false);

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
      resourceAvailability,
    },
    {
      refetch,
    },
  ] as const;
};

const limitParser = (limit: string | undefined) => {
  if (limit === undefined) {
    return undefined;
  } else if (limit === 'Infinity') {
    return undefined;
  } else if (limit === 'NaN') {
    return undefined;
  } else {
    return _.toNumber(limit);
  }
};
