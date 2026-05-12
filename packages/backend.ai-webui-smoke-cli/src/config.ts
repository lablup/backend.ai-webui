/**
 * CLI argument shape + helpers that translate `bai-smoke run` options into
 * Playwright env vars and a grep regex.
 *
 * Kept deliberately pure — no I/O, no spawn — so the unit tests can verify
 * the env / grep mapping without booting Playwright.
 */

export type SmokeRoleSelection = 'auto' | 'admin' | 'user';
export type EffectiveRole = 'admin' | 'user';

export interface SmokeRunOptions {
  /** Backend.AI WebUI endpoint (`--endpoint`). */
  endpoint: string;
  /** Backend.AI webserver endpoint (`--webserver`). Defaults to `endpoint`. */
  webserver: string;
  /** Login email or username (`--email`). */
  email: string;
  /** Login password (`--password` or stdin). */
  password: string;
  /** Role selection mode (`--role`). */
  role: SmokeRoleSelection;
  /**
   * Extra tags to OR onto the smoke selection. Populated from
   * `--also-include` (preferred) or the deprecated `--include` alias.
   */
  include?: string[];
  /** Exclude tags (`--exclude`). */
  exclude?: string[];
  /** Page directory names to restrict the run to (`--pages session,vfolder`). */
  pages?: string[];
  /** Playwright worker count (`--workers`). */
  workers?: number;
  /** Per-test timeout in ms (`--timeout`). */
  timeoutMs?: number;
  /** Output directory (`--output`). */
  outputDir: string;
  /** Run a headed browser for debugging (`--headed`). */
  headed?: boolean;
  /** Accept self-signed TLS certs (`--insecure-tls`). */
  insecureTls?: boolean;
}

/**
 * Build the grep / grepInvert regex pair forwarded to Playwright via env.
 *
 * The base smoke set is `@smoke`; on top of that, each test may carry
 * a role-scoped tag (`@smoke-admin`, `@smoke-user`). We compose a regex
 * that accepts:
 *
 *   - bare `@smoke` (with no role suffix), OR
 *   - `@smoke-<effectiveRole>`
 *
 * so a `user` run picks up `@smoke` and `@smoke-user` — but NOT
 * `@smoke-admin`.
 *
 * (`@smoke-any` was dropped from the taxonomy in FR-2875 / FR-2876
 * because every e2e helper hard-codes a role via `loginAsAdmin` /
 * `loginAsUser`, so no describe is genuinely role-agnostic at the
 * helper level.)
 *
 * Additional `--also-include` tags are OR-ed in. `--exclude` tags become
 * `grepInvert`.
 */
export function buildGrepExpression(
  opts: SmokeRunOptions,
  effectiveRole: EffectiveRole,
): { grep?: string; grepInvert?: string } {
  // `@smoke\b` matches the bare base tag; we match `@smoke-<role>`
  // explicitly so we don't accidentally pick up future tags like
  // `@smoke-extended`.
  const roleAlt = `@smoke-${effectiveRole}\\b`;
  const baseAlt = `@smoke\\b`;
  const includeAlt = (opts.include ?? [])
    .map((t) => escapeRegex(t.trim()))
    .filter(Boolean)
    .join('|');

  const alternatives = [baseAlt, roleAlt, includeAlt].filter(Boolean).join('|');
  const grep = `(${alternatives})`;

  const exclude = (opts.exclude ?? [])
    .map((t) => escapeRegex(t.trim()))
    .filter(Boolean)
    .join('|');
  const grepInvert = exclude ? `(${exclude})` : undefined;

  return { grep, grepInvert };
}

/**
 * Compose the env block forwarded to the spawned `playwright test`
 * process. Includes both:
 *   - E2E_* vars consumed by `e2e/utils/test-util.ts`
 *   - BAI_SMOKE_* vars consumed by `playwright.smoke.config.ts`
 */
export function buildPlaywrightEnv(
  opts: SmokeRunOptions,
  effectiveRole: EffectiveRole,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };

  // E2E test-util conventions — see e2e/utils/test-util.ts.
  env.E2E_WEBUI_ENDPOINT = opts.endpoint;
  env.E2E_WEBSERVER_ENDPOINT = opts.webserver;

  // Single-account auth: we always populate the matching role slot only.
  // Specs that need cross-user credentials are not tagged for smoke.
  if (effectiveRole === 'admin') {
    env.E2E_ADMIN_EMAIL = opts.email;
    env.E2E_ADMIN_PASSWORD = opts.password;
  } else {
    env.E2E_USER_EMAIL = opts.email;
    env.E2E_USER_PASSWORD = opts.password;
  }

  // BAI_SMOKE_* — picked up by playwright.smoke.config.ts.
  env.BAI_SMOKE_REPORT_DIR = opts.outputDir;
  if (opts.workers != null) env.BAI_SMOKE_WORKERS = String(opts.workers);
  if (opts.timeoutMs != null) env.BAI_SMOKE_TIMEOUT_MS = String(opts.timeoutMs);
  if (opts.pages && opts.pages.length > 0) {
    env.BAI_SMOKE_PAGES = opts.pages.join(',');
  }
  if (opts.headed) env.BAI_SMOKE_HEADED = '1';

  const { grep, grepInvert } = buildGrepExpression(opts, effectiveRole);
  if (grep) env.BAI_SMOKE_GREP = grep;
  if (grepInvert) env.BAI_SMOKE_GREP_INVERT = grepInvert;

  if (opts.insecureTls) {
    // Forward to both the runner's spawned children and any fetches
    // inside the test harness. Only set on the spawned child env — we
    // intentionally do NOT mutate process.env in the host runner.
    env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    // Gate Playwright's `ignoreHTTPSErrors` in playwright.smoke.config.ts.
    env.BAI_SMOKE_INSECURE_TLS = '1';
  }

  return env;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse a duration string into milliseconds.
 *
 * Accepts: bare integers (treated as ms), `<n>s`, `<n>m`, or `<n>ms`.
 * Throws on unrecognised input so the CLI can surface a clean error.
 */
export function parseDuration(input: string): number {
  const trimmed = input.trim();
  const match = /^(\d+)(ms|s|m)?$/.exec(trimmed);
  if (!match) {
    throw new Error(
      `Invalid duration: "${input}". Use "180s", "3m", or a raw ms value.`,
    );
  }
  const value = Number.parseInt(match[1]!, 10);
  const unit = match[2] ?? 'ms';
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    default:
      // Unreachable due to regex, but keeps TS exhaustive-check happy.
      throw new Error(`Invalid duration unit: ${unit}`);
  }
}

/**
 * Parse comma-separated arg values. Commander's `--include a,b,c` arrives
 * as either a single comma-joined string or as a variadic `string[]`
 * depending on how the option was declared. Normalise to a trimmed array.
 */
export function splitCsvArg(input: string[] | string | undefined): string[] | undefined {
  if (input == null) return undefined;
  const raw = Array.isArray(input) ? input.join(',') : input;
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}
