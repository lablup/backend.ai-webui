/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import '../../../__test__/resizeObserver.mock.js';
import ConnectedKernelListV2 from './ConnectedKernelListV2';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

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

vi.mock('../../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      supports: (feature: string) => feature === 'sub-filter',
    }),
  };
});

const KERNEL_UUID = '11111111-1111-1111-1111-111111111111';

const renderList = () => {
  const environment = createMockEnvironment();
  const seenVariables: Array<Record<string, any>> = [];
  environment.mock.queueOperationResolver((operation) => {
    seenVariables.push(operation.request.variables);
    return MockPayloadGenerator.generate(operation, {
      KernelV2Connection: () => ({
        count: 1,
        edges: [
          {
            node: {
              id: btoa(`KernelV2:${KERNEL_UUID}`),
              cluster: { clusterHostname: 'main1', clusterIdx: 0 },
              lifecycle: { status: 'RUNNING' },
              resource: { agentId: 'i-agent-01', containerId: 'container-01' },
            },
          },
        ],
      }),
    });
  });
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <ConnectedKernelListV2
          sessionId="22222222-2222-2222-2222-222222222222"
          sessionFrgmtForLogModal={null as any}
        />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  return seenVariables;
};

describe('ConnectedKernelListV2 (FR-454)', () => {
  it('pages sessionKernelsV2 with limit/offset only', async () => {
    const seenVariables = renderList();

    await waitFor(() => expect(seenVariables).toHaveLength(1));
    const variables = seenVariables[0];
    expect(variables).toMatchObject({
      scope: { sessionId: '22222222-2222-2222-2222-222222222222' },
      limit: 10,
      offset: 0,
    });
    // A Strawberry V2 connection rejects mixed pagination modes at runtime.
    expect(variables.first).toBeUndefined();
    expect(variables.after).toBeUndefined();
    expect(variables.last).toBeUndefined();
    expect(variables.before).toBeUndefined();
  });

  it('orders by the cluster index so the main kernel stays first', async () => {
    const seenVariables = renderList();

    await waitFor(() => expect(seenVariables).toHaveLength(1));
    expect(seenVariables[0].orderBy).toEqual([
      { field: 'CLUSTER_IDX', direction: 'ASC' },
    ]);
  });

  it('renders a kernel row from the nested KernelV2 shape', async () => {
    renderList();

    expect(await screen.findByText('main1')).toBeInTheDocument();
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
    expect(screen.getByText('i-agent-01')).toBeInTheDocument();
  });
});
