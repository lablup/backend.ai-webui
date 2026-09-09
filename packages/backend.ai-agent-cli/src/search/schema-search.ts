import { CliError } from '../errors.js';
import type { RepoContext } from '../repo-context.js';
import type { I18nReverseIndex, UiLabel } from './i18n-index.js';
import {
  buildI18nReverseIndex,
  displayNamesFor,
  relativeSchemaPath,
  uiLabelFor,
} from './i18n-index.js';
import {
  normaliseIdentifier,
  normaliseIdentifierQuery,
  reduceIdentifier,
} from './identifiers.js';
import type { SchemaCandidate } from './rank.js';
import type {
  MarkerSource,
  SchemaIndex,
  SchemaMarker,
  SchemaType,
} from './schema-sdl.js';
import {
  isConnectionField,
  loadSchema,
  paginationModesFor,
} from './schema-sdl.js';
import { schemaSourceUrl } from './urls.js';

export type SchemaEntryKind = 'type' | 'field' | 'enum-value';

export interface SchemaEntry {
  /** `Type`, `Type.field` or `Enum.VALUE`. */
  id: string;
  entryKind: SchemaEntryKind;
  typeName: string;
  memberName?: string;
  candidate: SchemaCandidate;
  line: number;
  /** The WebUI renders this field under an i18n label. */
  linked: boolean;
}

function uniqueTokens(...groups: string[][]): string[] {
  return [...new Set(groups.flat())];
}

/** Relay plumbing: reachable through `schema show`, never a search answer. */
const PLUMBING = /(Connection|Edge)$/;

const isPlumbing = (type: SchemaType): boolean =>
  PLUMBING.test(type.name) || type.name === 'PageInfo';

function buildEntries(
  schema: SchemaIndex,
  i18n: I18nReverseIndex,
): SchemaEntry[] {
  const entries: SchemaEntry[] = [];
  for (const type of schema.types) {
    if (isPlumbing(type)) continue;
    const typeKey = normaliseIdentifier(type.name);
    const typeTokens = reduceIdentifier(type.name);
    entries.push({
      id: type.name,
      entryKind: 'type',
      typeName: type.name,
      candidate: {
        names: [typeKey],
        displayNames: [],
        ownTokens: typeTokens,
        nameTokens: typeTokens,
        linked: false,
        description: type.description,
      },
      line: type.line,
      linked: false,
    });

    for (const field of type.fields) {
      const id = `${type.name}.${field.name}`;
      const memberKey = normaliseIdentifier(field.name);
      const ownTokens = reduceIdentifier(field.name);
      const linked = i18n.byField.has(id);
      entries.push({
        id,
        entryKind: 'field',
        typeName: type.name,
        memberName: field.name,
        candidate: {
          names: [memberKey, `${typeKey} ${memberKey}`],
          displayNames: displayNamesFor(i18n, id),
          ownTokens,
          nameTokens: uniqueTokens(typeTokens, ownTokens),
          linked,
          description: field.description,
        },
        line: field.line,
        linked,
      });
    }

    for (const value of type.values) {
      const memberKey = normaliseIdentifier(value.name);
      entries.push({
        id: `${type.name}.${value.name}`,
        entryKind: 'enum-value',
        typeName: type.name,
        memberName: value.name,
        candidate: {
          names: [memberKey, `${typeKey} ${memberKey}`],
          displayNames: [],
          ownTokens: reduceIdentifier(value.name),
          nameTokens: uniqueTokens(typeTokens, reduceIdentifier(value.name)),
          linked: false,
          description: value.description,
        },
        line: value.line,
        linked: false,
      });
    }
  }
  return entries;
}

/**
 * Keyed by the parsed index itself: `loadSchema` hands out a new object when
 * the SDL's mtime changes, so the entries follow it without a second stat.
 */
let CACHE = new WeakMap<SchemaIndex, SchemaEntry[]>();

/** The searchable schema, built once per parsed SDL. */
export function schemaEntries(
  context: RepoContext,
  schema: SchemaIndex,
  i18n: I18nReverseIndex,
): SchemaEntry[] {
  const cached = CACHE.get(schema);
  if (cached) return cached;
  const entries = buildEntries(schema, i18n);
  CACHE.set(schema, entries);
  return entries;
}

/**
 * Same-named members collapse into one hit: the schema declares `status` on
 * dozens of types, and a list of near-identical rows is not an answer.
 */
