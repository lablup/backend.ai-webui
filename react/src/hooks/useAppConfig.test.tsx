/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AppConfigName, AppConfigScope } from './useAppConfig';
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

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({ user_uuid: 'user-1' }),
  useCurrentDomain: () => ({ name: 'default', id: 'domain-1' }),
}));

// A fresh module per test: the write queue is module state.
const loadHooks = async () => {
  vi.resetModules();
  return import('./useAppConfig');
};

type MockEnvironment = ReturnType<typeof createMockEnvironment>;

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

/** Mounts the hook and answers its read with `config` (`null`: no fragment yet). */
const wrapperFor = (environment: MockEnvironment) => {
  const RelayWrapper = ({ children }: { children: ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>{children}</Suspense>
    </RelayEnvironmentProvider>
  );
  return RelayWrapper;
};

const mountScoped = async (
  scope: AppConfigScope,
  configName: AppConfigName,
  config: Record<string, unknown> | null,
) => {
  const { useScopedAppConfig } = await loadHooks();
  const environment = createMockEnvironment();
  const { result } = renderHook(() => useScopedAppConfig(scope, configName), {
    wrapper: wrapperFor(environment),
  });
  const read = await waitForOperation(environment, 'useAppConfigScopedQuery');
  act(() => {
    environment.mock.resolve(read, {
      data: {
        scopedAppConfigFragmentsByNames: [
          config ? { id: 'fragment-1', configName, config } : null,
        ],
      },
    });
  });
  await waitFor(() => expect(result.current).not.toBeNull());
  return { environment, result, read };
};

/** Answers the next upsert with the document it sent, as the manager does. */
const answerUpsert = async (
  environment: MockEnvironment,
  id = 'fragment-1',
) => {
  const upsert = await waitForOperation(
    environment,
    'useAppConfigUpsertMutation',
  );
  const sent = upsert.request.variables.input;
  act(() => {
    environment.mock.resolve(upsert, {
      data: {
        scopedAtomicBulkUpsertAppConfigFragments: {
          items: [{ id, ...sent.items[0] }],
        },
      },
    });
  });
  return sent;
};

describe('useScopedAppConfig', () => {
  it('fills the scope id from the signed-in user and domain', async () => {
    const user = await mountScoped({ scopeType: 'USER' }, 'userConfig', {});
    expect(user.read.request.variables.scope).toEqual({
      scopeType: 'USER',
      scopeId: 'user-1',
    });
    const domain = await mountScoped(
      { scopeType: 'DOMAIN' },
      'domainConfig',
      {},
    );
    expect(domain.read.request.variables.scope).toEqual({
      scopeType: 'DOMAIN',
      scopeId: 'domain-1',
    });
    const pub = await mountScoped(
      { scopeType: 'PUBLIC' },
      'publicConfigByDomain',
      {},
    );
    expect(pub.read.request.variables.scope).toEqual({ scopeType: 'PUBLIC' });
  });

  it('writes one domain slice with a single upsert and keeps other domains', async () => {
    const otherDomain = { appearance: { brand: 'other' } };
    const { environment, result } = await mountScoped(
      { scopeType: 'PUBLIC' },
      'publicConfigByDomain',
      {
        other: otherDomain,
        default: { appearance: { brand: 'old' }, keep: 1 },
      },
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.setKey(['default', 'appearance'], {
        brand: 'new',
      });
    });
    const sent = await answerUpsert(environment);
    await act(() => pending);

    expect(sent.scope).toEqual({ scopeType: 'PUBLIC' });
    expect(sent.items[0].config).toEqual({
      other: otherDomain,
      default: { appearance: { brand: 'new' }, keep: 1 },
    });
    expect(operationsNamed(environment, 'useAppConfigScopedQuery')).toEqual([]);
    expect(result.current.doc?.default.appearance).toEqual({ brand: 'new' });
  });

  it('passes the current value to an updater and removes a key set to undefined', async () => {
    const { environment, result } = await mountScoped(
      { scopeType: 'USER' },
      'userConfig',
      { settings: { debug: true, extra: 1 }, themeFamily: 'ocean' },
    );
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.setKey('settings', (current: unknown) => ({
        ...(current as Record<string, unknown>),
        debug: false,
      }));
      second = result.current.setKey('themeFamily', undefined);
    });
    expect((await answerUpsert(environment)).items[0].config).toEqual({
      settings: { debug: false, extra: 1 },
      themeFamily: 'ocean',
    });
    // The second write waits for the first and builds on its response.
    expect((await answerUpsert(environment)).items[0].config).toEqual({
      settings: { debug: false, extra: 1 },
    });
    await act(() => Promise.all([first, second]));
  });

  it('links a first write into the read so the next write builds on it', async () => {
    const { environment, result } = await mountScoped(
      { scopeType: 'USER' },
      'userConfig',
      null,
    );
    expect(result.current.doc).toBeUndefined();
    let first!: Promise<void>;
    act(() => {
      first = result.current.setKey('themeFamily', 'ocean');
    });
    await answerUpsert(environment, 'created');
    await act(() => first);
    expect(result.current.doc).toEqual({ themeFamily: 'ocean' });

    let second!: Promise<void>;
    act(() => {
      second = result.current.setKey('language', 'ko');
    });
    expect(
      (await answerUpsert(environment, 'created')).items[0].config,
    ).toEqual({ themeFamily: 'ocean', language: 'ko' });
    await act(() => second);
  });

  it('refetches the merged view after a domainConfig write', async () => {
    const { environment, result } = await mountScoped(
      { scopeType: 'DOMAIN' },
      'domainConfig',
      { settings: {} },
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.setKey(['settings', 'announcement'], {
        title: 'hi',
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

  it('reads the document again when another reader mounts on the stored copy', async () => {
    const { useScopedAppConfig } = await loadHooks();
    const { environment } = await mountScoped(
      { scopeType: 'USER' },
      'userConfig',
      { themeFamily: 'ocean' },
    );
    expect(operationsNamed(environment, 'useAppConfigScopedQuery')).toEqual([]);
    const second = renderHook(
      () => useScopedAppConfig({ scopeType: 'USER' }, 'userConfig'),
      { wrapper: wrapperFor(environment) },
    );
    expect(second.result.current.doc).toEqual({ themeFamily: 'ocean' });
    await waitForOperation(environment, 'useAppConfigScopedQuery');
  });

  it('follows the fragment the upsert returned when its id changed', async () => {
    const { environment, result } = await mountScoped(
      { scopeType: 'USER' },
      'userConfig',
      { themeFamily: 'ocean' },
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.setKey('language', 'ko');
    });
    await answerUpsert(environment, 'recreated');
    await act(() => pending);
    expect(result.current.doc).toEqual({
      themeFamily: 'ocean',
      language: 'ko',
    });
  });

  it('rejects with the server message when the write fails', async () => {
    const { environment, result } = await mountScoped(
      { scopeType: 'PUBLIC' },
      'publicConfigByDomain',
      {},
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.setKey(['default', 'appearance'], {});
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
