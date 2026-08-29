/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3766: `/data` registers the read-only triple; "current" is the folder the
 * explorer modal has open, whose URL id has its dashes stripped.
 */
import { getModelContext, isWebMCPEnabled } from '../../helper/webmcp';
import type { WebMCPTool } from '../../hooks/useWebMCPTool';
import {
  VFOLDER_ROW_PROPERTIES,
  toVFolderRow,
  useVFolderListWebMCPTools,
  type VFolderListWebMCPToolsInput,
} from './vfolderListTools';
import type { CallToolResult, ModelContext } from '@mcp-b/webmcp-types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../helper/webmcp', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../helper/webmcp')>();
  return {
    ...actual,
    isWebMCPEnabled: vi.fn(() => true),
    getModelContext: vi.fn(),
  };
});

const registerTool =
  vi.fn<
    (tool: WebMCPTool, options: { signal: AbortSignal }) => Promise<void>
  >();
const modelContext = { registerTool } as unknown as ModelContext;

const FOLDER_UUID = 'bbbbbbbb-1111-2222-3333-444444444444';
const VFOLDERS = [
  {
    id: btoa(`VirtualFolderNode:${FOLDER_UUID}`),
    name: 'datasets',
    status: 'READY',
    host: 'local:volume1',
    usage_mode: 'general',
    ownership_type: 'user',
    created_at: '2026-01-01T00:00:00+00:00',
  },
];

const INPUT: VFolderListWebMCPToolsInput = {
  vfolders: VFOLDERS,
  pagination: { current: 1, pageSize: 10, total: 1 },
  queryParams: {
    filter: 'name ilike "%data%"',
    statusCategory: 'active',
    order: '-created_at',
    mode: 'general',
  },
  openedFolderId: null,
};

const registered = (): Record<string, WebMCPTool> =>
  Object.fromEntries(
    registerTool.mock.calls.map(([tool]) => [tool.name, tool] as const),
  );

const structured = (tool: WebMCPTool): unknown =>
  (tool.execute({}, {} as never) as CallToolResult).structuredContent;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isWebMCPEnabled).mockReturnValue(true);
  vi.mocked(getModelContext).mockReturnValue(modelContext);
});

describe('useVFolderListWebMCPTools', () => {
  it('registers exactly the three read-only vfolder tools', () => {
    renderHook(() => useVFolderListWebMCPTools(INPUT));

    expect(Object.keys(registered()).sort()).toEqual([
      'bai_get_current_vfolder',
      'bai_get_vfolder_filter',
      'bai_list_visible_vfolder',
    ]);
    Object.values(registered()).forEach((tool) => {
      expect(tool.annotations?.readOnlyHint).toBe(true);
    });
  });

  it('answers with the rendered rows, keyed by the folder UUID', () => {
    renderHook(() => useVFolderListWebMCPTools(INPUT));

    expect(structured(registered()['bai_list_visible_vfolder'])).toEqual({
      rows: [
        {
          id: FOLDER_UUID,
          name: 'datasets',
          status: 'READY',
          host: 'local:volume1',
          usage_mode: 'general',
          ownership_type: 'user',
          created_at: '2026-01-01T00:00:00+00:00',
        },
      ],
      count: 1,
      page: 1,
      pageSize: 10,
      total: 1,
    });
  });

  it('declares the row shape as a JSON-Schema literal', () => {
    renderHook(() => useVFolderListWebMCPTools(INPUT));

    expect(registered()['bai_list_visible_vfolder'].outputSchema).toMatchObject(
      {
        properties: {
          rows: {
            items: { properties: VFOLDER_ROW_PROPERTIES, required: ['id'] },
          },
        },
      },
    );
  });

  it('drops the columns the user hid', () => {
    renderHook(() =>
      useVFolderListWebMCPTools({
        ...INPUT,
        columnOverrides: { host: { hidden: true }, name: { hidden: false } },
      }),
    );

    const rows = (
      structured(registered()['bai_list_visible_vfolder']) as {
        rows: Array<Record<string, unknown>>;
      }
    ).rows;
    expect(rows[0]).not.toHaveProperty('host');
    expect(rows[0]).toMatchObject({ id: FOLDER_UUID, name: 'datasets' });
  });

  it('mirrors the URL params, usage-mode tab included', () => {
    renderHook(() => useVFolderListWebMCPTools(INPUT));

    expect(structured(registered()['bai_get_vfolder_filter'])).toEqual({
      resource: 'vfolder',
      filter: 'name ilike "%data%"',
      statusCategory: 'active',
      order: '-created_at',
      mode: 'general',
      current: 1,
      pageSize: 10,
    });
  });

  it('matches the explorer folder id even with its dashes stripped', () => {
    renderHook(() =>
      useVFolderListWebMCPTools({
        ...INPUT,
        openedFolderId: FOLDER_UUID.replaceAll('-', ''),
        openedFolderPath: 'sub/dir',
      }),
    );

    expect(structured(registered()['bai_get_current_vfolder'])).toEqual({
      current: {
        ...toVFolderRow(VFOLDERS[0]),
        path: 'sub/dir',
        webui_path: `/data?folder=${FOLDER_UUID}&path=sub%2Fdir`,
      },
    });
  });

  it('answers null when the explorer is closed', () => {
    renderHook(() => useVFolderListWebMCPTools(INPUT));

    expect(structured(registered()['bai_get_current_vfolder'])).toEqual({
      current: null,
    });
  });

  it('registers nothing when the WebMCP flag is off', () => {
    vi.mocked(isWebMCPEnabled).mockReturnValue(false);

    renderHook(() => useVFolderListWebMCPTools(INPUT));

    expect(registerTool).not.toHaveBeenCalled();
  });
});
