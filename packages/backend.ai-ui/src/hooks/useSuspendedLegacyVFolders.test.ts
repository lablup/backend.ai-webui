/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { mountLevelFromPermissions } from './useSuspendedLegacyVFolders';
import { describe, expect, it } from 'vitest';

// `vfolder_nodes.permissions` is resolved per caller (backend.ai#14679), so
// the mount verbs it carries are the caller's own level, not the folder default.
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

  it('reads none from an empty, null or undefined list', () => {
    expect(mountLevelFromPermissions([])).toBe('none');
    expect(mountLevelFromPermissions(null)).toBe('none');
    expect(mountLevelFromPermissions(undefined)).toBe('none');
  });
});
