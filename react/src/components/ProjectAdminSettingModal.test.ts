/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildProjectAdminRoleFilter,
  selectProjectAdminRoles,
} from './ProjectAdminSettingModal';
import { describe, expect, it } from 'vitest';

const PROJECT_ID = '11111111-2222-3333-4444-555555555555';

const roleEdge = (id: string, name: string) => ({
  node: { id, name, users: { count: 0, edges: [] } },
});

describe('buildProjectAdminRoleFilter', () => {
  it('asks for the scope_admin permission on single-scope managers', () => {
    const filter = buildProjectAdminRoleFilter(PROJECT_ID, true);

    expect(filter).toEqual({
      status: { equals: 'ACTIVE' },
      mappedScope: {
        scopeType: { equals: 'PROJECT' },
        scopeId: { equals: PROJECT_ID },
      },
      permission: { entityType: { iEquals: 'scope_admin' } },
    });
  });

  it('falls back to the SYSTEM role pair on older managers', () => {
    const filter = buildProjectAdminRoleFilter(PROJECT_ID, false);

    expect(filter).toEqual({
      status: { equals: 'ACTIVE' },
      mappedScope: {
        scopeType: { equals: 'PROJECT' },
        scopeId: { equals: PROJECT_ID },
      },
      source: { equals: 'SYSTEM' },
    });
  });
});

describe('selectProjectAdminRoles', () => {
  const data = {
    adminRoles: {
      count: 3,
      edges: [
        roleEdge('role-1', `project-${PROJECT_ID}-member`),
        roleEdge('role-2', `project-${PROJECT_ID}-admin`),
        roleEdge('role-3', 'custom-operators'),
      ],
    },
  } as unknown as Parameters<typeof selectProjectAdminRoles>[0];

  it('keeps every role the permission filter returned', () => {
    expect(selectProjectAdminRoles(data, true).map((role) => role.id)).toEqual([
      'role-1',
      'role-2',
      'role-3',
    ]);
  });

  it('keeps only the name-suffixed admin role on older managers', () => {
    expect(selectProjectAdminRoles(data, false).map((role) => role.id)).toEqual(
      ['role-2'],
    );
  });

  it('returns an empty list when the query answered nothing', () => {
    expect(selectProjectAdminRoles(undefined, true)).toEqual([]);
  });
});
