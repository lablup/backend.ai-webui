/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useCurrentUserProjectRolesQuery } from '../__generated__/useCurrentUserProjectRolesQuery.graphql';
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
 * Hook that reports which projects the user holds a project-admin role in:
 * `myRolesV2` filtered to the user's project-scoped roles that carry a
 * `scope_admin` permission. `@catch(to: RESULT)` keeps general pages
 * rendering when the query fails.
 */
export const useCurrentUserProjectRoles = (): CurrentUserProjectRolesResult => {
  const baiClient = useSuspendedBackendaiClient();

  const data = useLazyLoadQuery<useCurrentUserProjectRolesQuery>(
    graphql`
      query useCurrentUserProjectRolesQuery {
        projectAdminRoles: myRolesV2(
          first: 100
          filter: {
            status: { equals: ACTIVE }
            mappedScope: { scopeType: { iEquals: "project" } }
            permissions: { some: { entityType: { iEquals: "scope_admin" } } }
          }
        ) @catch(to: RESULT) {
          edges {
            node {
              id
              scopeId
            }
          }
        }
      }
    `,
    {},
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
  const { isSuperAdmin, domainAdminDomains } = useCurrentUserProjectRoles();
  const isCurrentProjectAdmin = useIsCurrentProjectAdmin();

  if (isSuperAdmin) return 'superadmin';
  if (domainAdminDomains.length > 0) return 'domainAdmin';
  if (isCurrentProjectAdmin) return 'currentProjectAdmin';
  return 'none';
};

/**
 * Whether the user holds a project-scoped admin role in the target project
 * (URL project, else the current-project atom), regardless of super/domain
 * admin rights.
 */
export const useIsCurrentProjectAdmin = (): boolean => {
  const { projectAdminIds } = useCurrentUserProjectRoles();
  const { urlProjectName, resolvedId } = useUrlProjectValidity();
  const currentProjectId = useCurrentProjectValue()?.id;
  const targetProjectId = urlProjectName ? resolvedId : currentProjectId;
  return !!targetProjectId && projectAdminIds.includes(targetProjectId);
};
