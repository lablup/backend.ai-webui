import { readBootRecord, servedEntry } from './boot-record.js';
import type { ReviewServerState } from './client/types.js';
import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { transformWithEsbuild, type Plugin } from 'vite';

/**
 * FR-3811 — dev-only review overlay, write side. Serves the Shadow-DOM picker
 * client and the `/__review/state` endpoint that answers "which PR is this
 * dev server?". The read side (FR-3813) is the deep link and nothing else:
 * the fragment carries the whole anchor, so this server serves no pin list and
 * polls nothing.
 *
 * Dev-only by construction: `apply: 'serve'` keeps the plugin out of
 * `vite build` entirely, and it is opt-in per session with
 * `VITE_DEV_REVIEW_OVERLAY` (`1` / `true` / `on`).
 *
 * Registration order matters: this must come AFTER `projectRootStaticPlugin`,
 * whose `order: 'pre'` transformIndexHtml handler discards the incoming html
 * and re-reads the template, throwing away anything injected before it.
 */

const OVERLAY_URL = '/__review/overlay.js';
const CLIENT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), 'client');
/** `/__review/overlay.js` is the entry; every other name maps 1:1 to a module. */
const ENTRY_MODULE = 'main';
const MODULE_NAME_RE = /^[a-z][a-z0-9-]*$/;
/** A `pr: null` answer is retried this often — a PR opened after boot recovers. */
const REDISCOVER_AFTER_MS = 30_000;

const pexecFile = promisify(execFile);

/**
 * `loadEnv()` in `vite.config.ts` runs before the plugins array is built, so
 * `process.env.VITE_DEV_REVIEW_OVERLAY` already reflects any `.env*` value.
 */
function isReviewOverlayEnabled(): boolean {
  const flag = (process.env.VITE_DEV_REVIEW_OVERLAY ?? '').toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'on';
}

// ------------------------------------------------------------- PR discovery

export type ReviewState = ReviewServerState;

const NO_STATE: ReviewServerState = {
  pr: null,
  repo: null,
  branch: null,
  source: 'none',
};

/**
 * The prefix the client strips off react-grab's absolute source paths. Git,
 * not the Vite root: a workspace package lives above `react/`, and what the
 * block should carry is the path as the repository names it.
 */
async function repoRoot(): Promise<string | null> {
  try {
    const { stdout } = await pexecFile('git', ['rev-parse', '--show-toplevel']);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function currentBranch(): Promise<string | null> {
  try {
    const { stdout } = await pexecFile('git', [
      'symbolic-ref',
      '-q',
      '--short',
      'HEAD',
    ]);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/** Total by construction: every failure resolves to a `source: 'none'` state. */
async function discoverPrState(): Promise<ReviewServerState> {
  try {
    const branch = await currentBranch();
    const record = await readBootRecord();
    const entry = servedEntry(record, branch);
    if (entry?.pr) {
      return {
        pr: entry.pr,
        repo: record?.repo ?? null,
        branch: entry.branch ?? record?.branch ?? branch,
        source: 'boot-record',
      };
    }
    if (!branch) return NO_STATE;
    try {
      const { stdout } = await pexecFile('gh', [
        'pr',
        'list',
        '--head',
        branch,
        '--state',
        'open',
        '--json',
        'number',
        '--limit',
        '1',
      ]);
      const list = JSON.parse(stdout) as Array<{ number?: number }>;
      return {
        pr: list[0]?.number ?? null,
        repo: record?.repo ?? null,
        branch,
        source: list[0]?.number ? 'gh' : 'none',
      };
    } catch {
      return {
        ...NO_STATE,
        branch,
        error: 'gh pr list failed',
      };
    }
  } catch (error) {
    return { ...NO_STATE, error: String(error) };
  }
}

/** The root rides along on every answer, including the failure ones. */
async function discoverState(): Promise<ReviewServerState> {
  const [state, root] = await Promise.all([discoverPrState(), repoRoot()]);
  return { ...state, root };
}

// -------------------------------------------------------------------- plugin

export function devReviewOverlayPlugin(): Plugin {
  if (!isReviewOverlayEnabled()) {
    return { name: 'bai-dev-review-overlay', apply: 'serve' };
  }

  let cached: { state: ReviewServerState; at: number } | null = null;
  let inFlight: Promise<ReviewServerState> | null = null;
  /** Transpiled client modules, keyed by path and invalidated by mtime+size. */
  const transformed = new Map<
    string,
    { mtimeMs: number; size: number; code: string }
  >();

  function reviewState(): Promise<ReviewServerState> {
    const now = Date.now();
    if (
      cached &&
      (cached.state.pr !== null || now - cached.at < REDISCOVER_AFTER_MS)
    ) {
      return Promise.resolve(cached.state);
    }
    inFlight ??= discoverState().then((state) => {
      cached = { state, at: Date.now() };
      inFlight = null;
      return state;
    });
    return inFlight;
  }

  async function clientModule(file: string): Promise<string> {
    const info = await stat(file);
    const hit = transformed.get(file);
    if (hit && hit.mtimeMs === info.mtimeMs && hit.size === info.size) {
      return hit.code;
    }
    const source = await readFile(file, 'utf-8');
    const { code } = await transformWithEsbuild(source, file, {
      loader: 'ts',
      format: 'esm',
      target: 'es2020',
      sourcemap: 'inline',
    });
    transformed.set(file, { mtimeMs: info.mtimeMs, size: info.size, code });
    return code;
  }

  return {
    name: 'bai-dev-review-overlay',
    apply: 'serve',
    configureServer(server) {
      void reviewState();
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (!path.startsWith('/__review/')) return next();
        if ((req.method || 'GET') !== 'GET') {
          res.statusCode = 405;
          return res.end();
        }

        if (path === '/__review/state') {
          reviewState().then(
            (state) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store');
              res.end(JSON.stringify(state));
            },
            () => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end('{"error":"discovery failed"}');
            },
          );
          return;
        }

        // The whole `/__review/` prefix is ours, so an unknown name is a 404
        // rather than a fall-through to Vite's SPA fallback, which would hand
        // the importing module index.html and a bare syntax error.
        const moduleName = path.slice('/__review/'.length).replace(/\.js$/, '');
        if (!MODULE_NAME_RE.test(moduleName)) {
          res.statusCode = 404;
          return res.end();
        }
        const file = resolve(
          CLIENT_DIR,
          `${moduleName === 'overlay' ? ENTRY_MODULE : moduleName}.ts`,
        );
        clientModule(file).then(
          (code) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-store');
            res.end(code);
          },
          (error: NodeJS.ErrnoException) => {
            if (error?.code === 'ENOENT') {
              res.statusCode = 404;
              return res.end();
            }
            // A syntax error in the client is the overlay author's, and a
            // bare 404 hides it behind "module not found".
            const message = error?.message ?? String(error);
            server.config.logger.error(
              `[bai-review] ${moduleName}.ts failed to transpile: ${message}`,
              { timestamp: true },
            );
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            return res.end(message);
          },
        );
      });
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: { type: 'module', src: OVERLAY_URL },
              injectTo: 'body',
            },
          ],
        };
      },
    },
  };
}
