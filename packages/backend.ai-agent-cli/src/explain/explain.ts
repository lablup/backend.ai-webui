import { CliError } from '../errors.js';
import type { MappingField, MappingValue } from '../mappings/load.js';
import { loadMappings, mappingDisplayPath } from '../mappings/load.js';
import {
  enumTypeFor,
  findConcept,
  heuristicConcept,
  heuristicLabelKeys,
  resolveDocsRef,
} from '../mappings/refs.js';
import type { RepoContext } from '../repo-context.js';
import { INDEX_LANG } from '../search/docs-corpus.js';
import { resolveDocsVersion, runSearch } from '../search/engine.js';
import {
  buildI18nReverseIndex,
  i18nStore,
  LABEL_INDEX_LANG,
  uiLabelFor,
} from '../search/i18n-index.js';
import { loadSchema } from '../search/schema-sdl.js';
import type { SchemaEntryKind } from '../search/schema-search.js';
import { showSchemaEntry } from '../search/schema-search.js';
import { loadTerminology } from '../search/terminology.js';

/** Where a piece of the answer came from. `MISSING` is a nudge, not an error. */
export type Derivation = 'auto' | 'heuristic' | 'curated' | 'MISSING';

/** A docs hit only stands in for a curated link when it is this confident. */
export const DOCS_HEURISTIC_MIN_SCORE = 80;

export interface ExplainSchemaPiece {
  derived: 'auto';
  id: string;
  entryKind: SchemaEntryKind;
  typeName: string;
  graphqlKind: string;
  type?: string;
  description: string;
  addedIn?: string;
  deprecatedSince?: string;
  deprecationReason?: string;
  /** The enum a field's type names, when it names one. */
  enumType?: string;
  enumValues?: string[];
  path: string;
  url: string;
}

export interface ExplainLabelPiece {
  derived: Derivation;
  label?: string;
  key?: string;
  lang?: string;
}

export interface ExplainConceptPiece {
  derived: Derivation;
  id?: string;
  term?: string;
  definition?: string;
  /** The mapping entry the concept was read from. */
  via?: string;
}

export interface ExplainMeaningPiece {
  derived: Derivation;
  text?: string;
  via?: string;
}

export interface ExplainDocsPiece {
  derived: Derivation;
  ref?: string;
  title?: string;
  lang?: string;
  path?: string;
  url?: string;
  /** Search score, when the link came from the docs heuristic. */
  score?: number;
}

export interface ExplainValuePiece {
  name: string;
  derived: Derivation;
  label?: string;
  variant?: string;
  /** SDL description of the enum value, when the field is an enum. */
  schemaDerived: 'auto' | 'MISSING';
  schemaDescription?: string;
}

export interface ExplainData {
  kind: 'explain';
  target: string;
  id: string;
  lang: string;
  docsVersion: string;
  /** The mapping file that curated this type, when one exists. */
  mapping?: string;
  schema: ExplainSchemaPiece;
  label: ExplainLabelPiece;
  concept: ExplainConceptPiece;
  meaning: ExplainMeaningPiece;
  docs: ExplainDocsPiece;
  value?: ExplainValuePiece;
}

export interface ExplainOptions {
  target: string;
  lang: string;
  docsVersion?: string;
  mappingsDir?: string;
}

const MISSING = 'MISSING' as const;

/** `Type`, `Type.field`, `Type.field=VALUE` — the value half is optional. */
export function parseExplainTarget(raw: string): {
  name: string;
  value?: string;
} {
  const trimmed = raw.trim().replace(/^schema:/, '');
  const equals = trimmed.indexOf('=');
  if (equals < 0) return { name: trimmed };
  return {
    name: trimmed.slice(0, equals).trim(),
    value: trimmed.slice(equals + 1).trim(),
  };
}

