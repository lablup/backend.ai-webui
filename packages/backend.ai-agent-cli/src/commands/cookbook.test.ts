import { EXIT } from '../errors.js';
import { COMMANDS, findCommand } from '../registry.js';
import { runCli } from '../run.js';
import { saveSession } from '../session.js';
import type { CookbookData, CookbookSummary } from './cookbook.js';
import {
  cookbookCommandFor,
  cookbookPath,
  findEntry,
  loadCookbook,
  parseCookbook,
} from './cookbook.js';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Every command reads the checkout, so the tests run inside one. */
const cwd = import.meta.dirname;

let out: string[];
let err: string[];

const run = (argv: string[]) =>
  runCli({
    argv,
    cwd,
    io: {
      stdout: (chunk) => out.push(chunk),
      stderr: (chunk) => err.push(chunk),
    },
  });

const jsonOut = <T>() => (JSON.parse(out.join('')) as { data: T }).data;
const jsonErr = () =>
  JSON.parse(err.join('')) as {
    code: string;
    error: string;
    hint?: string;
    suggestions?: string[];
  };

beforeEach(() => {
  out = [];
  err = [];
});

describe('the cookbook file', () => {
  it('ships next to the CLI and parses into numbered entries', () => {
    const { path, entries } = loadCookbook();
    expect(path).toBe(cookbookPath());
    expect(path.endsWith('skill/references/query-cookbook.md')).toBe(true);
    expect(entries.length).toBeGreaterThanOrEqual(8);
    expect(entries.map((entry) => entry.number)).toEqual(
      entries.map((_, index) => index + 1),
    );
    for (const entry of entries) {
      expect(entry.title.length, `entry ${entry.number}`).toBeGreaterThan(0);
      expect(entry.rootFields.length, `entry ${entry.number}`).toBeGreaterThan(
        0,
      );
      expect(entry.body).toContain('```graphql');
    }
  });

  it('reads the root fields out of each entry’s document', () => {
    const { entries } = loadCookbook();
    expect(findEntry(entries, 'vfolder_nodes')?.number).toBe(3);
    expect(findEntry(entries, 'adminProjectsV2')?.number).toBe(9);
    expect(findEntry(entries, '3')?.rootFields).toContain('vfolder_nodes');
  });

  it('keeps a `###` heading under its `##` section', () => {
    const entries = parseCookbook(
      [
        '# Title',
        '',
        '## Sessions',
        '',
        '### 1. First',
        '',
        'prose',
        '',
        '```graphql',
        'query { user { email } }',
        '```',
        '',
        '## Storage',
        '',
        '### 2. Second',
        '',
        '```graphql',
        'query { vfolder_nodes(first: 1) { count } }',
        '```',
        '',
      ].join('\n'),
    );
    expect(entries.map((entry) => [entry.number, entry.section])).toEqual([
      [1, 'Sessions'],
      [2, 'Storage'],
    ]);
    expect(entries[0].rootFields).toEqual(['user']);
    expect(entries[0].body).not.toContain('## Storage');
  });
});

