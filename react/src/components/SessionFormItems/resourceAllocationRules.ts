/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  addNumberWithUnits,
  compareNumberWithUnits,
  convertToBinaryUnit,
} from '../../helper';
import { isUnifiedAcceleratorSlot } from '../../helper/unifiedAcceleratorSlot';
import type {
  MergedResourceLimits,
  ResourcePreset,
} from '../../hooks/useResourceLimitAndRemaining';
import type { Image } from '../ImageEnvironmentSelectFormItems';
import { getUnavailableSlotNames } from '../ResourcePresetSelect';
import * as _ from 'lodash-es';

export interface ResourceAllocationFormValue {
  resource: {
    cpu: number;
    mem: string;
    shmem?: string;
    accelerator?: number;
    acceleratorType?: string;
  };
  resourceGroup: string;
  num_of_sessions?: number;
  cluster_mode: 'single-node' | 'multi-node';
  cluster_size: number;
  enabledAutomaticShmem: boolean;
  allocationPreset?: string;
  agent?: string[] | string;
}

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
 * by size, so `1g` and `1024m` count as unchanged. Automatic writes go
 * through this so re-running them settles instead of re-notifying the form
 * (FR-3985).
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

// `free` = `allowCustomResourceAllocation`: the preset select offers custom /
// minimum-required and the cpu / mem / accelerator items are visible.
export type AllocationMode = 'free' | 'preset-only';

export type ResourceFields = Partial<ResourceAllocationFormValue['resource']>;

// The form as a handler sees it: the form engine has already written the
// edited field when it calls the control's `onChange`.
export type ResourceValues = Omit<
  Partial<ResourceAllocationFormValue>,
  'resource' | 'allocationPreset'
> & {
  resource?: ResourceFields;
  allocationPreset?: string | null;
};

export interface RuleContext {
  mode: AllocationMode;
  enableResourcePresets: boolean;
  /** `environments.image`; undefined for a manual image or before it loads. */
  image: Image | undefined;
  /** `environments.manual` is set, so every accelerator type is allowed. */
  manualImage: boolean;
  /** Slot names of the resource group; undefined until they load. */
  slotsInRG: string[] | undefined;
  /** `slotsInRG` minus cpu / mem / shmem, in the order the type select lists them. */
  acceleratorSlotsInRG: string[];
  presets: ResourcePreset[] | undefined;
  allocatablePresetIds: string[];
  resourceLimits: MergedResourceLimits;
  imageMinMem: string;
  /** Leave a restored `custom` alone in preset-only mode too (a cloned revision's values). */
  keepRestoredAllocation?: boolean;
}

export type RuleEvent =
  | {
      type: 'user.setResource';
      field: 'cpu' | 'accelerator';
      value: number | null | undefined;
    }
  | {
      type: 'user.setResource';
      field: 'mem' | 'shmem';
      value: string | null | undefined;
    }
  | { type: 'user.setAcceleratorType'; next: string; prev: string | undefined }
  /** A preset id, `'custom'` or `'minimum-required'`. */
  | { type: 'user.selectPreset'; id: string }
  | { type: 'user.toggleAutoShmem'; on: boolean }
  /** The image, resource group, presets or slots arrived or changed. */
  | { type: 'data.changed' };

/** Only the keys that must change; `{}` means write nothing. */
export type RulePatch = {
  resource?: ResourceFields;
  allocationPreset?: string | null;
  enabledAutomaticShmem?: boolean;
};

interface Draft {
  resource: ResourceFields;
  allocationPreset: string | null | undefined;
  enabledAutomaticShmem: boolean | undefined;
}

export const NON_ACCELERATOR_SLOTS = ['cpu', 'mem', 'shmem'];

export const getImageAcceleratorLimits = (image: Image | undefined) =>
  image
    ? _.filter(image.resource_limits, (limit) =>
        limit ? !_.includes(NON_ACCELERATOR_SLOTS, limit.key) : false,
      )
    : undefined;

