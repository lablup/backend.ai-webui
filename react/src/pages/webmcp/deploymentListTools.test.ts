/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3766: `/deployments` registers the read-only triple, and
 * `/deployments/:id` registers only `bai_get_current_deployment` — the detail
 * page is not a list.
 */
import { getModelContext, isWebMCPEnabled } from '../../helper/webmcp';
import type { WebMCPTool } from '../../hooks/useWebMCPTool';
import {
  DEPLOYMENT_ROW_PROPERTIES,
  toDeploymentRow,
  useDeploymentDetailWebMCPTools,
  useDeploymentListWebMCPTools,
  type DeploymentListWebMCPToolsInput,
} from './deploymentListTools';
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

/** `btoa('ModelDeployment:dep-1')` / `…:dep-2` — real global-id shapes. */
const GLOBAL_ID_1 = btoa('ModelDeployment:dep-1');
const GLOBAL_ID_2 = btoa('ModelDeployment:dep-2');

const DEPLOYMENTS = [
  {
    id: GLOBAL_ID_1,
    metadata: { name: 'llama', status: 'READY' },
    currentRevision: { revisionNumber: 3 },
  },
  {
    id: GLOBAL_ID_2,
    metadata: { name: 'mistral', status: 'STOPPED' },
    currentRevision: null,
  },
];

const INPUT: DeploymentListWebMCPToolsInput = {
  deployments: DEPLOYMENTS,
  pagination: { current: 1, pageSize: 10, total: 2 },
  queryParams: {
    filter: { name: { iContains: 'lla' } },
    statusCategory: 'running',
    order: 'NAME_ASC',
  },
  openedDeploymentGlobalId: null,
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

describe('useDeploymentListWebMCPTools', () => {
  it('registers exactly the three read-only deployment tools', () => {
    renderHook(() => useDeploymentListWebMCPTools(INPUT));

    const tools = registered();
    expect(Object.keys(tools).sort()).toEqual([
      'bai_get_current_deployment',
      'bai_get_deployment_filter',
      'bai_list_visible_deployment',
    ]);
    Object.values(tools).forEach((tool) => {
      expect(tool.annotations?.readOnlyHint).toBe(true);
    });
  });

  it('answers with the rendered rows, keyed by the id the router uses', () => {
    renderHook(() => useDeploymentListWebMCPTools(INPUT));

    expect(structured(registered()['bai_list_visible_deployment'])).toEqual({
      rows: [
        { id: 'dep-1', name: 'llama', status: 'READY', revision: 3 },
        { id: 'dep-2', name: 'mistral', status: 'STOPPED', revision: null },
      ],
      count: 2,
      page: 1,
      pageSize: 10,
      total: 2,
    });
  });

  it('declares the row shape as a JSON-Schema literal', () => {
    renderHook(() => useDeploymentListWebMCPTools(INPUT));

    expect(
      registered()['bai_list_visible_deployment'].outputSchema,
    ).toMatchObject({
      properties: {
        rows: {
          items: { properties: DEPLOYMENT_ROW_PROPERTIES, required: ['id'] },
        },
      },
    });
  });

  it('reports the JSON filter as the string the URL carries', () => {
    renderHook(() => useDeploymentListWebMCPTools(INPUT));

    expect(structured(registered()['bai_get_deployment_filter'])).toEqual({
      resource: 'deployment',
      filter: '{"name":{"iContains":"lla"}}',
      statusCategory: 'running',
      order: 'NAME_ASC',
      current: 1,
      pageSize: 10,
    });
  });

  it('omits an empty filter object entirely', () => {
    renderHook(() =>
      useDeploymentListWebMCPTools({
        ...INPUT,
        queryParams: { filter: {}, statusCategory: 'finished' },
      }),
    );

    expect(structured(registered()['bai_get_deployment_filter'])).toEqual({
      resource: 'deployment',
      statusCategory: 'finished',
      current: 1,
      pageSize: 10,
    });
  });

  it('reports the deployment open in the settings modal', () => {
    renderHook(() =>
      useDeploymentListWebMCPTools({
        ...INPUT,
        openedDeploymentGlobalId: GLOBAL_ID_2,
      }),
    );

    expect(structured(registered()['bai_get_current_deployment'])).toEqual({
      current: {
        ...toDeploymentRow(DEPLOYMENTS[1]),
        webui_path: '/deployments/dep-2',
      },
    });
  });

  it('registers nothing when the WebMCP flag is off', () => {
    vi.mocked(isWebMCPEnabled).mockReturnValue(false);

    renderHook(() => useDeploymentListWebMCPTools(INPUT));

    expect(registerTool).not.toHaveBeenCalled();
  });
});

describe('useDeploymentDetailWebMCPTools', () => {
  it('registers only bai_get_current_deployment, for the viewed deployment', () => {
    renderHook(() => useDeploymentDetailWebMCPTools(DEPLOYMENTS[0]));

    expect(Object.keys(registered())).toEqual(['bai_get_current_deployment']);
    expect(structured(registered()['bai_get_current_deployment'])).toEqual({
      current: {
        id: 'dep-1',
        name: 'llama',
        status: 'READY',
        revision: 3,
        webui_path: '/deployments/dep-1',
      },
    });
  });

  it('answers null while the deployment is inaccessible', () => {
    renderHook(() => useDeploymentDetailWebMCPTools(null));

    expect(structured(registered()['bai_get_current_deployment'])).toEqual({
      current: null,
    });
  });

  it('registers nothing when the WebMCP flag is off', () => {
    vi.mocked(isWebMCPEnabled).mockReturnValue(false);

    renderHook(() => useDeploymentDetailWebMCPTools(DEPLOYMENTS[0]));

    expect(registerTool).not.toHaveBeenCalled();
  });
});
