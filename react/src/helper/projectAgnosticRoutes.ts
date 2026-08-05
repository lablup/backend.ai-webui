/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Single source of truth for the **project-agnostic surface** (ADR-0001,
 * FR-3407 / FR-3414): the routes that operate ABOVE project scope. On these
 * routes the header project selector is not mounted at all, and an ambient
 * current-project read is either a not-yet-converted leaf component (a bug in
 * waiting) or one of the few sanctioned globally-mounted readers.
 *
 * "Project-agnostic" rather than "super-admin-scoped": several of these pages
 * are `access: 'admin'` (domain admins too), so the defining property is the
 * scope they operate at, not the role required to reach them.
 *
 * This module is deliberately a LEAF -- it imports nothing. Two consumers with
 * incompatible constraints need the same list:
 *
 * - `useIsProjectAgnosticPage` (`hooks/useIsProjectAgnosticPage.ts`) matches
 *   the deepest route `handle.menuKey` via `useCurrentMenuKey()`, and so must
 *   use router hooks.
 * - `useCurrentProjectValue` (`hooks/useCurrentProject.tsx`) matches
 *   `window.location.pathname` imperatively, because it must stay usable
 *   OUTSIDE a router context (tests, non-route callers), and so must NOT use
 *   router hooks.
 *
 * Keeping the data here (a) lets the pathname matcher be DERIVED from the key
 * list instead of being a hand-written parallel regex that silently fails to
 * track newly gated keys, and (b) avoids the
 * `useCurrentProject -> useRouteScope -> useCurrentProject` import cycle -- and
 * its module-init TDZ hazard -- that a direct hook-to-hook import would create.
 *
 * Deliberately EXCLUDED (they genuinely read the ambient project):
 * `environment` and `reservoir` (pending follow-up), and `admin-dashboard`
 * (out of scope for FR-3407).
 */

/**
 * Route `handle.menuKey`s (see `routes.tsx`) of every project-agnostic page.
 *
 * Ordered as they appear in the `/admin/*` subtree of `routes.tsx`.
 */
export const PROJECT_AGNOSTIC_MENU_KEYS = [
  'admin-session',
  'admin-deployments',
  'admin-data',
  'credential',
  'resource-policy',
  'scheduler',
  'agent',
  'project',
  'settings',
  'maintenance',
  'diagnostics',
  'rbac',
  'branding',
  'information',
] as const;

export type ProjectAgnosticMenuKey =
  (typeof PROJECT_AGNOSTIC_MENU_KEYS)[number];

/**
 * A legacy flat pathname that `replace`-redirects into the canonical
 * `/admin/*` path.
 */
interface LegacyPath {
  path: string;
  /**
   * `true` when ONLY the exact pathname belongs to the project-agnostic
   * surface. Required for `/project`, whose descendants
   * (`/project/:projectName/...`) are the PROJECT scope -- not the admin
   * project-management page.
   */
  exact: true;
}

interface ProjectAgnosticRoute {
  /**
   * Canonical pathname the menu key resolves to in `routes.tsx`. The menu key
   * is NOT always the path segment (e.g. `credential -> /admin/users`), which
   * is exactly why this mapping is written out instead of derived.
   */
  canonicalPath: string;
  /** Legacy flat pathnames that redirect into `canonicalPath`. */
  legacyPaths: readonly (string | LegacyPath)[];
}

/**
 * `menuKey -> pathnames`. `Record<ProjectAgnosticMenuKey, ...>` makes the
 * compiler enforce a 1:1 correspondence with `PROJECT_AGNOSTIC_MENU_KEYS`;
 * `projectAgnosticRoutes.test.tsx` additionally pins every path against the
 * real route tree so a route rename cannot silently un-gate a page.
 */
export const PROJECT_AGNOSTIC_ROUTE_PATHS: Record<
  ProjectAgnosticMenuKey,
  ProjectAgnosticRoute
> = {
  'admin-session': {
    canonicalPath: '/admin/session',
    legacyPaths: ['/admin-session'],
  },
  'admin-deployments': {
    canonicalPath: '/admin/deployments',
    // `/admin-serving` is the pre-FR-2664 name for the same surface.
    legacyPaths: ['/admin-deployments', '/admin-serving'],
  },
  'admin-data': {
    canonicalPath: '/admin/data',
    legacyPaths: ['/admin-data'],
  },
  credential: {
    canonicalPath: '/admin/users',
    legacyPaths: ['/credential'],
  },
  'resource-policy': {
    canonicalPath: '/admin/resource-policy',
    legacyPaths: ['/resource-policy'],
  },
  scheduler: {
    canonicalPath: '/admin/scheduler',
    legacyPaths: ['/scheduler'],
  },
  agent: {
    canonicalPath: '/admin/agent',
    legacyPaths: ['/agent'],
  },
  project: {
    canonicalPath: '/admin/project',
    // Exact only -- `/project/:projectName/...` is the PROJECT scope.
    legacyPaths: [{ path: '/project', exact: true }],
  },
  settings: {
    canonicalPath: '/admin/settings',
    legacyPaths: ['/settings'],
  },
  maintenance: {
    canonicalPath: '/admin/maintenance',
    legacyPaths: ['/maintenance'],
  },
  diagnostics: {
    canonicalPath: '/admin/diagnostics',
    legacyPaths: ['/diagnostics'],
  },
  rbac: {
    canonicalPath: '/admin/rbac',
    legacyPaths: ['/rbac'],
  },
  branding: {
    canonicalPath: '/admin/branding',
    legacyPaths: ['/branding'],
  },
  information: {
    canonicalPath: '/admin/information',
    legacyPaths: ['/information'],
  },
};

const escapeForRegExp = (source: string): string =>
  source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildProjectAgnosticPathnameRegex = (): RegExp => {
  // Prefix paths own their descendants (`/admin/deployments/dep-1`); exact
  // paths must not (`/project` vs `/project/foo/session`).
  const prefixPaths: Array<string> = [];
  const exactPaths: Array<string> = [];

  for (const menuKey of PROJECT_AGNOSTIC_MENU_KEYS) {
    const { canonicalPath, legacyPaths } =
      PROJECT_AGNOSTIC_ROUTE_PATHS[menuKey];
    prefixPaths.push(canonicalPath);
    for (const legacyPath of legacyPaths) {
      if (typeof legacyPath === 'string') {
        prefixPaths.push(legacyPath);
      } else {
        exactPaths.push(legacyPath.path);
      }
    }
  }

  const alternation = (paths: Array<string>) =>
    paths.map(escapeForRegExp).join('|');

  const branches = [`(?:${alternation(prefixPaths)})(?:/|$)`];
  if (exactPaths.length > 0) {
    branches.push(`(?:${alternation(exactPaths)})$`);
  }
  return new RegExp(`^(?:${branches.join('|')})`);
};

/**
 * FR-3414 guardrail: pathnames of the project-agnostic surface, in both the
 * canonical `/admin/*` shape and the legacy flat shapes that redirect into it.
 *
 * DERIVED from `PROJECT_AGNOSTIC_ROUTE_PATHS`, so adding a menu key
 * automatically widens the matcher. Matched imperatively against
 * `window.location.pathname` (NOT via router hooks) so `useCurrentProjectValue`
 * stays usable outside a router context.
 */
export const PROJECT_AGNOSTIC_PATHNAME_REGEX =
  buildProjectAgnosticPathnameRegex();
