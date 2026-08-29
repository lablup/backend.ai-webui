import { EXIT } from './errors.js';
import { resolveRepoContext } from './repo-context.js';
import { runCli } from './run.js';
import { DOMAINS, runSearch } from './search/engine.js';
import type { SearchData } from './search/engine.js';
import {
  buildI18nReverseIndex,
  clearI18nIndexCache,
} from './search/i18n-index.js';
import { clearSchemaCache, loadSchema } from './search/schema-sdl.js';
import {
  clearSchemaEntryCache,
  showSchemaEntry,
} from './search/schema-search.js';
import { describe, expect, it } from 'vitest';

/**
 * Ranking regression against the REAL manual, terminology and SDL in this
 * checkout. Every expectation below was read off the implementation and then
 * checked by hand against the markdown, the i18n stores and the SDL it points
 * at. This is the full FR-3765 14-query set: 10 docs/terminology queries from
 * FR-3758 plus 4 schema-centric ones.
 */
const context = resolveRepoContext(import.meta.dirname);

const search = (query: string, limit = 10): SearchData =>
  runSearch(context, { query, lang: 'en', domains: [...DOMAINS], limit });

interface Expectation {
  query: string;
  /** The id that must rank first. */
  top: string;
  reason: string;
  /** Ids that must appear somewhere in the returned page of hits. */
  contains?: string[];
  /** Canonical terms the normalisation header must announce. */
  normalisedTo?: string[];
  /** `<id>` -> the English UI label the hit must carry. */
  uiLabels?: Record<string, string>;
}

const EXPECTATIONS: Expectation[] = [
  {
    // No `resource preset` concept exists in terminology.json. The schema
    // names the type exactly (100), so it now leads the manual's own section.
    query: 'resource preset',
    top: 'schema:ResourcePreset',
    reason: 'name-exact',
    contains: [
      'docs:admin_menu#admin_menu-manage-resource-preset',
      'schema:Query.resource_preset',
    ],
    normalisedTo: ['Resource Preset'],
  },
  {
    // The manual has no "Session status" heading; the detail panel is where
    // the status is documented. `ComputeSessionNode.status` is the field the
    // session table renders under `session.Status`, which is what lifts it.
    query: 'session status',
    top: 'schema:ComputeSessionNode.status',
    reason: 'name-tokens',
    contains: [
      'docs:sessions_all#sessions_all-session-detail-panel',
      'docs:sessions_all#sessions_all-session-scheduling-history',
    ],
    normalisedTo: ['Session Status'],
    uiLabels: { 'schema:ComputeSessionNode.status': 'Status' },
  },
  {
    query: 'vfolder',
    top: 'term:storage-folder-technical',
    reason: 'exact-title',
    contains: ['schema:Query.vfolder'],
    normalisedTo: ['vfolder'],
  },
  {
    query: 'model service',
    top: 'term:model-serving',
    reason: 'heading-phrase',
    contains: ['schema:ModelServiceConfig'],
  },
  {
    // Three headings carry the phrase; the shortest one is the most focused,
    // which is what the title-length tie-break picks. The schema's
    // `SchedulingResult` ties at 80 but loses on description coverage.
    query: 'scheduling',
    top: 'docs:deployment#deployment-scheduling-history',
    reason: 'heading-phrase',
    contains: [
      'docs:appendix#appendix-automated-job-scheduling',
      'docs:sessions_all#sessions_all-session-scheduling-history',
      'schema:SchedulingResult',
    ],
  },
  {
    query: 'storage folder',
    top: 'term:storage-folder',
    reason: 'exact-title',
    contains: ['docs:vfolder#vfolder-create-storage-folder'],
    normalisedTo: ['storage folder'],
  },
  {
    // Korean query: no English token matches, so recall comes entirely from
    // the exact i18n label match that expands it to the English label, which
    // then names the `EnvironmentVariables` input type exactly.
    query: '환경 변수',
    top: 'schema:EnvironmentVariables',
    reason: 'name-exact',
    contains: [
      'docs:sessions_all#sessions_all-how-to-add-environment-variable-before-creating-a-session',
    ],
    normalisedTo: ['Environment Variables'],
  },
  {
    query: 'endpoint',
    top: 'term:endpoint',
    reason: 'exact-title',
    contains: ['docs:login#login-api-endpoint', 'schema:Endpoint'],
  },
  {
    query: 'keypair',
    top: 'term:keypair',
    reason: 'exact-title',
    contains: [
      'docs:admin_menu#admin_menu-manage-users-keypairs',
      'schema:Query.keypair',
    ],
    normalisedTo: ['keypair', 'Keypair'],
  },
  {
    query: 'agent',
    top: 'term:agent',
    reason: 'exact-title',
    contains: ['docs:admin_menu#admin_menu-manage-agent-nodes', 'schema:Agent'],
    uiLabels: { 'schema:ComputeSessionNode.agent_ids': 'Agent' },
  },
  {
    // Qualified name: `compute session node status` is the field's own
    // spelling-independent key, so it is an exact match.
    query: 'ComputeSessionNode status',
    top: 'schema:ComputeSessionNode.status',
    reason: 'name-exact',
    contains: ['schema:ComputeSessionNode.status_info'],
    uiLabels: { 'schema:ComputeSessionNode.status': 'Status' },
  },
  {
    // `KeypairResourcePolicyV2` tokenises to exactly the three query tokens
    // (the trailing `v2` does not count), but the manual's own heading carries
    // all three too and wins at 75.
    query: 'resource policy keypair',
    top: 'docs:admin_menu#admin_menu-keypair-resource-policy',
    reason: 'heading-tokens',
    contains: ['schema:KeypairResourcePolicyV2'],
  },
  {
    // `scaling group` is the deprecated spelling of `resource group`;
    // terminology normalises it, and the schema still uses the old name.
    query: 'scaling group',
    top: 'term:resource-group',
    reason: 'exact-title',
    contains: [
      'docs:admin_menu#admin_menu-resource-group',
      'schema:ScalingGroup',
      'schema:ComputeSessionNode.scaling_group',
    ],
    normalisedTo: ['resource group'],
    uiLabels: { 'schema:ComputeSessionNode.scaling_group': 'Resource Group' },
  },
  {
    // Japanese query, cross-language i18n normalisation: `セッション` is the
    // ja value of several keys whose en values are `Session` / `Sessions`.
    query: 'セッション',
    top: 'term:nav-sessions',
    reason: 'exact-title',
    contains: ['docs:project_admin#project_admin-sessions'],
    normalisedTo: ['Sessions', 'Session'],
  },
];

