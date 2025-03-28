import { useSuspendedBackendaiClient } from '.';
import { Image } from '../components/ImageEnvironmentSelectFormItems';
import { AUTOMATIC_DEFAULT_SHMEM } from '../components/ResourceAllocationFormItems';
import { addNumberWithUnits, convertBinarySizeUnit } from '../helper';
import { ResourceSlotName, useResourceSlots } from '../hooks/backendai';
import { useSuspenseTanQuery } from './reactQueryAlias';
import { useResourceGroupsForCurrentProject } from './useCurrentProject';
import _ from 'lodash';
import { useMemo } from 'react';

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

type ResourceSlots = {
  cpu: string;
  mem: string;
  [key: string]: string;
};

type RemainingSlots = {
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

type ResourceAllocation = {
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
  ignorePerContainerConfig?: boolean;
  fetchKey?: string;
}

// determine resource limits and remaining for current resource group and current image in current project
export const useResourceLimitAndRemaining = ({
  currentImage,
  currentResourceGroup = '',
  currentProjectName,
  ignorePerContainerConfig = false,
  fetchKey,
}: Props) => {
  const baiClient = useSuspendedBackendaiClient();
  const [resourceSlots] = useResourceSlots();
  const acceleratorSlots = _.omit(resourceSlots, ['cpu', 'mem', 'shmem']);
  const { resourceGroups } = useResourceGroupsForCurrentProject();

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
      if (
        currentResourceGroup &&
        _.some(resourceGroups, (rg) => rg.name === currentResourceGroup)
      ) {
        return baiClient.resourcePreset
          .check({
            group: currentProjectName,
            scaling_group: currentResourceGroup,
          })
          .catch(() => {});
      } else {
        return null;
      }
    },
    staleTime: 1000,
    // suspense: !_.isEmpty(currentResourceGroup), //prevent flicking
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
        ? convertBinarySizeUnit(
            _.toNumber(
              checkPresetInfo?.scaling_groups[currentResourceGroup]?.using.mem,
            ) +
              _.toNumber(
                checkPresetInfo?.scaling_groups[currentResourceGroup]?.remaining
                  .mem,
              ) +
              'b',
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

  const resourceLimits: MergedResourceLimits = {
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
                : baiClient._config.maxCPUCoresPerContainer,
              limitParser(checkPresetInfo?.keypair_limits.cpu),
              limitParser(checkPresetInfo?.group_limits.cpu),
              // resourceGroupResourceSize?.cpu,
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
                  convertBinarySizeUnit(currentImageMinM, 'b')?.number,
                  convertBinarySizeUnit(AUTOMATIC_DEFAULT_SHMEM, 'b')?.number,
                  0,
                ]) + 'b',
                AUTOMATIC_DEFAULT_SHMEM,
              ),
            max:
              //handled by 'g(GiB)' unit
              _.min([
                ignorePerContainerConfig
                  ? undefined
                  : baiClient._config.maxMemoryPerContainer,
                limitParser(checkPresetInfo?.keypair_limits.mem) &&
                  convertBinarySizeUnit(
                    limitParser(checkPresetInfo?.keypair_limits.mem) + '',
                    'g',
                  )?.number,
                limitParser(checkPresetInfo?.group_limits.mem) &&
                  convertBinarySizeUnit(
                    limitParser(checkPresetInfo?.group_limits.mem) + '',
                    'g',
                  )?.number,
                // scaling group all mem (using + remaining), string type
                // resourceGroupResourceSize?.mem &&
                //   iSizeToSize(resourceGroupResourceSize?.mem + '', 'g')?.number,
              ]) + 'g',
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
            _.filter(
              currentImage?.resource_limits,
              (supportedAcceleratorInfo) => {
                return supportedAcceleratorInfo?.key === key;
              },
            )?.[0]?.min || '0',
          ),
          max: _.min([
            perContainerLimit || 8,
            limitParser(
              checkPresetInfo?.keypair_limits[key as ResourceSlotName],
            ),
            limitParser(checkPresetInfo?.group_limits[key as ResourceSlotName]),
            // scaling group all cpu (using + remaining), string type
            // resourceGroupResourceSize.accelerators[key],
          ]),
        };
        return result;
      },
      {} as MergedResourceLimits['accelerators'],
    ),
  };
  const remaining: RemainingSlots = {
    accelerators: _.reduce(
      acceleratorSlots,
      (result, value, key) => {
        result[key] =
          _.min([
            _.toNumber(
              checkPresetInfo?.keypair_remaining[key as ResourceSlotName],
            ),
            _.toNumber(
              checkPresetInfo?.group_remaining[key as ResourceSlotName],
            ),
            _.toNumber(
              checkPresetInfo?.scaling_group_remaining[key as ResourceSlotName],
            ),
          ]) ?? Number.MAX_SAFE_INTEGER;
        return result;
      },
      {} as RemainingSlots['accelerators'],
    ),
    cpu:
      _.min([
        limitParser(checkPresetInfo?.keypair_remaining.cpu),
        limitParser(checkPresetInfo?.group_remaining.cpu),
        limitParser(checkPresetInfo?.scaling_group_remaining.cpu),
      ]) ?? Number.MAX_SAFE_INTEGER,
    mem:
      _.min([
        limitParser(checkPresetInfo?.keypair_remaining.mem),
        limitParser(checkPresetInfo?.group_remaining.mem),
        limitParser(checkPresetInfo?.scaling_group_remaining.mem),
      ]) ?? Number.MAX_SAFE_INTEGER,
  };

  return [
    {
      resourceGroupResourceSize,
      resourceLimits,
      remaining,
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
