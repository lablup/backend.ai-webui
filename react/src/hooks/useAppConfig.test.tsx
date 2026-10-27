/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useUpdateMyUserAppConfig,
  useUpdatePublicDomainAppConfig,
} from './useAppConfig';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
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
  useCurrentDomainValue: () => 'default',
}));

type MockEnvironment = ReturnType<typeof createMockEnvironment>;

const renderWithRelay = <T,>(hook: () => T) => {
  const environment = createMockEnvironment();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  );
  const { result } = renderHook(hook, { wrapper });
  return { environment, result };
};

const waitForOperation = async (
  environment: MockEnvironment,
  operationName: string,
) => {
  await waitFor(() =>
    expect(
      environment.mock
        .getAllOperations()
        .some((op) => op.request.node.params.name === operationName),
    ).toBe(true),
  );
  return environment.mock
    .getAllOperations()
    .find((op) => op.request.node.params.name === operationName)!;
};

/** Resolves the raw public read, then returns the document the upsert sends. */
const runPublicDomainWrite = async (
  rawConfig: Record<string, unknown> | null,
  write: (
    setter: ReturnType<typeof useUpdatePublicDomainAppConfig>,
  ) => Promise<void>,
  failed: Array<{ configName: string; message: string }> = [],
) => {
  const { environment, result } = renderWithRelay(() =>
    useUpdatePublicDomainAppConfig(),
  );
  let pending!: Promise<void>;
  act(() => {
    pending = write(result.current);
  });

  const read = await waitForOperation(
    environment,
    'useAppConfigPublicRawQuery',
  );
  act(() => {
    environment.mock.resolve(read, {
      data: {
        scopedAppConfigFragmentsByNames: rawConfig
          ? [
              {
                id: 'fragment-1',
                configName: 'publicConfigByDomain',
                config: rawConfig,
              },
            ]
          : [],
      },
    });
  });

  const upsert = await waitForOperation(
    environment,
    'useAppConfigUpsertMutation',
  );
  const sent = upsert.request.variables.input;
  act(() => {
    environment.mock.resolve(upsert, {
      data: { scopedUpsertAppConfigFragments: { items: [], failed } },
    });
  });
  return { sent, pending };
};

describe('useUpdatePublicDomainAppConfig', () => {
  it('replaces only the current domain slice and keeps other domains', async () => {
    const otherDomain = { appearance: { schemaVersion: 2, brand: 'other' } };
    const { sent, pending } = await runPublicDomainWrite(
      {
        other: otherDomain,
        default: { appearance: { schemaVersion: 2, brand: 'old' }, keep: 1 },
      },
      (setter) => setter('appearance', { schemaVersion: 2, brand: 'new' }),
    );
    await pending;

    expect(sent.scope).toEqual({ scopeType: 'PUBLIC' });
    expect(sent.items).toEqual([
      {
        configName: 'publicConfigByDomain',
        config: {
          other: otherDomain,
          default: { appearance: { schemaVersion: 2, brand: 'new' }, keep: 1 },
        },
      },
    ]);
  });

  it('writes to the domain passed explicitly instead of the current one', async () => {
    const { sent, pending } = await runPublicDomainWrite(
      { default: { appearance: { brand: 'current' } } },
      (setter) => setter('appearance', { brand: 'target' }, 'target'),
    );
    await pending;

    expect(sent.items[0].config).toEqual({
      default: { appearance: { brand: 'current' } },
      target: { appearance: { brand: 'target' } },
    });
  });

  it('creates the document when no public fragment exists yet', async () => {
    const { sent, pending } = await runPublicDomainWrite(null, (setter) =>
      setter('appearance', { brand: 'first' }),
    );
    await pending;

    expect(sent.items[0].config).toEqual({
      default: { appearance: { brand: 'first' } },
    });
  });

  it('removes only the current domain sub key when the value is undefined', async () => {
    const { sent, pending } = await runPublicDomainWrite(
      {
        other: { appearance: { brand: 'other' } },
        default: { appearance: { brand: 'old' }, keep: 1 },
      },
      (setter) => setter('appearance', undefined),
    );
    await pending;

    expect(sent.items[0].config).toEqual({
      other: { appearance: { brand: 'other' } },
      default: { keep: 1 },
    });
  });

  it('rejects with the server message when the item fails', async () => {
    const { pending } = await runPublicDomainWrite(
      {},
      (setter) => setter('appearance', { brand: 'denied' }),
      [{ configName: 'publicConfigByDomain', message: 'not allowed' }],
    );

    await expect(pending).rejects.toThrow('publicConfigByDomain: not allowed');
  });
});

describe('useUpdateMyUserAppConfig', () => {
  it('replaces only the given key of the raw user fragment', async () => {
    const { environment, result } = renderWithRelay(() =>
      useUpdateMyUserAppConfig(),
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current('themeFamily', 'ocean');
    });

    const read = await waitForOperation(
      environment,
      'useAppConfigUserRawQuery',
    );
    act(() => {
      environment.mock.resolve(read, {
        data: {
          myAppConfigFragmentsByNames: [
            {
              id: 'fragment-1',
              configName: 'userConfig',
              config: { themeFamily: 'default', language: 'ko' },
            },
          ],
        },
      });
    });

    const upsert = await waitForOperation(
      environment,
      'useAppConfigMyUpsertMutation',
    );
    expect(upsert.request.variables.input.items).toEqual([
      {
        configName: 'userConfig',
        config: { themeFamily: 'ocean', language: 'ko' },
      },
    ]);
    act(() => {
      environment.mock.resolve(upsert, {
        data: { myUpsertAppConfigFragments: { items: [], failed: [] } },
      });
    });
    await pending;
  });
});
