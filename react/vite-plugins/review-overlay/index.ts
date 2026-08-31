import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { transformWithEsbuild, type Plugin } from 'vite';

/**
 * FR-3811 — dev-only review overlay, write side.
 *
 * Injects a same-origin ES module that mounts a Shadow-DOM overlay: pick an
 * element with react-grab, type a note, and a self-describing `#bai=v3`
 * markdown block lands on the clipboard. The read side (pins endpoint, panel,
 * polling) is FR-3813; this plugin serves the client and one tiny
 * `/__review/state` endpoint that answers "which PR is this dev server?".
 *
 * Dev-only by construction:
 *  - `apply: 'serve'` — the plugin does not exist during `vite build`, so
 *    production output carries no trace of the overlay.
 *  - Opt-in per session with `VITE_DEV_REVIEW_OVERLAY` (`1` / `true` / `on`);
 *    unset, the plugin registers no middleware and injects nothing.
 *
 * The client is TypeScript under `client/`, transpiled per request with
 * esbuild and served as plain ES modules — the browser resolves
 * `./codec.js` against `/__review/overlay.js`, which lands back here as
 * `/__review/codec.js`. No bundler step, and the same files are covered by
 * `pnpm tsc` (they are in `react/tsconfig.json`) and by vitest.
 *
 * Registration note: must come AFTER `projectRootStaticPlugin` in the plugins
 * array — that plugin's `order: 'pre'` transformIndexHtml handler discards the
 * incoming html and re-reads the template, so anything injected before it is
 * thrown away. This plugin uses `order: 'post'` tag injection.
 */

const OVERLAY_URL = '/__review/overlay.js';
const CLIENT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), 'client');
/** `/__review/overlay.js` is the entry; every other name maps 1:1 to a module. */
const ENTRY_MODULE = 'main';
const MODULE_NAME_RE = /^[a-z][a-z0-9-]*$/;

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

/**
 * The dev-server boot record written by the tooling that started this server.
 * `served[0]` is the layer actually running here, so its `pr` is the PR a
 * reviewer's block belongs to.
 */
interface BootRecord {
  schemaVersion?: number;
  app?: string;
  url?: string;
  repo?: string;
  branch?: string;
  served?: Array<{
    pr?: number;
    branch?: string;
    teamsThread?: string;
    commentId?: string;
  }>;
}

export interface ReviewState {
  pr: number | null;
  repo: string | null;
  branch: string | null;
  source: 'boot-record' | 'gh' | 'none';
  error?: string | null;
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

async function readBootRecord(): Promise<BootRecord | null> {
  const path = process.env.BAI_REVIEW_BOOT_RECORD;
  if (!path) return null;
  try {
    const record = JSON.parse(await readFile(path, 'utf-8')) as BootRecord;
    return record.schemaVersion === 1 ? record : null;
  } catch {
    return null;
  }
}

async function discoverState(): Promise<ReviewState> {
  const branch = await currentBranch();
  const record = await readBootRecord();
  const servedPr = record?.served?.find((entry) => entry.pr)?.pr;
  if (servedPr) {
    return {
      pr: servedPr,
      repo: record?.repo ?? null,
      branch: record?.branch ?? branch,
      source: 'boot-record',
    };
  }
  if (!branch) {
    return { pr: null, repo: null, branch: null, source: 'none' };
  }
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
      repo: null,
      branch,
      source: list[0]?.number ? 'gh' : 'none',
    };
  } catch {
    return {
      pr: null,
      repo: null,
      branch,
      source: 'none',
      error: 'gh pr list failed',
    };
  }
}

// -------------------------------------------------------------------- plugin

export function devReviewOverlayPlugin(): Plugin {
  if (!isReviewOverlayEnabled()) {
    return { name: 'bai-dev-review-overlay', apply: 'serve' };
  }

  let statePromise: Promise<ReviewState> | null = null;

  return {
    name: 'bai-dev-review-overlay',
    apply: 'serve',
    configureServer(server) {
      statePromise = discoverState();
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (!path.startsWith('/__review/')) return next();
        if ((req.method || 'GET') !== 'GET') {
          res.statusCode = 405;
          return res.end();
        }

        if (path === '/__review/state') {
          (statePromise ??= discoverState()).then(
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
        const notFound = () => {
          res.statusCode = 404;
          res.end();
        };
        const moduleName = path.slice('/__review/'.length).replace(/\.js$/, '');
        if (!MODULE_NAME_RE.test(moduleName)) return notFound();
        const file = resolve(
          CLIENT_DIR,
          `${moduleName === 'overlay' ? ENTRY_MODULE : moduleName}.ts`,
        );
        // Re-read and re-transpile every request: the client is a handful of
        // small files, and overlay iteration should show up on a plain reload.
        readFile(file, 'utf-8')
          .then((source) =>
            transformWithEsbuild(source, file, {
              loader: 'ts',
              format: 'esm',
              target: 'es2020',
              sourcemap: 'inline',
            }),
          )
          .then(({ code }) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-store');
            res.end(code);
          }, notFound);
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
