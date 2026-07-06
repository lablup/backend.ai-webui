/**
 * Spawns Playwright with the smoke config and writes a small summary.json
 * next to the html report. Diagnostic enrichment is out of scope for FR-2877
 * and lands in FR-2879 (Phase 2).
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildGrepExpression,
  buildPlaywrightEnv,
  type EffectiveRole,
  type SmokeRunOptions,
} from './config.js';
import { CLI_VERSION, PLAYWRIGHT_VERSION, WEBUI_SHA } from './version.js';

const nodeRequire = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve the bundled `playwright.smoke.config.ts` shipped with the package. */
function smokeConfigPath(): string {
  // dist/runner.js → ../playwright.smoke.config.ts
  // src/runner.ts (dev) → ../playwright.smoke.config.ts
  return path.resolve(__dirname, '..', 'playwright.smoke.config.ts');
}

export interface SmokeSummary {
  endpoint: string;
  webserver: string;
  role: EffectiveRole;
  roleSelection: SmokeRunOptions['role'];
  /** Tags OR-ed onto the smoke selection via `--also-include`. */
  alsoInclude?: string[];
  exclude?: string[];
  pages?: string[];
  grep?: string;
  grepInvert?: string;
  startedAt: string;
  finishedAt: string;
  exitCode: number;
  cliVersion: string;
  webuiSha: string;
  playwrightVersion: string;
  /** Counts parsed from playwright json reporter output, if available. */
  results?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
  };
}

/**
 * Auto-detect role by hitting the webserver's /server/login endpoint.
 *
 * On any failure (network error, non-200 status, malformed JSON,
 * `authenticated !== true`) we throw. Silently defaulting to `'user'`
 * was masking real misconfiguration — operators ended up with a green
 * smoke run that had skipped every admin-tagged spec without saying so.
 *
 * The body shape we POST here (`{ username, password }`) mirrors what
 * the SESSION-mode browser fixture submits to `/server/login`. The
 * proper signed-request based detection — using the post-login
 * `/func/auth/role` endpoint — is tracked in TODO(FR-2878).
 */
export async function detectRole(opts: SmokeRunOptions): Promise<EffectiveRole> {
  const url = `${opts.webserver.replace(/\/$/, '')}/server/login`;
  // Honour --insecure-tls for the detection call so self-signed certs
  // don't crash detection before we even reach Playwright.
  //
  // Note: this temporarily mutates the *current* (host) process env —
  // `NODE_TLS_REJECT_UNAUTHORIZED` is a Node-wide knob and there is no
  // per-call switch for the built-in `fetch`. We restore the previous
  // value (or delete the key if it was unset) in `finally`, so the
  // mutation is scoped to the duration of this detection request.
  // The same flag is also forwarded to the spawned Playwright process
  // via `buildPlaywrightEnv` so the in-browser HTTPS calls inherit it.
  const previousTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (opts.insecureTls) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  try {
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // TODO(FR-2878): switch to signed-request /func/auth/role for a
        // proper detection. This naive form matches what the SESSION-mode
        // browser fixture submits to /server/login and works against the
        // current staging cluster.
        body: JSON.stringify({ username: opts.email, password: opts.password }),
      });
    } catch (err) {
      throw new Error(
        `Failed to auto-detect role for ${opts.email} against ${opts.webserver}: ` +
          `${(err as Error).message}. Pass --role admin or --role user explicitly and retry.`,
      );
    }
    if (!res.ok) {
      throw new Error(
        `Failed to auto-detect role for ${opts.email} against ${opts.webserver}: ` +
          `webserver returned HTTP ${res.status}. ` +
          `Pass --role admin or --role user explicitly and retry.`,
      );
    }
    const json = (await res.json().catch(() => null)) as
      | {
          authenticated?: boolean;
          data?: { role?: string; is_admin?: boolean };
        }
      | null;
    if (!json || json.authenticated !== true) {
      throw new Error(
        `Failed to auto-detect role for ${opts.email} against ${opts.webserver}: ` +
          `login not authenticated (unexpected response shape or wrong credentials). ` +
          `Pass --role admin or --role user explicitly and retry.`,
      );
    }
    const role = json.data?.role;
    const isAdmin = json.data?.is_admin === true;
    if (role === 'admin' || role === 'superadmin' || isAdmin) {
      return 'admin';
    }
    return 'user';
  } finally {
    if (opts.insecureTls) {
      if (previousTlsReject === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTlsReject;
      }
    }
  }
}

