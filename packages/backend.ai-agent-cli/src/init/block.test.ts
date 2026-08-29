import { EXIT } from '../errors.js';
import { COMMANDS } from '../registry.js';
import { resolveRepoContext } from '../repo-context.js';
import { runCli } from '../run.js';
import {
  applyBlock,
  BLOCK_END,
  BLOCK_START,
  CLAUDE_MD,
  findBlockRegion,
  renderAgentBlock,
} from './block.js';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoCwd = import.meta.dirname;

/** Trailing whitespace is not part of the contract; the text is. */
const normalise = (value: string): string =>
  value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trim();

async function invoke(argv: string[], cwd = repoCwd) {
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

/** A checkout shaped like the real one, so `init --write` resolves it. */
function fakeCheckout(claudeMd: string): string {
  const root = mkdtempSync(join(tmpdir(), 'bai-agent-init-'));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'backend.ai-webui', version: '0.0.0-test' }),
  );
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(join(root, 'data/schema.graphql'), 'type Query { ok: Int }\n');
  mkdirSync(join(root, 'resources/i18n'), { recursive: true });
  mkdirSync(join(root, 'packages/backend.ai-webui-docs'), { recursive: true });
  writeFileSync(join(root, CLAUDE_MD), claudeMd);
  return root;
}

describe('init', () => {
  it('prints the markers and every registered command', async () => {
    const { exitCode, stdout } = await invoke(['init', '--features', 'agents']);
    expect(exitCode).toBe(EXIT.ok);
    expect(stdout).toContain(BLOCK_START);
    expect(stdout).toContain(BLOCK_END);
    for (const command of COMMANDS) {
      expect(stdout).toContain(command.name);
      expect(stdout).toContain(command.summary);
    }
  });

  it('prints the same block without --features, plus a note on stderr', async () => {
    const withFeature = await invoke(['init', '--features', 'agents']);
    const bare = await invoke(['init']);
    expect(normalise(bare.stdout)).toBe(normalise(withFeature.stdout));
    expect(bare.stderr).toContain('agents');
    expect(withFeature.stderr).toBe('');
  });

  it('rejects an unknown feature as a usage error', async () => {
    const { exitCode, stderr } = await invoke(['init', '--features', 'nope']);
    expect(exitCode).toBe(EXIT.usage);
    expect(stderr).toContain('Unknown feature');
  });

  it('carries the same block in the JSON envelope', async () => {
    const text = await invoke(['init', '--features', 'agents']);
    const json = await invoke(['init', '--features', 'agents', '--json']);
    const envelope = JSON.parse(json.stdout) as {
      type: string;
      data: { block: string; commandCount: number; markers: unknown };
    };
    expect(envelope.type).toBe('init');
    expect(envelope.data.commandCount).toBe(COMMANDS.length);
    expect(envelope.data.markers).toEqual({
      start: BLOCK_START,
      end: BLOCK_END,
    });
    expect(normalise(envelope.data.block)).toBe(normalise(text.stdout));
  });
});

describe(`the committed ${CLAUDE_MD} block`, () => {
  it('equals `init --features agents` output', () => {
    const repo = resolveRepoContext(repoCwd);
    const source = readFileSync(join(repo.repoRoot, CLAUDE_MD), 'utf8');
    const region = findBlockRegion(source);
    expect(
      region,
      `${CLAUDE_MD} has no ${BLOCK_START} … ${BLOCK_END} region. ` +
        'Run: pnpm run bai-agent init --features agents --write',
    ).toBeDefined();
    expect(
      normalise(region?.text ?? ''),
      `${CLAUDE_MD} is out of sync with the generator. ` +
        'Run: pnpm run bai-agent init --features agents --write',
    ).toBe(normalise(renderAgentBlock(COMMANDS)));
  });
});

describe('init --write', () => {
  it('inserts once, then leaves the file byte-identical', async () => {
    const root = fakeCheckout('# Project\n\nProse.\n');
    const path = join(root, CLAUDE_MD);

    const first = await invoke(['init', '--write', '--json'], root);
    expect(first.exitCode).toBe(EXIT.ok);
    expect(
      (JSON.parse(first.stdout) as { data: { write: { outcome: string } } })
        .data.write.outcome,
    ).toBe('inserted');
    const afterFirst = readFileSync(path, 'utf8');
    expect(afterFirst).toContain(BLOCK_START);
    expect(afterFirst).toContain('Prose.');

    const second = await invoke(['init', '--write', '--json'], root);
    expect(
      (JSON.parse(second.stdout) as { data: { write: { outcome: string } } })
        .data.write.outcome,
    ).toBe('unchanged');
    expect(readFileSync(path, 'utf8')).toBe(afterFirst);
  });

  it('replaces a stale region and keeps the prose around it', async () => {
    const root = fakeCheckout(
      `# Project\n\nbefore\n\n${BLOCK_START}\nstale\n${BLOCK_END}\n\nafter\n`,
    );
    const path = join(root, CLAUDE_MD);
    const { exitCode, stdout } = await invoke(
      ['init', '--write', '--json'],
      root,
    );
    expect(exitCode).toBe(EXIT.ok);
    expect(
      (JSON.parse(stdout) as { data: { write: { outcome: string } } }).data
        .write.outcome,
    ).toBe('updated');
    const content = readFileSync(path, 'utf8');
    expect(content).not.toContain('stale');
    expect(content).toContain('before');
    expect(content).toContain('after');
    expect(normalise(findBlockRegion(content)?.text ?? '')).toBe(
      normalise(renderAgentBlock(COMMANDS)),
    );
  });

  it('is idempotent as a pure transform', () => {
    const block = renderAgentBlock(COMMANDS);
    const once = applyBlock('# Project\n\nProse.\n', block);
    const twice = applyBlock(once.content, block);
    expect(twice.content).toBe(once.content);
    expect(twice.changed).toBe(false);
  });
});
