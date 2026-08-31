import { EXIT } from '../errors.js';
import { ALLOWED_MUTATION_NAMES } from '../mutation-allowlist.js';
import { parseVariables } from '../query/document.js';
import { runCli } from '../run.js';
import { saveSession } from '../session.js';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ENDPOINT = 'http://manager.example.com:8090';
const WEBUI = 'https://fr-3768.localhost:1355';
const SESSION_ID = 'abcdefghijklmnopqrstuvwxyz012345';

/** The command reads the checkout's SDL, so it must run inside one. */
const cwd = import.meta.dirname;

let out: string[];
let err: string[];
let fetchMock: ReturnType<typeof vi.fn>;

const io = {
  stdout: (chunk: string) => out.push(chunk),
  stderr: (chunk: string) => err.push(chunk),
};

const run = (argv: string[]) => runCli({ argv, cwd, io });

const stubFetch = (body: unknown) => {
  fetchMock = vi.fn(
    async () => new Response(JSON.stringify(body), { status: 200 }),
  );
  vi.stubGlobal('fetch', fetchMock);
};

const jsonOut = () => JSON.parse(out.join('')) as { data: Record<string, any> };
const jsonErr = () =>
  JSON.parse(err.join('')) as {
    code: string;
    error: string;
    hint?: string;
    suggestions?: string[];
  };

const sessionEdges = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    node: {
      id: `Q29tcHV0ZVNlc3Npb246${index}`,
      row_id: `row-${index}`,
      name: `session-${index}`,
      status_info: 'x'.repeat(400),
    },
  }));

beforeEach(() => {
  out = [];
  err = [];
  process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
    join(tmpdir(), 'bai-agent-query-'),
  );
  saveSession({
    endpoint: ENDPOINT,
    webui: WEBUI,
    sessionId: SESSION_ID,
    savedAt: '2026-08-29T00:00:00.000Z',
  });
  stubFetch({ data: {} });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SDL pre-validation', () => {
  it('exits 1 with schema_mismatch before any fetch', async () => {
    await expect(
      run([
        'query',
        'query { compute_session_nodes(first: 1) { edges { node { nope_field } } } }',
        '--json',
      ]),
    ).resolves.toBe(EXIT.error);

    expect(fetchMock).not.toHaveBeenCalled();
    const envelope = jsonErr();
    expect(envelope.code).toBe('schema_mismatch');
    expect(envelope.suggestions?.join(' ')).toContain('nope_field');
    // The hint names a type the reader can actually look up.
    expect(envelope.hint).toBe('bai-agent schema show ComputeSessionNode');
  });

  it('falls back to the root type when the bad field is on Query', async () => {
    await expect(
      run(['query', 'query { totally_unknown_root_field }', '--json']),
    ).resolves.toBe(EXIT.error);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(jsonErr().hint).toBe('bai-agent schema show Query');
  });

  it('falls back to the root field when no type can be pulled', async () => {
    await expect(
      run([
        'query',
        'query Unused($x: Int) { user { email } }',
        '--json',
      ]),
    ).resolves.toBe(EXIT.error);
    expect(fetchMock).not.toHaveBeenCalled();
    // "Variable "$x" is never used" names no type at all.
    expect(jsonErr().hint).toBe('bai-agent schema show Query.user');
  });

  it('skips the built-in scalar a nullability complaint names', async () => {
    await expect(
      run([
        'query',
        'query($limit: Int) { compute_session_list(limit: $limit, offset: 0) { total_count } }',
        '--json',
      ]),
    ).resolves.toBe(EXIT.error);
    expect(fetchMock).not.toHaveBeenCalled();
    const envelope = jsonErr();
    expect(envelope.suggestions?.join(' ')).toContain('expecting type "Int!"');
    // `schema show Int` would exit 5; the field the argument belongs to does not.
    expect(envelope.hint).toBe('bai-agent schema show Query.compute_session_list');
  });

  it('rejects a document with more than one operation, with no fetch', async () => {
    await expect(
      run([
        'query',
        'query A { user { email } } query B { user { username } }',
        '--json',
      ]),
    ).resolves.toBe(EXIT.usage);
    expect(fetchMock).not.toHaveBeenCalled();
    const envelope = jsonErr();
    expect(envelope.code).toBe('usage');
    expect(envelope.error).toContain('2 operations (A, B)');
    expect(envelope.hint).toContain('query');
  });

  it('rejects a syntactically broken document', async () => {
    await expect(run(['query', 'query { user {', '--json'])).resolves.toBe(
      EXIT.error,
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(jsonErr().code).toBe('schema_mismatch');
  });
});