/** Accelerator types of the resource group the image can run on; undefined until both are known. */
export const getSupportedAcceleratorTypes = (
  ctx: RuleContext,
): string[] | undefined => {
  if (
    _.isUndefined(ctx.slotsInRG) ||
    (_.isNil(ctx.image) && !ctx.manualImage)
  ) {
    return undefined;
  }
  const supported = ctx.image?.supported_accelerators;
  return ctx.acceleratorSlotsInRG.filter(
    (name) =>
      _.includes(supported, '*') ||
      // Before BA-2358 the manager could return '' instead of '*'.
      (supported?.length === 1 && supported[0] === '') ||
      _.some(
        supported,
        (prefix) => !!prefix && name.split('.')[0].startsWith(prefix),
      ) ||
      ctx.manualImage,
  );
};

/** The current type when the group has it, else the group's first slot the image supports, else its first slot. */
export const resolveAcceleratorType = (
  current: string | undefined,
  acceleratorSlotsInRG: string[],
  supportedTypes?: string[],
) =>
  (current && acceleratorSlotsInRG.includes(current)
    ? current
    : (_.first(supportedTypes) ?? _.first(acceleratorSlotsInRG))) || current;

const PSEUDO_PRESET_IDS = ['custom', 'minimum-required', 'auto-select'];

/** D2 protects a preset's values; `custom`, `minimum-required`, `auto-select` and no label are not a preset. */
export const isPresetId = (label: string | null | undefined): label is string =>
  !!label && !PSEUDO_PRESET_IDS.includes(label);

/** Free values follow the image and the group; a preset's values are its validator's (#10628). */
const hasFreeValues = (draft: Draft, ctx: RuleContext) =>
  ctx.mode === 'free' || !isPresetId(draft.allocationPreset);

/** The one writer of `acceleratorType`: a user choice and a data-forced swap alike. */
const setAcceleratorType = (
  draft: Draft,
  next: string,
  prev: string | undefined,
  ctx: RuleContext,
) => {
  draft.resource.acceleratorType = next;
  if (isUnifiedAcceleratorSlot(next)) {
    draft.resource.accelerator = undefined;
  } else if (isUnifiedAcceleratorSlot(prev)) {
    // The empty unified value is not a device count; start from the slot's min.
    draft.resource.accelerator =
      ctx.resourceLimits.accelerators[next]?.min ?? 0;
  }
};

/** A type the group lacks moves to its first slot; one the image dropped moves to the only type it runs on (several is a validator error). */
const syncAcceleratorType = (
  draft: Draft,
  supportedTypes: string[] | undefined,
  ctx: RuleContext,
) => {
  const current = draft.resource.acceleratorType;
  let next = resolveAcceleratorType(
    current,
    ctx.acceleratorSlotsInRG,
    supportedTypes,
  );
  if (next && supportedTypes?.length === 1 && !supportedTypes.includes(next)) {
    next = supportedTypes[0];
  }
  if (next && next !== current) setAcceleratorType(draft, next, current, ctx);
};

// Which item reports an accelerator type the image does not support, if any
// (ADR 0016 §4: free → the type item, preset-only pseudo label → the preset item).
export const acceleratorTypeErrorTarget = (
  value: string | undefined,
  allocationPreset: string | null | undefined,
  ctx: RuleContext,
  supportedTypes = getSupportedAcceleratorTypes(ctx),
): 'type' | 'preset' | undefined => {
  if (
    !value ||
    !supportedTypes ||
    supportedTypes.length === 0 ||
    supportedTypes.includes(value)
  ) {
    return undefined;
  }
  if (ctx.mode === 'free' || !ctx.enableResourcePresets) return 'type';
  return allocationPreset && !isPresetId(allocationPreset)
    ? 'preset'
    : undefined;
};

