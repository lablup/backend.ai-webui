/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// FR-3750 prototype — WebMCP adapter. Relay browser assets are copied from
// @mcp-b/webmcp-local-relay/dist/browser into resources/webmcp (the package
// exports map does not expose them). Dev-only; throwaway. Registers a few
// read-only + navigation tools on `document.modelContext` and loads the
// @mcp-b/webmcp-local-relay embed so an MCP client outside the browser
// (Claude Code, a Node script) can call them.
import { initializeWebModelContext } from '@mcp-b/global';
import type { createBrowserRouter } from 'react-router-dom';

type WebUIRouter = ReturnType<typeof createBrowserRouter>;

export const OPEN_SCHEDULING_HISTORY_EVENT = 'webmcp:open-scheduling-history';

const text = (value: unknown) => ({
  content: [
    {
      type: 'text' as const,
      text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
    },
  ],
});

// `current_group_id` / `domainName` are legacy runtime augmentations (see
// react/src/hooks/index.tsx), hence the loose type.
const getClient = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = globalThis.backendaiclient as any;
  if (!client || client.ready === false) {
    throw new Error('Not logged in: globalThis.backendaiclient is not ready');
  }
  return client;
};

const getModelContext = () =>
  document.modelContext ??
  (navigator as Navigator & { modelContext?: typeof document.modelContext })
    .modelContext;

export function installWebMCPAdapter(router: WebUIRouter) {
  initializeWebModelContext();
  const mc = getModelContext();
  if (!mc) {
    // eslint-disable-next-line no-console
    console.warn('[webmcp] no document.modelContext available');
    return;
  }

  void mc.registerTool({
    name: 'whoami',
    description:
      'Return the identity of the user logged in to this Backend.AI WebUI tab (email, uuid, role, domain, project, API endpoint).',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      const c = getClient();
      return text({
        email: c.email,
        full_name: c.full_name,
        user_uuid: c.user_uuid,
        is_admin: c.is_admin,
        is_superadmin: c.is_superadmin,
        domain: c._config.domainName,
        current_project: c.current_group,
        endpoint: c._config.endpoint,
        api_version: c.apiVersion,
        tab_url: location.href,
      });
    },
  });

  void mc.registerTool({
    name: 'list_compute_sessions',
    description:
      'List compute sessions of the current project as seen by the logged-in WebUI (uses the tab session, no extra auth). Returns id, name, image, status, created_at.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description:
            'Comma-separated status filter, e.g. "RUNNING" or "RUNNING,TERMINATED". Default: RUNNING',
        },
        limit: { type: 'number', description: 'Max rows (default 20)' },
      },
    },
    execute: async (args) => {
      const { status, limit } = (args ?? {}) as {
        status?: string;
        limit?: number;
      };
      const c = getClient();
      const res = await c.computeSession.list(
        ['id', 'name', 'image', 'status', 'created_at'],
        status ?? 'RUNNING',
        '',
        limit ?? 20,
        0,
        c.current_group_id(),
      );
      return text(res?.compute_session_list ?? res);
    },
  });

  void mc.registerTool({
    name: 'open_session_detail',
    description:
      'Navigate this browser tab to the compute session list and open the detail drawer of the given session id (row_id / UUID).',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: 'Session UUID (row_id)' },
      },
      required: ['session_id'],
    },
    execute: async (args) => {
      const { session_id } = args as { session_id: string };
      const to = `/session?sessionDetail=${encodeURIComponent(session_id)}`;
      await router.navigate(to);
      return text({ navigated_to: to, tab_url: location.href });
    },
  });

  // Route-scoped tool: only exists while a session detail drawer is open.
  // Registered/unregistered via AbortSignal on every router state change so the
  // relay's tool list should follow the route.
  let historyAbort: AbortController | null = null;
  const syncRouteScopedTools = () => {
    const hasDetail = new URLSearchParams(router.state.location.search).has(
      'sessionDetail',
    );
    if (hasDetail && !historyAbort) {
      historyAbort = new AbortController();
      void mc.registerTool(
        {
          name: 'open_scheduling_history',
          description:
            'Open the scheduling-history modal of the session whose detail drawer is currently open in this tab.',
          inputSchema: { type: 'object', properties: {} },
          execute: async () => {
            window.dispatchEvent(new CustomEvent(OPEN_SCHEDULING_HISTORY_EVENT));
            return text({ opened: true, tab_url: location.href });
          },
        },
        { signal: historyAbort.signal },
      );
    } else if (!hasDetail && historyAbort) {
      historyAbort.abort();
      historyAbort = null;
    }
  };
  syncRouteScopedTools();
  router.subscribe(syncRouteScopedTools);

  // Relay embed: must be a <script src> (it reads document.currentScript.src to
  // find its sibling widget.html).
  const embedUrl = '/resources/webmcp/embed.js';
  const script = document.createElement('script');
  script.src = embedUrl;
  script.setAttribute('data-debug', '');
  document.head.appendChild(script);

  // eslint-disable-next-line no-console
  console.info('[webmcp] adapter installed', { embedUrl });
}
