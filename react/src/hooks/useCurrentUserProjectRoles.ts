/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import {
  useCurrentUserProjectRolesQuery,
  PermissionNestedFilter,
} from '../__generated__/useCurrentUserProjectRolesQuery.graphql';
import { useCurrentProjectValue } from './useCurrentProject';
import { useUrlProjectValidity } from './useUrlProjectValidity';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface CurrentUserProjectRolesResult {
  /** `true` when the authenticated user is a super-admin (derived from baiClient). */
  isSuperAdmin: boolean;
  /** Domain names the user has domain-admin rights over (derived from baiClient for now). */
  domainAdminDomains: string[];
  /**
   * Project UUIDs where the user holds a project-scoped admin role. Grants
   * inherited from the domain or global scope are not counted.
   */
  projectAdminIds: string[];
}

/**
 * Hook that reports which projects the user holds a project-admin role in.
 *
 * Managers >= 26.9.0 answer `myRolesV2`: the user's project-scoped roles that
 * carry a `scope_admin` permission. Older managers answer `myRoles`
 * (assignments) filtered on the retired `PROJECT_ADMIN_PAGE` entity. The
 * request transformer strips whichever root field the connected manager does
 * not know, and `@catch(to: RESULT)` keeps general pages rendering when both fail.
 *
 * `@include` / `@skip` mirror the `@since` / `@deprecatedSince` gates so Relay
 * never expects the root field the transformer stripped; otherwise
 * store-or-network refetches (and suspends) on every mount.
 */
export const useCurrentUserProjectRoles = (): CurrentUserProjectRolesResult => {
  const baiClient = useSuspendedBackendaiClient();
  const supportsMyRolesV2 =
    baiClient.isManagerVersionCompatibleWith('26.9.0a4');

  const PROJECT_ADMIN_PAGE = 'PROJECT_ADMIN_PAGE';
  const legacyPermissionFilter: PermissionNestedFilter = {
    // Cast confined to the one field the generated type can't model.
    entityType: {
      equals: PROJECT_ADMIN_PAGE,
    } as PermissionNestedFilter['entityType'],
  };

  const data = useLazyLoadQuery<useCurrentUserProjectRolesQuery>(
    graphql`
      query useCurrentUserProjectRolesQuery(
        $legacyPermissionFilter: PermissionNestedFilter
        $supportsMyRolesV2: Boolean!
      ) {
        projectAdminRoles: myRolesV2(
          first: 100
          filter: {
            status: { equals: ACTIVE }
            mappedScope: { scopeType: { iEquals: "project" } }
            permissions: { some: { entityType: { iEquals: "scope_admin" } } }
          }
        )
          @since(version: "26.9.0a4")
          @include(if: $supportsMyRolesV2)
          @catch(to: RESULT) {
          edges {
            node {
              id
              scopeId
            }
          }
        }
        legacyRoles: myRoles(
          first: 100
          filter: { permission: $legacyPermissionFilter }
        )
          @deprecatedSince(version: "26.9.0a4")
          @skip(if: $supportsMyRolesV2)
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
    { legacyPermissionFilter, supportsMyRolesV2 },
    {
      // store-or-network keeps the result cached across pages for the session.
      fetchPolicy: 'store-or-network',
    },
  );

  const ids = new Set<string>();
  if (data.projectAdminRoles?.ok === true) {
    for (const roleEdge of data.projectAdminRoles.value?.edges ?? []) {
      if (roleEdge?.node?.scopeId) {
        ids.add(roleEdge.node.scopeId);
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
