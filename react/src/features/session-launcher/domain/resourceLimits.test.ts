/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type ComputeResourceLimitsInput,
  computeRemaining,
  computeResourceGroupResourceSize,
  computeResourceLimits,
  getImageMinMem,
  isMatchingMaxPerContainer,
  limitParser,
  type ResourceAllocation,
} from './resourceLimits';

const GiB = 1024 ** 3;

const checkPresetInfo = (
  overrides: Partial<ResourceAllocation> = {},
): ResourceAllocation => ({
  keypair_limits: {},
  keypair_using: {},
  keypair_remaining: {},
  scaling_group_remaining: {},
  scaling_groups: {},
  presets: [],
  group_limits: {},
  group_using: {},
  group_remaining: {},
  ...overrides,
});

const baseInput = (
  overrides: Partial<ComputeResourceLimitsInput> = {},
): ComputeResourceLimitsInput => ({
  resourceSlots: { cpu: 'count', mem: 'bytes', 'cuda.device': 'count' },
  acceleratorSlots: { 'cuda.device': 'count' },
  imageResourceLimits: [],
  imageMinMem: '0g',
  config: {},
  ignorePerContainerConfig: false,
  checkPresetInfo: checkPresetInfo(),
  resourceGroupSlotLimits: {},
  includeResourceGroupLimits: true,
  ...overrides,
});

describe('limitParser', () => {
  it.each([
    [undefined, undefined],
    ['Infinity', undefined],
    ['NaN', undefined],
    ['4', 4],
    ['0', 0],
  ])('%s -> %s', (value, expected) => {
    expect(limitParser(value)).toBe(expected);
  });
});

describe('isMatchingMaxPerContainer', () => {
  it.each([
    ['maxCUDADevicesPerContainer', 'cuda.device', true],
    ['maxCUDASharesPerContainer', 'cuda.shares', true],
    ['maxROCMDevicesPerContainer', 'rocm.device', true],
    ['maxCUDADevicesPerContainer', 'cuda.shares', false],
    ['maxCPUCoresPerContainer', 'cpu', false],
    ['somethingElse', 'cuda.device', false],
  ])('%s / %s -> %s', (configName, key, expected) => {
    expect(isMatchingMaxPerContainer(configName, key)).toBe(expected);
  });
});

describe('getImageMinMem', () => {
  it.each([
    [[{ key: 'mem', min: '2g' }], '2g'],
    [[{ key: 'cpu', min: '1' }], '0g'],
    [undefined, '0g'],
  ])('%o -> %s', (limits, expected) => {
    expect(getImageMinMem(limits)).toBe(expected);
  });
});

