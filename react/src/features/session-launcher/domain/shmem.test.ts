/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MergedResourceLimits } from './resourceLimits';
import {
  AUTOMATIC_DEFAULT_SHMEM,
  getAutomaticShmem,
  imageMinimumResources,
  isUnifiedMinimumTarget,
  pickChangedResourceValues,
  raiseToMinimums,
} from './shmem';

describe('getAutomaticShmem (R-06)', () => {
  it.each([
    { mem: '2g', imageMin: '0g', expected: AUTOMATIC_DEFAULT_SHMEM },
    { mem: '4g', imageMin: '0g', expected: '1g' },
    { mem: '16g', imageMin: '1g', expected: '1g' },
    // below image min + 1G
    { mem: '4g', imageMin: '4g', expected: AUTOMATIC_DEFAULT_SHMEM },
    { mem: '5g', imageMin: '4g', expected: '1g' },
  ])(
    '$mem with image min $imageMin -> $expected',
    ({ mem, imageMin, expected }) => {
      expect(getAutomaticShmem(mem, imageMin)).toBe(expected);
    },
  );
});

describe('pickChangedResourceValues (R-51)', () => {
  it.each([
    {
      name: 'same size in another unit is unchanged',
      next: { mem: '1g', shmem: '1024m' },
      current: { mem: '1024m', shmem: '1g' },
      expected: {},
    },
    {
      name: 'a different size is kept',
      next: { mem: '2g' },
      current: { mem: '1g' },
      expected: { mem: '2g' },
    },
    {
      name: 'numbers compare by value',
      next: { cpu: 2, accelerator: 0 },
      current: { cpu: 2, accelerator: 1 },
      expected: { accelerator: 0 },
    },
    {
      name: 'everything is new without a current value',
      next: { cpu: 1 },
      current: undefined,
      expected: { cpu: 1 },
    },
  ])('$name', ({ next, current, expected }) => {
    expect(pickChangedResourceValues(next, current)).toEqual(expected);
  });
});

const limits = (
  accelerators: MergedResourceLimits['accelerators'] = {},
): MergedResourceLimits => ({
  cpu: { min: 2, max: 8 },
  mem: { min: '1088m', max: '32g' },
  accelerators,
});

describe('imageMinimumResources (R-08)', () => {
  it.each([
    {
      name: 'image without accelerator -> accelerator 0',
      imageAcceleratorLimits: [],
      currentAcceleratorType: 'cuda.device',
      expected: { cpu: 2, mem: '1.0625g', accelerator: 0 },
    },
    {
      name: 'image not determined -> accelerator 0',
      imageAcceleratorLimits: undefined,
      currentAcceleratorType: undefined,
      expected: { cpu: 2, mem: '1.0625g', accelerator: 0 },
    },
    {
      name: 'current type supported by the image keeps it',
      imageAcceleratorLimits: [
        { key: 'cuda.shares', min: '0.5' },
        { key: 'cuda.device', min: '1' },
      ],
      currentAcceleratorType: 'cuda.device',
      expected: {
        cpu: 2,
        mem: '1.0625g',
        acceleratorType: 'cuda.device',
        accelerator: 1,
      },
    },
    {
      name: 'unsupported current type moves to the first image type in the RG',
      imageAcceleratorLimits: [
        { key: 'rocm.device', min: '1' },
        { key: 'cuda.shares', min: '0.5' },
      ],
      currentAcceleratorType: 'cuda.device',
      expected: {
        cpu: 2,
        mem: '1.0625g',
        acceleratorType: 'cuda.shares',
        accelerator: 0.5,
      },
    },
    {
      name: 'no image type in the RG leaves the accelerator alone',
      imageAcceleratorLimits: [{ key: 'rocm.device', min: '1' }],
      currentAcceleratorType: 'cuda.device',
      expected: { cpu: 2, mem: '1.0625g' },
    },
  ])(
    '$name',
    ({ imageAcceleratorLimits, currentAcceleratorType, expected }) => {
      expect(
        imageMinimumResources({
          resourceLimits: limits({
            'cuda.device': { min: 1, max: 8 },
            'cuda.shares': { min: 0.5, max: 8 },
          }),
          imageAcceleratorLimits,
          currentAcceleratorType,
          resourceSlotKeysInRG: ['cpu', 'mem', 'cuda.device', 'cuda.shares'],
        }),
      ).toEqual(expected);
    },
  );
});

describe('raiseToMinimums (R-05)', () => {
  it.each([
    {
      name: 'minimums below the current value are dropped',
      current: { cpu: 4, mem: '8g', accelerator: 2 },
      minimums: { cpu: 2, mem: '1g', accelerator: 1 },
      expected: {},
    },
    {
      name: 'minimums above the current value are kept',
      current: { cpu: 1, mem: '512m', accelerator: 0 },
      minimums: { cpu: 2, mem: '1g', accelerator: 1 },
      expected: { cpu: 2, mem: '1g', accelerator: 1 },
    },
    {
      name: 'equal values are kept',
      current: { cpu: 2, mem: '1024m' },
      minimums: { cpu: 2, mem: '1g' },
      expected: { cpu: 2, mem: '1g' },
    },
    {
      name: 'acceleratorType is never dropped',
      current: { accelerator: 4, acceleratorType: 'cuda.device' },
      minimums: { accelerator: 1, acceleratorType: 'cuda.shares' },
      expected: { acceleratorType: 'cuda.shares' },
    },
  ])('$name', ({ current, minimums, expected }) => {
    expect(raiseToMinimums(current, minimums)).toEqual(expected);
  });

  it('does not mutate the minimums', () => {
    const minimums = { cpu: 1 };
    raiseToMinimums({ cpu: 4 }, minimums);
    expect(minimums).toEqual({ cpu: 1 });
  });
});

describe('isUnifiedMinimumTarget', () => {
  it.each([
    [{ acceleratorType: 'cuda.unified' }, 'cuda.device', true],
    [{ acceleratorType: 'cuda.device' }, 'cuda.unified', false],
    [{}, 'cuda.unified', true],
    [{}, undefined, false],
  ])('%o / %s -> %s', (minimums, current, expected) => {
    expect(isUnifiedMinimumTarget(minimums, current)).toBe(expected);
  });
});
