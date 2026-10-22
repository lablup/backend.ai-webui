/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The resource section's rules and intents (ADR 0013), migrated as-is from
// `ResourceAllocationFormItems`; ids are the Dependency map v2 rows (#10454).
import {
  acceleratorTypeChange,
  resolveAcceleratorType,
  shouldClearUnifiedAccelerator,
  shouldResetAcceleratorToZero,
} from '../domain/accelerator';
import { pickAutoPreset, presetToResourceValues } from '../domain/presets';
import type {
  ImageResourceLimits,
  MergedResourceLimits,
  ResourceAllocation,
} from '../domain/resourceLimits';
import {
  getAutomaticShmem,
  imageMinimumResources,
  isUnifiedMinimumTarget,
  pickChangedResourceValues,
  raiseToMinimums,
  type ResourceValues,
} from '../domain/shmem';
import {
  defineSlice,
  getIn,
  setIn,
  type LauncherValues,
  type NamePath,
  type Patch,
  type PatchWrite,
  type ReadyInputs,
  type Rule,
} from '../model';
import * as _ from 'lodash-es';

export const CPU = ['resource', 'cpu'];
export const MEM = ['resource', 'mem'];
export const SHMEM = ['resource', 'shmem'];
export const ACCELERATOR = ['resource', 'accelerator'];
export const ACCELERATOR_TYPE = ['resource', 'acceleratorType'];
export const ALLOCATION_PRESET = ['allocationPreset'];
export const AUTOMATIC_SHMEM = ['enabledAutomaticShmem'];

const RESOURCE_PATHS = [CPU, MEM, SHMEM, ACCELERATOR, ACCELERATOR_TYPE];

/**
 * What `ResourceAllocationFormItems` reads today, under the names it uses.
 * `currentAllocationPreset` / `currentResourceValue` are its `useWatch`
 * values: they arrive when the form changes outside a dispatch, as the
 * effects they replace re-ran on a re-render.
 */
export type ResourceInputs = {
  resourceLimits: MergedResourceLimits;
  checkPresetInfo: ResourceAllocation | null | undefined;
  allocatablePresetIds: string[];
  /** `loading` while the RG slot details load (R-31). */
  resourceSlotsInRG: Record<string, unknown>;
  acceleratorSlotsInRG: Record<string, unknown> | undefined;
  supportedAcceleratorTypesInRGByImage: string[] | undefined;
  currentImage: unknown;
  currentImageAcceleratorLimits: ImageResourceLimits | undefined;
  currentImageMinM: string;
  currentAllocationPreset: string | null | undefined;
  currentResourceValue: unknown;
  enableResourcePresets: boolean | undefined;
  allowCustomResourceAllocation: boolean | undefined;
  forceImageMinValues: boolean;
};

const asResourceInputs = (inputs: ReadyInputs) =>
  inputs as Partial<ResourceInputs>;

const SET_FIELDS: PatchWrite = { method: 'setFieldsValue' };
const SET_FIELD: PatchWrite = { method: 'setFieldValue' };
const VALIDATE_RESOURCE: PatchWrite = {
  method: 'none',
  validateAfter: [['resource']],
  validateOptions: { recursive: true },
};

const reasonOf = (id: string) => `sessionLauncher.rule.${id}`;

/** Sequential writes: each step reads what the previous ones wrote, as the form store did. */
const createDraft = (values: LauncherValues) => {
  let current = values;
  const patches: Patch[] = [];
  return {
    get: (path: NamePath) => getIn(current, path),
    set: (id: string, path: NamePath, value: unknown, write: PatchWrite) => {
      patches.push({
        path,
        value,
        policy: 'force',
        reason: reasonOf(id),
        write,
      });
      current = setIn(current, path, value);
    },
    validate: (id: string, write: PatchWrite) => {
      patches.push({
        path: write.validateAfter?.[0] ?? [],
        value: undefined,
        policy: 'force',
        reason: reasonOf(id),
        write,
      });
    },
    resource: () =>
      _.omitBy(
        {
          cpu: getIn(current, CPU),
          mem: getIn(current, MEM),
          shmem: getIn(current, SHMEM),
          accelerator: getIn(current, ACCELERATOR),
          acceleratorType: getIn(current, ACCELERATOR_TYPE),
        },
        _.isUndefined,
      ) as ResourceValues,
    patches,
  };
};
type Draft = ReturnType<typeof createDraft>;

/** `setFieldsValue({ resource })`, one patch per key it carries. */
const setResource = (
  draft: Draft,
  id: string,
  resource: Record<string, unknown>,
) => {
  _.forEach(resource, (value, key) => {
    draft.set(id, ['resource', key], value, SET_FIELDS);
  });
};

