import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import {
  BLOCK_END,
  BLOCK_START,
  CLAUDE_MD,
  FEATURE_AGENTS,
  renderAgentBlock,
  writeAgentBlock,
} from '../init/block.js';
import type { BlockWriteOutcome } from '../init/block.js';
import type { SetupData } from '../init/setup.js';
import { runSetup } from '../init/setup.js';
import { CLI_NAME } from '../meta.js';
import type { Block, RenderOptions } from '../output.js';
import { list, record, renderBlocks, section, text } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import { runLogin } from './login.js';

export type InitWriteResult = BlockWriteOutcome;

/** `init --features agents`: the CLAUDE.md block. */
export interface InitBlockData {
  kind: 'block';
  feature: string;
  // No CLI version here: the block no longer pins one (it would make the
  // committed block churn on every release), and `version` / `manifest` own it.
  commandCount: number;
  markers: { start: string; end: string };
  /** The block itself, markers included. */
  block: string;
  write?: InitWriteResult;
}

export type InitData = InitBlockData | SetupData;

const FEATURES = [FEATURE_AGENTS];

function runBlock(
  context: Parameters<typeof runSetup>[0]['context'],
  feature: string,
): InitBlockData {
  const { cwd, commands, flags } = context;
  if (!FEATURES.includes(feature)) {
    throw new CliError('usage', `Unknown feature: ${feature}`, {
      suggestions: FEATURES,
      hint: `${CLI_NAME} init --features ${FEATURE_AGENTS}`,
    });
  }
  const block = renderAgentBlock(commands);
  const data: InitBlockData = {
    kind: 'block',
    feature: FEATURE_AGENTS,
    commandCount: commands.length,
    markers: { start: BLOCK_START, end: BLOCK_END },
    block,
  };
  if (flags.write !== true) return data;

  const repo = resolveRepoContext(cwd);
  // The synced data checkout is sparse and carries no CLAUDE.md; `init`
  // installs the standalone block with the skill instead.
  if (repo.source === 'synced') {
    throw new CliError(
      'usage',
      `--write needs a WebUI checkout with a ${CLAUDE_MD}; the synced data checkout at ${repo.repoRoot} has none.`,
      { hint: `${CLI_NAME} init --skill --no-login` },
    );
  }
  return { ...data, write: writeAgentBlock(repo.repoRoot, commands) };
}

const step = (value: object): string =>
  'skipped' in value ? `skipped — ${String(value.skipped)}` : 'done';

export function renderSetup(
  data: SetupData,
  { verbosity }: RenderOptions,
): string {
  const managerVersion =
    'manager' in data.manager ? data.manager.manager : undefined;
  if (verbosity === 'dense') {
    return renderBlocks([
      record([
        ['endpoint', data.endpoint],
        ['manager', managerVersion],
        ['checkout', `${data.checkout.root} (${data.checkout.source})`],
        ['ref', 'ref' in data.ref ? data.ref.ref : undefined],
        ['login', 'email' in data.login ? data.login.email : step(data.login)],
        ['skill', 'path' in data.skill ? data.skill.path : step(data.skill)],
      ]),
    ]);
  }
  const blocks: Block[] = [
    section(`${CLI_NAME} init`, `Set up for ${data.endpoint}.`),
    record([
      ['endpoint', data.endpoint],
      ['endpointSource', data.endpointSource],
      ['manager', managerVersion ?? step(data.manager)],
      ['checkout', data.checkout.root],
      ['checkoutSource', data.checkout.source],
      [
        'ref',
        'ref' in data.ref
          ? `${data.ref.ref} (${data.ref.source}: ${data.ref.reason})`
          : step(data.ref),
      ],
      [
        'sync',
        'outcome' in data.sync
          ? `${data.sync.outcome} at ${data.sync.commit} in ${data.sync.dir}`
          : step(data.sync),
      ],
      [
        'schemaSync',
        'tag' in data.schemaSync
          ? `${data.schemaSync.outcome} (${data.schemaSync.tag})`
          : step(data.schemaSync),
      ],
      [
        'login',
        'email' in data.login
          ? `${data.login.email} (${data.login.role}), session in ${data.login.sessionFile}`
          : step(data.login),
      ],
      [
        'skill',
        'path' in data.skill
          ? `${data.skill.outcome} at ${data.skill.path}`
          : step(data.skill),
      ],
      [
        'block',
        'path' in data.block
          ? `${data.block.outcome} in ${data.block.path} (${data.block.anchor})`
          : step(data.block),
      ],
      ['configPath', data.configPath],
    ]),
  ];
  if (verbosity === 'detail') {
    blocks.push(record([['kind', data.kind]]));
    if ('manager' in data.manager) {
      blocks.push(
        section('Manager'),
        record([
          ['apiVersion', data.manager.apiVersion],
          ['source', data.manager.source],
        ]),
      );
    }
    if ('path' in data.skill) {
      blocks.push(
        section('Skill files'),
        record([['source', data.skill.source]]),
        list(data.skill.files),
      );
    }
  }
  return renderBlocks(blocks);
}

