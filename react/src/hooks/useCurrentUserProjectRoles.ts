/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useCurrentUserProjectRolesQuery } from '../__generated__/useCurrentUserProjectRolesQuery.graphql';
import { useCurrentProjectValue } from './useCurrentProject';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface CurrentUserProjectRolesResult {
  /** `true` when the authenticated user is a super-admin (derived from baiClient). */
  isSuperAdmin: boolean;
  /** Domain names the user has domain-admin rights over (derived from baiClient for now). */
  domainAdminDomains: string[];
  /**
   * Project UUIDs the user has project-admin rights over. Sourced from each
   * role's `scopes` connection, narrowed to `scopeType === 'PROJECT'`.
   * Match directly against `useCurrentProject().id` via `Array.includes`.
   */
  projectAdminIds: string[];
}

/**
 * Hook that inspects the current user's RBAC role assignments and reports which
 * projects they have project-admin scope over.
 *
 * Uses the `myRoles` query (added in core 26.3.0). On older cores that do not
 * implement it, `@catch(to: RESULT)` makes the field resolve to `{ ok: false }`
 * and the hook returns empty admin arrays instead of throwing — so general
 * pages continue to render.
 *
 * Super-admin / domain-admin detection is sourced from the backendaiclient
 * (the legacy signals the existing codebase already relies on), since those
 * roles are outside the per-project scope this hook is concerned with.
 */
export const useCurrentUserProjectRoles = (): CurrentUserProjectRolesResult => {
  const baiClient = useSuspendedBackendaiClient();

  const data = useLazyLoadQuery<useCurrentUserProjectRolesQuery>(
    graphql`
      query useCurrentUserProjectRolesQuery {
        myRolesResult: myRoles(
          first: 100
          filter: { permission: { entityType: PROJECT_ADMIN_PAGE } }
        ) @catch(to: RESULT) {
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
    {},
    {
      // store-or-network keeps the result cached across pages for the session.
      fetchPolicy: baiClient.supports('my-roles')
        ? 'store-or-network'
        : 'store-only',
    },
  );

  const ids = new Set<string>();
  if (data.myRolesResult?.ok === true) {
    for (const assignmentEdge of data.myRolesResult.value?.edges ?? []) {
      for (const scopeEdge of assignmentEdge?.node?.role?.scopes?.edges ?? []) {
        const scope = scopeEdge?.node;
        if (scope?.scopeType === 'PROJECT' && scope.scopeId) {
          ids.add(scope.scopeId);
        }
      }
    }
  }
  // Sort for deterministic output across fetches.
  const projectAdminIds = Array.from(ids).sort();

  const isSuperAdmin: boolean = !!baiClient?.is_superadmin;
  // Domain-admin detection via `myRoles` is out of scope for this PR (no stable
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
  | 'superadmin'
  | 'domainAdmin'
  | 'currentProjectAdmin'
  | 'none';

/**
 * Derived hook returning the user's effective admin role with priority:
 * super > domain > project > none.
 */
export const useEffectiveAdminRole = (): EffectiveAdminRole => {
  const { isSuperAdmin, domainAdminDomains, projectAdminIds } =
    useCurrentUserProjectRoles();

  const currentProjectId = useCurrentProjectValue()?.id;
  if (isSuperAdmin) return 'superadmin';
  if (domainAdminDomains.length > 0) return 'domainAdmin';
  if (currentProjectId && projectAdminIds.includes(currentProjectId))
    return 'currentProjectAdmin';
  return 'none';
};
