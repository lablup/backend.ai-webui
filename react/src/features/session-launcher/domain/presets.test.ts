/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  getAllocatablePresetIds,
  pickAutoPreset,
  presetToResourceValues,
} from './presets';
import type { MergedResourceLimits, ResourcePreset } from './resourceLimits';

const GiB = 1024 ** 3;

const preset = (
  id: string,
  name: string,
  slots: Record<string, string>,
  sharedMemory: string | null = null,
): ResourcePreset => ({
  id,
  name,
  resource_slots: { cpu: '1', mem: String(GiB), ...slots },
  shared_memory: sharedMemory,
  allocatable: true,
});

describe('pickAutoPreset (R-03)', () => {
  const presets = [
    preset('id-b', 'b-preset', {}),
    preset('id-a', 'a-preset', {}),
    preset('id-c', 'c-preset', {}),
  ];
  it.each([
    {
      name: 'custom stays',
      stored: 'custom',
      allocatable: ['id-a'],
      expected: { kind: 'keep' },
    },
    {
      name: 'minimum-required stays',
      stored: 'minimum-required',
      allocatable: ['id-a'],
      expected: { kind: 'keep' },
    },
    {
      name: 'an allocatable stored preset stays',
      stored: 'id-c',
      allocatable: ['id-a', 'id-c'],
      expected: { kind: 'keep' },
    },
    {
      name: 'auto-select picks the first allocatable preset by name',
      stored: 'auto-select',
      allocatable: ['id-b', 'id-a'],
      expected: { kind: 'preset', presetId: 'id-a' },
    },
    {
      name: 'a non-allocatable stored preset is replaced',
      stored: 'id-c',
      allocatable: ['id-b'],
      expected: { kind: 'preset', presetId: 'id-b' },
    },
    {
      name: 'nothing allocatable falls back to minimum-required',
      stored: 'auto-select',
      allocatable: [],
      expected: { kind: 'fallback', allocationPreset: 'minimum-required' },
    },
    {
      name: 'nothing allocatable without custom allocation falls back to null',
      stored: 'auto-select',
      allocatable: [],
      allowCustom: false,
      expected: { kind: 'fallback', allocationPreset: null },
    },
    {
      name: 'presets disabled falls back even when one fits',
      stored: 'auto-select',
      allocatable: ['id-a'],
      enablePresets: false,
      expected: { kind: 'fallback', allocationPreset: 'minimum-required' },
    },
  ])(
    '$name',
    ({
      stored,
      allocatable,
      allowCustom = true,
      enablePresets = true,
      expected,
    }) => {
      expect(
        pickAutoPreset({
          storedPreset: stored,
          presets,
          allocatablePresetIds: allocatable,
          enableResourcePresets: enablePresets,
          allowCustomResourceAllocation: allowCustom,
        }),
      ).toEqual(expected);
    },
  );
});

describe('presetToResourceValues (R-09)', () => {
  it.each([
    {
      name: 'cpu/mem only: accelerator 0, automatic shmem on',
      preset: preset('p', 'p', { cpu: '2', mem: String(4 * GiB) }),
      expected: {
        resource: { accelerator: 0, mem: '4g', shmem: '0g', cpu: 2 },
        enabledAutomaticShmem: true,
      },
    },
    {
      name: 'first RG accelerator slot the preset sets',
      preset: preset('p', 'p', {
        cpu: '4',
        mem: String(8 * GiB),
        'cuda.shares': '0.5',
        'cuda.device': '2',
      }),
      expected: {
        resource: {
          acceleratorType: 'cuda.device',
          accelerator: 2,
          mem: '8g',
          shmem: '0g',
          cpu: 4,
        },
        enabledAutomaticShmem: true,
      },
    },
    {
      name: 'slots absent from the RG are ignored',
      preset: preset('p', 'p', { 'rocm.device': '1' }),
      expected: {
        resource: { accelerator: 0, mem: '1g', shmem: '0g', cpu: 1 },
        enabledAutomaticShmem: true,
      },
    },
    {
      name: 'a preset shmem is applied and turns automatic shmem off',
      preset: preset('p', 'p', {}, String(2 * GiB)),
      expected: {
        resource: { accelerator: 0, mem: '1g', shmem: '2g', cpu: 1 },
        enabledAutomaticShmem: false,
      },
    },
    {
      name: 'a zero preset shmem keeps automatic shmem on',
      preset: preset('p', 'p', {}, '0'),
      expected: {
        resource: { accelerator: 0, mem: '1g', shmem: '0g', cpu: 1 },
        enabledAutomaticShmem: true,
      },
    },
    {
      name: 'an unknown preset writes zeros',
      preset: undefined,
      expected: {
        resource: { accelerator: 0, mem: '0g', shmem: '0g', cpu: 0 },
        enabledAutomaticShmem: true,
      },
    },
  ])('$name', ({ preset, expected }) => {
    expect(
      presetToResourceValues({
        preset,
        resourceSlotKeysInRG: ['cpu', 'mem', 'cuda.device', 'cuda.shares'],
        acceleratorSlotKeysInRG: ['cuda.device', 'cuda.shares'],
      }),
    ).toEqual(expected);
  });
});

describe('getAllocatablePresetIds (R-03 input)', () => {
  const limits: MergedResourceLimits = {
    cpu: { min: 0, max: 4 },
    mem: { min: '128m', max: '8g' },
    accelerators: { 'cuda.device': { min: 0, max: 2 } },
  };
  const presets = [
    preset('small', 'small', { cpu: '2', mem: String(4 * GiB) }),
    preset('big-cpu', 'big-cpu', { cpu: '8', mem: String(4 * GiB) }),
    preset('gpu1', 'gpu1', { cpu: '2', 'cuda.device': '1' }),
    preset('gpu4', 'gpu4', { cpu: '2', 'cuda.device': '4' }),
  ];
  it.each([
    {
      // The "image without accelerator → preset without accelerator" filter is
      // computed but never applied: only the slider limits count here.
      name: 'image without accelerator: only the limits apply',
      image: { resource_limits: [{ key: 'cpu', min: '1' }] },
      expected: ['small', 'gpu1'],
    },
    {
      name: 'accelerator image: within limits and at least the image minimum',
      image: {
        resource_limits: [
          { key: 'cpu', min: '1' },
          { key: 'cuda.device', min: '1' },
        ],
      },
      expected: ['gpu1'],
    },
    {
      name: 'no image behaves like an image without accelerator',
      image: undefined,
      expected: ['small', 'gpu1'],
    },
  ])('$name', ({ image, expected }) => {
    expect(getAllocatablePresetIds(presets, limits, image)).toEqual(expected);
  });
});
