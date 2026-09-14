/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import '../../../__test__/resizeObserver.mock.js';
import type { SessionStatusTagTestQuery } from '../../__generated__/SessionStatusTagTestQuery.graphql';
import SessionStatusTag from './SessionStatusTag';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * FR-3923: the badge's spinner becomes a determinate ring fed by the kernel
 * statuses. The fraction is counted on the client because the manager ignores
 * every `kernel_nodes` argument.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      supports: () => false,
      _config: {},
    }),
  };
});

const TestRenderer: React.FC = () => {
  const data = useLazyLoadQuery<SessionStatusTagTestQuery>(
    graphql`
      query SessionStatusTagTestQuery($id: GlobalIDField!)
      @relay_test_operation {
        compute_session_node(id: $id) {
          ...SessionStatusTagFragment
        }
      }
    `,
    { id: 'session-id' },
  );
  if (!data.compute_session_node) return null;
  return <SessionStatusTag sessionFrgmt={data.compute_session_node} />;
};

const renderTag = (session: {
  status: string;
  cluster_size: number;
  kernelStatuses: Array<string>;
}) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      ComputeSessionNode: () => ({
        id: 'session-id',
        status: session.status,
        status_info: null,
        status_data: null,
        queue_position: null,
        cluster_size: session.cluster_size,
        kernel_nodes: {
          edges: session.kernelStatuses.map((status, index) => ({
            node: { id: `kernel-${index}`, status },
          })),
        },
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <TestRenderer />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
};

const repeat = (status: string, count: number) =>
  Array.from({ length: count }, () => status);

describe('SessionStatusTag kernel progress ring (FR-3923)', () => {
  it('shows how far a 120-node TERMINATING session has got', async () => {
    renderTag({
      status: 'TERMINATING',
      cluster_size: 120,
      kernelStatuses: [...repeat('TERMINATED', 119), 'RUNNING'],
    });

    expect(await screen.findByText('TERMINATING')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '99',
    );
  });

  it('keeps the ring indeterminate for a single-node TERMINATING session', async () => {
    renderTag({
      status: 'TERMINATING',
      cluster_size: 1,
      kernelStatuses: ['RUNNING'],
    });

    expect(await screen.findByText('TERMINATING')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('draws no ring at all for a settled session', async () => {
    renderTag({
      status: 'RUNNING',
      cluster_size: 120,
      kernelStatuses: repeat('RUNNING', 120),
    });

    expect(await screen.findByText('RUNNING')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      document.querySelector('.bai-progress-ring'),
    ).not.toBeInTheDocument();
  });
});
