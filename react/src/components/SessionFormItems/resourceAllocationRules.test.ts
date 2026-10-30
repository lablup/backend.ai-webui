/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import { ResourcePreset } from '../../hooks/useResourceLimitAndRemaining';
import { Image } from '../ImageEnvironmentSelectFormItems';
import {
  getPresetUnavailableReason,
  presetUnavailableReasonText,
} from '../ResourcePresetSelect';
import {
  acceleratorTypeErrorTarget,
  applyRule,
  AUTOMATIC_DEFAULT_SHMEM,
  getSupportedAcceleratorTypes,
  matchesPreset,
  resolveAcceleratorType,
  ResourceValues,
  RuleContext,
  RulePatch,
} from './resourceAllocationRules';
import type { TFunction } from 'i18next';

const GiB = 1024 ** 3;

const makeImage = (overrides: Partial<Image>): Image => ({
  id: 'image-1',
  namespace: 'image',
  digest: 'digest',
  architecture: 'x86_64',
  humanized_name: 'Image',
  installed: true,
  labels: [],
  registry: 'registry',
  tag: 'tag',
  resource_limits: [
    { key: 'cpu', min: '1', max: null },
    { key: 'mem', min: '1g', max: null },
  ],
  base_image_name: undefined,
  tags: undefined,
  version: undefined,
  supported_accelerators: ['*'],
  ...overrides,
});

// Needs `cuda.device`; a `cuda.*` type is the only one it runs on.
const gpuImage = makeImage({
  resource_limits: [
    { key: 'cpu', min: '1', max: null },
    { key: 'mem', min: '1g', max: null },
    { key: 'cuda.device', min: '1', max: null },
  ],
  supported_accelerators: ['cuda'],
});
// Needs no accelerator and runs on any.
const cpuImage = makeImage({});
// Runs on no accelerator type this group has.
const rocmOnlyImage = makeImage({ supported_accelerators: ['rocm'] });

const presets: ResourcePreset[] = [
  {
    id: 'p-gpu',
    name: 'b-gpu',
    resource_slots: { cpu: '4', mem: String(8 * GiB), 'cuda.shares': '2' },
    shared_memory: String(GiB),
    allocatable: true,
  },
  {
    id: 'p-cpu',
    name: 'a-cpu',
    resource_slots: { cpu: '2', mem: String(4 * GiB) },
    shared_memory: null,
    allocatable: true,
  },
  {
    id: 'p-unified',
    name: 'd-unified',
    resource_slots: { cpu: '2', mem: String(4 * GiB), 'cuda.unified': '1' },
    shared_memory: '0',
    allocatable: true,
  },
  {
    id: 'p-rocm',
    name: 'c-rocm',
    resource_slots: { cpu: '1', mem: String(2 * GiB), 'rocm.device': '1' },
    shared_memory: null,
    allocatable: true,
  },
];

const slotsInRG = ['cpu', 'mem', 'cuda.shares', 'cuda.device', 'cuda.unified'];

const makeCtx = (overrides: Partial<RuleContext> = {}): RuleContext => ({
  mode: 'free',
  enableResourcePresets: true,
  image: gpuImage,
  manualImage: false,
  slotsInRG,
  acceleratorSlotsInRG: ['cuda.shares', 'cuda.device', 'cuda.unified'],
  presets,
  allocatablePresetIds: ['p-gpu', 'p-cpu', 'p-unified'],
  resourceLimits: {
    cpu: { min: 1, max: 16 },
    mem: { min: '1g', max: '64g' },
    shmem: { min: '256m' },
    accelerators: {
      'cuda.shares': { min: 0.5, max: 8 },
      'cuda.device': { min: 1, max: 4 },
      'cuda.unified': { min: 1, max: 2 },
    },
  },
  imageMinMem: '1g',
  ...overrides,
});

const presetOnly = (overrides: Partial<RuleContext> = {}) =>
  makeCtx({ mode: 'preset-only', ...overrides });

const makeValues = (
  overrides: Partial<ResourceValues> = {},
): ResourceValues => ({
  resource: {
    cpu: 2,
    mem: '4g',
    shmem: '64m',
    accelerator: 1,
    acceleratorType: 'cuda.device',
  },
  allocationPreset: 'custom',
  enabledAutomaticShmem: true,
  ...overrides,
});

// What the form holds after `patch` is written.
const written = (values: ResourceValues, patch: RulePatch): ResourceValues => ({
  ...values,
  ...patch,
  resource: { ...values.resource, ...patch.resource },
});

// `minimum-required` on `gpuImage` with the fixture limits.
const gpuImageMinimum = {
  cpu: 1,
  mem: '1.25g',
  accelerator: 1,
  acceleratorType: 'cuda.device',
};

// A form exactly on `p-gpu`.
const onGpuPreset = (overrides: Partial<ResourceValues> = {}): ResourceValues =>
  makeValues({
    resource: {
      cpu: 4,
      mem: '8g',
      shmem: '1g',
      accelerator: 2,
      acceleratorType: 'cuda.shares',
    },
    allocationPreset: 'p-gpu',
    enabledAutomaticShmem: false,
    ...overrides,
  });

const dataChanged = { type: 'data.changed' } as const;

