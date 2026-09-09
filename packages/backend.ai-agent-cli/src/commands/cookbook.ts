import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import type { RenderOptions } from '../output.js';
import { list, record, renderBlocks, section, text } from '../output.js';
import { parseDocument } from '../query/document.js';
import { shippedSkillDir } from '../skill-install.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The cookbook ships inside the skill directory, next to `SKILL.md`. */
export const COOKBOOK_FILE = 'references/query-cookbook.md';

export interface CookbookSummary {
  number: number;
  title: string;
  /** The `## …` heading the entry sits under. */
  section: string;
  /** Root fields of every GraphQL document in the entry, in document order. */
  rootFields: string[];
}

export interface CookbookEntry extends CookbookSummary {
  /** The heading, its prose and its fenced blocks, verbatim. */
  body: string;
}

export type CookbookData =
  | { kind: 'list'; path: string; entries: CookbookSummary[] }
  | { kind: 'entry'; path: string; entry: CookbookEntry };

export function cookbookPath(): string {
  return join(shippedSkillDir(), COOKBOOK_FILE);
}

const ENTRY_HEADING = /^###\s+(\d+)\.\s+(.+)$/;
const SECTION_HEADING = /^##\s+(.+)$/;
const GRAPHQL_BLOCK = /```graphql\n([\s\S]*?)```/g;

function rootFieldsIn(body: string): string[] {
  const fields: string[] = [];
  for (const block of body.matchAll(GRAPHQL_BLOCK)) {
    let parsed;
    try {
      parsed = parseDocument(block[1]);
    } catch {
      // A block the parser rejects contributes no root field; `skill.test.ts`
      // is what fails on a cookbook document the SDL outgrew.
      continue;
    }
    for (const operation of parsed.operations) {
      for (const field of operation.rootFields) {
        if (!fields.includes(field)) fields.push(field);
      }
    }
  }
  return fields;
}

export function parseCookbook(source: string): CookbookEntry[] {
  const entries: CookbookEntry[] = [];
  let sectionTitle = '';
  let open: { number: number; title: string; lines: string[] } | undefined;
  let openSection = '';

  const flush = (): void => {
    if (!open) return;
    const body = open.lines.join('\n').trim();
    entries.push({
      number: open.number,
      title: open.title,
      section: openSection,
      rootFields: rootFieldsIn(body),
      body,
    });
    open = undefined;
  };

  for (const line of source.split('\n')) {
    const heading = ENTRY_HEADING.exec(line);
    if (heading) {
      flush();
      open = { number: Number(heading[1]), title: heading[2].trim(), lines: [line] };
      openSection = sectionTitle;
      continue;
    }
    const parent = SECTION_HEADING.exec(line);
    if (parent) {
      flush();
      sectionTitle = parent[1].trim();
      continue;
    }
    if (open) open.lines.push(line);
  }
  flush();
  return entries;
}

/** A number picks the entry; anything else is matched as a root field. */
export function findEntry(
  entries: CookbookEntry[],
  argument: string,
): CookbookEntry | undefined {
  const wanted = argument.trim();
  if (/^\d+$/.test(wanted)) {
    return entries.find((entry) => entry.number === Number(wanted));
  }
  const lower = wanted.toLowerCase();
  return entries.find((entry) =>
    entry.rootFields.some((field) => field.toLowerCase() === lower),
  );
}

const summarise = (entry: CookbookEntry): CookbookSummary => ({
  number: entry.number,
  title: entry.title,
  section: entry.section,
  rootFields: entry.rootFields,
});

const listLine = (entry: CookbookSummary): string =>
  [
    `${entry.number}.`,
    entry.section ? `[${entry.section}]` : '',
    entry.title,
    entry.rootFields.length > 0 ? `— ${entry.rootFields.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' ');

export function loadCookbook(): { path: string; entries: CookbookEntry[] } {
  const path = cookbookPath();
  let source: string;
  try {
    source = readFileSync(path, 'utf8');
  } catch (error) {
    throw new CliError('internal', `Cannot read the cookbook at ${path}.`, {
      hint: `${CLI_NAME} init --skill`,
      cause: error,
    });
  }
  return { path, entries: parseCookbook(source) };
}

/**
 * The `cookbook` command that opens the entry for a root field — the hint
 * `query` gives when the checkout's SDL rejects a hand-written document.
 */
export function cookbookCommandFor(rootFields: string[]): string {
  let entries: CookbookEntry[];
  try {
    entries = loadCookbook().entries;
  } catch {
    return `${CLI_NAME} cookbook --list`;
  }
  const match = rootFields.find((field) => findEntry(entries, field));
  return `${CLI_NAME} cookbook ${match ?? '--list'}`;
}

function renderEntry(
  data: Extract<CookbookData, { kind: 'entry' }>,
  { verbosity }: RenderOptions,
): string {
  if (verbosity === 'dense') return data.entry.body;
  return renderBlocks([
    record([
      ['entry', data.entry.number],
      ['title', data.entry.title],
      ['section', data.entry.section],
      ['root fields', data.entry.rootFields.join(', ')],
      ['path', data.path],
    ]),
    section('---'),
    text(data.entry.body),
  ]);
}

export const cookbookCommand = defineCommand<CookbookData>({
  name: 'cookbook',
  summary:
    'Print a ready-to-run query from the skill cookbook, by entry number or root field.',
  usage: `${CLI_NAME} cookbook [<n> | <root field> | --list] [--json]`,
  flags: [
    {
      flag: '--list',
      description:
        'List every entry: number, title and the root field(s) its document uses.',
      type: 'boolean',
    },
  ],
  maxArgs: 1,
  run: (context) => {
    const { path, entries } = loadCookbook();
    const argument = context.args[0]?.trim();
    if (!argument || context.flags.list === true) {
      return { kind: 'list', path, entries: entries.map(summarise) };
    }
    const entry = findEntry(entries, argument);
    if (!entry) {
      throw new CliError(
        'not_found',
        `No cookbook entry numbered or using root field "${argument}".`,
        {
          suggestions: entries.map((one) => listLine(summarise(one))),
          hint: `${CLI_NAME} cookbook --list`,
        },
      );
    }
    return { kind: 'entry', path, entry };
  },
  render: (data, options) => {
    if (data.kind === 'entry') return renderEntry(data, options);
    return renderBlocks([
      section(`${CLI_NAME} cookbook`),
      record([
        ['path', data.path],
        ['entries', data.entries.length],
      ]),
      list(data.entries.map(listLine)),
    ]);
  },
});
