import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { gqlRequest } from '../manager.js';
import { CLI_NAME } from '../meta.js';
import {
  allowedMutation,
  ALLOWED_MUTATION_NAMES,
  resourceForMutation,
} from '../mutation-allowlist.js';
import { list, record, renderBlocks, section, text } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import { loadSchema } from '../search/schema-sdl.js';
import { loadSession, resolveEndpoint } from '../session.js';
import { listPath } from '../webui-path.js';
import type { QueryLink } from '../query/links.js';
import { annotateResult, survivingLinks } from '../query/links.js';
import {
  executableSchema,
  parseDocument,
  parseVariables,
  validateAgainstSchema,
} from '../query/document.js';
import { DEFAULT_MAX_BYTES, jsonBytes, truncateToBudget } from '../query/truncate.js';
import { cookbookCommandFor } from './cookbook.js';
import { ENDPOINT_FLAG } from './whoami.js';
import { readFileSync } from 'node:fs';

export interface QueryData {
  endpoint: string;
  operation: string;
  operationName?: string;
  rootFields: string[];
  variables: Record<string, unknown>;
  maxBytes: number;
  bytes: number;
  /** JSON paths cut to fit `maxBytes`, deepest-first. */
  truncated: string[];
  links: QueryLink[];
  result: unknown;
}

const flagString = (
  flags: Record<string, string | boolean | string[]>,
  name: string,
): string | undefined =>
  typeof flags[name] === 'string' ? (flags[name] as string) : undefined;

const flagList = (
  flags: Record<string, string | boolean | string[]>,
  name: string,
): string[] => (Array.isArray(flags[name]) ? (flags[name] as string[]) : []);

/** Positional document, else `--file`, else stdin. */
function readSource(
  args: string[],
  file: string | undefined,
  readStdin: () => string,
): string {
  if (args[0] !== undefined && file !== undefined) {
    throw new CliError(
      'usage',
      'Pass the document as an argument OR with --file, not both.',
      { hint: `${CLI_NAME} query --help` },
    );
  }
  if (file !== undefined) {
    try {
      return readFileSync(file, 'utf8');
    } catch (error) {
      throw new CliError('usage', `Cannot read --file ${file}.`, {
        hint: `ls ${file}`,
        cause: error,
      });
    }
  }
  if (args[0] !== undefined) return args[0];
  const piped = readStdin();
  if (piped.trim().length === 0) {
    throw new CliError('usage', 'No document: pass one, use --file, or pipe it.', {
      hint: `${CLI_NAME} query 'query { user { email } }'`,
    });
  }
  return piped;
}

function readStdinSync(): string {
  if (process.stdin.isTTY) return '';
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

const MAX_LINKS_SHOWN = 5;

/** `links: <n> — <resource> <url>[, ...]`, capped at `MAX_LINKS_SHOWN`. */
function formatLinksNotice(links: QueryLink[]): string {
  const shown = links
    .slice(0, MAX_LINKS_SHOWN)
    .map((link) => `${link.resource} ${link.webui_url ?? link.webui_path}`)
    .join(', ');
  const more = links.length > MAX_LINKS_SHOWN ? ', …' : '';
  return `links: ${links.length} — ${shown}${more}`;
}

function parseMaxBytes(raw: string | undefined): number {
  if (raw === undefined) return DEFAULT_MAX_BYTES;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new CliError('usage', `--max-bytes expects a positive integer, got: ${raw}`, {
      hint: `${CLI_NAME} query --max-bytes ${DEFAULT_MAX_BYTES}`,
    });
  }
  return parsed;
}

/**
 * The mutation gate. Runs **before** any endpoint or session is resolved, so a
 * refusal is provably free of network traffic.
 */
function refuseMutation(field: string, allowFlagGiven: boolean): CliError {
  const resource = resourceForMutation(field);
  const page = resource ? listPath(resource) : undefined;
  const why = allowFlagGiven
    ? `Mutation "${field}" is not on the allow-list.`
    : `Mutation "${field}" needs --allow-mutation.`;
  return new CliError('mutation_refused', why, {
    suggestions: [
      `allow-listed mutations: ${ALLOWED_MUTATION_NAMES.join(', ')}`,
      ...(page ? [`do it in the WebUI at ${page}`] : []),
    ],
    hint: page ?? `${CLI_NAME} query --help`,
  });
}

/**
 * A document the local SDL rejects is a hand-written one; carry the cookbook
 * entry for its root field next to the validator messages.
 */
function withCookbookPointer(error: unknown, rootFields: string[]): unknown {
  if (!(error instanceof CliError) || error.code !== 'schema_mismatch') {
    return error;
  }
  return new CliError('schema_mismatch', error.message, {
    suggestions: [
      ...(error.suggestions ?? []),
      cookbookCommandFor(rootFields),
    ],
    hint: error.hint,
  });
}

