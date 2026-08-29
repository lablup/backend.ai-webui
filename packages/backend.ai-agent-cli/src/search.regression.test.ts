import { EXIT } from './errors.js';
import { resolveRepoContext } from './repo-context.js';
import { runCli } from './run.js';
import { DOMAINS, runSearch } from './search/engine.js';
import type { SearchData } from './search/engine.js';
import { describe, expect, it } from 'vitest';

/**
 * Ranking regression against the REAL manual and terminology in this checkout.
 * Every expectation below was read off the implementation and then checked by
 * hand against the markdown it points at. FR-3765 extends the table to the
 * full 14-query set; keep the shape.
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
}

const EXPECTATIONS: Expectation[] = [
  {
    // No `resource preset` concept exists in terminology.json, so the manual's
    // own section wins; the i18n label supplies the normalisation header.
    query: 'resource preset',
    top: 'docs:admin_menu#admin_menu-manage-resource-preset',
    reason: 'heading-phrase',
    normalisedTo: ['Resource Preset'],
  },
  {
    // The manual has no "Session status" heading; the detail panel is where the
    // status is documented, and the phrase occurs there.
    query: 'session status',
    top: 'docs:sessions_all#sessions_all-session-detail-panel',
    reason: 'body-tokens',
    contains: ['docs:sessions_all#sessions_all-session-scheduling-history'],
    normalisedTo: ['Session Status'],
  },
  {
    query: 'vfolder',
    top: 'term:storage-folder-technical',
    reason: 'exact-title',
    normalisedTo: ['vfolder'],
  },
  {
    query: 'model service',
    top: 'term:model-serving',
    reason: 'heading-phrase',
  },
  {
    // Three headings carry the phrase; the shortest one is the most focused,
    // which is what the title-length tie-break picks.
    query: 'scheduling',
    top: 'docs:deployment#deployment-scheduling-history',
    reason: 'heading-phrase',
    contains: [
      'docs:appendix#appendix-automated-job-scheduling',
      'docs:sessions_all#sessions_all-session-scheduling-history',
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
    // Korean query: no English token matches, so recall comes entirely from the
    // exact i18n label match that expands it to the English label.
    query: '환경 변수',
    top: 'docs:sessions_all#sessions_all-how-to-add-environment-variable-before-creating-a-session',
    reason: 'heading-phrase',
    normalisedTo: ['Environment Variables'],
  },
  {
    query: 'endpoint',
    top: 'term:endpoint',
    reason: 'exact-title',
    contains: ['docs:login#login-api-endpoint'],
  },
  {
    query: 'keypair',
    top: 'term:keypair',
    reason: 'exact-title',
    contains: ['docs:admin_menu#admin_menu-manage-users-keypairs'],
    normalisedTo: ['keypair', 'Keypair'],
  },
  {
    query: 'agent',
    top: 'term:agent',
    reason: 'exact-title',
    contains: ['docs:admin_menu#admin_menu-manage-agent-nodes'],
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
        expect(hit.url.startsWith('https://webui.docs.backend.ai/')).toBe(true);
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
    const docsOnly = runSearch(context, {
      query: 'keypair',
      lang: 'en',
      domains: ['docs'],
      limit: 5,
    });
    expect(docsOnly.hits.every((hit) => hit.domain === 'docs')).toBe(true);
  });

  it('keeps a reserved slot for terminology under a tight limit', () => {
    const data = search('keypair', 2);
    expect(data.hits.map((hit) => hit.domain)).toContain('terminology');
    expect(data.hits.map((hit) => hit.domain)).toContain('docs');
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

describe('search and docs commands', () => {
  it('mirrors the JSON envelope in the text output', async () => {
    const json = await invoke(['search', 'keypair', '--limit', '3', '--json']);
    const text = await invoke(['search', 'keypair', '--limit', '3']);
    const parsed = JSON.parse(json.stdout);
    expect(parsed.type).toBe('search');
    for (const hit of parsed.data.hits) {
      expect(text.stdout).toContain(hit.id);
      expect(text.stdout).toContain(hit.url);
      expect(text.stdout).toContain(hit.command);
    }
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
    const { exitCode, stderr } = await invoke([
      'docs',
      'show',
      'docs:vfolder#vfolder-nope',
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.notFound);
    const parsed = JSON.parse(stderr);
    expect(parsed.code).toBe('not_found');
    expect(parsed.suggestions.length).toBeLessThanOrEqual(5);
    expect(parsed.suggestions.length).toBeGreaterThan(0);
    expect(parsed.hint).toContain('bai-agent search');
  });

  it('exits 2 on a bad domain, limit or language', async () => {
    for (const argv of [
      ['search', 'x', '--domain', 'nope'],
      ['search', 'x', '--limit', '0'],
      ['search', 'x', '--lang', 'nope'],
      ['search'],
      ['docs', 'nope'],
    ]) {
      const { exitCode } = await invoke([...argv, '--json']);
      expect(exitCode, argv.join(' ')).toBe(EXIT.usage);
    }
  });
});
