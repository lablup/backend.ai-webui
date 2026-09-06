#!/usr/bin/env node
// Spawns concurrently with three children (tsc watch, Relay watch, Vite via Portless).
// The dev-time header color override is exposed to the React app via
// VITE_THEME_HEADER_COLOR — set it in `.env.development.local` or the shell
// and Vite's loadEnv() picks it up natively (no bridge needed).
// Similarly, the resolved Portless app name is exposed via
// VITE_DEV_SERVER_NAME so the React app can show it in the browser tab title
// (dev only), keeping multiple dev-server tabs distinguishable.
// When this box has joined the team dev gateway, the shareable URL is printed
// at startup and exposed as VITE_DEV_SHARE_URL.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { resolveAppName } from './portless-app-name.mjs';

const env = { ...process.env };

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

// Decide the portless app name (`https://<name>.localhost:1355`) — the issue key,
// the PR number and a word for what this branch is: `fr-3665-pr9049-statusline`.
// Composition rules and fallbacks live in portless-app-name.mjs.
//
// PORTLESS_APP_NAME supplies only the descriptive word (the dev-server skill fills
// it from `/rename`); the identifiers are added here so callers cannot forget them.
// PORTLESS_APP_NAME_EXACT=1 opts out entirely, for a caller that owns the hostname.
const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout?.trim() || '';

// One `gh` call per boot (~0.65s, and it returns number and title together). It is
// allowed to fail: no gh, not logged in, no PR yet, or offline all just mean the
// name loses its `prNNNN` part. The last good answer is cached so an offline boot
// keeps the URL it had rather than silently renaming the dev server.
function lookupPr(branchName) {
  if (!branchName || process.env.PORTLESS_SKIP_PR_LOOKUP) return null;
  const cacheFile = join(
    homedir(), '.cache', 'backend.ai-webui',
    `pr-${branchName.replace(/[^A-Za-z0-9]+/g, '-')}.json`,
  );
  const probe = spawnSync(
    'gh',
    ['pr', 'view', branchName, '--json', 'number,title'],
    { encoding: 'utf8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] },
  );
  if (probe.status === 0 && probe.stdout) {
    let pr = null;
    try {
      pr = JSON.parse(probe.stdout);
    } catch {
      pr = null; // unparseable output — fall through to the cache
    }
    if (pr?.number) {
      // Persisting is an optimization for the next offline boot, so a read-only
      // ~/.cache or an over-long filename must not throw away the answer we have.
      try {
        mkdirSync(dirname(cacheFile), { recursive: true });
        writeFileSync(cacheFile, JSON.stringify(pr));
      } catch {
        // Best-effort; the fresh lookup below is still good.
      }
      return pr;
    }
  }
  try {
    return JSON.parse(readFileSync(cacheFile, 'utf8'));
  } catch {
    return null;
  }
}

// Exact mode discards every identifier, so it must not pay for the lookup that
// produces one — up to the 4s timeout on a box with no network.
const exactAppName = !!process.env.PORTLESS_APP_NAME_EXACT?.trim();
const appName = resolveAppName({
  envName: process.env.PORTLESS_APP_NAME,
  branch,
  pr: exactAppName ? null : lookupPr(branch),
  exact: exactAppName,
});
if (appName) {
  // Surface the app name to the React bundle for the dev-only tab title.
  env.VITE_DEV_SERVER_NAME = appName;
}

// Team share URL, present only when this box has run `dev-gw join` once.
// The gateway rewrites Host to `<app>.localhost:<target_port>`, so routing
// works with no Portless/Vite change here — only the URL differs.
const devGwConfigPath =
  process.env.DEV_GW_CONFIG?.trim() || join(homedir(), '.config', 'fw', 'dev-gw.json');
let devGwConfig = null;
try {
  devGwConfig = JSON.parse(readFileSync(devGwConfigPath, 'utf8'));
} catch {
  // Not joined (ENOENT), unreadable, or malformed — no share URL to print.
}
// A parseable file can still be the wrong shape; only a URL template is usable.
const devGwShareBase =
  typeof devGwConfig?.share_base === 'string' &&
  /^https?:\/\/\{app\}\./.test(devGwConfig.share_base)
    ? devGwConfig.share_base
    : null;
// The gateway forwards to the port recorded at join time forever, so a server
// on a different port would be proxied to nothing. `portless_port` is the
// pre-rename spelling, still on boxes that have not re-joined.
const portlessPort = process.env.PORTLESS_PORT?.trim() || '1355';
const devGwTargetPort = devGwConfig?.target_port ?? devGwConfig?.portless_port;
const devGwPortMismatch =
  devGwTargetPort != null && String(devGwTargetPort) !== portlessPort;
if (devGwShareBase && devGwPortMismatch) {
  console.log(
    `-- Team share URL unavailable: the gateway was joined with Portless :${devGwTargetPort}, this server uses :${portlessPort} — re-run \`dev-gw join\``,
  );
} else if (devGwShareBase && appName) {
  const shareUrl = devGwShareBase.replace('{app}', appName);
  env.VITE_DEV_SHARE_URL = shareUrl;
  console.log(`-- Team share URL: ${shareUrl} (dev VPN, via dev-gw)`);
} else if (devGwShareBase) {
  // `portless run` derives the app name itself, so it is unknown until it prints.
  console.log(
    `-- Team share URL: ${devGwShareBase.replace('{app}', '<app>')} — <app> is the name Portless prints below (dev VPN, via dev-gw)`,
  );
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
