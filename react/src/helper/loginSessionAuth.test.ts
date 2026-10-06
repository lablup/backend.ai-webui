/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RelayEnvironment } from '../RelayEnvironment';
import myUserQueryNode from '../__generated__/loginSessionAuthMyUserQuery.graphql';
import { getDefaultLoginConfig } from './loginConfig';
import {
  LoginProbeCancelledError,
  connectViaGQL,
  escapeLoginProbe,
  probeManager,
} from './loginSessionAuth';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useWebUIConfig', () => ({
  fetchAndParseConfig: vi.fn(),
}));
vi.mock('../RelayEnvironment', async () => {
  const { createMockEnvironment } = await import('relay-test-utils');
  return { RelayEnvironment: createMockEnvironment() };
});

const environment = RelayEnvironment as unknown as RelayMockEnvironment;

const globalId = (typeName: string, uuid: string) =>
  btoa(`${typeName}:${uuid}`);

const USER_UUID = '11111111-1111-4111-8111-111111111111';
const DOMAIN_UUID = '22222222-2222-4222-8222-222222222222';
const PROJECT_A = '33333333-3333-4333-8333-333333333333';
const PROJECT_B = '44444444-4444-4444-8444-444444444444';

type Edges = Array<{ node: { id: string; basicInfo: { name: string } } }>;

const edges = (nodes: Array<[string, string]>): Edges =>
  nodes.map(([uuid, name]) => ({
    node: { id: globalId('ProjectV2', uuid), basicInfo: { name } },
  }));

const meWith = (
  projects: {
    recent?: Array<[string, string]>;
    default?: Array<[string, string]>;
  } = {},
  overrides: Partial<{
    role: string | null;
    domainName: string | null;
    domain: { entityId: string; basicInfo: { name: string } } | null;
  }> = {},
) => ({
  myUserV2: {
    id: globalId('UserV2', USER_UUID),
    basicInfo: { email: 'me@example.com', fullName: 'Me' },
    organization: {
      domainName: 'domainName' in overrides ? overrides.domainName : 'default',
      role: 'role' in overrides ? overrides.role : 'ADMIN',
    },
    domain:
      'domain' in overrides
        ? overrides.domain
        : { entityId: DOMAIN_UUID, basicInfo: { name: 'default' } },
    recentProject: projects.recent ? { edges: edges(projects.recent) } : null,
    defaultProject: { edges: edges(projects.default ?? []) },
  },
});

// Queues one Relay payload per page and records the variables each was asked for.
const queueResponses = (responses: Array<unknown>) => {
  const variables: Array<Record<string, unknown>> = [];
  responses.forEach((data) =>
    environment.mock.queueOperationResolver((operation) => {
      variables.push(operation.request.variables);
      return { data } as any;
    }),
  );
  return variables;
};

// Mirrors global-stores: the remembered name survives only if `groups` lists it.
const fakeUtils = (remembered: string | null) => ({
  _peekRecentProjectGroup: vi.fn(() => remembered),
  _readRecentProjectGroup: vi.fn(() => {
    const { groups, current_group } = (globalThis as any).backendaiclient;
    return remembered && groups.includes(remembered)
      ? remembered
      : current_group;
  }),
});

const makeClient = () => ({
  logout: vi.fn().mockResolvedValue(undefined),
  _config: { endpoint: 'https://api.example.com', endpointHost: 'api' },
});