describe('applyRule — user events', () => {
  it('a cpu or accelerator edit off the preset relabels custom in free mode only', () => {
    const values = makeValues({ allocationPreset: 'p-gpu' });
    for (const event of [
      { type: 'user.setResource', field: 'cpu', value: 3 } as const,
      { type: 'user.setResource', field: 'accelerator', value: 2 } as const,
    ]) {
      expect(applyRule(values, event, makeCtx())).toEqual({
        allocationPreset: 'custom',
      });
      expect(applyRule(values, event, presetOnly())).toEqual({});
    }
  });

  it('the label follows the values: off the preset reads custom, back on it reads the preset', () => {
    const ctx = makeCtx();
    const edited = written(onGpuPreset(), { resource: { cpu: 5 } });
    const off = applyRule(
      edited,
      { type: 'user.setResource', field: 'cpu', value: 5 },
      ctx,
    );
    expect(off).toEqual({ allocationPreset: 'custom' });
    const back = written(written(edited, off), { resource: { cpu: 4 } });
    expect(
      applyRule(
        back,
        { type: 'user.setResource', field: 'cpu', value: 4 },
        ctx,
      ),
    ).toEqual({ allocationPreset: 'p-gpu' });
    // Only a value edit relabels custom; choosing custom on preset values holds.
    expect(applyRule(back, dataChanged, ctx)).toEqual({});
    expect(
      applyRule(back, { type: 'user.selectPreset', id: 'custom' }, ctx),
    ).toEqual({});
  });

  it('a value edit off the image minimum relabels minimum-required custom', () => {
    const values = makeValues({
      resource: { ...gpuImageMinimum, shmem: '64m', cpu: 2 },
      allocationPreset: 'minimum-required',
    });
    expect(
      applyRule(
        values,
        { type: 'user.setResource', field: 'cpu', value: 2 },
        makeCtx(),
      ),
    ).toEqual({ allocationPreset: 'custom' });
  });

  it('a mem edit recomputes shmem while automatic shmem is on', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, mem: '8g' },
      allocationPreset: 'p-gpu',
    });
    expect(
      applyRule(
        values,
        { type: 'user.setResource', field: 'mem', value: '8g' },
        makeCtx(),
      ),
    ).toEqual({ resource: { shmem: '1g' }, allocationPreset: 'custom' });
  });

  it('a mem edit leaves shmem alone while automatic shmem is off', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, mem: '8g' },
      allocationPreset: 'p-gpu',
      enabledAutomaticShmem: false,
    });
    expect(
      applyRule(
        values,
        { type: 'user.setResource', field: 'mem', value: '8g' },
        makeCtx(),
      ),
    ).toEqual({ allocationPreset: 'custom' });
    expect(
      applyRule(
        values,
        { type: 'user.setResource', field: 'mem', value: '8g' },
        presetOnly(),
      ),
    ).toEqual({});
  });

  it('a mem edit clears a quantity left on a unified slot', () => {
    const values = makeValues({
      resource: {
        ...makeValues().resource,
        mem: '2g',
        acceleratorType: 'cuda.unified',
        accelerator: 1,
      },
      allocationPreset: 'p-gpu',
      enabledAutomaticShmem: false,
    });
    expect(
      applyRule(
        values,
        { type: 'user.setResource', field: 'mem', value: '2g' },
        makeCtx(),
      ),
    ).toEqual({
      resource: { accelerator: undefined },
      allocationPreset: 'custom',
    });
  });

  it('a shmem edit never changes the label, even off a preset that carries shmem or from custom onto a preset', () => {
    const values = written(onGpuPreset(), { resource: { shmem: '512m' } });
    const event = {
      type: 'user.setResource',
      field: 'shmem',
      value: '512m',
    } as const;
    expect(applyRule(values, event, makeCtx())).toEqual({});
    expect(applyRule(values, event, presetOnly())).toEqual({});
    expect(
      applyRule({ ...values, allocationPreset: 'custom' }, event, makeCtx()),
    ).toEqual({});
    const onCpuPreset = makeValues({
      resource: {
        cpu: 2,
        mem: '4g',
        shmem: '512m',
        accelerator: 0,
        acceleratorType: 'cuda.device',
      },
      allocationPreset: 'p-cpu',
    });
    expect(applyRule(onCpuPreset, event, makeCtx())).toEqual({});
  });

  it('turning automatic shmem on recomputes shmem and keeps the label in both modes, custom included', () => {
    const values = onGpuPreset({
      resource: { ...onGpuPreset().resource, shmem: '2g' },
      enabledAutomaticShmem: true,
    });
    const event = { type: 'user.toggleAutoShmem', on: true } as const;
    expect(applyRule(values, event, makeCtx())).toEqual({
      resource: { shmem: '1g' },
    });
    expect(applyRule(values, event, presetOnly())).toEqual({
      resource: { shmem: '1g' },
    });
    // On a preset's values with the custom label, the toggle is not a value edit.
    expect(
      applyRule({ ...values, allocationPreset: 'custom' }, event, makeCtx()),
    ).toEqual({ resource: { shmem: '1g' } });
  });

  it('turning automatic shmem off writes nothing; the label follows the cpu / mem values, not the toggle', () => {
    const event = { type: 'user.toggleAutoShmem', on: false } as const;
    expect(applyRule(onGpuPreset(), event, makeCtx())).toEqual({});
    expect(applyRule(onGpuPreset(), event, presetOnly())).toEqual({});
    expect(
      applyRule(
        makeValues({ allocationPreset: 'p-gpu', enabledAutomaticShmem: false }),
        event,
        makeCtx(),
      ),
    ).toEqual({ allocationPreset: 'custom' });
  });

  it('selecting a preset applies its slots and turns automatic shmem off when it carries shmem', () => {
    const values = makeValues({
      resource: {
        cpu: 2,
        mem: '4g',
        shmem: '64m',
        accelerator: 0,
        acceleratorType: 'cuda.device',
      },
      allocationPreset: 'p-gpu',
      enabledAutomaticShmem: true,
    });
    expect(
      applyRule(values, { type: 'user.selectPreset', id: 'p-gpu' }, makeCtx()),
    ).toEqual({
      resource: {
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.shares',
      },
      enabledAutomaticShmem: false,
    });
  });

  it('selecting a preset without shmem turns automatic shmem on and keeps the accelerator type', () => {
    const values = makeValues({
      resource: {
        cpu: 4,
        mem: '8g',
        shmem: '2g',
        accelerator: 2,
        acceleratorType: 'cuda.shares',
      },
      allocationPreset: 'p-cpu',
      enabledAutomaticShmem: false,
    });
    expect(
      applyRule(values, { type: 'user.selectPreset', id: 'p-cpu' }, makeCtx()),
    ).toEqual({
      resource: { cpu: 2, mem: '4g', shmem: '1g', accelerator: 0 },
      enabledAutomaticShmem: true,
    });
  });

  it('selecting an id the check-presets response lacks writes only the label', () => {
    const values = makeValues({ allocationPreset: 'p-unknown' });
    expect(
      applyRule(
        values,
        { type: 'user.selectPreset', id: 'p-unknown' },
        makeCtx(),
      ),
    ).toEqual({});
  });

  it('selecting a unified-slot preset leaves the accelerator quantity empty', () => {
    const values = makeValues({ allocationPreset: 'p-unified' });
    expect(
      applyRule(
        values,
        { type: 'user.selectPreset', id: 'p-unified' },
        makeCtx(),
      ),
    ).toEqual({
      resource: {
        shmem: '1g',
        accelerator: undefined,
        acceleratorType: 'cuda.unified',
      },
    });
  });

  it('selecting custom writes nothing', () => {
    expect(
      applyRule(
        makeValues(),
        { type: 'user.selectPreset', id: 'custom' },
        makeCtx(),
      ),
    ).toEqual({});
  });

  it('selecting minimum-required applies the image minimum with automatic shmem', () => {
    const values = makeValues({
      resource: {
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.device',
      },
      allocationPreset: 'minimum-required',
      enabledAutomaticShmem: false,
    });
    expect(
      applyRule(
        values,
        { type: 'user.selectPreset', id: 'minimum-required' },
        makeCtx(),
      ),
    ).toEqual({
      resource: { cpu: 1, mem: '1.25g', shmem: '64m', accelerator: 1 },
      enabledAutomaticShmem: true,
    });
  });

  it('minimum-required moves to the first image type the group has when the current one is not listed', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, acceleratorType: 'cuda.shares' },
      allocationPreset: 'minimum-required',
    });
    expect(
      applyRule(
        values,
        { type: 'user.selectPreset', id: 'minimum-required' },
        makeCtx(),
      ),
    ).toEqual({
      resource: { cpu: 1, mem: '1.25g', acceleratorType: 'cuda.device' },
    });
  });

  it('minimum-required on an image that needs no accelerator sets it to 0', () => {
    const values = makeValues({ allocationPreset: 'minimum-required' });
    expect(
      applyRule(
        values,
        { type: 'user.selectPreset', id: 'minimum-required' },
        makeCtx({ image: cpuImage }),
      ),
    ).toEqual({ resource: { cpu: 1, mem: '1.25g', accelerator: 0 } });
  });

  it('switching to a unified type clears the quantity', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, acceleratorType: 'cuda.unified' },
      allocationPreset: 'p-gpu',
    });
    expect(
      applyRule(
        values,
        {
          type: 'user.setAcceleratorType',
          next: 'cuda.unified',
          prev: 'cuda.device',
        },
        makeCtx(),
      ),
    ).toEqual({
      resource: { accelerator: undefined },
      allocationPreset: 'custom',
    });
  });

  it('switching from a unified type starts at the new slot minimum', () => {
    const values = makeValues({
      resource: {
        ...makeValues().resource,
        acceleratorType: 'cuda.shares',
        accelerator: undefined,
      },
    });
    expect(
      applyRule(
        values,
        {
          type: 'user.setAcceleratorType',
          next: 'cuda.shares',
          prev: 'cuda.unified',
        },
        makeCtx(),
      ),
    ).toEqual({ resource: { accelerator: 0.5 } });
    expect(
      applyRule(
        values,
        {
          type: 'user.setAcceleratorType',
          next: 'cuda.shares',
          prev: 'cuda.unified',
        },
        makeCtx({ resourceLimits: { accelerators: {} }, presets: [] }),
      ),
    ).toEqual({ resource: { accelerator: 0 } });
    // Landing at 0 on the values of `p-cpu` reads that preset (A1).
    expect(
      applyRule(
        values,
        {
          type: 'user.setAcceleratorType',
          next: 'cuda.shares',
          prev: 'cuda.unified',
        },
        makeCtx({ resourceLimits: { accelerators: {} } }),
      ),
    ).toEqual({ resource: { accelerator: 0 }, allocationPreset: 'p-cpu' });
  });

  it('switching between discrete types keeps the quantity', () => {
    const values = makeValues({
      resource: {
        ...makeValues().resource,
        acceleratorType: 'cuda.shares',
        accelerator: 3,
      },
      allocationPreset: 'p-gpu',
    });
    expect(
      applyRule(
        values,
        {
          type: 'user.setAcceleratorType',
          next: 'cuda.shares',
          prev: 'cuda.device',
        },
        makeCtx(),
      ),
    ).toEqual({ allocationPreset: 'custom' });
  });
});