export function explain(
  context: RepoContext,
  options: ExplainOptions,
): ExplainData {
  const { name, value } = parseExplainTarget(options.target);
  if (!name) {
    throw new CliError('usage', 'explain requires a name.', {
      hint: 'bai-agent explain ComputeSessionNode.status=RUNNING',
    });
  }

  const entry = showSchemaEntry(context, { id: name, lang: options.lang });
  if (value !== undefined && entry.entryKind !== 'field') {
    throw new CliError(
      'usage',
      `=VALUE explains a field's value; ${entry.id} is a ${entry.entryKind}.`,
      { hint: `bai-agent explain ${entry.id}` },
    );
  }
  if (value !== undefined && value.length === 0) {
    throw new CliError('usage', '=VALUE requires a value.', {
      hint: `bai-agent explain ${entry.id}=RUNNING`,
    });
  }

  const schema = loadSchema(context);
  const i18n = buildI18nReverseIndex(context, schema);
  const terms = loadTerminology(context);
  const mappings = loadMappings(options.mappingsDir);
  const version = resolveDocsVersion(context, options.docsVersion);

  const type = schema.byName.get(entry.typeName);
  const fieldName = entry.entryKind === 'field' ? entry.name : undefined;
  const mappingFile = mappings.byType.get(entry.typeName);
  const mapping = mappingFile?.mapping;
  const mappedField: MappingField | undefined = fieldName
    ? mapping?.fields?.[fieldName]
    : undefined;
  const mappedValue: MappingValue | undefined =
    value !== undefined ? mappedField?.values?.[value] : undefined;

  const declared = fieldName
    ? type?.fields.find((one) => one.name === fieldName)
    : undefined;
  const enumType = enumTypeFor(schema, declared?.namedType);

  const id = `${entry.id}${value !== undefined ? `=${value}` : ''}`;

  const label = labelPiece(context, {
    i18n,
    lang: options.lang,
    typeName: entry.typeName,
    fieldName,
    typeLabel: mapping?.label,
    fieldLabel: mappedField?.label,
    schemaType: type,
  });

  return {
    kind: 'explain',
    target: options.target,
    id,
    lang: options.lang,
    docsVersion: version,
    ...(mappingFile
      ? { mapping: mappingDisplayPath(context.repoRoot, mappingFile.path) }
      : {}),
    schema: {
      derived: 'auto',
      id: entry.id,
      entryKind: entry.entryKind,
      typeName: entry.typeName,
      graphqlKind: entry.graphqlKind,
      ...(entry.type ? { type: entry.type } : {}),
      description: entry.description,
      ...(entry.addedIn ? { addedIn: entry.addedIn } : {}),
      ...(entry.deprecatedSince
        ? { deprecatedSince: entry.deprecatedSince }
        : {}),
      ...(entry.deprecationReason
        ? { deprecationReason: entry.deprecationReason }
        : {}),
      ...(enumType
        ? {
            enumType: enumType.name,
            enumValues: enumType.values.map((one) => one.name),
          }
        : {}),
      path: entry.path,
      url: entry.url,
    },
    label,
    concept: conceptPiece(terms, {
      typeName: entry.typeName,
      fieldName,
      valueName: value,
      typeConcept: mapping?.concept,
      fieldConcept: mappedField?.concept,
      valueConcept: mappedValue?.concept,
    }),
    meaning: meaningPiece({
      typeName: entry.typeName,
      fieldName,
      valueName: value,
      isType: entry.entryKind === 'type',
      typeMeaning: mapping?.meaning,
      fieldMeaning: mappedField?.meaning,
      valueMeaning: mappedValue?.meaning,
    }),
    docs: docsPiece(context, {
      lang: options.lang,
      version,
      typeName: entry.typeName,
      fieldName,
      valueName: value,
      typeDocs: mapping?.docs,
      fieldDocs: mappedField?.docs,
      valueDocs: mappedValue?.docs,
      label: label.label,
    }),
    ...(value !== undefined
      ? {
          value: valuePiece({
            name: value,
            mapped: mappedValue,
            enumDescription: enumType?.values.find((one) => one.name === value)
              ?.description,
          }),
        }
      : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* pieces                                                                      */
/* -------------------------------------------------------------------------- */

function labelPiece(
  context: RepoContext,
  input: {
    i18n: ReturnType<typeof buildI18nReverseIndex>;
    lang: string;
    typeName: string;
    fieldName?: string;
    typeLabel?: string;
    fieldLabel?: string;
    schemaType?: ReturnType<typeof loadSchema>['types'][number];
  },
): ExplainLabelPiece {
  if (input.fieldName) {
    const fieldId = `${input.typeName}.${input.fieldName}`;
    const auto = uiLabelFor(context, input.i18n, fieldId, input.lang);
    if (auto) {
      return {
        derived: 'auto',
        label: auto.label,
        key: auto.key,
        lang: auto.lang,
      };
    }
    if (input.schemaType) {
      const english = i18nStore(context, LABEL_INDEX_LANG);
      for (const key of heuristicLabelKeys(input.schemaType, input.fieldName)) {
        const base = english.get(key);
        if (!base) continue;
        const localized =
          input.lang === LABEL_INDEX_LANG
            ? undefined
            : i18nStore(context, input.lang).get(key);
        return {
          derived: 'heuristic',
          label: localized ?? base,
          key,
          lang: localized ? input.lang : LABEL_INDEX_LANG,
        };
      }
    }
  }
  const curated = input.fieldName ? input.fieldLabel : input.typeLabel;
  if (curated) {
    return { derived: 'curated', label: curated, lang: LABEL_INDEX_LANG };
  }
  return { derived: MISSING };
}

function conceptPiece(
  terms: ReturnType<typeof loadTerminology>,
  input: {
    typeName: string;
    fieldName?: string;
    valueName?: string;
    typeConcept?: string;
    fieldConcept?: string;
    valueConcept?: string;
  },
): ExplainConceptPiece {
  const fieldRef = input.fieldName
    ? `${input.typeName}.${input.fieldName}`
    : input.typeName;
  const curated: Array<[string | undefined, string]> = [
    [input.valueConcept, `${fieldRef}=${input.valueName ?? ''}`],
    [input.fieldConcept, fieldRef],
    [input.typeConcept, input.typeName],
  ];
  for (const [id, via] of curated) {
    if (!id) continue;
    const term = findConcept(terms, id);
    // A dangling concept is a doctor failure, not a silent downgrade here.
    return {
      derived: 'curated',
      id,
      ...(term ? { term: term.title, definition: term.description } : {}),
      via,
    };
  }

  for (const name of [input.fieldName, input.typeName]) {
    if (!name) continue;
    const term = heuristicConcept(terms, name);
    if (!term) continue;
    return {
      derived: 'heuristic',
      id: term.id,
      term: term.title,
      definition: term.description,
      via: name === input.fieldName ? fieldRef : input.typeName,
    };
  }
  return { derived: MISSING };
}

function meaningPiece(input: {
  typeName: string;
  fieldName?: string;
  valueName?: string;
  isType: boolean;
  typeMeaning?: string;
  fieldMeaning?: string;
  valueMeaning?: string;
}): ExplainMeaningPiece {
  const fieldRef = input.fieldName
    ? `${input.typeName}.${input.fieldName}`
    : input.typeName;
  if (input.valueMeaning) {
    return {
      derived: 'curated',
      text: input.valueMeaning,
      via: `${fieldRef}=${input.valueName ?? ''}`,
    };
  }
  if (input.fieldMeaning) {
    return { derived: 'curated', text: input.fieldMeaning, via: fieldRef };
  }
  // A type's meaning describes the type, never one of its fields.
  if (input.isType && input.typeMeaning) {
    return { derived: 'curated', text: input.typeMeaning, via: input.typeName };
  }
  return { derived: MISSING };
}

function docsPiece(
  context: RepoContext,
  input: {
    lang: string;
    version: string;
    typeName: string;
    fieldName?: string;
    valueName?: string;
    typeDocs?: string;
    fieldDocs?: string;
    valueDocs?: string;
    label?: string;
  },
): ExplainDocsPiece {
  for (const ref of [input.valueDocs, input.fieldDocs, input.typeDocs]) {
    if (!ref) continue;
    const resolved = resolveDocsRef(context, ref, input.lang, input.version);
    if (!resolved) return { derived: 'curated', ref };
    return {
      derived: 'curated',
      ref,
      title: resolved.title,
      lang: resolved.lang,
      path: resolved.path,
      url: resolved.url,
    };
  }
  return (
    (input.label &&
      docsHeuristic(context, input.label, input.lang, input.version)) || {
      derived: MISSING,
    }
  );
}

/** The docs heuristic: the top manual hit for the label, when it is strong. */
export function docsHeuristic(
  context: RepoContext,
  label: string,
  lang: string,
  version: string,
): ExplainDocsPiece | undefined {
  const found = runSearch(context, {
    query: label,
    lang,
    domains: ['docs'],
    limit: 1,
    docsVersion: version,
  });
  const hit = found.hits[0];
  if (!hit || hit.score < DOCS_HEURISTIC_MIN_SCORE) return undefined;
  return {
    derived: 'heuristic',
    ref: hit.id.replace(/^docs:/, ''),
    title: hit.title,
    lang: lang === INDEX_LANG ? INDEX_LANG : lang,
    ...(hit.path ? { path: hit.path } : {}),
    url: hit.url,
    score: hit.score,
  };
}

function valuePiece(input: {
  name: string;
  mapped?: MappingValue;
  enumDescription?: string;
}): ExplainValuePiece {
  const description = input.enumDescription?.trim();
  return {
    name: input.name,
    derived: input.mapped ? 'curated' : MISSING,
    ...(input.mapped?.label ? { label: input.mapped.label } : {}),
    ...(input.mapped?.variant ? { variant: input.mapped.variant } : {}),
    schemaDerived: description ? 'auto' : MISSING,
    ...(description ? { schemaDescription: description } : {}),
  };
}
