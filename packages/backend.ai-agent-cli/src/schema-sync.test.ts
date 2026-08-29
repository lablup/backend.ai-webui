import { EXIT } from './errors.js';
import { SUPERGRAPH_ASSET } from './github-release.js';
import type { RepoContext } from './repo-context.js';
import { resolveRepoContext } from './repo-context.js';
import { runCli } from './run.js';
import { readSchemaMeta, schemaMetaPath, sha256Of } from './schema-meta.js';
import { syncSchema } from './schema-sync.js';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const REMOTE_SDL = [
  'directive @join__type(graph: join__Graph!) on OBJECT',
  '',
  '"""Added in 26.4.10. A session."""',
  'type ComputeSessionNode @join__type(graph: STRAWBERRY) {',
  '  id: ID!',
  '}',
  '',
].join('\n');

const OLD_SDL = 'type Query { ping: String }\n';

const TAG = '26.4.10';
const ASSET_URL = `https://github.com/lablup/backend.ai/releases/download/${TAG}/${SUPERGRAPH_ASSET}`;

/** A checkout skeleton: only what `resolveRepoContext` insists on. */
function makeRepo(sdl = OLD_SDL): RepoContext {
  const root = mkdtempSync(join(tmpdir(), 'bai-agent-sync-'));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'backend.ai-webui', version: '26.9.0' }),
  );
  mkdirSync(join(root, 'data'));
  writeFileSync(join(root, 'data/schema.graphql'), sdl);
  mkdirSync(join(root, 'resources/i18n'), { recursive: true });
  mkdirSync(join(root, 'packages/backend.ai-webui-docs'), { recursive: true });
  return resolveRepoContext(root);
}

interface FakeFetchOptions {
  tag?: string;
  body?: string;
  releaseStatus?: number;
}

