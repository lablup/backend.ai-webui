/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { compareNumberWithUnits, convertToBinaryUnit } from '../../../helper';
import type {
  ImageResourceLimits,
  MergedResourceLimits,
  ResourcePreset,
} from './resourceLimits';
import * as _ from 'lodash-es';

type ImageWithResourceLimits =
  { readonly resource_limits?: ImageResourceLimits } | null | undefined;

/**
 * Ids of the presets that fit under `resourceLimits` and, when the image needs
 * an accelerator, carry at least the image's minimum of one of them.
 */
export const getAllocatablePresetIds = (
  presets: Array<ResourcePreset> | undefined,
  resourceLimits: MergedResourceLimits,
  currentImage: ImageWithResourceLimits,
) => {
  const currentImageAcceleratorLimits = _.filter(
    currentImage?.resource_limits,
    (limit) =>
      limit ? !_.includes(['cpu', 'mem', 'shmem'], limit.key) : false,
  );

  const bySliderLimit = _.filter(presets, (preset) => {
    // `allocatable` is not checked: pending sessions are allowed.
    // resourceLimits values are strings (mem) or numbers (others).
    return _.every(preset.resource_slots, (_value, key) => {
      if (key === 'mem') {
        // no mem limit means UNLIMITED
        const isNoLimit = typeof resourceLimits[key]?.max !== 'string';
        return isNoLimit
          ? true
          : typeof preset.resource_slots[key] === 'string' &&
              typeof resourceLimits[key]?.max === 'string' &&
              compareNumberWithUnits(
                preset.resource_slots[key],
                resourceLimits[key]?.max,
              ) <= 0;
      } else if (key === 'shmem') {
        return true;
      } else if (key === 'cpu') {
        const isNoLimit = _.isNaN(_.toNumber(resourceLimits[key]?.max));
        return isNoLimit
          ? true
          : (_.toNumber(preset.resource_slots[key]) || 0) <=
              _.toNumber(resourceLimits[key]?.max);
      } else {
        const isNoLimit = _.isNaN(
          _.toNumber(resourceLimits.accelerators[key]?.max),
        );
        return isNoLimit
          ? true
          : (_.toNumber(preset.resource_slots[key]) || 0) <=
              _.toNumber(resourceLimits.accelerators[key]?.max);
      }
    });
  }).map((preset) => preset.id);

  const byImageAcceleratorLimits = _.filter(presets, (preset) => {
    const acceleratorResourceOfPreset = _.omitBy(
      preset.resource_slots,
      (_value, key) => {
        if (['mem', 'cpu', 'shmem'].includes(key)) return true;
      },
    );
    if (currentImageAcceleratorLimits.length === 0) {
      // dead branch: the result is only intersected when the image needs an accelerator
      return _.isEmpty(acceleratorResourceOfPreset);
    } else {
      return (
        currentImageAcceleratorLimits &&
        _.some(currentImageAcceleratorLimits, (limit) => {
          return (
            limit?.key &&
            acceleratorResourceOfPreset[limit?.key] &&
            _.toNumber(acceleratorResourceOfPreset[limit?.key]) >=
              _.toNumber(limit?.min)
          );
        })
      );
    }
  }).map((preset) => preset.id);
  return currentImageAcceleratorLimits.length === 0
    ? bySliderLimit
    : _.intersection(bySliderLimit, byImageAcceleratorLimits);
};

export type AutoPresetChoice =
  /** The stored preset (custom / minimum-required / an allocatable id) stays. */
  | { kind: 'keep' }
  | { kind: 'preset'; presetId: string }
  | { kind: 'fallback'; allocationPreset: 'minimum-required' | null };

/**
 * R-03: what `'auto-select'` resolves to once the RG's slots are loaded —
 * keep a custom / minimum-required / allocatable preset, else the first
 * allocatable preset by name, else minimum-required (or `null` when custom
 * allocation is not allowed).
 */
export const pickAutoPreset = ({
  storedPreset,
  presets,
  allocatablePresetIds,
  enableResourcePresets,
  allowCustomResourceAllocation,
}: {
  storedPreset: string | null | undefined;
  presets: ResourcePreset[] | undefined;
  allocatablePresetIds: string[];
  enableResourcePresets: boolean | undefined;
  allowCustomResourceAllocation: boolean | undefined;
}): AutoPresetChoice => {
  if (_.includes(['custom', 'minimum-required'], storedPreset)) {
    return { kind: 'keep' };
  }
  const firstAllocatablePreset = _.sortBy(
    _.filter(presets, (preset) => allocatablePresetIds.includes(preset.id)),
    'name',
  )[0];
  if (allocatablePresetIds.includes(storedPreset as string)) {
    return { kind: 'keep' };
  } else if (enableResourcePresets && firstAllocatablePreset) {
    return { kind: 'preset', presetId: firstAllocatablePreset.id };
  }
  return {
    kind: 'fallback',
    allocationPreset: allowCustomResourceAllocation ? 'minimum-required' : null,
  };
};

export interface PresetResourceValues {
  resource: {
    acceleratorType?: string;
    accelerator: number;
    mem: string | undefined;
    shmem: string | undefined;
    cpu: number;
  };
  enabledAutomaticShmem: boolean;
}

/**
 * R-09: the form values a preset writes. Only slots present in the RG count;
 * mem/shmem become GiB strings, the accelerator is the first RG accelerator
 * slot the preset sets (0 when none), and a preset shmem turns automatic shmem off.
 */
export const presetToResourceValues = ({
  preset,
  resourceSlotKeysInRG,
  acceleratorSlotKeysInRG,
}: {
  preset: ResourcePreset | undefined;
  resourceSlotKeysInRG: string[];
  acceleratorSlotKeysInRG: string[];
}): PresetResourceValues => {
  const slots = _.pick(preset?.resource_slots, resourceSlotKeysInRG);
  const mem = convertToBinaryUnit(slots?.mem || 0, 'g', 2)?.value;
  const acceleratorObj = _.omit(slots, ['cpu', 'mem', 'shmem']);

  const firstMatchedAcceleratorType = _.find(
    acceleratorSlotKeysInRG,
    (value) => acceleratorObj[value] !== undefined,
  );

  let acceleratorSetting: {
    acceleratorType?: string;
    accelerator: number;
  } = {
    accelerator: 0,
  };
  if (firstMatchedAcceleratorType) {
    acceleratorSetting = {
      acceleratorType: firstMatchedAcceleratorType,
      accelerator: Number(acceleratorObj[firstMatchedAcceleratorType] || 0),
    };
  }

  const hasPresetShmem =
    preset?.shared_memory && Number(preset.shared_memory) > 0;

  return {
    resource: {
      ...acceleratorSetting,
      mem,
      shmem: convertToBinaryUnit(preset?.shared_memory || 0, 'g', 2)?.value,
      cpu: parseInt(slots?.cpu || '0') || 0,
    },
    enabledAutomaticShmem: !hasPresetShmem,
  };
};
