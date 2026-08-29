import type { RunContext } from '../command.js';
import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import type { RenderOptions } from '../output.js';
import { record, renderBlocks, section, text } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import type { SearchData, ShowData } from '../search/engine.js';
import { showDocsSection } from '../search/engine.js';
import {
  parseLang,
  renderSearch,
  requireQuery,
  searchFromContext,
  SEARCH_FLAGS,
} from './search.js';

export type DocsData = SearchData | ShowData;

const SUBCOMMANDS = ['search', 'show'] as const;

const flagString = (context: RunContext, name: string): string | undefined => {
  const value = context.flags[name];
  return typeof value === 'string' ? value : undefined;
};

function renderShow(data: ShowData, { verbosity }: RenderOptions): string {
  if (verbosity === 'dense') return data.content;
  const blocks = [
    record([
      ['id', data.id],
      ['title', data.title],
      ['lang', data.lang],
      ['level', data.level],
      ['scope', data.full ? 'page' : 'section'],
      ['path', data.path],
      ['url', data.url],
      ...(verbosity === 'detail'
        ? ([
            ['kind', data.kind],
            ['slug', data.slug],
            ['anchor', data.anchor],
            ['full', data.full],
          ] as Array<[string, string | boolean | undefined]>)
        : []),
    ]),
    section('---'),
    text(data.content),
  ];
  return renderBlocks(blocks);
}

export const docsCommand = defineCommand<DocsData>({
  name: 'docs',
  summary: 'Search the user manual, or print one of its sections.',
  usage: `${CLI_NAME} docs search <query> | ${CLI_NAME} docs show <id> [--full] [--lang <code>] [--json]`,
  flags: [
    ...SEARCH_FLAGS,
    {
      flag: '--full',
      description: 'With `show`: print the whole page, not just the section.',
      type: 'boolean',
    },
  ],
  maxArgs: 2,
  run: (context) => {
    const [subcommand, argument] = context.args;
    if (subcommand === 'search') {
      return searchFromContext(context, requireQuery(argument), ['docs']);
    }
    if (subcommand === 'show') {
      const repo = resolveRepoContext(context.cwd);
      const id = argument?.trim();
      if (!id) {
        throw new CliError('usage', 'docs show requires an id.', {
          hint: `${CLI_NAME} search "resource preset" --domain docs`,
        });
      }
      return showDocsSection(repo, {
        id,
        lang: parseLang(repo, flagString(context, 'lang')),
        full: context.flags.full === true,
        docsVersion: flagString(context, 'docs-version'),
      });
    }
    throw new CliError(
      'usage',
      `Unknown docs subcommand: ${subcommand ?? '(none)'}.`,
      {
        suggestions: [...SUBCOMMANDS],
        hint: `${CLI_NAME} docs --help`,
      },
    );
  },
  render: (data, options) =>
    data.kind === 'show'
      ? renderShow(data, options)
      : renderSearch(data, options),
});
