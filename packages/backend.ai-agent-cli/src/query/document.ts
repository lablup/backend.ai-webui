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
}

export interface ParsedDocument {
  document: DocumentNode;
  operations: ParsedOperation[];
}

/** Root field names of one operation, following top-level fragment spreads. */
function rootFieldsOf(
  document: DocumentNode,
  selections: readonly SelectionNode[],
): string[] {
  const fragments = new Map(
    document.definitions
      .filter((node) => node.kind === 'FragmentDefinition')
      .map((node) => [node.name.value, node] as const),
  );
  const names: string[] = [];
  const seenFragments = new Set<string>();

  const walk = (nodes: readonly SelectionNode[]): void => {
    for (const node of nodes) {
      if (node.kind === 'Field') {
        names.push(node.name.value);
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
  return names;
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
    .map((node) => ({
      operation: node.operation,
      ...(node.name ? { name: node.name.value } : {}),
      rootFields: rootFieldsOf(document, node.selectionSet.selections),
    }));

  if (operations.length === 0) {
    throw new CliError(
      'schema_mismatch',
      'The document declares no operation (only fragments?).',
      { hint: `${CLI_NAME} schema show Query` },
    );
  }
  return { document, operations };
}

/**
 * The type name a validator message most likely refers to, so the hint can
 * point at a `schema show` that actually resolves. Validator messages spell
 * types as `on type "X"` / `of type "X"` / `Unknown type "X"`.
 */
export function nearestTypeIn(messages: string[]): string | undefined {
  for (const message of messages) {
    const match = /type "([^"]+)"/.exec(message);
    if (match) return match[1].replace(/[[\]!]/g, '');
  }
  return undefined;
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
  const nearest = nearestTypeIn(messages);
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
