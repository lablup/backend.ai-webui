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

// If the current branch contains an FR-XXXX issue number, use that as the
// portless app name (e.g. `https://fr-2701.localhost:1355`). This avoids the
// long branch-prefixed hostnames that break `portless run` HTTPS cert
// generation. Falls back to `portless run` (auto-derived) when no issue
// number is found.
const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout?.trim() || '';
const issueMatch = branch.match(/(?:^|[-_/])(fr-?\d+)/i);
const appName = issueMatch ? issueMatch[1].toLowerCase().replace(/^fr/, 'fr-').replace(/-{2,}/g, '-') : null;
const portlessSpec = appName
  ? `portless ${appName} --force ${portFlag}`
  : `portless run --force ${portFlag}`;

const args = [
  '--kill-others',
  '-c', 'auto',
  '--names', 'tsc,react-relay,react',
  'tsc --watch --preserveWatchOutput',
  'cd react && pnpm run relay:watch',
  `${portlessSpec}-- pnpm --prefix ./react run start`,
];

const child = spawn('concurrently', args, { stdio: 'inherit', env, shell: false });
const forward = (sig) => child.kill(sig);
process.on('SIGINT', forward);
process.on('SIGTERM', forward);
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