describe('the mutation allow-list', () => {
  const CREATE_VFOLDER =
    'mutation { createVfolderV2(input: {name: "x"}) { vfolder { id } } }';

  it('refuses every mutation without --allow-mutation, with no fetch', async () => {
    await expect(run(['query', CREATE_VFOLDER, '--json'])).resolves.toBe(
      EXIT.mutationRefused,
    );
    expect(fetchMock).not.toHaveBeenCalled();
    const envelope = jsonErr();
    expect(envelope.code).toBe('mutation_refused');
    expect(envelope.error).toContain('--allow-mutation');
    expect(envelope.hint).toBe('/data');
  });

  it('refuses a non-allow-listed mutation even with the flag, hinting its page', async () => {
    await expect(
      run([
        'query',
        'mutation { delete_user(email: "a@b.c") { ok } }',
        '--allow-mutation',
        '--json',
      ]),
    ).resolves.toBe(EXIT.mutationRefused);
    expect(fetchMock).not.toHaveBeenCalled();
    const envelope = jsonErr();
    expect(envelope.error).toContain('not on the allow-list');
    expect(envelope.hint).toBe('/admin/users?tab=users');
    expect(envelope.suggestions?.[0]).toContain(ALLOWED_MUTATION_NAMES[0]);
  });

  it('points a refused preset mutation at the Environment page', async () => {
    await expect(
      run([
        'query',
        'mutation { create_resource_preset(name: "p", props: {resource_slots: "{}"}) { ok } }',
        '--json',
      ]),
    ).resolves.toBe(EXIT.mutationRefused);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(jsonErr().hint).toBe('/admin/environment');
  });

  it('never allow-lists a destructive field', () => {
    expect(
      ALLOWED_MUTATION_NAMES.filter((name) =>
        /delete|purge|terminate|revoke|disassociate|unload/i.test(name),
      ),
    ).toEqual([]);
  });

  it('executes an allow-listed mutation when the flag is given', async () => {
    stubFetch({ data: { createVfolderV2: { vfolder: { id: 'vf-9' } } } });

    await expect(
      run(['query', CREATE_VFOLDER, '--allow-mutation', '--json']),
    ).resolves.toBe(EXIT.ok);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(jsonOut().data.result.createVfolderV2.vfolder.id).toBe('vf-9');
  });
});

describe('variables', () => {
  it('parses --var as JSON when it parses, else as a string', () => {
    expect(
      parseVariables(['limit=10', 'name=alpha', 'on=true', 'ids=["a","b"]']),
    ).toEqual({ limit: 10, name: 'alpha', on: true, ids: ['a', 'b'] });
  });

  it('rejects a --var without an =', () => {
    expect(() => parseVariables(['limit'])).toThrow(/k=v/);
  });

  it('sends repeated --var flags as query variables', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: [] } } });

    await expect(
      run([
        'query',
        'query Sessions($first: Int) { compute_session_nodes(first: $first) { edges { node { id } } } }',
        '--var',
        'first=2',
        '--json',
      ]),
    ).resolves.toBe(EXIT.ok);

    const body = JSON.parse(
      String(fetchMock.mock.calls[0][1].body),
    ) as { variables: Record<string, unknown> };
    expect(body.variables).toEqual({ first: 2 });
    expect(jsonOut().data.variables).toEqual({ first: 2 });
  });
});

