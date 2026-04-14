/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useCurrentUserProjectRolesQuery } from '../__generated__/useCurrentUserProjectRolesQuery.graphql';
import { useCurrentProjectValue } from './useCurrentProject';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Regex matching the backend's auto-generated project-admin role name.
 * Backend uses short project IDs (UUID with hyphens stripped → 32 hex chars),
 * but only the first 8 hex characters are embedded in the role name.
 *
 * Example: `role_project_abcd1234_admin`
 */
const PROJECT_ADMIN_ROLE_NAME_RE = /^role_project_([0-9a-f]{8})_admin$/i;

/**
 * Minimal shape of a single role assignment node returned by the `myRoles` query.
 * Kept as an interface so tests can construct fixtures without importing Relay
 * generated types. All properties are `readonly` to stay structurally compatible
 * with Relay's generated readonly shapes without requiring a type assertion.
 */
export interface MyRolesAssignmentNode {
  readonly role?: {
    readonly name?: string | null;
    readonly permissions?: {
      readonly edges?: ReadonlyArray<{
        readonly node?: {
          readonly scopeType?: string | null;
          readonly scopeId?: string | null;
          readonly entityType?: string | null;
        } | null;
      } | null> | null;
    } | null;
  } | null;
}

export interface CurrentUserProjectRolesResult {
  /** `true` when the authenticated user is a super-admin (derived from baiClient). */
  isSuperAdmin: boolean;
  /** Domain names the user has domain-admin rights over (derived from baiClient for now). */
  domainAdminDomains: string[];
  /**
   * Project identifiers the user has project-admin rights over.
   *
   * Primary signal: permissions where `scopeType === 'PROJECT'` and
   * `entityType === 'PROJECT_ADMIN_PAGE'` — these carry the full project UUID
   * (`scopeId`), stored here as-is.
   * Fallback: role name regex `role_project_<8-hex>_admin` (only used when the
   * primary signal returned nothing, for older cores that don't yet grant the
   * `PROJECT_ADMIN_PAGE` permission). In that case only the 8-hex prefix of the
   * project UUID is available.
   *
   * Because the two signals use different representations, use
   * {@link isProjectAdminForId} to check membership instead of
   * `Array.includes` directly.
   */
  projectAdminIds: string[];
  /** Raw list of role-assignment nodes, exposed for advanced consumers. */
  rawAssignments: ReadonlyArray<MyRolesAssignmentNode>;
}

/**
 * Strip hyphens from a UUID string and return the first 8 hex characters lowercased.
 * Returns `null` if the input is not a non-empty string or doesn't yield 8+ hex chars.
 */
const toShortProjectId = (scopeId?: string | null): string | null => {
  if (!scopeId) return null;
  const stripped = scopeId.replace(/-/g, '').toLowerCase();
  if (stripped.length < 8) return null;
  const short = stripped.slice(0, 8);
  return /^[0-9a-f]{8}$/.test(short) ? short : null;
};

/**
 * Pure, framework-free function that derives the admin-scope data from a list
 * of raw `myRoles` assignment nodes. Exposed for unit testing and for reuse
 * when assignments are obtained from a non-Relay source.
 */
export const deriveProjectAdminIds = (
  assignments: ReadonlyArray<MyRolesAssignmentNode>,
): string[] => {
  const fromPermissions = new Set<string>();
  const fromRoleNames = new Set<string>();

  for (const assignment of assignments) {
    const role = assignment?.role;
    if (!role) continue;

    // Primary: PROJECT scope + PROJECT_ADMIN_PAGE entity.
    const permissionEdges = role.permissions?.edges ?? [];
    for (const edge of permissionEdges) {
      const node = edge?.node;
      if (!node) continue;
      if (
        node.scopeType === 'PROJECT' &&
        node.entityType === 'PROJECT_ADMIN_PAGE' &&
        node.scopeId
      ) {
        // Preserve the full project UUID as returned by the backend so callers
        // can match directly against `useCurrentProject().id`.
        fromPermissions.add(node.scopeId);
      }
    }

    // Fallback: role name regex, collected separately so primary wins when present.
    const match = role.name ? PROJECT_ADMIN_ROLE_NAME_RE.exec(role.name) : null;
    if (match?.[1]) {
      fromRoleNames.add(match[1].toLowerCase());
    }
  }

  // Sort lexicographically so the returned array is deterministic regardless
  // of GraphQL connection ordering — prevents unnecessary re-renders and
  // flaky reference-equality comparisons across fetches.
  if (fromPermissions.size > 0) {
    return Array.from(fromPermissions).sort();
  }
  return Array.from(fromRoleNames).sort();
};

/**
 * Check whether a given project UUID is in the admin list returned by
 * {@link useCurrentUserProjectRoles}. Handles both representations emitted by
 * {@link deriveProjectAdminIds}: full UUIDs (primary signal) and 8-hex
 * prefixes (fallback from legacy role names).
 */
export const isProjectAdminForId = (
  projectId: string | null | undefined,
  projectAdminIds: ReadonlyArray<string>,
): boolean => {
  if (!projectId || projectAdminIds.length === 0) return false;
  if (projectAdminIds.includes(projectId)) return true;
  const shortId = toShortProjectId(projectId);
  return !!shortId && projectAdminIds.includes(shortId);
};

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
        myRolesResult: myRoles(first: 100) @catch(to: RESULT) {
          edges {
            node {
              id
              role {
                id
                name
                permissions(first: 200) {
                  edges {
                    node {
                      id
                      scopeType
                      scopeId
                      entityType
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
      fetchPolicy: 'store-or-network',
    },
  );

  const assignments: ReadonlyArray<MyRolesAssignmentNode> =
    data.myRolesResult?.ok === true
      ? (data.myRolesResult.value?.edges
          ?.map((edge) => edge?.node)
          .filter((node) => Boolean(node)) ?? [])
      : [];

  const projectAdminIds = deriveProjectAdminIds(assignments);

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
    rawAssignments: assignments,
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
  if (isProjectAdminForId(currentProjectId, projectAdminIds))
    return 'currentProjectAdmin';
  return 'none';
};
