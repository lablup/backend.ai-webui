/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3766: `/model-store` registers the read-only triple. The page has no
 * status category (see `LIST_RESOURCES_WITHOUT_STATUS`) — `sort` carries the
 * ordering instead — and no table settings, so no column can be hidden.
 */
import { getModelContext, isWebMCPEnabled } from '../../helper/webmcp';
import type { WebMCPTool } from '../../hooks/useWebMCPTool';
import {
  MODEL_CARD_ROW_PROPERTIES,
  toModelCardRow,
  useModelStoreListWebMCPTools,
  type ModelStoreListWebMCPToolsInput,
} from './modelStoreListTools';
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

const MODEL_CARDS = [
  {
    id: 'TW9kZWxDYXJkVjI6MQ==',
    name: 'llama-3-8b',
    metadata: { title: 'Llama 3 8B', task: 'text-generation', author: 'Meta' },
  },
  {
    id: 'TW9kZWxDYXJkVjI6Mg==',
    name: 'whisper',
    metadata: { title: null, task: 'asr', author: null },
  },
];

const INPUT: ModelStoreListWebMCPToolsInput = {
  modelCards: MODEL_CARDS,
  pagination: { current: 1, pageSize: 10, total: 2 },
  queryParams: {
    filter: { name: { iContains: 'lla' } },
    sort: 'CREATED_AT_DESC',
  },
  openedModelCardId: null,
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

describe('useModelStoreListWebMCPTools', () => {
  it('registers exactly the three read-only model-card tools', () => {
    renderHook(() => useModelStoreListWebMCPTools(INPUT));

    expect(Object.keys(registered()).sort()).toEqual([
      'bai_get_current_model_card',
      'bai_get_model_card_filter',
      'bai_list_visible_model_card',
    ]);
    Object.values(registered()).forEach((tool) => {
      expect(tool.annotations?.readOnlyHint).toBe(true);
    });
  });

  it('answers with the rendered cards', () => {
    renderHook(() => useModelStoreListWebMCPTools(INPUT));

    expect(structured(registered()['bai_list_visible_model_card'])).toEqual({
      rows: [
        {
          id: MODEL_CARDS[0].id,
          name: 'llama-3-8b',
          title: 'Llama 3 8B',
          task: 'text-generation',
          author: 'Meta',
        },
        {
          id: MODEL_CARDS[1].id,
          name: 'whisper',
          title: null,
          task: 'asr',
          author: null,
        },
      ],
      count: 2,
      page: 1,
      pageSize: 10,
      total: 2,
    });
  });

  it('declares the row shape as a JSON-Schema literal', () => {
    renderHook(() => useModelStoreListWebMCPTools(INPUT));

    expect(
      registered()['bai_list_visible_model_card'].outputSchema,
    ).toMatchObject({
      properties: {
        rows: {
          items: { properties: MODEL_CARD_ROW_PROPERTIES, required: ['id'] },
        },
      },
    });
  });

  it('reports sort instead of a status category', () => {
    renderHook(() => useModelStoreListWebMCPTools(INPUT));

    const filter = structured(registered()['bai_get_model_card_filter']);
    expect(filter).toEqual({
      resource: 'model_card',
      filter: '{"name":{"iContains":"lla"}}',
      sort: 'CREATED_AT_DESC',
      current: 1,
      pageSize: 10,
    });
    expect(filter).not.toHaveProperty('statusCategory');
  });

  it('reports the card open in the drawer', () => {
    renderHook(() =>
      useModelStoreListWebMCPTools({
        ...INPUT,
        openedModelCardId: MODEL_CARDS[0].id,
      }),
    );

    expect(structured(registered()['bai_get_current_model_card'])).toEqual({
      current: {
        ...toModelCardRow(MODEL_CARDS[0]),
        webui_path: `/model-store?modelCard=${encodeURIComponent(MODEL_CARDS[0].id)}`,
      },
    });
  });

  it('answers null when the drawer is closed', () => {
    renderHook(() => useModelStoreListWebMCPTools(INPUT));

    expect(structured(registered()['bai_get_current_model_card'])).toEqual({
      current: null,
    });
  });

  it('registers nothing when the WebMCP flag is off', () => {
    vi.mocked(isWebMCPEnabled).mockReturnValue(false);

    renderHook(() => useModelStoreListWebMCPTools(INPUT));

    expect(registerTool).not.toHaveBeenCalled();
  });
});
