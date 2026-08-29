import type { RunContext } from '../command.js';
import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import type { Block, RenderOptions } from '../output.js';
import { list, record, renderBlocks, section, text } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import type { SearchData } from '../search/engine.js';
import type {
  SchemaShowData,
  SchemaShowMember,
} from '../search/schema-search.js';
import { showSchemaEntry } from '../search/schema-search.js';
import {
  parseLang,
  renderSearch,
  requireQuery,
  searchFromContext,
  SEARCH_FLAGS,
} from './search.js';

export type SchemaData = SearchData | SchemaShowData;

const SUBCOMMANDS = ['search', 'show'] as const;

const flagString = (context: RunContext, name: string): string | undefined => {
  const value = context.flags[name];
  return typeof value === 'string' ? value : undefined;
};

const markerSuffix = (member: SchemaShowMember): string => {
  const parts = [
    member.addedIn ? `added ${member.addedIn}` : undefined,
    member.deprecatedSince
      ? `deprecated since ${member.deprecatedSince}`
      : undefined,
    member.markerSource === 'type' ? 'inherited' : undefined,
  ].filter(Boolean);
  return parts.length > 0 ? ` [${parts.join(', ')}]` : '';
};

const memberLine = (member: SchemaShowMember): string => {
  const type = member.type ? `: ${member.type}` : '';
  const description = member.description ? ` — ${member.description}` : '';
  return `${member.name}${type}${description}${markerSuffix(member)}`;
};

export function renderSchemaShow(
  data: SchemaShowData,
  { verbosity }: RenderOptions,
): string {
  if (verbosity === 'dense') {
    return [
      `${data.id}\t${data.entryKind}\t${data.type ?? data.graphqlKind}`,
      ...data.fields.map((field) => `${field.name}\t${field.type ?? ''}`),
      ...data.values.map((value) => value.name),
    ].join('\n');
  }

  const blocks: Block[] = [
    section(`${CLI_NAME} schema show: ${data.id}`),
    record([
      ['id', data.id],
      ['entryKind', data.entryKind],
      ['graphqlKind', data.graphqlKind],
      ['declaredIn', data.entryKind === 'type' ? undefined : data.typeName],
      ['type', data.type],
      ['addedIn', data.addedIn],
      ['deprecatedSince', data.deprecatedSince],
      ['deprecatedNote', data.deprecatedNote],
      ['deprecated', data.deprecationReason],
      ['markerSource', data.markerSource],
      [
        'UI label',
        data.uiLabel
          ? `${data.uiLabel.label} (${data.uiLabel.key}, ${data.uiLabel.lang})`
          : undefined,
      ],
      ['path', data.path],
      ['url', data.url],
      ...(verbosity === 'detail'
        ? ([
            ['kind', data.kind],
            ['graphs', data.graphs.join(', ')],
          ] as Array<[string, string]>)
        : []),
    ]),
  ];

  if (data.description) {
    blocks.push(section('Description'), text(data.description));
  }
  if (data.interfaces.length > 0) {
    blocks.push(section('Implements'), list(data.interfaces));
  }
  if (data.unionMembers.length > 0) {
    blocks.push(section('Members'), list(data.unionMembers));
  }
  if (data.args.length > 0) {
    blocks.push(
      section(`Arguments (${data.args.length})`),
      list(
        data.args.map(
          (argument) =>
            `${argument.name}: ${argument.type}${
              argument.defaultValue ? ` = ${argument.defaultValue}` : ''
            }${argument.description ? ` — ${argument.description}` : ''}`,
        ),
      ),
    );
  }
  if (data.pagination) {
    blocks.push(
      section('Pagination'),
      record([
        ['rule', data.pagination.rule],
        ['modes', data.pagination.modes.join(' | ')],
        ['reference', data.pagination.reference],
      ]),
    );
  }
  if (data.fields.length > 0) {
    blocks.push(
      section(`Fields (${data.fields.length})`),
      list(data.fields.map(memberLine)),
    );
  }
  if (data.values.length > 0) {
    blocks.push(
      section(`Values (${data.values.length})`),
      list(data.values.map(memberLine)),
    );
  }
  return renderBlocks(blocks);
}

export const schemaCommand = defineCommand<SchemaData>({
  name: 'schema',
  summary: 'Search the GraphQL schema, or print one type, field or enum value.',
  usage: `${CLI_NAME} schema search <query> | ${CLI_NAME} schema show <Type | Type.field | Enum.VALUE> [--lang <code>] [--json]`,
  flags: SEARCH_FLAGS,
  maxArgs: 2,
  run: (context) => {
    const [subcommand, argument] = context.args;
    if (subcommand === 'search') {
      return searchFromContext(context, requireQuery(argument), ['schema']);
    }
    if (subcommand === 'show') {
      const repo = resolveRepoContext(context.cwd);
      const id = argument?.trim();
      if (!id) {
        throw new CliError('usage', 'schema show requires a name.', {
          hint: `${CLI_NAME} schema show ComputeSessionNode.status`,
        });
      }
      return showSchemaEntry(repo, {
        id,
        lang: parseLang(repo, flagString(context, 'lang')),
      });
    }
    throw new CliError(
      'usage',
      `Unknown schema subcommand: ${subcommand ?? '(none)'}.`,
      { suggestions: [...SUBCOMMANDS], hint: `${CLI_NAME} schema --help` },
    );
  },
  render: (data, options) =>
    data.kind === 'schema-show'
      ? renderSchemaShow(data, options)
      : renderSearch(data, options),
});
