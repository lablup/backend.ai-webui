#!/usr/bin/env node
// FR-3755 prototype — stub CLI listener (NOT product code).
//
//   node cli-listener.mjs login --endpoint http://host:8090 --webui https://fr-xxxx.localhost:1355 [--port N]
//   node cli-listener.mjs paste --endpoint http://host:8090      (reads session id from stdin)
//   node cli-listener.mjs whoami --endpoint http://host:8090     (uses stored session)
//   node cli-listener.mjs logout --endpoint http://host:8090     (local-only)
//
// Stores ~/.config/backend.ai-agent/sessions/<host>.json (0600) and makes one
// authenticated GraphQL call to {endpoint}/func/admin/gql.
import { randomBytes } from 'node:crypto';
import { chmodSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const endpoint = (opt('endpoint', process.env.BACKEND_ENDPOINT) ?? '').replace(/\/$/, '');
if (!endpoint) {
  console.error('missing --endpoint');
  process.exit(2);
}
const host = new URL(endpoint).host.replace(/[:]/g, '_');
const dir = join(homedir(), '.config', 'backend.ai-agent', 'sessions');
const file = join(dir, `${host}.json`);
const mask = (id) => (id ? `${id.slice(0, 6)}…${id.slice(-4)}` : '(none)');

function store(session) {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(file, JSON.stringify(session, null, 2), { mode: 0o600 });
  chmodSync(file, 0o600);
  console.log(`[cli] stored ${file} (0600) sessionId=${mask(session.sessionId)} email=${session.email}`);
}

function load() {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function gql(sessionId, query) {
  const res = await fetch(`${endpoint}/func/admin/gql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `AIOHTTP_SESSION=${sessionId}`,
      'X-BackendAI-SessionID': sessionId,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json().catch(() => ({}));
  // Webserver answers HTTP 200 with a GraphQL `errors` payload for a dead
  // session (error_code user_auth_unauthorized), not 401 — detect both.
  const unauthorized =
    res.status === 401 ||
    JSON.stringify(json.errors ?? '').includes('user_auth_unauthorized');
  return { status: res.status, json, unauthorized };
}

async function verify(sessionId) {
  const q = 'query { user { email username role } agents(status: "ALIVE") { id } }';
  const r = await gql(sessionId, q);
  console.log(`[cli] GET ${endpoint}/func/admin/gql -> HTTP ${r.status}`);
  if (r.unauthorized) {
    try { unlinkSync(file); } catch {}
    console.error(JSON.stringify({ error: 'auth_required', endpoint, hint: 'run login again' }));
    return false;
  }
  console.log('[cli] response:', JSON.stringify(r.json).slice(0, 300));
  return true;
}

if (cmd === 'login') {
  const state = randomBytes(16).toString('hex');
  const webui = (opt('webui', '') ?? '').replace(/\/$/, '');
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin ?? '';
    const cors = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      // Chrome Private Network Access preflight (public/secure -> loopback).
      'Access-Control-Allow-Private-Network': 'true',
      Vary: 'Origin',
    };
    console.log(`[cli] ${req.method} ${req.url} origin=${origin || '-'} pna=${req.headers['access-control-request-private-network'] ?? '-'}`);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors);
      return res.end();
    }
    if (req.method !== 'POST' || req.url !== '/callback') {
      res.writeHead(404, cors);
      return res.end();
    }
    let body = '';
    for await (const chunk of req) body += chunk;
    let payload;
    try { payload = JSON.parse(body); } catch { payload = {}; }
    if (payload.state !== state) {
      console.error(`[cli] state mismatch: got ${String(payload.state).slice(0, 8)}… expected ${state.slice(0, 8)}…`);
      res.writeHead(403, { ...cors, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'state_mismatch' }));
    }
    if (payload.endpoint?.replace(/\/$/, '') !== endpoint) {
      console.error(`[cli] endpoint mismatch: ${payload.endpoint} != ${endpoint}`);
      res.writeHead(400, { ...cors, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'endpoint_mismatch' }));
    }
    store({ endpoint, sessionId: payload.sessionId, email: payload.email, obtainedAt: new Date().toISOString() });
    const ok = await verify(payload.sessionId);
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok, message: ok ? `CLI signed in as ${payload.email}. You can close this tab.` : 'Stored, but the session did not verify.' }));
    setTimeout(() => { server.close(); process.exit(ok ? 0 : 1); }, 200);
  });
  server.listen(Number(opt('port', 0)), '127.0.0.1', () => {
    const port = server.address().port;
    const url = `${webui}/cli-login?port=${port}&state=${state}`;
    console.log(`[cli] listening on http://localhost:${port}/callback  state=${state.slice(0, 8)}…`);
    console.log(`[cli] open this URL in your browser:\n${url}`);
    writeFileSync('/tmp/cli-login-url.txt', url);
  });
} else if (cmd === 'paste') {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => (input += d));
  process.stdin.on('end', async () => {
    const sessionId = input.trim();
    store({ endpoint, sessionId, email: null, obtainedAt: new Date().toISOString(), via: 'paste' });
    process.exit((await verify(sessionId)) ? 0 : 1);
  });
} else if (cmd === 'whoami') {
  const s = load();
  if (!s) { console.error(JSON.stringify({ error: 'auth_required', endpoint })); process.exit(1); }
  process.exit((await verify(s.sessionId)) ? 0 : 1);
} else if (cmd === 'logout') {
  try { unlinkSync(file); console.log(`[cli] removed ${file} (local only)`); } catch { console.log('[cli] nothing stored'); }
} else {
  console.error('usage: cli-listener.mjs login|paste|whoami|logout --endpoint URL [--webui URL] [--port N]');
  process.exit(2);
}
