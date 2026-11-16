/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AppConfigScopeKey, ScopedAppConfigRequest } from './useAppConfig';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode, Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  // BUI's locale module runs `i18n.use(initReactI18next).init()` on import.
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const USER = { type: 'user', id: 'user-1' } as const;
const DOMAIN = { type: 'domain', id: 'domain-1' } as const;
const PUBLIC = { type: 'public' } as const;

// A fresh module per test: the write queue is module state.
const loadHooks = async () => {
  vi.resetModules();
  return import('./useAppConfig');
};
type Hooks = Awaited<ReturnType<typeof loadHooks>>;

type MockEnvironment = ReturnType<typeof createMockEnvironment>;
type Doc = Record<string, unknown>;
/** Per scope: the documents by name (`null`: no fragment), or `'denied'`. */
type ScopeAnswer = Record<string, Doc | null> | 'denied';

const operationsNamed = (environment: MockEnvironment, name: string) =>
  environment.mock
    .getAllOperations()
    .filter((op) => op.request.node.params.name === name);

const waitForOperation = async (environment: MockEnvironment, name: string) => {
  await waitFor(() =>
    expect(operationsNamed(environment, name).length).toBeGreaterThan(0),
  );
  return operationsNamed(environment, name)[0];
};

const wrapperFor = (environment: MockEnvironment) => {
  const RelayWrapper = ({ children }: { children: ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>{children}</Suspense>
    </RelayEnvironmentProvider>
  );
  return RelayWrapper;
};

/** Mounts the hook and answers its one read with `answers`. */
const mountScoped = async (
  request: ScopedAppConfigRequest,
  answers: Partial<Record<AppConfigScopeKey, ScopeAnswer>>,
  hooks?: Hooks,
  environment = createMockEnvironment(),
) => {
  const { useScopedAppConfig } = hooks ?? (await loadHooks());
  const { result } = renderHook(() => useScopedAppConfig(request), {
    wrapper: wrapperFor(environment),
  });
  const read = await waitForOperation(environment, 'useAppConfigScopedQuery');
  const data: Record<string, unknown> = {};
  const errors: Array<{ message: string; path: Array<string> }> = [];
  for (const [key, answer] of Object.entries(answers)) {
    if (answer === 'denied') {
      data[key] = null;
      errors.push({ message: `${key}: denied`, path: [key] });
    } else {
      data[key] = Object.entries(answer).map(([configName, config], index) =>
        config ? { id: `${key}-${index}`, configName, config } : null,
      );
    }
  }
  const payload = { data, ...(errors.length ? { errors } : {}) } as any;
  act(() => {
    environment.mock.resolve(read, payload);
  });
  await waitFor(() => expect(result.current).not.toBeNull());
  // The mount reads the documents once more; answer it the same way.
  const mountRead = await waitForOperation(
    environment,
    'useAppConfigScopedQuery',
  );
  act(() => {
    environment.mock.resolve(mountRead, payload);
  });
  return { environment, result, read };
};

/** Answers the next upsert with the documents it sent, as the manager does. */
const answerUpsert = async (environment: MockEnvironment, id?: string) => {
  const upsert = await waitForOperation(
    environment,
    'useAppConfigUpsertMutation',
  );
  const sent = upsert.request.variables.input;
  act(() => {
    environment.mock.resolve(upsert, {
      data: {
        scopedAtomicBulkUpsertAppConfigFragments: {
          items: sent.items.map(
            (item: { configName: string }, index: number) => ({
              id: id ?? `written-${item.configName}-${index}`,
              ...item,
            }),
          ),
        },
      },
    });
  });
  return sent;
};

describe('useScopedAppConfig', () => {
  it('reads every requested scope in one request and skips the rest', async () => {
    const { read, result } = await mountScoped(
      [
        { scope: DOMAIN, configNames: ['domainConfig'] },
        { scope: PUBLIC, configNames: ['publicConfigByDomain'] },
      ],
      {
        domain: { domainConfig: { settings: { a: 1 } } },
        public: { publicConfigByDomain: { default: { b: 2 } } },
      },
    );
    expect(read.request.variables).toMatchObject({
      domainScope: { scopeType: 'DOMAIN', scopeId: 'domain-1' },
      domainNames: ['domainConfig'],
      skipDomain: false,
      publicScope: { scopeType: 'PUBLIC' },
      skipPublic: false,
      skipUser: true,
    });
    expect(result.current.scopedAppConfig.domain).toEqual({
      domainConfig: { settings: { a: 1 } },
    });
    expect(result.current.scopedAppConfig.public?.publicConfigByDomain).toEqual(
      {
        default: { b: 2 },
      },
    );
    expect(result.current.scopedAppConfig.user).toBeUndefined();
  });

  it('writes one domain slice with a single upsert and keeps other domains', async () => {
    const otherDomain = { appearance: { brand: 'other' } };
    const { environment, result } = await mountScoped(
      { scope: PUBLIC, configNames: ['publicConfigByDomain'] },
      {
        public: {
          publicConfigByDomain: {
            other: otherDomain,
            default: { appearance: { brand: 'old' }, keep: 1 },
          },
        },
      },
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertScopedAppConfig({
        scope: PUBLIC,
        configName: 'publicConfigByDomain',
        subKey: ['default', 'appearance'],
        value: { brand: 'new' },
      });
    });
    const sent = await answerUpsert(environment);
    await act(() => pending);

    expect(sent.scope).toEqual({ scopeType: 'PUBLIC' });
    expect(sent.items).toEqual([
      {
        configName: 'publicConfigByDomain',
        config: {
          other: otherDomain,
          default: { appearance: { brand: 'new' }, keep: 1 },
        },
      },
    ]);
    expect(operationsNamed(environment, 'useAppConfigScopedQuery')).toEqual([]);
    expect(
      result.current.scopedAppConfig.public?.publicConfigByDomain?.default
        .appearance,
    ).toEqual({ brand: 'new' });
  });

  it('applies several changes to one scope in one upsert, in order', async () => {
    const { environment, result } = await mountScoped(
      { scope: USER, configNames: ['userConfig'] },
      {
        user: {
          userConfig: { settings: { debug: true, extra: 1 }, themeFamily: 'x' },
        },
      },
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertScopedAppConfig([
        {
          scope: USER,
          configName: 'userConfig',
          subKey: 'settings',
          value: (current: unknown) => ({
            ...(current as Doc),
            debug: false,
          }),
        },
        {
          scope: USER,
          configName: 'userConfig',
          subKey: 'themeFamily',
          value: undefined,
        },
      ]);
    });
    expect((await answerUpsert(environment)).items).toEqual([
      {
        configName: 'userConfig',
        config: { settings: { debug: false, extra: 1 } },
      },
    ]);
    await act(() => pending);
  });

  it('builds a later write on the earlier one when both are queued', async () => {
    const { environment, result } = await mountScoped(
      { scope: USER, configNames: ['userConfig'] },
      { user: { userConfig: { a: 1 } } },
    );
    let first!: Promise<unknown>;
    let second!: Promise<unknown>;
    act(() => {
      first = result.current.upsertScopedAppConfig({
        scope: USER,
        configName: 'userConfig',
        subKey: 'b',
        value: 2,
      });
      second = result.current.upsertScopedAppConfig({
        scope: USER,
        configName: 'userConfig',
        subKey: 'c',
        value: 3,
      });
    });
    await answerUpsert(environment, 'user-0');
    expect((await answerUpsert(environment, 'user-0')).items[0].config).toEqual(
      { a: 1, b: 2, c: 3 },
    );
    await act(() => Promise.all([first, second]));
  });

  it('links a first write into the read so the next write builds on it', async () => {
    const { environment, result } = await mountScoped(
      { scope: USER, configNames: ['userConfig'] },
      { user: { userConfig: null } },
    );
    expect(result.current.scopedAppConfig.user).toEqual({
      userConfig: undefined,
    });
    let first!: Promise<unknown>;
    act(() => {
      first = result.current.upsertScopedAppConfig({
        scope: USER,
        configName: 'userConfig',
        subKey: 'themeFamily',
        value: 'ocean',
      });
    });
    await answerUpsert(environment, 'created');
    await act(() => first);
    expect(result.current.scopedAppConfig.user?.userConfig).toEqual({
      themeFamily: 'ocean',
    });
  });

  it('follows the fragment the upsert returned when its id changed', async () => {
    const { environment, result } = await mountScoped(
      { scope: USER, configNames: ['userConfig'] },
      { user: { userConfig: { themeFamily: 'ocean' } } },
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertScopedAppConfig({
        scope: USER,
        configName: 'userConfig',
        subKey: 'language',
        value: 'ko',
      });
    });
    await answerUpsert(environment, 'recreated');
    await act(() => pending);
    expect(result.current.scopedAppConfig.user?.userConfig).toEqual({
      themeFamily: 'ocean',
      language: 'ko',
    });
  });

  it('leaves a scope it may not read undefined and refuses to write it', async () => {
    const { environment, result } = await mountScoped(
      [
        { scope: DOMAIN, configNames: ['domainConfig'] },
        { scope: PUBLIC, configNames: ['publicConfigByDomain'] },
      ],
      { domain: 'denied', public: { publicConfigByDomain: { default: {} } } },
    );
    expect(result.current.scopedAppConfig.domain).toBeUndefined();
    expect(result.current.scopedAppConfig.public).toEqual({
      publicConfigByDomain: { default: {} },
    });
    await expect(
      result.current.upsertScopedAppConfig({
        scope: DOMAIN,
        configName: 'domainConfig',
        subKey: 'settings',
        value: {},
      }),
    ).rejects.toThrow('domain could not be read');
    expect(operationsNamed(environment, 'useAppConfigUpsertMutation')).toEqual(
      [],
    );
  });

  it('refuses a change to a name the hook did not request', async () => {
    const { result } = await mountScoped(
      { scope: USER, configNames: ['userConfig'] },
      { user: { userConfig: {} } },
    );
    await expect(
      result.current.upsertScopedAppConfig({
        scope: PUBLIC,
        configName: 'publicConfigByDomain',
        subKey: 'x',
        value: 1,
      }),
    ).rejects.toThrow('public.publicConfigByDomain was not requested');
  });

  it('refetches the merged domainConfig view after a domainConfig write', async () => {
    const { environment, result } = await mountScoped(
      { scope: DOMAIN, configNames: ['domainConfig'] },
      { domain: { domainConfig: { settings: {} } } },
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertScopedAppConfig({
        scope: DOMAIN,
        configName: 'domainConfig',
        subKey: ['settings', 'announcement'],
        value: { title: 'hi' },
      });
    });
    await answerUpsert(environment);
    await act(() => pending);
    const merged = await waitForOperation(
      environment,
      'useAppConfigMergedQuery',
    );
    expect(merged.request.variables.configNames).toEqual(['domainConfig']);
  });

  it('reads the documents again when another reader mounts on the stored copy', async () => {
    const hooks = await loadHooks();
    const { environment } = await mountScoped(
      { scope: USER, configNames: ['userConfig'] },
      { user: { userConfig: { themeFamily: 'ocean' } } },
      hooks,
    );
    const second = renderHook(
      () =>
        hooks.useScopedAppConfig({ scope: USER, configNames: ['userConfig'] }),
      { wrapper: wrapperFor(environment) },
    );
    expect(second.result.current.scopedAppConfig.user?.userConfig).toEqual({
      themeFamily: 'ocean',
    });
    await waitForOperation(environment, 'useAppConfigScopedQuery');
  });

  it('sends a mount read only after the writes queued on its scope settle', async () => {
    const hooks = await loadHooks();
    const { environment, result } = await mountScoped(
      { scope: USER, configNames: ['userConfig'] },
      { user: { userConfig: { a: 1 } } },
      hooks,
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertScopedAppConfig({
        scope: USER,
        configName: 'userConfig',
        subKey: 'b',
        value: 2,
      });
    });
    await waitForOperation(environment, 'useAppConfigUpsertMutation');
    renderHook(
      () =>
        hooks.useScopedAppConfig({ scope: USER, configNames: ['userConfig'] }),
      { wrapper: wrapperFor(environment) },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(operationsNamed(environment, 'useAppConfigScopedQuery')).toEqual([]);

    await answerUpsert(environment, 'user-0');
    await act(() => pending);
    await waitForOperation(environment, 'useAppConfigScopedQuery');
  });

  it('rejects requesting one scope type twice', async () => {
    const { useScopedAppConfig } = await loadHooks();
    const environment = createMockEnvironment();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renderHook(
        () =>
          useScopedAppConfig([
            { scope: USER, configNames: ['userConfig'] },
            {
              scope: { type: 'user', id: 'user-2' },
              configNames: ['userConfig'],
            },
          ]),
        { wrapper: wrapperFor(environment) },
      ),
    ).toThrow('user was requested twice');
    spy.mockRestore();
  });

  it('passes the given ids as scope ids and refuses a change to another id', async () => {
    const { read, result } = await mountScoped(
      { scope: { type: 'user', id: 'user-9' }, configNames: ['userConfig'] },
      { user: { userConfig: {} } },
    );
    expect(read.request.variables.userScope).toEqual({
      scopeType: 'USER',
      scopeId: 'user-9',
    });
    await expect(
      result.current.upsertScopedAppConfig({
        scope: USER,
        configName: 'userConfig',
        subKey: 'x',
        value: 1,
      }),
    ).rejects.toThrow('user.userConfig was not requested');
  });

  it('resolves with the documents it wrote, by scope type', async () => {
    const { environment, result } = await mountScoped(
      { scope: DOMAIN, configNames: ['domainConfig'] },
      { domain: { domainConfig: { settings: { a: 1 } } } },
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertScopedAppConfig({
        scope: DOMAIN,
        configName: 'domainConfig',
        subKey: ['settings', 'b'],
        value: 2,
      });
    });
    await answerUpsert(environment);
    await expect(pending).resolves.toEqual({
      domain: { domainConfig: { settings: { a: 1, b: 2 } } },
    });
  });

  it('sends nothing when any change of a multi-scope upsert is refused', async () => {
    const { environment, result } = await mountScoped(
      [
        { scope: DOMAIN, configNames: ['domainConfig'] },
        { scope: PUBLIC, configNames: ['publicConfigByDomain'] },
      ],
      {
        domain: { domainConfig: {} },
        public: { publicConfigByDomain: {} },
      },
    );
    await expect(
      result.current.upsertScopedAppConfig([
        {
          scope: PUBLIC,
          configName: 'publicConfigByDomain',
          subKey: 'x',
          value: 1,
        },
        {
          scope: { type: 'domain', id: 'domain-2' },
          configName: 'domainConfig',
          subKey: 'y',
          value: 2,
        },
      ]),
    ).rejects.toThrow('domain.domainConfig was not requested');
    expect(operationsNamed(environment, 'useAppConfigUpsertMutation')).toEqual(
      [],
    );
  });

  it('rejects with the server message when the write fails', async () => {
    const { environment, result } = await mountScoped(
      { scope: PUBLIC, configNames: ['publicConfigByDomain'] },
      { public: { publicConfigByDomain: {} } },
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertScopedAppConfig({
        scope: PUBLIC,
        configName: 'publicConfigByDomain',
        subKey: ['default', 'appearance'],
        value: {},
      });
    });
    const upsert = await waitForOperation(
      environment,
      'useAppConfigUpsertMutation',
    );
    act(() => {
      environment.mock.resolve(upsert, {
        data: null,
        errors: [{ message: 'publicConfigByDomain: not allowed' }],
      } as any);
    });
    await expect(pending).rejects.toThrow('publicConfigByDomain: not allowed');
  });
});

