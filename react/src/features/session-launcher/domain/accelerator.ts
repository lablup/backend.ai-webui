/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/**
 * True for a unified-memory accelerator slot (`.unified` suffix, e.g.
 * `cuda.unified`): accelerator and host memory share one pool.
 */
export const isUnifiedAcceleratorSlot = (slotName?: string | null): boolean => {
  return !!slotName && _.endsWith(slotName, '.unified');
};

/** Session `tag` prefix marking a unified-memory session (`unified-slot:cuda.unified`). */
export const UNIFIED_SLOT_TAG_PREFIX = 'unified-slot:';

/**
 * The unified slot named by a session `tag`'s `unified-slot:` marker, or
 * `undefined` when there is none or it is not a genuine `.unified` slot.
 */
export const getUnifiedSlotNameFromTag = (
  tag?: string | null,
): string | undefined => {
  if (!tag) return undefined;
  const token = tag
    .split(/[,\s]+/)
    .find((part) => part.startsWith(UNIFIED_SLOT_TAG_PREFIX));
  const slotName = token?.slice(UNIFIED_SLOT_TAG_PREFIX.length);
  return isUnifiedAcceleratorSlot(slotName) ? slotName : undefined;
};

/** R-04: keep the current type when the RG offers it, else the RG's first slot. */
export const resolveAcceleratorType = ({
  currentAcceleratorType,
  acceleratorSlotsInRG,
}: {
  currentAcceleratorType: string | undefined;
  acceleratorSlotsInRG: Record<string, unknown> | undefined;
}): string | undefined => {
  const nextAcceleratorType = acceleratorSlotsInRG?.[
    currentAcceleratorType as string
  ]
    ? currentAcceleratorType
    : _.first(_.keys(acceleratorSlotsInRG));
  return nextAcceleratorType || currentAcceleratorType;
};

/** R-07: a unified slot keeps `accelerator` cleared; true while it still holds a value. */
export const shouldClearUnifiedAccelerator = ({
  acceleratorType,
  accelerator,
}: {
  acceleratorType: string | undefined;
  accelerator: number | undefined;
}): boolean =>
  isUnifiedAcceleratorSlot(acceleratorType) && !_.isUndefined(accelerator);

/** R-02: no accelerator type is usable, so a non-unified `accelerator` resets to 0. */
export const shouldResetAcceleratorToZero = ({
  supportedAcceleratorTypes,
  acceleratorType,
  accelerator,
}: {
  supportedAcceleratorTypes: string[] | undefined;
  acceleratorType: string | undefined;
  accelerator: number | undefined;
}): boolean =>
  supportedAcceleratorTypes?.length === 0 &&
  !isUnifiedAcceleratorSlot(acceleratorType) &&
  accelerator !== 0;

export type AcceleratorTypeChange =
  | { kind: 'enter-unified' }
  | { kind: 'leave-unified'; accelerator: number }
  | { kind: 'none' };

/**
 * R-19: what a user's accelerator-type change does to `accelerator`. Entering a
 * unified slot clears it; leaving one resets it to the new slot's minimum.
 */
export const acceleratorTypeChange = ({
  nextType,
  currentAcceleratorType,
  acceleratorLimits,
}: {
  nextType: string;
  currentAcceleratorType: string | undefined;
  acceleratorLimits: Record<string, { min?: number; max?: number } | undefined>;
}): AcceleratorTypeChange => {
  if (isUnifiedAcceleratorSlot(nextType)) return { kind: 'enter-unified' };
  if (isUnifiedAcceleratorSlot(currentAcceleratorType)) {
    return {
      kind: 'leave-unified',
      accelerator: acceleratorLimits[nextType]?.min ?? 0,
    };
  }
  return { kind: 'none' };
};
