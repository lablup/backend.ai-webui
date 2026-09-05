import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import type { RepoContext } from '../repo-context.js';
import type {
  DocumentNode,
  GraphQLSchema,
  OperationTypeNode,
  SelectionNode,
} from 'graphql';
import { buildASTSchema, parse, validate } from 'graphql';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Directives the WebUI client strips before sending
 * (`manipulateGraphQLQueryWithClientDirectives`). They are not in the composed
 * SDL, so a document that uses them would fail validation without this file.
 */
export const CLIENT_DIRECTIVES_FILE = 'data/client-directives.graphql';

export function clientDirectivesPath(context: RepoContext): string {
  return join(context.repoRoot, CLIENT_DIRECTIVES_FILE);
}

/**
 * The checkout's SDL as an executable schema.
 *
 * `assumeValidSDL` is load-bearing: `data/schema.graphql` is a **composed
 * federation supergraph**, so it carries `@join__*` / `@link` plumbing that a
 * strict SDL validation rejects. The directives are declared in the document
 * itself, so `buildASTSchema` keeps them and documents that use them still
 * validate; nothing has to be stripped.
 */
function buildExecutableSchema(context: RepoContext): GraphQLSchema {
  const sources = [readFileSync(context.schemaPath, 'utf8')];
  const directives = clientDirectivesPath(context);
  if (existsSync(directives)) {
    sources.push(readFileSync(directives, 'utf8'));
  }
  return buildASTSchema(parse(sources.join('\n')), { assumeValidSDL: true });
}

const CACHE = new Map<string, { mtimeMs: number; schema: GraphQLSchema }>();

/** Built once per process, keyed on the SDL's mtime (as `loadSchema` is). */
export function executableSchema(context: RepoContext): GraphQLSchema {
  const path = context.schemaPath;
  let mtimeMs: number;
  try {
    mtimeMs = statSync(path).mtimeMs;
  } catch (error) {
    throw new CliError('repo_incomplete', `Schema not found: ${path}.`, {
      hint: `${CLI_NAME} doctor`,
      cause: error,
    });
  }
  const cached = CACHE.get(path);
  if (cached && cached.mtimeMs === mtimeMs) return cached.schema;
  try {
    const schema = buildExecutableSchema(context);
    CACHE.set(path, { mtimeMs, schema });
    return schema;
  } catch (error) {
    throw new CliError('internal', `Cannot build a schema from ${path}.`, {
      hint: `${CLI_NAME} doctor`,
      cause: error,
    });
  }
}

export function clearExecutableSchemaCache(): void {
  CACHE.clear();
}

export interface ParsedOperation {
  operation: OperationTypeNode;
  name?: string;
  /** Root selection field names, in document order. */
  rootFields: string[];
  /**
   * Response key -> schema field name for the root selection set. The response
   * key is what a result object is keyed by, which is the **alias** when the
   * document gave one; every schema lookup needs the field name instead. An
   * unaliased field maps to itself, so an identity map is the no-alias case.
   */
  rootFieldByResponseKey: Record<string, string>;
}

export interface ParsedDocument {
  document: DocumentNode;
  operations: ParsedOperation[];
}

/** One root selection: how the result keys it, and what the schema calls it. */
interface RootSelection {
  /** The alias when the document gave one, else the field name. */
  responseKey: string;
  fieldName: string;
}

/** Root selections of one operation, following top-level fragment spreads. */
function rootSelectionsOf(
  document: DocumentNode,
  selections: readonly SelectionNode[],
): RootSelection[] {
  const fragments = new Map(
    document.definitions
      .filter((node) => node.kind === 'FragmentDefinition')
      .map((node) => [node.name.value, node] as const),
  );
  const found: RootSelection[] = [];
  const seenFragments = new Set<string>();

  const walk = (nodes: readonly SelectionNode[]): void => {
    for (const node of nodes) {
      if (node.kind === 'Field') {
        found.push({
          responseKey: (node.alias ?? node.name).value,
          fieldName: node.name.value,
        });
      } else if (node.kind === 'InlineFragment') {
        walk(node.selectionSet.selections);
      } else if (!seenFragments.has(node.name.value)) {
        seenFragments.add(node.name.value);
        const target = fragments.get(node.name.value);
        if (target) walk(target.selectionSet.selections);
      }
    }
  };
  walk(selections);
  return found;
}

/**
 * `{ [responseKey]: fieldName }` for one operation's root selection set.
 * Response keys are unique per selection set (the validator rejects two
 * incompatible fields sharing one), so the first spelling wins.
 *
 * Built with a null prototype: a response key can legally be `constructor`,
 * `toString`, or `__proto__` (a valid GraphQL alias), and a plain object
 * literal already has those as inherited, truthy `Object.prototype` members —
 * `??=` would then see the alias as "already set" and never record its real
 * field name. `Object.create(null)` has no inherited keys, so every response
 * key is stored and read back as plain data.
 */
