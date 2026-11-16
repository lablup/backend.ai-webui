/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../../__test__/matchMedia.mock.js';
import '../../../../__test__/resizeObserver.mock.js';
import { BAIAppProvider } from '../../../app-shim';
import ResourceGroupList from './ResourceGroupList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import type { OperationDescriptor } from 'relay-runtime';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

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

vi.mock('../../../hooks', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../../../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      _config: { domainName: 'default' },
      is_superadmin: false,
      isManagerVersionCompatibleWith: () => true,
    }),
  };
});

vi.mock('../../../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [undefined, vi.fn()],
}));

vi.mock('../../../hooks/useSFTPResourceGroups', () => ({
  useSFTPProxyResourceGroupsQuery: () => ({ data: {} }),
}));

// The drawer reports a saved edit through `onRequestRefetch`; the stub stands
// in for its setting modal closing with success.
vi.mock('./ResourceGroupDetailDrawer', async () => {
  const React = await import('react');
  return {
    default: (props: { open?: boolean; onRequestRefetch?: () => void }) =>
      props.open
        ? React.createElement(
            'button',
            { onClick: () => props.onRequestRefetch?.() },
            'save-in-drawer',
          )
        : null,
  };
});
vi.mock('./ResourceGroupSettingModal', () => ({ default: () => null }));
vi.mock('./UpdateResourceGroupsModal', () => ({ default: () => null }));

const listPayload = (
  operation: OperationDescriptor,
  rows: Array<{ description: string; isActive: boolean }>,
) =>
  MockPayloadGenerator.generate(operation, {
    ResourceGroupConnection: () => ({
      count: rows.length,
      edges: rows.map(({ description, isActive }) => ({
        node: {
          id: 'UmVzb3VyY2VHcm91cDpyZy1h',
          entityId: '00000000-0000-0000-0000-000000000001',
          name: 'rg-a',
          status: { isActive, isPublic: true, isDefault: false },
          metadata: { description, createdAt: null },
        },
      })),
    }),
  });

const findOperation = (environment: RelayMockEnvironment, name: string) =>
  environment.mock
    .getAllOperations()
    .find((operation) => operation.request.node.params.name === name);

const renderList = (environment: RelayMockEnvironment) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RelayEnvironmentProvider environment={environment}>
        <BAIAppProvider>
          <Suspense fallback={null}>
            <ResourceGroupList />
          </Suspense>
        </BAIAppProvider>
      </RelayEnvironmentProvider>
    </QueryClientProvider>,
  );

const resolveListQuery = async (
  environment: RelayMockEnvironment,
  rows: Array<{ description: string; isActive: boolean }>,
) => {
  let operation: OperationDescriptor | undefined;
  await waitFor(() => {
    operation = findOperation(environment, 'ResourceGroupListQuery');
    expect(operation).toBeDefined();
  });
  await act(async () => {
    environment.mock.resolve(operation!, listPayload(operation!, rows));
  });
};

describe('ResourceGroupList refresh after a change', () => {
  it('refetches the list after a group is deactivated', async () => {
    const user = userEvent.setup();
    const environment = createMockEnvironment();
    renderList(environment);
    await resolveListQuery(environment, [
      { description: 'group a', isActive: true },
    ]);
    expect(await screen.findByText('group a')).toBeInTheDocument();

    // jsdom has no width, so the row actions sit in the overflow menu.
    await user.click(
      screen.getByRole('button', {
        name: 'comp:BAINameActionCell.MoreActions',
      }),
    );
    await user.click(
      await screen.findByRole('menuitem', { name: 'resourceGroup.Deactivate' }),
    );
    const confirmButtons = await screen.findAllByRole('button', {
      name: 'resourceGroup.Deactivate',
    });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    let mutation: OperationDescriptor | undefined;
    await waitFor(() => {
      mutation = findOperation(environment, 'ResourceGroupListUpdateMutation');
      expect(mutation).toBeDefined();
    });
    await act(async () => {
      environment.mock.resolve(
        mutation!,
        MockPayloadGenerator.generate(mutation!, {
          ResourceGroup: () => ({
            id: 'UmVzb3VyY2VHcm91cDpyZy1h',
            status: { isActive: false },
          }),
        }),
      );
    });

    await resolveListQuery(environment, []);
    await waitFor(() =>
      expect(screen.queryByText('group a')).not.toBeInTheDocument(),
    );
  });

  it('refetches the list after the drawer saves an edit', async () => {
    const user = userEvent.setup();
    const environment = createMockEnvironment();
    renderList(environment);
    await resolveListQuery(environment, [
      { description: 'old description', isActive: true },
    ]);

    await user.click(await screen.findByText('rg-a'));
    await user.click(await screen.findByText('save-in-drawer'));

    await resolveListQuery(environment, [
      { description: 'new description', isActive: true },
    ]);
    expect(await screen.findByText('new description')).toBeInTheDocument();
  });
});
