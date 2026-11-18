/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import scopedQueryNode from '../__generated__/useAppConfigScopedQuery.graphql';
import type { AppConfigScope } from './useAppConfig';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { ReactNode, Suspense } from 'react';
import { fetchQuery, RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

vi.mock('./index', () => ({
  useCurrentDomain: () => ({ id: 'domain-1', name: 'default' }),
}));

const DOMAIN = { type: 'domain', id: 'domain-1' } as const;
const OTHER_DOMAIN = { type: 'domain', id: 'domain-2' } as const;
const PUBLIC = { type: 'public' } as const;

// A fresh module per test: the write queue and the atom are module state.
const loadHooks = async () => {
  vi.resetModules();
  return import('./useAppConfig');
};

type MockEnvironment = ReturnType<typeof createMockEnvironment>;
type JotaiStore = ReturnType<typeof createStore>;
type Doc = Record<string, unknown>;

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

const wrapperFor = (environment: MockEnvironment, store: JotaiStore) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={null}>{children}</Suspense>
      </RelayEnvironmentProvider>
    </Provider>
  );
  return Wrapper;
};

const setup = async () => ({
  hooks: await loadHooks(),
  environment: createMockEnvironment(),
  store: createStore(),
});
type Setup = Awaited<ReturnType<typeof setup>>;

/** Mounts `useScopedAppConfig` and answers its read (`'denied'`: a field error). */
const mountScoped = async (
  { hooks, environment, store }: Setup,
  scope: AppConfigScope,
  answer: Record<string, Doc | null> | 'denied',
) => {
  const names = answer === 'denied' ? ['domainConfig'] : Object.keys(answer);
  const { result } = renderHook(
    () => hooks.useScopedAppConfig(scope, names as any),
    { wrapper: wrapperFor(environment, store) },
  );
  const read = await waitForOperation(environment, 'useAppConfigScopedQuery');
  const payload =
    answer === 'denied'
      ? {
          data: { scopedAppConfigFragmentsByNames: null },
          errors: [
            { message: 'denied', path: ['scopedAppConfigFragmentsByNames'] },
          ],
        }
      : {
          data: {
            scopedAppConfigFragmentsByNames: Object.entries(answer).map(
              ([configName, config], index) =>
                config ? { id: `read-${index}`, configName, config } : null,
            ),
          },
        };
  act(() => {
    environment.mock.resolve(read, payload as any);
  });
  await waitFor(() => expect(result.current).not.toBeNull());
  return { result, read };
};

