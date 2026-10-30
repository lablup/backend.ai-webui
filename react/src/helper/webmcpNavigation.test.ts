/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isNavigableMenuKey,
  needsDocumentReload,
  readMainHeading,
  resolveAppPath,
  searchParamsToRecord,
} from './webmcpNavigation';

const ORIGIN = 'https://webui.example.com';

describe('resolveAppPath', () => {
  const resolve = (path: string, project = 'default') =>
    resolveAppPath(path, project, ORIGIN);
  const resolveWithoutProject = (path: string) =>
    resolveAppPath(path, undefined, ORIGIN);

  it('passes scope-aware paths through with search and hash', () => {
    expect(resolve('/project/alpha/session?type=all#x')).toEqual({
      ok: true,
      to: '/project/alpha/session?type=all#x',
    });
    expect(resolve('/admin/users')).toEqual({ ok: true, to: '/admin/users' });
  });

  it('rebases a flat project menu path onto the active project', () => {
    expect(resolve('/session/start?step=2')).toEqual({
      ok: true,
      to: '/project/default/session/start?step=2',
    });
    expect(resolve('/data', 'my project')).toEqual({
      ok: true,
      to: '/project/my%20project/data',
    });
  });

  it('maps flat admin and project-admin menu keys to their scope', () => {
    expect(resolve('/credential')).toEqual({ ok: true, to: '/admin/users' });
    expect(resolve('/project-data')).toEqual({
      ok: true,
      to: '/project/default/admin/data',
    });
    expect(resolve('/project')).toEqual({ ok: true, to: '/admin/project' });
  });

  it('refuses a project page when no project is active', () => {
    expect(resolveWithoutProject('/session')).toMatchObject({
      ok: false,
      code: 'no_project',
    });
    expect(resolveWithoutProject('/credential')).toEqual({
      ok: true,
      to: '/admin/users',
    });
  });

  it.each([
    'https://evil.example.com/project/a/session',
    '//evil.example.com/project/a/session',
    'javascript:alert(1)',
    'session',
    '/\\evil.example.com',
    '/.//evil.example.com/admin/x',
    '/admin/..//evil.example.com',
    '/applauncher?app=jupyter',
    '/interactive-login',
    '/logout',
    '/pipeline',
    '/',
  ])('refuses %s', (path) => {
    expect(resolve(path)).toMatchObject({
      ok: false,
      code: 'path_not_allowed',
    });
  });
});

describe('resolveAppPath login tokens', () => {
  it.each([
    '/admin/users?sToken=abc',
    '/admin/users?stoken=abc',
    '/admin/users?STOKEN=abc',
    '/session?x=1&s%54oken=abc',
  ])('refuses %s', (path) => {
    expect(resolveAppPath(path, 'default', ORIGIN)).toMatchObject({
      ok: false,
      code: 'path_not_allowed',
    });
  });
});

describe('needsDocumentReload', () => {
  const on = (pathname: string, search = '') => ({
    origin: ORIGIN,
    pathname,
    search,
  });

  it('reloads the listed pages when only the search changes', () => {
    expect(needsDocumentReload('/admin/users?tab=x', on('/admin/users'))).toBe(
      true,
    );
    expect(
      needsDocumentReload(
        '/admin/resource-policy?tab=user',
        on('/admin/resource-policy', '?tab=keypair'),
      ),
    ).toBe(true);
  });

  it('ignores a trailing slash on either side', () => {
    expect(needsDocumentReload('/admin/users/?tab=x', on('/admin/users'))).toBe(
      true,
    );
    expect(needsDocumentReload('/admin/users?tab=x', on('/admin/users/'))).toBe(
      true,
    );
  });

  it('leaves every other page to the router', () => {
    expect(
      needsDocumentReload('/project/a/data?filter=y', on('/project/a/data')),
    ).toBe(false);
  });

  it('needs no reload for the same search or another path', () => {
    expect(
      needsDocumentReload('/admin/users?tab=x', on('/admin/users', '?tab=x')),
    ).toBe(false);
    expect(needsDocumentReload('/admin/users', on('/admin/agent'))).toBe(false);
  });
});

describe('isNavigableMenuKey', () => {
  it('accepts route menu keys only', () => {
    expect(isNavigableMenuKey('session')).toBe(true);
    expect(isNavigableMenuKey('admin-session')).toBe(true);
    expect(isNavigableMenuKey('pipeline')).toBe(false);
    expect(isNavigableMenuKey('some-plugin-page')).toBe(false);
    expect(isNavigableMenuKey('constructor')).toBe(false);
  });
});

describe('searchParamsToRecord', () => {
  it('collects repeated keys into arrays', () => {
    expect(searchParamsToRecord('?a=1&b=2&a=3&a=4')).toEqual({
      a: ['1', '3', '4'],
      b: '2',
    });
    expect(searchParamsToRecord('')).toEqual({});
  });

  it('keeps keys named after Object.prototype members', () => {
    expect(
      JSON.parse(
        JSON.stringify(
          searchParamsToRecord('?constructor=x&__proto__=z&toString=y'),
        ),
      ),
    ).toEqual(JSON.parse('{"constructor":"x","__proto__":"z","toString":"y"}'));
  });
});

describe('readMainHeading', () => {
  it('returns the highest-level heading outside the app chrome', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <header><h1>App header</h1></header>
      <nav><h2>Menu</h2></nav>
      <h5>Card title</h5>
      <h3>  Sessions  </h3>
    `;
    expect(readMainHeading(root)).toBe('Sessions');
  });

  it('returns null when there is no heading', () => {
    expect(readMainHeading(document.createElement('div'))).toBeNull();
  });
});
