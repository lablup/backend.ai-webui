#!/usr/bin/env node
// FR-3750 prototype — minimal MCP stdio client that spawns
// @mcp-b/webmcp-local-relay and calls WebMCP tools exposed by open browser tabs.
// No SDK dependency: hand-rolled newline-delimited JSON-RPC.
//
//   node scripts/webmcp-client.mjs list
//   node scripts/webmcp-client.mjs call whoami
//   node scripts/webmcp-client.mjs call open_session_detail '{"session_id":"..."}'
//   node scripts/webmcp-client.mjs watch 30     # print tools/list every 1s for N seconds
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// The package's exports map hides package.json, so resolve the main entry and walk up.
const require = createRequire(path.join(here, '..', 'react', 'package.json'));
const relayMain = require.resolve('@mcp-b/webmcp-local-relay');
const relayCli = path.join(path.dirname(relayMain), 'cli.mjs');

const relay = spawn(process.execPath, [relayCli, ...(process.env.RELAY_ARGS?.split(' ') ?? [])], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let nextId = 1;
const pending = new Map();
let buf = '';
relay.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      console.error('[relay stdout]', line);
      continue;
    }
    if (msg.id !== undefined && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method) {
      console.error(`[notification] ${msg.method}`, JSON.stringify(msg.params ?? {}));
    }
  }
});

const send = (method, params) =>
  new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    relay.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
const notify = (method, params) =>
  relay.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');

const t0 = performance.now();
const ms = () => (performance.now() - t0).toFixed(0) + 'ms';

await send('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'fr-3750-client', version: '0.0.0' },
});
notify('notifications/initialized');
console.error(`[client] initialized at ${ms()}`);

const [cmd = 'list', a1, a2] = process.argv.slice(2);
const listTools = async () => {
  const r = await send('tools/list', {});
  return (r.result?.tools ?? []).map((t) => t.name);
};

// The relay needs a moment for the browser tab to (re)connect after spawn.
const waitForTabTools = async (timeoutMs = 8000) => {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const names = await listTools();
    if (names.some((n) => !n.startsWith('webmcp_'))) return names;
    await new Promise((r) => setTimeout(r, 250));
  }
  return listTools();
};

if (cmd === 'list') {
  const names = await waitForTabTools();
  console.log(`[${ms()}] tools:`, names);
  const src = await send('tools/call', { name: 'webmcp_list_sources', arguments: {} });
  console.log(`[${ms()}] sources:`, JSON.stringify(src.result, null, 2));
} else if (cmd === 'call') {
  await waitForTabTools();
  const args = a2 ? JSON.parse(a2) : {};
  const started = performance.now();
  const r = await send('tools/call', { name: a1, arguments: args });
  console.log(`[${ms()}] call ${a1} took ${(performance.now() - started).toFixed(0)}ms`);
  console.log(JSON.stringify(r.result ?? r.error, null, 2));
} else if (cmd === 'watch') {
  const seconds = Number(a1 ?? 30);
  let last = '';
  const end = performance.now() + seconds * 1000;
  while (performance.now() < end) {
    const names = (await listTools()).sort().join(',');
    if (names !== last) {
      console.log(`[${ms()}] tools changed:`, names);
      last = names;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}
relay.kill();
process.exit(0);
