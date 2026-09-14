/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import '../../../__test__/resizeObserver.mock.js';
import type { SessionSlotCellTestQuery } from '../../__generated__/SessionSlotCellTestQuery.graphql';
import SessionSlotCell from './SessionSlotCell';
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
 * FR-3922: while a session is transitional the manager frees kernel
 * allocations one by one, so `occupied_slots` collapses toward a single
 * node's worth. The cell must show `requested_slots` there, and keep showing
 * `occupied_slots` for a settled session.
 */

vi.mock('../../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../../hooks/backendai')>();
  return {
    ...originalModule,
    useResourceSlotsDetails: () => ({
      mergedResourceSlots: {
        'cuda.device': {
          display_unit: 'GPU',
          number_format: { round_length: 0 },
        },
      },
    }),
  };
});

// A 120-node batch session: one node's worth still allocated, 120 nodes'
// worth originally requested.
const OCCUPIED_SLOTS = JSON.stringify({
  cpu: '64',
  mem: '1657324077056',
  'cuda.device': '8',
});
const REQUESTED_SLOTS = JSON.stringify({
  cpu: '7680',
  mem: '198878889086976',
  'cuda.device': '960',
});

const TestRenderer: React.FC<{ type: 'cpu' | 'mem' | 'accelerator' }> = ({
  type,
}) => {
  const data = useLazyLoadQuery<SessionSlotCellTestQuery>(
    graphql`
      query SessionSlotCellTestQuery($id: GlobalIDField!)
      @relay_test_operation {
        compute_session_node(id: $id) {
          ...SessionSlotCellFragment
        }
      }
    `,
    { id: 'session-id' },
  );
  if (!data.compute_session_node) return null;
  return (
    <SessionSlotCell type={type} sessionFrgmt={data.compute_session_node} />
  );
};

const renderCell = (status: string, type: 'cpu' | 'mem' | 'accelerator') => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      ComputeSessionNode: () => ({
        id: 'session-id',
        status,
        occupied_slots: OCCUPIED_SLOTS,
        requested_slots: REQUESTED_SLOTS,
        tag: null,
        kernel_nodes: { edges: [] },
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <TestRenderer type={type} />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
};

describe('SessionSlotCell transitional slot source (FR-3922)', () => {
  it('shows the requested CPU count while the session is TERMINATING', async () => {
    renderCell('TERMINATING', 'cpu');
    expect(await screen.findByText('7680')).toBeInTheDocument();
    expect(screen.queryByText('64')).not.toBeInTheDocument();
  });

  it('shows the requested accelerator count while the session is TERMINATING', async () => {
    renderCell('TERMINATING', 'accelerator');
    expect(await screen.findByText('960')).toBeInTheDocument();
    expect(screen.queryByText('8')).not.toBeInTheDocument();
  });

  it('shows the occupied CPU count for a RUNNING session', async () => {
    renderCell('RUNNING', 'cpu');
    expect(await screen.findByText('64')).toBeInTheDocument();
    expect(screen.queryByText('7680')).not.toBeInTheDocument();
  });

  it('shows the occupied accelerator count for a RUNNING session', async () => {
    renderCell('RUNNING', 'accelerator');
    expect(await screen.findByText('8')).toBeInTheDocument();
    expect(screen.queryByText('960')).not.toBeInTheDocument();
  });
});
