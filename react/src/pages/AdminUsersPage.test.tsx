/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The page queries a tab's list once per way of reaching it: mount, a tab
 * click, a child reload, back/forward, and an in-app navigation to another
 * tab or to other filters on the same tab (#10265). The lists are stubbed;
 * what is asserted is which query the page starts, with which variables,
 * and that no way of arriving starts it twice.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import { AdminUserCredentialListQuery } from '../components/AdminUserCredentialList';
import { AdminUserManagementQuery } from '../components/AdminUserManagement';
import AdminUsersPage from './AdminUsersPage';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { StrictMode, Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {
  Environment,
  Network,
  RecordSource,
  Store,
  createOperationDescriptor,
  getRequest,
} from 'relay-runtime';
import { MockPayloadGenerator } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return { ...originalModule, useSuspendedTOTPSupported: () => true };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return { ...originalModule, useCurrentDomainValue: () => 'default' };
});

// The lists are the page's children; each stub exposes one child-driven
// reload so the mirror-to-URL path is exercised without the real table.
// Every distinct query ref the lists receive is one `loadQuery` call, even
// when Relay folds its request into an identical in-flight one.
const receivedQueryRefs = vi.hoisted(() => [] as unknown[]);
const recordQueryRef = (queryRef: unknown) => {
  if (!receivedQueryRefs.includes(queryRef)) receivedQueryRefs.push(queryRef);
};

vi.mock('../components/AdminUserManagement', async (importOriginal) => {
  const React = await import('react');
  const originalModule =
    await importOriginal<typeof import('../components/AdminUserManagement')>();
  return {
    ...originalModule,
    default: ({
      queryRef,
      onReload,
    }: {
      queryRef: unknown;
      onReload: (variables: any) => void;
    }) => {
      recordQueryRef(queryRef);
      return React.createElement(
        'div',
        { 'data-testid': 'users-list' },
        React.createElement(
          'button',
          {
            onClick: () =>
              onReload({
                filter: { status: { notEquals: 'ACTIVE' } },
                orderBy: null,
                limit: 10,
                offset: 0,
                isNotSupportTotp: false,
              }),
          },
          'reload-inactive-users',
        ),
      );
    },
  };
});

vi.mock('../components/AdminUserCredentialList', async (importOriginal) => {
  const React = await import('react');
  const originalModule =
    await importOriginal<
      typeof import('../components/AdminUserCredentialList')
    >();
  return {
    ...originalModule,
    default: ({
      queryRef,
      onReload,
    }: {
      queryRef: unknown;
      onReload: (variables: any) => void;
    }) => {
      recordQueryRef(queryRef);
      return React.createElement(
        'div',
        { 'data-testid': 'credentials-list' },
        React.createElement(
          'button',
          {
            onClick: () =>
              onReload({
                limit: 20,
                offset: 20,
                is_active: true,
                filter: null,
                order: null,
              }),
          },
          'reload-credentials-page-2',
        ),
      );
    },
  };
});

/** Every query the page started, each answered at once so none stays in flight. */
let started: Array<{ name: string; variables: Record<string, unknown> }> = [];

const QUERIES = {
  AdminUserManagementQuery,
  AdminUserCredentialListQuery,
} as const;

const createEnvironment = () =>
  new Environment({
    store: new Store(new RecordSource()),
    network: Network.create((request, variables) => {
      started.push({ name: request.name, variables });
      const node = QUERIES[request.name as keyof typeof QUERIES];
      return Promise.resolve(
        MockPayloadGenerator.generate(
          createOperationDescriptor(getRequest(node), variables),
        ),
      );
    }),
  });

const renderPage = (search = '') => {
  window.history.replaceState(null, '', `/admin/users${search}`);
  started = [];
  const environment = createEnvironment();
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback={null}>
            <AdminUsersPage />
          </Suspense>
        </RelayEnvironmentProvider>
      ),
    },
  ]);
  render(
    <StrictMode>
      <NuqsAdapter defaultOptions={{ shallow: false }}>
        <RouterProvider router={router} />
      </NuqsAdapter>
    </StrictMode>,
  );
  return { router };
};

