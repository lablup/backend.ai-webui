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

/** A Portless state dir holding `hostnames` as registered routes. */
function portlessState(hostnames: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'bai-cli-portless-'));
  writeFileSync(
    join(dir, 'routes.json'),
    JSON.stringify(
      hostnames.map((hostname, i) => ({
        hostname,
        port: 4000 + i,
        pid: 1000 + i,
      })),
    ),
  );
  return dir;
}

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
      'fr-3654.localhost',
      'fr-3665-pr9049-statusline.localhost',
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe(
      'https://fr-3665-pr9049-statusline.localhost:1357',
    );
  });

  it('prefers an exact match over a composed one', () => {
    const cwd = repoOnBranch('FR-3665');
    const state = portlessState([
      'fr-3665-pr9049-statusline.localhost',
      'fr-3665.localhost',
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe('https://fr-3665.localhost:1357');
  });

  it('takes the shortest when several extend the issue key', () => {
    const cwd = repoOnBranch('FR-3665');
    const state = portlessState([
      'fr-3665-pr9049-statusline-and-more.localhost',
      'fr-3665-alt.localhost',
    ]);
    expect(devWebUiOrigin(cwd, env(state))).toBe(
      'https://fr-3665-alt.localhost:1357',
    );
  });

  it('does not match a different issue that merely shares a prefix', () => {
    const cwd = repoOnBranch('FR-366');
    const state = portlessState(['fr-3665-pr9049-statusline.localhost']);
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
  });

  it('has no issue key to resolve on a branch without one', () => {
    const cwd = repoOnBranch('main');
    const state = portlessState(['fr-3665-pr9049-statusline.localhost']);
    expect(devWebUiOrigin(cwd, env(state))).toBe('https://localhost:1357');
  });
});