// R-06 `runShmemAutomationRule`.
const runShmemAutomation = (
  draft: Draft,
  M_plus_S: string,
  imageMinMem: string,
) => {
  const shmem = getAutomaticShmem(M_plus_S, imageMinMem);
  if (
    !_.isEmpty(
      pickChangedResourceValues({ shmem }, { shmem: draft.get(SHMEM) }),
    )
  ) {
    draft.set('R-06', SHMEM, shmem, SET_FIELD);
  }
};

// R-07 `syncUnifiedAcceleratorIfNeeded`.
const syncUnifiedAccelerator = (draft: Draft) => {
  if (
    shouldClearUnifiedAccelerator({
      acceleratorType: draft.get(ACCELERATOR_TYPE) as string | undefined,
      accelerator: draft.get(ACCELERATOR) as number | undefined,
    })
  ) {
    draft.set('R-07', ACCELERATOR, undefined, SET_FIELD);
  }
};

// R-04 `ensureValidAcceleratorType`.
const ensureValidAcceleratorType = (
  draft: Draft,
  acceleratorSlotsInRG: Record<string, unknown> | undefined,
) => {
  const currentAcceleratorType = draft.get(ACCELERATOR_TYPE) as
    string | undefined;
  const resolved = resolveAcceleratorType({
    currentAcceleratorType,
    acceleratorSlotsInRG,
  });
  if (resolved !== currentAcceleratorType) {
    draft.set('R-04', ACCELERATOR_TYPE, resolved, SET_FIELDS);
  }
  syncUnifiedAccelerator(draft);
};

// R-08 `updateResourceFieldsBasedOnImage`.
const applyImageMinimums = (
  draft: Draft,
  inputs: Partial<ResourceInputs>,
  force: boolean,
) => {
  const currentAcceleratorType = draft.get(ACCELERATOR_TYPE) as
    string | undefined;
  let minimumResources = imageMinimumResources({
    resourceLimits: inputs.resourceLimits as MergedResourceLimits,
    imageAcceleratorLimits: inputs.currentImageAcceleratorLimits,
    currentAcceleratorType,
    resourceSlotKeysInRG: _.keys(inputs.resourceSlotsInRG),
  });
  if (!inputs.forceImageMinValues && !force) {
    minimumResources = raiseToMinimums(draft.resource(), minimumResources);
  }
  const isUnifiedTarget = isUnifiedMinimumTarget(
    minimumResources,
    currentAcceleratorType,
  );
  if (isUnifiedTarget) {
    delete minimumResources.accelerator;
  }
  setResource(
    draft,
    'R-08',
    pickChangedResourceValues(minimumResources, draft.resource()),
  );
  if (
    inputs.currentImage &&
    inputs.currentImageAcceleratorLimits &&
    inputs.currentImageAcceleratorLimits.length === 0 &&
    !isUnifiedTarget &&
    draft.get(ACCELERATOR) !== 0
  ) {
    draft.set('R-08', ACCELERATOR, 0, SET_FIELD);
  }
  if (draft.get(AUTOMATIC_SHMEM)) {
    runShmemAutomation(
      draft,
      (draft.get(MEM) as string) || '0g',
      inputs.currentImageMinM ?? '0g',
    );
  }
  syncUnifiedAccelerator(draft);
  draft.validate('R-08', VALIDATE_RESOURCE);
};

// R-09 `updateResourceFieldsBasedOnPreset`.
const applyPreset = (
  draft: Draft,
  presetId: string,
  inputs: Partial<ResourceInputs>,
) => {
  const preset = _.find(
    inputs.checkPresetInfo?.presets,
    (candidate) => candidate.id === presetId,
  );
  const presetValues = presetToResourceValues({
    preset,
    resourceSlotKeysInRG: _.keys(inputs.resourceSlotsInRG),
    acceleratorSlotKeysInRG: _.keys(inputs.acceleratorSlotsInRG),
  });
  // [bug-compat] H24: not size-diffed like R-08, so `'4g'` over `'4096m'` is
  // written (the input switches to GiB); only a strictly equal value is dropped.
  setResource(draft, 'R-09', presetValues.resource);
  draft.set(
    'R-09',
    AUTOMATIC_SHMEM,
    presetValues.enabledAutomaticShmem,
    SET_FIELDS,
  );
  if (presetValues.enabledAutomaticShmem) {
    runShmemAutomation(
      draft,
      presetValues.resource.mem || '0g',
      inputs.currentImageMinM ?? '0g',
    );
  }
  syncUnifiedAccelerator(draft);
  draft.validate('R-09', VALIDATE_RESOURCE);
};

