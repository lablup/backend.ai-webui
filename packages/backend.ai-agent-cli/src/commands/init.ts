import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import {
  AGENTS_MD,
  applyBlock,
  BLOCK_END,
  BLOCK_START,
  CLAUDE_MD,
  FEATURE_AGENTS,
  renderAgentBlock,
  resolveBlockTarget,
} from '../init/block.js';
import type { BlockAnchor } from '../init/block.js';
import { CLI_NAME } from '../meta.js';
import { record, renderBlocks, text } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import { readFileSync, writeFileSync } from 'node:fs';

export interface InitWriteResult {
  path: string;
  anchor: BlockAnchor;
  outcome: 'inserted' | 'updated' | 'unchanged';
}

export interface InitData {
  feature: string;
  // No CLI version here: the block no longer pins one (it would make the
  // committed block churn on every release), and `version` / `manifest` own it.
  commandCount: number;
  markers: { start: string; end: string };
  /** The block itself, markers included. */
  block: string;
  write?: InitWriteResult;
}

const FEATURES = [FEATURE_AGENTS];

export const initCommand = defineCommand<InitData>({
  name: 'init',
  summary: `Print the ${CLAUDE_MD} agent block, generated from the command registry.`,
  usage: `${CLI_NAME} init [--features ${FEATURE_AGENTS}] [--write] [--json]`,
  flags: [
    {
      flag: '--features <name>',
      description: `What to generate; only "${FEATURE_AGENTS}" exists, and it is what a bare \`init\` prints.`,
      type: 'string',
      default: FEATURE_AGENTS,
    },
    {
      flag: '--write',
      description: `Replace the marked block in the checkout's ${CLAUDE_MD} instead of printing it.`,
      type: 'boolean',
    },
  ],
  maxArgs: 0,
  run: ({ cwd, commands, flags, notify }) => {
    const requested =
      typeof flags.features === 'string' ? flags.features : undefined;
    if (requested !== undefined && !FEATURES.includes(requested)) {
      throw new CliError('usage', `Unknown feature: ${requested}`, {
        suggestions: FEATURES,
        hint: `${CLI_NAME} init --features ${FEATURE_AGENTS}`,
      });
    }
    if (requested === undefined) {
      notify(
        `note: --features is optional; "${FEATURE_AGENTS}" is the only feature and is what this prints.`,
      );
    }

    const block = renderAgentBlock(commands);
    const data: InitData = {
      feature: FEATURE_AGENTS,
      commandCount: commands.length,
      markers: { start: BLOCK_START, end: BLOCK_END },
      block,
    };
    if (flags.write !== true) return data;

    const { path } = resolveBlockTarget(resolveRepoContext(cwd).repoRoot);
    let source: string;
    try {
      source = readFileSync(path, 'utf8');
    } catch (error) {
      throw new CliError('repo_incomplete', `Cannot read ${path}.`, {
        hint: `check that ${CLAUDE_MD}/${AGENTS_MD} exists in the checkout root`,
        cause: error,
      });
    }
    const applied = applyBlock(source, block);
    if (applied.changed) writeFileSync(path, applied.content, 'utf8');
    return {
      ...data,
      write: {
        path,
        anchor: applied.anchor,
        outcome: !applied.changed
          ? 'unchanged'
          : applied.anchor === 'markers'
            ? 'updated'
            : 'inserted',
      },
    };
  },
  render: (data, { verbosity }) => {
    if (!data.write) return renderBlocks([text(data.block)]);
    return renderBlocks([
      record([
        ['path', data.write.path],
        ['outcome', data.write.outcome],
        ['anchor', data.write.anchor],
        ['feature', data.feature],
        ['commands', data.commandCount],
        ...(verbosity === 'detail'
          ? ([
              ['markerStart', data.markers.start],
              ['markerEnd', data.markers.end],
            ] as Array<[string, string]>)
          : []),
      ]),
    ]);
  },
});
