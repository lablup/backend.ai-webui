/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { addNumberWithUnits, convertToBinaryUnit } from '../../../helper';
import type { ResourceSlotName } from '../../../hooks/backendai';
import { AUTOMATIC_DEFAULT_SHMEM } from './shmem';
import * as _ from 'lodash-es';

export const maxPerContainerRegex = /^max([A-Za-z0-9]+)PerContainer$/;

export const isMatchingMaxPerContainer = (configName: string, key: string) => {
  const match = configName.match(maxPerContainerRegex);
  if (match) {
    const configLowerCase = match[1].toLowerCase();
    const keyLowerCase = key.replaceAll(/[.-]/g, '').toLowerCase();
    // Config names do not always match slot names: cuda.shares => maxCUDASharesPerContainer,
    // cuda.device => maxCUDADevicesPerContainer (plural).
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

export type ResourceGroupResourceSize = {
  cpu?: number;
  mem?: string;
  accelerators: {
    [key: string]: number | undefined;
  };
};

/** `undefined`, `'Infinity'` and `'NaN'` mean "no limit". */
export const limitParser = (limit: string | undefined) => {
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

/** An image's `resource_limits` (the Relay shape, structurally). */
export type ImageResourceLimits =
  | ReadonlyArray<
      | { readonly key?: string | null; readonly min?: string | null }
      | null
      | undefined
    >
  | null
  | undefined;

/** The image's minimum memory, `'0g'` when it declares none. */
export const getImageMinMem = (imageResourceLimits: ImageResourceLimits) =>
  _.find(imageResourceLimits, (i) => i?.key === 'mem')?.min || '0g';

export interface ResourceLimitsConfig {
  maxCPUCoresPerContainer?: number;
  maxMemoryPerContainer?: number;
  maxCUDADevicesPerContainer?: number;
  [key: string]: unknown;
}

export interface ComputeResourceLimitsInput {
  /** Slot names known to the manager; `cpu`/`mem` absent means the slot is not loaded. */
  resourceSlots: Record<string, unknown> | undefined;
  acceleratorSlots: Record<string, unknown>;
  imageResourceLimits: ImageResourceLimits;
  imageMinMem: string;
  /** The client config; `max*PerContainer` keys cap per-container values. */
  config: ResourceLimitsConfig;
  ignorePerContainerConfig: boolean;
  checkPresetInfo: ResourceAllocation | null | undefined;
  resourceGroupSlotLimits: Partial<ResourceSlots>;
  includeResourceGroupLimits: boolean;
}

/**
 * Per-slot min/max for the launcher: min from the image (mem min also adds
 * `AUTOMATIC_DEFAULT_SHMEM`), max = the smallest of per-container config,
 * keypair, project and (optionally) resource-group limits.
 */
export const computeResourceLimits = ({
  resourceSlots,
  acceleratorSlots,
  imageResourceLimits,
  imageMinMem,
  config,
  ignorePerContainerConfig,
  checkPresetInfo,
  resourceGroupSlotLimits,
  includeResourceGroupLimits,
}: ComputeResourceLimitsInput): MergedResourceLimits => {
  const perContainerConfigs = _.omitBy(config, (_value, key) => {
    return !maxPerContainerRegex.test(key);
  }) as {
    [key: string]: number;
  };
  return {
    cpu:
      resourceSlots?.cpu === undefined
        ? undefined
        : {
            min: _.max([
              _.toNumber(
                _.find(imageResourceLimits, (i) => i?.key === 'cpu')?.min ||
                  '0',
              ),
            ]),
            max: _.min([
              ignorePerContainerConfig
                ? undefined
                : config.maxCPUCoresPerContainer,
              limitParser(checkPresetInfo?.keypair_limits.cpu),
              limitParser(checkPresetInfo?.group_limits.cpu),
              includeResourceGroupLimits
                ? limitParser(resourceGroupSlotLimits.cpu)
                : undefined,
            ]),
          },
    mem:
      resourceSlots?.mem === undefined
        ? undefined
        : {
            // M+S must exceed max(image mem min, AUTOMATIC_DEFAULT_SHMEM) + AUTOMATIC_DEFAULT_SHMEM (S cannot exceed M).
            min: addNumberWithUnits(
              _.max([
                convertToBinaryUnit(imageMinMem, '')?.number,
                convertToBinaryUnit(AUTOMATIC_DEFAULT_SHMEM, '')?.number,
                0,
              ]) + '',
              AUTOMATIC_DEFAULT_SHMEM,
            ),
            max: (() => {
              // in GiB
              const minValue = _.min([
                ignorePerContainerConfig
                  ? undefined
                  : config.maxMemoryPerContainer,
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
                  ? limitParser(resourceGroupSlotLimits.mem) &&
                    convertToBinaryUnit(
                      limitParser(resourceGroupSlotLimits.mem) + '',
                      'g',
                    )?.number
                  : undefined,
              ]);
              return minValue !== undefined ? minValue + 'g' : undefined;
            })(),
          },
    accelerators: _.reduce(
      acceleratorSlots,
      (result, _value, key) => {
        const perContainerLimit =
          _.find(perContainerConfigs, (_configValue, configName) => {
            return isMatchingMaxPerContainer(configName, key);
          }) ?? config.maxCUDADevicesPerContainer; // fallback when no slot-specific config exists

        result[key] = {
          min: parseInt(
            _.find(imageResourceLimits, (supportedAcceleratorInfo) => {
              return supportedAcceleratorInfo?.key === key;
            })?.min || '0',
          ),
          max: _.min([
            ignorePerContainerConfig ? undefined : perContainerLimit || 8,
            limitParser(
              checkPresetInfo?.keypair_limits[key as ResourceSlotName],
            ),
            limitParser(checkPresetInfo?.group_limits[key as ResourceSlotName]),
            includeResourceGroupLimits
              ? limitParser(resourceGroupSlotLimits[key as ResourceSlotName])
              : undefined,
          ]),
        };
        return result;
      },
      {} as MergedResourceLimits['accelerators'],
    ),
  };
};

/** Remaining = the smallest of keypair, project and (optionally) resource-group remaining. */
export const computeRemaining = ({
  acceleratorSlots,
  checkPresetInfo,
  includeScalingGroupRemaining,
}: {
  acceleratorSlots: Record<string, unknown>;
  checkPresetInfo: ResourceAllocation | null | undefined;
  includeScalingGroupRemaining: boolean;
}): RemainingSlots => ({
  accelerators: _.reduce(
    acceleratorSlots,
    (result, _value, key) => {
      result[key] = _.min([
        _.toNumber(checkPresetInfo?.keypair_remaining[key as ResourceSlotName]),
        _.toNumber(checkPresetInfo?.group_remaining[key as ResourceSlotName]),
        includeScalingGroupRemaining
          ? _.toNumber(
              checkPresetInfo?.scaling_group_remaining[key as ResourceSlotName],
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

/** A resource group's total capacity (using + remaining) per slot; `undefined` when either is missing. */
export const computeResourceGroupResourceSize = ({
  acceleratorSlots,
  checkPresetInfo,
  resourceGroup,
}: {
  acceleratorSlots: Record<string, unknown>;
  checkPresetInfo: ResourceAllocation | null | undefined;
  resourceGroup: string;
}): ResourceGroupResourceSize => {
  const group = checkPresetInfo?.scaling_groups[resourceGroup];
  const sum = (key: string) =>
    !_.isEmpty(group?.using?.[key as ResourceSlotName]) &&
    !_.isEmpty(group?.remaining?.[key as ResourceSlotName])
      ? _.toNumber(group?.using[key as ResourceSlotName]) +
        _.toNumber(group?.remaining[key as ResourceSlotName])
      : undefined;
  const memTotal = sum('mem');
  return {
    cpu: sum('cpu'),
    mem:
      memTotal !== undefined
        ? convertToBinaryUnit(memTotal, 'g', 2)?.numberFixed + 'g'
        : undefined,
    accelerators: _.reduce(
      acceleratorSlots,
      (result, _value, key) => {
        result[key] = sum(key);
        return result;
      },
      {} as ResourceGroupResourceSize['accelerators'],
    ),
  };
};
