/**
 * `bai-agent open` — hand a resource from the CLI to an open WebUI tab
 * (FR-3771).
 *
 * The CLI already knows the deep link for anything it returns (`webui_path`).
 * This command is the last hop: it drives the browser tab that is already
 * logged in, through the WebMCP local relay, so an agent can finish a task in
 * the UI instead of printing a URL and hoping someone clicks it.
 */
import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import { loadSession, resolveEndpoint } from '../session.js';
import type { ListResource, ResourceRef } from '../webui-path.js';
import {
  LIST_PAGES,
  LIST_RESOURCES_WITHOUT_STATUS,
  webuiPath,
  webuiUrl,
} from '../webui-path.js';
import type { RelaySource } from '../webmcp/relay-client.js';
import {
  OPEN_RESOURCE_TOOL,
  RelayClient,
  readStructured,
  resolveRelayCommand,
  resultText,
} from '../webmcp/relay-client.js';
import { selectSource, tabSuggestions, toolNameForSource } from '../webmcp/select-tab.js';
import { ENDPOINT_FLAG } from './whoami.js';

/** Detail types `open <type> <id>` accepts, in help order. */
export const OPEN_TYPES = [
  'session',
  'vfolder',
  'deployment',
  'model_card',
  'role',
  'artifact',
] as const;

const SESSION_VIEWS = ['detail', 'scheduling_history', 'container_log'];
const DEPLOYMENT_VIEWS = ['detail', 'revisions', 'access_tokens'];

/** How long to wait for an already-open tab to reconnect to a fresh relay. */
export const DEFAULT_WAIT_SECONDS = 10;

export interface OpenData {
  /** `session`, …, or `list`. */
  type: string;
  /** The resource id, or — for `list` — the list resource. */
  target: string;
  webui_path: string;
  webui_url?: string;
  /** Tab the handoff landed in. */
  tab: string;
  tabTitle: string;
  /** Why that tab: it was the only one, `--tab`, or the endpoint match. */
  tabReason: string;
  /** Relay tool name actually called (suffixed when tabs collide). */
  tool: string;
  /** Path the tab reports after navigating. */
  path: string;
  /** `document.title` the tab reports after navigating. */
  title: string;
}

const flagString = (
  flags: Record<string, string | boolean | string[]>,
  name: string,
): string | undefined =>
  typeof flags[name] === 'string' ? (flags[name] as string) : undefined;

const usageError = (message: string, suggestions?: string[]): CliError =>
  new CliError('usage', message, {
    ...(suggestions ? { suggestions } : {}),
    hint: `${CLI_NAME} open --help`,
  });

/**
 * Turns `<type> <id>` (or `list <resource>`) plus flags into a `ResourceRef`.
 * The same rules `WebMCPGlobalTools.parseResourceRef` enforces in the tab, so
 * a bad reference fails here instead of round-tripping to the browser.
 */
export function parseOpenRef(
  args: string[],
  flags: Record<string, string | boolean | string[]>,
): ResourceRef {
  const [type, target] = args;
  if (!type) {
    throw usageError('open needs a resource type.', [
      ...OPEN_TYPES,
      'list <resource>',
    ]);
  }
  if (type === 'list') {
    if (!target) {
      throw usageError('open list needs a resource.', Object.keys(LIST_PAGES));
    }
    if (!(target in LIST_PAGES)) {
      throw usageError(`Unknown list resource: ${target}`, Object.keys(LIST_PAGES));
    }
    const resource = target as ListResource;
    const filter = flagString(flags, 'filter');
    const statusCategory = flagString(flags, 'status-category');
    if (
      statusCategory !== undefined &&
      (LIST_RESOURCES_WITHOUT_STATUS as readonly string[]).includes(resource)
    ) {
      throw usageError(`The "${resource}" list page has no status filter.`);
    }
    return {
      type: 'list',
      resource,
      ...(filter !== undefined ? { filter } : {}),
      ...(statusCategory !== undefined ? { statusCategory } : {}),
    } as ResourceRef;
  }
  if (!(OPEN_TYPES as readonly string[]).includes(type)) {
    throw usageError(`Unknown resource type: ${type}`, [
      ...OPEN_TYPES,
      'list <resource>',
    ]);
  }
  if (!target) throw usageError(`open ${type} needs an id.`);

  const view = flagString(flags, 'view');
  if (type === 'session') {
    if (view !== undefined && !SESSION_VIEWS.includes(view)) {
      throw usageError(`--view must be one of ${SESSION_VIEWS.join(', ')}.`);
    }
    return { type, id: target, ...(view ? { view: view as never } : {}) };
  }
  if (type === 'deployment') {
    if (view !== undefined && !DEPLOYMENT_VIEWS.includes(view)) {
      throw usageError(`--view must be one of ${DEPLOYMENT_VIEWS.join(', ')}.`);
    }
    return { type, id: target, ...(view ? { view: view as never } : {}) };
  }
  if (view !== undefined) {
    throw usageError(`--view is not accepted for type "${type}".`);
  }
  if (type === 'vfolder') {
    const path = flagString(flags, 'path');
    return { type, id: target, ...(path !== undefined ? { path } : {}) };
  }
  return { type, id: target } as ResourceRef;
}

/** The `--tab <id>  <title>` list plus the command that reruns with one. */
const ambiguous = (sources: RelaySource[], argv: string): CliError =>
  new CliError(
    'ambiguous_tab',
    `${sources.length} WebUI tabs are connected; name one with --tab.`,
    {
      suggestions: tabSuggestions(sources),
      hint: `${CLI_NAME} open ${argv} --tab ${sources[0]?.tabId ?? '<id>'}`,
    },
  );

