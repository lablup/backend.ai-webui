import { EXIT } from '../errors.js';
import { runCli } from '../run.js';
import { RELAY_CMD_ENV } from '../webmcp/relay-client.js';
import type { RelaySource } from '../webmcp/relay-client.js';
import { parseOpenRef } from './open.js';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const cwd = join(import.meta.dirname, '..');
const WEBUI = 'https://fr-3771.localhost:1355';

const source = (tabId: string, title: string): RelaySource => ({
  sourceId: `src-${tabId}`,
  tabId,
  origin: 'http://127.0.0.1:4973',
  url: 'http://127.0.0.1:4973/session',
  title,
  toolCount: 2,
});

/** Point `open` at the fake relay and hand it the scenario to answer with. */
const withSources = (sources: RelaySource[]): void => {
  process.env.FAKE_RELAY_SCENARIO = JSON.stringify({ sources });
};

beforeAll(() => {
  // An empty store keeps endpoint resolution deterministic and offline.
  process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
    join(tmpdir(), 'bai-agent-open-'),
  );
  process.env[RELAY_CMD_ENV] = `${process.execPath} ${join(
    import.meta.dirname,
    '..',
    'webmcp',
    'fake-relay.mjs',
  )}`;
});

afterAll(() => {
  delete process.env[RELAY_CMD_ENV];
  delete process.env.FAKE_RELAY_SCENARIO;
});

async function invoke(argv: string[]) {
  let stdout = '';
  let stderr = '';
  const exitCode = await runCli({
    argv,
    cwd,
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

describe('parseOpenRef', () => {
  it('builds a detail ref', () => {
    expect(parseOpenRef(['session', 'sess-1'], {})).toEqual({
      type: 'session',
      id: 'sess-1',
    });
  });

  it('carries --view and --path through', () => {
    expect(parseOpenRef(['session', 's'], { view: 'container_log' })).toEqual({
      type: 'session',
      id: 's',
      view: 'container_log',
    });
    expect(parseOpenRef(['vfolder', 'v'], { path: 'sub/dir' })).toEqual({
      type: 'vfolder',
      id: 'v',
      path: 'sub/dir',
    });
  });

  it('builds a list ref with its filters', () => {
    expect(
      parseOpenRef(['list', 'user'], { 'status-category': 'INACTIVE' }),
    ).toEqual({ type: 'list', resource: 'user', statusCategory: 'INACTIVE' });
  });

  it('rejects a status category on a page that has none', () => {
    expect(() =>
      parseOpenRef(['list', 'model_card'], { 'status-category': 'x' }),
    ).toThrow(/no status filter/);
  });

  it('rejects an unknown type, an unknown view and a missing id', () => {
    expect(() => parseOpenRef(['nope', 'x'], {})).toThrow(/Unknown resource type/);
    expect(() => parseOpenRef(['session', 's'], { view: 'nope' })).toThrow(/--view/);
    expect(() => parseOpenRef(['session'], {})).toThrow(/needs an id/);
    expect(() => parseOpenRef(['vfolder', 'v'], { view: 'detail' })).toThrow(
      /not accepted/,
    );
  });
});

describe('open against a relay with no tab', () => {
  it('exits 5 with no_webui_tab and the full URL as the hint', async () => {
    withSources([]);
    const { exitCode, stderr } = await invoke([
      'open',
      'session',
      'sess-1',
      '--webui',
      WEBUI,
      '--wait',
      '0',
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.notFound);
    const parsed = JSON.parse(stderr);
    expect(parsed.code).toBe('no_webui_tab');
    expect(parsed.hint).toBe(`${WEBUI}/session?sessionDetail=sess-1`);
  });
});

describe('open against a relay with one tab', () => {
  it('navigates it and reports the resulting path and title', async () => {
    withSources([source('tab-1', 'Backend.AI · Sessions @ manager.example.com')]);
    const { exitCode, stdout } = await invoke([
      'open',
      'session',
      'sess-1',
      '--webui',
      WEBUI,
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.ok);
    const parsed = JSON.parse(stdout);
    expect(parsed.type).toBe('open');
    expect(parsed.data).toMatchObject({
      type: 'session',
      target: 'sess-1',
      webui_path: '/session?sessionDetail=sess-1',
      webui_url: `${WEBUI}/session?sessionDetail=sess-1`,
      tab: 'tab-1',
      tabReason: 'only',
      tool: 'bai_open_resource',
      path: '/opened/session/sess-1',
    });
  });

  it('renders the same fields as text', async () => {
    withSources([source('tab-1', 'Backend.AI @ manager.example.com')]);
    const { exitCode, stdout } = await invoke([
      'open',
      'list',
      'vfolder',
      '--status-category',
      'READY',
    ]);
    expect(exitCode).toBe(EXIT.ok);
    expect(stdout).toContain('/data?statusCategory=READY');
    expect(stdout).toContain('tab picked by:');
  });
});

describe('open against a relay with two tabs', () => {
  const two = [
    source('aaa-1', 'Backend.AI @ a.example.com'),
    source('bbb-2', 'Backend.AI @ b.example.com'),
  ];

  it('exits 5 with ambiguous_tab and one suggestion per tab', async () => {
    withSources(two);
    const { exitCode, stderr } = await invoke([
      'open',
      'session',
      'sess-1',
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.notFound);
    const parsed = JSON.parse(stderr);
    expect(parsed.code).toBe('ambiguous_tab');
    expect(parsed.suggestions).toEqual([
      '--tab aaa-1  Backend.AI @ a.example.com',
      '--tab bbb-2  Backend.AI @ b.example.com',
    ]);
    expect(parsed.hint).toContain('--tab aaa-1');
  });

  it('--tab picks one and routes to its disambiguated tool', async () => {
    withSources(two);
    const { exitCode, stdout } = await invoke([
      'open',
      'session',
      'sess-1',
      '--tab',
      'bbb-2',
      '--json',
    ]);
    expect(exitCode).toBe(EXIT.ok);
    const parsed = JSON.parse(stdout);
    expect(parsed.data.tab).toBe('bbb-2');
    expect(parsed.data.tabReason).toBe('flag');
    expect(parsed.data.tool).toBe('bai_open_resource_bbb_');
  });
});
