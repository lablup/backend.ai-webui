/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPRoleListToolsTestQuery } from '../__generated__/WebMCPRoleListToolsTestQuery.graphql';
import WebMCPRoleListTools from './WebMCPRoleListTools';
import { render, waitFor } from '@testing-library/react';
import { BAIWebMCPProvider, type WebMCPToolDescriptor } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ hiddenKeys: [] as Array<string> }));

vi.mock('../hooks/useHiddenColumnKeysSetting', () => ({
  useHiddenColumnKeysSetting: () => [mocks.hiddenKeys],
}));

const registerTool =
  vi.fn<
    (tool: WebMCPToolDescriptor, options: { signal: AbortSignal }) => void
  >();

const ROLE_UUID = '11111111-1111-1111-1111-111111111111';
const ROLE_GLOBAL_ID = 'g-role-a';
const SCOPE_UUID = '22222222-2222-2222-2222-222222222222';

const TestRenderer: React.FC<{
  selectedRoleId?: string;
  pending?: boolean;
}> = ({ selectedRoleId, pending }) => {
  const data = useLazyLoadQuery<WebMCPRoleListToolsTestQuery>(
    graphql`
      query WebMCPRoleListToolsTestQuery @relay_test_operation {
        adminRoles(first: 10) {
          edges {
            node {
              ...WebMCPRoleListToolsFragment
            }
          }
        }
      }
    `,
    {},
  );
  return (
    <WebMCPRoleListTools
      rolesFrgmt={_.compact(_.map(data.adminRoles?.edges, 'node'))}
      page={1}
      pageSize={10}
      total={1}
      pending={pending}
      viewParams={{ status: 'ACTIVE' }}
      selectedRoleId={selectedRoleId}
    />
  );
};

const renderTools = ({
  search = '',
  selectedRoleId,
  pending,
}: {
  search?: string;
  selectedRoleId?: string;
  pending?: boolean;
} = {}) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({
        adminRoles: {
          edges: [
            {
              node: {
                id: ROLE_GLOBAL_ID,
                entityId: ROLE_UUID,
                name: 'auditor',
                description: 'Reads audit logs',
                scopeType: 'PROJECT',
                scopeId: SCOPE_UUID,
                source: 'CUSTOM',
                status: 'ACTIVE',
                autoAssign: true,
                createdAt: '2026-09-25T00:00:00Z',
                updatedAt: '2026-09-26T00:00:00Z',
              },
            },
          ],
        },
      }),
    }),
  );
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <MemoryRouter initialEntries={[`/admin/rbac${search}`]}>
        <BAIWebMCPProvider enabled>
          <Suspense fallback={null}>
            <TestRenderer selectedRoleId={selectedRoleId} pending={pending} />
          </Suspense>
        </BAIWebMCPProvider>
      </MemoryRouter>
    </RelayEnvironmentProvider>,
  );
};

const toolNamed = (name: string) =>
  registerTool.mock.calls.map(([tool]) => tool).find((t) => t.name === name)!;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.hiddenKeys = [];
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    get: () => ({ registerTool }),
  });
});

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
});

describe('WebMCPRoleListTools', () => {
  it('reports the role UUID and every rendered column, autoAssign included', async () => {
    renderTools();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_list_visible_role').execute({}),
    ).resolves.toMatchObject({
      rows: [
        {
          id: ROLE_UUID,
          name: 'auditor',
          scopeType: 'PROJECT',
          scopeId: SCOPE_UUID,
          status: 'ACTIVE',
          autoAssign: true,
        },
      ],
      count: 1,
    });
  });

  it('drops the fields of a column the user hid', async () => {
    mocks.hiddenKeys = ['description', 'autoAssign'];
    renderTools();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    const result = (await toolNamed('bai_list_visible_role').execute({})) as {
      rows: Array<Record<string, unknown>>;
    };
    expect(result.rows[0]).not.toHaveProperty('description');
    expect(result.rows[0]).not.toHaveProperty('autoAssign');
    expect(result.rows[0]).toHaveProperty('name', 'auditor');
  });

  it('reports the open role by UUID, with a path that reopens it', async () => {
    renderTools({
      search: `?roleDetail=${ROLE_GLOBAL_ID}`,
      selectedRoleId: ROLE_GLOBAL_ID,
    });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_role').execute({}),
    ).resolves.toMatchObject({
      current: {
        id: ROLE_UUID,
        name: 'auditor',
        path: `/admin/rbac?roleDetail=${ROLE_GLOBAL_ID}`,
      },
    });
  });

  it('answers null when the URL names a role whose drawer is closed', async () => {
    renderTools({ search: '?roleDetail=g-role-elsewhere' });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_role').execute({}),
    ).resolves.toEqual({ current: null });
  });

  it('flags results while the page loads a new view', async () => {
    renderTools({ pending: true });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_list_visible_role').execute({}),
    ).resolves.toMatchObject({ pending: true });
    await expect(
      toolNamed('bai_get_role_filter').execute({}),
    ).resolves.toMatchObject({ pending: true });
  });
});