describe.each(EXPECTATIONS.map((one) => [one.query, one] as const))(
  'search %j',
  (_query, expectation) => {
    const data = search(expectation.query);
    const ids = data.hits.map((hit) => hit.id);

    it('ranks the expected hit first', () => {
      expect(ids[0]).toBe(expectation.top);
      expect(data.hits[0].reason).toBe(expectation.reason);
    });

    it('returns hits carrying an id, a url and a follow-up command', () => {
      expect(data.hits.length).toBeGreaterThan(0);
      for (const hit of data.hits) {
        expect(hit.url).toMatch(
          /^https:\/\/(webui\.docs\.backend\.ai|github\.com\/lablup)\//,
        );
        expect(hit.command.startsWith('bai-agent ')).toBe(true);
        expect(hit.reason.length).toBeLessThanOrEqual(60);
        expect(hit.score).toBeGreaterThan(0);
      }
    });

    if (expectation.contains) {
      it.each(expectation.contains)('also returns %s', (id) => {
        expect(ids).toContain(id);
      });
    }

    if (expectation.normalisedTo) {
      it.each(expectation.normalisedTo)('normalises to %s', (canonical) => {
        expect(data.normalised.map((one) => one.canonical)).toContain(
          canonical,
        );
      });
    }

    if (expectation.uiLabels) {
      it.each(Object.entries(expectation.uiLabels))(
        'labels %s with the UI string %s',
        (id, label) => {
          expect(data.hits.find((hit) => hit.id === id)?.uiLabel?.label).toBe(
            label,
          );
        },
      );
    }
  },
);