const ALL_FIELDS = [...RESOURCE_PATHS, ALLOCATION_PRESET, AUTOMATIC_SHMEM];

/** R-01: an empty `resource` puts a non-custom preset back on `auto-select`. */
const r01: Rule = {
  id: 'R-01',
  reads: [...RESOURCE_PATHS, ALLOCATION_PRESET],
  writes: [ALLOCATION_PRESET],
  run: ({ values }) => {
    // Today reads the store's `resource` object; the model only sees its fields.
    const isResourceEmpty = RESOURCE_PATHS.every((path) =>
      _.isUndefined(getIn(values, path)),
    );
    if (isResourceEmpty && getIn(values, ALLOCATION_PRESET) !== 'custom') {
      const draft = createDraft(values);
      draft.set('R-01', ALLOCATION_PRESET, 'auto-select', SET_FIELDS);
      return draft.patches;
    }
    return [];
  },
};

/** R-02: no supported accelerator type → accelerator 0, except a unified slot. */
const r02: Rule = {
  id: 'R-02',
  reads: [ACCELERATOR, ACCELERATOR_TYPE],
  writes: [ACCELERATOR],
  run: ({ values, inputs }) => {
    if (
      shouldResetAcceleratorToZero({
        supportedAcceleratorTypes:
          asResourceInputs(inputs).supportedAcceleratorTypesInRGByImage,
        acceleratorType: getIn(values, ACCELERATOR_TYPE) as string | undefined,
        accelerator: getIn(values, ACCELERATOR) as number | undefined,
      })
    ) {
      const draft = createDraft(values);
      draft.set('R-02', ACCELERATOR, 0, SET_FIELDS);
      return draft.patches;
    }
    return [];
  },
};

/** R-03: `auto-select` picks a preset (R-09) or a fallback once the RG slots load. */
const r03: Rule = {
  id: 'R-03',
  reads: ALL_FIELDS,
  writes: ALL_FIELDS,
  needs: ['resourceSlotsInRG'],
  run: ({ values, inputs: readyInputs }) => {
    if (getIn(values, ALLOCATION_PRESET) !== 'auto-select') return [];
    const inputs = asResourceInputs(readyInputs);
    const draft = createDraft(values);
    const choice = pickAutoPreset({
      storedPreset: getIn(values, ALLOCATION_PRESET) as string,
      presets: inputs.checkPresetInfo?.presets,
      allocatablePresetIds: inputs.allocatablePresetIds ?? [],
      enableResourcePresets: inputs.enableResourcePresets,
      allowCustomResourceAllocation: inputs.allowCustomResourceAllocation,
    });
    if (choice.kind === 'preset') {
      draft.set('R-03', ALLOCATION_PRESET, choice.presetId, SET_FIELDS);
      applyPreset(draft, choice.presetId, inputs);
    } else if (choice.kind === 'fallback') {
      draft.set('R-03', ALLOCATION_PRESET, choice.allocationPreset, SET_FIELD);
    }
    ensureValidAcceleratorType(draft, inputs.acceleratorSlotsInRG);
    draft.validate('R-03', VALIDATE_RESOURCE);
    return draft.patches;
  },
};

/** R-04: the accelerator type stays one of the RG's slots (the effect's else branch). */
const r04: Rule = {
  id: 'R-04',
  reads: [ACCELERATOR, ACCELERATOR_TYPE],
  writes: [ACCELERATOR, ACCELERATOR_TYPE],
  run: ({ values, inputs }) => {
    const draft = createDraft(values);
    ensureValidAcceleratorType(
      draft,
      asResourceInputs(inputs).acceleratorSlotsInRG,
    );
    return draft.patches;
  },
};

/** Keys whose arrival re-ran the minimum-required effect (its dependency array). */
const R05_TRIGGERS = ['currentImage', 'currentAllocationPreset'];

/**
 * R-05: under `minimum-required`, an image or preset change forces the image
 * minimums (R-08). Once per change, so a later rule's write is not undone.
 */
const r05: Rule = {
  id: 'R-05',
  reads: ALL_FIELDS,
  writes: RESOURCE_PATHS,
  run: ({ values, event, inputs, pass }) => {
    if (
      pass > 0 ||
      event.type !== 'dataArrived' ||
      !('keys' in event) ||
      _.isEmpty(_.intersection(event.keys, R05_TRIGGERS)) ||
      getIn(values, ALLOCATION_PRESET) !== 'minimum-required'
    ) {
      return [];
    }
    const draft = createDraft(values);
    applyImageMinimums(draft, asResourceInputs(inputs), true);
    return draft.patches;
  },
};

const flipToCustom = (draft: Draft, id: string) =>
  draft.set(id, ALLOCATION_PRESET, 'custom', SET_FIELD);

