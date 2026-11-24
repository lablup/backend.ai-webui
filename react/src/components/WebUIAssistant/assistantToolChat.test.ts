/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  modelOutputOf,
  offeredPageTools,
  searchManualResult,
  toolSetOf,
} from './assistantToolChat';
import { createPageToolRegistry } from './pageToolRegistry';
import type { WebMCPToolDescriptor } from 'backend.ai-ui';

const descriptor = (
  name: string,
  execute: WebMCPToolDescriptor['execute'] = async () => ({ name }),
): WebMCPToolDescriptor => ({
  name,
  description: name,
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  execute,
});

const callOptions = { toolCallId: 'call-1', messages: [] };

describe('offeredPageTools', () => {
  it('offers only the acting tools, in a fixed order', () => {
    const names = offeredPageTools([
      descriptor('bai_prepare_dashboard'),
      descriptor('bai_list_visible_session'),
      descriptor('bai_navigate'),
    ]).map((tool) => tool.name);
    expect(names).toEqual(['bai_navigate', 'bai_prepare_dashboard']);
  });
});

describe('searchManualResult', () => {
  it('gives each excerpt a title and the URL to cite', () => {
    expect(
      searchManualResult(
        [
          {
            page: 'vfolder',
            pageTitle: 'Data',
            heading: 'Share a folder',
            anchor: 'share',
            text: 'Open the folder and press Share.',
          },
        ],
        'https://docs/en/',
      ),
    ).toEqual({
      results: [
        {
          title: 'Data › Share a folder',
          url: 'https://docs/en/vfolder.html#share',
          text: 'Open the folder and press Share.',
        },
      ],
    });
    expect(searchManualResult(null, '')).toHaveProperty('error');
  });
});

describe('toolSetOf', () => {
  it('calls the registration current at call time', async () => {
    const registry = createPageToolRegistry();
    registry.registerTool(descriptor('bai_get_current_page', async () => 1));
    const tools = toolSetOf(registry, () => null);
    registry.registerTool(descriptor('bai_get_current_page', async () => 2));
    await expect(
      tools.bai_get_current_page.execute?.({}, callOptions),
    ).resolves.toBe(2);
  });

  it('opens the launcher before filling it when the launcher tool is not mounted', async () => {
    const registry = createPageToolRegistry();
    const navigate = vi.fn(async () => {
      registry.registerTool(
        descriptor('bai_prepare_session', async (input) => ({ filled: input })),
      );
      return { path: '/session/start' };
    });
    registry.registerTool(descriptor('bai_navigate', navigate));
    const tools = toolSetOf(registry, () => null);
    await expect(
      tools.bai_prepare_session.execute?.({ cpu: 2 }, callOptions),
    ).resolves.toEqual({ filled: { cpu: 2 } });
    expect(navigate).toHaveBeenCalledWith({ path: '/session/start' });
  });

  it('always offers the manual search', async () => {
    const tools = toolSetOf(createPageToolRegistry(), (query) => ({ query }));
    await expect(
      tools.search_manual.execute?.({ query: 'share' }, callOptions),
    ).resolves.toEqual({ query: 'share' });
  });
});

describe('modelOutputOf', () => {
  it('drops what only a browser agent needs', () => {
    expect(
      modelOutputOf({
        path: '/a',
        webui_url: 'https://x/a',
        nextStep: 'Give webui_url to the user.',
        draft: ['x'],
        applied: ['x'],
      }),
    ).toEqual({ applied: ['x'] });
    expect(modelOutputOf('text')).toBe('text');
  });
});
