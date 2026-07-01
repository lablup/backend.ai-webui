/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the pure pathname parser `getRouteScopeAndKey`.
 *
 * The React hooks in `useRouteScope.ts` (`useRouteScope`, `useCurrentMenuKey`,
 * `useActiveProjectName`, `useProjectPath`) are covered indirectly: they all
 * fall back to `getRouteScopeAndKey` when no route handle is present, and the
 * pure parser is the load-bearing logic. The map round-trip is also exercised
 * here against `buildPath` to confirm parse(build(x)) === x.
 */
import {
  buildPath,
  MENU_KEY_TO_SCOPE_FEATURE,
  RouteScope,
} from '../helper/pathBuilder';
import { getRouteScopeAndKey, rewriteProjectNameInPath } from './useRouteScope';

describe('getRouteScopeAndKey', () => {
  it('parses global admin paths', () => {
    expect(getRouteScopeAndKey('/admin/session')).toEqual({
      scope: 'admin',
      featureKey: 'session',
    });
    expect(getRouteScopeAndKey('/admin/users')).toEqual({
      scope: 'admin',
      featureKey: 'users',
    });
  });

  it('parses global admin paths with trailing child segments', () => {
    // Only the feature key (first segment after /admin) is extracted.
    expect(getRouteScopeAndKey('/admin/deployments/abc-123')).toEqual({
      scope: 'admin',
      featureKey: 'deployments',
    });
  });

  it('parses project-scope paths', () => {
    expect(getRouteScopeAndKey('/project/my-proj/session')).toEqual({
      scope: 'project',
      featureKey: 'session',
      projectName: 'my-proj',
    });
    expect(getRouteScopeAndKey('/project/alpha/deployments/dep-1')).toEqual({
      scope: 'project',
      featureKey: 'deployments',
      projectName: 'alpha',
    });
  });

  it('parses project-admin-scope paths', () => {
    expect(getRouteScopeAndKey('/project/my-proj/admin/session')).toEqual({
      scope: 'projectAdmin',
      featureKey: 'session',
      projectName: 'my-proj',
    });
    expect(getRouteScopeAndKey('/project/alpha/admin/users')).toEqual({
      scope: 'projectAdmin',
      featureKey: 'users',
      projectName: 'alpha',
    });
  });

  it('decodes encoded project names', () => {
    expect(getRouteScopeAndKey('/project/my%20project/session')).toEqual({
      scope: 'project',
      featureKey: 'session',
      projectName: 'my project',
    });
    expect(
      getRouteScopeAndKey(`/project/${encodeURIComponent('한글')}/session`),
    ).toEqual({
      scope: 'project',
      featureKey: 'session',
      projectName: '한글',
    });
  });

  it('falls back to project scope for legacy unprefixed paths', () => {
    expect(getRouteScopeAndKey('/session')).toEqual({
      scope: 'project',
      featureKey: 'session',
    });
    expect(getRouteScopeAndKey('/data')).toEqual({
      scope: 'project',
      featureKey: 'data',
    });
  });

  it('handles the root path', () => {
    expect(getRouteScopeAndKey('/')).toEqual({
      scope: 'project',
      featureKey: '',
    });
  });

  it('handles a malformed encoded project name without throwing', () => {
    // '%' alone is not a valid escape sequence; decodeSafe should not throw.
    expect(() => getRouteScopeAndKey('/project/%/session')).not.toThrow();
    const result = getRouteScopeAndKey('/project/%/session');
    expect(result.scope).toBe('project');
    expect(result.featureKey).toBe('session');
  });
});

describe('rewriteProjectNameInPath', () => {
  it('replaces the project-name segment of a project path', () => {
    expect(rewriteProjectNameInPath('/project/old/session', 'new')).toBe(
      '/project/new/session',
    );
  });

  it('replaces the project-name segment of a project-admin path', () => {
    expect(rewriteProjectNameInPath('/project/old/admin/data', 'new')).toBe(
      '/project/new/admin/data',
    );
  });

  it('preserves search and hash after the rewritten segment', () => {
    expect(
      rewriteProjectNameInPath('/project/old/session?tab=1#frag', 'new'),
    ).toBe('/project/new/session?tab=1#frag');
  });

  it('preserves trailing detail segments', () => {
    expect(
      rewriteProjectNameInPath('/project/old/deployments/dep-1', 'new'),
    ).toBe('/project/new/deployments/dep-1');
  });

  it('encodes the replacement project name', () => {
    expect(rewriteProjectNameInPath('/project/old/session', 'a b')).toBe(
      '/project/a%20b/session',
    );
  });

  it('leaves non-project paths unchanged', () => {
    expect(rewriteProjectNameInPath('/admin/session', 'new')).toBe(
      '/admin/session',
    );
    expect(rewriteProjectNameInPath('/usersettings', 'new')).toBe(
      '/usersettings',
    );
  });

  it('returns the original path when no project name is provided', () => {
    expect(rewriteProjectNameInPath('/project/old/session', undefined)).toBe(
      '/project/old/session',
    );
    expect(rewriteProjectNameInPath('/project/old/session', '')).toBe(
      '/project/old/session',
    );
    expect(rewriteProjectNameInPath('/project/old/session', null)).toBe(
      '/project/old/session',
    );
  });
});

describe('getRouteScopeAndKey <-> buildPath round-trip', () => {
  it('parse(build(scope, feature, name)) recovers scope + feature', () => {
    const projectName = 'my-proj';
    for (const { scope, featureKey } of Object.values(
      MENU_KEY_TO_SCOPE_FEATURE,
    )) {
      // 'pipeline' is an external link, not a real route, but it still
      // round-trips structurally through buildPath/getRouteScopeAndKey.
      const path = buildPath(scope as RouteScope, featureKey, projectName);
      const parsed = getRouteScopeAndKey(path);
      expect(parsed.scope).toBe(scope);
      expect(parsed.featureKey).toBe(featureKey);
      if (scope === 'admin') {
        expect(parsed.projectName).toBeUndefined();
      } else {
        expect(parsed.projectName).toBe(projectName);
      }
    }
  });
});
