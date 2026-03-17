/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

export const DEFAULT_STORAGE_WARNING_THRESHOLD = 90;

export interface StorageVolumeInfo {
  id: string;
  backend: string;
  usage?: {
    used_bytes: number;
    capacity_bytes: number;
  };
}

/**
 * Parse and validate the storageWarningThreshold config value.
 * Returns a number between 0-100, or the default (90) if invalid.
 * Only accepts numeric types or non-empty numeric strings.
 */
export function parseStorageWarningThreshold(raw: unknown): number {
  if (
    typeof raw !== 'number' &&
    (typeof raw !== 'string' || raw.trim() === '')
  ) {
    return DEFAULT_STORAGE_WARNING_THRESHOLD;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return DEFAULT_STORAGE_WARNING_THRESHOLD;
  }
  return value;
}

/**
 * Check if a storage volume is above the capacity threshold (default 90%).
 */
export function checkStorageVolumeHealth(
  volume: StorageVolumeInfo,
  threshold = DEFAULT_STORAGE_WARNING_THRESHOLD,
): DiagnosticResult | null {
  if (
    !volume.usage ||
    typeof volume.usage.capacity_bytes !== 'number' ||
    volume.usage.capacity_bytes <= 0
  ) {
    return null;
  }

  const percentage =
    (volume.usage.used_bytes / volume.usage.capacity_bytes) * 100;

  if (percentage >= threshold) {
    return {
      id: `storage-volume-health-${volume.id}`,
      severity: 'warning',
      category: 'storage',
      titleKey: 'diagnostics.StorageVolumeHighUsage',
      descriptionKey: 'diagnostics.StorageVolumeHighUsageDesc',
      remediationKey: 'diagnostics.StorageVolumeHighUsageFix',
      interpolationValues: {
        volumeId: volume.id,
        backend: volume.backend,
        percentage: String(Math.round(percentage)),
      },
    };
  }

  return null;
}
