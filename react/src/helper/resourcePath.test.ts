/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  LIST_PAGES,
  LIST_RESOURCES_WITH_STATUS,
  LIST_RESOURCES_WITHOUT_STATUS,
  resourceLocation,
  resourcePath,
  type DeploymentView,
  type ListResource,
  type ResourceRef,
  type SessionView,
} from './resourcePath';
import {
  RESOURCE_PATH_CASES,
  type ResourcePathCase,
} from './resourcePath.fixture';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const FIXTURE_JSON_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'resourcePath.fixture.json',
);

describe('resourcePath', () => {
  it.each(RESOURCE_PATH_CASES.map((c) => [c.name, c] as const))(
    '%s',
    (_name, testCase: ResourcePathCase) => {
      expect(resourcePath(testCase.ref)).toBe(testCase.expected);
    },
  );

  it('returns no origin and always starts at the site root', () => {
    for (const { ref } of RESOURCE_PATH_CASES) {
      expect(resourcePath(ref)).toMatch(/^\//);
    }
  });
});

describe('resourcePath fixture coverage', () => {
  const refs = RESOURCE_PATH_CASES.map((c) => c.ref);

  it('covers every ResourceRef type', () => {
    const covered = new Set(refs.map((ref) => ref.type));
    expect([...covered].sort()).toEqual([
      'artifact',
      'deployment',
      'list',
      'model_card',
      'role',
      'session',
      'vfolder',
    ]);
  });

  it('covers every session view, plus the omitted-view default', () => {
    const views = new Set(
      refs.filter((ref) => ref.type === 'session').map((ref) => ref.view),
    );
    const expected: Array<SessionView | undefined> = [
      undefined,
      'detail',
      'scheduling_history',
      'container_log',
    ];
    for (const view of expected) {
      expect(views).toContain(view);
    }
  });

  it('covers every deployment view, plus the omitted-view default', () => {
    const views = new Set(
      refs.filter((ref) => ref.type === 'deployment').map((ref) => ref.view),
    );
    const expected: Array<DeploymentView | undefined> = [
      undefined,
      'detail',
      'revisions',
      'access_tokens',
    ];
    for (const view of expected) {
      expect(views).toContain(view);
    }
  });

  it('covers every list resource', () => {
    const covered = new Set(
      refs.filter((ref) => ref.type === 'list').map((ref) => ref.resource),
    );
    const all: ReadonlyArray<ListResource> = [
      ...LIST_RESOURCES_WITH_STATUS,
      ...LIST_RESOURCES_WITHOUT_STATUS,
    ];
    expect([...covered].sort()).toEqual([...all].sort());
  });

  it('exercises the status param of every list resource that has one', () => {
    const covered = new Set(
      refs
        .filter(
          (ref) => ref.type === 'list' && ref.statusCategory !== undefined,
        )
        .map((ref) => (ref.type === 'list' ? ref.resource : '')),
    );
    expect([...covered].sort()).toEqual([...LIST_RESOURCES_WITH_STATUS].sort());
  });
});

describe('resourcePath list encoding', () => {
  it('maps statusCategory onto each page own status param name', () => {
    expect(
      resourcePath({
        type: 'list',
        resource: 'role',
        statusCategory: 'ACTIVE',
      }),
    ).toBe('/admin/rbac?status=ACTIVE');
    expect(
      resourcePath({
        type: 'list',
        resource: 'artifact',
        statusCategory: 'ALIVE',
      }),
    ).toBe('/admin/reservoir?mode=ALIVE');
    expect(
      resourcePath({
        type: 'list',
        resource: 'keypair',
        statusCategory: 'active',
      }),
    ).toBe('/admin/users?tab=credentials&activeType=active');
  });

  it('passes the filter value through verbatim, form-encoded like the pages read it', () => {
    const filter = '{"name":{"contains":"a b&c"}}';
    const path = resourcePath({ type: 'list', resource: 'vfolder', filter });
    // `URLSearchParams` encoding (space -> `+`), which is what nuqs decodes.
    expect(path).toBe(`/data?${new URLSearchParams({ filter }).toString()}`);
    expect(new URL(path, 'https://x').searchParams.get('filter')).toBe(filter);
  });

  it('omits filter and status when they are not given', () => {
    expect(resourcePath({ type: 'list', resource: 'session' })).toBe(
      '/session',
    );
  });

  it('keeps an empty-string filter as an explicit param', () => {
    expect(
      resourcePath({ type: 'list', resource: 'session', filter: '' }),
    ).toBe('/session?filter=');
  });

  it('lists a page and a filter param for every list resource', () => {
    for (const resource of [
      ...LIST_RESOURCES_WITH_STATUS,
      ...LIST_RESOURCES_WITHOUT_STATUS,
    ]) {
      expect(LIST_PAGES[resource].pathname).toMatch(/^\//);
      expect(LIST_PAGES[resource].filterParam).toBeTruthy();
    }
  });
});

describe('resourceLocation', () => {
  it('splits the route so callers can supply a scope-aware pathname', () => {
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

  it('produces the search string the replaced session call sites built by hand', () => {
    // The four rewritten call sites all built exactly this.
    const sessionId = 'e2f0f3a4-0000-4000-8000-000000000000';
    expect(resourceLocation({ type: 'session', id: sessionId }).search).toBe(
      new URLSearchParams({ sessionDetail: sessionId }).toString(),
    );
  });
});

describe('ResourceRef type safety', () => {
  it('rejects detail refs for resources with no detail route', () => {
    const agentDetail: ResourceRef = {
      // @ts-expect-error - agent detail has no URL params yet
      type: 'agent',
      id: 'ag-1',
    };
    const userDetail: ResourceRef = {
      // @ts-expect-error - user detail has no URL params yet
      type: 'user',
      id: 'u-1',
    };
    const keypairDetail: ResourceRef = {
      // @ts-expect-error - keypair detail has no URL params yet
      type: 'keypair',
      id: 'k-1',
    };
    // Runtime behaviour of an unreachable ref is not part of the contract; the
    // compile errors above are the assertion.
    expect([agentDetail, userDetail, keypairDetail]).toHaveLength(3);
  });

  it('rejects a view that belongs to another resource type', () => {
    const badSessionView: ResourceRef = {
      type: 'session',
      id: 's',
      // @ts-expect-error - 'revisions' is a deployment view, not a session view
      view: 'revisions',
    };
    const badDeploymentView: ResourceRef = {
      type: 'deployment',
      id: 'dep-1',
      // @ts-expect-error - 'container_log' is a session view
      view: 'container_log',
    };
    expect([badSessionView, badDeploymentView]).toHaveLength(2);
  });

  it('rejects a status category on a list page that has none', () => {
    const badListStatus: ResourceRef = {
      type: 'list',
      resource: 'model_card',
      // @ts-expect-error - the model store page has no status param
      statusCategory: 'x',
    };
    const badListResource: ResourceRef = {
      type: 'list',
      // @ts-expect-error - 'sessions' is not a list resource
      resource: 'sessions',
    };
    expect([badListStatus, badListResource]).toHaveLength(2);
  });
});

describe('resourcePath.fixture.json', () => {
  it('matches the TypeScript fixture (the CLI reads the JSON for parity)', () => {
    const serialized = `${JSON.stringify(RESOURCE_PATH_CASES, null, 2)}\n`;
    let onDisk: string | null = null;
    try {
      onDisk = readFileSync(FIXTURE_JSON_PATH, 'utf8');
    } catch {
      onDisk = null;
    }
    if (onDisk !== serialized) {
      writeFileSync(FIXTURE_JSON_PATH, serialized);
    }
    expect(onDisk).toBe(serialized);
  });
});
