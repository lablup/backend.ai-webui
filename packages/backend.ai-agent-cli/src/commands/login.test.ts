import { devWebUiOrigin } from './login.js';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A checkout `tryResolveRepoContext` accepts, sitting on `branch`. It needs the
 * root package name plus every REQUIRED_SOURCES entry to exist.
 */
function repoOnBranch(branch: string): string {
  const root = mkdtempSync(join(tmpdir(), 'bai-cli-login-'));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'backend.ai-webui', version: '0.0.0-test' }),
  );
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(join(root, 'data', 'schema.graphql'), 'type Query { a: Int }\n');
  mkdirSync(join(root, 'resources', 'i18n'), { recursive: true });
  mkdirSync(join(root, 'packages', 'backend.ai-webui-docs'), { recursive: true });
  mkdirSync(join(root, '.git'));
  writeFileSync(join(root, '.git', 'HEAD'), `ref: refs/heads/${branch}\n`);
  return root;
}

/**
 * A Portless state dir. `pid` defaults to this test process, whose cwd is the
 * package directory — i.e. a live route that this checkout does NOT own, which is
 * what the liveness-but-not-ownership fallback is about.
 */
function portlessState(
  routes: Array<{ hostname: string; pid?: number }>,
): string {
  const dir = mkdtempSync(join(tmpdir(), 'bai-cli-portless-'));
  writeFileSync(
    join(dir, 'routes.json'),
    JSON.stringify(
      routes.map((route, i) => ({
        hostname: route.hostname,
        port: 4000 + i,
        pid: route.pid ?? process.pid,
      })),
    ),
  );
  return dir;
}

/** A pid that is certainly not running, for the stale-entry cases. */
const DEAD_PID = 2 ** 22 - 1;

describe('devWebUiOrigin', () => {
  const env = (stateDir?: string) => ({
    PORTLESS_PORT: '1357',
    ...(stateDir ? { PORTLESS_STATE_DIR: stateDir } : {}),
  });

  it('falls back to the bare issue key when no route is registered', () => {
    const cwd = repoOnBranch('fix/FR-3665-portless-app-name');
    expect(devWebUiOrigin(cwd, env(portlessState([])))).toBe(
      'https://fr-3665.localhost:1357',
    );
  });

  // FR-3665: dev.mjs now names the server `<issue>-<pr>-<word>`, so the issue key
  // on its own is no longer a hostname once a PR exists.
  it('resolves to the composed route that is actually running', () => {
    const cwd = repoOnBranch('fix/FR-3665-portless-app-name');
    const state = portlessState([
      { hostname: 'fr-3654.localhost' },
      { hostname: 'fr-3665-pr9049-statusline.localhost' },
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe(
      'https://fr-3665-pr9049-statusline.localhost:1357',
    );
  });

  it('ignores a route whose owning process is gone', () => {
    const cwd = repoOnBranch('FR-3665');
    const state = portlessState([
      { hostname: 'fr-3665-pr9049-statusline.localhost', pid: DEAD_PID },
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe('https://fr-3665.localhost:1357');
  });

  it('skips a dead route in favour of a live one', () => {
    const cwd = repoOnBranch('FR-3665');
    const state = portlessState([
      { hostname: 'fr-3665-old.localhost', pid: DEAD_PID },
      { hostname: 'fr-3665-pr9049-statusline.localhost' },
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe(
      'https://fr-3665-pr9049-statusline.localhost:1357',
    );
  });

  it('ignores an alias route, which has no owning process', () => {
    const cwd = repoOnBranch('FR-3665');
    const state = portlessState([{ hostname: 'fr-3665-alias.localhost', pid: 0 }]);
    expect(devWebUiOrigin(cwd, env(state))).toBe('https://fr-3665.localhost:1357');
  });

  it('prefers an exact match over a composed one', () => {
    const cwd = repoOnBranch('FR-3665');
    const state = portlessState([
      { hostname: 'fr-3665-pr9049-statusline.localhost' },
      { hostname: 'fr-3665.localhost' },
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe('https://fr-3665.localhost:1357');
  });

  it('takes the shortest when several extend the issue key', () => {
    const cwd = repoOnBranch('FR-3665');
    const state = portlessState([
      { hostname: 'fr-3665-pr9049-statusline-and-more.localhost' },
      { hostname: 'fr-3665-alt.localhost' },
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe(
      'https://fr-3665-alt.localhost:1357',
    );
  });

  it('does not match a different issue that merely shares a prefix', () => {
    const cwd = repoOnBranch('FR-366');
    const state = portlessState([
      { hostname: 'fr-3665-pr9049-statusline.localhost' },
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe('https://fr-366.localhost:1357');
  });

  it('survives a missing or malformed routes.json', () => {
    const cwd = repoOnBranch('FR-3665');
    const missing = mkdtempSync(join(tmpdir(), 'bai-cli-portless-'));
    expect(devWebUiOrigin(cwd, env(missing))).toBe('https://fr-3665.localhost:1357');

    const bad = mkdtempSync(join(tmpdir(), 'bai-cli-portless-'));
    writeFileSync(join(bad, 'routes.json'), '{not json');
    expect(devWebUiOrigin(cwd, env(bad))).toBe('https://fr-3665.localhost:1357');

    const wrongShape = mkdtempSync(join(tmpdir(), 'bai-cli-portless-'));
    writeFileSync(join(wrongShape, 'routes.json'), '{"hostname":"x"}');
    expect(devWebUiOrigin(cwd, env(wrongShape))).toBe(
      'https://fr-3665.localhost:1357',
    );

    const noPid = mkdtempSync(join(tmpdir(), 'bai-cli-portless-'));
    writeFileSync(
      join(noPid, 'routes.json'),
      JSON.stringify([{ hostname: 'fr-3665-x.localhost', port: 1 }]),
    );
    expect(devWebUiOrigin(cwd, env(noPid))).toBe('https://fr-3665.localhost:1357');
  });

  it('has no issue key to resolve on a branch without one', () => {
    const cwd = repoOnBranch('main');
    const state = portlessState([
      { hostname: 'fr-3665-pr9049-statusline.localhost' },
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe('https://localhost:1357');
  });
});