describe('computeResourceLimits', () => {
  it('cpu min comes from the image; max is the smallest configured cap', () => {
    const limits = computeResourceLimits(
      baseInput({
        imageResourceLimits: [{ key: 'cpu', min: '2' }],
        config: { maxCPUCoresPerContainer: 16 },
        checkPresetInfo: checkPresetInfo({
          keypair_limits: { cpu: '8' },
          group_limits: { cpu: 'Infinity' },
        }),
        resourceGroupSlotLimits: { cpu: '4' },
      }),
    );
    expect(limits.cpu).toEqual({ min: 2, max: 4 });
  });

  it.each([
    { name: 'with RG limits', include: true, expected: 4 },
    { name: 'without RG limits', include: false, expected: 8 },
  ])('cpu max $name', ({ include, expected }) => {
    expect(
      computeResourceLimits(
        baseInput({
          checkPresetInfo: checkPresetInfo({ keypair_limits: { cpu: '8' } }),
          resourceGroupSlotLimits: { cpu: '4' },
          includeResourceGroupLimits: include,
        }),
      ).cpu?.max,
    ).toBe(expected);
  });

  it('ignorePerContainerConfig drops the per-container caps', () => {
    const limits = computeResourceLimits(
      baseInput({
        config: {
          maxCPUCoresPerContainer: 2,
          maxMemoryPerContainer: 4,
          maxCUDADevicesPerContainer: 1,
        },
        ignorePerContainerConfig: true,
      }),
    );
    expect(limits.cpu?.max).toBeUndefined();
    expect(limits.mem?.max).toBeUndefined();
    expect(limits.accelerators['cuda.device']?.max).toBeUndefined();
  });

  it.each([
    // M+S floor: max(image mem min, 64m) + 64m
    { imageMinMem: '0g', expected: '128m' },
    { imageMinMem: '32m', expected: '128m' },
    { imageMinMem: '1g', expected: '1088m' },
  ])(
    'mem min for image min $imageMinMem is $expected',
    ({ imageMinMem, expected }) => {
      expect(computeResourceLimits(baseInput({ imageMinMem })).mem?.min).toBe(
        expected,
      );
    },
  );

  it('mem max is the smallest cap in GiB', () => {
    const limits = computeResourceLimits(
      baseInput({
        config: { maxMemoryPerContainer: 64 },
        checkPresetInfo: checkPresetInfo({
          keypair_limits: { mem: String(32 * GiB) },
          group_limits: { mem: String(16 * GiB) },
        }),
        resourceGroupSlotLimits: { mem: String(8 * GiB) },
      }),
    );
    expect(limits.mem?.max).toBe('8g');
  });

  it('a slot the manager does not report has no limits', () => {
    const limits = computeResourceLimits(
      baseInput({ resourceSlots: { 'cuda.device': 'count' } }),
    );
    expect(limits.cpu).toBeUndefined();
    expect(limits.mem).toBeUndefined();
  });

  it.each([
    {
      name: 'slot-specific per-container config',
      config: { maxCUDASharesPerContainer: 3, maxCUDADevicesPerContainer: 5 },
      slot: 'cuda.shares',
      expected: 3,
    },
    {
      name: 'falls back to maxCUDADevicesPerContainer',
      config: { maxCUDADevicesPerContainer: 5 },
      slot: 'rocm.device',
      expected: 5,
    },
    {
      name: 'falls back to 8 without any config',
      config: {},
      slot: 'rocm.device',
      expected: 8,
    },
  ])('accelerator max: $name', ({ config, slot, expected }) => {
    const limits = computeResourceLimits(
      baseInput({ config, acceleratorSlots: { [slot]: 'count' } }),
    );
    expect(limits.accelerators[slot]?.max).toBe(expected);
  });

  it('accelerator min comes from the image', () => {
    const limits = computeResourceLimits(
      baseInput({
        imageResourceLimits: [{ key: 'cuda.device', min: '2' }],
        checkPresetInfo: checkPresetInfo({
          keypair_limits: { 'cuda.device': '4' },
        }),
      }),
    );
    expect(limits.accelerators['cuda.device']).toEqual({ min: 2, max: 4 });
  });

  it('shmem limits are never populated (H3)', () => {
    expect(computeResourceLimits(baseInput()).shmem).toBeUndefined();
  });
});

describe('computeRemaining', () => {
  const info = checkPresetInfo({
    keypair_remaining: { cpu: '8', mem: String(16 * GiB), 'cuda.device': '4' },
    group_remaining: { cpu: '6', mem: 'Infinity', 'cuda.device': '3' },
    scaling_group_remaining: {
      cpu: '2',
      mem: String(4 * GiB),
      'cuda.device': '1',
    },
  });
  it.each([
    {
      include: true,
      expected: { cpu: 2, mem: 4 * GiB, accelerators: { 'cuda.device': 1 } },
    },
    {
      include: false,
      expected: { cpu: 6, mem: 16 * GiB, accelerators: { 'cuda.device': 3 } },
    },
  ])('includeScalingGroupRemaining=$include', ({ include, expected }) => {
    expect(
      computeRemaining({
        acceleratorSlots: { 'cuda.device': 'count' },
        checkPresetInfo: info,
        includeScalingGroupRemaining: include,
      }),
    ).toEqual(expected);
  });

  it('without a check result nothing remains known', () => {
    expect(
      computeRemaining({
        acceleratorSlots: { 'cuda.device': 'count' },
        checkPresetInfo: null,
        includeScalingGroupRemaining: true,
      }),
    ).toEqual({
      cpu: undefined,
      mem: undefined,
      accelerators: { 'cuda.device': undefined },
    });
  });
});

describe('computeResourceGroupResourceSize', () => {
  it('sums using + remaining per slot', () => {
    expect(
      computeResourceGroupResourceSize({
        acceleratorSlots: { 'cuda.device': 'count', 'rocm.device': 'count' },
        resourceGroup: 'rg',
        checkPresetInfo: checkPresetInfo({
          scaling_groups: {
            rg: {
              using: { cpu: '2', mem: String(GiB), 'cuda.device': '1' },
              remaining: { cpu: '6', mem: String(3 * GiB), 'cuda.device': '3' },
            },
          },
        }),
      }),
    ).toEqual({
      cpu: 8,
      mem: '4g',
      accelerators: { 'cuda.device': 4, 'rocm.device': undefined },
    });
  });
});
