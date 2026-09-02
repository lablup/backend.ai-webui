import { CliError } from '../errors.js';
import type { RepoContext } from '../repo-context.js';
import type {
  ConstDirectiveNode,
  ConstValueNode,
  DefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  TypeNode,
} from 'graphql';
import { parse } from 'graphql';
import { readFileSync, statSync } from 'node:fs';

export const SCHEMA_KINDS = [
  'object',
  'input',
  'interface',
  'union',
  'enum',
  'scalar',
] as const;

export type SchemaKind = (typeof SCHEMA_KINDS)[number];

/** The version markers Strawberry writes into descriptions. */
export interface SchemaMarker {
  addedIn?: string;
  deprecatedSince?: string;
  /** What the deprecation note says to use instead, when it says anything. */
  deprecatedNote?: string;
}

/** Where a member's marker came from: its own description, or its type's. */
export type MarkerSource = 'own' | 'type' | 'none';

export interface SchemaArg {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface SchemaField {
  name: string;
  /** Printed type reference, e.g. `[String!]!`. */
  type: string;
  /** The type reference with list and non-null wrappers removed. */
  namedType: string;
  description: string;
  marker: SchemaMarker;
  markerSource: MarkerSource;
  args: SchemaArg[];
  /** Pagination arguments the field accepts, in schema order. */
  paginationArgs: string[];
  deprecationReason?: string;
  line: number;
}

export interface SchemaEnumValue {
  name: string;
  description: string;
  marker: SchemaMarker;
  markerSource: MarkerSource;
  deprecationReason?: string;
  line: number;
}

export interface SchemaType {
  name: string;
  kind: SchemaKind;
  description: string;
  marker: SchemaMarker;
  markerSource: MarkerSource;
  interfaces: string[];
  unionMembers: string[];
  /** Subgraphs the composed schema attributes the type to. */
  graphs: string[];
  fields: SchemaField[];
  values: SchemaEnumValue[];
  line: number;
}

export interface SchemaStats {
  types: number;
  fields: number;
  enumValues: number;
  typesWithMarker: number;
  fieldsWithMarker: number;
  fieldsWithOwnMarker: number;
}

export interface SchemaIndex {
  path: string;
  types: SchemaType[];
  byName: Map<string, SchemaType>;
  /** Lowercased name -> type, so lookups tolerate the wrong casing. */
  byLowerName: Map<string, SchemaType>;
  stats: SchemaStats;
}

const ADDED_IN = /\bAdded in ([0-9][A-Za-z0-9.\-_]*?)\.(?:\s|$)/;
const DEPRECATED_SINCE =
  /\bDeprecated since ([0-9][A-Za-z0-9.\-_]*?)\.(?:\s|$)/;

/** Pagination arguments, grouped by the mode they belong to. */
export const PAGINATION_MODES: Array<{ mode: string; args: string[] }> = [
  { mode: 'forward cursor', args: ['first', 'after'] },
  { mode: 'backward cursor', args: ['last', 'before'] },
  { mode: 'offset', args: ['limit', 'offset'] },
];

const PAGINATION_ARGS = new Set(
  PAGINATION_MODES.flatMap((entry) => entry.args),
);

export function parseMarker(description: string): SchemaMarker {
  const marker: SchemaMarker = {};
  const added = ADDED_IN.exec(description);
  if (added) marker.addedIn = added[1];
  const deprecated = DEPRECATED_SINCE.exec(description);
  if (deprecated) {
    marker.deprecatedSince = deprecated[1];
    const note = description.slice(deprecated.index + deprecated[0].length);
    if (note.trim()) marker.deprecatedNote = note.trim();
  }
  return marker;
}

export const hasMarker = (marker: SchemaMarker): boolean =>
  marker.addedIn !== undefined || marker.deprecatedSince !== undefined;

/** A member's own marker, or the one it inherits from its declaring type. */
function inherit(
  own: SchemaMarker,
  typeMarker: SchemaMarker,
): { marker: SchemaMarker; markerSource: MarkerSource } {
  if (hasMarker(own)) return { marker: own, markerSource: 'own' };
  if (hasMarker(typeMarker)) {
    return { marker: typeMarker, markerSource: 'type' };
  }
  return { marker: own, markerSource: 'none' };
}

/** `print()` walks a printer stack per node; the SDL has ~9k type refs. */
function printType(node: TypeNode): string {
  if (node.kind === 'NamedType') return node.name.value;
  if (node.kind === 'ListType') return `[${printType(node.type)}]`;
  return `${printType(node.type)}!`;
}

function printValue(node: ConstValueNode): string {
  if (node.kind === 'NullValue') return 'null';
  if (node.kind === 'StringValue') return JSON.stringify(node.value);
  if (node.kind === 'ListValue') {
    return `[${node.values.map(printValue).join(', ')}]`;
  }
  if (node.kind === 'ObjectValue') {
    return `{${node.fields
      .map((field) => `${field.name.value}: ${printValue(field.value)}`)
      .join(', ')}}`;
  }
  return String(node.value);
}

function namedTypeOf(node: TypeNode): string {
  let current = node;
  for (;;) {
    if (current.kind === 'NamedType') return current.name.value;
    current = current.type;
  }
}

const lineOf = (node: { loc?: { startToken: { line: number } } }): number =>
  node.loc?.startToken.line ?? 0;

function deprecationOf(
  directives: readonly ConstDirectiveNode[] | undefined,
): string | undefined {
  const directive = directives?.find((one) => one.name.value === 'deprecated');
  if (!directive) return undefined;
  const reason = directive.arguments?.find(
    (argument) => argument.name.value === 'reason',
  );
  return reason?.value.kind === 'StringValue'
    ? reason.value.value
    : 'no reason given';
}

function graphsOf(
  directives: readonly ConstDirectiveNode[] | undefined,
): string[] {
  const found = new Set<string>();
  for (const directive of directives ?? []) {
    if (directive.name.value !== 'join__type') continue;
    const graph = directive.arguments?.find(
      (argument) => argument.name.value === 'graph',
    );
    if (graph?.value.kind === 'EnumValue') found.add(graph.value.value);
  }
  return [...found];
}

function readArg(node: InputValueDefinitionNode): SchemaArg {
  return {
    name: node.name.value,
    type: printType(node.type),
    ...(node.defaultValue
      ? { defaultValue: printValue(node.defaultValue) }
      : {}),
    description: node.description?.value.trim() ?? '',
  };
}

function readField(
  node: FieldDefinitionNode | InputValueDefinitionNode,
  typeMarker: SchemaMarker,
): SchemaField {
  const description = node.description?.value.trim() ?? '';
  const args =
    node.kind === 'FieldDefinition'
      ? (node.arguments ?? []).map(readArg)
      : ([] as SchemaArg[]);
  return {
    name: node.name.value,
    type: printType(node.type),
    namedType: namedTypeOf(node.type),
    description,
    ...inherit(parseMarker(description), typeMarker),
    args,
    paginationArgs: args
      .map((argument) => argument.name)
      .filter((name) => PAGINATION_ARGS.has(name)),
    ...(deprecationOf(node.directives)
      ? { deprecationReason: deprecationOf(node.directives) }
      : {}),
    line: lineOf(node),
  };
}

function readEnumValue(
  node: EnumValueDefinitionNode,
  typeMarker: SchemaMarker,
): SchemaEnumValue {
  const description = node.description?.value.trim() ?? '';
  return {
    name: node.name.value,
    description,
    ...inherit(parseMarker(description), typeMarker),
    ...(deprecationOf(node.directives)
      ? { deprecationReason: deprecationOf(node.directives) }
      : {}),
    line: lineOf(node),
  };
}

const KIND_BY_NODE: Partial<Record<DefinitionNode['kind'], SchemaKind>> = {
  ObjectTypeDefinition: 'object',
  InputObjectTypeDefinition: 'input',
  InterfaceTypeDefinition: 'interface',
  UnionTypeDefinition: 'union',
  EnumTypeDefinition: 'enum',
  ScalarTypeDefinition: 'scalar',
};

function readDefinition(node: DefinitionNode): SchemaType | null {
  const kind = KIND_BY_NODE[node.kind];
  if (!kind || !('name' in node)) return null;
  const described = node as Extract<DefinitionNode, { name: unknown }> & {
    description?: { value: string };
    directives?: readonly ConstDirectiveNode[];
  };
  const description = described.description?.value.trim() ?? '';
  const marker = parseMarker(description);
  const fieldNodes =
    node.kind === 'ObjectTypeDefinition' ||
    node.kind === 'InterfaceTypeDefinition'
      ? node.fields
      : node.kind === 'InputObjectTypeDefinition'
        ? node.fields
        : undefined;

  return {
    name: described.name.value,
    kind,
    description,
    marker,
    markerSource: hasMarker(marker) ? 'own' : 'none',
    interfaces:
      node.kind === 'ObjectTypeDefinition' ||
      node.kind === 'InterfaceTypeDefinition'
        ? (node.interfaces ?? []).map((one) => one.name.value)
        : [],
    unionMembers:
      node.kind === 'UnionTypeDefinition'
        ? (node.types ?? []).map((one) => one.name.value)
        : [],
    graphs: graphsOf(described.directives),
    fields: (fieldNodes ?? []).map((field) => readField(field, marker)),
    values:
      node.kind === 'EnumTypeDefinition'
        ? (node.values ?? []).map((value) => readEnumValue(value, marker))
        : [],
    line: lineOf(node),
  };
}

function buildIndex(path: string, source: string): SchemaIndex {
  const document = parse(source);
  const types: SchemaType[] = [];
  for (const definition of document.definitions) {
    const type = readDefinition(definition);
    // Federation plumbing (`join__*`, `link__*`) is not part of the API.
    if (type && !type.name.includes('__')) types.push(type);
  }
  types.sort((a, b) => a.name.localeCompare(b.name));

  const byName = new Map(types.map((type) => [type.name, type]));
  const byLowerName = new Map<string, SchemaType>();
  for (const type of types) {
    if (!byLowerName.has(type.name.toLowerCase())) {
      byLowerName.set(type.name.toLowerCase(), type);
    }
  }

  const fields = types.flatMap((type) => type.fields);
  return {
    path,
    types,
    byName,
    byLowerName,
    stats: {
      types: types.length,
      fields: fields.length,
      enumValues: types.reduce((sum, type) => sum + type.values.length, 0),
      typesWithMarker: types.filter((type) => hasMarker(type.marker)).length,
      fieldsWithMarker: fields.filter((field) => field.markerSource !== 'none')
        .length,
      fieldsWithOwnMarker: fields.filter(
        (field) => field.markerSource === 'own',
      ).length,
    },
  };
}

const CACHE = new Map<string, { mtimeMs: number; index: SchemaIndex }>();

/** Parsed once per process and keyed on the file's mtime. */
export function loadSchema(context: RepoContext): SchemaIndex {
  const path = context.schemaPath;
  let mtimeMs: number;
  try {
    mtimeMs = statSync(path).mtimeMs;
  } catch (error) {
    throw new CliError('repo_incomplete', `Schema not found: ${path}.`, {
      hint: 'bai-agent doctor',
      cause: error,
    });
  }
  const cached = CACHE.get(path);
  if (cached && cached.mtimeMs === mtimeMs) return cached.index;
  try {
    const index = buildIndex(path, readFileSync(path, 'utf8'));
    CACHE.set(path, { mtimeMs, index });
    return index;
  } catch (error) {
    throw new CliError('internal', `Cannot parse ${path}.`, {
      hint: 'bai-agent doctor',
      cause: error,
    });
  }
}

export function clearSchemaCache(): void {
  CACHE.clear();
}

/**
 * A field is a connection when it takes pagination arguments, which is also
 * exactly when the pagination-mode rule applies to it.
 */
export function isConnectionField(field: SchemaField): boolean {
  return field.paginationArgs.length > 0;
}

/** The modes a connection field actually offers, given its arguments. */
export function paginationModesFor(field: SchemaField): string[] {
  const available = new Set(field.paginationArgs);
  return PAGINATION_MODES.filter((entry) =>
    entry.args.some((name) => available.has(name)),
  ).map((entry) => `${entry.mode} (${entry.args.join(' + ')})`);
}