function rootFieldByResponseKey(
  selections: RootSelection[],
): Record<string, string> {
  const map: Record<string, string> = Object.create(null);
  for (const { responseKey, fieldName } of selections) {
    map[responseKey] ??= fieldName;
  }
  return map;
}

export function parseDocument(source: string): ParsedDocument {
  let document: DocumentNode;
  try {
    document = parse(source);
  } catch (error) {
    throw new CliError(
      'schema_mismatch',
      `The document is not valid GraphQL: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { hint: `${CLI_NAME} schema show Query` },
    );
  }

  const operations = document.definitions
    .filter((node) => node.kind === 'OperationDefinition')
    .map((node) => {
      const selections = rootSelectionsOf(
        document,
        node.selectionSet.selections,
      );
      return {
        operation: node.operation,
        ...(node.name ? { name: node.name.value } : {}),
        rootFields: selections.map((selection) => selection.fieldName),
        rootFieldByResponseKey: rootFieldByResponseKey(selections),
      };
    });

  if (operations.length === 0) {
    throw new CliError(
      'schema_mismatch',
      'The document declares no operation (only fragments?).',
      { hint: `${CLI_NAME} schema show Query` },
    );
  }
  // No operationName is sent, so the manager cannot pick between several.
  if (operations.length > 1) {
    const names = operations.map((one) => one.name ?? '(anonymous)');
    throw new CliError(
      'usage',
      `The document declares ${operations.length} operations (${names.join(', ')}); ${CLI_NAME} query runs exactly one.`,
      {
        hint: `${CLI_NAME} query 'query { user { email } }'`,
        suggestions: ['split the document and run one operation per call'],
      },
    );
  }
  return { document, operations };
}

/** `schema show Int` never resolves, so a built-in scalar is never the hint. */
const BUILT_IN_SCALARS = new Set(['Int', 'Float', 'String', 'Boolean', 'ID']);

/**
 * The type name a validator message most likely refers to, so the hint can
 * point at a `schema show` that actually resolves. Validator messages spell
 * types as `on type "X"` / `of type "X"` / `Unknown type "X"` — and a
 * nullability complaint spells both sides as a scalar (`"Int"` vs `"Int!"`),
 * which is why those are skipped rather than taken as the answer.
 */
export function nearestTypeIn(messages: string[]): string | undefined {
  for (const message of messages) {
    for (const match of message.matchAll(/type "([^"]+)"/g)) {
      const name = match[1].replace(/[[\]!]/g, '');
      if (!BUILT_IN_SCALARS.has(name)) return name;
    }
  }
  return undefined;
}

/**
 * `Query.compute_session_list` — the operation's first root field, when the
 * schema really declares it. The fallback hint for a message that names no
 * type of its own, so `hint` stays a command that resolves.
 */
export function rootFieldIn(
  schema: GraphQLSchema,
  document: DocumentNode,
): string | undefined {
  const operation = document.definitions.find(
    (node) => node.kind === 'OperationDefinition',
  );
  if (!operation) return undefined;
  const rootType =
    operation.operation === 'mutation'
      ? schema.getMutationType()
      : operation.operation === 'subscription'
        ? schema.getSubscriptionType()
        : schema.getQueryType();
  if (!rootType) return undefined;
  const field = operation.selectionSet.selections.find(
    (selection) => selection.kind === 'Field',
  );
  if (!field || !(field.name.value in rootType.getFields())) return undefined;
  return `${rootType.name}.${field.name.value}`;
}

/**
 * Validates against the checkout's SDL. Throws `schema_mismatch` (exit 1)
 * carrying every validator message, before any network call is made.
 */
export function validateAgainstSchema(
  schema: GraphQLSchema,
  document: DocumentNode,
): void {
  const errors = validate(schema, document);
  if (errors.length === 0) return;
  const messages = errors.map((error) => error.message);
  const nearest = nearestTypeIn(messages) ?? rootFieldIn(schema, document);
  throw new CliError(
    'schema_mismatch',
    `The document does not match the checkout's schema (${messages.length} problem(s)).`,
    {
      suggestions: messages,
      hint: nearest
        ? `${CLI_NAME} schema show ${nearest}`
        : `${CLI_NAME} schema sync`,
    },
  );
}

/** `--var k=v`, JSON-decoded when the value parses, otherwise the raw string. */
export function parseVariables(pairs: string[]): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  for (const pair of pairs) {
    const at = pair.indexOf('=');
    if (at <= 0) {
      throw new CliError('usage', `--var expects k=v, got: ${pair}`, {
        hint: `${CLI_NAME} query --var limit=10 --var name=alpha`,
      });
    }
    const key = pair.slice(0, at);
    const raw = pair.slice(at + 1);
    try {
      variables[key] = JSON.parse(raw) as unknown;
    } catch {
      variables[key] = raw;
    }
  }
  return variables;
}
