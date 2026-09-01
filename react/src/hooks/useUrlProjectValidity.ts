/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAccessibleProjects } from './useAccessibleProjects';
import * as _ from 'lodash-es';
import { useMatches } from 'react-router-dom';

export interface UrlProjectValidity {
  /**
   * The `:projectName` URL param of the deepest matched route, already
   * percent-decoded by react-router. `undefined` when the current URL is not
   * under `/project/:projectName/*`.
   */
  urlProjectName?: string;
  /**
   * True when the URL names a project that does NOT resolve for the current
   * user (not offered by the header project selector). Whether the project
   * is missing or merely access-restricted is deliberately
   * indistinguishable — the name is just a name. Always false outside
   * project-scoped URLs.
   */
  isInvalid: boolean;
  /** The resolved project id when the URL project is valid. */
  resolvedId?: string;
  /** Names of all projects the current user can enter, sorted. */
  groups: string[];
}

/**
 * Validates the `:projectName` segment of the current URL against the same
 * accessible-project list the header's `ProjectSelect` renders
 * (`useAccessibleProjects`, FR-3388) — NOT the login-time `baiClient.groups`
 * list, which only contains GENERAL-type projects and wrongly rejected
 * MODEL_STORE projects the selector offers.
 *
 * Single source of truth shared by `ProjectScopeLayout` (renders the "not
 * found / no access" state), `PageAccessGuard` (must not decide 401 against
 * an unresolvable project), and `ProjectAdminScopeAlert` (must not render
 * for an unresolvable project).
 *
 * Reads the param via `useMatches` so it works from ancestors of the project
 * route (e.g. MainLayout), where `useParams` cannot see child params.
 */
export const useUrlProjectValidity = (): UrlProjectValidity => {
  'use memo';
  const { accessibleProjects } = useAccessibleProjects();
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

  const groups = _.sortBy(
    _.compact(_.map(accessibleProjects, (project) => project?.name)),
  );
  const resolvedId = urlProjectName
    ? (_.find(accessibleProjects, (project) => project?.name === urlProjectName)
        ?.id ?? undefined)
    : undefined;
  const isInvalid = !!urlProjectName && !resolvedId;

  return { urlProjectName, isInvalid, resolvedId, groups };
};