/** Mounts the own-user hook and answers its read with `docs` (`null`: no fragment). */
const mountMine = async (
  docs: Record<string, Doc | null>,
  environment = createMockEnvironment(),
) => {
  const { useMyAppConfigFragments } = await loadHooks();
  const names = Object.keys(docs) as Array<'userConfig'>;
  const { result } = renderHook(() => useMyAppConfigFragments(names), {
    wrapper: wrapperFor(environment),
  });
  const payload = {
    data: {
      myAppConfigFragmentsByNames: Object.entries(docs).map(
        ([configName, config], index) =>
          config ? { id: `mine-${index}`, configName, config } : null,
      ),
    },
  } as any;
  for (let i = 0; i < 2; i++) {
    // The suspending read, then the mount read.
    const read = await waitForOperation(
      environment,
      'useAppConfigMyFragmentsQuery',
    );
    act(() => {
      environment.mock.resolve(read, payload);
    });
  }
  await waitFor(() => expect(result.current).not.toBeNull());
  return { environment, result };
};

const answerMyUpsert = async (environment: MockEnvironment, id: string) => {
  const upsert = await waitForOperation(
    environment,
    'useAppConfigMyUpsertMutation',
  );
  const sent = upsert.request.variables.input;
  act(() => {
    environment.mock.resolve(upsert, {
      data: {
        myAtomicBulkUpsertAppConfigFragments: {
          items: sent.items.map((item: { configName: string }) => ({
            id,
            ...item,
          })),
        },
      },
    });
  });
  return sent;
};

