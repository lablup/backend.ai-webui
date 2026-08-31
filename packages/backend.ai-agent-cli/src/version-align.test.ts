import { updateConfig } from './config.js';
import { EXIT } from './errors.js';
import { clearManagerVersionCache } from './manager.js';
import { resolveRepoContext } from './repo-context.js';
import { runCli } from './run.js';
import type { SchemaIndex } from './search/schema-sdl.js';
import { saveSession } from './session.js';
import {
  applyVersionAlignmentGate,
  checkVersionAlignment,
} from './version-align.js';
import { compareVersions } from './version-order.js';
import { mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const repoCwd = import.meta.dirname;

/**
 * The real checkout's data behind a root that also carries a config.toml —
 * what a developer machine looks like, and what CI never has.
 */
function checkoutWithToml(apiEndpoint: string): string {
  const real = resolveRepoContext(repoCwd).repoRoot;
  const root = mkdtempSync(join(tmpdir(), 'bai-agent-toml-checkout-'));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'backend.ai-webui', version: '0.0.0-toml' }),
  );
  for (const dir of ['data', 'resources', 'packages', 'react']) {
    symlinkSync(join(real, dir), join(root, dir), 'dir');
  }
  writeFileSync(
    join(root, 'config.toml'),
    `[general]\napiEndpoint = "${apiEndpoint}"\n`,
  );
  return root;
}
const ENDPOINT = 'http://manager.test.invalid:8090';
const SESSION_ID = 'abcdefghijklmnopqrstuvwxyz012345';

/** A hand-built index: the alignment check only reads markers. */
function fakeSchema(): SchemaIndex {
  const marked = (addedIn?: string, deprecatedSince?: string) => ({
    ...(addedIn ? { addedIn } : {}),
    ...(deprecatedSince ? { deprecatedSince } : {}),
  });
  const type = {
    name: 'SessionNode',
    kind: 'object' as const,
    description: '',
    marker: marked('25.6.0'),
    markerSource: 'own' as const,
    interfaces: [],
    unionMembers: [],
    graphs: [],
    fields: [
      {
        name: 'future',
        type: 'String',
        namedType: 'String',
        description: '',
        marker: marked('26.9.0'),
        markerSource: 'own' as const,
        args: [],
        paginationArgs: [],
        line: 2,
      },
      {
        name: 'gone',
        type: 'String',
        namedType: 'String',
        description: '',
        marker: marked(undefined, '24.03.0'),
        markerSource: 'own' as const,
        args: [],
        paginationArgs: [],
        line: 3,
      },
      {
        name: 'inherited',
        type: 'String',
        namedType: 'String',
        description: '',
        marker: marked('25.6.0'),
        markerSource: 'type' as const,
        args: [],
        paginationArgs: [],
        line: 4,
      },
    ],
    values: [],
    line: 1,
  };
  return {
    path: '/tmp/fake.graphql',
    types: [type],
    byName: new Map([[type.name, type]]),
    byLowerName: new Map([[type.name.toLowerCase(), type]]),
    stats: {
      types: 1,
      fields: 3,
      enumValues: 0,
      typesWithMarker: 1,
      fieldsWithMarker: 3,
      fieldsWithOwnMarker: 2,
    },
  };
}

describe('compareVersions', () => {
  it('orders release numbers numerically, leading zeros included', () => {
    expect(compareVersions('24.09.0', '24.9.0')).toBe(0);
    expect(compareVersions('25.6.0', '26.4.10')).toBeLessThan(0);
    expect(compareVersions('26.4.10', '26.4.9')).toBeGreaterThan(0);
    expect(compareVersions('26.4', '26.4.1')).toBeLessThan(0);
  });

  it('sorts a pre-release below its own release', () => {
    expect(compareVersions('26.4.10rc1', '26.4.10')).toBeLessThan(0);
    expect(compareVersions('26.4.10', '26.4.10rc1')).toBeGreaterThan(0);
    expect(compareVersions('26.4.10a1', '26.4.10rc1')).toBeLessThan(0);
  });
});

