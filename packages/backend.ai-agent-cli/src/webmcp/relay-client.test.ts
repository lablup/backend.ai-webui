import { RELAY_CMD_ENV, RelayClient, readStructured, resolveRelayCommand } from './relay-client.js';
import type { RelaySource } from './relay-client.js';
import { endpointHost, selectSource, tabSuggestions, titleHost, toolNameForSource } from './select-tab.js';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const FAKE_RELAY = join(import.meta.dirname, 'fake-relay.mjs');

const source = (
  tabId: string,
  title: string,
  extra: Partial<RelaySource> = {},
): RelaySource => ({
  sourceId: `src-${tabId}`,
  tabId,
  origin: 'http://127.0.0.1:4973',
  url: 'http://127.0.0.1:4973/session',
  title,
  toolCount: 2,
  ...extra,
});

/** A `RelayClient` wired to the fake server with a canned scenario. */
const fakeClient = (scenario: Record<string, unknown>): RelayClient =>
  new RelayClient({
    command: process.execPath,
    args: [FAKE_RELAY],
    timeoutMs: 5_000,
    env: { ...process.env, FAKE_RELAY_SCENARIO: JSON.stringify(scenario) },
  });

let open: RelayClient | null = null;
afterEach(async () => {
  await open?.close();
  open = null;
});

const started = async (scenario: Record<string, unknown>): Promise<RelayClient> => {
  const client = fakeClient(scenario);
  open = client;
  await client.start();
  return client;
};

describe('RelayClient over stdio JSON-RPC', () => {
  it('handshakes and lists the relay management tools', async () => {
    const client = await started({ sources: [] });
    expect(await client.listToolNames()).toContain('webmcp_list_sources');
  });

  it('reports no sources when nothing is connected', async () => {
    const client = await started({ sources: [] });
    expect(await client.listSources()).toEqual([]);
  });

  it('reports one source and calls its tool', async () => {
    const only = source('tab-1', 'Backend.AI · Sessions @ manager.example.com');
    const client = await started({ sources: [only] });

    const sources = await client.listSources();
    expect(sources).toHaveLength(1);

    const tools = await client.listRelayedTools();
    const name = toolNameForSource(tools, sources[0]);
    expect(name).toBe('bai_open_resource');

    const result = await client.callTool(name!, {
      type: 'session',
      id: 'sess-1',
    });
    expect(result.isError).toBeFalsy();
    expect(readStructured<{ path: string }>(result)?.path).toBe(
      '/opened/session/sess-1',
    );
  });

  it('routes to one of two tabs through the disambiguated tool name', async () => {
    const first = source('aaa-1', 'Backend.AI @ a.example.com');
    const second = source('bbb-2', 'Backend.AI @ b.example.com');
    const client = await started({ sources: [first, second] });

    const sources = await client.listSources();
    const tools = await client.listRelayedTools();
    // With two tabs the relay suffixes the public name with a short tab id;
    // that name IS the routing key, since a call carries no source argument.
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'bai_open_resource_aaa_',
      'bai_open_resource_bbb_',
    ]);

    const name = toolNameForSource(tools, sources[1]);
    expect(name).toBe('bai_open_resource_bbb_');
    const result = await client.callTool(name!, { type: 'session', id: 's' });
    expect(readStructured<{ tab: string }>(result)?.tab).toBe('bbb-2');
  });

  it('surfaces a tool-level refusal without throwing', async () => {
    const only = source('tab-1', 'Backend.AI');
    const client = await started({ sources: [only], isError: true });
    const tools = await client.listRelayedTools();
    const result = await client.callTool(
      toolNameForSource(tools, only)!,
      { type: 'nope' },
    );
    expect(result.isError).toBe(true);
    expect(readStructured<{ code: string }>(result)?.code).toBe('unknown_type');
  });

  it('rejects once the relay is gone', async () => {
    const client = await started({ sources: [] });
    await client.close();
    await expect(client.listSources()).rejects.toThrow();
    open = null;
  });
});

