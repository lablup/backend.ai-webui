/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useCurrentUserProjectRolesProjectsQuery } from '../__generated__/useCurrentUserProjectRolesProjectsQuery.graphql';
import {
  useCurrentUserProjectRolesQuery,
  PermissionNestedFilter,
  PermissionTarget,
} from '../__generated__/useCurrentUserProjectRolesQuery.graphql';
import { useCurrentProjectValue } from './useCurrentProject';
import { useUrlProjectValidity } from './useUrlProjectValidity';
import { graphql, useLazyLoadQuery } from 'react-relay';

// `myAtomicBulkScopePermissions` refuses more than this many targets
// (backend MAX_SCOPE_PERMISSION_TARGETS).
const MAX_SCOPE_PERMISSION_TARGETS = 100;

export interface CurrentUserProjectRolesResult {
  /** `true` when the authenticated user is a super-admin (derived from baiClient). */
  isSuperAdmin: boolean;
  /** Domain names the user has domain-admin rights over (derived from baiClient for now). */
  domainAdminDomains: string[];
  /**
   * Project UUIDs the user administers, out of the projects the user can
   * access. Match directly against `useCurrentProject().id` via
   * `Array.includes`.
   */
  projectAdminIds: string[];
}

/**
 * Hook that reports which of the user's projects they administer.
 *
 * Managers >= 26.9.0 answer `myAtomicBulkScopePermissions` for every project
 * the user belongs to: the bits the caller actually holds on `scope_admin`
 * within that project, read through every scope that governs it. Older
 * managers answer `myRoles` (assignments) filtered on the retired
 * `PROJECT_ADMIN_PAGE` entity, with the project read off each role's `scopes`
 * connection. The request transformer strips whichever root field the
 * connected manager does not know, and `@catch(to: RESULT)` makes a manager
 * without either resolve to `{ ok: false }` so general pages continue to render.
 *
 * `@include` / `@skip` mirror the `@since` / `@deprecatedSince` gates so Relay
 * never expects the root field the transformer stripped: a field missing from
 * the payload leaves the query "missing" in the store, and store-or-network
 * then refetches (and suspends) on every mount instead of reading the cache.
 *
 * Super-admin / domain-admin detection is sourced from the backendaiclient
 * (the legacy signals the existing codebase already relies on), since those
 * roles are outside the per-project scope this hook is concerned with.
 */