/** What selecting `preset` writes: its slots the group has, in `g`, plus the shmem rule. */
export const getPresetResourceFields = (
  preset: ResourcePreset,
  ctx: RuleContext,
) => {
  const slots = _.pick(preset.resource_slots, ctx.slotsInRG ?? []);
  const acceleratorSlots: Record<string, string | undefined> = _.omit(
    slots,
    NON_ACCELERATOR_SLOTS,
  );
  const acceleratorType = _.find(
    ctx.acceleratorSlotsInRG,
    (name) => acceleratorSlots[name] !== undefined,
  );
  const mem = convertToBinaryUnit(slots.mem || 0, 'g', 2)?.value;
  const hasPresetShmem =
    !!preset.shared_memory && Number(preset.shared_memory) > 0;
  const resource: ResourceFields = {
    cpu: parseInt(slots.cpu || '0') || 0,
    mem,
    shmem: hasPresetShmem
      ? convertToBinaryUnit(preset.shared_memory || 0, 'g', 2)?.value
      : getAutomaticShmem(mem || '0g', ctx.imageMinMem),
    accelerator: acceleratorType
      ? Number(acceleratorSlots[acceleratorType] || 0)
      : 0,
    ...(acceleratorType ? { acceleratorType } : {}),
  };
  return { resource, enabledAutomaticShmem: !hasPresetShmem };
};

/** What `minimum-required` writes: the image minimum per slot; accelerator 0 when the image needs none. */
export const getMinimumRequiredResourceFields = (
  values: ResourceValues,
  ctx: RuleContext,
): ResourceFields => {
  const { resourceLimits } = ctx;
  const currentType = values.resource?.acceleratorType;
  const minimum: ResourceFields = {
    // Omitted while the slots have not loaded, so the CPU field is not cleared.
    ...(resourceLimits.cpu?.min === undefined
      ? {}
      : { cpu: resourceLimits.cpu.min }),
    mem:
      convertToBinaryUnit(
        (convertToBinaryUnit(resourceLimits.shmem?.min, 'm')?.number || 0) +
          (convertToBinaryUnit(resourceLimits.mem?.min, 'm')?.number || 0) +
          'm',
        'g',
      )?.number + 'g',
  };
  const imageAcceleratorLimits = getImageAcceleratorLimits(ctx.image);
  if (imageAcceleratorLimits && imageAcceleratorLimits.length > 0) {
    // The current type when the image lists it, else the image's first type the group has.
    const type = _.some(
      imageAcceleratorLimits,
      (limit) => limit?.key === currentType,
    )
      ? currentType
      : _.find(imageAcceleratorLimits, (limit) =>
          _.includes(ctx.slotsInRG, limit?.key),
        )?.key;
    if (type) {
      minimum.acceleratorType = type;
      minimum.accelerator = resourceLimits.accelerators[type]?.min;
    }
  } else {
    minimum.accelerator = 0;
  }
  // A unified slot keeps `accelerator` cleared.
  if (isUnifiedAcceleratorSlot(minimum.acceleratorType ?? currentType)) {
    delete minimum.accelerator;
  }
  return minimum;
};

const applyPreset = (
  draft: Draft,
  preset: ResourcePreset,
  ctx: RuleContext,
) => {
  const { resource, enabledAutomaticShmem } = getPresetResourceFields(
    preset,
    ctx,
  );
  Object.assign(draft.resource, resource);
  draft.enabledAutomaticShmem = enabledAutomaticShmem;
};

const applyMinimumRequired = (draft: Draft, ctx: RuleContext) => {
  Object.assign(draft.resource, getMinimumRequiredResourceFields(draft, ctx));
  if (draft.enabledAutomaticShmem) {
    draft.resource.shmem = getAutomaticShmem(
      draft.resource.mem || '0g',
      ctx.imageMinMem,
    );
  }
};

const getAllocatablePresets = (ctx: RuleContext) =>
  _.filter(ctx.presets, (preset) =>
    ctx.allocatablePresetIds.includes(preset.id),
  );

/** The first allocatable preset by name, else minimum-required (free) or none (preset-only). */
const selectFallbackPreset = (draft: Draft, ctx: RuleContext) => {
  const firstAllocatablePreset = _.sortBy(
    getAllocatablePresets(ctx),
    'name',
  )[0];
  if (ctx.enableResourcePresets && firstAllocatablePreset) {
    draft.allocationPreset = firstAllocatablePreset.id;
    applyPreset(draft, firstAllocatablePreset, ctx);
  } else if (ctx.mode === 'free') {
    draft.allocationPreset = 'minimum-required';
  } else {
    draft.allocationPreset = null;
  }
};