export function collapseKey(entry: SchemaEntry): string {
  return entry.memberName
    ? `member:${normaliseIdentifier(entry.memberName)}`
    : `type:${entry.id}`;
}

export function clearSchemaEntryCache(): void {
  CACHE = new WeakMap();
}

export function schemaContext(context: RepoContext): {
  schema: SchemaIndex;
  i18n: I18nReverseIndex;
  entries: SchemaEntry[];
} {
  const schema = loadSchema(context);
  const i18n = buildI18nReverseIndex(context, schema);
  return { schema, i18n, entries: schemaEntries(context, schema, i18n) };
}

export function schemaHitLabel(
  context: RepoContext,
  i18n: I18nReverseIndex,
  entry: SchemaEntry,
  lang: string,
): UiLabel | undefined {
  return entry.entryKind === 'field'
    ? uiLabelFor(context, i18n, entry.id, lang)
    : undefined;
}

export function schemaLocation(
  context: RepoContext,
  line: number,
): { path: string; url: string } {
  const path = relativeSchemaPath(context);
  return { path: `${path}:${line}`, url: schemaSourceUrl(path, line) };
}

/* -------------------------------------------------------------------------- */
/* schema show                                                                 */
/* -------------------------------------------------------------------------- */

export interface SchemaShowMember {
  name: string;
  type?: string;
  description: string;
  addedIn?: string;
  deprecatedSince?: string;
  markerSource: MarkerSource;
}

export interface SchemaShowArg {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface SchemaShowPagination {
  modes: string[];
  rule: string;
  reference: string;
}

export interface SchemaShowData {
  kind: 'schema-show';
  id: string;
  entryKind: SchemaEntryKind;
  name: string;
  typeName: string;
  /** `object`, `input`, `enum`, … for a type; the owning type's kind else. */
  graphqlKind: string;
  /** Field / enum-value type reference, when the entry has one. */
  type?: string;
  description: string;
  addedIn?: string;
  deprecatedSince?: string;
  deprecatedNote?: string;
  deprecationReason?: string;
  markerSource: MarkerSource;
  uiLabel?: UiLabel;
  graphs: string[];
  interfaces: string[];
  unionMembers: string[];
  fields: SchemaShowMember[];
  values: SchemaShowMember[];
  args: SchemaShowArg[];
  pagination?: SchemaShowPagination;
  path: string;
  url: string;
}

export const PAGINATION_RULE =
  'Use exactly one pagination mode; mixing arguments from two modes is rejected at runtime.';

export const PAGINATION_REFERENCE = '.claude/rules/graphql-pagination.md';

const SHORT_DESCRIPTION_LIMIT = 120;

/** One line, marker prefix dropped: `schema show` prints markers separately. */
function shortDescription(description: string): string {
  const body = description
    .replace(/^Added in [0-9][A-Za-z0-9.\-_]*\.\s*/, '')
    .replace(/^Deprecated since [0-9][A-Za-z0-9.\-_]*\.\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return body.length > SHORT_DESCRIPTION_LIMIT
    ? `${body.slice(0, SHORT_DESCRIPTION_LIMIT - 1).trimEnd()}…`
    : body;
}

const markerFields = (
  marker: SchemaMarker,
): Pick<SchemaShowMember, 'addedIn' | 'deprecatedSince'> => ({
  ...(marker.addedIn ? { addedIn: marker.addedIn } : {}),
  ...(marker.deprecatedSince
    ? { deprecatedSince: marker.deprecatedSince }
    : {}),
});

function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = previous[j];
      previous[j] = next;
    }
  }
  return previous[b.length];
}

function closest(known: string[], raw: string, count: number): string[] {
  const needle = raw.toLowerCase();
  return [...known]
    .sort((a, b) => {
      const delta =
        editDistance(a.toLowerCase(), needle) -
        editDistance(b.toLowerCase(), needle);
      return delta !== 0 ? delta : a.localeCompare(b);
    })
    .slice(0, count);
}

/** Exact, then case-insensitive, then spelling-independent. */
function findType(schema: SchemaIndex, name: string): SchemaType | undefined {
  const direct =
    schema.byName.get(name) ?? schema.byLowerName.get(name.toLowerCase());
  if (direct) return direct;
  const key = normaliseIdentifierQuery(name);
  return schema.types.find((type) => normaliseIdentifier(type.name) === key);
}

