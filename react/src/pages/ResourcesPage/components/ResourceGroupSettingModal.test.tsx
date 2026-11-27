/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../../__test__/matchMedia.mock.js';
import '../../../../__test__/resizeObserver.mock.js';
import type { ResourceGroupSettingModalTestQuery } from '../../../__generated__/ResourceGroupSettingModalTestQuery.graphql';
import { BAIAppProvider } from '../../../app-shim';
import ResourceGroupSettingModal from './ResourceGroupSettingModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import type { OperationDescriptor } from 'relay-runtime';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

// The manager replaces the whole scheduler_opts value on modify, so the save
// handler must merge the form's fields over the stored one. The stored value
// here carries keys the form does not show and explicit 0s.
const STORED_SCHEDULER_OPTS = {
  allowed_session_types: ['batch'],
  pending_timeout: 0,
  agent_selection_strategy: 'dispersed',
  agent_selector_config: { site: 'a' },
  enforce_spreading_endpoint_replica: true,
  config: { num_retries_to_skip: 0, extra_key: 'keep-me' },
};

const EXISTING_GROUP = {
  name: 'rg-a',
  description: 'group a',
  is_active: true,
  is_public: true,
  wsproxy_addr: null,
  scheduler: 'fifo',
  scheduler_opts: JSON.stringify(STORED_SCHEDULER_OPTS),
};

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
    useCurrentDomainValue: () => ({ name: 'default' }),
  };
});

vi.mock('../../../hooks/useSFTPResourceGroups', () => ({
  useSFTPProxyResourceGroupsQuery: () => ({
    data: {},
    isFetching: false,
    isFetchedAfterMount: true,
    isError: false,
    refetch: vi.fn(),
  }),
  useSFTPResourceGroups: () => ({ applyGroupProxyDelta: vi.fn() }),
  proxiesServingGroups: () => [],
  computeProxyDelta: () => ({ added: [], removed: [] }),
}));

vi.mock('../../../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [undefined, vi.fn()],
}));

// Hands the modal a real fragment ref, the way the detail drawer does.
const EditModalHost = () => {
  const data = useLazyLoadQuery<ResourceGroupSettingModalTestQuery>(
    graphql`
      query ResourceGroupSettingModalTestQuery($name: String!) {
        scaling_group(name: $name) {
          ...ResourceGroupSettingModalFragment
        }
      }
    `,
    { name: 'rg-a' },
  );
  return (
    <ResourceGroupSettingModal
      open
      resourceGroupFrgmt={data.scaling_group}
      onRequestClose={vi.fn()}
    />
  );
};

const renderEditModal = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const seenOperations: Array<{
    name: string;
    variables: Record<string, any>;
  }> = [];
  // A queued resolver is dropped after it answers once, and this render
  // issues two operations (the query, then the mutation) — so re-queue a
  // fresh wrapper before answering each one.
  const resolve = (operation: OperationDescriptor) => {
    seenOperations.push({
      name: operation.request.node.params.name,
      variables: operation.request.variables,
    });
    environment.mock.queueOperationResolver((next) => resolve(next));
    return MockPayloadGenerator.generate(operation, {
      ScalingGroup: () => EXISTING_GROUP,
    });
  };
  environment.mock.queueOperationResolver(resolve);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RelayEnvironmentProvider environment={environment}>
        <BAIAppProvider>
          <Suspense fallback={null}>
            <EditModalHost />
          </Suspense>
        </BAIAppProvider>
      </RelayEnvironmentProvider>
    </QueryClientProvider>,
  );
  return { seenOperations };
};

describe('ResourceGroupSettingModal save handler', () => {
  it('merges the form over the stored scheduler_opts, keeping unshown keys and explicit 0s', async () => {
    const user = userEvent.setup();
    const { seenOperations } = renderEditModal();

    // A stored 0 for either field shows as 0, not as an empty field. The
    // question-icon tooltip shares the label text, so match the spinbutton
    // role, not getByLabelText.
    expect(
      await screen.findByRole('spinbutton', {
        name: 'resourceGroup.PendingTimeout',
      }),
    ).toHaveValue('0');
    expect(
      screen.getByRole('spinbutton', {
        name: 'resourceGroup.RetriesToSkipDesc',
      }),
    ).toHaveValue('0');

    // Editing only the description: every other stored key must survive.
    await user.clear(screen.getByLabelText('resourceGroup.Description'));
    await user.type(
      screen.getByLabelText('resourceGroup.Description'),
      'edited',
    );
    await user.click(screen.getByRole('button', { name: /button.Save/ }));

    await waitFor(() => {
      const update = seenOperations.find(
        (operation) =>
          operation.name === 'ResourceGroupSettingModalUpdateMutation',
      );
      expect(update).toBeDefined();
      expect(update?.variables.name).toBe('rg-a');
      const schedulerOpts = JSON.parse(update?.variables.input.scheduler_opts);
      expect(schedulerOpts).toEqual({
        ...STORED_SCHEDULER_OPTS,
        config: {
          ...STORED_SCHEDULER_OPTS.config,
          num_retries_to_skip: 0,
        },
      });
    });
  });

  it('removes a stored value when the user clears its field', async () => {
    const user = userEvent.setup();
    const { seenOperations } = renderEditModal();

    // Clearing a shown field removes its key: the field is empty, so saving
    // an old value back would silently undo the user's removal.
    await user.clear(
      await screen.findByRole('spinbutton', {
        name: 'resourceGroup.PendingTimeout',
      }),
    );
    await user.clear(
      screen.getByRole('spinbutton', {
        name: 'resourceGroup.RetriesToSkipDesc',
      }),
    );
    await user.click(screen.getByRole('button', { name: /button.Save/ }));

    await waitFor(() => {
      const update = seenOperations.find(
        (operation) =>
          operation.name === 'ResourceGroupSettingModalUpdateMutation',
      );
      expect(update).toBeDefined();
      const schedulerOpts = JSON.parse(update?.variables.input.scheduler_opts);
      expect(schedulerOpts).not.toHaveProperty('pending_timeout');
      expect(schedulerOpts.config).not.toHaveProperty('num_retries_to_skip');
      // Unshown keys still survive the edit.
      expect(schedulerOpts.config).toHaveProperty('extra_key', 'keep-me');
      expect(schedulerOpts).toHaveProperty(
        'agent_selection_strategy',
        'dispersed',
      );
    });
  });
});
