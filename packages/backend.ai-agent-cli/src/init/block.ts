import type { AnyCommand } from '../command.js';
import { CLI_NAME, cliVersion } from '../meta.js';
import { API_VERSION } from '../output.js';

/**
 * Markers `init --write` replaces between. Everything between them is
 * generated; the prose after the end marker is hand-written and survives.
 */
export const BLOCK_START = '<!-- BAI-AGENT:start -->';
export const BLOCK_END = '<!-- BAI-AGENT:end -->';

/** The only `--features` value; the flag exists to mirror `astryx init`. */
export const FEATURE_AGENTS = 'agents';

export const CLAUDE_MD = 'CLAUDE.md';

const ASTRYX_END = '<!-- ASTRYX:END -->';

const BUILD = 'pnpm --filter backend.ai-agent-cli build';
const DIST = 'node packages/backend.ai-agent-cli/dist/cli.js';
const PROXY = `pnpm run ${CLI_NAME}`;

const pad = (rows: Array<[string, string]>): string[] => {
  const width = Math.max(0, ...rows.map(([left]) => left.length));
  return rows.map(([left, right]) => `  ${left.padEnd(width)}  ${right}`);
};

/**
 * The CLAUDE.md agent block, generated from the command registry so it can
 * never describe a command the CLI does not have.
 */
export function renderAgentBlock(commands: AnyCommand[]): string {
  const lines = [
    BLOCK_START,
    `${CLI_NAME} v${cliVersion()} · ${commands.length} commands`,
    'Agent-facing CLI over this checkout: the user manual, the GraphQL schema, the i18n stores and — once logged in — the live manager.',
    `CLI: run every command as \`${PROXY} <cmd>\` from the repository root (shown below as \`${CLI_NAME} ...\`).`,
    `The proxy runs the bundle, so build it first: \`${BUILD}\`. From anywhere else in the checkout: \`${DIST} <cmd>\`.`,
    `Preflight, hand-off rules and a ready-to-run query cookbook: the \`${CLI_NAME}\` skill (\`.claude/skills/${CLI_NAME}/SKILL.md\`).`,
    '',
    "WORKFLOW — discover, don't guess. Before answering anything about Backend.AI data:",
    `1. \`${CLI_NAME} doctor\` — checkout, stored session and WebMCP tab in one pass. Exit 3 means log in (see RULES).`,
    `2. \`${CLI_NAME} search "<english UI term>"\` — START HERE: one ranked list over manual + schema + terminology. Every hit carries the \`command:\` that opens it.`,
    `3. \`${CLI_NAME} docs show <id>\` · \`schema show <Type>.<field>\` · \`explain <Type>.<field>=<VALUE>\` — the hit in full. \`schema show\` is what the SDL declares; \`explain\` is what it means to a user.`,
    `4. \`${CLI_NAME} query '<document>'\` — ask the manager. Validated against this checkout's SDL before any network call.`,
    `5. \`${CLI_NAME} open <resource> <id>\` — hand the answer to the browser tab that is already logged in. No URL to paste, no second login.`,
    '',
    `OUTPUT: \`--json\` prints one envelope on stdout — {"apiVersion":"${API_VERSION}","type":…,"data":…}; a failure prints {"apiVersion","error","code","suggestions?","hint?"} on stderr and nothing on stdout. Text is the same data as aligned \`key: value\` records. \`hint\` is always a command to run, never prose — run it.`,
    'EXIT: 0 ok · 1 error (schema_mismatch, version_mismatch) · 2 usage · 3 auth_required · 4 mutation_refused · 5 not_found (also no_webui_tab, ambiguous_tab).',
    '',
    'RULES:',
    '- Search in the ENGLISH terms the UI shows ("Resource Group", not "scaling_group"). The index is English-only; a non-English query is normalised through the i18n stores, never translated.',
    '- Never mix GraphQL pagination modes: `first`+`after` XOR `last`+`before` XOR `limit`+`offset`. The `*V2` connections reject a mix at runtime, and page-number paging is `limit`+`offset`. See `.claude/rules/graphql-pagination.md`.',
    "- `schema_mismatch` is YOUR document, not the manager: the checkout's SDL rejected it locally, before any request. Fix it with `schema show <Type>`; never retry it unchanged.",
    '- A mutation runs only with `--allow-mutation` AND a field on the allow-list (`packages/backend.ai-agent-cli/src/mutation-allowlist.ts`). Either miss exits 4 `mutation_refused` before the network. Do not route around it — extend the list in a reviewed PR, or use the WebUI.',
    `- Destructive actions (delete, purge, terminate, revoke) are never run from here. \`${CLI_NAME} open\` the page and let the human press the button.`,
    `- Exit 3 \`auth_required\` → \`${CLI_NAME} login --endpoint <url>\`; take the endpoint and the account from the \`webui-connection-info\` skill. The CLI never handles a password: \`login\` borrows the browser's session, and \`--paste\` covers a browser that cannot reach this machine.`,
    '- Exit 5 `no_webui_tab` → give the user the `hint` URL instead of retrying. `ambiguous_tab` → re-run with `--tab <id>` from the suggestions.',
    '- Cite what the CLI returned: `search`, `docs show` and `explain` carry a deployed-docs `url`. `explain` prints `MISSING` for a piece nothing curates — report that, never fill it in from memory.',
    `- Re-run \`${CLI_NAME} init --features ${FEATURE_AGENTS}\` after any CLI change and re-sync this block.`,
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

/** The marked region of a CLAUDE.md, markers included. */
export function findBlockRegion(source: string): BlockRegion | undefined {
  const start = source.indexOf(BLOCK_START);
  if (start < 0) return undefined;
  const endMarker = source.indexOf(BLOCK_END, start);
  if (endMarker < 0) return undefined;
  const end = endMarker + BLOCK_END.length;
  return { start, end, text: source.slice(start, end) };
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
  while (index < lines.length && !lines[index].startsWith('#')) index += 1;
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