describe('applyRule — data.changed', () => {
  it('sizes automatic shmem for custom amounts restored without it', () => {
    const restored = (mem: string) =>
      makeValues({
        resource: {
          cpu: 2,
          mem,
          shmem: '0g',
          accelerator: 0,
          acceleratorType: 'cuda.device',
        },
      });

    expect(applyRule(restored('16g'), dataChanged, makeCtx())).toEqual({
      resource: { shmem: '1g' },
    });
    expect(applyRule(restored('2g'), dataChanged, makeCtx())).toEqual({
      resource: { shmem: AUTOMATIC_DEFAULT_SHMEM },
    });
    // The same rule a typed amount gets: the image minimum counts.
    expect(
      applyRule(restored('4g'), dataChanged, makeCtx({ imageMinMem: '8g' })),
    ).toEqual({ resource: { shmem: AUTOMATIC_DEFAULT_SHMEM } });
  });

  it('leaves shmem alone when it is set, manual, or there is no memory yet', () => {
    expect(applyRule(makeValues(), dataChanged, makeCtx())).toEqual({});
    expect(
      applyRule(
        makeValues({
          resource: {
            cpu: 2,
            mem: '16g',
            shmem: '0g',
            accelerator: 0,
            acceleratorType: 'cuda.device',
          },
          enabledAutomaticShmem: false,
        }),
        dataChanged,
        makeCtx(),
      ),
    ).toEqual({});
    expect(
      applyRule(
        makeValues({
          resource: {
            cpu: 0,
            mem: '0g',
            shmem: '0g',
            accelerator: 0,
            acceleratorType: 'cuda.device',
          },
        }),
        dataChanged,
        makeCtx(),
      ),
    ).toEqual({});
  });

  it('writes nothing before the slots of the resource group are known', () => {
    expect(
      applyRule(
        makeValues({ allocationPreset: 'auto-select' }),
        dataChanged,
        makeCtx({ slotsInRG: undefined, acceleratorSlotsInRG: [] }),
      ),
    ).toEqual({});
  });

  it("zeroes the accelerator when the image runs on none of the group types, unless the values are a preset's in preset-only mode", () => {
    expect(
      applyRule(makeValues(), dataChanged, makeCtx({ image: rocmOnlyImage })),
    ).toEqual({ resource: { accelerator: 0 } });
    expect(
      applyRule(
        makeValues({ allocationPreset: 'p-gpu' }),
        dataChanged,
        presetOnly({ image: rocmOnlyImage }),
      ),
    ).toEqual({});
    // A cloned revision's `custom`, or no label, is not a preset (D2).
    expect(
      applyRule(
        makeValues({ allocationPreset: 'custom' }),
        dataChanged,
        presetOnly({ image: rocmOnlyImage, keepRestoredAllocation: true }),
      ),
    ).toEqual({ resource: { accelerator: 0 } });
    expect(
      applyRule(
        makeValues({ allocationPreset: null }),
        dataChanged,
        presetOnly({ image: rocmOnlyImage }),
      ),
    ).toEqual({ resource: { accelerator: 0 } });
    const unified = makeValues({
      resource: {
        ...makeValues().resource,
        acceleratorType: 'cuda.unified',
        accelerator: undefined,
      },
    });
    expect(
      applyRule(unified, dataChanged, makeCtx({ image: rocmOnlyImage })),
    ).toEqual({});
  });

  it('auto-select applies the first allocatable preset by name', () => {
    const values = makeValues({ allocationPreset: 'auto-select' });
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({
      allocationPreset: 'p-cpu',
      resource: { shmem: '1g', accelerator: 0 },
    });
  });

  it('auto-select without an allocatable preset falls back to minimum-required (free) or nothing (preset-only)', () => {
    const values = makeValues({ allocationPreset: 'auto-select' });
    expect(
      applyRule(values, dataChanged, makeCtx({ allocatablePresetIds: [] })),
    ).toEqual({
      allocationPreset: 'minimum-required',
      resource: { cpu: 1, mem: '1.25g' },
    });
    expect(
      applyRule(values, dataChanged, presetOnly({ allocatablePresetIds: [] })),
    ).toEqual({ allocationPreset: null });
  });

  it('auto-select without the preset select falls back the same way', () => {
    const values = makeValues({ allocationPreset: 'auto-select' });
    expect(
      applyRule(values, dataChanged, makeCtx({ enableResourcePresets: false })),
    ).toEqual({
      allocationPreset: 'minimum-required',
      resource: { cpu: 1, mem: '1.25g' },
    });
  });

  it('a form restored without resource values starts from auto-select', () => {
    const values: ResourceValues = { enabledAutomaticShmem: true };
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({
      allocationPreset: 'p-cpu',
      resource: {
        cpu: 2,
        mem: '4g',
        shmem: '1g',
        accelerator: 0,
        acceleratorType: 'cuda.shares',
      },
    });
  });

  it('moves an accelerator type the group lacks to its first slot; the free-mode label follows', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, acceleratorType: 'rocm.device' },
      allocationPreset: 'p-gpu',
    });
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({
      resource: { acceleratorType: 'cuda.shares' },
      allocationPreset: 'custom',
    });
    expect(
      applyRule(
        { ...values, allocationPreset: 'custom' },
        dataChanged,
        makeCtx({
          slotsInRG: ['cpu', 'mem', 'cuda.unified'],
          acceleratorSlotsInRG: ['cuda.unified'],
        }),
      ),
    ).toEqual({
      resource: { acceleratorType: 'cuda.unified', accelerator: undefined },
    });
  });

  it('keeps a preset that needs a slot the group lacks for its validator (#10628)', () => {
    const values = makeValues({ allocationPreset: 'p-rocm' });
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({});
    expect(applyRule(values, dataChanged, presetOnly())).toEqual({});
  });

  it("preset-only: a preset's type the image dropped is the preset validator's, not a type switch or a type error", () => {
    const ctx = presetOnly({ image: rocmOnlyImage });
    expect(
      applyRule(makeValues({ allocationPreset: 'p-gpu' }), dataChanged, ctx),
    ).toEqual({});
    expect(acceleratorTypeErrorTarget('cuda.device', 'p-gpu', ctx)).toBe(
      undefined,
    );
    // No group type runs the image: R3 zeroes the accelerator, no type error.
    expect(acceleratorTypeErrorTarget('cuda.device', 'custom', ctx)).toBe(
      undefined,
    );
    expect(
      acceleratorTypeErrorTarget(
        'cuda.device',
        'custom',
        makeCtx({ image: undefined }),
      ),
    ).toBe(undefined);
  });

  it('names the item that reports an accelerator type the image does not support', () => {
    // Two group types run the image, neither is the current one.
    const slots = {
      slotsInRG: ['cpu', 'mem', 'cuda.device', 'rocm.device', 'tpu.device'],
      acceleratorSlotsInRG: ['cuda.device', 'rocm.device', 'tpu.device'],
    };
    const image = makeImage({ supported_accelerators: ['rocm', 'tpu'] });
    const free = makeCtx({ ...slots, image });
    const presetOnlyCtx = presetOnly({ ...slots, image });
    // Free mode: the type item, whatever the label.
    expect(acceleratorTypeErrorTarget('cuda.device', 'p-gpu', free)).toBe(
      'type',
    );
    expect(acceleratorTypeErrorTarget('cuda.device', 'custom', free)).toBe(
      'type',
    );
    expect(acceleratorTypeErrorTarget('cuda.device', null, free)).toBe('type');
    // Preset-only: the visible preset item, only for values that are not a preset's.
    expect(
      acceleratorTypeErrorTarget('cuda.device', 'custom', presetOnlyCtx),
    ).toBe('preset');
    expect(
      acceleratorTypeErrorTarget(
        'cuda.device',
        'minimum-required',
        presetOnlyCtx,
      ),
    ).toBe('preset');
    expect(
      acceleratorTypeErrorTarget('cuda.device', 'p-gpu', presetOnlyCtx),
    ).toBe(undefined);
    expect(acceleratorTypeErrorTarget('cuda.device', null, presetOnlyCtx)).toBe(
      undefined,
    );
    // No preset item to carry it: back to the (hidden) type item.
    expect(
      acceleratorTypeErrorTarget(
        'cuda.device',
        'custom',
        presetOnly({ ...slots, image, enableResourcePresets: false }),
      ),
    ).toBe('type');
    // A supported type, or no type: nothing.
    expect(
      acceleratorTypeErrorTarget('rocm.device', 'custom', presetOnlyCtx),
    ).toBe(undefined);
    expect(acceleratorTypeErrorTarget(undefined, 'custom', free)).toBe(
      undefined,
    );
  });

  it('switches to the only accelerator type the image runs on and keeps the quantity', () => {
    const slots = {
      slotsInRG: ['cpu', 'mem', 'cuda.device', 'rocm.device'],
      acceleratorSlotsInRG: ['cuda.device', 'rocm.device'],
    };
    const values = makeValues({
      resource: { ...makeValues().resource, acceleratorType: 'rocm.device' },
    });
    expect(applyRule(values, dataChanged, makeCtx(slots))).toEqual({
      resource: { acceleratorType: 'cuda.device' },
    });
    expect(
      applyRule(
        { ...values, allocationPreset: 'p-gpu' },
        dataChanged,
        presetOnly(slots),
      ),
    ).toEqual({});
    // Preset-only switches a non-preset's type too (D2 protects only a preset's values).
    expect(
      applyRule(
        values,
        dataChanged,
        presetOnly({ ...slots, keepRestoredAllocation: true }),
      ),
    ).toEqual({ resource: { acceleratorType: 'cuda.device' } });
  });

  it('a group-forced swap off a unified type starts at the new slot minimum, like the user switch', () => {
    const slots = {
      slotsInRG: ['cpu', 'mem', 'cuda.device'],
      acceleratorSlotsInRG: ['cuda.device'],
    };
    const values = makeValues({
      resource: {
        ...makeValues().resource,
        acceleratorType: 'cuda.unified',
        accelerator: undefined,
      },
    });
    const swapped = {
      resource: { acceleratorType: 'cuda.device', accelerator: 1 },
    };
    expect(applyRule(values, dataChanged, makeCtx(slots))).toEqual(swapped);
    expect(
      applyRule(
        values,
        dataChanged,
        presetOnly({ ...slots, keepRestoredAllocation: true }),
      ),
    ).toEqual(swapped);
    expect(
      applyRule(
        { ...values, allocationPreset: 'p-unified' },
        dataChanged,
        presetOnly(slots),
      ),
    ).toEqual({});
  });

  it('leaves a type the image dropped alone when several remain (validator case)', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, acceleratorType: 'rocm.device' },
    });
    expect(
      applyRule(
        values,
        dataChanged,
        makeCtx({
          slotsInRG: [
            'cpu',
            'mem',
            'cuda.device',
            'cuda.shares',
            'rocm.device',
          ],
          acceleratorSlotsInRG: ['cuda.device', 'cuda.shares', 'rocm.device'],
        }),
      ),
    ).toEqual({});
  });

  it('preset-only: a group change writes resource values only through the preset', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, acceleratorType: 'rocm.device' },
      allocationPreset: 'p-gpu',
    });
    expect(applyRule(values, dataChanged, presetOnly())).toEqual({});
    expect(
      applyRule(values, dataChanged, presetOnly({ image: rocmOnlyImage })),
    ).toEqual({});
  });

  it('preset-only: a restored custom on a preset takes that label without a value write; shmem does not count', () => {
    expect(
      applyRule(
        onGpuPreset({ allocationPreset: 'custom' }),
        dataChanged,
        presetOnly(),
      ),
    ).toEqual({ allocationPreset: 'p-gpu' });
    expect(
      applyRule(
        onGpuPreset({
          resource: { ...onGpuPreset().resource, shmem: '64m' },
          allocationPreset: 'custom',
          enabledAutomaticShmem: true,
        }),
        dataChanged,
        presetOnly(),
      ),
    ).toEqual({ allocationPreset: 'p-gpu' });
  });

  it('preset-only: a restored custom on no preset clears the label so the user picks; the values stay', () => {
    expect(
      applyRule(
        makeValues({ allocationPreset: 'custom' }),
        dataChanged,
        presetOnly(),
      ),
    ).toEqual({ allocationPreset: null });
    expect(
      applyRule(
        makeValues({ allocationPreset: 'custom' }),
        dataChanged,
        presetOnly({ presets: undefined }),
      ),
    ).toEqual({});
  });

  it('preset-only: a restored custom matches only an allocatable preset', () => {
    expect(
      applyRule(
        onGpuPreset({ allocationPreset: 'custom' }),
        dataChanged,
        presetOnly({ allocatablePresetIds: ['p-cpu'] }),
      ),
    ).toEqual({ allocationPreset: null });
  });

  it('preset-only: a restored minimum-required applies the image minimum, then matches an allocatable preset or clears', () => {
    expect(
      applyRule(
        makeValues({ allocationPreset: 'minimum-required' }),
        dataChanged,
        presetOnly(),
      ),
    ).toEqual({
      resource: { cpu: 1, mem: '1.25g' },
      allocationPreset: null,
    });
    const onMinimum: ResourcePreset = {
      id: 'p-min',
      name: 'e-min',
      resource_slots: { cpu: '1', mem: String(1.25 * GiB) },
      shared_memory: null,
      allocatable: true,
    };
    expect(
      applyRule(
        makeValues({ allocationPreset: 'minimum-required' }),
        dataChanged,
        presetOnly({
          image: cpuImage,
          presets: [...presets, onMinimum],
          allocatablePresetIds: ['p-gpu', 'p-cpu', 'p-unified', 'p-min'],
        }),
      ),
    ).toEqual({
      resource: { cpu: 1, mem: '1.25g', accelerator: 0 },
      allocationPreset: 'p-min',
    });
    // The same preset the limits rule out is not matched.
    expect(
      applyRule(
        makeValues({ allocationPreset: 'minimum-required' }),
        dataChanged,
        presetOnly({ image: cpuImage, presets: [...presets, onMinimum] }),
      ),
    ).toEqual({
      resource: { cpu: 1, mem: '1.25g', accelerator: 0 },
      allocationPreset: null,
    });
  });

  it('keepRestoredAllocation leaves a restored custom or minimum-required alone in both modes', () => {
    for (const label of ['custom', 'minimum-required']) {
      const values = makeValues({ allocationPreset: label });
      expect(
        applyRule(
          values,
          dataChanged,
          presetOnly({ keepRestoredAllocation: true }),
        ),
      ).toEqual({});
    }
    expect(
      applyRule(
        makeValues({ allocationPreset: 'custom' }),
        dataChanged,
        makeCtx({ keepRestoredAllocation: true }),
      ),
    ).toEqual({});
  });

  it('keeps a selected preset the group can serve', () => {
    const values = makeValues({
      resource: {
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.shares',
      },
      allocationPreset: 'p-gpu',
      enabledAutomaticShmem: false,
    });
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({});
  });

  it('re-applies the image minimum while minimum-required is selected', () => {
    const values = makeValues({
      resource: {
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.device',
      },
      allocationPreset: 'minimum-required',
    });
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({
      resource: { cpu: 1, mem: '1.25g', shmem: '64m', accelerator: 1 },
    });
    expect(
      applyRule(values, dataChanged, makeCtx({ image: cpuImage })),
    ).toEqual({
      resource: { cpu: 1, mem: '1.25g', shmem: '64m', accelerator: 0 },
    });
  });

  it('settles: the same data.changed applied twice writes nothing the second time', () => {
    const starts: Array<[ResourceValues, RuleContext]> = [
      [makeValues({ allocationPreset: 'auto-select' }), makeCtx()],
      [
        makeValues({ allocationPreset: 'auto-select' }),
        makeCtx({ allocatablePresetIds: [] }),
      ],
      [
        makeValues({ allocationPreset: 'auto-select' }),
        presetOnly({ allocatablePresetIds: [] }),
      ],
      [
        makeValues({
          resource: {
            ...makeValues().resource,
            acceleratorType: 'rocm.device',
          },
          allocationPreset: 'minimum-required',
        }),
        makeCtx(),
      ],
      [makeValues(), makeCtx({ image: rocmOnlyImage })],
      [{ enabledAutomaticShmem: true }, makeCtx()],
      [makeValues({ allocationPreset: 'custom' }), presetOnly()],
      [
        makeValues({ allocationPreset: 'custom' }),
        presetOnly({ image: rocmOnlyImage, keepRestoredAllocation: true }),
      ],
      [
        makeValues({
          resource: {
            ...makeValues().resource,
            acceleratorType: 'cuda.unified',
            accelerator: undefined,
          },
        }),
        makeCtx({
          slotsInRG: ['cpu', 'mem', 'cuda.device'],
          acceleratorSlotsInRG: ['cuda.device'],
        }),
      ],
    ];
    for (const [values, ctx] of starts) {
      const first = applyRule(values, dataChanged, ctx);
      expect(first).not.toEqual({});
      expect(applyRule(written(values, first), dataChanged, ctx)).toEqual({});
    }
  });

  it('a user preset selection settles under the data rule that follows it', () => {
    const ctx = makeCtx();
    const values = makeValues({ allocationPreset: 'p-gpu' });
    const selected = written(
      values,
      applyRule(values, { type: 'user.selectPreset', id: 'p-gpu' }, ctx),
    );
    expect(applyRule(selected, dataChanged, ctx)).toEqual({});
    const minimum = written(
      makeValues({ allocationPreset: 'minimum-required' }),
      applyRule(
        makeValues({ allocationPreset: 'minimum-required' }),
        { type: 'user.selectPreset', id: 'minimum-required' },
        ctx,
      ),
    );
    expect(minimum.resource).toMatchObject(gpuImageMinimum);
    expect(applyRule(minimum, dataChanged, ctx)).toEqual({});
  });
});

