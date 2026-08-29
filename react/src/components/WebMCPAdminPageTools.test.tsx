/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3767: the admin pages' tool catalog, and the dev-only gate in front of it.
 *
 * Role gating is NOT in this code: all four pages sit under the `/admin/*`
 * subtree, whose route handles declare `access: 'admin'` (`/admin/session`,
 * `/admin/users`) or `access: 'superadmin'` (`/admin/agent`, `/admin/rbac`) and
 * are enforced by `RouteAccessGuard`. `routeMatching.test.tsx`
 * ("route-handle access declarations") is the test that pins those four
 * declarations; a non-admin never mounts the components, so the tools are never
 * registered for them.
 */
import { getModelContext, isWebMCPEnabled } from '../helper/webmcp';
import { useWebMCPTool, type WebMCPTool } from '../hooks/useWebMCPTool';
import { createAdminSessionTools } from './WebMCPAdminSessionTools';
import {
  createAdminKeypairTools,
  createAdminUserTools,
} from './WebMCPAdminUserTools';
import { createAgentTools } from './WebMCPAgentTools';
import { createRoleTools } from './WebMCPRoleTools';
import type { ModelContext } from '@mcp-b/webmcp-types';
import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../helper/webmcp', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helper/webmcp')>();
  return {
    ...actual,
    isWebMCPEnabled: vi.fn(() => true),
    getModelContext: vi.fn(),
  };
});

const mockIsWebMCPEnabled = vi.mocked(isWebMCPEnabled);
const mockGetModelContext = vi.mocked(getModelContext);

const registerTool = vi.fn();
const modelContext = { registerTool } as unknown as ModelContext;

const emptyList = { rows: [], count: 0, page: 1, pageSize: 10, sort: null };
const nothingOpen = { current: null, webui_path: null };
const noFilter = { filter: null, status: null };

/** Every tool the four admin pages register, as if all of them were mounted. */
const allAdminPageTools = (): Array<WebMCPTool> => [
  ...createAdminSessionTools(emptyList, nothingOpen, noFilter),
  ...createAgentTools(emptyList, nothingOpen, noFilter),
  ...createAdminUserTools(emptyList, nothingOpen, noFilter),
  ...createAdminKeypairTools(emptyList, nothingOpen, noFilter),
  ...createRoleTools(emptyList, nothingOpen, noFilter),
];

/**
 * Stands in for all four pages being mounted at once. The tool list has a fixed
 * length, so the loop calls the hook in a stable order.
 */
const MountAllAdminPageTools: React.FC = () => {
  allAdminPageTools().forEach((tool) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWebMCPTool(tool, []);
  });
  return null;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockIsWebMCPEnabled.mockReturnValue(true);
  mockGetModelContext.mockReturnValue(modelContext);
});

describe('admin page tool catalog', () => {
  it('is the read-only vocabulary, three tools per noun', () => {
    expect(allAdminPageTools().map((tool) => tool.name)).toEqual([
      'bai_list_visible_session',
      'bai_get_current_session',
      'bai_get_session_filter',
      'bai_list_visible_agent',
      'bai_get_current_agent',
      'bai_get_agent_filter',
      'bai_list_visible_user',
      'bai_get_current_user',
      'bai_get_user_filter',
      'bai_list_visible_keypair',
      'bai_get_current_keypair',
      'bai_get_keypair_filter',
      'bai_list_visible_role',
      'bai_get_current_role',
      'bai_get_role_filter',
    ]);
  });

  it('marks every tool read-only and argument-free', () => {
    allAdminPageTools().forEach((tool) => {
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.inputSchema).toEqual({
        type: 'object',
        properties: {},
        additionalProperties: false,
      });
      expect(tool.description.length).toBeGreaterThan(0);
    });
  });

  it('registers all of them while the pages are mounted', () => {
    render(<MountAllAdminPageTools />);

    expect(registerTool).toHaveBeenCalledTimes(15);
  });

  it('registers nothing when the dev server was started without VITE_WEBMCP=on', () => {
    mockIsWebMCPEnabled.mockReturnValue(false);

    render(<MountAllAdminPageTools />);

    expect(mockGetModelContext).not.toHaveBeenCalled();
    expect(registerTool).not.toHaveBeenCalled();
  });
});
