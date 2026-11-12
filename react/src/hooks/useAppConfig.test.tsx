/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type AppConfigName,
  type AppConfigScope,
  useScopedAppConfig,
} from './useAppConfig';
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
  useSuspendedBackendaiClient: () => ({
    _config: { domainId: 'domain-1' },
    user_uuid: 'user-1',
  }),
}));

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
const mountScoped = async (
  scope: AppConfigScope,
  configName: AppConfigName,
  config: Record<string, unknown> | null,
) => {
  const environment = createMockEnvironment();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>{children}</Suspense>
    </RelayEnvironmentProvider>
  );
  const { result } = renderHook(() => useScopedAppConfig(scope, configName), {
    wrapper,
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
    const merged = await waitForOperation(
      environment,
      'useAppConfigMergedQuery',
    );
    act(() => {
      environment.mock.resolve(merged, { data: { myAppConfigs: [] } });
    });
    await act(() => pending);
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