describe('checkVersionAlignment', () => {
  const schemaCtx = { schema: fakeSchema() };

  it('flags what the manager is too old to have, and what it deprecated', () => {
    const alignment = checkVersionAlignment(schemaCtx, '25.6.0');
    expect(alignment.aligned).toBe(false);
    expect(alignment.newer.map((one) => one.id)).toEqual([
      'SessionNode.future',
    ]);
    expect(alignment.deprecated.map((one) => one.id)).toEqual([
      'SessionNode.gone',
    ]);
    expect(alignment.summary).toContain('25.6.0');
    expect(alignment.hint).toBe('bai-agent schema sync --tag 25.6.0');
  });

  it('counts only own markers when the whole schema is compared', () => {
    // `SessionNode.inherited` repeats its type's marker; the type stands for it.
    expect(checkVersionAlignment(schemaCtx, '25.6.0').checked).toBe(3);
  });

  it('uses the effective (possibly inherited) marker for a named selection', () => {
    const alignment = checkVersionAlignment(schemaCtx, '24.03.0', [
      'SessionNode.inherited',
    ]);
    expect(alignment.checked).toBe(1);
    expect(alignment.newer).toEqual([
      { id: 'SessionNode.inherited', version: '25.6.0', markerSource: 'type' },
    ]);
  });

  it('is aligned when the manager is newer than every marker', () => {
    const alignment = checkVersionAlignment(schemaCtx, '27.0.0', [
      'SessionNode.future',
    ]);
    expect(alignment.aligned).toBe(true);
    expect(alignment.summary).toBe('schema matches manager 27.0.0');
  });

  it('tolerates a name the schema does not carry', () => {
    expect(
      checkVersionAlignment(schemaCtx, '25.6.0', ['Nope.field']).checked,
    ).toBe(0);
  });
});

/** `/func/` answers the version; the gql endpoint answers the probe. */
function fakeManager(managerVersion: string) {
  const calls: string[] = [];
  return {
    calls,
    impl: vi.fn(async (input: Parameters<typeof fetch>[0]) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith('/func/')) {
        return new Response(
          JSON.stringify({ version: 'v8.20240915', manager: managerVersion }),
          { status: 200 },
        );
      }
      if (url.endsWith('/func/admin/gql')) {
        return new Response(
          JSON.stringify({
            data: { __schema: { queryType: { name: 'Query' } } },
          }),
          { status: 200 },
        );
      }
      throw new Error(`unexpected fetch: ${url}`);
    }) as unknown as typeof fetch,
  };
}