export interface AcceleratorTypeSelectedPayload {
  nextType: string;
  /** The type before this selection; the form already holds `nextType`. */
  currentAcceleratorType: string | undefined;
}

export const resourceSlice = defineSlice({
  name: 'resource',
  fields: [
    ...ALL_FIELDS,
    ['resourceGroup'],
    ['cluster_mode'],
    ['cluster_size'],
    ['agent'],
  ],
  inputs: {
    resourceLimits: 'required',
    checkPresetInfo: 'required',
    allocatablePresetIds: 'required',
    resourceSlotsInRG: 'required',
    acceleratorSlotsInRG: 'required',
    supportedAcceleratorTypesInRGByImage: 'required',
    currentImage: 'required',
    currentImageAcceleratorLimits: 'required',
    currentImageMinM: 'required',
    currentAllocationPreset: 'required',
    currentResourceValue: 'required',
    enableResourcePresets: 'required',
    allowCustomResourceAllocation: 'required',
    forceImageMinValues: 'required',
  },
  intents: {
    // R-10
    presetSelected: (values, value: string, readyInputs: ReadyInputs) => {
      const inputs = asResourceInputs(readyInputs);
      const draft = createDraft(values);
      if (value === 'minimum-required') {
        // R-05 applies the minimums once the preset change re-renders.
        draft.set('R-10', AUTOMATIC_SHMEM, true, SET_FIELD);
      } else if (value !== 'custom') {
        const selectedPreset = _.find(
          inputs.checkPresetInfo?.presets,
          (preset) => preset.id === value,
        );
        const hasPresetShmem =
          selectedPreset?.shared_memory &&
          Number(selectedPreset.shared_memory) > 0;
        draft.set('R-10', AUTOMATIC_SHMEM, !hasPresetShmem, SET_FIELD);
        applyPreset(draft, value, inputs);
      }
      return draft.patches;
    },
    // R-13 [bug-compat] H14/H15: unconditional, even when nothing changed.
    cpuEdited: (values) => {
      const draft = createDraft(values);
      flipToCustom(draft, 'R-13');
      return draft.patches;
    },
    // R-14
    memEdited: (
      values,
      M_plus_S: string | undefined,
      readyInputs: ReadyInputs,
    ) => {
      const draft = createDraft(values);
      flipToCustom(draft, 'R-14');
      if (draft.get(AUTOMATIC_SHMEM)) {
        runShmemAutomation(
          draft,
          M_plus_S || '0g',
          asResourceInputs(readyInputs).currentImageMinM ?? '0g',
        );
      }
      syncUnifiedAccelerator(draft);
      return draft.patches;
    },
    // R-15 H15: gated on custom allocation, unlike R-13/R-14/R-18/R-19.
    shmemEdited: (values, _payload: undefined, readyInputs: ReadyInputs) => {
      const draft = createDraft(values);
      if (asResourceInputs(readyInputs).allowCustomResourceAllocation) {
        flipToCustom(draft, 'R-15');
      }
      return draft.patches;
    },
    // R-16
    autoShmemToggled: (values, checked: boolean, readyInputs: ReadyInputs) => {
      const inputs = asResourceInputs(readyInputs);
      const draft = createDraft(values);
      if (checked) {
        runShmemAutomation(
          draft,
          (draft.get(MEM) as string) || '0g',
          inputs.currentImageMinM ?? '0g',
        );
      }
      if (inputs.allowCustomResourceAllocation) {
        flipToCustom(draft, 'R-16');
      }
      return draft.patches;
    },
    // R-18
    acceleratorEdited: (values) => {
      const draft = createDraft(values);
      flipToCustom(draft, 'R-18');
      return draft.patches;
    },
    // R-19 H16: discrete-to-discrete keeps the value; R-04 does not clamp it.
    acceleratorTypeSelected: (
      values,
      { nextType, currentAcceleratorType }: AcceleratorTypeSelectedPayload,
      readyInputs: ReadyInputs,
    ) => {
      const draft = createDraft(values);
      flipToCustom(draft, 'R-19');
      const change = acceleratorTypeChange({
        nextType,
        currentAcceleratorType,
        acceleratorLimits:
          asResourceInputs(readyInputs).resourceLimits?.accelerators ?? {},
      });
      if (change.kind === 'enter-unified') {
        draft.set('R-19', ACCELERATOR_TYPE, nextType, SET_FIELD);
        syncUnifiedAccelerator(draft);
      } else if (change.kind === 'leave-unified') {
        draft.set('R-19', ACCELERATOR, change.accelerator, SET_FIELD);
      }
      return draft.patches;
    },
  },
  rules: [r01, r02, r03, r04, r05],
});