function findMember<T extends { name: string }>(
  members: T[],
  name: string,
): T | undefined {
  const lower = name.toLowerCase();
  const direct =
    members.find((member) => member.name === name) ??
    members.find((member) => member.name.toLowerCase() === lower);
  if (direct) return direct;
  const key = normaliseIdentifierQuery(name);
  return members.find(
    (member) => normaliseIdentifier(member.name) === key && key.length > 0,
  );
}

export interface SchemaShowOptions {
  id: string;
  lang: string;
}

export function showSchemaEntry(
  context: RepoContext,
  options: SchemaShowOptions,
): SchemaShowData {
  // `show` resolves one name, so it never builds the search candidates.
  const schema = loadSchema(context);
  const i18n = buildI18nReverseIndex(context, schema);
  const raw = options.id.replace(/^schema:/, '').trim();
  const dot = raw.indexOf('.');
  const typeName = dot < 0 ? raw : raw.slice(0, dot);
  const memberName = dot < 0 ? undefined : raw.slice(dot + 1);

  const type = findType(schema, typeName);
  if (!type) {
    throw new CliError('not_found', `Unknown schema name: ${options.id}.`, {
      suggestions: closest(
        schema.types.map((one) => one.name),
        typeName,
        5,
      ),
      hint: `bai-agent search "${typeName}" --domain schema`,
    });
  }

  const location = schemaLocation(context, type.line);
  const base = {
    kind: 'schema-show' as const,
    graphs: type.graphs,
    ...location,
  };

  if (!memberName) {
    return {
      ...base,
      id: type.name,
      entryKind: 'type',
      name: type.name,
      typeName: type.name,
      graphqlKind: type.kind,
      description: type.description,
      ...type.marker,
      markerSource: type.markerSource,
      interfaces: type.interfaces,
      unionMembers: type.unionMembers,
      fields: type.fields.map((field) => ({
        name: field.name,
        type: field.type,
        description: shortDescription(field.description),
        ...markerFields(field.marker),
        markerSource: field.markerSource,
      })),
      values: type.values.map((value) => ({
        name: value.name,
        description: shortDescription(value.description),
        ...markerFields(value.marker),
        markerSource: value.markerSource,
      })),
      args: [],
    };
  }

  const field = findMember(type.fields, memberName);
  if (field) {
    const label = uiLabelFor(
      context,
      i18n,
      `${type.name}.${field.name}`,
      options.lang,
    );
    return {
      ...base,
      ...schemaLocation(context, field.line),
      id: `${type.name}.${field.name}`,
      entryKind: 'field',
      name: field.name,
      typeName: type.name,
      graphqlKind: type.kind,
      type: field.type,
      description: field.description,
      ...field.marker,
      markerSource: field.markerSource,
      ...(field.deprecationReason
        ? { deprecationReason: field.deprecationReason }
        : {}),
      ...(label ? { uiLabel: label } : {}),
      interfaces: [],
      unionMembers: [],
      fields: [],
      values: [],
      args: field.args.map((argument) => ({
        name: argument.name,
        type: argument.type,
        ...(argument.defaultValue
          ? { defaultValue: argument.defaultValue }
          : {}),
        description: shortDescription(argument.description),
      })),
      ...(isConnectionField(field)
        ? {
            pagination: {
              modes: paginationModesFor(field),
              rule: PAGINATION_RULE,
              reference: PAGINATION_REFERENCE,
            },
          }
        : {}),
    };
  }

  const value = findMember(type.values, memberName);
  if (value) {
    return {
      ...base,
      ...schemaLocation(context, value.line),
      id: `${type.name}.${value.name}`,
      entryKind: 'enum-value',
      name: value.name,
      typeName: type.name,
      graphqlKind: type.kind,
      type: type.name,
      description: value.description,
      ...value.marker,
      markerSource: value.markerSource,
      ...(value.deprecationReason
        ? { deprecationReason: value.deprecationReason }
        : {}),
      interfaces: [],
      unionMembers: [],
      fields: [],
      values: [],
      args: [],
    };
  }

  throw new CliError(
    'not_found',
    `Unknown member of ${type.name}: ${memberName}.`,
    {
      suggestions: closest(
        [...type.fields, ...type.values].map((member) => member.name),
        memberName,
        5,
      ).map((name) => `${type.name}.${name}`),
      hint: `bai-agent schema show ${type.name}`,
    },
  );
}
