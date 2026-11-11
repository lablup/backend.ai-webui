/**
 * Per-worker login state cache for the `loginAs*` helpers (#11133).
 *
 * The manager counts every unauthenticated request, login included, against a
 * fixed per-IP window, so a real login per test runs the suite into 429s. The
 * first login per worker slot, server and account is real; its storageState is
 * saved under `e2e/.auth/<run>/` and later calls restore it instead.
 */
import { BrowserContext, Page, test } from '@playwright/test';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
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
    .update([kind, slot(), endpoint.replace(/\/+$/, ''), email].join('\n'))
    .digest('hex')
    .slice(0, 32);
  return path.join(dir, `${key}.json`);
}

/** What a state file holds: the state, the signed-in email, a password check. */
type SavedLogin = {
  state: StorageState;
  account?: string;
  salt: string;
  verifier: string;
};

function verifierOf(password: string, salt: string): Buffer {
  return scryptSync(password, Buffer.from(salt, 'hex'), 32);
}

/** Specs whose login is the subject under test always log in for real. */
export function isAuthSpec(): boolean {
  try {
    return /[\\/]e2e[\\/]common[\\/]auth[\\/]/.test(test.info().file);
  } catch {
    return false;
  }
}

/**
 * The saved login, if it was saved with this password (so a wrong password
 * never gets a saved session) and still holds a session.
 */
export function readLoginState(
  file: string,
  password: string,
): { state: StorageState; account?: string } | undefined {
  try {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8')) as SavedLogin;
    const expected = Buffer.from(saved.verifier, 'hex');
    const actual = verifierOf(password, saved.salt);
    if (expected.length !== actual.length) return undefined;
    if (!timingSafeEqual(expected, actual)) return undefined;
    const { state } = saved;
    // The browser may carry the session in localStorage (the
    // X-BackendAI-SessionID header) instead of a third-party cookie.
    const held =
      state.cookies?.length > 0 ||
      state.origins?.some((origin) => origin.localStorage.length > 0);
    return held ? { state, account: saved.account } : undefined;
  } catch {
    return undefined;
  }
}

/** Writes the state; a failure only costs the cache, never the login. */
export function writeLoginState(
  file: string,
  state: StorageState,
  password: string,
  account?: string,
): boolean {
  try {
    const salt = randomBytes(16).toString('hex');
    const saved: SavedLogin = {
      state,
      account,
      salt,
      verifier: verifierOf(password, salt).toString('hex'),
    };
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(saved), { mode: 0o600 });
    fs.renameSync(tmp, file);
    return true;
  } catch (error) {
    console.log(
      `[login-cache] could not save the login state (${String(error).slice(0, 120)}); continuing without it`,
    );
    return false;
  }
}

/** Kept even when a test had seeded the same value before the login. */
const LOGIN_KEYS = ['backendaiwebui.api_endpoint', 'backendaiwebui.sessionid'];

/** The page origin's localStorage, to tell what a login adds to it. */
export async function readLocalStorage(
  page: Page,
): Promise<Record<string, string>> {
  return page
    .evaluate(() => ({ ...localStorage }))
    .catch(() => ({}) as Record<string, string>);
}

/**
 * Saves what the login produced: the context's cookies and the localStorage
 * entries the login added or changed (`before` is the storage when the login
 * page loaded), so nothing a test seeded itself travels to the next test.
 */
export async function saveLoginState(
  page: Page,
  file: string,
  email: string,
  password: string,
  before: Record<string, string>,
): Promise<void> {
  const full = await page.context().storageState();
  const pageOrigin = new URL(page.url()).origin;
  const state: StorageState = {
    cookies: full.cookies,
    origins: full.origins
      .map((origin) =>
        origin.origin === pageOrigin
          ? {
              ...origin,
              localStorage: origin.localStorage.filter(
                ({ name, value }) =>
                  LOGIN_KEYS.includes(name) || before[name] !== value,
              ),
            }
          : origin,
      )
      .filter((origin) => origin.localStorage.length > 0),
  };
  const account = await page
    .evaluate(() => (globalThis as any).backendaiclient?.email as string)
    .catch(() => undefined);
  if (!writeLoginState(file, state, password, account || undefined)) return;
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
  unusableCounts.delete(file);
  fs.rmSync(file, { force: true });
}

