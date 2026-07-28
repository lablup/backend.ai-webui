/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useMatches } from 'react-router-dom';

interface BackendAIClientGroups {
  groups?: string[];
  groupIds?: Record<string, string>;
}

export interface UrlProjectValidity {
  /**
   * The `:projectName` URL param of the deepest matched route, already
   * percent-decoded by react-router. `undefined` when the current URL is not
   * under `/project/:projectName/*`.
   */
  urlProjectName?: string;
  /**
   * True when the URL names a project that does NOT resolve for the current
   * user (not a member, or no resolvable id). Whether the project is missing
   * or merely access-restricted is deliberately indistinguishable — the name
   * is just a name. Always false outside project-scoped URLs.
   */
  isInvalid: boolean;
  /** The resolved project id when the URL project is valid. */
  resolvedId?: string;
  /** All project names the current user belongs to. */
  groups: string[];
}

/**
 * Validates the `:projectName` segment of the current URL against the
 * logged-in user's project membership. Single source of truth shared by
 * `ProjectScopeLayout` (renders the "not found / no access" state),
 * `PageAccessGuard` (must not decide 401 against an unresolvable project),
 * and `ProjectAdminScopeAlert` (must not render for an unresolvable project).
 *
 * Reads the param via `useMatches` so it works from ancestors of the project
 * route (e.g. MainLayout), where `useParams` cannot see child params.
 */
export const useUrlProjectValidity = (): UrlProjectValidity => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const matches = useMatches();

  let urlProjectName: string | undefined;
  for (let i = matches.length - 1; i >= 0; i--) {
    const params = matches[i]?.params as
      Record<string, string | undefined> | undefined;
    if (params?.projectName) {
      urlProjectName = params.projectName;
      break;
    }
  }

  const clientGroups = baiClient as unknown as BackendAIClientGroups;
  const groups = clientGroups.groups ?? [];
  const groupIds = clientGroups.groupIds ?? {};

  const resolvedId = urlProjectName ? groupIds[urlProjectName] : undefined;
  const isInvalid =
    !!urlProjectName && !(groups.includes(urlProjectName) && !!resolvedId);

  return { urlProjectName, isInvalid, resolvedId, groups };
};