describe('search surface', () => {
  it('defaults to 10 hits over every implemented domain', () => {
    const data = search('session');
    expect(data.limit).toBe(10);
    expect(data.hits.length).toBe(10);
    expect(data.domains).toEqual([...DOMAINS]);
  });

  it('honours --domain by dropping the other domains', () => {
    for (const domain of DOMAINS) {
      const only = runSearch(context, {
        query: 'keypair',
        lang: 'en',
        domains: [domain],
        limit: 5,
      });
      expect(only.hits.every((hit) => hit.domain === domain)).toBe(true);
    }
  });

  it('keeps a reserved slot for every domain under a tight limit', () => {
    const domains = search('keypair', 3).hits.map((hit) => hit.domain);
    expect(new Set(domains)).toEqual(new Set(DOMAINS));
  });

  it('collapses same-named schema fields into one hit', () => {
    const ids = runSearch(context, {
      query: 'status',
      lang: 'en',
      domains: ['schema'],
      limit: 10,
    }).hits.map((hit) => hit.id.replace(/^schema:.*\./, ''));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not let --lang change recall', () => {
    const english = search('storage folder');
    const korean = runSearch(context, {
      query: 'storage folder',
      lang: 'ko',
      domains: [...DOMAINS],
      limit: 10,
    });
    expect(korean.hits.map((hit) => hit.id)).toEqual(
      english.hits.map((hit) => hit.id),
    );
    const localized = korean.hits.find((hit) =>
      hit.id.startsWith('docs:vfolder#'),
    );
    expect(localized?.url).toContain('/ko/');
    expect(localized?.url).toContain('#vfolder-');
    expect(localized?.title).not.toBe(
      english.hits.find((hit) => hit.id === localized?.id)?.title,
    );
  });

  it('localises the UI label without changing the hit', () => {
    const korean = runSearch(context, {
      query: 'session status',
      lang: 'ko',
      domains: ['schema'],
      limit: 5,
    });
    const hit = korean.hits.find(
      (one) => one.id === 'schema:ComputeSessionNode.status',
    );
    expect(hit?.uiLabel).toEqual({
      key: 'session.Status',
      label: '상태',
      lang: 'ko',
    });
  });
});

describe('schema index', () => {
  const schema = loadSchema(context);

  it('parses the SDL into types, fields and enum values', () => {
    expect(schema.stats.types).toBeGreaterThan(1000);
    expect(schema.stats.fields).toBeGreaterThan(5000);
    expect(schema.stats.enumValues).toBeGreaterThan(500);
    expect(schema.byName.has('ComputeSessionNode')).toBe(true);
    // Federation plumbing is not part of the API surface.
    expect([...schema.byName.keys()].some((name) => name.includes('__'))).toBe(
      false,
    );
  });

  it('is cached per process', () => {
    expect(loadSchema(context)).toBe(schema);
  });

  it('maps i18n labels back to the fields the WebUI renders', () => {
    const index = buildI18nReverseIndex(context, schema);
    expect(index.byField.get('ComputeSessionNode.status')).toEqual([
      'session.Status',
    ]);
    expect(index.byKey.get('session.Status')).toContain(
      'ComputeSessionNode.status',
    );
    expect(index.stats.labelledFields).toBeGreaterThan(20);
  });
});

