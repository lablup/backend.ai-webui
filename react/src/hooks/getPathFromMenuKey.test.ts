/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the scope-aware `getPathFromMenuKey` helper.
 *
 * It delegates to `buildPath` via `MENU_KEY_TO_SCOPE_FEATURE`, producing
 * `/project/<name>/<feature>` for general (project) keys,
 * `/project/<name>/admin/<feature>` for project-admin keys, and
 * `/admin/<feature>` for global admin keys (project name ignored). When a
 * project-scoped key has no resolvable project name, it falls back to the
 * legacy flat path (which the redirect shims resolve at runtime) instead of
 * emitting a broken `/project//<feature>` URL.
 */
import { VALID_MENU_KEYS, getPathFromMenuKey } from './useWebUIMenuItems';

describe('getPathFromMenuKey', () => {
  it('builds project-scoped paths for general menu keys with a project name', () => {
    expect(getPathFromMenuKey('session', 'alpha')).toBe(
      '/project/alpha/session',
    );
    expect(getPathFromMenuKey('start', 'alpha')).toBe('/project/alpha/start');
    expect(getPathFromMenuKey('data', 'alpha')).toBe('/project/alpha/data');
  });

  it('resolves general menu aliases to their canonical feature', () => {
    // 'job' -> session, 'summary' -> dashboard
    expect(getPathFromMenuKey('job', 'alpha')).toBe('/project/alpha/session');
    expect(getPathFromMenuKey('summary', 'alpha')).toBe(
      '/project/alpha/dashboard',
    );
  });

  it('builds project-admin paths under the /admin/ segment', () => {
    expect(getPathFromMenuKey('project-admin-session', 'alpha')).toBe(
      '/project/alpha/admin/session',
    );
    expect(getPathFromMenuKey('project-data', 'alpha')).toBe(
      '/project/alpha/admin/data',
    );
    expect(getPathFromMenuKey('project-admin-users', 'alpha')).toBe(
      '/project/alpha/admin/users',
    );
  });

  it('builds global admin paths and ignores the project name', () => {
    expect(getPathFromMenuKey('admin-session', 'alpha')).toBe('/admin/session');
    expect(getPathFromMenuKey('credential', 'alpha')).toBe('/admin/users');
    expect(getPathFromMenuKey('admin-data')).toBe('/admin/data');
    expect(getPathFromMenuKey('reservoir')).toBe('/admin/reservoir');
  });

  it('encodes the project name for project-scoped keys', () => {
    expect(getPathFromMenuKey('session', 'a b')).toBe('/project/a%20b/session');
  });

  it('falls back to the legacy flat path when a project-scoped key has no project name', () => {
    // No `/project//...` — the legacy flat path is mounted as a redirect shim.
    expect(getPathFromMenuKey('session')).toBe('/session');
    expect(getPathFromMenuKey('session', undefined)).toBe('/session');
    expect(getPathFromMenuKey('session', '')).toBe('/session');
    expect(getPathFromMenuKey('job')).toBe('/session');
    expect(getPathFromMenuKey('summary')).toBe('/dashboard');
    expect(getPathFromMenuKey('project-data')).toBe('/project-data');
  });

  it('never produces a path with an empty project segment', () => {
    for (const key of VALID_MENU_KEYS) {
      // Without a project name, project-scoped keys fall back to flat paths.
      expect(getPathFromMenuKey(key)).not.toContain('/project//');
      // With a project name, the segment is always populated.
      expect(getPathFromMenuKey(key, 'alpha')).not.toContain('/project//');
    }
  });
});
