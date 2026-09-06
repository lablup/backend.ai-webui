/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PROJECT_AGNOSTIC_MENU_KEYS,
  PROJECT_AGNOSTIC_PATHNAME_REGEX,
} from '../helper/projectAgnosticRoutes';
import { useCurrentMenuKey } from './useRouteScope';
import { useLocation } from 'react-router-dom';

export {
  PROJECT_AGNOSTIC_MENU_KEYS,
  PROJECT_AGNOSTIC_ROUTE_PATHS,
  PROJECT_AGNOSTIC_PATHNAME_REGEX,
} from '../helper/projectAgnosticRoutes';
export type { ProjectAgnosticMenuKey } from '../helper/projectAgnosticRoutes';

/**
 * Whether the current route is one of the project-agnostic pages
 * (`PROJECT_AGNOSTIC_MENU_KEYS` -- the whole `/admin/*` surface that operates
 * ABOVE project scope, minus the few pages that still genuinely depend on the
 * ambient project). On these routes the header project selector is not
 * mounted, and ambient-project-derived UI (mismatch alerts, session-launch
 * buttons, permission scoping) must not key off it.
 *
 * Named "project-agnostic" rather than "super-admin-scoped" (FR-3414):
 * `admin-session`, `credential` and `resource-policy` are `access: 'admin'`
 * (domain admins reach them too), so the property that matters is the scope
 * the page operates at, not the role required to open it.
 *
 * Implementation: keyed off `useCurrentMenuKey()` -- the deepest route
 * `handle.menuKey` -- falling back to the pathname's first segment for legacy
 * unprefixed paths (`/admin-session`, `/credential`, ...). This is the modern
 * equivalent of the pathname-first-segment pattern previously used by
 * `ProjectAdminScopeAlert`.
 *
 * Usage contract (ADR-0001): only **pages** and **globally-mounted
 * components** (e.g. the folder-explorer modal, which has no page parent) may
 * call this hook to decide their project context. Converted leaf components
 * must NOT -- they receive the decision via their required `project` prop.
 */
export const useIsProjectAgnosticPage = (): boolean => {
  'use memo';
  const menuKey = useCurrentMenuKey();
  const { pathname } = useLocation();
  if (
    (PROJECT_AGNOSTIC_MENU_KEYS as readonly string[]).includes(menuKey ?? '')
  ) {
    return true;
  }
  // `useCurrentMenuKey`'s own fallback derives a FEATURE key from the first
  // path segment, which does not cover every legacy alias: `/admin-serving`
  // yields `admin-serving` (not a menu key at all) and the exact `/project`
  // shim yields no feature key. `PROJECT_AGNOSTIC_PATHNAME_REGEX` is derived
  // from the same route table and encodes both — including the exact-vs-prefix
  // distinction that keeps `/project/:projectName/...` OUT.
  return PROJECT_AGNOSTIC_PATHNAME_REGEX.test(pathname);
};
