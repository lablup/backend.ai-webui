import type { FlagSpec, RunContext } from '../command.js';
import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import type { Block, RenderOptions } from '../output.js';
import { list, record, renderBlocks, section, text } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import type { SchemaSyncData } from '../schema-sync.js';
import { syncSchema } from '../schema-sync.js';
import type { SearchData } from '../search/engine.js';
import { loadSchema } from '../search/schema-sdl.js';
import type {
  SchemaShowData,
  SchemaShowMember,
} from '../search/schema-search.js';
import { showSchemaEntry } from '../search/schema-search.js';
import type { VersionAlignment } from '../version-align.js';
import {
  applyVersionAlignmentGate,
  renderAlignment,
  STRICT_FLAG,
} from '../version-align.js';
import {
  parseLang,
  renderSearch,
  requireQuery,
  SCOPED_SEARCH_FLAGS,
  searchFromContext,
} from './search.js';

export interface SchemaShowWithAlignment extends SchemaShowData {
  /** Present only when a stored session let the manager version be read. */
  alignment?: VersionAlignment;
}

export type SchemaData = SearchData | SchemaShowWithAlignment | SchemaSyncData;

const SUBCOMMANDS = ['search', 'show', 'sync'] as const;

export const SCHEMA_FLAGS: FlagSpec[] = [
  ...SCOPED_SEARCH_FLAGS,
  STRICT_FLAG,
  {
    flag: '--tag <tag>',
    description: `sync: the ${'lablup/backend.ai'} release tag to take supergraph.graphql from (default: the highest published version — not GitHub's "Latest" badge, which the backend keeps on a maintenance branch).`,
    type: 'string',
  },
  {
    flag: '--dry-run',
    description: 'sync: report what would change and write nothing.',
    type: 'boolean',
  },
];

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

export function renderSchemaSync(
  data: SchemaSyncData,
  { verbosity }: RenderOptions,
): string {
  const headline =
    data.outcome === 'dry-run'
      ? data.schemaChanged
        ? `would update ${data.schemaPath} to ${data.tag}`
        : `${data.schemaPath} already matches ${data.tag}`
      : data.outcome === 'unchanged'
        ? `already at ${data.tag}; nothing to do`
        : data.outcome === 'updated'
          ? `updated ${data.schemaPath} to ${data.tag}`
          : `recorded ${data.tag} in ${data.metaPath}; the SDL already matched`;

  if (verbosity === 'dense') {
    return [
      `${data.tag}\t${data.outcome}\t${data.remoteSha256}`,
      headline,
    ].join('\n');
  }

  const blocks: Block[] = [
    section(`${CLI_NAME} schema sync`, headline),
    record([
      ['tag', data.tag],
      ['tagSource', data.tagSource],
      ['outcome', data.outcome],
      ['dryRun', String(data.dryRun)],
      ['schemaChanged', String(data.schemaChanged)],
      ['previousTag', data.previousTag],
      ['schemaPath', data.schemaPath],
      ['metaPath', data.metaPath],
      ['remoteSha256', data.remoteSha256],
      ['localSha256', data.localSha256],
      ['remoteBytes', data.remoteBytes],
      ['localBytes', data.localBytes],
      ['byteDelta', data.byteDelta],
      ['fetchedAt', data.fetchedAt],
    ]),
  ];
  if (verbosity === 'detail') {
    blocks.push(
      section('Source'),
      record([
        ['repo', data.repo],
        ['asset', data.asset],
        ['source', data.source],
        ['remoteIsFederated', String(data.remoteIsFederated)],
        [
          'localIsFederated',
          data.localIsFederated === undefined
            ? undefined
            : String(data.localIsFederated),
        ],
      ]),
    );
  }
  return renderBlocks(blocks);
}

export function renderSchemaShow(
  data: SchemaShowWithAlignment,
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
  if (data.alignment) blocks.push(...renderAlignment(data.alignment));
  return renderBlocks(blocks);
}

export const schemaCommand = defineCommand<SchemaData>({
  name: 'schema',
  summary:
    'Search the GraphQL schema, print one type / field / enum value, or sync the SDL from a backend release.',
  usage: `${CLI_NAME} schema search <query> | ${CLI_NAME} schema show <Type | Type.field | Enum.VALUE> [--lang <code>] [--strict] | ${CLI_NAME} schema sync [--tag <tag>] [--dry-run] [--json]`,
  flags: SCHEMA_FLAGS,
  maxArgs: 2,
  run: async (context) => {
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
      const shown = showSchemaEntry(repo, {
        id,
        lang: parseLang(repo, flagString(context, 'lang')),
      });
      const { alignment } = await applyVersionAlignmentGate({
        cwd: context.cwd,
        schemaCtx: { schema: loadSchema(repo) },
        selectedFields: [shown.id],
        strict: context.flags.strict === true,
        notify: context.notify,
      });
      return alignment ? { ...shown, alignment } : shown;
    }
    if (subcommand === 'sync') {
      if (argument !== undefined) {
        throw new CliError(
          'usage',
          `schema sync takes no positional arguments, got: ${argument}`,
          { hint: `${CLI_NAME} schema sync --tag ${argument}` },
        );
      }
      const repo = resolveRepoContext(context.cwd);
      return syncSchema(repo, {
        tag: flagString(context, 'tag'),
        dryRun: context.flags['dry-run'] === true,
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
      : data.kind === 'schema-sync'
        ? renderSchemaSync(data, options)
        : renderSearch(data, options),
});