describe('bai-agent cookbook', () => {
  it('is registered, so --help and manifest carry it', () => {
    const command = findCommand('cookbook');
    expect(command).toBeDefined();
    expect(COMMANDS).toContain(command);
    expect(command?.flags.map((flag) => flag.flag)).toContain('--list');
  });

  it('--list prints every entry with its number, title and root fields', async () => {
    await expect(run(['cookbook', '--list', '--json'])).resolves.toBe(EXIT.ok);
    const data = jsonOut<Extract<CookbookData, { kind: 'list' }>>();
    expect(data.entries.length).toBeGreaterThanOrEqual(8);
    const third = data.entries.find(
      (entry: CookbookSummary) => entry.number === 3,
    );
    expect(third?.rootFields).toContain('vfolder_nodes');
    expect(third?.title.length).toBeGreaterThan(0);
  });

  it('lists the entries when no argument is given', async () => {
    await expect(run(['cookbook'])).resolves.toBe(EXIT.ok);
    const printed = out.join('');
    expect(printed).toContain('vfolder_nodes');
    expect(printed).toContain('adminProjectsV2');
  });

  it('prints one entry by number, with its heading, prose and document', async () => {
    await expect(run(['cookbook', '3', '--json'])).resolves.toBe(EXIT.ok);
    const data = jsonOut<Extract<CookbookData, { kind: 'entry' }>>();
    expect(data.entry.number).toBe(3);
    expect(data.entry.rootFields).toContain('vfolder_nodes');
    expect(data.entry.body).toMatch(/^### 3\. /);
    expect(data.entry.body).toContain('```graphql');
    expect(data.entry.body).toContain('vfolder_nodes(first: $first');
  });

  it('prints the entry a root field belongs to', async () => {
    await expect(run(['cookbook', 'adminProjectsV2'])).resolves.toBe(EXIT.ok);
    const printed = out.join('');
    expect(printed).toContain('entry:');
    expect(printed).toContain('adminProjectsV2(limit: $limit');
  });

  it('exits 5 not_found with the list as suggestions', async () => {
    await expect(run(['cookbook', 'no_such_field', '--json'])).resolves.toBe(
      EXIT.notFound,
    );
    const envelope = jsonErr();
    expect(envelope.code).toBe('not_found');
    expect(envelope.hint).toBe('bai-agent cookbook --list');
    expect(envelope.suggestions?.length).toBeGreaterThanOrEqual(8);
    expect(envelope.suggestions?.join('\n')).toContain('vfolder_nodes');
  });

  it('exits 5 for an entry number the cookbook does not have', async () => {
    await expect(run(['cookbook', '999', '--json'])).resolves.toBe(
      EXIT.notFound,
    );
    expect(jsonErr().code).toBe('not_found');
  });
});

describe('cookbookCommandFor', () => {
  it('names the entry for a root field the cookbook covers', () => {
    expect(cookbookCommandFor(['vfolder_nodes'])).toBe(
      'bai-agent cookbook vfolder_nodes',
    );
  });

  it('falls back to --list for a root field nothing covers', () => {
    expect(cookbookCommandFor(['user'])).toBe('bai-agent cookbook --list');
    expect(cookbookCommandFor([])).toBe('bai-agent cookbook --list');
  });
});

describe('query schema_mismatch', () => {
  const ENDPOINT = 'http://manager.example.com:8090';
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
      join(tmpdir(), 'bai-agent-cookbook-'),
    );
    saveSession({
      endpoint: ENDPOINT,
      webui: 'http://manager.example.com:8080',
      sessionId: 'abcdefghijklmnopqrstuvwxyz012345',
      savedAt: '2026-09-04T00:00:00.000Z',
    });
    fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('points a rejected document at the cookbook entry for its root field', async () => {
    await expect(
      run([
        'query',
        'query { vfolder_nodes(first: 1) { edges { node { nope_field } } } }',
        '--json',
      ]),
    ).resolves.toBe(EXIT.error);
    expect(fetchMock).not.toHaveBeenCalled();
    const envelope = jsonErr();
    expect(envelope.code).toBe('schema_mismatch');
    expect(envelope.suggestions).toContain('bai-agent cookbook vfolder_nodes');
    // The validator messages still come first, and the type hint is untouched.
    expect(envelope.suggestions?.[0]).toContain('nope_field');
    expect(envelope.hint).toBe('bai-agent schema show VirtualFolderNode');
  });

  it('falls back to the cookbook list when nothing covers the root field', async () => {
    await expect(
      run(['query', 'query { totally_unknown_root_field }', '--json']),
    ).resolves.toBe(EXIT.error);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(jsonErr().suggestions).toContain('bai-agent cookbook --list');
  });
});