/**
 * The queries the page started since the last call. Each one resolved on
 * execution, so a later identical one cannot be folded into it as an
 * in-flight duplicate. The wait outlasts nuqs' URL write throttle and
 * React's transitions.
 */
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
  const since = started;
  started = [];
  return since;
};

const navigateInApp = async (
  router: ReturnType<typeof createBrowserRouter>,
  to: string,
) => {
  await act(async () => {
    await router.navigate(to);
  });
};

describe('AdminUsersPage tab queries', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('queries the Users tab once on mount, StrictMode included', async () => {
    renderPage();
    const started = await settle();
    expect(started).toHaveLength(1);
    expect(started[0].name).toBe('AdminUserManagementQuery');
    expect(started[0].variables).toMatchObject({
      filter: { status: { equals: 'ACTIVE' } },
      limit: 10,
      offset: 0,
    });
    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });

  it('queries the tab an in-app navigation opens', async () => {
    const { router } = renderPage();
    await settle();

    await navigateInApp(router, '/admin/users?tab=credentials');
    const started = await settle();
    expect(started.map((s) => s.name)).toEqual([
      'AdminUserCredentialListQuery',
    ]);
    expect(started[0].variables).toMatchObject({ limit: 20, offset: 0 });
    expect(screen.getByTestId('credentials-list')).toBeInTheDocument();
    expect(screen.queryByTestId('users-list')).toBeNull();
  });

  it('queries other filters an in-app navigation sets on the same tab', async () => {
    const { router } = renderPage();
    await settle();

    await navigateInApp(router, '/admin/users?tab=users&status=INACTIVE');
    const started = await settle();
    expect(started.map((s) => s.name)).toEqual(['AdminUserManagementQuery']);
    expect(started[0].variables).toMatchObject({
      filter: { status: { notEquals: 'ACTIVE' } },
    });
  });

  it('queries once on a tab click and mirrors the tab to the URL', async () => {
    renderPage();
    await settle();

    fireEvent.click(screen.getAllByText('credential.Credentials')[0]);
    const started = await settle();
    expect(started.map((s) => s.name)).toEqual([
      'AdminUserCredentialListQuery',
    ]);
    expect(window.location.search).toContain('tab=credentials');

    // The URL the click wrote is what the page queried: nothing re-runs.
    expect(await settle()).toHaveLength(0);
  });

  it('queries once on a child reload and mirrors its variables to the URL', async () => {
    renderPage();
    await settle();

    const refsBefore = receivedQueryRefs.length;
    fireEvent.click(screen.getByText('reload-inactive-users'));
    const started = await settle();
    expect(started.map((s) => s.name)).toEqual(['AdminUserManagementQuery']);
    // The URL the reload mirrored is what it queried: no second loadQuery.
    expect(receivedQueryRefs.length - refsBefore).toBe(1);
    expect(started[0].variables).toMatchObject({
      filter: { status: { notEquals: 'ACTIVE' } },
    });
    expect(window.location.search).toContain('status=INACTIVE');
    expect(await settle()).toHaveLength(0);

    fireEvent.click(screen.getAllByText('credential.Credentials')[0]);
    await settle();
    const pagedRefsBefore = receivedQueryRefs.length;
    fireEvent.click(screen.getByText('reload-credentials-page-2'));
    const paged = await settle();
    expect(paged.map((s) => s.name)).toEqual(['AdminUserCredentialListQuery']);
    expect(receivedQueryRefs.length - pagedRefsBefore).toBe(1);
    expect(paged[0].variables).toMatchObject({ limit: 20, offset: 20 });
    expect(await settle()).toHaveLength(0);
  });

  it('re-queries the entry a browser Back returns to', async () => {
    renderPage();
    await settle();
    fireEvent.click(screen.getAllByText('credential.Credentials')[0]);
    await settle();

    await act(async () => {
      window.history.back();
    });
    const started = await settle();
    expect(started.map((s) => s.name)).toEqual(['AdminUserManagementQuery']);
    expect(window.location.search).not.toContain('tab=credentials');
    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });
});