function fakeGitHub(options: FakeFetchOptions = {}) {
  const tag = options.tag ?? TAG;
  const body = options.body ?? REMOTE_SDL;
  const calls: string[] = [];
  const impl = vi.fn(async (input: Parameters<typeof fetch>[0]) => {
    const url = String(input);
    calls.push(url);
    if (url.startsWith('https://api.github.com/')) {
      if (options.releaseStatus && options.releaseStatus !== 200) {
        return new Response('{}', { status: options.releaseStatus });
      }
      return new Response(
        JSON.stringify({
          tag_name: tag,
          assets: [
            { name: 'checksum.txt', size: 10, browser_download_url: 'x' },
            {
              name: SUPERGRAPH_ASSET,
              size: Buffer.byteLength(body),
              browser_download_url: ASSET_URL,
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (url === ASSET_URL) return new Response(body, { status: 200 });
    throw new Error(`unexpected fetch: ${url}`);
  });
  return { impl: impl as unknown as typeof fetch, calls, raw: impl };
}

describe('schema sync', () => {
  it('writes the SDL and a meta file whose sha256 matches the bytes', async () => {
    const repo = makeRepo();
    const github = fakeGitHub();
    const data = await syncSchema(repo, { fetchImpl: github.impl });

    expect(data.outcome).toBe('updated');
    expect(data.tag).toBe(TAG);
    expect(data.tagSource).toBe('latest');
    expect(data.schemaChanged).toBe(true);

    const written = readFileSync(repo.schemaPath);
    expect(written.toString('utf8')).toBe(REMOTE_SDL);
    expect(sha256Of(written)).toBe(data.remoteSha256);

    const meta = readSchemaMeta(repo);
    expect(meta).not.toBeNull();
    expect(meta?.tag).toBe(TAG);
    expect(meta?.sha256).toBe(sha256Of(written));
    expect(meta?.source).toBe(ASSET_URL);
    expect(Date.parse(meta?.fetchedAt ?? '')).not.toBeNaN();

    // Two calls only: the release lookup and the asset download.
    expect(github.calls).toEqual([
      'https://api.github.com/repos/lablup/backend.ai/releases/latest',
      ASSET_URL,
    ]);
  });

  it('reports the asset as the same federation shape as the SDL', async () => {
    const repo = makeRepo(REMOTE_SDL);
    const data = await syncSchema(repo, {
      fetchImpl: fakeGitHub().impl,
      dryRun: true,
    });
    expect(data.remoteIsFederated).toBe(true);
    expect(data.localIsFederated).toBe(true);
  });

  it('is a no-op when the tag and the sha256 both already match', async () => {
    const repo = makeRepo();
    await syncSchema(repo, { fetchImpl: fakeGitHub().impl });
    const before = readFileSync(schemaMetaPath(repo), 'utf8');

    const again = await syncSchema(repo, { fetchImpl: fakeGitHub().impl });
    expect(again.outcome).toBe('unchanged');
    expect(again.schemaChanged).toBe(false);
    expect(again.byteDelta).toBe(0);
    // The meta file was not rewritten, so `fetchedAt` still reads as before.
    expect(readFileSync(schemaMetaPath(repo), 'utf8')).toBe(before);
  });

  it('records the tag when the bytes already match but the tag does not', async () => {
    const repo = makeRepo(REMOTE_SDL);
    const data = await syncSchema(repo, { fetchImpl: fakeGitHub().impl });
    expect(data.outcome).toBe('meta-recorded');
    expect(data.schemaChanged).toBe(false);
    expect(readSchemaMeta(repo)?.tag).toBe(TAG);
  });

  it('takes --tag through the tags endpoint', async () => {
    const repo = makeRepo();
    const github = fakeGitHub({ tag: '25.6.0' });
    const data = await syncSchema(repo, {
      tag: '25.6.0',
      fetchImpl: github.impl,
    });
    expect(data.tagSource).toBe('flag');
    expect(github.calls[0]).toBe(
      'https://api.github.com/repos/lablup/backend.ai/releases/tags/25.6.0',
    );
  });

  it('exits 5 when the tag has no release', async () => {
    const repo = makeRepo();
    await expect(
      syncSchema(repo, {
        tag: 'nope',
        fetchImpl: fakeGitHub({ releaseStatus: 404 }).impl,
      }),
    ).rejects.toMatchObject({ code: 'not_found', exitCode: EXIT.notFound });
  });

  it('names GITHUB_TOKEN when GitHub rate-limits the lookup', async () => {
    const repo = makeRepo();
    await expect(
      syncSchema(repo, {
        fetchImpl: fakeGitHub({ releaseStatus: 403 }).impl,
      }),
    ).rejects.toMatchObject({ hint: expect.stringContaining('GITHUB_TOKEN') });
  });

  it('sends GITHUB_TOKEN to the API and never to the asset CDN', async () => {
    const repo = makeRepo();
    const seen: Array<[string, string | null]> = [];
    const impl = vi.fn(
      async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
        const url = String(input);
        const headers = new Headers(init?.headers);
        seen.push([url, headers.get('authorization')]);
        if (url.startsWith('https://api.github.com/')) {
          return new Response(
            JSON.stringify({
              tag_name: TAG,
              assets: [
                {
                  name: SUPERGRAPH_ASSET,
                  size: 1,
                  browser_download_url: ASSET_URL,
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response(REMOTE_SDL, { status: 200 });
      },
    );
    await syncSchema(repo, {
      fetchImpl: impl as unknown as typeof fetch,
      env: { GITHUB_TOKEN: 'ghp_test' },
    });
    expect(seen[0][1]).toBe('Bearer ghp_test');
    expect(seen[1][1]).toBeNull();
  });
});

describe('schema sync --dry-run', () => {
  beforeEach(() => {
    process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
      join(tmpdir(), 'bai-agent-sync-cfg-'),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes nothing and reports the delta', async () => {
    const repo = makeRepo();
    const github = fakeGitHub();
    vi.stubGlobal('fetch', github.impl);

    let stdout = '';
    const exitCode = await runCli({
      argv: ['schema', 'sync', '--dry-run', '--json'],
      cwd: repo.repoRoot,
      io: {
        stdout: (chunk) => {
          stdout += chunk;
        },
        stderr: () => {},
      },
    });

    expect(exitCode).toBe(EXIT.ok);
    const { data } = JSON.parse(stdout);
    expect(data.outcome).toBe('dry-run');
    expect(data.dryRun).toBe(true);
    expect(data.schemaChanged).toBe(true);
    expect(data.remoteSha256).toBe(sha256Of(REMOTE_SDL));
    expect(data.localSha256).toBe(sha256Of(OLD_SDL));
    expect(data.byteDelta).toBe(
      Buffer.byteLength(REMOTE_SDL) - Buffer.byteLength(OLD_SDL),
    );

    expect(readFileSync(repo.schemaPath, 'utf8')).toBe(OLD_SDL);
    expect(existsSync(schemaMetaPath(repo))).toBe(false);
  });

  it('mirrors the JSON surface in text output', async () => {
    const repo = makeRepo();
    vi.stubGlobal('fetch', fakeGitHub().impl);

    let stdout = '';
    await runCli({
      argv: ['schema', 'sync', '--dry-run', '--detail'],
      cwd: repo.repoRoot,
      io: {
        stdout: (chunk) => {
          stdout += chunk;
        },
        stderr: () => {},
      },
    });
    expect(stdout).toContain(`tag:`);
    expect(stdout).toContain(TAG);
    expect(stdout).toContain(sha256Of(REMOTE_SDL));
    expect(stdout).toContain(ASSET_URL);
    expect(existsSync(schemaMetaPath(repo))).toBe(false);
  });

  it('rejects a positional argument in place of --tag', async () => {
    const repo = makeRepo();
    let stderr = '';
    const exitCode = await runCli({
      argv: ['schema', 'sync', '26.4.10', '--json'],
      cwd: repo.repoRoot,
      io: { stdout: () => {}, stderr: (chunk) => (stderr += chunk) },
    });
    expect(exitCode).toBe(EXIT.usage);
    expect(JSON.parse(stderr).hint).toContain('--tag 26.4.10');
  });
});
