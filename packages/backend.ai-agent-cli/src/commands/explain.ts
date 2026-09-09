import type { FlagSpec, RunContext } from '../command.js';
import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import type { ExplainData } from '../explain/explain.js';
import { explain } from '../explain/explain.js';
import { CLI_NAME } from '../meta.js';
import type { Block, RenderOptions } from '../output.js';
import { list, record, renderBlocks, section } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import { INDEX_LANG } from '../search/docs-corpus.js';
import { loadSchema } from '../search/schema-sdl.js';
import type { VersionAlignment } from '../version-align.js';
import {
  applyVersionAlignmentGate,
  renderAlignment,
  STRICT_FLAG,
} from '../version-align.js';
import { parseLang } from './search.js';

export interface ExplainWithAlignment extends ExplainData {
  /** Present only when a stored session let the manager version be read. */
  alignment?: VersionAlignment;
}

export const EXPLAIN_FLAGS: FlagSpec[] = [
  {
    flag: '--lang <code>',
    description:
      'Language for the UI label and the deployed-docs link. Never affects what resolves.',
    type: 'string',
    default: INDEX_LANG,
  },
  {
    flag: '--docs-version <v>',
    description:
      'Override the docs channel in built URLs (default: derived from the checkout).',
    type: 'string',
  },
  STRICT_FLAG,
];

const flagString = (context: RunContext, name: string): string | undefined => {
  const value = context.flags[name];
  return typeof value === 'string' ? value : undefined;
};

export function renderExplain(
  data: ExplainWithAlignment,
  { verbosity }: RenderOptions,
): string {
  if (verbosity === 'dense') {
    return [
      `${data.id}\tschema:${data.schema.derived}\tlabel:${data.label.derived}\tconcept:${data.concept.derived}\tmeaning:${data.meaning.derived}\tdocs:${data.docs.derived}`,
      data.label.label ? `label\t${data.label.label}` : undefined,
      data.meaning.text ? `meaning\t${data.meaning.text}` : undefined,
      data.docs.url ? `docs\t${data.docs.url}` : undefined,
      data.value
        ? `value\t${data.value.name}\t${data.value.derived}`
        : undefined,
    ]
      .filter(Boolean)
      .join('\n');
  }

  const blocks: Block[] = [
    section(`${CLI_NAME} explain: ${data.id}`),
    record([
      ['id', data.id],
      ['target', data.target],
      ['lang', data.lang],
      ['docsVersion', data.docsVersion],
      ['mapping', data.mapping],
      ...(verbosity === 'detail'
        ? ([['kind', data.kind]] as Array<[string, string]>)
        : []),
    ]),
    section('schema'),
    record([
      ['derived', data.schema.derived],
      ['id', data.schema.id],
      ['entryKind', data.schema.entryKind],
      ['typeName', data.schema.typeName],
      ['graphqlKind', data.schema.graphqlKind],
      ['type', data.schema.type],
      ['description', data.schema.description],
      ['addedIn', data.schema.addedIn],
      ['deprecatedSince', data.schema.deprecatedSince],
      ['deprecated', data.schema.deprecationReason],
      ['enumType', data.schema.enumType],
      ['path', data.schema.path],
      ['url', data.schema.url],
    ]),
  ];
  if (data.schema.enumValues?.length) {
    blocks.push(list(data.schema.enumValues));
  }

  blocks.push(
    section('label'),
    record([
      ['derived', data.label.derived],
      ['label', data.label.label],
      ['key', data.label.key],
      ['lang', data.label.lang],
    ]),
    section('concept'),
    record([
      ['derived', data.concept.derived],
      ['id', data.concept.id],
      ['term', data.concept.term],
      ['definition', data.concept.definition],
      ['via', data.concept.via],
    ]),
    section('meaning'),
    record([
      ['derived', data.meaning.derived],
      ['text', data.meaning.text],
      ['via', data.meaning.via],
    ]),
    section('docs'),
    record([
      ['derived', data.docs.derived],
      ['ref', data.docs.ref],
      ['title', data.docs.title],
      ['lang', data.docs.lang],
      ['path', data.docs.path],
      ['url', data.docs.url],
      ['score', data.docs.score],
    ]),
  );

  if (data.value) {
    blocks.push(
      section(`value ${data.value.name}`),
      record([
        ['derived', data.value.derived],
        ['name', data.value.name],
        ['label', data.value.label],
        ['variant', data.value.variant],
        ['schemaDerived', data.value.schemaDerived],
        ['schemaDescription', data.value.schemaDescription],
      ]),
    );
  }
  if (data.alignment) blocks.push(...renderAlignment(data.alignment));
  return renderBlocks(blocks);
}

/**
 * `Type.field` plus, for a `=VALUE` the enum really declares, `Enum.VALUE` —
 * the ids the version gate compares against the manager.
 */
function alignmentIds(data: ExplainData): string[] {
  const { enumType, enumValues } = data.schema;
  const value = data.value?.name;
  return enumType && value && enumValues?.includes(value)
    ? [data.schema.id, `${enumType}.${value}`]
    : [data.schema.id];
}

export const explainCommand = defineCommand<ExplainWithAlignment>({
  name: 'explain',
  summary:
    'Explain what a schema type, field or value means to a WebUI user, tagged by where each piece came from.',
  usage: `${CLI_NAME} explain <Type | Type.field | Type.field=VALUE> [--lang <code>] [--strict] [--json]`,
  flags: EXPLAIN_FLAGS,
  maxArgs: 1,
  run: async (context) => {
    const target = context.args[0]?.trim();
    if (!target) {
      throw new CliError('usage', 'explain requires a name.', {
        hint: `${CLI_NAME} explain ComputeSessionNode.status=RUNNING`,
      });
    }
    const repo = resolveRepoContext(context.cwd);
    const data = explain(repo, {
      target,
      lang: parseLang(repo, flagString(context, 'lang')),
      docsVersion: flagString(context, 'docs-version'),
    });
    // Without a stored session the gate makes no request: explain stays offline.
    const { alignment } = await applyVersionAlignmentGate({
      cwd: context.cwd,
      schemaCtx: { schema: loadSchema(repo) },
      selectedFields: alignmentIds(data),
      strict: context.flags.strict === true,
      notify: context.notify,
    });
    return alignment ? { ...data, alignment } : data;
  },
  render: renderExplain,
});