describe('connectViaGQL', () => {
  const g = globalThis as any;
  const cfg = getDefaultLoginConfig();

  beforeEach(() => {
    g.backendaioptions = { get: vi.fn(() => null), set: vi.fn() };
    g.backendaiutils = fakeUtils(null);
    g.backendaiclient = undefined;
  });

  afterEach(() => {
    delete g.backendaioptions;
    delete g.backendaiutils;
    delete g.backendaiclient;
  });

  test('stores the user, the default project, and the domain name + uuid from one myUserV2 read', async () => {
    const variables = queueResponses([
      meWith({ default: [[PROJECT_A, 'alpha']] }),
    ]);

    await connectViaGQL(makeClient(), cfg, []);

    expect(variables).toEqual([
      { recentProjectName: '', hasRecentProject: false },
    ]);

    expect(g.backendaiclient.email).toBe('me@example.com');
    expect(g.backendaiclient.full_name).toBe('Me');
    expect(g.backendaiclient.user_uuid).toBe(USER_UUID);
    expect(g.backendaiclient.is_admin).toBe(true);
    expect(g.backendaiclient.is_superadmin).toBe(false);

    expect(g.backendaiclient.groups).toEqual(['alpha']);
    expect(g.backendaiclient.groupIds).toEqual({ alpha: PROJECT_A });
    expect(g.backendaiclient.current_group).toBe('alpha');
    expect(g.backendaiclient.current_group_id()).toBe(PROJECT_A);

    expect(g.backendaiclient._config.domainName).toBe('default');
    expect(g.backendaiclient._config.domainId).toBe(DOMAIN_UUID);
  });

  test('asks only for GENERAL projects, the default one by name', () => {
    const text = (myUserQueryNode as any).params.text as string;
    expect(text.match(/type: \{equals: GENERAL\}/g)).toHaveLength(2);
    expect(text).toContain('orderBy: [{field: NAME, direction: ASC}]');
  });

  test.each([
    ['SUPERADMIN', true, true],
    ['ADMIN', true, false],
    ['USER', false, false],
    ['MONITOR', false, false],
    [null, false, false],
  ])(
    'maps role %s to is_admin=%s / is_superadmin=%s',
    async (role, isAdmin, isSuperadmin) => {
      queueResponses([meWith({}, { role })]);

      await connectViaGQL(makeClient(), cfg, []);

      expect(g.backendaiclient.is_admin).toBe(isAdmin);
      expect(g.backendaiclient.is_superadmin).toBe(isSuperadmin);
    },
  );

  test('falls back to the domain node name and an empty uuid when the organization has none', async () => {
    queueResponses([
      meWith(
        {},
        {
          domainName: null,
          domain: { entityId: DOMAIN_UUID, basicInfo: { name: 'from-node' } },
        },
      ),
    ]);

    await connectViaGQL(makeClient(), cfg, []);
    expect(g.backendaiclient._config.domainName).toBe('from-node');
    expect(g.backendaiclient._config.domainId).toBe(DOMAIN_UUID);

    queueResponses([meWith({}, { domainName: null, domain: null })]);
    await connectViaGQL(makeClient(), cfg, []);
    expect(g.backendaiclient._config.domainName).toBe('');
    expect(g.backendaiclient._config.domainId).toBe('');
  });

  test('keeps the remembered project when it is still a GENERAL project of the user', async () => {
    g.backendaiutils = fakeUtils('zeta');
    const variables = queueResponses([
      meWith({
        recent: [[PROJECT_B, 'zeta']],
        default: [[PROJECT_A, 'alpha']],
      }),
    ]);

    await connectViaGQL(makeClient(), cfg, []);

    expect(variables).toEqual([
      { recentProjectName: 'zeta', hasRecentProject: true },
    ]);
    expect(g.backendaiclient.current_group).toBe('zeta');
    expect(g.backendaiclient.current_group_id()).toBe(PROJECT_B);
  });

  test('falls back to the default project when the remembered one is gone', async () => {
    g.backendaiutils = fakeUtils('model-store');
    queueResponses([meWith({ recent: [], default: [[PROJECT_A, 'alpha']] })]);

    await connectViaGQL(makeClient(), cfg, []);

    expect(g.backendaiclient.groups).toEqual(['alpha']);
    expect(g.backendaiclient.current_group).toBe('alpha');
    expect(g.backendaiclient.current_group_id()).toBe(PROJECT_A);
  });

  test('lists a remembered project that is also the default once', async () => {
    g.backendaiutils = fakeUtils('alpha');
    queueResponses([
      meWith({
        recent: [[PROJECT_A, 'alpha']],
        default: [[PROJECT_A, 'alpha']],
      }),
    ]);

    await connectViaGQL(makeClient(), cfg, []);

    expect(g.backendaiclient.groups).toEqual(['alpha']);
    expect(g.backendaiclient.current_group).toBe('alpha');
  });

  test('logs out and throws when the session has no user', async () => {
    queueResponses([{ myUserV2: null }]);
    const client = makeClient();

    await expect(connectViaGQL(client, cfg, [])).rejects.toThrow(
      'User information is missing.',
    );
    expect(client.logout).toHaveBeenCalledTimes(1);
  });

  test('records the endpoint in the history, keeping the five most recent', async () => {
    queueResponses([meWith()]);
    const history = ['e1', 'e2', 'e3', 'e4', 'e5'];

    const updated = await connectViaGQL(makeClient(), cfg, history);

    expect(updated).toEqual([
      'e2',
      'e3',
      'e4',
      'e5',
      'https://api.example.com',
    ]);
    expect(g.backendaioptions.set).toHaveBeenCalledWith('endpoints', updated);
  });
});

// A manager that never answers: the request settles only when its signal is
// aborted, the way `fetch` behaves against a black-holed endpoint.
function makeHangingClient() {
  return {
    requestTimeout: 30_000,
    get_manager_version: vi.fn(
      (signal: AbortSignal) =>
        new Promise((_, reject) => {
          signal.addEventListener('abort', () =>
            reject(new Error('sending request has failed: AbortError')),
          );
        }),
    ),
  };
}