export const useCurrentUserProjectRoles = (): CurrentUserProjectRolesResult => {
  const baiClient = useSuspendedBackendaiClient();
  // Only the 26.9 root field below consumes the project list, so older
  // managers read it from the store without a request of their own.
  const supportsHeldPermissions = baiClient.supports('rbac-single-scope-role');

  const projects = useLazyLoadQuery<useCurrentUserProjectRolesProjectsQuery>(
    graphql`
      query useCurrentUserProjectRolesProjectsQuery($email: String) {
        user(email: $email) {
          groups {
            id
          }
        }
      }
    `,
    { email: baiClient.email },
    {
      fetchPolicy: supportsHeldPermissions ? 'store-or-network' : 'store-only',
    },
  );

  const targets: Array<PermissionTarget> = (projects.user?.groups ?? [])
    .flatMap((group) => (group?.id ? [group.id] : []))
    .slice(0, MAX_SCOPE_PERMISSION_TARGETS)
    .map((scopeId) => ({
      scopeType: 'project',
      scopeId,
      entityType: 'scope_admin',
    }));

  const PROJECT_ADMIN_PAGE = 'PROJECT_ADMIN_PAGE';
  const legacyPermissionFilter: PermissionNestedFilter = {
    // Cast confined to the one field the generated type can't model.
    entityType: (baiClient.supports('rbac-filter-wrapper')
      ? { equals: PROJECT_ADMIN_PAGE }
      : PROJECT_ADMIN_PAGE) as PermissionNestedFilter['entityType'],
  };

  const data = useLazyLoadQuery<useCurrentUserProjectRolesQuery>(
    graphql`
      query useCurrentUserProjectRolesQuery(
        $targets: [PermissionTarget!]!
        $legacyPermissionFilter: PermissionNestedFilter
        $supportsHeldPermissions: Boolean!
      ) {
        heldPermissions: myAtomicBulkScopePermissions(
          input: { targets: $targets }
        )
          @since(version: "26.9.0")
          @include(if: $supportsHeldPermissions)
          @catch(to: RESULT) {
          items {
            scopeId
            permissions
          }
        }
        legacyRoles: myRoles(
          first: 100
          filter: { permission: $legacyPermissionFilter }
        )
          @deprecatedSince(version: "26.9.0")
          @skip(if: $supportsHeldPermissions)
          @catch(to: RESULT) {
          edges {
            node {
              id
              role {
                id
                scopes(first: 1) {
                  edges {
                    node {
                      scopeId
                      scopeType
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { targets, legacyPermissionFilter, supportsHeldPermissions },
    {
      // store-or-network keeps the result cached across pages for the session.
      fetchPolicy: baiClient.supports('my-roles')
        ? 'store-or-network'
        : 'store-only',
    },
  );

  const ids = new Set<string>();
  if (data.heldPermissions?.ok === true) {
    for (const item of data.heldPermissions.value?.items ?? []) {
      if (item.permissions.includes('READ')) {
        ids.add(item.scopeId);
      }
    }
  }
  if (data.legacyRoles?.ok === true) {
    for (const assignmentEdge of data.legacyRoles.value?.edges ?? []) {
      for (const scopeEdge of assignmentEdge?.node?.role?.scopes?.edges ?? []) {
        const scope = scopeEdge?.node;
        if (scope?.scopeType?.toUpperCase() === 'PROJECT' && scope.scopeId) {
          ids.add(scope.scopeId);
        }
      }
    }
  }
  // Sort for deterministic output across fetches.
  const projectAdminIds = Array.from(ids).sort();

  const isSuperAdmin: boolean = !!baiClient?.is_superadmin;
  // Domain-admin detection via RBAC is out of scope for this PR (no stable
  // signal yet agreed with backend). Fall back to the existing baiClient
  // heuristic: non-super admins whose legacy role === 'admin'.
  const isLegacyAdmin: boolean = !!baiClient?.is_admin && !isSuperAdmin;
  const domainName: string | undefined =
    typeof baiClient?.current_domain === 'string'
      ? baiClient.current_domain
      : baiClient?._config?.domainName;
  const domainAdminDomains: string[] =
    isLegacyAdmin && domainName ? [domainName] : [];

  return {
    isSuperAdmin,
    domainAdminDomains,
    projectAdminIds,
  };
};

export type EffectiveAdminRole =
  'superadmin' | 'domainAdmin' | 'currentProjectAdmin' | 'none';

/**
 * Derived hook returning the user's effective admin role with priority:
 * super > domain > project > none.
 *
 * Project-admin rights are evaluated against the project the URL names
 * (`/project/:projectName/*`), falling back to the ambient current-project
 * atom only on non-project routes. Keying off the atom alone deadlocked
 * direct entry (FR-3383): entering `/project/B/admin/users` while the atom
 * still held project A judged the user's rights against A, rendered 401
 * instead of the page, and thereby prevented `ProjectScopeLayout` — which is
 * what converges the atom to the URL — from ever mounting.
 */
export const useEffectiveAdminRole = (): EffectiveAdminRole => {
  const { isSuperAdmin, domainAdminDomains, projectAdminIds } =
    useCurrentUserProjectRoles();

  const { urlProjectName, resolvedId } = useUrlProjectValidity();
  const currentProjectId = useCurrentProjectValue()?.id;
  const targetProjectId = urlProjectName ? resolvedId : currentProjectId;

  if (isSuperAdmin) return 'superadmin';
  if (domainAdminDomains.length > 0) return 'domainAdmin';
  if (targetProjectId && projectAdminIds.includes(targetProjectId))
    return 'currentProjectAdmin';
  return 'none';
};
