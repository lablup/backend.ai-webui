import { useSuspendedBackendaiClient } from '.';
import { Image } from '../components/ImageEnvironmentSelectFormItems';
import { AUTOMATIC_DEFAULT_SHMEM } from '../components/ResourceAllocationFormItems';
import { addNumberWithUnits, iSizeToSize } from '../helper';
import { useResourceSlots } from '../hooks/backendai';
import { useSuspenseTanQuery } from './reactQueryAlias';
import _ from 'lodash';

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
  cpu: string | 'Infinity' | 'NaN';
  mem: string | 'Infinity' | 'NaN';
  'cuda.device': string | 'Infinity' | 'NaN';
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
}

// determine resource limits and remaining for current resource group and current image in current project
export const useResourceLimitAndRemaining = ({
  currentImage,
  currentResourceGroup = '',
  currentProjectName,
  ignorePerContainerConfig = false,
}: Props) => {
  const baiClient = useSuspendedBackendaiClient();
  const [resourceSlots] = useResourceSlots();
  const acceleratorSlots = _.omit(resourceSlots, ['cpu', 'mem', 'shmem']);

  const {
    data: checkPresetInfo,
    refetch,
    isRefetching,
  } = useSuspenseTanQuery<ResourceAllocation | undefined>({
    queryKey: ['check-presets', currentProjectName, currentResourceGroup],
    queryFn: () => {
      if (currentResourceGroup) {
        return baiClient.resourcePreset
          .check({
            group: currentProjectName,
            scaling_group: currentResourceGroup,
          })
          .catch(() => {});
      } else {
        return;
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
        ? iSizeToSize(
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
              resourceGroupResourceSize?.cpu,
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
                  iSizeToSize(currentImageMinM, 'b')?.number,
                  iSizeToSize(AUTOMATIC_DEFAULT_SHMEM, 'b')?.number,
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
                  iSizeToSize(
                    limitParser(checkPresetInfo?.keypair_limits.mem) + '',
                    'g',
                  )?.number,
                limitParser(checkPresetInfo?.group_limits.mem) &&
                  iSizeToSize(
                    limitParser(checkPresetInfo?.group_limits.mem) + '',
                    'g',
                  )?.number,
                // scaling group all mem (using + remaining), string type
                resourceGroupResourceSize?.mem &&
                  iSizeToSize(resourceGroupResourceSize?.mem + '', 'g')?.number,
              ]) + 'g',
          },
    // shmem:
    //   resourceSlots?.mem === undefined
    //     ? undefined
    //     : {
    //         min: _.max([
    //           _.find(currentImage?.resource_limits, (i) => i?.key === 'shmem')
    //             ?.min,
    //           '64m',
    //         ]),
    //       },
    accelerators: _.reduce(
      acceleratorSlots,
      (result, value, key) => {
        const configName =
          {
            'cuda.device': 'maxCUDADevicesPerContainer',
            'cuda.shares': 'maxCUDASharesPerContainer',
            'rocm.device': 'maxROCMDevicesPerContainer',
            'tpu.device': 'maxTPUDevicesPerContainer',
            'ipu.device': 'maxIPUDevicesPerContainer',
            'atom.device': 'maxATOMDevicesPerContainer',
            'atom-plus.device': 'maxATOMPlusDevicesPerContainer',
            'gaudi2.device': 'maxGaudi2DevicesPerContainer',
            'warboy.device': 'maxWarboyDevicesPerContainer',
            'hyperaccel-lpu.device': 'maxHyperaccelLPUDevicesPerContainer', // FIXME: add maxLPUDevicesPerContainer to config
          }[key] || 'cuda.device'; // FIXME: temporally `cuda.device` config, when undefined
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
            baiClient._config[configName] || 8,
            // scaling group all cpu (using + remaining), string type
            resourceGroupResourceSize.accelerators[key],
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
            // @ts-ignore
            _.toNumber(checkPresetInfo?.keypair_remaining[key]),
            // @ts-ignore
            _.toNumber(checkPresetInfo?.group_remaining[key]),
            // @ts-ignore
            _.toNumber(checkPresetInfo?.scaling_group_remaining[key]),
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
