import type { AnyCommand } from '../command.js';
import { CliError, exitLine } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import { API_VERSION } from '../output.js';
import type { Stats } from 'node:fs';
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';

/**
 * Markers `init --write` replaces between. Everything between them is
 * generated; the prose after the end marker is hand-written and survives.
 */
export const BLOCK_START = '<!-- BAI-AGENT:start -->';
export const BLOCK_END = '<!-- BAI-AGENT:end -->';

/** The only `--features` value; the flag exists to mirror `astryx init`. */
export const FEATURE_AGENTS = 'agents';

export const CLAUDE_MD = 'CLAUDE.md';
export const AGENTS_MD = 'AGENTS.md';

const ASTRYX_END = '<!-- ASTRYX:END -->';

/** ATX headings only, and only outside a fenced block. */
const HEADING = /^#{1,6} /;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

const BUILD = 'pnpm --filter backend.ai-agent-cli build';
const DIST = 'node packages/backend.ai-agent-cli/dist/cli.js';
const PROXY = `pnpm run ${CLI_NAME}`;

/**
 * `checkout`: the block committed to the WebUI's CLAUDE.md, where the CLI runs
 * from the workspace. `standalone`: the copy `init` installs with the skill on
 * a machine that has only the npm package and a synced data checkout.
 */
export type BlockMode = 'checkout' | 'standalone';

export interface BlockOptions {
  mode?: BlockMode;
  /** Standalone: where the skill was actually installed (defaults to `~/.claude`). */
  skillPath?: string;
}

/** Where the installed skill lives by default, as the standalone block names it. */
export const INSTALLED_SKILL_PATH = `~/.claude/skills/${CLI_NAME}/SKILL.md`;

const pad = (rows: Array<[string, string]>): string[] => {
  const width = Math.max(0, ...rows.map(([left]) => left.length));
  return rows.map(([left, right]) => `  ${left.padEnd(width)}  ${right}`);
};

/**
 * The CLAUDE.md agent block, generated from the command registry so it can
 * never describe a command the CLI does not have.
 */