/** Answers the next mutation named `name` with the documents it sent. */
const answerUpsert = async (
  environment: MockEnvironment,
  name: 'useAppConfigUpsertMutation' | 'useAppConfigMyUpsertMutation',
) => {
  const upsert = await waitForOperation(environment, name);
  const sent = upsert.request.variables.input;
  const field =
    name === 'useAppConfigUpsertMutation'
      ? 'scopedAtomicBulkUpsertAppConfigFragments'
      : 'myAtomicBulkUpsertAppConfigFragments';
  act(() => {
    environment.mock.resolve(upsert, {
      data: {
        [field]: {
          items: sent.items.map(
            (item: { configName: string }, index: number) => ({
              id: `written-${item.configName}-${index}`,
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
  it('reads one scope and returns each requested document', async () => {
    const ctx = await setup();
    const { read, result } = await mountScoped(ctx, DOMAIN, {
      domainConfig: { settings: { a: 1 } },
    });
    expect(read.request.variables).toEqual({
      scope: { scopeType: 'DOMAIN', scopeId: 'domain-1' },
      configNames: ['domainConfig'],
    });
    expect(result.current.scopedAppConfig).toEqual({
      domainConfig: { settings: { a: 1 } },
    });
  });

  it('returns undefined for an unreadable scope and refuses to write it', async () => {
    const ctx = await setup();
    const { result } = await mountScoped(ctx, DOMAIN, 'denied');
    expect(result.current.scopedAppConfig).toBeUndefined();
    await expect(
      result.current.upsertScopedAppConfig({
        configName: 'domainConfig',
        subKey: 'settings',
        value: {},
      }),
    ).rejects.toThrow('domain could not be read');
    expect(
      operationsNamed(ctx.environment, 'useAppConfigUpsertMutation'),
    ).toHaveLength(0);
  });

  it('writes on the read document, keeping the other keys', async () => {
    const ctx = await setup();
    const { result } = await mountScoped(ctx, OTHER_DOMAIN, {
      domainConfig: { announcement: { title: 'x' }, settings: { a: 1 } },
    });
    let written: unknown;
    await act(async () => {
      const pending = result.current.upsertScopedAppConfig({
        configName: 'domainConfig',
        subKey: ['settings', 'b'],
        value: (current: unknown) => (current ?? 0) as number,
      });
      const sent = await answerUpsert(
        ctx.environment,
        'useAppConfigUpsertMutation',
      );
      expect(sent).toEqual({
        scope: { scopeType: 'DOMAIN', scopeId: 'domain-2' },
        items: [
          {
            configName: 'domainConfig',
            config: { announcement: { title: 'x' }, settings: { a: 1, b: 0 } },
          },
        ],
      });
      written = await pending;
    });
    expect(written).toEqual({
      domainConfig: {
        announcement: { title: 'x' },
        settings: { a: 1, b: 0 },
      },
    });
    expect(result.current.scopedAppConfig?.domainConfig).toEqual({
      announcement: { title: 'x' },
      settings: { a: 1, b: 0 },
    });
  });

  it('builds a second write on the first one’s response', async () => {
    const ctx = await setup();
    const { result } = await mountScoped(ctx, OTHER_DOMAIN, {
      domainConfig: null,
    });
    await act(async () => {
      const first = result.current.upsertScopedAppConfig({
        configName: 'domainConfig',
        subKey: 'a',
        value: 1,
      });
      const second = result.current.upsertScopedAppConfig({
        configName: 'domainConfig',
        subKey: 'b',
        value: 2,
      });
      await answerUpsert(ctx.environment, 'useAppConfigUpsertMutation');
      await first;
      await waitFor(() =>
        expect(
          operationsNamed(ctx.environment, 'useAppConfigUpsertMutation'),
        ).toHaveLength(1),
      );
      const sent = await answerUpsert(
        ctx.environment,
        'useAppConfigUpsertMutation',
      );
      expect(sent.items[0].config).toEqual({ a: 1, b: 2 });
      await second;
    });
  });

  it('reads again when a read that started during the write lands after it', async () => {
    const ctx = await setup();
    const { result } = await mountScoped(ctx, OTHER_DOMAIN, {
      domainConfig: { a: 0 },
    });
    await act(async () => {
      const pending = result.current.upsertScopedAppConfig({
        configName: 'domainConfig',
        subKey: 'a',
        value: 1,
      });
      await waitForOperation(ctx.environment, 'useAppConfigUpsertMutation');
      // Another reader fetches the same documents while the mutation is in flight.
      fetchQuery(ctx.environment, scopedQueryNode, {
        scope: { scopeType: 'DOMAIN', scopeId: 'domain-2' },
        configNames: ['domainConfig'],
      }).subscribe({});
      const lateRead = await waitForOperation(
        ctx.environment,
        'useAppConfigScopedQuery',
      );
      await answerUpsert(ctx.environment, 'useAppConfigUpsertMutation');
      ctx.environment.mock.resolve(lateRead, {
        data: {
          scopedAppConfigFragmentsByNames: [
            { id: 'read-0', configName: 'domainConfig', config: { a: 0 } },
          ],
        },
      });
      const again = await waitForOperation(
        ctx.environment,
        'useAppConfigScopedQuery',
      );
      ctx.environment.mock.resolve(again, {
        data: {
          scopedAppConfigFragmentsByNames: [
            { id: 'read-0', configName: 'domainConfig', config: { a: 1 } },
          ],
        },
      });
      await pending;
    });
    expect(result.current.scopedAppConfig?.domainConfig).toEqual({ a: 1 });
  });

  it('rejects a name it was not called with', async () => {
    const ctx = await setup();
    const { result } = await mountScoped(ctx, PUBLIC, {
      publicConfigByDomain: {},
    });
    await expect(
      result.current.upsertScopedAppConfig({
        configName: 'domainConfig',
        subKey: 'a',
        value: 1,
      }),
    ).rejects.toThrow('domainConfig was not requested');
  });

  it.each([
    ['PUBLIC', PUBLIC, 'publicConfigByDomain', 1],
    ['the signed-in domain', DOMAIN, 'domainConfig', 1],
    ['another domain', OTHER_DOMAIN, 'domainConfig', 0],
  ] as const)(
    'reloads myAppConfigState after a write to %s only when it is the user’s own',
    async (_label, scope, configName, reloads) => {
      const ctx = await setup();
      const { result } = await mountScoped(ctx, scope, { [configName]: {} });
      await act(async () => {
        const pending = result.current.upsertScopedAppConfig({
          configName,
          subKey: 'a',
          value: 1,
        });
        await answerUpsert(ctx.environment, 'useAppConfigUpsertMutation');
        await pending;
      });
      expect(
        operationsNamed(ctx.environment, 'useAppConfigLoadQuery'),
      ).toHaveLength(reloads);
    },
  );
});

describe('myAppConfigState', () => {
  const rows = (userConfig: Doc | null) => [
    { configName: 'publicConfigByDomain', config: { default: { t: 'p' } } },
    { configName: 'domainConfig', config: { settings: { s: 1 } } },
    { configName: 'userConfig', config: userConfig },
  ];

  it('reads userConfig, domainConfig and publicConfigByDomain from the stored answer', async () => {
    const { hooks, environment, store } = await setup();
    hooks.setMyAppConfigs(store, rows({ themeFamily: 'dark' }));
    const wrapper = wrapperFor(environment, store);
    expect(
      renderHook(() => hooks.useMyAppConfig('themeFamily'), { wrapper }).result
        .current[0],
    ).toBe('dark');
    expect(
      renderHook(() => hooks.useMyAppConfigValue('domainConfig', 'settings'), {
        wrapper,
      }).result.current,
    ).toEqual({ s: 1 });
    expect(
      renderHook(
        () =>
          hooks.useMyAppConfigValue('publicConfigByDomain', ['default', 't']),
        { wrapper },
      ).result.current,
    ).toBe('p');
  });

  it('writes the merged userConfig with the change to the USER scope', async () => {
    const { hooks, environment, store } = await setup();
    hooks.setMyAppConfigs(store, rows({ dashboard: { a: [1] }, x: 1 }));
    const { result } = renderHook(() => hooks.useMyAppConfig<number>('x'), {
      wrapper: wrapperFor(environment, store),
    });
    await act(async () => {
      const pending = result.current[1]((current) => (current ?? 0) + 1);
      const sent = await answerUpsert(
        environment,
        'useAppConfigMyUpsertMutation',
      );
      expect(sent).toEqual({
        items: [
          { configName: 'userConfig', config: { dashboard: { a: [1] }, x: 2 } },
        ],
      });
      await pending;
    });
    expect(result.current[0]).toBe(2);
  });

  it('keeps the value when the write fails', async () => {
    const { hooks, environment, store } = await setup();
    hooks.setMyAppConfigs(store, rows({ x: 1 }));
    const { result } = renderHook(() => hooks.useMyAppConfig<number>('x'), {
      wrapper: wrapperFor(environment, store),
    });
    await act(async () => {
      const pending = result.current[1](5);
      const upsert = await waitForOperation(
        environment,
        'useAppConfigMyUpsertMutation',
      );
      environment.mock.reject(upsert, new Error('boom'));
      await expect(pending).rejects.toThrow('boom');
    });
    expect(result.current[0]).toBe(1);
  });

  it.each([
    ['before sign-in', undefined],
    ['after a failed first read', null],
  ] as const)('refuses to write %s', async (_label, answer) => {
    const { hooks, environment, store } = await setup();
    if (answer === null) hooks.setMyAppConfigs(store, null);
    const { result } = renderHook(() => hooks.useMyAppConfig<number>('x'), {
      wrapper: wrapperFor(environment, store),
    });
    await expect(result.current[1](1)).rejects.toThrow('not written');
    await expect(result.current[2]()).rejects.toThrow('not written');
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });

  it('keeps an earlier answer as the base when a later read fails', async () => {
    const { hooks, store } = await setup();
    hooks.setMyAppConfigs(store, rows({ x: 1 }));
    hooks.setMyAppConfigs(store, null);
    expect(store.get(hooks.myAppConfigState)).toMatchObject({
      status: 'loaded',
      configs: { userConfig: { x: 1 } },
    });
  });

  it('marks a failed first load', async () => {
    const { hooks, environment, store } = await setup();
    const pending = hooks.loadMyAppConfig(store, environment);
    const read = await waitForOperation(environment, 'useAppConfigLoadQuery');
    expect(read.request.variables).toEqual({
      configNames: ['publicConfigByDomain', 'domainConfig', 'userConfig'],
    });
    environment.mock.reject(read, new Error('down'));
    await pending;
    expect(store.get(hooks.myAppConfigState).status).toBe('failed');
  });

  it('folds the loads asked for while one runs into one later load', async () => {
    const { hooks, environment, store } = await setup();
    const first = hooks.loadMyAppConfig(store, environment);
    const second = hooks.loadMyAppConfig(store, environment);
    const third = hooks.loadMyAppConfig(store, environment);
    expect(second).toBe(third);
    const read = await waitForOperation(environment, 'useAppConfigLoadQuery');
    environment.mock.resolve(read, { data: { myAppConfigs: rows({ x: 1 }) } });
    await first;
    await waitFor(() =>
      expect(
        operationsNamed(environment, 'useAppConfigLoadQuery'),
      ).toHaveLength(1),
    );
    const again = operationsNamed(environment, 'useAppConfigLoadQuery')[0];
    environment.mock.resolve(again, { data: { myAppConfigs: rows({ x: 2 }) } });
    await second;
    expect(store.get(hooks.myAppConfigState).configs.userConfig).toEqual({
      x: 2,
    });
  });

  it('reset removes the key from the USER document, then reloads the domain default', async () => {
    const { hooks, environment, store } = await setup();
    hooks.setMyAppConfigs(store, rows({ x: 9, y: 1 }));
    const { result } = renderHook(() => hooks.useMyAppConfig<number>('x'), {
      wrapper: wrapperFor(environment, store),
    });
    await act(async () => {
      const pending = result.current[2]();
      const sent = await answerUpsert(
        environment,
        'useAppConfigMyUpsertMutation',
      );
      expect(sent.items[0].config).toEqual({ y: 1 });
      const reload = await waitForOperation(
        environment,
        'useAppConfigLoadQuery',
      );
      environment.mock.resolve(reload, {
        data: { myAppConfigs: rows({ x: 3, y: 1 }) },
      });
      await pending;
    });
    expect(result.current[0]).toBe(3);
  });

  it('queues the reload after a scoped write behind a pending set', async () => {
    const ctx = await setup();
    ctx.hooks.setMyAppConfigs(ctx.store, rows({ x: 1 }));
    const { result: scoped } = await mountScoped(ctx, PUBLIC, {
      publicConfigByDomain: {},
    });
    const { result: my } = renderHook(
      () => ctx.hooks.useMyAppConfig<number>('x'),
      {
        wrapper: wrapperFor(ctx.environment, ctx.store),
      },
    );
    await act(async () => {
      const set = my.current[1](2);
      const write = scoped.current.upsertScopedAppConfig({
        configName: 'publicConfigByDomain',
        subKey: 'a',
        value: 1,
      });
      await answerUpsert(ctx.environment, 'useAppConfigMyUpsertMutation');
      await answerUpsert(ctx.environment, 'useAppConfigUpsertMutation');
      await Promise.all([set, write]);
      const reload = await waitForOperation(
        ctx.environment,
        'useAppConfigLoadQuery',
      );
      ctx.environment.mock.resolve(reload, {
        data: { myAppConfigs: rows({ x: 2 }) },
      });
    });
    await waitFor(() => expect(my.current[0]).toBe(2));
  });

  it('sends a set made during a reset after its reload', async () => {
    const { hooks, environment, store } = await setup();
    hooks.setMyAppConfigs(store, rows({ x: 9 }));
    const { result } = renderHook(() => hooks.useMyAppConfig<number>('x'), {
      wrapper: wrapperFor(environment, store),
    });
    await act(async () => {
      const reset = result.current[2]();
      const set = result.current[1]((c) => c);
      await answerUpsert(environment, 'useAppConfigMyUpsertMutation');
      const reload = await waitForOperation(
        environment,
        'useAppConfigLoadQuery',
      );
      expect(
        operationsNamed(environment, 'useAppConfigMyUpsertMutation'),
      ).toHaveLength(0);
      environment.mock.resolve(reload, {
        data: { myAppConfigs: rows({ x: 3 }) },
      });
      await reset;
      const sent = await answerUpsert(
        environment,
        'useAppConfigMyUpsertMutation',
      );
      expect(sent.items[0].config).toEqual({ x: 3 });
      await set;
    });
  });
});
