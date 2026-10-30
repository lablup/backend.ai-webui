/**
 * True when the accelerator slot is unified memory (accelerator and host share
 * one physical pool), identified by a `.unified` suffix (e.g. `cuda.unified`).
 */
export const isUnifiedAcceleratorSlot = (slotName?: string | null): boolean => {
  return !!slotName && slotName.endsWith('.unified');
};

/**
 * Prefix of the session `tag` that marks a session as using a unified-memory
 * accelerator slot (e.g. `unified-slot:cuda.unified`). Temporary, until the
 * session model exposes unified-memory usage directly.
 */
export const UNIFIED_SLOT_TAG_PREFIX = 'unified-slot:';

/**
 * Extracts the unified-memory slot name from a session `tag`
 * (`unified-slot:cuda.unified` -> `cuda.unified`). Returns `undefined` when the
 * tag has no marker or the marked slot is not a genuine `.unified` slot. The tag
 * is read as a comma/whitespace-separated list.
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
