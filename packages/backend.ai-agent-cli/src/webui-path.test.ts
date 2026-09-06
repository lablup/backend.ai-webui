import type { ResourceRef, RouteAccess } from './webui-path.js';
import {
  LIST_PAGES,
  listAccess,
  listPath,
  resourceAccess,
  resourceLocation,
  resourcePath,
  webuiUrl,
} from './webui-path.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface ParityCase {
  name: string;
  ref: ResourceRef;
  expected: string;
  /** The `handle.access` the destination route declares (`routes.tsx`). */
  access: RouteAccess;
}

/**
 * Expected paths per resource ref, checked by hand against the WebUI routes.
 * Update the fixture only when the app's URL scheme changes.
 */
const CASES: ParityCase[] = JSON.parse(
  readFileSync(join(import.meta.dirname, 'webui-path.fixture.json'), 'utf8'),
) as ParityCase[];

describe('webui-path against the WebUI URL scheme', () => {
  it('reads a non-empty fixture', () => {
    expect(CASES.length).toBeGreaterThan(30);
  });

  it.each(CASES.map((one) => [one.name, one] as const))(
    '%s',
    (_name, parityCase) => {
      expect(resourcePath(parityCase.ref)).toBe(parityCase.expected);
      expect(resourceAccess(parityCase.ref)).toBe(parityCase.access);
    },
  );

  it('covers every ResourceRef member', () => {
    const types = new Set(CASES.map((one) => one.ref.type));
    expect([...types].sort()).toEqual([
      'artifact',
      'deployment',
      'list',
      'model_card',
      'role',
      'session',
      'vfolder',
    ]);
  });
});

describe('resourceLocation', () => {
  it('splits path, search and hash', () => {
    expect(resourceLocation({ type: 'session', id: 'sess-1' })).toEqual({
      pathname: '/session',
      search: 'sessionDetail=sess-1',
      hash: '',
    });
    expect(
      resourceLocation({ type: 'deployment', id: 'dep-1', view: 'revisions' }),
    ).toEqual({
      pathname: '/deployments/dep-1',
      search: '',
      hash: '#revisions',
    });
  });
});

describe('listPath', () => {
  it('returns the bare list page, tab params included', () => {
    expect(listPath('session')).toBe('/session');
    expect(listPath('vfolder')).toBe('/data');
    expect(listPath('keypair')).toBe('/admin/users?tab=credentials');
    expect(listPath('user')).toBe('/admin/users?tab=users');
    expect(listPath('agent')).toBe('/admin/agent?tab=agents');
    expect(listPath('project')).toBe('/admin/project');
    expect(listPath('resource_preset')).toBe('/admin/environment?tab=preset');
    expect(listPath('resource_group')).toBe('/admin/agent?tab=resourceGroup');
    expect(listPath('my_environment')).toBe('/my-environment');
  });
});

describe('list page access', () => {
  it('marks each list page with the access its route declares', () => {
    // The `/admin/*` subtree default, and the leaves that raise it to
    // superadmin (`routes.tsx` — agent, project and rbac carry their own
    // `access: 'superadmin'` handle).
    expect(listAccess('user')).toBe('admin');
    expect(listAccess('keypair')).toBe('admin');
    expect(listAccess('environment')).toBe('admin');
    expect(listAccess('resource_preset')).toBe('admin');
    expect(listAccess('artifact')).toBe('admin');
    expect(listAccess('agent')).toBe('superadmin');
    expect(listAccess('resource_group')).toBe('superadmin');
    expect(listAccess('project')).toBe('superadmin');
    expect(listAccess('role')).toBe('superadmin');
    // Project-scope pages declare no `access` handle at all.
    expect(listAccess('session')).toBe('user');
    expect(listAccess('deployment')).toBe('user');
    expect(listAccess('vfolder')).toBe('user');
    expect(listAccess('model_card')).toBe('user');
    expect(listAccess('my_environment')).toBe('user');
  });

  it('gives every `/admin/` page a non-user access marker', () => {
    for (const [resource, spec] of Object.entries(LIST_PAGES)) {
      expect([resource, spec.pathname.startsWith('/admin/')]).toEqual([
        resource,
        spec.access === 'admin' || spec.access === 'superadmin',
      ]);
    }
  });
});

describe('webuiUrl', () => {
  it('joins an origin and a path without doubling the slash', () => {
    expect(webuiUrl('https://ui.example.com', '/session?x=1')).toBe(
      'https://ui.example.com/session?x=1',
    );
    expect(webuiUrl('https://ui.example.com/', '/data')).toBe(
      'https://ui.example.com/data',
    );
  });
});
