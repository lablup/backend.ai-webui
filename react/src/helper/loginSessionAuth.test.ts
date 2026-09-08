/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RelayEnvironment } from '../RelayEnvironment';
import { getDefaultLoginConfig } from './loginConfig';
import { connectViaGQL } from './loginSessionAuth';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

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

type Page = {
  edges: Array<{ node: { id: string; basicInfo: { name: string } } }>;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const meWith = (
  projects: Page,
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
    projects,
  },
});

const singlePage = (
  nodes: Array<[string, string]>,
  hasNextPage = false,
  endCursor: string | null = null,
): Page => ({
  edges: nodes.map(([uuid, name]) => ({
    node: { id: globalId('ProjectV2', uuid), basicInfo: { name } },
  })),
  pageInfo: { hasNextPage, endCursor },
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

const makeClient = () => ({
  logout: vi.fn().mockResolvedValue(undefined),
  _config: { endpoint: 'https://api.example.com', endpointHost: 'api' },
});

describe('connectViaGQL', () => {
  const g = globalThis as any;
  const cfg = getDefaultLoginConfig();

  beforeEach(() => {
    g.backendaioptions = { get: vi.fn(() => null), set: vi.fn() };
    g.backendaiutils = { _readRecentProjectGroup: vi.fn(() => null) };
    g.backendaiclient = undefined;
  });

  afterEach(() => {
    delete g.backendaioptions;
    delete g.backendaiutils;
    delete g.backendaiclient;
  });

  test('stores the user, projects, and the domain name + uuid from one myUserV2 read', async () => {
    const variables = queueResponses([
      meWith(
        singlePage([
          [PROJECT_B, 'zeta'],
          [PROJECT_A, 'alpha'],
        ]),
      ),
    ]);

    await connectViaGQL(makeClient(), cfg, []);

    expect(variables).toEqual([{ first: 100, after: null }]);

    expect(g.backendaiclient.email).toBe('me@example.com');
    expect(g.backendaiclient.full_name).toBe('Me');
    expect(g.backendaiclient.user_uuid).toBe(USER_UUID);
    expect(g.backendaiclient.is_admin).toBe(true);
    expect(g.backendaiclient.is_superadmin).toBe(false);

    expect(g.backendaiclient.groups).toEqual(['alpha', 'zeta']);
    expect(g.backendaiclient.groupIds).toEqual({
      alpha: PROJECT_A,
      zeta: PROJECT_B,
    });
    expect(g.backendaiclient.current_group).toBe('alpha');
    expect(g.backendaiclient.current_group_id()).toBe(PROJECT_A);

    expect(g.backendaiclient._config.domainName).toBe('default');
    expect(g.backendaiclient._config.domainId).toBe(DOMAIN_UUID);
  });

  test('walks the project cursor past the first page', async () => {
    const variables = queueResponses([
      meWith(singlePage([[PROJECT_A, 'alpha']], true, 'cursor-1')),
      meWith(singlePage([[PROJECT_B, 'beta']])),
    ]);

    await connectViaGQL(makeClient(), cfg, []);

    expect(variables).toEqual([
      { first: 100, after: null },
      { first: 100, after: 'cursor-1' },
    ]);
    expect(g.backendaiclient.groups).toEqual(['alpha', 'beta']);
    expect(g.backendaiclient.groupIds).toEqual({
      alpha: PROJECT_A,
      beta: PROJECT_B,
    });
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
      queueResponses([meWith(singlePage([]), { role })]);

      await connectViaGQL(makeClient(), cfg, []);

      expect(g.backendaiclient.is_admin).toBe(isAdmin);
      expect(g.backendaiclient.is_superadmin).toBe(isSuperadmin);
    },
  );

  test('falls back to the domain node name and an empty uuid when the organization has none', async () => {
    queueResponses([
      meWith(singlePage([]), {
        domainName: null,
        domain: { entityId: DOMAIN_UUID, basicInfo: { name: 'from-node' } },
      }),
    ]);

    await connectViaGQL(makeClient(), cfg, []);
    expect(g.backendaiclient._config.domainName).toBe('from-node');
    expect(g.backendaiclient._config.domainId).toBe(DOMAIN_UUID);

    queueResponses([
      meWith(singlePage([]), { domainName: null, domain: null }),
    ]);
    await connectViaGQL(makeClient(), cfg, []);
    expect(g.backendaiclient._config.domainName).toBe('');
    expect(g.backendaiclient._config.domainId).toBe('');
  });

  test('keeps the remembered project when it is still one of the user projects', async () => {
    g.backendaiutils._readRecentProjectGroup = vi.fn(() => 'zeta');
    queueResponses([
      meWith(
        singlePage([
          [PROJECT_A, 'alpha'],
          [PROJECT_B, 'zeta'],
        ]),
      ),
    ]);

    await connectViaGQL(makeClient(), cfg, []);

    expect(g.backendaiclient.current_group).toBe('zeta');
    expect(g.backendaiclient.current_group_id()).toBe(PROJECT_B);
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
    queueResponses([meWith(singlePage([]))]);
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
