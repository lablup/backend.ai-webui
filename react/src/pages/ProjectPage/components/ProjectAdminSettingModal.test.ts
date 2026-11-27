/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildProjectAdminRoleFilter,
  classifyProjectAdminGrants,
  groupProjectAdminAssignmentsByUser,
  selectProjectAdminRoles,
} from './ProjectAdminSettingModal';
import { describe, expect, it } from 'vitest';

const PROJECT_ID = '11111111-2222-3333-4444-555555555555';

type Role = ReturnType<typeof selectProjectAdminRoles>[number];

const role = (id: string, name: string, userIds: Array<string> = []) =>
  ({
    id,
    entityId: `uuid-${id}`,
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
  it('asks for the scope_admin permission on the project scope', () => {
    expect(buildProjectAdminRoleFilter(PROJECT_ID)).toEqual({
      status: { equals: 'ACTIVE' },
      mappedScope: {
        // The manager answers the scope type in lowercase.
        scopeType: { iEquals: 'project' },
        scopeId: { equals: PROJECT_ID },
      },
      permissions: { some: { entityType: { iEquals: 'scope_admin' } } },
    });
  });
});

describe('selectProjectAdminRoles', () => {
  const data = responseOf([
    role('role-3', 'custom-operators'),
    role('role-1', `project-${PROJECT_ID}-member`),
    role('role-2', `project-${PROJECT_ID}-admin`),
  ]);

  it('keeps every role the permission filter returned, ordered by name', () => {
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
        roleIds: ['uuid-role-a', 'uuid-role-b'],
      },
      {
        userId: 'user-2',
        email: 'user-2@example.com',
        roleIds: ['uuid-role-a'],
      },
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

describe('classifyProjectAdminGrants', () => {
  type Grant = Parameters<typeof classifyProjectAdminGrants>[0][number];
  const granted = (
    userIds: Array<string>,
    assigned: Array<string>,
    failed: Array<{ userId: string; message: string }> = [],
  ): Grant => ({
    userIds,
    result: {
      status: 'fulfilled',
      value: {
        partialBulkAssignRoles: {
          assigned: assigned.map((userId) => ({ id: `a-${userId}`, userId })),
          failed,
        },
      },
    },
  });
  const already = (userId: string) => ({
    userId,
    message: `Role is already assigned to user ${userId}`,
  });

  it('reports a clean grant as assigned with nothing skipped or failed', () => {
    expect(
      classifyProjectAdminGrants(
        [granted(['u1', 'u2'], ['u1', 'u2'])],
        ['u1', 'u2'],
      ),
    ).toEqual({ hasAssigned: true, skippedUserIds: [], failures: [] });
  });

  it('skips a user only when every grant sent for them was a skip', () => {
    expect(
      classifyProjectAdminGrants(
        [
          granted(['u1', 'u2'], ['u2'], [already('u1')]),
          granted(['u1', 'u2'], [], [already('u1'), already('u2')]),
        ],
        ['u1', 'u2'],
      ),
    ).toEqual({ hasAssigned: true, skippedUserIds: ['u1'], failures: [] });
  });

  it('reports a user refused by the first grant without the other grants', () => {
    expect(
      classifyProjectAdminGrants(
        [
          granted(
            ['u1', 'u2'],
            ['u1'],
            [{ userId: 'u2', message: 'cannot join project' }],
          ),
          granted(['u1'], ['u1']),
        ],
        ['u1', 'u2'],
      ),
    ).toEqual({
      hasAssigned: true,
      skippedUserIds: [],
      failures: [{ userId: 'u2', message: 'cannot join project' }],
    });
  });

  it('counts only the users a rejected grant was sent for as failed', () => {
    expect(
      classifyProjectAdminGrants(
        [
          granted(['u1', 'u2'], ['u2'], [already('u1')]),
          {
            userIds: ['u2'],
            result: { status: 'rejected', reason: new Error('forbidden') },
          },
        ],
        ['u1', 'u2'],
      ),
    ).toEqual({
      hasAssigned: true,
      skippedUserIds: ['u1'],
      failures: [{ userId: 'u2', message: 'forbidden' }],
    });
  });

  it('keeps a failure reported for an id the request did not name', () => {
    expect(
      classifyProjectAdminGrants(
        [granted(['u1'], [], [{ userId: 'U1', message: 'database refused' }])],
        ['u1'],
      ).failures,
    ).toEqual([{ userId: 'U1', message: 'database refused' }]);
  });

  it('lists each distinct reason of a user once', () => {
    const refused = { userId: 'u1', message: 'database refused' };
    expect(
      classifyProjectAdminGrants(
        [granted(['u1'], [], [refused]), granted(['u1'], [], [refused])],
        ['u1'],
      ).failures,
    ).toEqual([{ userId: 'u1', message: 'database refused' }]);
  });
});