describe('resolveRelayCommand', () => {
  it('prefers the environment override', () => {
    expect(
      resolveRelayCommand(import.meta.dirname, [], {
        [RELAY_CMD_ENV]: 'node /tmp/relay.mjs --port 1',
      }),
    ).toEqual({
      command: 'node',
      args: ['/tmp/relay.mjs', '--port', '1'],
      source: 'env',
    });
  });

  it('finds the checkout copy of the relay', () => {
    const resolved = resolveRelayCommand(import.meta.dirname, [], {});
    expect(resolved.source).toBe('checkout');
    expect(resolved.args[0]).toContain('webmcp-local-relay');
  });
});

describe('tab selection', () => {
  const a = source('tab-a', 'Backend.AI · Sessions · default @ a.example.com');
  const b = source('tab-b', 'Backend.AI · Data · default @ b.example.com:8090');

  it('reads the endpoint host out of a document title', () => {
    expect(titleHost(a.title)).toBe('a.example.com');
    expect(titleHost(b.title)).toBe('b.example.com:8090');
    expect(titleHost('Backend.AI')).toBe('');
  });

  it('normalises an endpoint URL to host:port', () => {
    expect(endpointHost('https://b.example.com:8090/')).toBe(
      'b.example.com:8090',
    );
    expect(endpointHost(undefined)).toBe('');
  });

  it('reports no_webui_tab when nothing is connected', () => {
    expect(selectSource([], {})).toEqual({ ok: false, code: 'no_webui_tab' });
  });

  it('uses the only connected tab', () => {
    expect(selectSource([a], {})).toEqual({ ok: true, source: a, reason: 'only' });
  });

  it('reports ambiguous_tab for two tabs with no tie-breaker', () => {
    expect(selectSource([a, b], {})).toEqual({
      ok: false,
      code: 'ambiguous_tab',
    });
  });

  it('breaks a tie with the endpoint the CLI is logged in to', () => {
    expect(selectSource([a, b], { endpoint: 'https://b.example.com:8090' })).toEqual(
      { ok: true, source: b, reason: 'endpoint' },
    );
  });

  it('prefers the WebUI origin over the title, which the relay captures once', () => {
    const elsewhere = source('tab-c', 'Backend.AI @ b.example.com:8090');
    elsewhere.origin = 'https://fr-1.localhost:1355';
    expect(
      selectSource([a, elsewhere], {
        endpoint: 'https://b.example.com:8090',
        webuiOrigin: 'http://127.0.0.1:4973/',
      }),
    ).toEqual({ ok: true, source: a, reason: 'origin' });
  });

  it('lets --tab pick one, by id or prefix', () => {
    expect(selectSource([a, b], { tab: 'tab-b' })).toEqual({
      ok: true,
      source: b,
      reason: 'flag',
    });
    expect(selectSource([a, b], { tab: 'src-tab-a' })).toEqual({
      ok: true,
      source: a,
      reason: 'flag',
    });
  });

  it('reports not_found when --tab matches nothing', () => {
    expect(selectSource([a, b], { tab: 'tab-zzz' })).toEqual({
      ok: false,
      code: 'not_found',
    });
  });

  it('resolves the tool name from a client-mode list, where originalName is the public one', () => {
    // A relay proxying through another one reports `originalName` as the
    // already-suffixed public name; matching only on it would find nothing.
    const tools = [
      {
        name: 'bai_open_resource_bbb_',
        originalName: 'bai_open_resource_bbb_',
        sources: [b],
      },
      {
        name: 'bai_open_resource_aaa_',
        originalName: 'bai_open_resource_aaa_',
        sources: [a],
      },
    ];
    expect(toolNameForSource(tools, b)).toBe('bai_open_resource_bbb_');
    expect(toolNameForSource(tools, a)).toBe('bai_open_resource_aaa_');
  });

  it('renders one suggestion line per tab', () => {
    expect(tabSuggestions([a, b])).toEqual([
      `--tab tab-a  ${a.title}`,
      `--tab tab-b  ${b.title}`,
    ]);
  });
});
