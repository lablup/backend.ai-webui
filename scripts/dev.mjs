#!/usr/bin/env node
// Spawns concurrently with three children (tsc watch, Relay watch, Vite via Portless).
// The dev-time header color override is exposed to the React app via
// VITE_THEME_HEADER_COLOR — set it in `.env.development.local` or the shell
// and Vite's loadEnv() picks it up natively (no bridge needed).
// Similarly, the resolved Portless app name is exposed via
// VITE_DEV_SERVER_NAME so the React app can show it in the browser tab title
// (dev only), keeping multiple dev-server tabs distinguishable.
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { probeFsevents } from './fsevents-health.mjs';

const env = { ...process.env };

// fseventsd can refuse every new FSEventStream registration (client-table
// exhaustion by leaked dev processes — see scripts/fsevents-health.mjs). Every
// watcher this script spawns then starts permanently silent: HMR dead, stale
// transforms on refresh, tsc/relay watch blind. Probe up front and ASK before
// falling back to stat-polling — polling costs steady CPU and hides the real
// problem, so it is never enabled silently. VITE_WATCH_USE_POLLING covers
// ONLY Vite (react/vite.config.ts), so the probe still runs with it set —
// the tsc/relay watchers would otherwise stay dead undiagnosed; the prompt
// then targets just those uncovered subsystems.
if (process.platform === 'darwin') {
  const healthy = await probeFsevents();
  if (!healthy) {
    const viteCovered = !!env.VITE_WATCH_USE_POLLING?.trim();
    console.warn(
      '\n[dev] macOS FSEvents is BROKEN on this machine: fseventsd refused a new\n' +
        '[dev] event stream, so file watching (Vite HMR, tsc watch, relay watch)\n' +
        '[dev] will be silently dead. Usual cause: leaked dev processes exhausting\n' +
        "[dev] fseventsd's client table. To heal the machine:\n" +
        "[dev]   1. kill stale watchers:  ps aux | grep -E 'test-server|vite|relay'\n" +
        '[dev]      (also close days-old editor windows), then re-run pnpm dev\n' +
        '[dev]   2. still broken:        sudo pkill fseventsd   (auto-restarts)\n' +
        '[dev]   3. last resort:         reboot\n' +
        '[dev] Health check any time:    node scripts/fsevents-health.mjs\n',
    );
    if (process.stdin.isTTY) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      let answer = '';
      try {
        answer = await rl.question(
          viteCovered
            ? '[dev] Vite already stat-polls (VITE_WATCH_USE_POLLING), but the tsc/relay\n' +
                '[dev] watchers still rely on FSEvents. Extend polling to them for THIS run? [y/N] '
            : '[dev] Fall back to stat-polling for THIS run (works, but steady CPU cost\n' +
                '[dev] and the machine stays broken for every other tool)? [y/N] ',
        );
      } catch {
        // Ctrl+D / stdin closed mid-question — treat as "No".
      } finally {
        rl.close();
      }
      if (/^y(es)?$/i.test(answer.trim())) {
        env.VITE_WATCH_USE_POLLING = '1'; // Vite chokidar (react/vite.config.ts)
        env.CHOKIDAR_USEPOLLING = '1'; // nodemon's chokidar (relay watch)
        if (!env.TSC_WATCHFILE?.trim()) {
          env.TSC_WATCHFILE = 'DynamicPriorityPolling'; // tsc watch children
        }
        console.warn('[dev] polling fallback enabled for this run.\n');
      } else {
        console.warn(
          viteCovered
            ? '[dev] continuing — Vite HMR polls, but tsc/relay change detection stays dead\n' +
                '[dev] until the machine is healed.\n'
            : '[dev] continuing WITHOUT polling — expect dead HMR until the machine is healed.\n',
        );
      }
    } else {
      console.warn(
        viteCovered
          ? '[dev] non-interactive session: Vite polls via VITE_WATCH_USE_POLLING, but\n' +
              '[dev] tsc/relay watchers stay on FSEvents. Set CHOKIDAR_USEPOLLING=1 and\n' +
              '[dev] TSC_WATCHFILE=DynamicPriorityPolling to cover them explicitly.\n'
          : '[dev] non-interactive session: continuing without polling. Set\n' +
              '[dev] VITE_WATCH_USE_POLLING=1 to opt in explicitly.\n',
      );
    }
  }
}

// Both TypeScript watch programs under this script — the root `tsc --watch`
// child below and the one vite-plugin-checker runs inside the Vite process —
// default to TS's `UseFsEvents` watch strategy, which installs ONE watcher per
// file in the program. On macOS that is one open file descriptor per file, so a
// GUI/IDE-launched dev server (launchd soft `maxfiles` = 256) hits EMFILE.
//
// `UseFsEventsOnParentDirectory` coalesces those into one watcher per
// *directory* instead. It is TypeScript's own documented remedy for watcher
// exhaustion, read straight from this env var by `createSystemWatchFunctions`,
// and it composes with the pnpm-store `watchOptions` exclude added alongside it
// (see `resolveCheckerTsconfigPath` in react/vite.config.ts): the exclude drops
// the store's thousands of immutable `.d.ts` from the watch set, and this
// collapses what remains from per-file to per-directory. Measured on the
// react/ program (Linux, inotify watch descriptors on the tsc pid):
//
//   baseline                     9,678
//   store exclude only           1,604
//   this env var only            4,288
//   both                           136   ← under macOS's 256 soft limit
//
// Type-check results and change-detection latency are unaffected (same
// "Found 0 errors", edits still reported in ~1s); RSS/CPU are unchanged, so
// this buys watcher headroom, not speed. Left overridable so a developer on a
// filesystem where directory events are unreliable can pin the old strategy
// with `TSC_WATCHFILE=UseFsEvents pnpm run dev`. An empty export
// (`TSC_WATCHFILE=`) counts as unset, matching the PORTLESS_PORT handling below.
if (!env.TSC_WATCHFILE?.trim()) {
  env.TSC_WATCHFILE = 'UseFsEventsOnParentDirectory';
}

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