/** Preset-only has no `custom` / `minimum-required`: a restored label becomes the allocatable preset the values are on, or none, so the user picks. */
const relabelRestoredAllocation = (draft: Draft, ctx: RuleContext) => {
  if (ctx.keepRestoredAllocation || _.isUndefined(ctx.presets)) return;
  if (draft.allocationPreset === 'minimum-required') {
    applyMinimumRequired(draft, ctx);
  } else if (draft.allocationPreset !== 'custom') {
    return;
  }
  draft.allocationPreset =
    findPresetOn(draft.resource, getAllocatablePresets(ctx), ctx)?.id ?? null;
};

const applyDataChanged = (
  draft: Draft,
  values: ResourceValues,
  ctx: RuleContext,
  supportedTypes: string[] | undefined,
) => {
  // `auto-select` is the initial value; a form restored without `resource` starts there too.
  if (!values.resource && draft.allocationPreset !== 'custom') {
    draft.allocationPreset = 'auto-select';
  }
  if (draft.allocationPreset === 'auto-select') {
    selectFallbackPreset(draft, ctx);
  }
  if (ctx.mode !== 'free') relabelRestoredAllocation(draft, ctx);
  if (!hasFreeValues(draft, ctx)) return;
  syncAcceleratorType(draft, supportedTypes, ctx);
  if (ctx.mode === 'free' && draft.allocationPreset === 'minimum-required') {
    applyMinimumRequired(draft, ctx);
  }
  // Amounts restored as `custom` (a URL prefill) skip the event that sizes shmem.
  if (
    draft.allocationPreset === 'custom' &&
    draft.enabledAutomaticShmem &&
    compareNumberWithUnits(draft.resource.mem || '0g', '0g') > 0 &&
    compareNumberWithUnits(draft.resource.shmem || '0g', '0g') === 0
  ) {
    draft.resource.shmem = getAutomaticShmem(
      draft.resource.mem as string,
      ctx.imageMinMem,
    );
  }
};

/** Whether `resource` holds what `fields` would write: sizes by value, a unified slot by type only. */
const matchesFields = (
  resource: ResourceFields,
  fields: ResourceFields,
): boolean =>
  _.every(_.omitBy(fields, _.isUndefined), (expected, key) => {
    const actual = resource[key as keyof ResourceFields];
    if (key === 'mem') {
      return (
        _.isString(expected) &&
        _.isString(actual) &&
        compareNumberWithUnits(expected, actual) === 0
      );
    }
    if (key === 'accelerator') {
      return (
        isUnifiedAcceleratorSlot(
          fields.acceleratorType ?? resource.acceleratorType,
        ) || (expected ?? 0) === (actual ?? 0)
      );
    }
    return expected === actual;
  });

/**
 * Whether `resource` is on `preset`: cpu, mem by size, the accelerator type
 * when the preset has a slot in this group, and its amount unless the slot is
 * unified. shmem is a setting, never compared. Undefined when the group
 * cannot serve the preset.
 */
export const matchesPreset = (
  resource: ResourceFields,
  preset: ResourcePreset,
  ctx: RuleContext,
): boolean | undefined => {
  if (
    getUnavailableSlotNames(preset.resource_slots, ctx.slotsInRG ?? []).length >
    0
  ) {
    return undefined;
  }
  return matchesFields(
    resource,
    _.omit(getPresetResourceFields(preset, ctx).resource, 'shmem'),
  );
};

/** The first of `presets` by name that `resource` is on. */
const findPresetOn = (
  resource: ResourceFields,
  presets: ResourcePreset[],
  ctx: RuleContext,
) =>
  _.sortBy(presets, 'name').find((preset) =>
    matchesPreset(resource, preset, ctx),
  );

/**
 * In free mode the label follows the values: a preset or the minimum whose
 * values were edited reads `custom`, and a value edit that lands on an
 * allocatable preset reads that preset. A preset the group cannot serve, or
 * one the check-presets response lacks (scoped to another group), keeps its
 * label for the preset validator. Preset-only mode has no `custom`.
 */
