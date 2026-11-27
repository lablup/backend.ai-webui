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
/** Short-key fallback: the key is exactly `tp` / `--tp` / `tp-size` / `TP_SIZE`. */
const TP_SHORT_KEY_RE = /^(--)?tp([-_]?size)?$/i;

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
  const byNameMatches = params.filter(
    (p) =>
      TP_NAME_RE.test(p.key) ||
      TP_NAME_RE.test(p.name) ||
      (p.displayName != null && TP_NAME_RE.test(p.displayName)),
  );
  // Prefer a numeric param: a non-numeric namesake (e.g. a STR
  // TENSOR_PARALLEL_MODE) has no TP size to compare.
  const byName =
    byNameMatches.find(
      (p) => p.valueType === 'INT' || p.valueType === 'FLOAT',
    ) ??
    byNameMatches[0] ??
    null;
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
 * Which warning the TP value and the fGPU quantity raise: `nonInteger` for
 * TP 2+ with a fractional fGPU quantity, `mismatch` when the fGPU quantity
 * is below the TP value (the split needs at least that many GPUs; more is
 * fine). The non-integer warning wins when both hold. A single TP over a
 * fractional share of one GPU (0 < fGPU ≤ 1) is the intended way to split
 * one GPU and raises no warning.
 */
export const tensorParallelFgpuWarningKind = (
  tpValue: number,
  fgpuQuantity: number,
): TensorParallelFgpuWarningKind | null => {
  if (tpValue === 1 && fgpuQuantity > 0 && fgpuQuantity <= 1) return null;
  if (tpValue >= 2 && !Number.isInteger(fgpuQuantity)) return 'nonInteger';
  if (fgpuQuantity < tpValue) return 'mismatch';
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
