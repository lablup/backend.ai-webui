/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import PendingSessionNodeList from './PendingSessionNodeList';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the pending-sessions tab's resource-group scope
 * (FR-3409). The tab is superadmin-only, so its options come from the root
 * `scaling_groups` field and never from the current project.
 */

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

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      isManagerVersionCompatibleWith: () => true,
    }),
    useWebUINavigate: () => vi.fn(),
  };
});

// Decoy ambient resource group: the tab must never scope itself by it.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentResourceGroupValue: () => 'ambient-rg',
    useResourceGroupsForCurrentProject: () => ({
      resourceGroups: [{ name: 'ambient-rg' }],
      nonSftpResourceGroups: [{ name: 'ambient-rg' }],
    }),
  };
});

vi.mock('./SessionNodes', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-session-nodes' }),
  };
});

vi.mock('./ComputeSessionNodeItems/EditSessionPriorityModal', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-priority-modal' }),
  };
});

vi.mock('./AutoUpdateFetchKeyButton', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-auto-update-button' }),
  };
});

const RESOURCE_GROUPS_QUERY = 'PendingSessionNodeListResourceGroupsQuery';
const PENDING_QUEUE_QUERY = 'PendingSessionNodeListQuery';

const renderList = (search: string) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <MemoryRouter initialEntries={[`/admin/session${search}`]}>
        <NuqsTestingAdapter searchParams={search}>
          <Suspense fallback={<div>loading...</div>}>
            <PendingSessionNodeList />
          </Suspense>
        </NuqsTestingAdapter>
      </MemoryRouter>
    </RelayEnvironmentProvider>,
  );
  return environment;
};

const resolveResourceGroups = (
  environment: RelayMockEnvironment,
  names: Array<string>,
) => {
  const operation = environment.mock.getMostRecentOperation();
  expect(operation.request.node.operation.name).toBe(RESOURCE_GROUPS_QUERY);
  environment.mock.resolve(operation, {
    data: { scaling_groups: names.map((name) => ({ name })) },
  });
};

const findPendingQueueVariables = async (environment: RelayMockEnvironment) => {
  await waitFor(() => {
    expect(
      environment.mock.getMostRecentOperation().request.node.operation.name,
    ).toBe(PENDING_QUEUE_QUERY);
  });
  return environment.mock.getMostRecentOperation().request.variables;
};

describe('PendingSessionNodeList resource-group scope (FR-3409)', () => {
  it('lists every active resource group, independent of any project', async () => {
    const environment = renderList('');

    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.operation.name).toBe(RESOURCE_GROUPS_QUERY);
    expect(operation.request.variables).toEqual({});

    resolveResourceGroups(environment, ['alpha', 'beta']);
    await findPendingQueueVariables(environment);
    environment.mock.resolveMostRecentOperation({
      data: { session_pending_queue: { edges: [], count: 0 } },
    });

    await screen.findByTestId('mock-session-nodes');
    // The select shows the resolved group, not the ambient decoy.
    expect(screen.getAllByText('alpha').length).toBeGreaterThan(0);
    expect(screen.queryByText('ambient-rg')).not.toBeInTheDocument();
  });

  it('scopes the pending queue by the first resource group when the URL names none', async () => {
    const environment = renderList('');
    resolveResourceGroups(environment, ['alpha', 'beta']);

    const variables = await findPendingQueueVariables(environment);
    expect(variables.resource_group_id).toBe('alpha');
    expect(variables.resource_group_id).not.toBe('ambient-rg');
  });

  it('scopes the pending queue by the resource group named in the URL', async () => {
    const environment = renderList('?resourceGroup=beta');
    resolveResourceGroups(environment, ['alpha', 'beta']);

    const variables = await findPendingQueueVariables(environment);
    expect(variables.resource_group_id).toBe('beta');
  });

  it('keeps offset pagination on the pending queue', async () => {
    const environment = renderList('?resourceGroup=beta&current=3&pageSize=10');
    resolveResourceGroups(environment, ['alpha', 'beta']);

    const variables = await findPendingQueueVariables(environment);
    expect(variables.first).toBe(10);
    expect(variables.offset).toBe(20);
  });
});
