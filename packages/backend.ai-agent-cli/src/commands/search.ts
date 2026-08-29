import type { FlagSpec, RunContext } from '../command.js';
import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import type { Block, RenderOptions } from '../output.js';
import { record, renderBlocks, section } from '../output.js';
import type { RepoContext } from '../repo-context.js';
import { resolveRepoContext } from '../repo-context.js';
import { docsLanguages, INDEX_LANG } from '../search/docs-corpus.js';
import type { Domain, SearchData } from '../search/engine.js';
import { DEFAULT_LIMIT, DOMAINS, runSearch } from '../search/engine.js';

export const ALL_DOMAINS = 'all';

export const SEARCH_FLAGS: FlagSpec[] = [
  {
    flag: '--domain <name>',
    description: `Restrict to one domain: ${DOMAINS.join(' | ')} | ${ALL_DOMAINS}.`,
    type: 'string',
    default: ALL_DOMAINS,
  },
  {
    flag: '--limit <n>',
    description: 'Maximum hits to return.',
    type: 'string',
    default: String(DEFAULT_LIMIT),
  },
  {
    flag: '--lang <code>',
    description:
      'Language for titles and the deployed-docs link. Never affects recall.',
    type: 'string',
    default: INDEX_LANG,
  },
  {
    flag: '--docs-version <v>',
    description:
      'Override the docs channel in built URLs (default: derived from the checkout).',
    type: 'string',
  },
];

const flagString = (context: RunContext, name: string): string | undefined => {
  const value = context.flags[name];
  return typeof value === 'string' ? value : undefined;
};

export function parseDomains(raw: string | undefined): Domain[] {
  const value = (raw ?? ALL_DOMAINS).trim();
  if (value === ALL_DOMAINS) return [...DOMAINS];
  const domain = DOMAINS.find((known) => known === value);
  if (!domain) {
    throw new CliError('usage', `Unknown domain: ${value}.`, {
      suggestions: [...DOMAINS, ALL_DOMAINS],
      hint: `${CLI_NAME} search --help`,
    });
  }
  return [domain];
}

export function parseLimit(raw: string | undefined): number {
  if (raw === undefined) return DEFAULT_LIMIT;
  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new CliError('usage', `--limit must be a positive integer: ${raw}.`, {
      hint: `${CLI_NAME} search --help`,
    });
  }
  return limit;
}

export function parseLang(
  context: RepoContext,
  raw: string | undefined,
): string {
  const lang = (raw ?? INDEX_LANG).trim();
  const available = docsLanguages(context);
  if (available.length > 0 && !available.includes(lang)) {
    throw new CliError('usage', `Unknown language: ${lang}.`, {
      suggestions: available,
      hint: `${CLI_NAME} search --help`,
    });
  }
  return lang;
}

export function searchFromContext(
  context: RunContext,
  query: string,
  domains: Domain[],
): SearchData {
  const repo = resolveRepoContext(context.cwd);
  return runSearch(repo, {
    query,
    lang: parseLang(repo, flagString(context, 'lang')),
    domains,
    limit: parseLimit(flagString(context, 'limit')),
    docsVersion: flagString(context, 'docs-version'),
  });
}

export function requireQuery(query: string | undefined): string {
  const value = query?.trim();
  if (!value) {
    throw new CliError('usage', 'search requires a query.', {
      hint: `${CLI_NAME} search "resource preset"`,
    });
  }
  return value;
}

const normalisationLine = (data: SearchData): string[] =>
  data.normalised.map(
    (entry) =>
      `"${data.query}" -> ${entry.canonical} (${entry.source} ${entry.ref}${
        entry.owner ? ` -> ${entry.owner}` : ''
      })`,
  );

export function renderSearch(
  data: SearchData,
  { verbosity }: RenderOptions,
): string {
  if (verbosity === 'dense') {
    const lines = data.hits.map(
      (hit) =>
        `${hit.id}\t${hit.score}\t${hit.reason}\t${hit.title}${
          hit.uiLabel ? `\t${hit.uiLabel.label}` : ''
        }`,
    );
    return [`${data.total}/${data.matched} hits`, ...lines].join('\n');
  }

  const blocks: Block[] = [
    section(`${CLI_NAME} search: ${data.query}`),
    record([
      ['domains', data.domains.join(', ')],
      ['lang', data.lang],
      ['docsVersion', data.docsVersion],
      ['matched', data.matched],
      ['total', data.total],
      ['limit', data.limit],
    ]),
  ];
  const normalised = normalisationLine(data);
  if (normalised.length > 0) {
    blocks.push(
      record(
        normalised.map((line) => ['normalised', line] as [string, string]),
      ),
    );
  }
  if (verbosity === 'detail' && data.expansions.length > 0) {
    blocks.push(record([['expansions', data.expansions.join(' | ')]]));
  }
  if (data.hits.length === 0) {
    blocks.push(record([['result', 'no hits']]));
  }
  for (const hit of data.hits) {
    blocks.push(
      record([
        ['id', hit.id],
        ['domain', hit.domain],
        ['score', hit.score],
        ['title', hit.title],
        ['url', hit.url],
        [
          'UI label',
          hit.uiLabel
            ? `${hit.uiLabel.label} (${hit.uiLabel.key}, ${hit.uiLabel.lang})`
            : undefined,
        ],
        ['reason', hit.reason],
        ...(verbosity === 'detail'
          ? ([['path', hit.path]] as Array<[string, string | undefined]>)
          : []),
        ['command', hit.command],
      ]),
    );
  }
  return renderBlocks(blocks);
}

export const searchCommand = defineCommand<SearchData>({
  name: 'search',
  summary: 'Rank manual sections, schema entries and terminology for a query.',
  usage: `${CLI_NAME} search <query> [--domain <name>] [--limit <n>] [--lang <code>] [--json]`,
  flags: SEARCH_FLAGS,
  maxArgs: 1,
  run: (context) =>
    searchFromContext(
      context,
      requireQuery(context.args[0]),
      parseDomains(flagString(context, 'domain')),
    ),
  render: renderSearch,
});