describe('schema show', () => {
  it('reports a field, its type and the marker it inherits', () => {
    const data = showSchemaEntry(context, {
      id: 'ComputeSessionNode.status',
      lang: 'en',
    });
    expect(data.entryKind).toBe('field');
    expect(data.type).toBe('String');
    expect(data.addedIn).toBe('24.09.0');
    expect(data.markerSource).toBe('type');
    expect(data.uiLabel).toEqual({
      key: 'session.Status',
      label: 'Status',
      lang: 'en',
    });
    expect(data.path).toMatch(/^data\/schema\.graphql:\d+$/);
  });

  it('reports a field that carries its own marker', () => {
    const data = showSchemaEntry(context, {
      id: 'ComputeSessionNode.priority',
      lang: 'en',
    });
    expect(data.markerSource).toBe('own');
    expect(data.addedIn).toBe('24.09.0');
  });

  it('reports a deprecated type with the note that replaces it', () => {
    const data = showSchemaEntry(context, {
      id: 'ContainerRegistry',
      lang: 'en',
    });
    expect(data.deprecatedSince).toBe('24.09.0');
    expect(data.deprecatedNote).toContain('ContainerRegistryNode');
    expect(data.interfaces).toContain('Node');
  });

  it('lists enum values with their inherited markers', () => {
    const data = showSchemaEntry(context, {
      id: 'SessionV2Status',
      lang: 'en',
    });
    expect(data.graphqlKind).toBe('enum');
    expect(data.values.map((value) => value.name)).toContain('RUNNING');
    expect(data.values[0].markerSource).toBe('type');
  });

  it('shows one enum value', () => {
    const data = showSchemaEntry(context, {
      id: 'SessionV2Status.RUNNING',
      lang: 'en',
    });
    expect(data.entryKind).toBe('enum-value');
    expect(data.typeName).toBe('SessionV2Status');
  });

  it('prints the pagination-mode rule for a connection field', () => {
    const data = showSchemaEntry(context, {
      id: 'Query.adminKeypairResourcePoliciesV2',
      lang: 'en',
    });
    expect(data.pagination?.modes).toEqual([
      'forward cursor (first + after)',
      'backward cursor (last + before)',
      'offset (limit + offset)',
    ]);
    expect(data.pagination?.reference).toBe(
      '.claude/rules/graphql-pagination.md',
    );
  });

  it('leaves a non-connection field without a pagination block', () => {
    expect(
      showSchemaEntry(context, { id: 'ComputeSessionNode.status', lang: 'en' })
        .pagination,
    ).toBeUndefined();
  });

  it('tolerates the schema: prefix and the wrong identifier spelling', () => {
    expect(
      showSchemaEntry(context, {
        id: 'schema:computesessionnode.STATUS',
        lang: 'en',
      }).id,
    ).toBe('ComputeSessionNode.status');
  });
});

async function invoke(argv: string[]) {
  let stdout = '';
  let stderr = '';
  const exitCode = await runCli({
    argv,
    cwd: import.meta.dirname,
    io: {
      stdout: (chunk) => {
        stdout += chunk;
      },
      stderr: (chunk) => {
        stderr += chunk;
      },
    },
  });
  return { exitCode, stdout, stderr };
}

