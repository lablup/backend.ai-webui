/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { mountLevelFromPermissions } from './useSuspendedLegacyVFolders';
import { describe, expect, it } from 'vitest';

describe('mountLevelFromPermissions', () => {
  it('reads rw from mount_rw', () => {
    expect(
      mountLevelFromPermissions(['read_content', 'mount_ro', 'mount_rw']),
    ).toBe('rw');
  });

  it('folds mount_wd into rw', () => {
    expect(mountLevelFromPermissions(['mount_wd'])).toBe('rw');
  });

  it('reads ro when mount_ro is the only mount verb', () => {
    expect(
      mountLevelFromPermissions(['read_content', 'write_content', 'mount_ro']),
    ).toBe('ro');
  });

  it('reads none when no mount verb is held', () => {
    expect(
      mountLevelFromPermissions([
        'read_attribute',
        'read_content',
        'write_content',
        'delete_vfolder',
      ]),
    ).toBe('none');
  });

  it('reads none from an empty list', () => {
    expect(mountLevelFromPermissions([])).toBe('none');
  });

  it('reads an unknown level when the field was stripped by @since', () => {
    expect(mountLevelFromPermissions(null)).toBe('');
    expect(mountLevelFromPermissions(undefined)).toBe('');
  });
});