export const initCommand = defineCommand<InitData>({
  name: 'init',
  summary: `Set this machine up (endpoint, data sync, login, skill), or with --features print the ${CLAUDE_MD} agent block.`,
  usage: `${CLI_NAME} init [--endpoint <url>] [--ref <branch|tag>] [--login | --no-login] [--skill | --no-skill] [--paste] [--webui <origin>] [--json] | ${CLI_NAME} init --features ${FEATURE_AGENTS} [--write] [--json]`,
  flags: [
    {
      flag: '--endpoint <url>',
      description: 'Manager URL; asked for when omitted in a terminal.',
      type: 'string',
    },
    {
      flag: '--ref <branch|tag>',
      description:
        'Data ref to sync instead of the WebUI tag matching the manager version.',
      type: 'string',
    },
    {
      flag: '--login',
      description:
        'Log in after syncing (asked for when neither --login nor --no-login is given).',
      type: 'boolean',
    },
    {
      flag: '--no-login',
      description: 'Skip the login step.',
      type: 'boolean',
    },
    {
      flag: '--skill',
      description:
        'Install the Claude Code skill into ~/.claude/skills (asked for when neither --skill nor --no-skill is given).',
      type: 'boolean',
    },
    {
      flag: '--no-skill',
      description: 'Skip the skill install.',
      type: 'boolean',
    },
    {
      flag: '--paste',
      description:
        'For the login step: take the session id on stdin instead of the browser.',
      type: 'boolean',
    },
    {
      flag: '--webui <origin>',
      description: 'For the login step: WebUI origin hosting /cli-login.',
      type: 'string',
    },
    {
      flag: '--features <name>',
      description: `Print the ${CLAUDE_MD} agent block instead of running the setup; only "${FEATURE_AGENTS}" exists.`,
      type: 'string',
    },
    {
      flag: '--write',
      description: `With --features: replace the marked block in the checkout's ${CLAUDE_MD} instead of printing it.`,
      type: 'boolean',
    },
  ],
  maxArgs: 0,
  run: (context) => {
    const feature = context.flags.features;
    if (typeof feature === 'string') return runBlock(context, feature);
    if (context.flags.write === true) {
      throw new CliError('usage', '--write belongs to --features agents.', {
        hint: `${CLI_NAME} init --features ${FEATURE_AGENTS} --write`,
      });
    }
    return runSetup({
      context,
      deps: {
        login: async (loginContext, endpoint) => {
          const done = await runLogin(loginContext, endpoint);
          return {
            email: done.user.email,
            role: done.user.role,
            sessionFile: done.sessionFile,
          };
        },
      },
    });
  },
  render: (data, options) => {
    if (data.kind === 'setup') return renderSetup(data, options);
    if (!data.write) return renderBlocks([text(data.block)]);
    return renderBlocks([
      record([
        ['path', data.write.path],
        ['outcome', data.write.outcome],
        ['anchor', data.write.anchor],
        ['feature', data.feature],
        ['commands', data.commandCount],
        ...(options.verbosity === 'detail'
          ? ([
              ['markerStart', data.markers.start],
              ['markerEnd', data.markers.end],
            ] as Array<[string, string]>)
          : []),
      ]),
    ]);
  },
});
