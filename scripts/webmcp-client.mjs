#!/usr/bin/env node
/**
 * FR-3764 — minimal MCP stdio client for the WebMCP dev loop.
 *
 * Spawns `@mcp-b/webmcp-local-relay` exactly the way Claude Code does and talks
 * to it over newline-delimited JSON-RPC, so a `bai_*` tool can be listed and
 * called against an open dev-server tab without wiring an MCP client first.
 * Requires a tab running `VITE_WEBMCP=on pnpm run dev` (see DEV_ENVIRONMENT.md).
 *
 *   node scripts/webmcp-client.mjs list
 *   node scripts/webmcp-client.mjs call bai_whoami
 *   node scripts/webmcp-client.mjs call bai_open_resource '{"type":"session","id":"<uuid>"}'
 *   node scripts/webmcp-client.mjs watch 30   # print the tool list as it changes
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// The relay is a devDependency of the `react` workspace, and its exports map
// hides `cli.mjs`, so resolve the main entry and walk to its sibling.
const require = createRequire(path.join(here, '..', 'react', 'package.json'));
const relayCli = path.join(
  path.dirname(require.resolve('@mcp-b/webmcp-local-relay')),
  'cli.mjs',
);

const relay = spawn(
  process.execPath,
  [relayCli, ...(process.env.RELAY_ARGS?.split(' ').filter(Boolean) ?? [])],
  { stdio: ['pipe', 'pipe', 'inherit'] },
);

let nextId = 1;
const pending = new Map();
let buffer = '';
relay.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  let index;
  while ((index = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      console.error('[relay]', line);
      continue;
    }
    if (message.id !== undefined && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else if (message.method) {
      console.error(`[notification] ${message.method}`);
    }
  }
});

const send = (method, params) =>
  new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    relay.stdin.write(
      `${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`,
    );
  });
const notify = (method, params) =>
  relay.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);

const started = performance.now();
const elapsed = () => `${(performance.now() - started).toFixed(0)}ms`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await send('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'bai-webmcp-client', version: '0.0.0' },
});
notify('notifications/initialized');

const listTools = async () =>
  (await send('tools/list', {})).result?.tools?.map((tool) => tool.name) ?? [];

/** The relay's own `webmcp_*` tools appear first; tab tools need a moment. */
const waitForTabTools = async (timeoutMs = 10_000) => {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    const names = await listTools();
    if (names.some((name) => !name.startsWith('webmcp_'))) return names;
    await sleep(250);
  }
  return listTools();
};

const [command = 'list', arg1, arg2] = process.argv.slice(2);

if (command === 'list') {
  console.log(`[${elapsed()}] tools:`, await waitForTabTools());
  const sources = await send('tools/call', {
    name: 'webmcp_list_sources',
    arguments: {},
  });
  console.log('sources:', JSON.stringify(sources.result, null, 2));
} else if (command === 'call') {
  await waitForTabTools();
  const callStarted = performance.now();
  const response = await send('tools/call', {
    name: arg1,
    arguments: arg2 ? JSON.parse(arg2) : {},
  });
  console.log(
    `[${elapsed()}] call ${arg1} took ${(performance.now() - callStarted).toFixed(0)}ms`,
  );
  console.log(JSON.stringify(response.result ?? response.error, null, 2));
} else if (command === 'watch') {
  const deadline = performance.now() + Number(arg1 ?? 30) * 1000;
  let previous = '';
  while (performance.now() < deadline) {
    const names = (await listTools()).sort().join(', ');
    if (names !== previous) {
      console.log(`[${elapsed()}] tools:`, names);
      previous = names;
    }
    await sleep(500);
  }
} else {
  console.error(`Unknown command "${command}". Use list | call | watch.`);
  relay.kill();
  process.exit(1);
}

relay.kill();
process.exit(0);
