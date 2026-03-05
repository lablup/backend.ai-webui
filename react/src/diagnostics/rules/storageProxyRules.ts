/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

export interface StorageVolumeInfo {
  id: string;
  backend: string;
  usage?: {
    percentage: number;
  };
}

/**
 * Check if a storage volume is above the capacity threshold (default 90%).
 */
export function checkStorageVolumeHealth(
  volume: StorageVolumeInfo,
  threshold = 90,
): DiagnosticResult | null {
  if (!volume.usage || typeof volume.usage.percentage !== 'number') {
    return null;
  }

  if (volume.usage.percentage > threshold) {
    return {
      id: `storage-volume-health-${volume.id}`,
      severity: 'warning',
      titleKey: 'diagnostics.StorageVolumeHighUsage',
      descriptionKey: 'diagnostics.StorageVolumeHighUsageDesc',
      remediationKey: 'diagnostics.StorageVolumeHighUsageFix',
      interpolationValues: {
        volumeId: volume.id,
        backend: volume.backend,
        percentage: String(Math.round(volume.usage.percentage)),
      },
    };
  }

  return null;
}