describe('matchesPreset', () => {
  it('compares cpu, mem by size, accelerator type and amount; never shmem', () => {
    const ctx = makeCtx();
    const gpu = presets[0];
    expect(matchesPreset(onGpuPreset().resource ?? {}, gpu, ctx)).toBe(true);
    expect(
      matchesPreset(
        { ...onGpuPreset().resource, mem: '8192m', shmem: '64m' },
        gpu,
        ctx,
      ),
    ).toBe(true);
    expect(matchesPreset({ ...onGpuPreset().resource, cpu: 5 }, gpu, ctx)).toBe(
      false,
    );
    expect(
      matchesPreset({ ...onGpuPreset().resource, accelerator: 1 }, gpu, ctx),
    ).toBe(false);
    expect(
      matchesPreset(
        { ...onGpuPreset().resource, acceleratorType: 'cuda.device' },
        gpu,
        ctx,
      ),
    ).toBe(false);
    // A unified slot has no amount to compare.
    expect(
      matchesPreset(
        { cpu: 2, mem: '4g', accelerator: 7, acceleratorType: 'cuda.unified' },
        presets[2],
        ctx,
      ),
    ).toBe(true);
    // The group cannot serve the preset: no answer.
    expect(
      matchesPreset({ cpu: 1, mem: '2g' }, presets[3], ctx),
    ).toBeUndefined();
  });
});

