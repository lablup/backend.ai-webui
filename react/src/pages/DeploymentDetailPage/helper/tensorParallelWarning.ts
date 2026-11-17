/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  RuntimeParameterGroup,
  RuntimeVariantPresetDef,
} from '../../../hooks/useRuntimeParameterSchema';

/**
 * Helpers that relate a runtime variant's tensor-parallelism (TP) parameter to
 * the requested fractional GPU (fGPU) quantity of a deployment revision
 * (lablup/backend.ai-webui#11283).
 *
 * TP is identified by key / display name only — the backend does not yet mark
 * the parameter (the key-name patterns below follow the live vLLM presets,
 * e.g. `VLLM_TENSOR_PARALLEL_SIZE`, `--tensor-parallel-size`, `--tp`).
 */

const TP_NAME_RE = /tensor[-_. ]?parallel/i;
/** Short-key fallback for `--tp`, `TP_SIZE` and friends. */
const TP_SHORT_KEY_RE = /(^|[^a-z0-9])tp([-_]?size)?([^a-z0-9]|$)/i;

export type TensorParallelFgpuWarningKind = 'mismatch' | 'nonInteger';

/** Flattened params of all runtime parameter groups. */
const flattenParams = (
  groups: ReadonlyArray<RuntimeParameterGroup> | null,
): RuntimeVariantPresetDef[] => (groups ?? []).flatMap((g) => g.params);

/** The tensor-parallelism runtime parameter, or null when the variant has none. */
export const findTensorParallelParam = (
  groups: ReadonlyArray<RuntimeParameterGroup> | null,
): RuntimeVariantPresetDef | null => {
  const params = flattenParams(groups);
  const byName = params.find(
    (p) =>
      TP_NAME_RE.test(p.key) ||
      TP_NAME_RE.test(p.name) ||
      (p.displayName != null && TP_NAME_RE.test(p.displayName)),
  );
  if (byName) return byName;
  return (
    params.find(
      (p) =>
        (p.valueType === 'INT' || p.valueType === 'FLOAT') &&
        TP_SHORT_KEY_RE.test(p.key),
    ) ?? null
  );
};

/**
 * The effective TP value: the user's entered value when present, otherwise the
 * parameter's own default (an untouched control falls back to the runtime
 * default). Null when neither is a usable number.
 */
export const effectiveTensorParallelValue = (
  tpParam: RuntimeVariantPresetDef,
  runtimeParams: Record<string, unknown> | undefined,
): number | null => {
  const raw = runtimeParams?.[tpParam.key];
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw !== '' && Number.isFinite(Number(raw))) {
    return Number(raw);
  }
  if (
    tpParam.defaultValue != null &&
    Number.isFinite(Number(tpParam.defaultValue))
  ) {
    return Number(tpParam.defaultValue);
  }
  return null;
};

/**
 * Which warning the TP value and the fGPU quantity raise:
 * - `nonInteger` — TP 2 or higher with a fractional fGPU quantity (a
 *   non-integer split cannot satisfy multi-GPU tensor parallelism);
 * - `mismatch` — TP value and fGPU quantity differ.
 * The specific non-integer warning wins when both hold.
 */
export const tensorParallelFgpuWarningKind = (
  tpValue: number,
  fgpuQuantity: number,
): TensorParallelFgpuWarningKind | null => {
  if (tpValue >= 2 && !Number.isInteger(fgpuQuantity)) return 'nonInteger';
  if (tpValue !== fgpuQuantity) return 'mismatch';
  return null;
};

/**
 * The fractional GPU (fGPU) quantity of a preset's resource slots — the
 * `*.shares` slot (e.g. `cuda.shares`), Backend.AI's fractional GPU. Null when
 * the preset requests no shares slot or its quantity is not a number.
 */
export const fgpuQuantityFromResourceSlots = (
  slots: ReadonlyArray<{ slotName: string; quantity: string }>,
): number | null => {
  const slot = slots.find((s) => s.slotName.endsWith('.shares'));
  if (!slot) return null;
  const quantity = Number(slot.quantity);
  return Number.isFinite(quantity) ? quantity : null;
};
