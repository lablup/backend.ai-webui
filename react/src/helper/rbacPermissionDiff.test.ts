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
import {
  applyBulkPermissionCells,
  type BulkCellState,
  diffPermissionCells,
} from './rbacPermissionDiff';

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

describe('applyBulkPermissionCells', () => {
  it('returns an empty diff when no cells were modified (all "Keep as is")', () => {
    const initial = new Set(['SESSION|CREATE', 'SESSION|READ']);
    expect(applyBulkPermissionCells(initial, new Map())).toEqual({
      toCreate: [],
      toDelete: [],
    });
  });

  // Spec FR-6 acceptance criterion: project1 has SESSION CREATE+READ, project2
  // has SESSION READ. Only the SESSION × CREATE cell is modified to checked;
  // CREATE is added to project2 only, everything else is left untouched.
  describe('the project1 / project2 SESSION CREATE scenario', () => {
    const modifiedCells = new Map<string, BulkCellState>([
      ['SESSION|CREATE', 'checked'],
    ]);

    it('adds nothing to project1, which already grants SESSION CREATE', () => {
      const project1Initial = new Set(['SESSION|CREATE', 'SESSION|READ']);
      expect(applyBulkPermissionCells(project1Initial, modifiedCells)).toEqual({
        toCreate: [],
        toDelete: [],
      });
    });

    it('adds only SESSION CREATE to project2, keeping its existing SESSION READ', () => {
      const project2Initial = new Set(['SESSION|READ']);
      expect(applyBulkPermissionCells(project2Initial, modifiedCells)).toEqual({
        toCreate: ['SESSION|CREATE'],
        toDelete: [],
      });
    });
  });

  it('does not touch cells left as "Keep as is", even when other cells change', () => {
    // SESSION READ is granted and never modified → it must survive untouched
    // while an unchecked CREATE is revoked and a checked UPDATE is added.
    const initial = new Set(['SESSION|CREATE', 'SESSION|READ']);
    const modifiedCells = new Map<string, BulkCellState>([
      ['SESSION|CREATE', 'unchecked'],
      ['SESSION|UPDATE', 'checked'],
    ]);
    const { toCreate, toDelete } = applyBulkPermissionCells(
      initial,
      modifiedCells,
    );
    expect(toCreate).toEqual(['SESSION|UPDATE']);
    expect(toDelete).toEqual(['SESSION|CREATE']);
  });

  it('revokes a modified-to-unchecked cell only where the scope currently grants it', () => {
    const modifiedCells = new Map<string, BulkCellState>([
      ['VFOLDER|READ', 'unchecked'],
    ]);
    // Scope that grants VFOLDER READ → it is revoked.
    expect(
      applyBulkPermissionCells(new Set(['VFOLDER|READ']), modifiedCells),
    ).toEqual({ toCreate: [], toDelete: ['VFOLDER|READ'] });
    // Scope that never granted it → nothing to do (skipped).
    expect(applyBulkPermissionCells(new Set(), modifiedCells)).toEqual({
      toCreate: [],
      toDelete: [],
    });
  });
});
