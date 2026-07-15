/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for diffPermissionCells().
 *
 * Coverage:
 * - Newly checked cells → toCreate; unchecked cells → toDelete
 * - Unchanged cells produce no work (empty diff)
 * - A cell present in both stays untouched even when other cells change
 * - Empty initial (grant everything) / empty edited (revoke everything)
 */
import { diffPermissionCells } from './rbacPermissionDiff';

describe('diffPermissionCells', () => {
  it('returns an empty diff when nothing changed', () => {
    const keys = new Set(['SESSION|CREATE', 'SESSION|READ']);
    expect(diffPermissionCells(keys, new Set(keys))).toEqual({
      toCreate: [],
      toDelete: [],
    });
  });

  it('reports newly checked cells as toCreate only', () => {
    const initial = new Set(['SESSION|READ']);
    const edited = new Set(['SESSION|READ', 'SESSION|CREATE']);
    expect(diffPermissionCells(initial, edited)).toEqual({
      toCreate: ['SESSION|CREATE'],
      toDelete: [],
    });
  });

  it('reports unchecked cells as toDelete only', () => {
    const initial = new Set(['SESSION|READ', 'SESSION|CREATE']);
    const edited = new Set(['SESSION|READ']);
    expect(diffPermissionCells(initial, edited)).toEqual({
      toCreate: [],
      toDelete: ['SESSION|CREATE'],
    });
  });

  it('reports both created and deleted cells while leaving shared cells untouched', () => {
    const initial = new Set(['SESSION|READ', 'SESSION|UPDATE']);
    const edited = new Set(['SESSION|READ', 'SESSION|CREATE']);
    const { toCreate, toDelete } = diffPermissionCells(initial, edited);
    expect(toCreate).toEqual(['SESSION|CREATE']);
    expect(toDelete).toEqual(['SESSION|UPDATE']);
  });

  it('treats an empty initial set as create-everything', () => {
    const edited = new Set(['VFOLDER|READ', 'VFOLDER|GRANT_READ']);
    expect(diffPermissionCells(new Set(), edited)).toEqual({
      toCreate: ['VFOLDER|READ', 'VFOLDER|GRANT_READ'],
      toDelete: [],
    });
  });

  it('treats an empty edited set as revoke-everything', () => {
    const initial = new Set(['VFOLDER|READ', 'VFOLDER|GRANT_READ']);
    expect(diffPermissionCells(initial, new Set())).toEqual({
      toCreate: [],
      toDelete: ['VFOLDER|READ', 'VFOLDER|GRANT_READ'],
    });
  });
});