describe('probeManager (dev build)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves when the manager answers', async () => {
    const client = {
      requestTimeout: 30_000,
      get_manager_version: vi.fn().mockResolvedValue('26.9.0'),
    };
    await expect(probeManager(client)).resolves.toBeUndefined();
    expect(escapeLoginProbe()).toBe(false);
  });

  it('keeps the client-wide deadline and rejects with the request error', async () => {
    const client = makeHangingClient();
    const settled = probeManager(client).then(
      () => 'resolved',
      (err: unknown) => err,
    );
    await vi.advanceTimersByTimeAsync(client.requestTimeout - 1);
    expect(escapeLoginProbe()).toBe(true); // still in flight — and abort it
    expect(await settled).toBeInstanceOf(LoginProbeCancelledError);
  });

  it('times out with the request error, not the escape error', async () => {
    const client = makeHangingClient();
    const settled = probeManager(client).then(
      () => 'resolved',
      (err: unknown) => err,
    );
    await vi.advanceTimersByTimeAsync(client.requestTimeout);
    const err = await settled;
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(LoginProbeCancelledError);
    expect(escapeLoginProbe()).toBe(false);
  });
});

describe('connectViaGQL — myUserV2 query rejects (FR-3998)', () => {
  const g = globalThis as any;
  const cfg = getDefaultLoginConfig();

  beforeEach(() => {
    g.backendaiutils = fakeUtils(null);
  });

  afterEach(() => {
    delete g.backendaiclient;
    delete g.backendaiutils;
  });

  // The Relay network layer rethrows a 401 as an `AuthorizationError`.
  const authError = () =>
    Object.assign(new Error('GraphQL Authorization Error'), {
      name: 'AuthorizationError',
    });
  const statusError = (statusCode: number) =>
    Object.assign(new Error(`status ${statusCode}`), {
      isError: true,
      statusCode,
    });
  const rejectWith = (error: Error) =>
    environment.mock.queueOperationResolver(() => error);

  it.each([
    ['a 401 refusal', authError()],
    ['a 403 refusal', statusError(403)],
  ])('logs out and rethrows %s unchanged', async (_, refusal) => {
    rejectWith(refusal);
    const client = makeClient();

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(client.logout).toHaveBeenCalledTimes(1);
  });

  it('rethrows the refusal when the cleanup logout also rejects', async () => {
    const refusal = authError();
    rejectWith(refusal);
    const client = {
      ...makeClient(),
      logout: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
    };

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
  });

  it('keeps the session when the query fails without a refusal', async () => {
    const timeout = statusError(408);
    rejectWith(timeout);
    const client = makeClient();

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(timeout);
    expect(client.logout).not.toHaveBeenCalled();
  });
});

describe('connectViaGQL — act-as tab (FR-4111)', () => {
  const g = globalThis as any;
  const cfg = getDefaultLoginConfig();

  beforeEach(() => {
    g.backendaiutils = fakeUtils(null);
    g.backendaioptions = { set: vi.fn() };
  });

  afterEach(() => {
    delete g.backendaiclient;
    delete g.backendaiutils;
    delete g.backendaioptions;
  });

  const refusal = Object.assign(new Error('GraphQL Authorization Error'), {
    name: 'AuthorizationError',
  });
  const actAsClient = (query = vi.fn()) => ({
    ...makeClient(),
    actAsUserId: 'target-uuid',
    query,
  });

  it('never logs out the shared session on a refusal', async () => {
    environment.mock.queueOperationResolver(() => refusal);
    const client = actAsClient();

    await expect(connectViaGQL(client, cfg, [])).rejects.toBe(refusal);
    expect(client.logout).not.toHaveBeenCalled();
  });

  it('never logs out the shared session when the user is missing', async () => {
    queueResponses([{ myUserV2: null }]);
    const client = actAsClient();

    await expect(connectViaGQL(client, cfg, [])).rejects.toThrow(
      'User information is missing.',
    );
    expect(client.logout).not.toHaveBeenCalled();
  });

  it("adopts the target's access key over the webserver session's", async () => {
    queueResponses([meWith({ default: [[PROJECT_A, 'alpha']] })]);
    const client = actAsClient(
      vi.fn().mockResolvedValue({ keypair: { access_key: 'TARGET_KEY' } }),
    );
    (client._config as Record<string, unknown>)._accessKey = 'ADMIN_KEY';

    await connectViaGQL(client, cfg, []);
    expect((client._config as Record<string, unknown>)._accessKey).toBe(
      'TARGET_KEY',
    );
  });

  it('keeps the session access key outside act-as', async () => {
    queueResponses([meWith({ default: [[PROJECT_A, 'alpha']] })]);
    const client = { ...makeClient(), query: vi.fn() };

    await connectViaGQL(client, cfg, []);
    expect(client.query).not.toHaveBeenCalled();
  });
});