export const deriveAllocationPreset = (
  values: ResourceValues,
  ctx: RuleContext,
  { valueEdited = false } = {},
): string | null | undefined => {
  const label = values.allocationPreset;
  if (ctx.mode !== 'free' || !label || _.isUndefined(ctx.slotsInRG)) {
    return label;
  }
  const resource = values.resource ?? {};
  if (label === 'custom') {
    if (!valueEdited || !ctx.enableResourcePresets) return label;
    const landedOn = findPresetOn(resource, getAllocatablePresets(ctx), ctx);
    return landedOn?.id ?? label;
  }
  if (label === 'minimum-required') {
    return matchesFields(
      resource,
      getMinimumRequiredResourceFields(values, ctx),
    )
      ? label
      : 'custom';
  }
  const preset = _.find(ctx.presets, (preset) => preset.id === label);
  if (!preset) return label;
  return matchesPreset(resource, preset, ctx) === false ? 'custom' : label;
};

const diff = (values: ResourceValues, draft: Draft): RulePatch => {
  const patch: RulePatch = {};
  const resource = pickChangedResourceValues(draft.resource, values.resource);
  if (!_.isEmpty(resource)) patch.resource = resource;
  if (draft.allocationPreset !== values.allocationPreset) {
    patch.allocationPreset = draft.allocationPreset;
  }
  if (draft.enabledAutomaticShmem !== values.enabledAutomaticShmem) {
    patch.enabledAutomaticShmem = draft.enabledAutomaticShmem;
  }
  return patch;
};

/**
 * Every "when X changes, write Y" rule of the allocation form. Pure: the
 * caller writes the patch, so applying the same event twice returns `{}`.
 */
export const applyRule = (
  values: ResourceValues,
  event: RuleEvent,
  ctx: RuleContext,
): RulePatch => {
  const draft: Draft = {
    resource: { ...values.resource },
    allocationPreset: values.allocationPreset,
    enabledAutomaticShmem: values.enabledAutomaticShmem,
  };
  const supportedTypes = getSupportedAcceleratorTypes(ctx);
  switch (event.type) {
    case 'user.setResource':
      if (event.field === 'mem' && draft.enabledAutomaticShmem) {
        draft.resource.shmem = getAutomaticShmem(
          event.value || '0g',
          ctx.imageMinMem,
        );
      }
      break;
    case 'user.toggleAutoShmem':
      draft.enabledAutomaticShmem = event.on;
      if (event.on) {
        draft.resource.shmem = getAutomaticShmem(
          draft.resource.mem || '0g',
          ctx.imageMinMem,
        );
      }
      break;
    case 'user.setAcceleratorType':
      setAcceleratorType(draft, event.next, event.prev, ctx);
      break;
    case 'user.selectPreset':
      draft.allocationPreset = event.id;
      if (event.id === 'minimum-required') {
        draft.enabledAutomaticShmem = true;
        applyMinimumRequired(draft, ctx);
      } else if (event.id !== 'custom') {
        const preset = _.find(ctx.presets, (preset) => preset.id === event.id);
        // An id the check-presets response lacks (a deferred group) writes nothing.
        if (preset) applyPreset(draft, preset, ctx);
      }
      break;
    case 'data.changed':
      if (_.isUndefined(ctx.slotsInRG)) return {};
      applyDataChanged(draft, values, ctx, supportedTypes);
      break;
  }

  // Invariants: free values carry no accelerator the image cannot use (a
  // preset's value is its validator's); a unified slot never carries a quantity.
  if (
    hasFreeValues(draft, ctx) &&
    supportedTypes?.length === 0 &&
    !isUnifiedAcceleratorSlot(draft.resource.acceleratorType) &&
    draft.resource.accelerator !== 0
  ) {
    draft.resource.accelerator = 0;
  }
  if (
    isUnifiedAcceleratorSlot(draft.resource.acceleratorType) &&
    draft.resource.accelerator !== undefined
  ) {
    draft.resource.accelerator = undefined;
  }
  // shmem is a setting: its edit and the automatic toggle never move the label.
  draft.allocationPreset = deriveAllocationPreset(draft, ctx, {
    valueEdited:
      event.type === 'user.setAcceleratorType' ||
      (event.type === 'user.setResource' && event.field !== 'shmem'),
  });
  return diff(values, draft);
};
