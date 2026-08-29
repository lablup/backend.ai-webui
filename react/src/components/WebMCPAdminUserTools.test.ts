/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3767: the two tabs of `/admin/users` — `user` and `keypair`. Neither has a
 * detail deep link, so both `bai_get_current_*` tools answer `webui_path: null`
 * and say so in their description.
 */
import type { WebMCPAdminUserToolsFragment$data } from '../__generated__/WebMCPAdminUserToolsFragment.graphql';
import { findRowById } from '../helper/webmcpAdminPageTools';
import type { WebMCPTool } from '../hooks/useWebMCPTool';
import {
  createAdminKeypairTools,
  createAdminUserTools,
  keypairRows,
  userRows,
  type WebMCPKeypairInput,
} from './WebMCPAdminUserTools';
import type { CallToolResult } from '@mcp-b/webmcp-types';
import { describe, expect, it } from 'vitest';

const users = [
  {
    id: 'VXNlclYyOnUtMQ==',
    basicInfo: {
      email: 'admin@lablup.com',
      fullName: 'Admin',
      username: 'admin',
    },
    organization: {
      domainName: 'default',
      role: 'SUPERADMIN',
      resourcePolicy: 'default',
      mainAccessKey: 'AKIA-ADMIN',
    },
    status: { status: 'ACTIVE' },
  },
  {
    id: 'VXNlclYyOnUtMg==',
    basicInfo: { email: 'user@lablup.com', fullName: null, username: 'user' },
    organization: null,
    status: { status: 'INACTIVE' },
  },
] as unknown as WebMCPAdminUserToolsFragment$data;

const keypairs: Array<WebMCPKeypairInput | null> = [
  {
    id: 'kp-1',
    access_key: 'AKIA-ADMIN',
    user_id: 'admin@lablup.com',
    is_admin: true,
    resource_policy: 'default',
    rate_limit: 30000,
    num_queries: 12,
    concurrency_used: 1,
    created_at: '2026-01-01T00:00:00+00:00',
  },
  null,
];

const run = (tool: WebMCPTool): CallToolResult =>
  tool.execute({}, {} as never) as CallToolResult;

describe('userRows', () => {
  it('flattens the fragment onto the columns the Users tab shows', () => {
    expect(userRows(users)[0]).toEqual({
      id: 'VXNlclYyOnUtMQ==',
      email: 'admin@lablup.com',
      full_name: 'Admin',
      username: 'admin',
      domain: 'default',
      role: 'SUPERADMIN',
      resource_policy: 'default',
      main_access_key: 'AKIA-ADMIN',
      status: 'ACTIVE',
    });
  });

  it('reports missing sub-objects as null columns', () => {
    expect(userRows(users)[1]).toMatchObject({
      full_name: null,
      domain: null,
      role: null,
      status: 'INACTIVE',
    });
  });
});

describe('user tab tools', () => {
  const rows = userRows(users);
  const [listTool, currentTool, filterTool] = createAdminUserTools(
    { rows, count: 2, page: 1, pageSize: 10, sort: 'email' },
    { current: findRowById(rows, 'VXNlclYyOnUtMQ=='), webui_path: null },
    {
      filter: '{"username":{"contains":"ad"}}',
      status: 'ACTIVE',
      tab: 'users',
      current: 1,
      pageSize: 10,
    },
  );

  it('registers exactly the three read-only user tools', () => {
    expect([listTool.name, currentTool.name, filterTool.name]).toEqual([
      'bai_list_visible_user',
      'bai_get_current_user',
      'bai_get_user_filter',
    ]);
    expect(
      [listTool, currentTool, filterTool].every(
        (tool) => tool.annotations?.readOnlyHint === true,
      ),
    ).toBe(true);
  });

  it('lists the rendered rows with the count, page and sort', () => {
    expect(run(listTool).structuredContent).toEqual({
      rows,
      count: 2,
      page: 1,
      pageSize: 10,
      sort: 'email',
    });
  });

  it('answers the open modal with the row and a null webui_path', () => {
    expect(run(currentTool).structuredContent).toEqual({
      current: rows[0],
      webui_path: null,
    });
    expect(currentTool.description).toContain('webui_path is always null');
  });

  it('reports the Users tab URL params', () => {
    expect(run(filterTool).structuredContent).toEqual({
      filter: '{"username":{"contains":"ad"}}',
      status: 'ACTIVE',
      tab: 'users',
      current: 1,
      pageSize: 10,
    });
  });
});

describe('keypairRows', () => {
  it('flattens keypair_list items and skips the null ones', () => {
    expect(keypairRows(keypairs)).toEqual([
      {
        id: 'kp-1',
        access_key: 'AKIA-ADMIN',
        user_id: 'admin@lablup.com',
        is_admin: true,
        resource_policy: 'default',
        rate_limit: 30000,
        num_queries: 12,
        concurrency_used: 1,
        created_at: '2026-01-01T00:00:00+00:00',
      },
    ]);
  });
});

describe('credentials tab tools', () => {
  const rows = keypairRows(keypairs);
  const [listTool, currentTool, filterTool] = createAdminKeypairTools(
    { rows, count: 1, page: 1, pageSize: 20, sort: null },
    { current: findRowById(rows, 'kp-1'), webui_path: null },
    {
      filter: null,
      status: 'inactive',
      tab: 'credentials',
      current: 1,
      pageSize: 20,
    },
  );

  it('registers exactly the three read-only keypair tools', () => {
    expect([listTool.name, currentTool.name, filterTool.name]).toEqual([
      'bai_list_visible_keypair',
      'bai_get_current_keypair',
      'bai_get_keypair_filter',
    ]);
    expect(
      [listTool, currentTool, filterTool].every(
        (tool) => tool.annotations?.readOnlyHint === true,
      ),
    ).toBe(true);
  });

  it('answers with the rendered keypair rows and the open one', () => {
    expect(run(listTool).structuredContent).toEqual({
      rows,
      count: 1,
      page: 1,
      pageSize: 20,
      sort: null,
    });
    expect(run(currentTool).structuredContent).toEqual({
      current: rows[0],
      webui_path: null,
    });
  });

  it('reports the credentials segment under the URL name activeType', () => {
    expect(run(filterTool).structuredContent).toEqual({
      filter: null,
      status: 'inactive',
      tab: 'credentials',
      current: 1,
      pageSize: 20,
    });
    expect(filterTool.description).toContain('activeType');
  });
});
