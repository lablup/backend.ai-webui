/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildProjectAdminRoleFilter,
  groupProjectAdminAssignmentsByUser,
  selectProjectAdminRoles,
} from './ProjectAdminSettingModal';
import { describe, expect, it } from 'vitest';

const PROJECT_ID = '11111111-2222-3333-4444-555555555555';

type Role = ReturnType<typeof selectProjectAdminRoles>[number];

const role = (id: string, name: string, userIds: Array<string> = []) =>
  ({
    id,
    name,
    users: {
      count: userIds.length,
      edges: userIds.map((userId) => ({
        node: {
          id: `assignment-${id}-${userId}`,
          userId,
          user: { id: userId, basicInfo: { email: `${userId}@example.com` } },
        },
      })),
    },
  }) as unknown as Role;

const responseOf = (roles: Array<Role>) =>
  ({
    adminRoles: { count: roles.length, edges: roles.map((node) => ({ node })) },
  }) as unknown as Parameters<typeof selectProjectAdminRoles>[0];

describe('buildProjectAdminRoleFilter', () => {
  it('asks for the scope_admin permission in the project scope', () => {
    expect(buildProjectAdminRoleFilter(PROJECT_ID)).toEqual({
      status: { equals: 'ACTIVE' },
      mappedScope: {
        scopeType: { iEquals: 'project' },
        scopeId: { equals: PROJECT_ID },
      },
      permissions: { some: { entityType: { iEquals: 'scope_admin' } } },
    });
  });
});

describe('selectProjectAdminRoles', () => {
  it('keeps every role the permission filter returned, ordered by name', () => {
    const data = responseOf([
      role('role-3', 'custom-operators'),
      role('role-1', 'viewers'),
      role('role-2', 'project-admins'),
    ]);
    expect(selectProjectAdminRoles(data).map((node) => node.id)).toEqual([
      'role-3',
      'role-2',
      'role-1',
    ]);
  });

  it('returns an empty list when the query answered nothing', () => {
    expect(selectProjectAdminRoles(undefined)).toEqual([]);
  });
});

describe('groupProjectAdminAssignmentsByUser', () => {
  it('collapses a user holding several admin roles into one row', () => {
    const assignments = groupProjectAdminAssignmentsByUser([
      role('role-a', 'a', ['user-1', 'user-2']),
      role('role-b', 'b', ['user-1']),
    ]);

    expect(assignments).toEqual([
      {
        userId: 'user-1',
        email: 'user-1@example.com',
        roleIds: ['role-a', 'role-b'],
      },
      { userId: 'user-2', email: 'user-2@example.com', roleIds: ['role-a'] },
    ]);
  });

  it('ignores roles without assignments', () => {
    expect(groupProjectAdminAssignmentsByUser([role('role-a', 'a')])).toEqual(
      [],
    );
  });

  it('returns an empty list when there are no roles', () => {
    expect(groupProjectAdminAssignmentsByUser([])).toEqual([]);
  });
});