export function renderAgentBlock(
  commands: AnyCommand[],
  options: BlockOptions = {},
): string {
  const standalone = options.mode === 'standalone';
  const skillPath = options.skillPath ?? INSTALLED_SKILL_PATH;
  const lines = [
    BLOCK_START,
    `${CLI_NAME} · ${commands.length} commands`,
    ...(standalone
      ? [
          'Agent-facing CLI over a synced Backend.AI WebUI data checkout: the user manual, the GraphQL schema, the i18n stores and — once logged in — the live manager.',
          `CLI: \`${CLI_NAME} <cmd>\` (npm: \`npm i -g backend.ai-agent-cli\`). \`${CLI_NAME} init\` records the endpoint, syncs the data for that manager's version and installs this skill; \`${CLI_NAME} sync\` refreshes the data.`,
          `Preflight, answer-or-link rules and a ready-to-run query cookbook: the \`${CLI_NAME}\` skill (\`${skillPath}\`), cookbook at \`${skillPath.replace(/SKILL\.md$/, '')}references/query-cookbook.md\`.`,
        ]
      : [
          'Agent-facing CLI over this checkout: the user manual, the GraphQL schema, the i18n stores and — once logged in — the live manager.',
          `CLI: run every command as \`${PROXY} <cmd>\` from the repository root (shown below as \`${CLI_NAME} ...\`).`,
          `The proxy runs the bundle, so build it first: \`${BUILD}\`. Without the proxy, still from the repository root: \`${DIST} <cmd>\`.`,
          `Preflight, answer-or-link rules and a ready-to-run query cookbook: the \`${CLI_NAME}\` skill, shipped with the CLI (\`packages/backend.ai-agent-cli/skill/SKILL.md\`, cookbook at \`packages/backend.ai-agent-cli/skill/references/query-cookbook.md\`) and installed per user by \`${PROXY} init --skill --no-login\`.`,
        ]),
    '',
    "WORKFLOW — discover, don't guess. Before answering anything about Backend.AI data:",
    `1. \`${CLI_NAME} doctor\` — ${standalone ? 'synced data' : 'checkout'} and stored session in one pass; exit 0 means the environment is ok. Then \`${CLI_NAME} whoami\` — exit 3 means log in (see RULES).`,
    `2. \`${CLI_NAME} search "<english UI term>"\` — START HERE: one ranked list over manual + schema + terminology. Every hit carries the \`command:\` that opens it.`,
    `3. \`${CLI_NAME} docs show <id>\` · \`schema show <Type>.<field>\` · \`explain <Type>.<field>=<VALUE>\` — the hit in full. \`schema show\` is what the SDL declares; \`explain\` is what it means to a user.`,
    `4. \`${CLI_NAME} query '<document>'\` — ask the manager. Validated against the ${standalone ? 'synced' : "checkout's"} SDL before any network call. Rows come back carrying \`webui_path\` / \`webui_url\` under \`data.links\` — hand that to the user so they can open it themselves.`,
    '',
    `OUTPUT: \`--json\` prints one envelope on stdout — {"apiVersion":"${API_VERSION}","type":…,"data":…}; a failure prints {"apiVersion","error","code","suggestions?","hint?"} on stderr and nothing on stdout. Text is the same data as aligned \`key: value\` records. \`hint\` is a concrete next step — a command to run, or for a refused mutation, the WebUI page to do it on — never prose.`,
    `\`query\` results: rows are at \`data.result.<rootField>\`, links at \`data.links[]\` (\`webui_path\` / \`webui_url\`); the same fields are also inlined on each linked row.`,
    "Piping through `| head` hides the exit code and truncates doctor's alignment/session checks — read the JSON `code` field or the exit status instead.",
    `EXIT: ${exitLine()}.`,
    '',
    'RULES:',
    '- Search in the ENGLISH terms the UI shows ("Resource Group", not "scaling_group"). The index is English-only; a non-English query is normalised through the i18n stores, never translated.',
    `- Never mix GraphQL pagination modes: \`first\`+\`after\` XOR \`last\`+\`before\` XOR \`limit\`+\`offset\`. The \`*V2\` connections reject a mix at runtime, and page-number paging is \`limit\`+\`offset\`.${standalone ? '' : ' See `.claude/rules/graphql-pagination.md`.'}`,
    `- \`schema_mismatch\` is YOUR document, not the manager: the ${standalone ? 'synced' : "checkout's"} SDL rejected it locally, before any request. Fix it with \`schema show <Type>\`; never retry it unchanged.`,
    `- A mutation runs only with \`--allow-mutation\` AND a field on the allow-list (${standalone ? "the CLI's `src/mutation-allowlist.ts`" : '`packages/backend.ai-agent-cli/src/mutation-allowlist.ts`'}). Either miss exits 4 \`mutation_refused\` before the network. Do not route around it — extend the list in a reviewed PR, or use the WebUI.`,
    "- Destructive actions (delete, purge, terminate, revoke) are never run from here. Give the human the WebUI page from the refusal's `hint` and let them press the button.",
    `- Exit 3 \`auth_required\` → \`${CLI_NAME} login --endpoint <url>\`; ${standalone ? `the endpoint is the one \`${CLI_NAME} init\` recorded (\`${CLI_NAME} doctor\` shows it)` : 'take the endpoint and the account from the `webui-connection-info` skill'}. The CLI never handles a password: \`login\` borrows the browser's session, and \`--paste\` covers a browser that cannot reach this machine.`,
    '- Cite what the CLI returned: `search`, `docs show` and `explain` carry a deployed-docs `url`. `explain` prints `MISSING` for a piece nothing curates — report that, never fill it in from memory.',
    standalone
      ? `- Re-run \`${CLI_NAME} init\` after upgrading the CLI; it rewrites this block and the skill.`
      : `- Re-run \`${CLI_NAME} init --features ${FEATURE_AGENTS}\` after any CLI change and re-sync this block.`,
    '',
    'COMMANDS:',
    ...pad(commands.map((command) => [command.name, command.summary])),
    BLOCK_END,
  ];
  return lines.join('\n');
}

export interface BlockRegion {
  /** Character offsets of the marked region, markers included. */
  start: number;
  end: number;
  text: string;
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A marker only counts as a marker on a line of its own. Prose that quotes one
 * inline (`` `<!-- BAI-AGENT:start -->` ``) documents the block; it is not it.
 */
function findMarker(
  source: string,
  marker: string,
  from = 0,
): { start: number; end: number } | undefined {
  // `\r?` so a CRLF checkout still finds its own block instead of a duplicate.
  const pattern = new RegExp(`^${escapeRegExp(marker)}[ \t]*\r?$`, 'gm');
  pattern.lastIndex = from;
  const match = pattern.exec(source);
  return match
    ? { start: match.index, end: match.index + marker.length }
    : undefined;
}

/** The marked region of a CLAUDE.md, markers included. */
export function findBlockRegion(source: string): BlockRegion | undefined {
  const start = findMarker(source, BLOCK_START);
  if (!start) return undefined;
  const end = findMarker(source, BLOCK_END, start.end);
  if (!end) return undefined;
  return {
    start: start.start,
    end: end.end,
    text: source.slice(start.start, end.end),
  };
}

export type BlockAnchor = 'markers' | 'after-astryx' | 'append';

export interface BlockWriteResult {
  content: string;
  anchor: BlockAnchor;
  changed: boolean;
}

/**
 * Where a first insert goes: after the ASTRYX block *and* the prose explaining
 * it — i.e. before the next `#` heading, or at the end of the file.
 */
function insertOffset(source: string): { offset: number; anchor: BlockAnchor } {
  const lines = source.split('\n');
  const marker = lines.findIndex((line) => line.trim() === ASTRYX_END);
  if (marker < 0) return { offset: source.length, anchor: 'append' };
  let index = marker + 1;
  // The open fence; only a fence of the same character and at least the same
  // length closes it (CommonMark), so a ``` sample inside ```` stays inside.
  let fence: string | undefined;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    const opener = FENCE.exec(line)?.[1];
    if (fence === undefined) {
      if (opener) fence = opener;
      else if (HEADING.test(line)) break;
    } else if (
      opener &&
      opener[0] === fence[0] &&
      opener.length >= fence.length
    ) {
      fence = undefined;
    }
  }
  if (index >= lines.length) return { offset: source.length, anchor: 'append' };
  const offset = lines.slice(0, index).join('\n').length + 1;
  return { offset, anchor: 'after-astryx' };
}