describe('presetUnavailableReasonText', () => {
  const t = ((key: string, options?: Record<string, unknown>) =>
    `${key} ${JSON.stringify(options)}`) as unknown as TFunction;
  const slotNameOf = (key: string) => key.toUpperCase();

  it('names the preset in the scoped message only when given one', () => {
    const scoped = { kind: 'scoped', resourceGroup: 'rg-b' } as const;
    expect(presetUnavailableReasonText(scoped, t, slotNameOf, 'big')).toBe(
      'resourcePreset.PresetOnlyAvailableInResourceGroup {"preset":"big","name":"rg-b"}',
    );
    expect(presetUnavailableReasonText(scoped, t, slotNameOf)).toBe(
      'resourcePreset.OnlyAvailableInResourceGroup {"name":"rg-b"}',
    );
  });

  it("maps the other reasons once, with the caller's slot names", () => {
    expect(
      presetUnavailableReasonText(
        { kind: 'missing-slots', slots: ['rocm.device', 'tpu.device'] },
        t,
        slotNameOf,
      ),
    ).toBe(
      'resourcePreset.RequiresSlotsNotInResourceGroup {"slots":"ROCM.DEVICE, TPU.DEVICE"}',
    );
    expect(
      presetUnavailableReasonText({ kind: 'not-allocatable' }, t, slotNameOf),
    ).toBe('resourcePreset.ExceedsAllocatableResources undefined');
    expect(
      presetUnavailableReasonText(undefined, t, slotNameOf),
    ).toBeUndefined();
  });
});

