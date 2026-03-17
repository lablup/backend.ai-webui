/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_STORAGE_WARNING_THRESHOLD,
  checkStorageVolumeHealth,
  parseStorageWarningThreshold,
} from '../storageProxyRules';
import type { StorageVolumeInfo } from '../storageProxyRules';
import { describe, expect, it } from '@jest/globals';

describe('checkStorageVolumeHealth', () => {
  it('should return null when usage data is missing', () => {
    const volume: StorageVolumeInfo = { id: 'vol-1', backend: 'ceph' };
    expect(checkStorageVolumeHealth(volume)).toBeNull();
  });

  it('should return null when usage is below threshold', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 500, capacity_bytes: 1000 },
    };
    expect(checkStorageVolumeHealth(volume)).toBeNull();
  });

  it('should return warning when usage exceeds threshold', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 950, capacity_bytes: 1000 },
    };
    const result = checkStorageVolumeHealth(volume);
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.category).toBe('storage');
    expect(result?.id).toBe('storage-volume-health-vol-1');
    expect(result?.interpolationValues?.percentage).toBe('95');
    expect(result?.interpolationValues?.volumeId).toBe('vol-1');
    expect(result?.interpolationValues?.backend).toBe('ceph');
  });

  it('should support custom threshold', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 750, capacity_bytes: 1000 },
    };
    expect(checkStorageVolumeHealth(volume, 70)).not.toBeNull();
    expect(checkStorageVolumeHealth(volume, 80)).toBeNull();
  });

  it('should return warning when usage is exactly at threshold', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 900, capacity_bytes: 1000 },
    };
    expect(checkStorageVolumeHealth(volume)).not.toBeNull();
  });

  it('should return null when capacity_bytes is zero', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 100, capacity_bytes: 0 },
    };
    expect(checkStorageVolumeHealth(volume)).toBeNull();
  });

  it('should return null when capacity_bytes is negative', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 100, capacity_bytes: -1000 },
    };
    expect(checkStorageVolumeHealth(volume)).toBeNull();
  });

  it('should handle used_bytes exceeding capacity_bytes', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 1500, capacity_bytes: 1000 },
    };
    const result = checkStorageVolumeHealth(volume);
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.interpolationValues?.percentage).toBe('150');
  });

  it('should handle zero used_bytes', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 0, capacity_bytes: 1000 },
    };
    expect(checkStorageVolumeHealth(volume)).toBeNull();
  });

  it('should round percentage correctly', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 945, capacity_bytes: 1000 },
    };
    const result = checkStorageVolumeHealth(volume);
    expect(result?.interpolationValues?.percentage).toBe('95');
  });

  it('should handle very large byte values', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: {
        used_bytes: 9.5e15,
        capacity_bytes: 1e16,
      },
    };
    const result = checkStorageVolumeHealth(volume);
    expect(result).not.toBeNull();
    expect(result?.interpolationValues?.percentage).toBe('95');
  });

  it('should include volume id in diagnostic id', () => {
    const volume: StorageVolumeInfo = {
      id: 'my-storage-vol',
      backend: 'nfs',
      usage: { used_bytes: 950, capacity_bytes: 1000 },
    };
    const result = checkStorageVolumeHealth(volume);
    expect(result?.id).toBe('storage-volume-health-my-storage-vol');
  });

  it('should return null when usage is just below threshold', () => {
    const volume: StorageVolumeInfo = {
      id: 'vol-1',
      backend: 'ceph',
      usage: { used_bytes: 899, capacity_bytes: 1000 },
    };
    expect(checkStorageVolumeHealth(volume)).toBeNull();
  });
});

describe('parseStorageWarningThreshold', () => {
  it('should return default for undefined', () => {
    expect(parseStorageWarningThreshold(undefined)).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for null', () => {
    expect(parseStorageWarningThreshold(null)).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for empty string', () => {
    expect(parseStorageWarningThreshold('')).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for whitespace-only string', () => {
    expect(parseStorageWarningThreshold('   ')).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for non-numeric string', () => {
    expect(parseStorageWarningThreshold('abc')).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for negative number', () => {
    expect(parseStorageWarningThreshold(-10)).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for number above 100', () => {
    expect(parseStorageWarningThreshold(150)).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for NaN', () => {
    expect(parseStorageWarningThreshold(NaN)).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for Infinity', () => {
    expect(parseStorageWarningThreshold(Infinity)).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should accept valid number', () => {
    expect(parseStorageWarningThreshold(75)).toBe(75);
  });

  it('should accept numeric string', () => {
    expect(parseStorageWarningThreshold('80')).toBe(80);
  });

  it('should accept boundary value 0', () => {
    expect(parseStorageWarningThreshold(0)).toBe(0);
  });

  it('should accept boundary value 100', () => {
    expect(parseStorageWarningThreshold(100)).toBe(100);
  });

  it('should accept decimal values', () => {
    expect(parseStorageWarningThreshold(85.5)).toBe(85.5);
  });

  it('should return default for boolean', () => {
    expect(parseStorageWarningThreshold(true)).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });

  it('should return default for object', () => {
    expect(parseStorageWarningThreshold({})).toBe(
      DEFAULT_STORAGE_WARNING_THRESHOLD,
    );
  });
});