function parseWait(raw: string | undefined): number {
  if (raw === undefined) return DEFAULT_WAIT_SECONDS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw usageError(`--wait expects a number of seconds, got: ${raw}`);
  }
  return parsed;
}

export const openCommand = defineCommand<OpenData>({
  name: 'open',
  summary:
    'Open a resource in the WebUI tab this machine already has, through the WebMCP local relay.',
  usage: `${CLI_NAME} open <${OPEN_TYPES.join('|')}> <id> | open list <resource> [--view <v>] [--path <p>] [--filter <f>] [--status-category <s>] [--tab <id>] [--webui <origin>] [--wait <seconds>] [--json]`,
  flags: [
    {
      flag: '--view <name>',
      description: `Detail view. session: ${SESSION_VIEWS.join('|')}; deployment: ${DEPLOYMENT_VIEWS.join('|')}.`,
      type: 'string',
    },
    {
      flag: '--path <path>',
      description: 'Path inside the folder (vfolder only).',
      type: 'string',
    },
    {
      flag: '--filter <text>',
      description: 'List page filter, passed through verbatim (list only).',
      type: 'string',
    },
    {
      flag: '--status-category <value>',
      description: 'List page status/category filter (list only).',
      type: 'string',
    },
    {
      flag: '--tab <id>',
      description:
        'Tab to drive, by the id `webmcp_list_sources` reports. Required when several tabs are connected.',
      type: 'string',
    },
    {
      flag: '--webui <origin>',
      description:
        "WebUI origin for webui_url and the no-tab hint. Defaults to the stored session's webui origin.",
      type: 'string',
    },
    {
      flag: '--wait <seconds>',
      description: `How long to wait for a tab to reconnect to the relay (default ${DEFAULT_WAIT_SECONDS}).`,
      type: 'string',
      default: String(DEFAULT_WAIT_SECONDS),
    },
    ENDPOINT_FLAG,
  ],
  maxArgs: 2,
  run: async (context) => {
    const ref = parseOpenRef(context.args, context.flags);
    const path = webuiPath(ref);
    const waitSeconds = parseWait(flagString(context.flags, 'wait'));

    // A session is optional here: `open` never talks to the manager, it only
    // uses the endpoint to break a tie between tabs and to find the origin.
    let endpoint: string | undefined;
    try {
      endpoint = resolveEndpoint({
        flag: flagString(context.flags, 'endpoint'),
        cwd: context.cwd,
      }).endpoint;
    } catch {
      endpoint = undefined;
    }
    const stored = endpoint ? loadSession(endpoint) : null;
    const origin =
      flagString(context.flags, 'webui') ?? (stored?.webui || undefined);
    const url = origin ? webuiUrl(origin, path) : undefined;

    const relay = resolveRelayCommand(context.cwd);
    const client = new RelayClient(relay);
    try {
      // Progress on stderr would sit in front of a `--json` error envelope,
      // which is also written there — so it is text-mode only.
      if (!context.json) {
        context.notify(`starting the WebMCP relay (${relay.source})…`);
      }
      await client.start();
      const sources = await client.waitForSources(waitSeconds * 1000);
      const tab = flagString(context.flags, 'tab');
      const selection = selectSource(sources, {
        tab,
        endpoint,
        webuiOrigin: origin,
      });

      if (!selection.ok) {
        if (selection.code === 'no_webui_tab') {
          throw new CliError(
            'no_webui_tab',
            'No WebUI tab is connected to the WebMCP relay.',
            {
              suggestions: [
                'start the dev server with VITE_WEBMCP=on pnpm run dev',
                'open the WebUI and log in, then run this again',
              ],
              // The full URL, so a human can finish the handoff by hand.
              hint: url ?? path,
            },
          );
        }
        if (selection.code === 'not_found') {
          throw new CliError('not_found', `No connected tab matches --tab ${tab}.`, {
            suggestions: tabSuggestions(sources),
            hint: `${CLI_NAME} doctor --json`,
          });
        }
        throw ambiguous(sources, context.args.join(' '));
      }

      const source = selection.source;
      const tools = await client.listRelayedTools();
      const toolName = toolNameForSource(tools, source);
      if (!toolName) {
        throw new CliError(
          'not_found',
          `Tab ${source.tabId} publishes no ${OPEN_RESOURCE_TOOL} tool.`,
          {
            suggestions: tools.map((one) => one.name),
            hint: `${CLI_NAME} doctor --json`,
          },
        );
      }

      const result = await client.callTool(
        toolName,
        ref as unknown as Record<string, unknown>,
      );
      const payload = readStructured<{
        path?: string;
        title?: string;
        code?: string;
        message?: string;
      }>(result);
      if (result.isError) {
        throw new CliError(
          'not_found',
          payload?.message ?? (resultText(result) || 'the tab refused the open'),
          { hint: url ?? path },
        );
      }

      return {
        type: ref.type,
        target: ref.type === 'list' ? ref.resource : ref.id,
        webui_path: path,
        ...(url ? { webui_url: url } : {}),
        tab: source.tabId,
        tabTitle: source.title ?? '',
        tabReason: selection.reason,
        tool: toolName,
        path: payload?.path ?? path,
        title: payload?.title ?? '',
      };
    } finally {
      await client.close();
    }
  },
  render: (data) =>
    renderBlocks([
      section(`${CLI_NAME} open`),
      record([
        ['type', data.type],
        ['target', data.target],
        ['path', data.path],
        ['title', data.title],
        ['webui_path', data.webui_path],
        ['webui_url', data.webui_url],
        ['tab', data.tab],
        ['tab title', data.tabTitle],
        ['tab picked by', data.tabReason],
        ['tool', data.tool],
      ]),
    ]),
});
