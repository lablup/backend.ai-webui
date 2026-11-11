import { LOGIN_STATE_ROOT, LOGIN_STATE_RUN_ENV } from './login-state';
import * as fs from 'fs';
import * as path from 'path';

/** Leftovers of a run that never reached its teardown (killed, crashed). */
const STALE_RUN_MS = 24 * 60 * 60 * 1000;

/**
 * globalTeardown: deletes this run's saved login states, which hold session
 * cookies, plus any run directory older than a day.
 */
export default function removeLoginStates(): void {
  const run = process.env[LOGIN_STATE_RUN_ENV];
  if (run && /^[\w-]+$/.test(run)) {
    fs.rmSync(path.join(LOGIN_STATE_ROOT, run), {
      recursive: true,
      force: true,
    });
  }
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(LOGIN_STATE_ROOT, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const dir = path.join(LOGIN_STATE_ROOT, entry.name);
    try {
      if (Date.now() - fs.statSync(dir).mtimeMs > STALE_RUN_MS) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch {
      // removed concurrently
    }
  }
  try {
    fs.rmdirSync(LOGIN_STATE_ROOT);
  } catch {
    // another run still has states here
  }
}
