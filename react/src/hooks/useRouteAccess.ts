/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEffectiveAdminRole } from './useCurrentUserProjectRoles';
import { useUrlProjectValidity } from './useUrlProjectValidity';
import { useWebUIMenuItems } from './useWebUIMenuItems';
import { useMatches } from 'react-router-dom';

/**
 * Access requirement a route declares on its `handle` (FR-3383, Phase 2 of
 * the route-error restructure). Declared on the scope subtree root and
 * overridden per leaf where a page needs more:
 *
 *   - 'superadmin':   superadmin only
 *   - 'admin':        superadmin or domain admin
 *   - 'projectAdmin': superadmin, domain admin, or project admin of the
 *                     project the URL names
 *
 * Routes without an `access` handle (own or inherited) are open to every
 * authenticated user.
 */
export type RouteAccessRequirement = 'superadmin' | 'admin' | 'projectAdmin';

export type RouteAccessDecision =
  | 'allowed'
  | 'unauthorized'
  | 'blocked'
  /**
   * The URL names a project that doesn't resolve for this user, so the
   * requirement cannot be evaluated. `ProjectScopeLayout` owns the screen
   * (the merged "not found or no access" state) — render nothing else.
   */
  | 'defer';

interface AccessRouteHandle {
  access?: RouteAccessRequirement;
  /**
   * Marks a catch-all (not-found) route. Clears any `access` inherited from
   * the scope subtree: route existence is decided BEFORE authorization, so
   * unknown URLs render the router-owned 404 (or the Lit plugin page)
   * identically for every role instead of a role-dependent 401/404 split.
   */
  notFound?: boolean;
}

/**
 * Decides whether the current user may see the currently matched route,
 * from the deepest `handle.access` declaration and the URL-aware effective
 * admin role. Single source of truth for `RouteAccessGuard` (which throws
 * the corresponding `Response`) and MainLayout's breadcrumb gate.
 */
export const useRouteAccessDecision = (): RouteAccessDecision => {
  'use memo';
  const matches = useMatches();
  const effectiveAdminRole = useEffectiveAdminRole();
  const { isInvalid: isUrlProjectInvalid } = useUrlProjectValidity();
  const { isCurrentPageBlocked } = useWebUIMenuItems();

  if (isUrlProjectInvalid) {
    return 'defer';
  }

  let access: RouteAccessRequirement | undefined;
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.handle as AccessRouteHandle | undefined;
    if (handle?.notFound) {
      // Catch-all match: the URL names no real route, so there is nothing
      // to authorize — UnknownRoutePage owns the screen for every role.
      break;
    }
    if (handle?.access) {
      access = handle.access;
      break;
    }
  }

  if (access) {
    const allowed =
      access === 'superadmin'
        ? effectiveAdminRole === 'superadmin'
        : access === 'admin'
          ? effectiveAdminRole === 'superadmin' ||
            effectiveAdminRole === 'domainAdmin'
          : effectiveAdminRole !== 'none';
    if (!allowed) {
      return 'unauthorized';
    }
  }

  if (isCurrentPageBlocked) {
    return 'blocked';
  }

  return 'allowed';
};