describe('getSupportedAcceleratorTypes', () => {
  it('is unknown until the slots and the image are', () => {
    expect(
      getSupportedAcceleratorTypes(makeCtx({ slotsInRG: undefined })),
    ).toBeUndefined();
    expect(
      getSupportedAcceleratorTypes(makeCtx({ image: undefined })),
    ).toBeUndefined();
  });

  it('filters the group types by the image prefixes, with * and a manual image allowing all', () => {
    expect(getSupportedAcceleratorTypes(makeCtx())).toEqual([
      'cuda.shares',
      'cuda.device',
      'cuda.unified',
    ]);
    expect(
      getSupportedAcceleratorTypes(makeCtx({ image: rocmOnlyImage })),
    ).toEqual([]);
    expect(
      getSupportedAcceleratorTypes(
        makeCtx({ image: undefined, manualImage: true }),
      ),
    ).toEqual(['cuda.shares', 'cuda.device', 'cuda.unified']);
    expect(
      getSupportedAcceleratorTypes(
        makeCtx({ image: makeImage({ supported_accelerators: [''] }) }),
      ),
    ).toEqual(['cuda.shares', 'cuda.device', 'cuda.unified']);
  });
});

describe('resolveAcceleratorType', () => {
  it('keeps a type the group has, else takes the first supported slot, else the first, else the current', () => {
    const slots = ['cuda.shares', 'cuda.device'];
    expect(resolveAcceleratorType('cuda.device', slots)).toBe('cuda.device');
    expect(resolveAcceleratorType('rocm.device', slots)).toBe('cuda.shares');
    expect(resolveAcceleratorType('rocm.device', slots, ['cuda.device'])).toBe(
      'cuda.device',
    );
    expect(resolveAcceleratorType('rocm.device', slots, [])).toBe(
      'cuda.shares',
    );
    expect(resolveAcceleratorType(undefined, slots)).toBe('cuda.shares');
    expect(resolveAcceleratorType('rocm.device', [])).toBe('rocm.device');
    expect(resolveAcceleratorType(undefined, [])).toBeUndefined();
  });
});

