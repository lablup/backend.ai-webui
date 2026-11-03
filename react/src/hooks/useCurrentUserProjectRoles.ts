/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useCurrentUserProjectRolesQuery } from '../__generated__/useCurrentUserProjectRolesQuery.graphql';
import { useAccessibleProjects } from './useAccessibleProjects';
import { useCurrentProjectValue } from './useCurrentProject';
import { useUrlProjectValidity } from './useUrlProjectValidity';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface CurrentUserProjectRolesResult {
  /** `true` when the authenticated user is a super-admin (derived from baiClient). */
  isSuperAdmin: boolean;
  /** Domain names the user has domain-admin rights over (derived from baiClient for now). */
  domainAdminDomains: string[];
  /**
   * UUIDs of the user's member projects on which they hold the `scope_admin`
   * permission, through any scope that governs the project.
   */
  projectAdminIds: string[];
}

// `myAtomicBulkScopePermissions` refuses more than 100 targets.
const MAX_PERMISSION_TARGETS = 100;

/**
 * Hook that reports which projects the header's selector lists grant the
 * `scope_admin` permission, asked through `myAtomicBulkScopePermissions`.
 * A super-admin bypasses RBAC, so every listed project counts for them.
 * `@catch(to: RESULT)` keeps general pages rendering when the query fails.
 */
export const useCurrentUserProjectRoles = (): CurrentUserProjectRolesResult => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();

  // The same member list the header's project selector renders.
  const { accessibleProjects, personalProject } = useAccessibleProjects();
  const memberProjectIds = _.uniq(
    _.compact([
      ..._.map(accessibleProjects, (project) => project?.id),
      personalProject?.id,
    ]),
  )
    .sort()
    .slice(0, MAX_PERMISSION_TARGETS);

  const data = useLazyLoadQuery<useCurrentUserProjectRolesQuery>(
    graphql`
      query useCurrentUserProjectRolesQuery($targets: [PermissionTarget!]!) {
        projectAdminPermissions: myAtomicBulkScopePermissions(
          input: { targets: $targets }
        ) @catch(to: RESULT) {
          items {
            scopeId
            permissions
          }
        }
      }
    `,
    {
      targets: _.map(memberProjectIds, (scopeId) => ({
        scopeType: 'project',
        scopeId,
        entityType: 'scope_admin',
      })),
    },
    {
      fetchPolicy:
        memberProjectIds.length > 0 ? 'store-or-network' : 'store-only',
    },
  );

  const projectAdminIds =
    data.projectAdminPermissions?.ok === true
      ? _.uniq(
          _.map(
            _.filter(
              data.projectAdminPermissions.value?.items,
              (item) => item.permissions.length > 0,
            ),
            'scopeId',
          ),
        ).sort()
      : [];

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
