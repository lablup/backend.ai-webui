/**
 * Per-worker login state cache for the `loginAs*` helpers (#11133).
 *
 * The manager counts every unauthenticated request, login included, against a
 * fixed per-IP window, so a real login per test runs the suite into 429s. The
 * first login per worker slot, server and account is real; its storageState is
 * saved under `e2e/.auth/<run>/` and later calls restore it instead.
 */
import { BrowserContext, Page, test } from '@playwright/test';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export const LOGIN_STATE_ROOT = path.join(__dirname, '..', '.auth');
/** Set once per run by playwright.config.ts; unset disables the cache. */
export const LOGIN_STATE_RUN_ENV = 'E2E_LOGIN_STATE_RUN';

type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

/** Contexts holding a session that came from (or went into) a saved state. */
const sharedContexts = new WeakMap<BrowserContext, string>();

function runDir(): string | undefined {
  const run = process.env[LOGIN_STATE_RUN_ENV];
  if (!run || !/^[\w-]+$/.test(run)) return undefined;
  return path.join(LOGIN_STATE_ROOT, run);
}

function slot(): string {
  return process.env.TEST_PARALLEL_INDEX ?? 'main';
}

/** A short, non-reversible label for an account, safe to log. */
export function accountLabel(email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 8);
}

/** The state file for this worker slot, server and account; no cache → undefined. */
export function loginStateFile(
  endpoint: string,
  email: string,
  kind: 'browser' | 'api' = 'browser',
): string | undefined {
  const dir = runDir();
  if (!dir) return undefined;
  const key = createHash('sha256')
    .update(`${kind}\n${slot()}\n${endpoint.replace(/\/+$/, '')}\n${email}`)
    .digest('hex')
    .slice(0, 32);
  return path.join(dir, `${key}.json`);
}

/** Specs whose login is the subject under test always log in for real. */
export function isAuthSpec(): boolean {
  try {
    return /[\\/]e2e[\\/]common[\\/]auth[\\/]/.test(test.info().file);
  } catch {
    return false;
  }
}

export function readLoginState(file: string): StorageState | undefined {
  try {
    const state = JSON.parse(fs.readFileSync(file, 'utf8')) as StorageState;
    // The browser may carry the session in localStorage (the
    // X-BackendAI-SessionID header) instead of a third-party cookie.
    const held =
      state.cookies?.length > 0 ||
      state.origins?.some((origin) => origin.localStorage.length > 0);
    return held ? state : undefined;
  } catch {
    return undefined;
  }
}

export function writeLoginState(file: string, state: StorageState): void {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state), { mode: 0o600 });
  fs.renameSync(tmp, file);
}

export async function saveLoginState(
  page: Page,
  file: string,
  email: string,
): Promise<void> {
  const state = await page.context().storageState();
  writeLoginState(file, state);
  sharedContexts.set(page.context(), file);
  const now = Date.now() / 1000;
  const expiries = state.cookies
    .map((cookie) => cookie.expires)
    .filter((expires) => expires > 0);
  const ttl = expiries.length
    ? `session cookie lifetime ~${Math.round((Math.min(...expiries) - now) / 60)} min`
    : `no expiring cookie (${state.cookies.length} cookies)`;
  console.log(
    `[login-cache] saved state for account ${accountLabel(email)} (worker slot ${slot()}); ${ttl}`,
  );
}

export function dropLoginState(file: string): void {
  fs.rmSync(file, { force: true });
}

/**
 * Puts the saved cookies into the page's context and the saved localStorage
 * into its origins (only keys the page has not set, once per tab), so the next
 * navigation boots into the signed-in app.
 */
export async function applyLoginState(
  page: Page,
  file: string,
  state: StorageState,
): Promise<void> {
  await page.context().addCookies(state.cookies);
  await page.addInitScript((origins) => {
    const marker = '__e2e_login_state_restored';
    try {
      if (sessionStorage.getItem(marker)) return;
      const entry = origins.find((o) => o.origin === location.origin);
      for (const { name, value } of entry?.localStorage ?? []) {
        if (localStorage.getItem(name) === null) {
          localStorage.setItem(name, value);
        }
      }
      sessionStorage.setItem(marker, '1');
    } catch {
      // opaque origins (about:blank) have no storage
    }
  }, state.origins);
  sharedContexts.set(page.context(), file);
}

/** Removes the restored cookies again, so a real login starts unauthenticated. */
export async function clearAppliedCookies(
  page: Page,
  state: StorageState,
): Promise<void> {
  for (const { name, domain, path: cookiePath } of state.cookies) {
    await page.context().clearCookies({ name, domain, path: cookiePath });
  }
  sharedContexts.delete(page.context());
}

/**
 * A logout ends the server-side session, so a saved state behind this context
 * is dead from here on; drop it so the next call logs in for real.
 */
export function forgetSharedSession(page: Page): void {
  const file = sharedContexts.get(page.context());
  if (!file) return;
  sharedContexts.delete(page.context());
  dropLoginState(file);
  console.log(
    '[login-cache] logout on a shared session; dropped the saved state (pass { fresh: true } to the login before a logout)',
  );
}

/** Longest wait for the anonymous rate-limit window before the one retry. */
const RATE_LIMIT_MAX_WAIT_MS = 120_000;
/** Wait when a 429 carries no reset header. */
const RATE_LIMIT_DEFAULT_WAIT_MS = 60_000;

/** How long to wait after a login 429, from its reset header, capped. */
export function rateLimitWaitMs(headers: Record<string, string>): number {
  const seconds = Number(
    headers['x-ratelimit-reset'] ?? headers['retry-after'] ?? NaN,
  );
  const waitMs =
    Number.isFinite(seconds) && seconds >= 0
      ? (seconds + 1) * 1000
      : RATE_LIMIT_DEFAULT_WAIT_MS;
  return Math.min(waitMs, RATE_LIMIT_MAX_WAIT_MS);
}

/** Gives the running test room for a wait it did not budget for. */
export function extendTestTimeout(ms: number): void {
  try {
    const info = test.info();
    if (info.timeout > 0) info.setTimeout(info.timeout + ms);
  } catch {
    // not inside a test (e.g. a worker hook): keep the hook's own timeout
  }
}
