/**
 * A stand-in for `@mcp-b/webmcp-local-relay`, for `relay-client.test.ts`.
 *
 * Speaks the same newline-delimited JSON-RPC over stdio and answers
 * `tools/list` / `tools/call` from a canned scenario handed in as
 * `$FAKE_RELAY_SCENARIO` (JSON: `{ sources, openResult, isError }`). Kept as a
 * real spawned process on purpose — the transport is what the test is about.
 */
const scenario = JSON.parse(process.env.FAKE_RELAY_SCENARIO ?? '{}');
const sources = scenario.sources ?? [];

/** Mirrors the relay's own disambiguation: a tab-id suffix when tabs collide. */
const publicName = (source) =>
  sources.length > 1
    ? `bai_open_resource_${String(source.tabId).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 4)}`
    : 'bai_open_resource';

const relayedTools = sources.map((source) => ({
  name: publicName(source),
  originalName: 'bai_open_resource',
  description: 'Navigate this Backend.AI WebUI tab to a resource.',
  sources: [source],
}));

const wrap = (payload) => ({
  content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  structuredContent: payload,
});

const send = (message) => {
  process.stdout.write(`${JSON.stringify(message)}\n`);
};

const callTool = (name, args) => {
  if (name === 'webmcp_list_sources') {
    return wrap({ count: sources.length, sources });
  }
  if (name === 'webmcp_list_tools') {
    return wrap({ count: relayedTools.length, tools: relayedTools });
  }
  const tool = relayedTools.find((one) => one.name === name);
  if (!tool) {
    return {
      content: [{ type: 'text', text: `Tool "${name}" not found.` }],
      isError: true,
    };
  }
  if (scenario.isError) {
    return {
      content: [{ type: 'text', text: 'the tab refused' }],
      structuredContent: { code: 'unknown_type', message: 'the tab refused' },
      isError: true,
    };
  }
  return wrap({
    tab: tool.sources[0].tabId,
    path: scenario.openPath ?? `/opened/${args?.type}/${args?.id ?? ''}`,
    title: tool.sources[0].title ?? '',
  });
};

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  for (;;) {
    const index = buffer.indexOf('\n');
    if (index < 0) return;
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    if (message.id === undefined) continue; // notification
    if (message.method === 'initialize') {
      send({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          serverInfo: { name: 'fake-webmcp-local-relay', version: '4.0.0' },
        },
      });
      continue;
    }
    if (message.method === 'tools/list') {
      send({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          tools: [
            { name: 'webmcp_list_sources' },
            { name: 'webmcp_list_tools' },
            { name: 'webmcp_call_tool' },
            ...relayedTools.map((tool) => ({ name: tool.name })),
          ],
        },
      });
      continue;
    }
    if (message.method === 'tools/call') {
      send({
        jsonrpc: '2.0',
        id: message.id,
        result: callTool(message.params?.name, message.params?.arguments),
      });
      continue;
    }
    send({
      jsonrpc: '2.0',
      id: message.id,
      error: { code: -32601, message: `Method not found: ${message.method}` },
    });
  }
});
