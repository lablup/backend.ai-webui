/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Pure tests for the resource slice; rows are Dependency map v2 ids (#10454),
// expectations are today's behaviour, pinned end to end by the
// characterization suite in `src/__characterization__/session-launcher/`.
import type { ResourcePreset } from '../domain/resourceLimits';
import {
  compose,
  pathKey,
  transition,
  type AppliedPatch,
  type LauncherEvent,
  type LauncherInputs,
  type LauncherValues,
  type Loadable,
} from '../model';
import { resourceSlice, type ResourceInputs } from './resource';
import { describe, expect, it } from 'vitest';

const model = compose([resourceSlice]);

const ready = <T>(value: T): Loadable<T> => ({ status: 'ready', value });

const GiB = 1024 ** 3;
const preset = (
  id: string,
  name: string,
  cpu: number,
  memG: number,
  extra: Record<string, string> = {},
  shmemG?: number,
): ResourcePreset => ({
  id,
  name,
  resource_slots: { cpu: String(cpu), mem: String(memG * GiB), ...extra },
  shared_memory: shmemG ? String(shmemG * GiB) : null,
  allocatable: true,
});

const SLOTS = { cpu: {}, mem: {} };
const ACCEL_SLOTS = { 'cuda.device': {}, 'cuda.unified': {} };

const baseInputs: ResourceInputs = {
  resourceLimits: {
    accelerators: { 'cuda.device': { min: 1, max: 8 } },
    cpu: { min: 1, max: 8 },
    mem: { min: '1g', max: '32g' },
    shmem: { min: '0g' },
  },
  checkPresetInfo: null,
  allocatablePresetIds: [],
  resourceSlotsInRG: SLOTS,
  acceleratorSlotsInRG: {},
  supportedAcceleratorTypesInRGByImage: undefined,
  currentImage: undefined,
  currentImageAcceleratorLimits: undefined,
  currentImageMinM: '0g',
  currentAllocationPreset: undefined,
  currentResourceValue: undefined,
  enableResourcePresets: true,
  allowCustomResourceAllocation: true,
  forceImageMinValues: false,
};

const inputsOf = (
  overrides: Partial<ResourceInputs> = {},
  loading: Array<keyof ResourceInputs> = [],
): LauncherInputs =>
  Object.fromEntries(
    Object.entries({ ...baseInputs, ...overrides }).map(([key, value]) => [
      key,
      loading.includes(key as keyof ResourceInputs)
        ? { status: 'loading' }
        : ready(value),
    ]),
  );

const RESOURCE = {
  cpu: 2,
  mem: '4g',
  shmem: '64m',
  accelerator: 0,
};

const valuesOf = (values: Record<string, unknown> = {}): LauncherValues => ({
  resource: RESOURCE,
  allocationPreset: 'custom',
  enabledAutomaticShmem: true,
  ...values,
});

/** Every key arrives, as on mount. */
const MOUNT: LauncherEvent = {
  type: 'dataArrived',
  keys: Object.keys(baseInputs),
};

const run = (
  values: LauncherValues,
  event: LauncherEvent,
  inputs: LauncherInputs = inputsOf(),
) => transition(model, { values, provenance: {} }, event, inputs);

/** `[path, value, method, provenance]` per applied patch, validations as `validate:<path>`. */
const summary = (patches: AppliedPatch[]) =>
  patches.map((patch) =>
    patch.write.method === 'none'
      ? [
          `validate:${patch.write.validateAfter?.map(pathKey).join(',')}`,
          patch.write.validateOptions?.recursive ? 'recursive' : '',
          patch.provenance,
        ]
      : [
          pathKey(patch.path),
          patch.value,
          patch.write.method,
          patch.provenance,
        ],
  );

describe('resourceSlice', () => {
  it('runs its rules in the order of the effects they replace (ADR 0013 order test)', () => {
    expect(resourceSlice.rules.map((rule) => rule.id)).toEqual([
      'R-01',
      'R-02',
      'R-03',
      'R-04',
      'R-05',
    ]);
  });

  describe('R-01 an empty resource returns a non-custom preset to auto-select', () => {
    it.each([
      [undefined, 'auto-select', 'minimum-required'],
      ['minimum-required', 'auto-select', 'minimum-required'],
    ])(
      'preset %s → %s (then R-03 falls back to %s)',
      (from, written, settled) => {
        const { patches, state } = run(
          { allocationPreset: from, enabledAutomaticShmem: true },
          MOUNT,
        );
        expect(summary(patches)[0]).toEqual([
          'allocationPreset',
          written,
          'setFieldsValue',
          'rule:R-01',
        ]);
        expect(state.values.allocationPreset).toBe(settled);
      },
    );

    it('keeps custom', () => {
      const { patches } = run({ allocationPreset: 'custom' }, MOUNT);
      expect(patches).toEqual([]);
    });
  });

  describe('R-02 no supported accelerator type → accelerator 0', () => {
    it.each([
      [
        'cuda.device',
        2,
        [['resource.accelerator', 0, 'setFieldsValue', 'rule:R-02']],
      ],
      // A unified slot keeps its cleared accelerator.
      ['cuda.unified', undefined, []],
    ])('type %s accelerator %s', (acceleratorType, accelerator, expected) => {
      const { patches } = run(
        valuesOf({
          resource: { ...RESOURCE, acceleratorType, accelerator },
        }),
        MOUNT,
        inputsOf({
          supportedAcceleratorTypesInRGByImage: [],
          acceleratorSlotsInRG: ACCEL_SLOTS,
        }),
      );
      expect(summary(patches)).toEqual(expected);
    });
  });

  describe('R-03 auto-select', () => {
    const LARGE = preset('id-large', 'large', 4, 8);
    const autoSelect = valuesOf({ allocationPreset: 'auto-select' });

    it('picks an allocatable preset, applies it (R-09) and validates resource', () => {
      const { patches } = run(
        autoSelect,
        MOUNT,
        inputsOf({
          checkPresetInfo: {
            presets: [LARGE],
          } as ResourceInputs['checkPresetInfo'],
          allocatablePresetIds: ['id-large'],
        }),
      );
      expect(summary(patches)).toEqual([
        ['allocationPreset', 'id-large', 'setFieldsValue', 'rule:R-03'],
        ['resource.mem', '8g', 'setFieldsValue', 'rule:R-03'],
        // [bug-compat] H24: the unconditional preset write, then R-06 re-derives it.
        ['resource.shmem', '0g', 'setFieldsValue', 'rule:R-03'],
        ['resource.cpu', 4, 'setFieldsValue', 'rule:R-03'],
        ['resource.shmem', '1g', 'setFieldValue', 'rule:R-03'],
        ['validate:resource', 'recursive', 'rule:R-03'],
        ['validate:resource', 'recursive', 'rule:R-03'],
      ]);
    });

    it('[bug-compat sort] sorts by code point: B-preset before a-preset', () => {
      const { state } = run(
        autoSelect,
        MOUNT,
        inputsOf({
          checkPresetInfo: {
            presets: [
              preset('id-lower', 'a-preset', 1, 1),
              preset('id-upper', 'B-preset', 2, 2),
            ],
          } as ResourceInputs['checkPresetInfo'],
          allocatablePresetIds: ['id-lower', 'id-upper'],
        }),
      );
      expect(state.values.allocationPreset).toBe('id-upper');
    });

    it.each([
      [true, true, 'minimum-required'],
      [false, true, null],
      // Without the preset select there is no preset to pick.
      [true, false, 'minimum-required'],
    ])(
      'with no pick (allowCustom %s, enableResourcePresets %s) falls back to %s with setFieldValue',
      (allowCustomResourceAllocation, enableResourcePresets, fallback) => {
        const { patches } = run(
          autoSelect,
          { type: 'dataArrived', keys: ['resourceSlotsInRG'] },
          inputsOf({
            allowCustomResourceAllocation,
            enableResourcePresets,
            checkPresetInfo: {
              presets: [LARGE],
            } as ResourceInputs['checkPresetInfo'],
            allocatablePresetIds: enableResourcePresets ? [] : ['id-large'],
          }),
        );
        expect(summary(patches)[0]).toEqual([
          'allocationPreset',
          fallback,
          'setFieldValue',
          'rule:R-03',
        ]);
      },
    );

    it('R-31 waits while the RG slot details load', () => {
      const { patches } = run(
        autoSelect,
        MOUNT,
        inputsOf({}, ['resourceSlotsInRG']),
      );
      expect(patches).toEqual([]);
    });
  });

  describe('R-04 accelerator type stays an RG slot', () => {
    it.each([
      // H16 [bug-compat]: ignores image support, takes the first RG slot.
      [
        'rocm.device',
        1,
        [
          [
            'resource.acceleratorType',
            'cuda.device',
            'setFieldsValue',
            'rule:R-04',
          ],
        ],
      ],
      ['cuda.device', 1, []],
      // R-07: a unified slot clears the accelerator.
      [
        'cuda.unified',
        1,
        [['resource.accelerator', undefined, 'setFieldValue', 'rule:R-07']],
      ],
    ])('type %s accelerator %s', (acceleratorType, accelerator, expected) => {
      const { patches } = run(
        valuesOf({ resource: { ...RESOURCE, acceleratorType, accelerator } }),
        { type: 'dataArrived', keys: ['acceleratorSlotsInRG'] },
        inputsOf({ acceleratorSlotsInRG: ACCEL_SLOTS }),
      );
      expect(
        summary(patches).map((row) => [row[0], row[1], row[2], row[3]]),
      ).toEqual(expected.map((row) => [row[0], row[1], row[2], 'rule:R-04']));
    });
  });

  describe('R-05 minimum-required applies the image minimums (R-08)', () => {
    const imageInputs = inputsOf({
      currentImage: { name: 'python' },
      currentImageAcceleratorLimits: [],
      resourceLimits: {
        accelerators: {},
        cpu: { min: 3, max: 8 },
        mem: { min: '2g', max: '32g' },
        shmem: { min: '64m' },
      },
    });
    const minimumRequired = valuesOf({
      allocationPreset: 'minimum-required',
      resource: { ...RESOURCE, cpu: 6, mem: '12g' },
    });

    it.each([['currentImage'], ['currentAllocationPreset']])(
      'on %s arriving: forced minimums, shmem rule, recursive validate',
      (key) => {
        const { patches } = run(
          minimumRequired,
          { type: 'dataArrived', keys: [key] },
          imageInputs,
        );
        expect(summary(patches)).toEqual([
          ['resource.cpu', 3, 'setFieldsValue', 'rule:R-05'],
          ['resource.mem', '2.0625g', 'setFieldsValue', 'rule:R-05'],
          ['validate:resource', 'recursive', 'rule:R-05'],
        ]);
      },
    );

    it('not on an unrelated arrival or an intent', () => {
      expect(
        run(
          minimumRequired,
          { type: 'dataArrived', keys: ['remaining'] },
          imageInputs,
        ).patches,
      ).toEqual([]);
      expect(
        summary(
          run(minimumRequired, { type: 'shmemEdited' }, imageInputs).patches,
        ),
      ).toEqual([['allocationPreset', 'custom', 'setFieldValue', 'user']]);
    });

    it('H4 [bug-compat] an image change under custom leaves values below the new minimum', () => {
      const { patches } = run(
        valuesOf({ resource: { ...RESOURCE, cpu: 1 } }),
        { type: 'dataArrived', keys: ['currentImage'] },
        imageInputs,
      );
      expect(patches).toEqual([]);
    });
  });

  describe('intents', () => {
    const LARGE = preset('id-large', 'large', 4, 8);
    const SHMEM_PRESET = preset('id-shm', 'shm', 1, 2, {}, 0.5);
    const presetInputs = inputsOf({
      checkPresetInfo: {
        presets: [LARGE, SHMEM_PRESET],
      } as ResourceInputs['checkPresetInfo'],
    });

    it.each<[string, LauncherEvent, LauncherValues, LauncherInputs, unknown[]]>(
      [
        // R-13 H14 [bug-compat]: flips even when nothing changed.
        [
          'R-13 cpuEdited',
          { type: 'cpuEdited' },
          valuesOf({ allocationPreset: 'id-large' }),
          inputsOf(),
          [['allocationPreset', 'custom', 'setFieldValue', 'user']],
        ],
        [
          'R-14 memEdited ≥ 4g → shmem 1g',
          { type: 'memEdited', payload: '8g' },
          valuesOf({
            allocationPreset: 'id-large',
            resource: { ...RESOURCE, mem: '8g' },
          }),
          inputsOf(),
          [
            ['allocationPreset', 'custom', 'setFieldValue', 'user'],
            ['resource.shmem', '1g', 'setFieldValue', 'user'],
          ],
        ],
        [
          'R-15 H15 shmemEdited keeps the preset when custom is disallowed',
          { type: 'shmemEdited' },
          valuesOf({ allocationPreset: 'id-large' }),
          inputsOf({ allowCustomResourceAllocation: false }),
          [],
        ],
        [
          'R-15 shmemEdited flips to custom when allowed',
          { type: 'shmemEdited' },
          valuesOf({ allocationPreset: 'id-large' }),
          inputsOf(),
          [['allocationPreset', 'custom', 'setFieldValue', 'user']],
        ],
        [
          'R-16 autoShmemToggled on re-derives shmem',
          { type: 'autoShmemToggled', payload: true },
          valuesOf({
            allocationPreset: 'id-large',
            resource: { ...RESOURCE, mem: '8g', shmem: '2g' },
          }),
          inputsOf(),
          [
            ['resource.shmem', '1g', 'setFieldValue', 'user'],
            ['allocationPreset', 'custom', 'setFieldValue', 'user'],
          ],
        ],
        [
          'R-18 acceleratorEdited',
          { type: 'acceleratorEdited' },
          valuesOf({ allocationPreset: 'id-large' }),
          inputsOf(),
          [['allocationPreset', 'custom', 'setFieldValue', 'user']],
        ],
        [
          'R-19 entering a unified slot clears the accelerator',
          {
            type: 'acceleratorTypeSelected',
            payload: {
              nextType: 'cuda.unified',
              currentAcceleratorType: 'cuda.device',
            },
          },
          valuesOf({
            resource: {
              ...RESOURCE,
              acceleratorType: 'cuda.unified',
              accelerator: 2,
            },
          }),
          inputsOf({ acceleratorSlotsInRG: ACCEL_SLOTS }),
          [['resource.accelerator', undefined, 'setFieldValue', 'user']],
        ],
        [
          'R-19 leaving a unified slot sets the new type’s minimum',
          {
            type: 'acceleratorTypeSelected',
            payload: {
              nextType: 'cuda.device',
              currentAcceleratorType: 'cuda.unified',
            },
          },
          valuesOf({
            resource: {
              ...RESOURCE,
              acceleratorType: 'cuda.device',
              accelerator: undefined,
            },
          }),
          inputsOf({ acceleratorSlotsInRG: ACCEL_SLOTS }),
          [['resource.accelerator', 1, 'setFieldValue', 'user']],
        ],
        [
          'R-10 custom writes nothing',
          { type: 'presetSelected', payload: 'custom' },
          valuesOf(),
          presetInputs,
          [],
        ],
        [
          'R-10 minimum-required turns automatic shmem on (R-05 follows on re-render)',
          { type: 'presetSelected', payload: 'minimum-required' },
          valuesOf({
            allocationPreset: 'minimum-required',
            enabledAutomaticShmem: false,
          }),
          presetInputs,
          [['enabledAutomaticShmem', true, 'setFieldValue', 'user']],
        ],
        [
          'R-10 R-09 a preset applies its slots and validates resource',
          { type: 'presetSelected', payload: 'id-large' },
          valuesOf({ allocationPreset: 'id-large' }),
          presetInputs,
          [
            ['resource.mem', '8g', 'setFieldsValue', 'user'],
            ['resource.shmem', '0g', 'setFieldsValue', 'user'],
            ['resource.cpu', 4, 'setFieldsValue', 'user'],
            ['resource.shmem', '1g', 'setFieldValue', 'user'],
            ['validate:resource', 'recursive', 'user'],
          ],
        ],
        [
          'R-10 R-09 a preset with shared memory turns automatic shmem off',
          { type: 'presetSelected', payload: 'id-shm' },
          valuesOf({ allocationPreset: 'id-shm' }),
          presetInputs,
          [
            ['enabledAutomaticShmem', false, 'setFieldValue', 'user'],
            ['resource.mem', '2g', 'setFieldsValue', 'user'],
            ['resource.shmem', '0.5g', 'setFieldsValue', 'user'],
            ['resource.cpu', 1, 'setFieldsValue', 'user'],
            ['validate:resource', 'recursive', 'user'],
          ],
        ],
      ],
    )('%s', (_name, event, values, inputs, expected) => {
      expect(summary(run(values, event, inputs).patches)).toEqual(expected);
    });
  });
});
