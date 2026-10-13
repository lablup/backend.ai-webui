/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPAdminUserToolsTestQuery } from '../__generated__/WebMCPAdminUserToolsTestQuery.graphql';
import {
  WebMCPAdminKeypairTools,
  WebMCPAdminUserTools,
} from './WebMCPAdminUserTools';
import { render, waitFor } from '@testing-library/react';
import {
  BAIWebMCPProvider,
  type BAITableColumnOverrideRecord,
  type WebMCPToolDescriptor,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, type ReactNode } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const registerTool =
  vi.fn<
    (tool: WebMCPToolDescriptor, options: { signal: AbortSignal }) => void
  >();
const modelContextGetter = vi.fn(() => ({ registerTool }));

const USER_UUID = '33333333-3333-3333-3333-333333333333';
const USER_GLOBAL_ID = btoa(`UserV2:${USER_UUID}`);

const toolNamed = (name: string) =>
  registerTool.mock.calls.map(([tool]) => tool).find((t) => t.name === name)!;

const shell = (children: ReactNode, enabled = true) => (
  <MemoryRouter initialEntries={['/admin/users?tab=users']}>
    <BAIWebMCPProvider enabled={enabled}>
      <Suspense fallback={null}>{children}</Suspense>
    </BAIWebMCPProvider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    get: modelContextGetter,
  });
});

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
});

describe('WebMCPAdminUserTools', () => {
  const UsersRenderer: React.FC<{
    columnOverrides?: BAITableColumnOverrideRecord;
    openedUserId?: string;
  }> = ({ columnOverrides, openedUserId }) => {
    const data = useLazyLoadQuery<WebMCPAdminUserToolsTestQuery>(
      graphql`
        query WebMCPAdminUserToolsTestQuery @relay_test_operation {
          adminUsersV2(limit: 10) {
            edges {
              node {
                ...WebMCPAdminUserToolsFragment
              }
            }
          }
        }
      `,
      {},
    );
    return (
      <WebMCPAdminUserTools
        usersFrgmt={_.compact(_.map(data.adminUsersV2?.edges, 'node'))}
        columnOverrides={columnOverrides}
        page={1}
        pageSize={10}
        total={1}
        viewParams={{ tab: 'users', status: 'ACTIVE', filter: null }}
        openedUserId={openedUserId}
      />
    );
  };

  const renderUsers = (
    props: React.ComponentProps<typeof UsersRenderer> = {},
    enabled = true,
  ) => {
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        UserV2: () => ({
          id: USER_GLOBAL_ID,
          basicInfo: {
            email: 'admin@example.com',
            fullName: 'Admin',
            username: 'admin',
          },
          organization: {
            domainName: 'default',
            role: 'SUPERADMIN',
            resourcePolicy: 'default',
            mainAccessKey: 'AKIAEXAMPLE',
          },
          status: { status: 'ACTIVE', statusInfo: null },
          timestamps: { createdAt: '2026-01-01', modifiedAt: '2026-02-01' },
        }),
      }),
    );
    return render(
      <RelayEnvironmentProvider environment={environment}>
        {shell(<UsersRenderer {...props} />, enabled)}
      </RelayEnvironmentProvider>,
    );
  };

  it('registers nothing when WebMCP is off', async () => {
    const { container } = renderUsers({}, false);
    await waitFor(() => expect(container).toBeEmptyDOMElement());

    expect(modelContextGetter).not.toHaveBeenCalled();
    expect(registerTool).not.toHaveBeenCalled();
  });

  it('registers the read-only user triple', async () => {
    renderUsers();

    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));
    expect(registerTool.mock.calls.map(([tool]) => tool.name).sort()).toEqual([
      'bai_get_current_user',
      'bai_get_user_filter',
      'bai_list_visible_user',
    ]);
    for (const [tool] of registerTool.mock.calls) {
      expect(tool.annotations).toEqual({
        readOnlyHint: true,
        untrustedContentHint: true,
      });
    }
  });

  it('lists the rendered users, pruned by the column settings', async () => {
    renderUsers({
      columnOverrides: {
        main_access_key: { hidden: true },
        email: { hidden: true },
      },
    });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_list_visible_user').execute({}),
    ).resolves.toEqual({
      rows: [
        {
          id: USER_UUID,
          email: 'admin@example.com',
          username: 'admin',
          fullName: 'Admin',
          domainName: 'default',
          role: 'SUPERADMIN',
          resourcePolicy: 'default',
          status: 'ACTIVE',
          statusInfo: null,
          createdAt: '2026-01-01',
          modifiedAt: '2026-02-01',
        },
      ],
      count: 1,
      page: 1,
      pageSize: 10,
      total: 1,
    });
  });

  it('reports the tab view and the user whose modal is open', async () => {
    renderUsers({ openedUserId: USER_GLOBAL_ID });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(toolNamed('bai_get_user_filter').execute({})).resolves.toEqual(
      {
        path: '/admin/users?tab=users&status=ACTIVE&current=1&pageSize=10',
        searchParams: {
          tab: 'users',
          status: 'ACTIVE',
          current: '1',
          pageSize: '10',
        },
      },
    );
    await expect(
      toolNamed('bai_get_current_user').execute({}),
    ).resolves.toMatchObject({
      current: { id: USER_UUID, email: 'admin@example.com', path: null },
    });
  });
});

describe('WebMCPAdminKeypairTools', () => {
  const KEYPAIR = {
    access_key: 'AKIAEXAMPLE',
    user_id: 'admin@example.com',
    full_name: 'Admin',
    is_admin: true,
    created_at: '2026-01-01',
    last_used: null,
    resource_policy: 'default',
    rate_limit: 1000,
    num_queries: 7,
    concurrency_used: 1,
  };

  const renderKeypairs = (openedAccessKey?: string) =>
    render(
      shell(
        <WebMCPAdminKeypairTools
          keypairs={[KEYPAIR, null]}
          page={1}
          pageSize={20}
          total={1}
          viewParams={{ tab: 'credentials', activeType: 'active' }}
          openedAccessKey={openedAccessKey}
        />,
      ),
    );

  it('lists every rendered keypair, keyed by access key', async () => {
    renderKeypairs();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_list_visible_keypair').execute({}),
    ).resolves.toEqual({
      rows: [
        {
          id: 'AKIAEXAMPLE',
          userId: 'admin@example.com',
          fullName: 'Admin',
          isAdmin: true,
          createdAt: '2026-01-01',
          lastUsed: null,
          resourcePolicy: 'default',
          rateLimit: 1000,
          numQueries: 7,
          concurrencyUsed: 1,
        },
      ],
      count: 1,
      page: 1,
      pageSize: 20,
      total: 1,
    });
  });

  it('reports the keypair whose modal is open, or null', async () => {
    renderKeypairs('AKIAEXAMPLE');
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_keypair').execute({}),
    ).resolves.toMatchObject({ current: { id: 'AKIAEXAMPLE', path: null } });
  });
});