describe('--max-bytes', () => {
  const DOC =
    'query { compute_session_nodes(first: 40) { edges { node { id row_id name status_info } } } }';

  it('cuts the result to the budget and lists the truncated paths', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: sessionEdges(40) } } });

    await expect(
      run(['query', DOC, '--max-bytes', '2000', '--json']),
    ).resolves.toBe(EXIT.ok);

    const data = jsonOut().data;
    expect(data.truncated.length).toBeGreaterThan(0);
    // Deepest-first: a leaf string is cut before the array around it.
    expect(data.truncated[0]).toMatch(/edges\[\d+\]\.node\.status_info$/);
    expect(data.result.compute_session_nodes.edges.length).toBeLessThan(40);
  });

  it('never cuts an id, so every surviving link still resolves', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: sessionEdges(40) } } });

    await expect(
      run(['query', DOC, '--max-bytes', '2000', '--json']),
    ).resolves.toBe(EXIT.ok);

    const data = jsonOut().data;
    expect(data.truncated.filter((path: string) => /\.(row_)?id$/.test(path)))
      .toEqual([]);
    for (const link of data.links) {
      expect(link.id).not.toContain('…');
      expect(link.webui_path).toBe(`/session?sessionDetail=${link.id}`);
    }
  });

  it('drops the links of rows that did not survive the cut', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: sessionEdges(40) } } });

    await expect(
      run(['query', DOC, '--max-bytes', '2000', '--json']),
    ).resolves.toBe(EXIT.ok);

    const data = jsonOut().data;
    expect(data.links).toHaveLength(
      data.result.compute_session_nodes.edges.length,
    );
    expect(data.links.length).toBeLessThan(40);
  });

  it('leaves a small result untouched', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: sessionEdges(1) } } });

    await expect(run(['query', DOC, '--json'])).resolves.toBe(EXIT.ok);
    expect(jsonOut().data.truncated).toEqual([]);
  });

  it('rejects a non-positive budget', async () => {
    await expect(
      run(['query', DOC, '--max-bytes', '0', '--json']),
    ).resolves.toBe(EXIT.usage);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('webui link annotation', () => {
  it('annotates session nodes and lists them in the envelope', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: sessionEdges(2) } } });

    await expect(
      run([
        'query',
        'query { compute_session_nodes(first: 2) { edges { node { id row_id name } } } }',
        '--json',
      ]),
    ).resolves.toBe(EXIT.ok);

    const data = jsonOut().data;
    expect(data.links).toHaveLength(2);
    expect(data.links[0]).toMatchObject({
      path: 'compute_session_nodes.edges[0].node',
      resource: 'session',
      id: 'row-0',
      webui_path: '/session?sessionDetail=row-0',
      webui_url: `${WEBUI}/session?sessionDetail=row-0`,
    });
    // The annotation is on the node itself, not only in `links`.
    expect(
      data.result.compute_session_nodes.edges[1].node.webui_path,
    ).toBe('/session?sessionDetail=row-1');
  });

  it('prefers --webui over the stored origin', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: sessionEdges(1) } } });

    await run([
      'query',
      'query { compute_session_nodes(first: 1) { edges { node { id row_id } } } }',
      '--webui',
      'https://ui.example.com',
      '--json',
    ]);
    expect(jsonOut().data.links[0].webui_url).toBe(
      'https://ui.example.com/session?sessionDetail=row-0',
    );
  });

  it('leaves an unmapped root field alone', async () => {
    stubFetch({ data: { user: { email: 'a@b.c' } } });

    await expect(
      run(['query', 'query { user { email } }', '--json']),
    ).resolves.toBe(EXIT.ok);
    expect(jsonOut().data.links).toEqual([]);
  });
});

describe('auth', () => {
  it('exits 3 with a login hint when nothing is stored', async () => {
    process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
      join(tmpdir(), 'bai-agent-query-empty-'),
    );

    await expect(
      run([
        'query',
        'query { user { email } }',
        '--endpoint',
        ENDPOINT,
        '--json',
      ]),
    ).resolves.toBe(EXIT.authRequired);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(jsonErr().hint).toBe(`bai-agent login --endpoint ${ENDPOINT}`);
  });
});

describe('text output', () => {
  it('mirrors the JSON surface', async () => {
    stubFetch({ data: { compute_session_nodes: { edges: sessionEdges(1) } } });

    await expect(
      run([
        'query',
        'query { compute_session_nodes(first: 1) { edges { node { id row_id name } } } }',
      ]),
    ).resolves.toBe(EXIT.ok);

    const printed = out.join('');
    expect(printed).toContain('operation:');
    expect(printed).toContain('/session?sessionDetail=row-0');
    expect(printed).toContain('session-0');
  });
});
