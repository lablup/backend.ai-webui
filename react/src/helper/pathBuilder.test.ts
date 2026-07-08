/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the scope-aware path-building primitives.
 *
 * Coverage:
 * - buildPath() produces correct URLs for each scope
 * - buildPath() encodes project names (spaces / dots / unicode / slashes)
 * - MENU_KEY_TO_SCOPE_FEATURE covers every VALID_MENU_KEYS entry
 */
import { VALID_MENU_KEYS } from '../hooks/useWebUIMenuItems';
import { buildPath, MENU_KEY_TO_SCOPE_FEATURE } from './pathBuilder';

describe('buildPath', () => {
  it('builds admin paths without a project name', () => {
    expect(buildPath('admin', 'session')).toBe('/admin/session');
    expect(buildPath('admin', 'users')).toBe('/admin/users');
    expect(buildPath('admin', 'reservoir')).toBe('/admin/reservoir');
  });

  it('ignores the project name for admin scope', () => {
    expect(buildPath('admin', 'data', 'my-project')).toBe('/admin/data');
  });

  it('builds project paths with the project name', () => {
    expect(buildPath('project', 'session', 'my-project')).toBe(
      '/project/my-project/session',
    );
    expect(buildPath('project', 'deployments', 'alpha')).toBe(
      '/project/alpha/deployments',
    );
  });

  it('builds projectAdmin paths with the /admin/ segment', () => {
    expect(buildPath('projectAdmin', 'session', 'my-project')).toBe(
      '/project/my-project/admin/session',
    );
    expect(buildPath('projectAdmin', 'users', 'alpha')).toBe(
      '/project/alpha/admin/users',
    );
  });

  it('encodes project names with spaces, dots and unicode', () => {
    expect(buildPath('project', 'session', 'my project')).toBe(
      '/project/my%20project/session',
    );
    expect(buildPath('project', 'session', 'my.project.dots')).toBe(
      '/project/my.project.dots/session',
    );
    expect(buildPath('project', 'session', '한글-프로젝트')).toBe(
      `/project/${encodeURIComponent('한글-프로젝트')}/session`,
    );
  });

  it('encodes slashes in project names to avoid path collisions', () => {
    expect(buildPath('project', 'session', 'a/b')).toBe(
      '/project/a%2Fb/session',
    );
  });

  it('produces an empty project segment when name is missing', () => {
    expect(buildPath('project', 'session')).toBe('/project//session');
    expect(buildPath('projectAdmin', 'session', null)).toBe(
      '/project//admin/session',
    );
  });
});

describe('MENU_KEY_TO_SCOPE_FEATURE', () => {
  it('covers every VALID_MENU_KEYS entry', () => {
    const missing = VALID_MENU_KEYS.filter(
      (key) => !(key in MENU_KEY_TO_SCOPE_FEATURE),
    );
    expect(missing).toEqual([]);
  });

  it('maps generalMenu keys to the project scope', () => {
    expect(MENU_KEY_TO_SCOPE_FEATURE['session']).toEqual({
      scope: 'project',
      featureKey: 'session',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['start']).toEqual({
      scope: 'project',
      featureKey: 'start',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['chat']).toEqual({
      scope: 'project',
      featureKey: 'chat',
    });
  });

  it('maps PROJECT_ADMIN keys to the projectAdmin scope', () => {
    expect(MENU_KEY_TO_SCOPE_FEATURE['project-admin-session']).toEqual({
      scope: 'projectAdmin',
      featureKey: 'session',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['project-admin-deployments']).toEqual({
      scope: 'projectAdmin',
      featureKey: 'deployments',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['project-data']).toEqual({
      scope: 'projectAdmin',
      featureKey: 'data',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['project-admin-users']).toEqual({
      scope: 'projectAdmin',
      featureKey: 'users',
    });
  });

  it('maps remaining adminMenu keys to the admin scope', () => {
    expect(MENU_KEY_TO_SCOPE_FEATURE['admin-session']).toEqual({
      scope: 'admin',
      featureKey: 'session',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['credential']).toEqual({
      scope: 'admin',
      featureKey: 'users',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['admin-data']).toEqual({
      scope: 'admin',
      featureKey: 'data',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['reservoir']).toEqual({
      scope: 'admin',
      featureKey: 'reservoir',
    });
    expect(MENU_KEY_TO_SCOPE_FEATURE['project']).toEqual({
      scope: 'admin',
      featureKey: 'project',
    });
  });

  it('maps aliases to the same target as their canonical key', () => {
    expect(MENU_KEY_TO_SCOPE_FEATURE['summary']).toEqual(
      MENU_KEY_TO_SCOPE_FEATURE['dashboard'],
    );
    expect(MENU_KEY_TO_SCOPE_FEATURE['job']).toEqual(
      MENU_KEY_TO_SCOPE_FEATURE['session'],
    );
  });
});