describe('useMyAppConfigFragments', () => {
  it('reads the own USER documents and writes them through the my* mutation', async () => {
    const { environment, result } = await mountMine({
      userConfig: { themeFamily: 'ocean', dashboard: { a: 1 } },
    });
    expect(result.current.myAppConfigFragments.userConfig).toEqual({
      themeFamily: 'ocean',
      dashboard: { a: 1 },
    });
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.upsertMyAppConfigFragments({
        configName: 'userConfig',
        subKey: ['dashboard', 'b'],
        value: 2,
      });
    });
    const sent = await answerMyUpsert(environment, 'mine-0');
    expect(sent).toEqual({
      items: [
        {
          configName: 'userConfig',
          config: { themeFamily: 'ocean', dashboard: { a: 1, b: 2 } },
        },
      ],
    });
    await expect(pending).resolves.toEqual({
      userConfig: { themeFamily: 'ocean', dashboard: { a: 1, b: 2 } },
    });
    expect(operationsNamed(environment, 'useAppConfigUpsertMutation')).toEqual(
      [],
    );
  });

  it('links a first write into the read so the next write builds on it', async () => {
    const { environment, result } = await mountMine({ userConfig: null });
    expect(result.current.myAppConfigFragments).toEqual({
      userConfig: undefined,
    });
    let first!: Promise<unknown>;
    act(() => {
      first = result.current.upsertMyAppConfigFragments({
        configName: 'userConfig',
        subKey: 'themeFamily',
        value: 'ocean',
      });
    });
    await answerMyUpsert(environment, 'created');
    await act(() => first);
    expect(result.current.myAppConfigFragments.userConfig).toEqual({
      themeFamily: 'ocean',
    });
    let second!: Promise<unknown>;
    act(() => {
      second = result.current.upsertMyAppConfigFragments({
        configName: 'userConfig',
        subKey: 'language',
        value: 'ko',
      });
    });
    expect(
      (await answerMyUpsert(environment, 'created')).items[0].config,
    ).toEqual({ themeFamily: 'ocean', language: 'ko' });
    await act(() => second);
  });

  it('refuses a change to a name the hook did not request', async () => {
    const { result } = await mountMine({ userConfig: {} });
    await expect(
      result.current.upsertMyAppConfigFragments({
        configName: 'domainConfig',
        subKey: 'x',
        value: 1,
      }),
    ).rejects.toThrow('domainConfig was not requested');
  });
});

describe('useMyAppConfig', () => {
  it('reads one name per request and returns the requested slice', async () => {
    const { useMyAppConfig } = await loadHooks();
    const environment = createMockEnvironment();
    const { result } = renderHook(
      () =>
        useMyAppConfig('publicConfigByDomain', [
          'default',
          'dashboardTemplates',
        ]),
      { wrapper: wrapperFor(environment) },
    );
    const read = await waitForOperation(environment, 'useAppConfigMergedQuery');
    expect(read.request.variables.configNames).toEqual([
      'publicConfigByDomain',
    ]);
    act(() => {
      environment.mock.resolve(read, {
        data: {
          myAppConfigs: [
            {
              configName: 'publicConfigByDomain',
              config: {
                other: { dashboardTemplates: { a: 1 } },
                default: { dashboardTemplates: { b: 2 } },
              },
            },
          ],
        },
      });
    });
    await waitFor(() => expect(result.current).toEqual({ b: 2 }));
  });
});