const unusableCounts = new Map<string, number>();

/**
 * Records a restore that failed without proving the session dead; the second
 * one in a row drops the state, so a state that keeps failing is not retried
 * for every test.
 */
export function noteUnusableState(file: string): boolean {
  const count = (unusableCounts.get(file) ?? 0) + 1;
  unusableCounts.set(file, count);
  if (count < 2) return false;
  dropLoginState(file);
  return true;
}

export function noteUsableState(file: string): void {
  unusableCounts.delete(file);
}

const BLANK_PATH = '/__e2e_login_state__';

/**
 * Empties `origin`'s localStorage and sessionStorage in this tab, then writes
 * `entries`, from a blank page on that origin so the app does not boot on
 * the half-written storage.
 */
async function resetOriginStorage(
  page: Page,
  origin: string,
  entries: { name: string; value: string }[],
): Promise<void> {
  const blank = `${origin}${BLANK_PATH}`;
  await page.route(blank, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html>' }),
  );
  try {
    await page.goto(blank);
    await page.evaluate((items) => {
      localStorage.clear();
      sessionStorage.clear();
      for (const { name, value } of items) localStorage.setItem(name, value);
    }, entries);
  } finally {
    await page.unroute(blank);
  }
}

/**
 * Signs the page's context out of whatever it held: clears every cookie and
 * `appOrigin`'s storage, so a real login or another account starts clean.
 */
export async function clearLoginState(
  page: Page,
  appOrigin: string,
): Promise<void> {
  await page.context().clearCookies();
  await resetOriginStorage(page, appOrigin, []);
  sharedContexts.delete(page.context());
  helperContexts.delete(page.context());
}

/**
 * Replaces the context's cookies and `appOrigin`'s storage with the saved
 * state, so the next navigation boots signed in as that account and nothing
 * of an account the page held before is left.
 */
export async function applyLoginState(
  page: Page,
  file: string,
  state: StorageState,
  appOrigin: string,
): Promise<void> {
  await page.context().clearCookies();
  await page.context().addCookies(state.cookies);
  const origins = new Map(
    state.origins.map((origin) => [origin.origin, origin.localStorage]),
  );
  if (!origins.has(appOrigin)) origins.set(appOrigin, []);
  for (const [origin, entries] of origins) {
    await resetOriginStorage(page, origin, entries);
  }
  sharedContexts.set(page.context(), file);
}

/** Contexts a login helper signed in, saved state or not. */
const helperContexts = new WeakSet<BrowserContext>();

export function markHelperSession(page: Page): void {
  helperContexts.add(page.context());
}

export function holdsHelperSession(page: Page): boolean {
  return (
    helperContexts.has(page.context()) || sharedContexts.has(page.context())
  );
}

/**
 * A logout ends the server-side session, so a saved state behind this context
 * is dead from here on; drop it so the next call logs in for real.
 */
export function forgetSharedSession(page: Page): void {
  helperContexts.delete(page.context());
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

/**
 * A 429 from the manager's anonymous per-IP window, as opposed to the
 * webserver's per-account block after failed logins, which waiting for a
 * window reset does not lift.
 */
export function isAnonymousRateLimit(
  status: number,
  type: string,
  title: string,
): boolean {
  if (status !== 429) return false;
  if (/block|failed login/i.test(`${type} ${title}`)) return false;
  return true;
}

/** The problem `type` (last path segment) and `title` of a login answer body. */
export function loginProblem(body: any): { type: string; title: string } {
  const detail = body?.data ?? body ?? {};
  return {
    type: String(detail.type ?? '').replace(/.*\//, ''),
    title: String(detail.title ?? '').slice(0, 120),
  };
}

/** How long to wait after a login 429, from its reset header, capped. */
export function rateLimitWaitMs(headers: Record<string, string>): number {
  let seconds = Number(
    headers['x-ratelimit-reset'] ?? headers['retry-after'] ?? NaN,
  );
  // The manager sends seconds until the reset; epoch values are converted.
  if (seconds > 1e12) seconds /= 1000;
  if (seconds > 1e9) seconds = Math.max(0, seconds - Date.now() / 1000);
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
