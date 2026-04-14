/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  deriveProjectAdminIds,
  MyRolesAssignmentNode,
} from '../useCurrentUserProjectRoles';

/**
 * These tests cover the pure admin-scope derivation logic that powers
 * `useCurrentUserProjectRoles`. The hook itself is a thin Relay +
 * baiClient wrapper — testing it end-to-end requires spinning up the full
 * suspense/Relay environment, while the derivation rules (primary vs
 * fallback, UUID normalization, priority) are where the correctness-sensitive
 * behavior lives.
 *
 * Fixtures correspond to the five cases called out in the acceptance criteria:
 * superadmin-only, domainAdmin-only, projectAdmin-only, mixed (super + project),
 * and none.
 */
describe('deriveProjectAdminIds', () => {
  const makePermissionEdge = (
    scopeType: string,
    entityType: string,
    scopeId: string,
  ) => ({
    node: { scopeType, entityType, scopeId },
  });

  const makeAssignment = (
    roleName: string | null | undefined,
    permissions: ReturnType<typeof makePermissionEdge>[] = [],
  ): MyRolesAssignmentNode => ({
    role: {
      name: roleName,
      permissions: { edges: permissions },
    },
  });

  it('returns empty array when there are no assignments (none case)', () => {
    expect(deriveProjectAdminIds([])).toEqual([]);
  });

  it('returns empty array for superadmin-only assignments with no project-scoped permissions', () => {
    // Superadmin typically has DOMAIN-scoped or unscoped permissions — no
    // PROJECT + PROJECT_ADMIN_PAGE permission should surface.
    const assignments = [
      makeAssignment('role_superadmin', [
        makePermissionEdge('DOMAIN', 'DOMAIN_ADMIN_PAGE', 'default'),
        makePermissionEdge('PROJECT', 'SESSION', 'some-project'),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual([]);
  });

  it('returns empty array for domainAdmin-only assignments', () => {
    const assignments = [
      makeAssignment('role_domain_default_admin', [
        makePermissionEdge('DOMAIN', 'DOMAIN_ADMIN_PAGE', 'default'),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual([]);
  });

  it('detects projectAdmin via PROJECT_ADMIN_PAGE permission (primary signal)', () => {
    const assignments = [
      makeAssignment('role_project_abcd1234_admin', [
        makePermissionEdge(
          'PROJECT',
          'PROJECT_ADMIN_PAGE',
          'abcd1234-5678-90ab-cdef-000000000000',
        ),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual(['abcd1234']);
  });

  it('strips hyphens from UUID scopeId and uses the first 8 hex chars', () => {
    const assignments = [
      makeAssignment('ignored-name', [
        makePermissionEdge(
          'PROJECT',
          'PROJECT_ADMIN_PAGE',
          '1234abcd-ef01-2345-6789-0abcdef01234',
        ),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual(['1234abcd']);
  });

  it('falls back to role-name regex when permission signal is missing', () => {
    const assignments = [makeAssignment('role_project_deadbeef_admin', [])];
    expect(deriveProjectAdminIds(assignments)).toEqual(['deadbeef']);
  });

  it('prefers permission signal over role-name regex when both are present', () => {
    // Permission indicates project `aabbccdd`, but role name says `deadbeef`.
    // The primary signal must win.
    const assignments = [
      makeAssignment('role_project_deadbeef_admin', [
        makePermissionEdge(
          'PROJECT',
          'PROJECT_ADMIN_PAGE',
          'aabbccdd-0000-0000-0000-000000000000',
        ),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual(['aabbccdd']);
  });

  it('deduplicates project IDs across multiple assignments', () => {
    const assignments = [
      makeAssignment('role_project_aabbccdd_admin', [
        makePermissionEdge(
          'PROJECT',
          'PROJECT_ADMIN_PAGE',
          'aabbccdd-0000-0000-0000-000000000000',
        ),
      ]),
      makeAssignment('role_project_aabbccdd_admin', [
        makePermissionEdge(
          'PROJECT',
          'PROJECT_ADMIN_PAGE',
          'aabbccdd-0000-0000-0000-000000000000',
        ),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual(['aabbccdd']);
  });

  it('mixed case: reports project-admin IDs even when super/domain admin perms are also present', () => {
    // Mixed super + project admin. The hook returns project IDs; the super-admin
    // signal is sourced separately from baiClient in the real hook.
    const assignments = [
      makeAssignment('role_superadmin', [
        makePermissionEdge('DOMAIN', 'DOMAIN_ADMIN_PAGE', 'default'),
      ]),
      makeAssignment('role_project_abcd1234_admin', [
        makePermissionEdge(
          'PROJECT',
          'PROJECT_ADMIN_PAGE',
          'abcd1234-0000-0000-0000-000000000000',
        ),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual(['abcd1234']);
  });

  it('ignores PROJECT scope entries for non-PROJECT_ADMIN_PAGE entity types', () => {
    const assignments = [
      makeAssignment('role_project_member', [
        makePermissionEdge(
          'PROJECT',
          'SESSION',
          'abcd1234-0000-0000-0000-000000000000',
        ),
        makePermissionEdge(
          'PROJECT',
          'VFOLDER',
          'abcd1234-0000-0000-0000-000000000000',
        ),
      ]),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual([]);
  });

  it('handles malformed role names without throwing and returns empty', () => {
    const assignments = [
      makeAssignment('not-a-project-role', []),
      makeAssignment('role_project_XYZ_admin', []), // non-hex chars
      makeAssignment(null, []),
      makeAssignment(undefined, []),
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual([]);
  });

  it('tolerates assignments with missing role object (graceful)', () => {
    const assignments: MyRolesAssignmentNode[] = [
      { role: null },
      { role: undefined },
      {} as MyRolesAssignmentNode,
    ];
    expect(deriveProjectAdminIds(assignments)).toEqual([]);
  });
});