describe('getPresetUnavailableReason', () => {
  const scope = {
    resourceGroup: 'rg-a',
    slotsInRG,
    allocatablePresetIds: ['p-gpu', 'p-cpu'],
  };
  const rocmPreset = presets[3];

  it('reports a preset scoped to another group before anything else', () => {
    expect(
      getPresetUnavailableReason(
        { ...rocmPreset, scaling_group_name: 'rg-b' },
        scope,
      ),
    ).toEqual({ kind: 'scoped', resourceGroup: 'rg-b' });
    expect(
      getPresetUnavailableReason(
        { ...presets[0], scaling_group_name: 'rg-a' },
        scope,
      ),
    ).toBeUndefined();
  });

  it('reports the slots the group lacks', () => {
    expect(getPresetUnavailableReason(rocmPreset, scope)).toEqual({
      kind: 'missing-slots',
      slots: ['rocm.device'],
    });
  });

  it('reports a preset the limits or the image rule out', () => {
    expect(getPresetUnavailableReason(presets[2], scope)).toEqual({
      kind: 'not-allocatable',
    });
    expect(getPresetUnavailableReason(presets[0], scope)).toBeUndefined();
  });

  it('skips the checks whose data is not known yet', () => {
    expect(
      getPresetUnavailableReason(rocmPreset, {
        resourceGroup: 'rg-a',
        slotsInRG: undefined,
        allocatablePresetIds: undefined,
      }),
    ).toBeUndefined();
    expect(
      getPresetUnavailableReason({ id: 'p-gpu' }, { resourceGroup: 'rg-a' }),
    ).toBeUndefined();
  });
});
