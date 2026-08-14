/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Drift tests for the single source of truth of the project-agnostic surface
 * (FR-3414).
 *
 * Three copies of this list used to exist (the hook's menu-key array, a
 * hand-written pathname regex in `useCurrentProject`, and the ESLint file
 * list) and two of them silently failed to track new keys. The key array and
 * the path map are now one module; these tests pin that module against the
 * REAL route tree, so renaming a route in `routes.tsx` — or adding a key
 * without its path — fails here instead of silently un-gating a page.
 */
import { mainLayoutChildRoutes } from '../routes';
import {
  PROJECT_AGNOSTIC_MENU_KEYS,
  PROJECT_AGNOSTIC_PATHNAME_REGEX,
  PROJECT_AGNOSTIC_ROUTE_PATHS,
} from './projectAgnosticRoutes';
import { matchRoutes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

interface MatchedRoute {
  path?: string;
  index?: boolean;
  handle?: { menuKey?: string; notFound?: boolean };
}

/** The route chain the data router would resolve for `pathname`. */
const matchChain = (pathname: string): MatchedRoute[] =>
  (matchRoutes(mainLayoutChildRoutes, pathname) ?? []).map(
    (match) => match.route as MatchedRoute,
  );

/** The deepest `handle.menuKey` for `pathname`, mirroring `useCurrentMenuKey`. */
const menuKeyOf = (pathname: string): string | undefined => {
  const chain = matchChain(pathname);
  for (let i = chain.length - 1; i >= 0; i--) {
    const menuKey = chain[i]?.handle?.menuKey;
    if (menuKey) return menuKey;
  }
  return undefined;
};

/** `true` when the pathname fell through to a router-owned 404 catch-all. */
const isCatchAll = (pathname: string): boolean => {
  const chain = matchChain(pathname);
  return chain.some(
    (route) => route.path === '*' || route.handle?.notFound === true,
  );
};

const allPaths = (key: keyof typeof PROJECT_AGNOSTIC_ROUTE_PATHS) => {
  const { canonicalPath, legacyPaths } = PROJECT_AGNOSTIC_ROUTE_PATHS[key];
  return [
    canonicalPath,
    ...legacyPaths.map((legacyPath) =>
      typeof legacyPath === 'string' ? legacyPath : legacyPath.path,
    ),
  ];
};

describe('PROJECT_AGNOSTIC_ROUTE_PATHS (FR-3414 drift guard)', () => {
  it('covers exactly the keys in PROJECT_AGNOSTIC_MENU_KEYS', () => {
    expect(Object.keys(PROJECT_AGNOSTIC_ROUTE_PATHS).sort()).toEqual(
      [...PROJECT_AGNOSTIC_MENU_KEYS].sort(),
    );
  });

  it.each(PROJECT_AGNOSTIC_MENU_KEYS)(
    'the canonical path of %s exists in routes.tsx and carries that menuKey',
    (menuKey) => {
      const { canonicalPath } = PROJECT_AGNOSTIC_ROUTE_PATHS[menuKey];
      expect(isCatchAll(canonicalPath)).toBe(false);
      expect(menuKeyOf(canonicalPath)).toBe(menuKey);
    },
  );

  it.each(PROJECT_AGNOSTIC_MENU_KEYS)(
    'every legacy shim path of %s still exists in routes.tsx',
    (menuKey) => {
      for (const legacyPath of allPaths(menuKey).slice(1)) {
        expect(
          isCatchAll(legacyPath),
          `${legacyPath} no longer resolves to a route`,
        ).toBe(false);
      }
    },
  );

  it.each(PROJECT_AGNOSTIC_MENU_KEYS)(
    'the derived pathname regex matches every path of %s',
    (menuKey) => {
      for (const pathname of allPaths(menuKey)) {
        expect(
          PROJECT_AGNOSTIC_PATHNAME_REGEX.test(pathname),
          `${pathname} is not matched by the derived regex`,
        ).toBe(true);
      }
    },
  );
});

describe('PROJECT_AGNOSTIC_PATHNAME_REGEX (FR-3414)', () => {
  it.each([
    // Modern /admin/* shape (routes.tsx `handle.menuKey` pages)
    '/admin/session',
    '/admin/session/some-session-id',
    '/admin/deployments',
    '/admin/deployments/dep-1',
    '/admin/deployments/deployment-presets/new',
    '/admin/data',
    // FR-3414 widening — canonical shapes
    '/admin/users',
    // FR-3415 widening
    '/admin/environment',
    '/admin/reservoir',
    '/admin/reservoir/artifact-1',
    '/admin/resource-policy',
    '/admin/scheduler',
    '/admin/agent',
    '/admin/project',
    '/admin/settings',
    '/admin/maintenance',
    '/admin/diagnostics',
    '/admin/rbac',
    '/admin/branding',
    '/admin/information',
    // Legacy first-segment shapes (redirect shims)
    '/admin-session',
    '/admin-deployments',
    '/admin-deployments/dep-1',
    '/admin-serving',
    '/admin-data',
    '/credential',
    '/environment',
    '/reservoir',
    '/reservoir/artifact-1',
    '/resource-policy',
    '/scheduler',
    '/agent',
    '/project',
    '/settings',
    '/maintenance',
    '/diagnostics',
    '/rbac',
    '/branding',
    '/information',
  ])('matches the project-agnostic path %s', (pathname) => {
    expect(PROJECT_AGNOSTIC_PATHNAME_REGEX.test(pathname)).toBe(true);
  });

  it.each([
    '/',
    '/data',
    '/agent-summary',
    '/usersettings',
    // `/project` is the admin project-management shim, but its DESCENDANTS
    // are the project scope — the single exact-match entry in the map.
    '/project/default/data',
    '/project/default/session',
    '/project/default/admin/deployments/dep-1', // project-admin space
    '/project/default/admin/users',
    // The only excluded admin page: it still reads the ambient project.
    '/admin/dashboard',
    '/admin-dashboard',
    '/admin', // bare admin root redirects; not a scoped surface itself
    '/administrator',
    '/admin-sessionish',
  ])('does not match the project-dependent path %s', (pathname) => {
    expect(PROJECT_AGNOSTIC_PATHNAME_REGEX.test(pathname)).toBe(false);
  });
});
