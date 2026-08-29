import type { AnyCommand } from './command.js';
import { successEnvelope } from './output.js';
import type { Verbosity } from './output.js';
import { COMMANDS } from './registry.js';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const cwd = import.meta.dirname;

// An empty store keeps `doctor`'s auth group offline and deterministic.
beforeAll(() => {
  process.env.BAI_AGENT_CONFIG_DIR = mkdtempSync(
    join(tmpdir(), 'bai-agent-mirror-'),
  );
});

/** Commands that need positional arguments to produce data at all. */
const SAMPLE_ARGS: Record<string, string[]> = {
  search: ['storage folder'],
  docs: ['search', 'storage folder'],
  schema: ['show', 'ComputeSessionNode.status'],
  explain: ['ComputeSessionNode.status=RUNNING'],
};

/**
 * Commands that need a live manager session (or a browser) cannot be `run()`
 * here. The contract under test is that `render(data)` shows every JSON leaf,
 * so a representative data object stands in for the call.
 */
const SAMPLE_DATA: Record<string, unknown> = {
  login: {
    mode: 'paste',
    endpoint: 'https://manager.example.com',
    webui: 'https://fr-1.localhost:1355',
    sessionFile: '/tmp/sessions/manager.example.com.json',
    sessionId: 'abcd…wxyz',
    user: {
      email: 'user@example.com',
      role: 'admin',
      domainName: 'default',
      fullName: 'Example User',
      status: 'active',
    },
  },
  logout: {
    endpoint: 'https://manager.example.com',
    removed: true,
    sessionFile: '/tmp/sessions/manager.example.com.json',
    sessionId: 'abcd…wxyz',
  },
  whoami: {
    email: 'user@example.com',
    role: 'admin',
    domainName: 'default',
    fullName: 'Example User',
    status: 'active',
    endpoint: 'https://manager.example.com',
    sessionId: 'abcd…wxyz',
    sessionFile: '/tmp/sessions/manager.example.com.json',
  },
  query: {
    endpoint: 'https://manager.example.com',
    operation: 'query',
    operationName: 'Sessions',
    rootFields: ['compute_session_nodes'],
    variables: { limit: 2 },
    maxBytes: 65536,
    bytes: 412,
    truncated: ['compute_session_nodes.edges[1].node.status_info'],
    hint: 'bai-agent open session row-1',
    links: [
      {
        path: 'compute_session_nodes.edges[0].node',
        resource: 'session',
        id: 'row-1',
        webui_path: '/session?sessionDetail=row-1',
        webui_url: 'https://fr-1.localhost:1355/session?sessionDetail=row-1',
      },
    ],
    result: {
      compute_session_nodes: {
        edges: [
          {
            node: {
              id: 'Q29tcHV0ZVNlc3Npb246MQ==',
              row_id: 'row-1',
              name: 'alpha',
              webui_path: '/session?sessionDetail=row-1',
              webui_url:
                'https://fr-1.localhost:1355/session?sessionDetail=row-1',
            },
          },
        ],
      },
    },
  },
  open: {
    type: 'vfolder',
    target: 'vf-1',
    webui_path: '/data?folder=vf-1',
    webui_url: 'https://fr-1.localhost:1355/data?folder=vf-1',
    tab: 'tab-abcd',
    tabTitle: 'Backend.AI · Data · default @ manager.example.com',
    tabReason: 'only',
    tool: 'bai_open_resource',
    path: '/project/default/data?folder=vf-1',
    title: 'Backend.AI · Data · default @ manager.example.com',
  },
};

function leaves(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(leaves);
  if (typeof value === 'object') return Object.values(value).flatMap(leaves);
  const leaf = String(value);
  return leaf.length > 0 ? [leaf] : [];
}

async function dataFor(command: AnyCommand): Promise<unknown> {
  const sample = SAMPLE_DATA[command.name];
  if (sample) return sample;
  return command.run({
    cwd,
    commands: COMMANDS,
    args: SAMPLE_ARGS[command.name] ?? [],
    flags: {},
    json: false,
    render: { verbosity: 'detail' },
    notify: () => {},
  });
}

describe.each(COMMANDS.map((command) => [command.name, command] as const))(
  '%s renders text and JSON from one data object',
  (name, command) => {
    it('emits every JSON leaf in the --detail text output', async () => {
      const data = await dataFor(command);
      const text = command.render(data, { verbosity: 'detail' });
      for (const leaf of leaves(data)) {
        expect(text, `missing leaf "${leaf}" in ${name} text output`).toContain(
          leaf,
        );
      }
    });

    it('renders deterministically from the same data at every verbosity', async () => {
      const data = await dataFor(command);
      const verbosities: Verbosity[] = ['dense', 'normal', 'detail'];
      for (const verbosity of verbosities) {
        const first = command.render(data, { verbosity });
        const second = command.render(data, { verbosity });
        expect(first).toBe(second);
        expect(first.length).toBeGreaterThan(0);
      }
      // The JSON surface is the same object, wrapped — never re-derived.
      expect(successEnvelope(name, data).data).toBe(data);
    });
  },
);
