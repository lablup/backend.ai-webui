/**
 * Which open WebUI tab a handoff lands in (FR-3771).
 *
 * Split out of `commands/open.ts` so the branching — nothing open, one tab,
 * several tabs, `--tab` — is unit-testable without spawning a relay.
 */
import type { RelaySource, RelayTool } from './relay-client.js';
import { OPEN_RESOURCE_TOOL } from './relay-client.js';

/** `https://127.0.0.1:8090/` -> `127.0.0.1:8090`. Mirrors the WebUI's `getEndpointHost`. */
export const endpointHost = (endpoint: string | undefined | null): string =>
  (endpoint ?? '')
    .trim()
    .replace(/^[a-zA-Z][\w+.-]*:\/\//, '')
    .replace(/\/.*$/, '');

/**
 * The manager host a tab is talking to, read off its document title.
 * `RouteDocumentTitle` formats it as `Backend.AI · <page> · <project> @ <host>`
 * (FR-3760), so the segment after ` @ ` is the tab's endpoint host.
 */
export const titleHost = (title: string | undefined): string => {
  const index = (title ?? '').lastIndexOf(' @ ');
  return index < 0 ? '' : title!.slice(index + 3).trim();
};

/** A tab is named by its tab id; the connection id is accepted as well. */
export const matchesTab = (source: RelaySource, tab: string): boolean =>
  source.tabId === tab ||
  source.sourceId === tab ||
  source.tabId.startsWith(tab) ||
  source.sourceId.startsWith(tab);

/** One `--tab <id>  <title>` line per connected tab, for a suggestions list. */
export const tabSuggestions = (sources: RelaySource[]): string[] =>
  sources.map(
    (source) =>
      `--tab ${source.tabId}  ${source.title || source.url || source.origin || '(untitled)'}`,
  );

export type TabSelection =
  | {
      ok: true;
      source: RelaySource;
      reason: 'only' | 'flag' | 'origin' | 'endpoint';
    }
  | { ok: false; code: 'no_webui_tab' | 'ambiguous_tab' | 'not_found' };

/** `https://ui.example.com/x` -> `https://ui.example.com`. */
const originOf = (value: string | undefined): string =>
  (value ?? '').trim().replace(/\/+$/, '');

/**
 * Picks the tab to drive.
 *
 * `--tab` wins outright, then a single connected tab is used as-is. With
 * several open, two tie-breakers are tried in order:
 *
 * 1. **The WebUI origin** the CLI is pointed at (`--webui`, else the stored
 *    session's). This is the reliable one — the relay reports each tab's own
 *    origin.
 * 2. **The manager host in the tab's document title**. `RouteDocumentTitle`
 *    formats it as `… @ <host>` (FR-3760), so it identifies the backend the
 *    tab is logged in to. Weaker: the relay captures the title once, when the
 *    embed script loads, so a tab that logged in afterwards still reports its
 *    boot title and never matches.
 *
 * Anything still ambiguous is reported rather than guessed.
 */
export function selectSource(
  sources: RelaySource[],
  options: { tab?: string; endpoint?: string; webuiOrigin?: string },
): TabSelection {
  if (options.tab) {
    const matched = sources.filter((source) => matchesTab(source, options.tab!));
    if (matched.length === 1) {
      return { ok: true, source: matched[0], reason: 'flag' };
    }
    return {
      ok: false,
      code: matched.length === 0 ? 'not_found' : 'ambiguous_tab',
    };
  }
  if (sources.length === 0) return { ok: false, code: 'no_webui_tab' };
  if (sources.length === 1) return { ok: true, source: sources[0], reason: 'only' };

  const origin = originOf(options.webuiOrigin);
  const onOrigin = origin
    ? sources.filter((source) => originOf(source.origin) === origin)
    : [];
  if (onOrigin.length === 1) {
    return { ok: true, source: onOrigin[0], reason: 'origin' };
  }

  const host = endpointHost(options.endpoint);
  const onEndpoint = (onOrigin.length > 1 ? onOrigin : sources).filter(
    (source) => host !== '' && titleHost(source.title) === host,
  );
  if (onEndpoint.length === 1) {
    return { ok: true, source: onEndpoint[0], reason: 'endpoint' };
  }
  return { ok: false, code: 'ambiguous_tab' };
}

/**
 * Is this the aggregated entry for `toolName`?
 *
 * `originalName` is the reliable answer — but only when the relay runs in
 * server mode. A relay proxying through another one (client mode, which is
 * what happens whenever an MCP client already holds the port) rebuilds the
 * list from the upstream's public names and sets `originalName` to the
 * **public** name, suffix and all. So the suffixed spelling counts too.
 */
const isEntryFor = (tool: RelayTool, toolName: string): boolean =>
  tool.originalName === toolName ||
  tool.name === toolName ||
  tool.name.startsWith(`${toolName}_`);

/**
 * The public tool name that reaches `bai_open_resource` **on this tab**.
 *
 * The relay has no per-call source argument: it disambiguates by name instead,
 * appending a short tab-id suffix when two tabs publish the same tool. So the
 * routing key is the name whose `sources` include the chosen tab.
 */
export function toolNameForSource(
  tools: RelayTool[],
  source: RelaySource,
  toolName: string = OPEN_RESOURCE_TOOL,
): string | undefined {
  const candidates = tools.filter((tool) => isEntryFor(tool, toolName));
  const owned = candidates.find((tool) =>
    tool.sources?.some(
      (one) => one.sourceId === source.sourceId || one.tabId === source.tabId,
    ),
  );
  if (owned) return owned.name;
  return candidates.length === 1 ? candidates[0].name : undefined;
}
