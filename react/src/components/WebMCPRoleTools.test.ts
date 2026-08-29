/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3767: the `/admin/rbac` role tools. The role drawer is URL state, so
 * `bai_get_current_role`'s `webui_path` is the `resourcePath` role ref — the
 * same link `bai_open_resource {"type":"role"}` navigates to.
 */
import type { WebMCPRoleToolsFragment$data } from '../__generated__/WebMCPRoleToolsFragment.graphql';
import type { WebMCPTool } from '../hooks/useWebMCPTool';
import {
  createRoleTools,
  currentRoleItem,
  roleFilterText,
  roleRows,
} from './WebMCPRoleTools';
import type { CallToolResult } from '@mcp-b/webmcp-types';
import { describe, expect, it } from 'vitest';

const roles = [
  {
    id: 'Um9sZTpyLTE=',
    name: 'superadmin',
    description: 'Everything',
    source: 'SYSTEM',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00+00:00',
    updatedAt: '2026-02-01T00:00:00+00:00',
    scopes: {
      count: 2,
      edges: [
        { node: { scopeType: 'domain', scopeId: 'default' } },
        { node: null },
      ],
    },
  },
  {
    id: 'Um9sZTpyLTI=',
    name: 'viewer',
    description: null,
    source: 'CUSTOM',
    status: 'DELETED',
    createdAt: '2026-03-01T00:00:00+00:00',
    updatedAt: null,
    scopes: null,
  },
] as unknown as WebMCPRoleToolsFragment$data;

const run = (tool: WebMCPTool): CallToolResult =>
  tool.execute({}, {} as never) as CallToolResult;

describe('roleRows', () => {
  it('flattens the fragment onto the columns the table shows', () => {
    expect(roleRows(roles)[0]).toEqual({
      id: 'Um9sZTpyLTE=',
      name: 'superadmin',
      description: 'Everything',
      source: 'SYSTEM',
      status: 'ACTIVE',
      created_at: '2026-01-01T00:00:00+00:00',
      updated_at: '2026-02-01T00:00:00+00:00',
      scope_count: 2,
      scopes: [{ scope_type: 'domain', scope_id: 'default' }],
    });
  });

  it('reports a role with no scopes as an empty scope list', () => {
    expect(roleRows(roles)[1]).toMatchObject({
      description: null,
      updated_at: null,
      scope_count: null,
      scopes: [],
    });
  });
});

describe('roleFilterText', () => {
  it("renders the page's JSON filter object as text", () => {
    expect(roleFilterText({ name: { contains: 'admin' } })).toBe(
      '{"name":{"contains":"admin"}}',
    );
    expect(roleFilterText('name == "x"')).toBe('name == "x"');
    expect(roleFilterText(null)).toBeNull();
    expect(roleFilterText(undefined)).toBeNull();
  });
});

describe('currentRoleItem', () => {
  const rows = roleRows(roles);

  it('resolves the roleDetail param to its row and deep link', () => {
    expect(currentRoleItem(rows, 'Um9sZTpyLTI=')).toEqual({
      current: rows[1],
      webui_path: '/admin/rbac?roleDetail=Um9sZTpyLTI%3D',
    });
  });

  it('is null on both keys when the drawer is closed', () => {
    expect(currentRoleItem(rows, null)).toEqual({
      current: null,
      webui_path: null,
    });
  });
});

describe('role page tools', () => {
  const rows = roleRows(roles);
  const [listTool, currentTool, filterTool] = createRoleTools(
    { rows, count: 2, page: 1, pageSize: 10, sort: 'name' },
    currentRoleItem(rows, 'Um9sZTpyLTE='),
    {
      filter: roleFilterText({ name: { contains: 'admin' } }),
      status: 'ACTIVE',
      tab: 'roles',
      current: 1,
      pageSize: 10,
    },
  );

  it('registers exactly the three read-only role tools', () => {
    expect([listTool.name, currentTool.name, filterTool.name]).toEqual([
      'bai_list_visible_role',
      'bai_get_current_role',
      'bai_get_role_filter',
    ]);
    expect(
      [listTool, currentTool, filterTool].every(
        (tool) => tool.annotations?.readOnlyHint === true,
      ),
    ).toBe(true);
    expect(filterTool.inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false,
    });
  });

  it('lists the rendered rows with the count, page and sort', () => {
    expect(run(listTool).structuredContent).toEqual({
      rows,
      count: 2,
      page: 1,
      pageSize: 10,
      sort: 'name',
    });
  });

  it('answers the open drawer with its row and the role ref path', () => {
    expect(run(currentTool).structuredContent).toEqual({
      current: rows[0],
      webui_path: '/admin/rbac?roleDetail=Um9sZTpyLTE%3D',
    });
  });

  it('reports the RBAC list URL params', () => {
    expect(run(filterTool).structuredContent).toEqual({
      filter: '{"name":{"contains":"admin"}}',
      status: 'ACTIVE',
      tab: 'roles',
      current: 1,
      pageSize: 10,
    });
  });
});