describe('search, docs and schema commands', () => {
  it('mirrors the JSON envelope in the text output', async () => {
    const json = await invoke([
      'search',
      'session status',
      '--limit',
      '3',
      '--json',
    ]);
    const text = await invoke(['search', 'session status', '--limit', '3']);
    const parsed = JSON.parse(json.stdout);
    expect(parsed.type).toBe('search');
    for (const hit of parsed.data.hits) {
      expect(text.stdout).toContain(hit.id);
      expect(text.stdout).toContain(hit.url);
      expect(text.stdout).toContain(hit.command);
      if (hit.uiLabel) {
        expect(text.stdout).toContain(
          `${hit.uiLabel.label} (${hit.uiLabel.key}, ${hit.uiLabel.lang})`,
        );
      }
    }
  });

  it('mirrors the JSON envelope of schema show in the text output', async () => {
    const json = await invoke([
      'schema',
      'show',
      'ComputeSessionNode.status',
      '--json',
    ]);
    const text = await invoke(['schema', 'show', 'ComputeSessionNode.status']);
    const { data } = JSON.parse(json.stdout);
    for (const value of [data.id, data.type, data.addedIn, data.url]) {
      expect(text.stdout).toContain(value);
    }
    expect(text.stdout).toContain('Status (session.Status, en)');
  });

  it('prints the normalisation header once per canonical term', async () => {
    const { stdout } = await invoke(['search', 'resource preset']);
    const lines = stdout
      .split('\n')
      .filter((line) => line.startsWith('normalised:'));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('Resource Preset');
    expect(lines[0]).toContain('i18n');
  });

  it('names the owning field in the normalisation header when known', async () => {
    const { stdout } = await invoke(['search', 'Resource Group']);
    expect(stdout).toContain('-> ComputeSessionNode.scaling_group');
  });

  it('treats `docs search` as `search --domain docs`', async () => {
    const alias = await invoke(['docs', 'search', 'keypair', '--json']);
    const explicit = await invoke([
      'search',
      'keypair',
      '--domain',
      'docs',
      '--json',
    ]);
    expect(JSON.parse(alias.stdout).data.hits).toEqual(
      JSON.parse(explicit.stdout).data.hits,
    );
  });

  it('treats `schema search` as `search --domain schema`', async () => {
    const alias = await invoke(['schema', 'search', 'keypair', '--json']);
    const explicit = await invoke([
      'search',
      'keypair',
      '--domain',
      'schema',
      '--json',
    ]);
    expect(JSON.parse(alias.stdout).data.hits).toEqual(
      JSON.parse(explicit.stdout).data.hits,
    );
  });

  it('shows exactly one section, and the whole page with --full', async () => {
    const id = 'docs:vfolder#vfolder-models';
    const section = await invoke(['docs', 'show', id, '--json']);
    const full = await invoke(['docs', 'show', id, '--full', '--json']);
    const sectionData = JSON.parse(section.stdout).data;
    const fullData = JSON.parse(full.stdout).data;

    expect(sectionData.full).toBe(false);
    expect(sectionData.content.split('\n')[0]).toMatch(/^## /);
    expect(sectionData.content).not.toContain('# Handling Data');
    expect(fullData.full).toBe(true);
    expect(fullData.content).toContain('# Handling Data');
    expect(fullData.content.length).toBeGreaterThan(sectionData.content.length);
  });

  it('tolerates a bare <slug>#<anchor> id', async () => {
    const { exitCode, stdout } = await invoke([
      'docs',
      'show',
      'vfolder#vfolder-models',
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.ok);
    expect(JSON.parse(stdout).data.id).toBe('docs:vfolder#vfolder-models');
  });

  it('exits 5 with suggestions on an unknown id', async () => {
    for (const argv of [
      ['docs', 'show', 'docs:vfolder#vfolder-nope'],
      ['schema', 'show', 'ComputeSessionNodes'],
      ['schema', 'show', 'ComputeSessionNode.nope'],
    ]) {
      const { exitCode, stderr } = await invoke([...argv, '--json']);
      expect(exitCode, argv.join(' ')).toBe(EXIT.notFound);
      const parsed = JSON.parse(stderr);
      expect(parsed.code).toBe('not_found');
      expect(parsed.suggestions.length).toBeLessThanOrEqual(5);
      expect(parsed.suggestions.length).toBeGreaterThan(0);
      expect(parsed.hint.startsWith('bai-agent ')).toBe(true);
    }
  });

  it('exits 2 on a bad domain, limit or language', async () => {
    for (const argv of [
      ['search', 'x', '--domain', 'nope'],
      ['search', 'x', '--limit', '0'],
      ['search', 'x', '--lang', 'nope'],
      ['search'],
      ['docs', 'nope'],
      ['schema', 'nope'],
      ['schema', 'show'],
    ]) {
      const { exitCode } = await invoke([...argv, '--json']);
      expect(exitCode, argv.join(' ')).toBe(EXIT.usage);
    }
  });

  it('reports the schema group in doctor', async () => {
    const { stdout } = await invoke(['doctor', '--json']);
    const checks = JSON.parse(stdout).data.checks.filter(
      (check: { group: string }) => check.group === 'schema',
    );
    expect(checks.map((check: { check: string }) => check.check)).toEqual([
      'sdl parses',
      'type and field counts',
      'marker coverage',
      'i18n reverse index',
    ]);
    expect(
      checks.every((check: { status: string }) => check.status !== 'fail'),
    ).toBe(true);
  });
});

/**
 * Wall-clock budgets, measured from cold caches. Generous on purpose: CI is
 * slower and noisier than a dev box, and the point is to catch an accidental
 * re-parse per candidate, not to benchmark.
 */
describe('performance', () => {
  const cold = (): void => {
    clearSchemaCache();
    clearSchemaEntryCache();
    clearI18nIndexCache();
  };

  it('runs a full docs+schema+terminology search under 1500 ms', () => {
    cold();
    const started = performance.now();
    const data = search('session status');
    const elapsed = performance.now() - started;
    expect(data.hits.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1500);
  });

  it('runs schema show under 500 ms', () => {
    cold();
    const started = performance.now();
    showSchemaEntry(context, { id: 'ComputeSessionNode.status', lang: 'en' });
    expect(performance.now() - started).toBeLessThan(500);
  });
});
