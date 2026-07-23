#!/usr/bin/env node
// Spawns concurrently with three children (tsc watch, Relay watch, Vite via Portless).
// The dev-time header color override is exposed to the React app via
// VITE_THEME_HEADER_COLOR — set it in `.env.development.local` or the shell
// and Vite's loadEnv() picks it up natively (no bridge needed).
// Similarly, the resolved Portless app name is exposed via
// VITE_DEV_SERVER_NAME so the React app can show it in the browser tab title
// (dev only), keeping multiple dev-server tabs distinguishable.
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
if (appName) {
  // Surface the app name to the React bundle for the dev-only tab title.
  env.VITE_DEV_SERVER_NAME = appName;
}
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

// Spawn concurrently as the leader of its own process group (`detached`).
// The watch tree below it is deep (concurrently → pnpm → nodemon → pnpm →
// relay binary), and per-PID signal forwarding breaks at the nodemon hop:
// killing only `child.pid` orphans the relay watch chain, which then keeps
// thousands of file-watcher FDs open forever (FR-3214). Signaling the
// negative PID (= the whole group) reaches every descendant directly, no
// matter how deep the chain is or whether intermediate layers forward.
const detached = process.platform !== 'win32';
const child = spawn('concurrently', args, { stdio: 'inherit', env, shell: false, detached });

// Signal every process in the group (negative PID = the whole group), falling
// back to a direct kill when the group is already reaped. Win32 has no process
// groups, so there the whole fix degrades to the plain per-PID kill.
const signalTree = detached
  ? (sig) => {
      try {
        process.kill(-child.pid, sig);
      } catch {
        child.kill(sig); // group already reaped — best-effort direct kill (no-throw)
      }
    }
  : (sig) => child.kill(sig);
const treeAlive = () => {
  if (!detached) return false;
  try {
    process.kill(-child.pid, 0); // probe: throws ESRCH when no member survives
    return true;
  } catch {
    return false;
  }
};

// Guarantee the group dies even when graceful shutdown hangs (e.g. the relay
// binary swallowing SIGINT while its parents wait on it): from the first
// shutdown signal, poll for survivors and escalate to SIGKILL once the grace
// period runs out. Nothing in this group may outlive dev.mjs.
const SIGKILL_GRACE_MS = 5000;
let escalation = null;
const escalate = async () => {
  const deadline = Date.now() + SIGKILL_GRACE_MS;
  while (treeAlive() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (treeAlive()) signalTree('SIGKILL');
};
const shutdown = (sig) => {
  signalTree(sig); // repeated Ctrl+C re-signals; the escalation only starts once
  return (escalation ??= escalate());
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGHUP', () => shutdown('SIGHUP')); // terminal close no longer HUPs the detached group

child.on('exit', async (code, signal) => {
  // concurrently is gone; anything still alive in its group is an orphan
  // (leaked grandchild mid-shutdown). Sweep it before exiting.
  if (treeAlive()) await shutdown('SIGTERM');
  process.exit(signal ? 1 : (code ?? 0));
});
