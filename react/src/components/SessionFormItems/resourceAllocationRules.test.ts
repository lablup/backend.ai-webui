/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import { ResourcePreset } from '../../hooks/useResourceLimitAndRemaining';
import { Image } from '../ImageEnvironmentSelectFormItems';
import {
  applyRule,
  getSupportedAcceleratorTypes,
  resolveAcceleratorType,
  ResourceValues,
  RuleContext,
  RulePatch,
} from './resourceAllocationRules';

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

describe('applyRule — user events', () => {
  it('cpu and accelerator edits only relabel the allocation custom, in both modes', () => {
    const values = makeValues({ allocationPreset: 'p-gpu' });
    for (const ctx of [makeCtx(), presetOnly()]) {
      expect(
        applyRule(
          values,
          { type: 'user.setResource', field: 'cpu', value: 3 },
          ctx,
        ),
      ).toEqual({ allocationPreset: 'custom' });
      expect(
        applyRule(
          values,
          { type: 'user.setResource', field: 'accelerator', value: 2 },
          ctx,
        ),
      ).toEqual({ allocationPreset: 'custom' });
    }
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
    ).toEqual({ allocationPreset: 'custom' });
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

  it('a shmem edit relabels custom only in free mode', () => {
    const values = makeValues({ allocationPreset: 'p-gpu' });
    const event = {
      type: 'user.setResource',
      field: 'shmem',
      value: '512m',
    } as const;
    expect(applyRule(values, event, makeCtx())).toEqual({
      allocationPreset: 'custom',
    });
    expect(applyRule(values, event, presetOnly())).toEqual({});
  });

  it('turning automatic shmem on recomputes shmem; the label follows only in free mode', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, mem: '8g', shmem: '2g' },
      allocationPreset: 'p-gpu',
      enabledAutomaticShmem: true,
    });
    const event = { type: 'user.toggleAutoShmem', on: true } as const;
    expect(applyRule(values, event, makeCtx())).toEqual({
      resource: { shmem: '1g' },
      allocationPreset: 'custom',
    });
    expect(applyRule(values, event, presetOnly())).toEqual({
      resource: { shmem: '1g' },
    });
  });

  it('turning automatic shmem off writes nothing but the free-mode label', () => {
    const values = makeValues({
      allocationPreset: 'p-gpu',
      enabledAutomaticShmem: false,
    });
    const event = { type: 'user.toggleAutoShmem', on: false } as const;
    expect(applyRule(values, event, makeCtx())).toEqual({
      allocationPreset: 'custom',
    });
    expect(applyRule(values, event, presetOnly())).toEqual({});
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
        makeCtx({ resourceLimits: { accelerators: {} } }),
      ),
    ).toEqual({ resource: { accelerator: 0 } });
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
  const dataChanged = { type: 'data.changed' } as const;

  it('writes nothing before the slots of the resource group are known', () => {
    expect(
      applyRule(
        makeValues({ allocationPreset: 'auto-select' }),
        dataChanged,
        makeCtx({ slotsInRG: undefined, acceleratorSlotsInRG: [] }),
      ),
    ).toEqual({});
  });

  it('zeroes the accelerator when the image runs on none of the group types', () => {
    expect(
      applyRule(makeValues(), dataChanged, makeCtx({ image: rocmOnlyImage })),
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

  it('moves an accelerator type the group lacks to its first slot without relabelling', () => {
    const values = makeValues({
      resource: { ...makeValues().resource, acceleratorType: 'rocm.device' },
      allocationPreset: 'p-gpu',
    });
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({
      resource: { acceleratorType: 'cuda.shares' },
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

  it('re-picks when the selected preset needs a slot the group lacks (#10628)', () => {
    const values = makeValues({ allocationPreset: 'p-rocm' });
    expect(applyRule(values, dataChanged, makeCtx())).toEqual({
      allocationPreset: 'p-cpu',
      resource: { shmem: '1g', accelerator: 0 },
    });
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
      [makeValues({ allocationPreset: 'p-rocm' }), makeCtx()],
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
  it('keeps a type the group has, else takes the first slot, else keeps the current', () => {
    const slots = ['cuda.shares', 'cuda.device'];
    expect(resolveAcceleratorType('cuda.device', slots)).toBe('cuda.device');
    expect(resolveAcceleratorType('rocm.device', slots)).toBe('cuda.shares');
    expect(resolveAcceleratorType(undefined, slots)).toBe('cuda.shares');
    expect(resolveAcceleratorType('rocm.device', [])).toBe('rocm.device');
    expect(resolveAcceleratorType(undefined, [])).toBeUndefined();
  });
});
