/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import {
  PermissionNestedFilter,
  useCanUpdateProjectVFolderQuery,
} from '../__generated__/useCanUpdateProjectVFolderQuery.graphql';
import { useCurrentUserProjectRoles } from './useCurrentUserProjectRoles';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Whether the current user holds VFOLDER/UPDATE on the `projectId` scope — the
 * permission the manager checks before renaming a project-owned folder.
 * `null` skips the lookup and answers `false`.
 *
 * External constraint: the lookup relies on `PermissionNestedFilter.scopeId` /
 * `operation`, which exist with `rbac-filter-wrapper` and are ignored from
 * `rbac-permission-bit` on (trusting them there would match any vfolder
 * permission). Outside that window, or when the lookup errors, it falls back
 * to project-admin scope. Details: FR-3522.
 */
export const useCanUpdateProjectVFolder = (projectId: string | null) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const { projectAdminIds } = useCurrentUserProjectRoles();

  const canQueryPermission =
    baiClient.supports('rbac-filter-wrapper') &&
    !baiClient.supports('rbac-permission-bit');
  const shouldQuery = canQueryPermission && projectId !== null;

  const permissionFilter: PermissionNestedFilter = {
    scopeType: { equals: 'PROJECT' },
    scopeId: { equals: projectId ?? '' },
    entityType: { equals: 'VFOLDER' },
    operation: { equals: 'UPDATE' },
  };

  const data = useLazyLoadQuery<useCanUpdateProjectVFolderQuery>(
    graphql`
      query useCanUpdateProjectVFolderQuery(
        $permissionFilter: PermissionNestedFilter!
        $shouldQuery: Boolean!
      ) {
        vfolderUpdateRoles: myRoles(
          first: 1
          filter: { permission: $permissionFilter }
        ) @include(if: $shouldQuery) @catch(to: RESULT) {
          count
        }
      }
    `,
    { permissionFilter, shouldQuery },
    {
      // With nothing to ask, the (empty) selection is read from the store.
      fetchPolicy: shouldQuery ? 'store-or-network' : 'store-only',
    },
  );

  if (projectId === null) return false;

  const fallback = projectAdminIds.includes(projectId);
  if (!shouldQuery) return fallback;

  const result = data.vfolderUpdateRoles;
  if (!result || result.ok !== true) return fallback;
  return (result.value?.count ?? 0) > 0;
};