export interface SmokeRunResult {
  exitCode: number;
  reportPath: string;
  summary: SmokeSummary;
}

/**
 * Resolve the absolute path to the bundled `playwright` CLI launcher,
 * regardless of whether we run from `dist/` or `src/`.
 */
function resolvePlaywrightCli(): string {
  // `@playwright/test`'s package.json `bin.playwright` points at the
  // launcher we want to spawn.
  const pkgPath = nodeRequire.resolve('@playwright/test/package.json');
  const pkg = nodeRequire(pkgPath) as { bin?: Record<string, string> | string };
  const binEntry =
    typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.playwright ?? './cli.js';
  return path.resolve(path.dirname(pkgPath), binEntry);
}

export async function runSmoke(opts: SmokeRunOptions): Promise<SmokeRunResult> {
  const startedAt = new Date().toISOString();
  fs.mkdirSync(opts.outputDir, { recursive: true });

  const effectiveRole: EffectiveRole =
    opts.role === 'auto' ? await detectRole(opts) : opts.role;

  const env = buildPlaywrightEnv(opts, effectiveRole);
  const { grep, grepInvert } = buildGrepExpression(opts, effectiveRole);

  const cliJs = resolvePlaywrightCli();
  const args: string[] = ['test', '--config', smokeConfigPath()];
  if (opts.headed) args.push('--headed');

  process.stdout.write(
    `[bai-smoke] starting playwright (role=${effectiveRole}, output=${opts.outputDir})\n`,
  );

  const exitCode: number = await new Promise((resolve) => {
    const child = spawn(process.execPath, [cliJs, ...args], {
      env,
      stdio: 'inherit',
    });
    child.on('exit', (code, signal) => {
      if (signal) {
        process.stderr.write(`[bai-smoke] playwright terminated by signal ${signal}\n`);
        resolve(1);
      } else {
        resolve(code ?? 1);
      }
    });
    child.on('error', (err) => {
      process.stderr.write(`[bai-smoke] failed to spawn playwright: ${err.message}\n`);
      resolve(1);
    });
  });

  const finishedAt = new Date().toISOString();
  const summary: SmokeSummary = {
    endpoint: opts.endpoint,
    webserver: opts.webserver,
    role: effectiveRole,
    roleSelection: opts.role,
    alsoInclude: opts.include,
    exclude: opts.exclude,
    pages: opts.pages,
    grep,
    grepInvert,
    startedAt,
    finishedAt,
    exitCode,
    cliVersion: CLI_VERSION,
    webuiSha: WEBUI_SHA,
    playwrightVersion: PLAYWRIGHT_VERSION,
    results: parseResults(path.join(opts.outputDir, 'results.json')),
  };

  fs.writeFileSync(
    path.join(opts.outputDir, 'summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );

  return {
    exitCode,
    reportPath: path.join(opts.outputDir, 'html', 'index.html'),
    summary,
  };
}

function parseResults(jsonPath: string): SmokeSummary['results'] | undefined {
  if (!fs.existsSync(jsonPath)) return undefined;
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw) as {
      stats?: {
        expected?: number;
        unexpected?: number;
        skipped?: number;
        flaky?: number;
      };
      suites?: unknown;
    };
    const stats = data.stats ?? {};
    const passed = stats.expected ?? 0;
    const failed = stats.unexpected ?? 0;
    const skipped = stats.skipped ?? 0;
    const flaky = stats.flaky ?? 0;
    return {
      total: passed + failed + skipped + flaky,
      passed,
      failed,
      skipped,
      flaky,
    };
  } catch {
    return undefined;
  }
}
