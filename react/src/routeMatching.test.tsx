/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Contract tests for router-owned 404 (FR-3279).
 *
 * The 404 decision now rests entirely on the SHAPE of the route tree:
 * every scope subtree carries its own `path: '*'` catch-all, and the bare
 * scope roots carry `index` redirects. That shape is invisible by
 * inspection and regresses silently when routes are added or moved, so we
 * pin it here with `matchRoutes` (the exact matcher the data router uses).
 */
import { mainLayoutChildRoutes } from './routes';
import { matchRoutes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

/**
 * Renders the matched route chain as a readable signature, e.g.
 * `project/:projectName > admin > *` or `admin > [index]`.
 */
const matchSignature = (pathname: string): string => {
  const matches = matchRoutes(mainLayoutChildRoutes, pathname);
  if (!matches) {
    return 'NO_MATCH';
  }
  return matches
    .map((m) => (m.route.index ? '[index]' : (m.route.path ?? '[pathless]')))
    .join(' > ');
};

describe('scoped catch-alls own unknown URLs', () => {
  it.each([
    ['/admin/bogus', 'admin > *'],
    ['/project/foo/bogus', 'project/:projectName > *'],
    ['/project/foo/admin/bogus', 'project/:projectName > admin > *'],
    // A known feature with unknown extra segments is unknown as a whole.
    ['/project/foo/start/extra', 'project/:projectName > *'],
    // Root catch-all still serves flat unknown (or Lit-plugin) URLs.
    ['/bogus', '*'],
  ])('%s -> %s', (pathname, expected) => {
    expect(matchSignature(pathname)).toBe(expected);
  });
});

describe('bare scope roots redirect via index routes', () => {
  it.each([
    ['/admin', 'admin > [index]'],
    ['/project/foo', 'project/:projectName > [index]'],
    ['/project/foo/admin', 'project/:projectName > admin > [index]'],
  ])('%s -> %s', (pathname, expected) => {
    expect(matchSignature(pathname)).toBe(expected);
  });
});

describe('real routes still win over the catch-alls', () => {
  it.each([
    ['/admin/session', 'admin > session'],
    ['/project/foo/start', 'project/:projectName > start'],
    ['/project/foo/admin/session', 'project/:projectName > admin > session'],
    ['/usersettings', '/usersettings'],
  ])('%s -> %s', (pathname, expected) => {
    expect(matchSignature(pathname)).toBe(expected);
  });
});

/**
 * Effective `handle.access` for a pathname — the exact lookup
 * `useRouteAccessDecision` performs (FR-3383): walk up from the deepest
 * match; a `notFound` catch-all clears any access inherited from the scope
 * subtree (route existence is decided before authorization).
 */
const effectiveAccess = (pathname: string): string | undefined => {
  const matches = matchRoutes(mainLayoutChildRoutes, pathname);
  if (!matches) return undefined;
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.route.handle as
      { access?: string; notFound?: boolean } | undefined;
    if (handle?.notFound) return undefined;
    if (handle?.access) return handle.access;
  }
  return undefined;
};

describe('route-handle access declarations (FR-3383)', () => {
  it.each([
    // Bare /admin inherits the subtree requirement (no relaxation).
    ['/admin', 'admin'],
    // Global admin subtree default.
    ['/admin/session', 'admin'],
    ['/admin/environment', 'admin'],
    ['/admin/users', 'admin'],
    // Superadmin-only leaves override the subtree default.
    ['/admin/settings', 'superadmin'],
    ['/admin/deployments', 'superadmin'],
    ['/admin/dashboard', 'superadmin'],
    ['/admin/rbac', 'superadmin'],
    ['/admin/agent', 'superadmin'],
    // Project-admin subtree.
    ['/project/foo/admin/users', 'projectAdmin'],
    ['/project/foo/admin/session', 'projectAdmin'],
    // General pages declare nothing.
    ['/project/foo/start', undefined],
    ['/usersettings', undefined],
    // Unknown URLs: the notFound catch-all clears inherited access, so the
    // router-owned 404 renders identically for every role.
    ['/admin/bogus', undefined],
    ['/project/foo/admin/bogus', undefined],
    ['/project/foo/bogus', undefined],
    ['/bogus', undefined],
  ])('%s -> %s', (pathname, expected) => {
    expect(effectiveAccess(pathname)).toBe(expected);
  });
});

describe('unicode project names match :projectName', () => {
  it('matches a raw (unencoded) Korean project name', () => {
    expect(matchSignature('/project/한글-프로젝트/session')).toBe(
      'project/:projectName > session > [index]',
    );
  });

  it('matches a percent-encoded Korean project name', () => {
    expect(
      matchSignature(`/project/${encodeURIComponent('한글 프로젝트')}/session`),
    ).toBe('project/:projectName > session > [index]');
  });
});