export const queryCommand = defineCommand<QueryData>({
  name: 'query',
  summary:
    'Run a raw GraphQL document against the manager, pre-validated against the checkout SDL.',
  usage: `${CLI_NAME} query '<document>' | --file <path> | (stdin) [--var k=v]... [--allow-mutation] [--max-bytes <n>] [--endpoint <url>] [--webui <origin>] [--json]`,
  flags: [
    {
      flag: '--file <path>',
      description: 'Read the GraphQL document from a file instead of an argument.',
      type: 'string',
    },
    {
      flag: '--var <k=v>',
      description:
        'Query variable; repeatable. The value is JSON when it parses, otherwise a string.',
      type: 'string',
      repeatable: true,
    },
    {
      flag: '--allow-mutation',
      description:
        'Permit an allow-listed mutation to execute. Without it every mutation is refused (exit 4).',
      type: 'boolean',
    },
    {
      flag: '--max-bytes <n>',
      description: `Result budget in bytes; arrays and strings are cut deepest-first (default ${DEFAULT_MAX_BYTES}).`,
      type: 'string',
      default: String(DEFAULT_MAX_BYTES),
    },
    {
      flag: '--webui <origin>',
      description:
        'WebUI origin for webui_url. Defaults to the stored session\'s webui origin.',
      type: 'string',
    },
    ENDPOINT_FLAG,
  ],
  maxArgs: 1,
  run: async (context) => {
    const repo = resolveRepoContext(context.cwd);
    const source = readSource(
      context.args,
      flagString(context.flags, 'file'),
      readStdinSync,
    );
    const maxBytes = parseMaxBytes(flagString(context.flags, 'max-bytes'));
    const variables = parseVariables(flagList(context.flags, 'var'));

    const { document, operations } = parseDocument(source);
    try {
      validateAgainstSchema(executableSchema(repo), document);
    } catch (error) {
      throw withCookbookPointer(
        error,
        operations.flatMap((operation) => operation.rootFields),
      );
    }

    const allowMutation = context.flags['allow-mutation'] === true;
    const mutations = operations.filter(
      (operation) => operation.operation === 'mutation',
    );
    for (const mutation of mutations) {
      for (const field of mutation.rootFields) {
        if (!allowMutation || !allowedMutation(field)) {
          throw refuseMutation(field, allowMutation);
        }
      }
    }

    const { endpoint } = resolveEndpoint({
      flag: flagString(context.flags, 'endpoint'),
      cwd: context.cwd,
    });
    const stored = loadSession(endpoint);
    if (!stored) {
      throw new CliError('auth_required', `No session stored for ${endpoint}.`, {
        hint: `${CLI_NAME} login --endpoint ${endpoint}`,
      });
    }

    const primary = operations[0];
    if (mutations.length > 0) {
      context.notify(
        `running allow-listed mutation(s): ${mutations
          .flatMap((operation) => operation.rootFields)
          .join(', ')}`,
      );
    }
    const raw = await gqlRequest<unknown>(
      { endpoint, sessionId: stored.sessionId },
      { query: source, variables },
    );

    // Annotate first, cut second: `webui_path` then counts against the budget
    // instead of blowing past it, and the truncator refuses to cut a link or
    // an id. `survivingLinks` then drops the links whose row did not survive.
    const webui =
      flagString(context.flags, 'webui') ?? (stored.webui || undefined);
    const annotated = annotateResult(
      loadSchema(repo),
      primary.operation === 'mutation' ? 'Mutation' : 'Query',
      raw,
      webui,
    );
    const cut = truncateToBudget(raw, maxBytes);
    const links = survivingLinks(annotated, cut.value);

    // Text mode renders links in its own block; --json's stdout is a single
    // envelope, so this is the only place a --json caller sees them at all.
    if (context.json && links.length > 0) {
      context.notify(formatLinksNotice(links));
    }

    return {
      endpoint,
      operation: primary.operation,
      ...(primary.name ? { operationName: primary.name } : {}),
      rootFields: operations.flatMap((operation) => operation.rootFields),
      variables,
      maxBytes,
      bytes: jsonBytes(cut.value),
      truncated: cut.truncated,
      links,
      result: cut.value,
    };
  },
  render: (data, { verbosity }) => {
    const blocks = [
      section(`${CLI_NAME} query`),
      record([
        ['operation', data.operation],
        ['name', data.operationName],
        ['fields', data.rootFields.join(', ')],
        ['endpoint', data.endpoint],
        ['bytes', `${data.bytes} / ${data.maxBytes}`],
        ...(verbosity === 'detail'
          ? (Object.entries(data.variables).map(([key, value]) => [
              `var ${key}`,
              JSON.stringify(value),
            ]) as Array<[string, string]>)
          : []),
      ]),
    ];
    if (data.truncated.length > 0) {
      blocks.push(section('Truncated'), list(data.truncated));
    }
    if (data.links.length > 0 && verbosity !== 'dense') {
      blocks.push(
        section('Links'),
        list(
          data.links.map(
            (link) =>
              [
                link.path,
                link.resource,
                link.id,
                link.webui_url ?? link.webui_path,
              ]
                .filter(Boolean)
                .join(' '),
          ),
        ),
      );
    }
    blocks.push(section('Result'), text(JSON.stringify(data.result, null, 2)));
    return renderBlocks(blocks);
  },
});
