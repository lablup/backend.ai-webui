/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

// Single source of the app-wide utilization semantics (SessionSlotCell badges
// and the session resource grid share these): ≥50% warning, ≥80% error.
export const UTILIZATION_WARNING_PERCENT = 50;
export const UTILIZATION_ERROR_PERCENT = 80;

export type UtilizationBin = 0 | 1 | 2 | 3 | 4;

/**
 * 5-step fill bin for a clamped 0–100 percent: 0 below the warning
 * threshold, 1–3 across equal thirds of the warning band, 4 at/above the
 * error threshold.
 */
export const utilizationBinIndex = (pct: number): UtilizationBin => {
  const p = Math.max(0, Math.min(100, pct));
  if (p < UTILIZATION_WARNING_PERCENT) return 0;
  if (p >= UTILIZATION_ERROR_PERCENT) return 4;
  const bandPosition =
    (p - UTILIZATION_WARNING_PERCENT) /
    (UTILIZATION_ERROR_PERCENT - UTILIZATION_WARNING_PERCENT);
  return (1 + Math.min(2, Math.floor(bandPosition * 3))) as UtilizationBin;
};