describe('the version gate', () => {
  beforeEach(() => {
    clearManagerVersionCache();
    process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
      join(tmpdir(), 'bai-agent-align-'),
    );
    saveSession({
      endpoint: ENDPOINT,
      webui: 'https://fr-3770.localhost:1355',
      sessionId: SESSION_ID,
      savedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearManagerVersionCache();
  });

  it('warns once on stderr by default', async () => {
    const manager = fakeManager('25.6.0');
    const notices: string[] = [];
    const { alignment } = await applyVersionAlignmentGate({
      cwd: repoCwd,
      schemaCtx: { schema: fakeSchema() },
      notify: (message) => notices.push(message),
      fetchImpl: manager.impl,
      endpointFlag: ENDPOINT,
    });
    expect(notices).toHaveLength(1);
    expect(notices[0]).toContain('warning:');
    expect(notices[0]).toContain('bai-agent schema sync --tag 25.6.0');
    expect(alignment?.managerVersion).toBe('25.6.0');
  });

  it('refuses with version_mismatch under --strict', async () => {
    await expect(
      applyVersionAlignmentGate({
        cwd: repoCwd,
        schemaCtx: { schema: fakeSchema() },
        strict: true,
        fetchImpl: fakeManager('25.6.0').impl,
        endpointFlag: ENDPOINT,
      }),
    ).rejects.toMatchObject({
      code: 'version_mismatch',
      exitCode: EXIT.error,
    });
  });

  it('stays quiet, and off the network, without a stored session', async () => {
    process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
      join(tmpdir(), 'bai-agent-align-empty-'),
    );
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    const result = await applyVersionAlignmentGate({
      cwd: repoCwd,
      schemaCtx: { schema: fakeSchema() },
      strict: true,
      endpointFlag: ENDPOINT,
    });
    expect(result).toEqual({});
    expect(spy).not.toHaveBeenCalled();
  });

  it('says nothing when the manager cannot be reached', async () => {
    const notices: string[] = [];
    const result = await applyVersionAlignmentGate({
      cwd: repoCwd,
      schemaCtx: { schema: fakeSchema() },
      notify: (message) => notices.push(message),
      fetchImpl: (async () => {
        throw new Error('ECONNREFUSED');
      }) as unknown as typeof fetch,
      endpointFlag: ENDPOINT,
    });
    expect(result).toEqual({});
    expect(notices).toEqual([]);
  });

  it('skips introspection silently when the manager has it disabled', async () => {
    const impl = vi.fn(async (input: Parameters<typeof fetch>[0]) => {
      const url = String(input);
      if (url.endsWith('/func/')) {
        return new Response(JSON.stringify({ manager: '25.6.0' }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({ errors: [{ message: 'introspection is disabled' }] }),
        { status: 200 },
      );
    });
    const { manager } = await applyVersionAlignmentGate({
      cwd: repoCwd,
      schemaCtx: { schema: fakeSchema() },
      notify: () => {},
      fetchImpl: impl as unknown as typeof fetch,
      endpointFlag: ENDPOINT,
    });
    expect(manager?.managerVersion).toBe('25.6.0');
    expect(manager?.introspection).toBeUndefined();
  });
});

async function invoke(argv: string[], cwd = repoCwd) {
  let stdout = '';
  let stderr = '';
  const exitCode = await runCli({
    argv,
    cwd,
    io: {
      stdout: (chunk) => (stdout += chunk),
      stderr: (chunk) => (stderr += chunk),
    },
  });
  return { exitCode, stdout, stderr };
}

describe('schema show against a mocked manager', () => {
  beforeEach(() => {
    clearManagerVersionCache();
    process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
      join(tmpdir(), 'bai-agent-show-'),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearManagerVersionCache();
  });

  it('warns on stderr and carries the verdict in --json', async () => {
    saveSession({
      endpoint: ENDPOINT,
      webui: '',
      sessionId: SESSION_ID,
      savedAt: new Date().toISOString(),
    });
    // Older than every `Added in` marker in the committed SDL.
    vi.stubGlobal('fetch', fakeManager('20.03.0').impl);

    const { exitCode, stdout, stderr } = await invoke([
      'schema',
      'show',
      'ComputeSessionNode.status',
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.ok);
    expect(stderr).toContain('warning:');
    const { data } = JSON.parse(stdout);
    expect(data.alignment.managerVersion).toBe('20.03.0');
    expect(data.alignment.aligned).toBe(false);
    expect(data.alignment.newer[0].id).toBe('ComputeSessionNode.status');
  });

  it('exits 1 with version_mismatch under --strict', async () => {
    saveSession({
      endpoint: ENDPOINT,
      webui: '',
      sessionId: SESSION_ID,
      savedAt: new Date().toISOString(),
    });
    vi.stubGlobal('fetch', fakeManager('20.03.0').impl);

    const { exitCode, stderr } = await invoke([
      'schema',
      'show',
      'ComputeSessionNode.status',
      '--strict',
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.error);
    const envelope = JSON.parse(stderr);
    expect(envelope.code).toBe('version_mismatch');
    expect(envelope.hint).toBe('bai-agent schema sync --tag 20.03.0');
  });

  it('touches the network in no command when no session is stored', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', spy);

    await invoke(['schema', 'show', 'ComputeSessionNode.status', '--json']);
    await invoke(['doctor', '--json']);
    await invoke(['version', '--json']);
    await invoke(['search', 'storage folder', '--json']);

    expect(spy).not.toHaveBeenCalled();
  });

  it('keeps doctor offline when only a checkout config.toml names an endpoint', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', spy);
    const root = checkoutWithToml('http://toml.test.invalid:8090');

    const { stdout } = await invoke(['doctor', '--json'], root);
    expect(spy).not.toHaveBeenCalled();
    const { data } = JSON.parse(stdout);
    const probe = data.checks.find(
      (check: { group: string; check: string }) =>
        check.group === 'alignment' && check.check === 'manager version',
    );
    expect(probe.status).toBe('warn');
    expect(probe.detail).toContain('no endpoint recorded');

    // An endpoint `init` recorded is a deliberate choice: then doctor probes.
    updateConfig({ endpoint: 'http://recorded.test.invalid:8090' });
    await invoke(['doctor', '--json'], root);
    expect(spy).not.toHaveBeenCalled(); // config.toml still outranks config.json
    await invoke(['doctor', '--json']);
    expect(spy).toHaveBeenCalled(); // outside a config.toml checkout it does
  });
});

describe('doctor schema alignment', () => {
  beforeEach(() => {
    clearManagerVersionCache();
    process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
      join(tmpdir(), 'bai-agent-doctor-'),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('warns with a sync hint when schema.meta.json is missing', async () => {
    const { stdout } = await invoke(['doctor', '--json']);
    const { data } = JSON.parse(stdout);
    const alignment = data.checks.filter(
      (check: { group: string }) => check.group === 'alignment',
    );
    expect(alignment.map((check: { check: string }) => check.check)).toEqual([
      'sdl present',
      'data/schema.meta.json',
      'manager version',
      'verdict',
    ]);

    const meta = alignment[1];
    expect(meta.status).toBe('warn');
    expect(meta.detail).toContain('missing');
    expect(meta.hint).toBe('bai-agent schema sync');
    // A checkout with no meta and no session is normal, never a failure.
    expect(
      alignment.every((check: { status: string }) => check.status !== 'fail'),
    ).toBe(true);
    expect(data.summary.fail).toBe(0);
  });
});
