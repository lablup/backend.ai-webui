import { useSuspendedBackendaiClient } from '.';
import { useResourceLimitAndRemainingFragment$key } from '../__generated__/useResourceLimitAndRemainingFragment.graphql';
import { Image } from '../components/ImageEnvironmentSelectFormItems';
import { AUTOMATIC_DEFAULT_SHMEM } from '../components/ResourceAllocationFormItems';
import { addNumberWithUnits, convertToBinaryUnit } from '../helper';
import { ResourceSlotName, useResourceSlots } from '../hooks/backendai';
import { useTanQuery } from './reactQueryAlias';
import { useResourceGroupsForCurrentProject } from './useCurrentProject';
import { keepPreviousData } from '@tanstack/react-query';
import _ from 'lodash';
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
  cpu: number;
  mem: number;
  accelerators: {
    [key: string]: number;
  };
};

export type ResourcePreset = {
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
}

// determine resource limits and remaining for current resource group and current image in current project
export const useResourceLimitAndRemaining = ({
  currentImage,
  currentResourceGroup = '',
  currentResourceGroupFrgmtForLimit: currentResourceGroupFrgmt = null,
  currentProjectName,
  ignorePerContainerConfig = false,
  fetchKey,
}: Props) => {
  const baiClient = useSuspendedBackendaiClient();
  const [resourceSlots] = useResourceSlots();
  const acceleratorSlots = _.omit(resourceSlots, ['cpu', 'mem', 'shmem']);
  const { resourceGroups } = useResourceGroupsForCurrentProject();

  const currentResourceGroupForLimit = useFragment(
    graphql`
      fragment useResourceLimitAndRemainingFragment on ScalingGroup {
        name
        resource_allocation_limit_for_sessions @since(version: "25.6.0")
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
  } = useTanQuery<ResourceAllocation | null>({
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

      if (
        currentResourceGroup &&
        _.some(resourceGroups, (rg) => rg.name === currentResourceGroup)
      ) {
        params.scaling_group = currentResourceGroup;
      }

      return baiClient.resourcePreset.check(params).catch(() => null);
    },
    staleTime: 1000,
    // This allows the previous data to be used while the new data is being fetched
    placeholderData: keepPreviousData,
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
      (result, value, key) => {
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
  const perContainerConfigs = useMemo(
    () =>
      _.omitBy(baiClient._config, (value, key) => {
        return !maxPerContainerRegex.test(key);
      }),
    [baiClient._config],
  );

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
            max: _.min(
              _.compact([
                ignorePerContainerConfig
                  ? undefined
                  : baiClient._config.maxCPUCoresPerContainer,
                limitParser(checkPresetInfo?.keypair_limits.cpu),
                limitParser(checkPresetInfo?.group_limits.cpu),
                includeResourceGroupLimits
                  ? limitParser(currentResourceGroupSlotLimits.cpu)
                  : undefined,
                // resourceGroupResourceSize?.cpu,
              ]),
            ),
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
              const minValue = _.min(
                _.compact([
                  ignorePerContainerConfig
                    ? undefined
                    : baiClient._config.maxMemoryPerContainer,
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
                  includeResourceGroupLimits &&
                    limitParser(currentResourceGroupSlotLimits.mem) &&
                    convertToBinaryUnit(
                      limitParser(currentResourceGroupSlotLimits.mem) + '',
                      'g',
                    )?.number,
                  // scaling group all mem (using + remaining), string type
                  // resourceGroupResourceSize?.mem &&
                  //   iSizeToSize(resourceGroupResourceSize?.mem + '', 'g')?.number,
                ]),
              );
              return minValue !== undefined ? minValue + 'g' : undefined;
            })(),
          },
    accelerators: _.reduce(
      acceleratorSlots,
      (result, value, key) => {
        const perContainerLimit =
          _.find(perContainerConfigs, (configValue, configName) => {
            return isMatchingMaxPerContainer(configName, key);
          }) ?? baiClient._config['cuda.device']; // FIXME: temporally `cuda.device` config, when undefined

        result[key] = {
          min: parseInt(
            _.find(
              currentImage?.resource_limits,
              (supportedAcceleratorInfo) => {
                return supportedAcceleratorInfo?.key === key;
              },
            )?.min || '0',
          ),
          max: _.min(
            _.compact([
              ignorePerContainerConfig ? undefined : perContainerLimit || 8,
              limitParser(
                checkPresetInfo?.keypair_limits[key as ResourceSlotName],
              ),
              limitParser(
                checkPresetInfo?.group_limits[key as ResourceSlotName],
              ),
              includeResourceGroupLimits
                ? limitParser(
                    currentResourceGroupSlotLimits[key as ResourceSlotName],
                  )
                : undefined,
              // scaling group all cpu (using + remaining), string type
              // resourceGroupResourceSize.accelerators[key],
            ]),
          ),
        };
        return result;
      },
      {} as MergedResourceLimits['accelerators'],
    ),
  });

  const resourceLimits = createResourceLimits(true);

  const resourceLimitsWithoutResourceGroup = createResourceLimits(false);

  // Helper function to create remaining slots with optional scaling group remaining
  const createRemainingSlots = (
    includeScalingGroupRemaining: boolean,
  ): RemainingSlots => ({
    accelerators: _.reduce(
      acceleratorSlots,
      (result, value, key) => {
        const remainingValues = _.compact([
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
        result[key] = _.min(remainingValues) ?? Number.MAX_SAFE_INTEGER;
        return result;
      },
      {} as RemainingSlots['accelerators'],
    ),
    cpu: (() => {
      const remainingValues = _.compact([
        limitParser(checkPresetInfo?.keypair_remaining.cpu),
        limitParser(checkPresetInfo?.group_remaining.cpu),
        includeScalingGroupRemaining
          ? limitParser(checkPresetInfo?.scaling_group_remaining.cpu)
          : undefined,
      ]);
      return _.min(remainingValues) ?? Number.MAX_SAFE_INTEGER;
    })(),
    mem: (() => {
      const remainingValues = _.compact([
        limitParser(checkPresetInfo?.keypair_remaining.mem),
        limitParser(checkPresetInfo?.group_remaining.mem),
        includeScalingGroupRemaining
          ? limitParser(checkPresetInfo?.scaling_group_remaining.mem)
          : undefined,
      ]);
      return _.min(remainingValues) ?? Number.MAX_SAFE_INTEGER;
    })(),
  });

  const remaining = createRemainingSlots(true);

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
