#!/usr/bin/env node
// Spawns concurrently with three children (tsc watch, Relay watch, Vite via Portless).
// The dev-time header color override is exposed to the React app via
// VITE_THEME_HEADER_COLOR — set it in `.env.development.local` or the shell
// and Vite's loadEnv() picks it up natively (no bridge needed).
import { spawn, spawnSync } from 'node:child_process';

const env = { ...process.env };

// Ensure the Portless daemon is running. Portless 0.10+ defaults the daemon
// to port 443 which requires sudo; we override that to an unprivileged 1355
// only when the user has not already pinned a port via PORTLESS_PORT. When
// PORTLESS_PORT is set, Portless reads it directly — both the daemon here
// and subsequent `portless` client invocations later in this script — so we
// stay out of its way and avoid the explicit `-p` flag overriding the env.
// An empty export (`PORTLESS_PORT=`) is treated as unset, matching shell
// convention. The call is idempotent (no-op if already running).
const proxyArgs = ['proxy', 'start'];
if (!process.env.PORTLESS_PORT?.trim()) {
  proxyArgs.push('-p', '1355');
}
spawnSync('portless', proxyArgs, { stdio: 'inherit' });

// Optional fixed port via `PORT=9081 pnpm run dev`. If unset, Portless picks a free port.
const portFlag = process.env.PORT ? `--app-port ${process.env.PORT} ` : '';
delete env.PORT; // Avoid leaking to portless / CRA before Portless reassigns it.

// Decide the portless app name (`https://<name>.localhost:1355`).
// Priority:
//   1. PORTLESS_APP_NAME env var (caller-provided; sanitized here so callers
//      can pass arbitrary strings — e.g. a Claude Code session name — without
//      worrying about subdomain validity).
//   2. FR-XXXX issue number in the current git branch (e.g. `fr-2701`).
//   3. `portless run` (auto-derived from branch — long branch-prefixed
//      hostnames may break Portless's HTTPS cert generation, so prefer 1 or 2).
function sanitizeAppName(raw) {
  if (!raw) return null;
  const slug = raw
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || null;
}
const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout?.trim() || '';
const issueMatch = branch.match(/(?:^|[-_/])(fr-?\d+)/i);
const branchAppName = issueMatch ? issueMatch[1].toLowerCase().replace(/^fr/, 'fr-').replace(/-{2,}/g, '-') : null;
const appName = sanitizeAppName(process.env.PORTLESS_APP_NAME) ?? branchAppName;
const portlessSpec = appName
  ? `portless ${appName} --force ${portFlag}`
  : `portless run --force ${portFlag}`;

const args = [
  '--kill-others',
  '-c', 'auto',
  '--names', 'tsc,react-relay,react',
  'tsc --watch --preserveWatchOutput',
  'pnpm run relay:watch',
  `${portlessSpec}-- pnpm --prefix ./react run start`,
];

const child = spawn('concurrently', args, { stdio: 'inherit', env, shell: false });
const forward = (sig) => child.kill(sig);
process.on('SIGINT', forward);
process.on('SIGTERM', forward);
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
