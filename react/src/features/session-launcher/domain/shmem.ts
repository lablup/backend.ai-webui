/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  addNumberWithUnits,
  compareNumberWithUnits,
  convertToBinaryUnit,
} from '../../../helper';
import { isUnifiedAcceleratorSlot } from './accelerator';
import type {
  ImageResourceLimits,
  MergedResourceLimits,
} from './resourceLimits';
import * as _ from 'lodash-es';

export const AUTOMATIC_DEFAULT_SHMEM = '64m';

/**
 * The shmem the automatic rule picks for a memory size `M_plus_S`: `1g` once
 * M+S reaches both 4G and the image's minimum memory + 1G, otherwise
 * `AUTOMATIC_DEFAULT_SHMEM`.
 */
export const getAutomaticShmem = (M_plus_S: string, imageMinMem: string) => {
  return compareNumberWithUnits(M_plus_S, '4g') >= 0 &&
    compareNumberWithUnits(
      M_plus_S,
      addNumberWithUnits(imageMinMem, '1g') || '0b',
    ) >= 0 &&
    // if 1G < AUTOMATIC_DEFAULT_SHMEM, no need to apply 1G rule
    compareNumberWithUnits('1g', AUTOMATIC_DEFAULT_SHMEM) > 0
    ? '1g'
    : AUTOMATIC_DEFAULT_SHMEM;
};

/**
 * The entries of `next` that differ from `current`; `mem` / `shmem` compare
 * by size, so `1g` and `1024m` count as unchanged (FR-3985).
 */
export const pickChangedResourceValues = <T extends Record<string, unknown>>(
  next: T,
  current: Record<string, unknown> | undefined,
): Partial<T> =>
  _.pickBy(next, (value, key) => {
    const currentValue = current?.[key];
    if (_.isEqual(value, currentValue)) return false;
    if (
      (key === 'mem' || key === 'shmem') &&
      _.isString(value) &&
      _.isString(currentValue)
    ) {
      return compareNumberWithUnits(value, currentValue) !== 0;
    }
    return true;
  }) as Partial<T>;

export type ResourceValues = {
  cpu?: number;
  mem?: string;
  shmem?: string;
  accelerator?: number;
  acceleratorType?: string;
};

/**
 * R-08: the resource minimums an image imposes. `acceleratorType` /
 * `accelerator` follow the current type when the image supports it, else the
 * image's first type present in the RG; `accelerator` is 0 for an image with
 * no accelerator limits. `mem` adds `shmem.min`, which is never populated (H3).
 */
export const imageMinimumResources = ({
  resourceLimits,
  imageAcceleratorLimits,
  currentAcceleratorType,
  resourceSlotKeysInRG,
}: {
  resourceLimits: MergedResourceLimits;
  imageAcceleratorLimits: ImageResourceLimits;
  currentAcceleratorType: string | undefined;
  resourceSlotKeysInRG: string[];
}): ResourceValues => {
  const minimumResources: ResourceValues = {
    cpu: resourceLimits.cpu?.min,
    mem:
      convertToBinaryUnit(
        (convertToBinaryUnit(resourceLimits.shmem?.min, 'm')?.number || 0) +
          (convertToBinaryUnit(resourceLimits.mem?.min, 'm')?.number || 0) +
          'm',
        'g',
      )?.number + 'g', //to prevent loosing precision
  };

  if (imageAcceleratorLimits && imageAcceleratorLimits.length > 0) {
    if (
      _.find(
        imageAcceleratorLimits,
        (limit) => limit?.key === currentAcceleratorType,
      )
    ) {
      minimumResources.acceleratorType = currentAcceleratorType;
      minimumResources.accelerator =
        resourceLimits.accelerators[currentAcceleratorType as string]?.min;
    } else {
      // resourceSlots and the image's supported slots can differ; take the first in both.
      const nextImageSelectorType: string | undefined | null = _.filter(
        imageAcceleratorLimits,
        (acceleratorInfo) =>
          resourceSlotKeysInRG.includes(acceleratorInfo?.key as string),
      )[0]?.key;

      if (nextImageSelectorType) {
        minimumResources.accelerator =
          resourceLimits.accelerators[nextImageSelectorType]?.min;
        minimumResources.acceleratorType = nextImageSelectorType;
      }
    }
  } else {
    minimumResources.accelerator = 0;
  }
  return minimumResources;
};

/**
 * R-05: drop each minimum that is below the current value, so an image change
 * only raises values. Mutates nothing; returns the minimums still to apply.
 */
export const raiseToMinimums = (
  current: ResourceValues | undefined,
  minimums: ResourceValues,
): ResourceValues => {
  const next = { ...minimums };
  (['cpu', 'accelerator'] as const).forEach((key) => {
    const minNum = next[key];
    if (_.isNumber(minNum) && minNum < (current?.[key] as number)) {
      delete next[key];
    }
  });
  (['mem', 'shmem'] as const).forEach((key) => {
    const minNumStr = next[key];
    if (
      _.isString(minNumStr) &&
      compareNumberWithUnits(minNumStr, current?.[key] as string) < 0
    ) {
      delete next[key];
    }
  });
  return next;
};

/** R-08: whether the image-minimum write targets a unified slot (accelerator stays cleared). */
export const isUnifiedMinimumTarget = (
  minimums: ResourceValues,
  currentAcceleratorType: string | undefined,
) =>
  isUnifiedAcceleratorSlot(minimums.acceleratorType ?? currentAcceleratorType);
