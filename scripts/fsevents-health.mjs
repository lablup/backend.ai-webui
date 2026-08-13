#!/usr/bin/env node
// FSEvents health probe (macOS). fseventsd can end up refusing every new
// FSEventStreamStart() — e.g. when leaked dev processes exhaust its client
// table — and then every directory watcher on the machine starts permanently
// silent: chokidar/libuv surface it as an async EMFILE (or nothing at all),
// Vite HMR is dead, and full refreshes serve stale transforms until the dev
// server restarts. A single-file kqueue watch still works, which is why only
// directory-watching tools break. Probe: watch a fresh temp dir, mutate a file
// inside it, and require a real event within the timeout — this catches both
// the EMFILE mode and the silently-dead-stream mode.
//
// Usable standalone (`node scripts/fsevents-health.mjs`; exit 0 healthy,
// 1 broken) and as a module (`probeFsevents()`), used by scripts/dev.mjs.
import { mkdtempSync, rmSync, watch, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function probeFsevents(timeoutMs = 1500) {
  // FSEvents is a macOS-only subsystem: on every other platform (Linux CI,
  // Ubuntu dev boxes) this is a hard no-op that reports healthy, before any
  // override is even considered.
  if (process.platform !== 'darwin') return true;
  // BAI_FSEVENTS_HEALTH=broken|ok bypasses the probe — for testing the
  // dev.mjs prompt flow without actually exhausting the FSEvents table.
  const forced = process.env.BAI_FSEVENTS_HEALTH?.trim().toLowerCase();
  if (forced === 'broken') return false;
  if (forced === 'ok') return true;

  return new Promise((resolve) => {
    let dir;
    try {
      dir = mkdtempSync(join(tmpdir(), 'bai-fsev-'));
    } catch {
      return resolve(true); // can't probe — don't cry wolf
    }
    let watcher;
    let writer;
    let timer;
    let settled = false;
    const done = (verdict) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(writer);
      try {
        watcher?.close();
      } catch {}
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {}
      resolve(verdict);
    };
    try {
      watcher = watch(dir, () => done(true));
    } catch {
      return done(false);
    }
    watcher.on('error', () => done(false));
    // Keep mutating until an event lands or the timeout expires; a healthy
    // FSEvents stream delivers well under 500ms.
    let n = 0;
    writer = setInterval(() => {
      try {
        writeFileSync(join(dir, 'probe.txt'), String(n++));
      } catch {}
    }, 120);
    timer = setTimeout(() => done(false), timeoutMs);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const healthy = await probeFsevents();
  console.log(healthy ? 'FSEvents OK' : 'FSEvents BROKEN');
  process.exit(healthy ? 0 : 1);
}
