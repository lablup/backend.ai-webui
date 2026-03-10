/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkStorageVolumeHealth } from '../storageProxyRules';
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
    expect(result?.interpolationValues?.percentage).toBe('95');
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
});