/** Idempotent: replaces the marked region, or inserts one when there is none. */
export function applyBlock(source: string, block: string): BlockWriteResult {
  const region = findBlockRegion(source);
  if (region) {
    const content =
      source.slice(0, region.start) + block + source.slice(region.end);
    return { content, anchor: 'markers', changed: content !== source };
  }
  const { offset, anchor } = insertOffset(source);
  const before = source.slice(0, offset).replace(/\n*$/, '\n');
  const after = source.slice(offset).replace(/^\n*/, '');
  const content = `${before}\n${block}\n${after === '' ? '' : `\n${after}`}`;
  return { content, anchor, changed: true };
}

export interface BlockWriteOutcome {
  path: string;
  anchor: BlockAnchor;
  outcome: 'inserted' | 'updated' | 'unchanged';
}

/** Render the checkout block and apply it to `repoRoot`'s CLAUDE.md, idempotently. */
export function writeAgentBlock(
  repoRoot: string,
  commands: AnyCommand[],
): BlockWriteOutcome {
  const { path } = resolveBlockTarget(repoRoot);
  let source: string;
  try {
    source = readFileSync(path, 'utf8');
  } catch (error) {
    throw new CliError('repo_incomplete', `Cannot read ${path}.`, {
      hint: `check that ${CLAUDE_MD}/${AGENTS_MD} exists in the checkout root`,
      cause: error,
    });
  }
  const applied = applyBlock(source, renderAgentBlock(commands));
  if (applied.changed) writeFileSync(path, applied.content, 'utf8');
  return {
    path,
    anchor: applied.anchor,
    outcome: !applied.changed
      ? 'unchanged'
      : applied.anchor === 'markers'
        ? 'updated'
        : 'inserted',
  };
}

/** A pointer file ("see AGENTS.md") is shorter than anything that holds prose. */
const PLACEHOLDER_MAX_BYTES = 512;

export interface BlockTarget {
  /** The real file to write, symlinks resolved. */
  path: string;
  /** The entry that led there, relative to the repo root. */
  via: string;
}

/** `init --write` never follows a link out of the checkout it was asked to edit. */
const isInside = (root: string, target: string): boolean => {
  const rel = relative(root, target);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
};

/**
 * Which file `init --write` edits. A CLAUDE.md that is a symlink to AGENTS.md
 * (this checkout's layout) is written through to its real path: writing the
 * link itself would replace it with a file and silently fork the two.
 */
export function resolveBlockTarget(repoRoot: string): BlockTarget {
  const agents = join(repoRoot, AGENTS_MD);
  const refuse = (why: string): never => {
    throw new CliError('repo_incomplete', why, {
      suggestions: [`${CLAUDE_MD} (or ${AGENTS_MD}) in ${repoRoot}`],
      hint: `check that ${CLAUDE_MD}/${AGENTS_MD} exists in the checkout root`,
    });
  };

  for (const name of [CLAUDE_MD, AGENTS_MD]) {
    const candidate = join(repoRoot, name);
    let link: Stats;
    try {
      link = lstatSync(candidate);
    } catch {
      continue;
    }
    if (link.isSymbolicLink()) {
      let target: string;
      try {
        target = realpathSync(candidate);
      } catch {
        return refuse(`${name} is a dangling symlink in ${repoRoot}.`);
      }
      if (!isInside(realpathSync(repoRoot), target)) {
        return refuse(
          `${name} in ${repoRoot} is a symlink to ${target}, outside the checkout.`,
        );
      }
      return { path: target, via: name };
    }
    if (!link.isFile()) continue;
    // A handful of bytes next to a real AGENTS.md is a pointer someone wrote by
    // hand. The block belongs in the file it points at, and guessing which line
    // of it is the pointer is not this command's job.
    if (
      candidate !== agents &&
      link.size < PLACEHOLDER_MAX_BYTES &&
      existsSync(agents)
    ) {
      return refuse(
        `${name} in ${repoRoot} looks like a ${link.size}-byte placeholder next to ${AGENTS_MD}.`,
      );
    }
    return { path: candidate, via: name };
  }
  return refuse(
    `Neither ${CLAUDE_MD} nor ${AGENTS_MD} is readable in ${repoRoot}.`,
  );
}
