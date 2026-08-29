/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Single source of truth for "open this resource" deep links (FR-3759).
 *
 * Every in-app surface that links to a resource builds its URL here, so the
 * param names and view encodings cannot drift apart. The app itself only calls
 * `resourceLocation` today; the list-page rules exist because this module is
 * also the **oracle** for the CLI's `webui_path`, which restates them in
 * `packages/backend.ai-agent-cli/src/webui-path.ts`. The contract between the
 * two is `RESOURCE_PATH_CASES` (`resourcePath.fixture.ts` / `.json`): this
 * module's test regenerates the JSON, and the CLI's `webui-path.parity.test.ts`
 * fails when its copy drifts from it.
 *
 * ## Which pathname is canonical
 *
 * The webui encodes the project in the URL (`/project/:projectName/session`,
 * see `pathBuilder.ts`), but a deep link is built without knowing the viewer's
 * project. So:
 *
 * - **project-scoped** resources use the flat legacy path (`/session`, `/data`,
 *   `/deployments/:id`, `/model-store`). `ProjectScopedRedirect`
 *   (`legacyRedirects.tsx`) `replace`-redirects those into
 *   `/project/<current>/…` **preserving the query string**, which is exactly
 *   the project-agnostic entry point a deep link needs.
 * - **project-agnostic** resources use their canonical `/admin/*` path
 *   (`/admin/rbac`, `/admin/reservoir/:id`, `/admin/users`, `/admin/agent`) —
 *   no project to inject, so no redirect hop.
 *
 * This module is intentionally framework-free (no React / react-router import)
 * so the fixture generator and plain unit tests can use it.
 */

/** Session detail views. See `SESSION_VIEW_NOTE` below for the URL reality. */
export type SessionView = 'detail' | 'scheduling_history' | 'container_log';

/** Deployment detail views — encoded as the page's section hash. */
export type DeploymentView = 'detail' | 'revisions' | 'access_tokens';

/**
 * List resources whose page exposes a status/category URL param. The literal
 * param name differs per page (`statusCategory` / `status` / `mode`) — see
 * `LIST_PAGES`.
 */
export const LIST_RESOURCES_WITH_STATUS = [
  'session',
  'deployment',
  'vfolder',
  'role',
  'artifact',
  'agent',
  'user',
  'keypair',
] as const;

/** List resources whose page has no status param at all. */
export const LIST_RESOURCES_WITHOUT_STATUS = ['model_card'] as const;

export type ListResourceWithStatus =
  (typeof LIST_RESOURCES_WITH_STATUS)[number];
export type ListResourceWithoutStatus =
  (typeof LIST_RESOURCES_WITHOUT_STATUS)[number];
export type ListResource = ListResourceWithStatus | ListResourceWithoutStatus;

/**
 * A reference to something the UI can open.
 *
 * `agent`, `user` and `keypair` have **list** entries but no detail member on
 * purpose: their pages have no per-row URL param yet, so a detail ref for them
 * is a compile error rather than a link that silently lands on the list.
 */
export type ResourceRef =
  | { type: 'session'; id: string; view?: SessionView }
  | { type: 'vfolder'; id: string; path?: string }
  | { type: 'deployment'; id: string; view?: DeploymentView }
  | { type: 'model_card'; id: string }
  | { type: 'role'; id: string }
  | { type: 'artifact'; id: string }
  | {
      type: 'list';
      resource: ListResourceWithStatus;
      filter?: string;
      statusCategory?: string;
    }
  // `statusCategory?: never` is load-bearing: without it TypeScript's
  // union-wide excess-property check would silently accept it on these pages.
  | {
      type: 'list';
      resource: ListResourceWithoutStatus;
      filter?: string;
      statusCategory?: never;
    };

/** The parts of a resource link, for callers that navigate with a location object. */
export interface ResourceLocation {
  pathname: string;
  /** Query string WITHOUT the leading `?`. Empty when there are no params. */
  search: string;
  /** Section hash INCLUDING the leading `#`. Empty when there is none. */
  hash: string;
}

interface ListPageSpec {
  /** Page pathname. */
  pathname: string;
  /** Params that select the resource's surface on a shared page (e.g. a tab). */
  fixedParams?: Readonly<Record<string, string>>;
  /** Param carrying the free-text / JSON filter. */
  filterParam: string;
  /** Param carrying the status category, when the page has one. */
  statusParam?: string;
}

/**
 * `list` resource -> its page and URL params, as the pages actually parse them
 * (nuqs `useQueryStates`). `filter` is passed through verbatim: pages differ on
 * whether the value is free text (`parseAsString`) or JSON (`parseAsJson`), and
 * that is the caller's concern, not this module's.
 */
export const LIST_PAGES: Readonly<Record<ListResource, ListPageSpec>> = {
  session: {
    pathname: '/session',
    filterParam: 'filter',
    statusParam: 'statusCategory',
  },
  deployment: {
    pathname: '/deployments',
    filterParam: 'filter',
    statusParam: 'statusCategory',
  },
  vfolder: {
    pathname: '/data',
    filterParam: 'filter',
    statusParam: 'statusCategory',
  },
  model_card: { pathname: '/model-store', filterParam: 'filter' },
  role: {
    pathname: '/admin/rbac',
    filterParam: 'filter',
    statusParam: 'status',
  },
  artifact: {
    pathname: '/admin/reservoir',
    filterParam: 'filter',
    statusParam: 'mode',
  },
  agent: {
    pathname: '/admin/agent',
    fixedParams: { tab: 'agents' },
    filterParam: 'filter',
    statusParam: 'status',
  },
  user: {
    pathname: '/admin/users',
    fixedParams: { tab: 'users' },
    filterParam: 'filter',
    statusParam: 'status',
  },
  keypair: {
    // Same page as `user`, other tab — and the credentials tab spells its
    // status segment `activeType`, not `status`.
    pathname: '/admin/users',
    fixedParams: { tab: 'credentials' },
    filterParam: 'filter',
    statusParam: 'activeType',
  },
};

/** Search param that opens the session detail drawer (`SessionDetailAndContainerLogOpenerLegacy`). */
export const SESSION_DETAIL_PARAM = 'sessionDetail';
/** Search params that open the folder explorer at a path (`FolderExplorerOpener`). */
export const VFOLDER_PARAM = 'folder';
export const VFOLDER_PATH_PARAM = 'path';
/** Search param that opens the model card drawer (`ModelStoreListPageV2`). */
export const MODEL_CARD_PARAM = 'modelCard';
/** Search param that opens the role detail drawer (`RBACManagementPage`). */
export const ROLE_DETAIL_PARAM = 'roleDetail';

/**
 * Section hashes `DeploymentDetailPage` scrolls to. `detail` is the page top,
 * i.e. no hash.
 */
const DEPLOYMENT_VIEW_HASH: Readonly<Record<DeploymentView, string>> = {
  detail: '',
  revisions: '#revisions',
  access_tokens: '#access-tokens',
};

/**
 * Scheduling history and container logs are local modals inside the session
 * detail drawer with no URL state, so all three session views resolve to the
 * same drawer link today; add the param here when one gains URL state.
 */
export const SESSION_VIEW_NOTE =
  'session views share one URL: the drawer is the only addressable surface';

const toSearch = (params: Array<[string, string]>): string =>
  params.length === 0 ? '' : new URLSearchParams(params).toString();

/**
 * Resolves a resource reference to the page it opens on, split into
 * `pathname` / `search` / `hash`.
 *
 * Prefer this over `resourcePath` when the caller already owns a scope-aware
 * pathname (`useProjectPath()`) and only needs the resource's params.
 */
export const resourceLocation = (ref: ResourceRef): ResourceLocation => {
  switch (ref.type) {
    case 'session':
      return {
        pathname: '/session',
        search: toSearch([[SESSION_DETAIL_PARAM, ref.id]]),
        hash: '',
      };
    case 'vfolder': {
      const params: Array<[string, string]> = [[VFOLDER_PARAM, ref.id]];
      if (ref.path !== undefined) {
        params.push([VFOLDER_PATH_PARAM, ref.path]);
      }
      return { pathname: '/data', search: toSearch(params), hash: '' };
    }
    case 'deployment':
      return {
        pathname: `/deployments/${encodeURIComponent(ref.id)}`,
        search: '',
        hash: DEPLOYMENT_VIEW_HASH[ref.view ?? 'detail'],
      };
    case 'model_card':
      return {
        pathname: '/model-store',
        search: toSearch([[MODEL_CARD_PARAM, ref.id]]),
        hash: '',
      };
    case 'role':
      return {
        pathname: '/admin/rbac',
        search: toSearch([[ROLE_DETAIL_PARAM, ref.id]]),
        hash: '',
      };
    case 'artifact':
      return {
        pathname: `/admin/reservoir/${encodeURIComponent(ref.id)}`,
        search: '',
        hash: '',
      };
    case 'list': {
      const spec = LIST_PAGES[ref.resource];
      const params: Array<[string, string]> = Object.entries(
        spec.fixedParams ?? {},
      );
      if (ref.filter !== undefined) {
        params.push([spec.filterParam, ref.filter]);
      }
      if (ref.statusCategory !== undefined && spec.statusParam) {
        params.push([spec.statusParam, ref.statusCategory]);
      }
      return { pathname: spec.pathname, search: toSearch(params), hash: '' };
    }
  }
};

/**
 * The WebUI route for a resource reference: `path[?query][#hash]`, no origin.
 *
 * ```ts
 * resourcePath({ type: 'session', id: 'abc' });
 * // '/session?sessionDetail=abc'
 * resourcePath({ type: 'list', resource: 'user', statusCategory: 'INACTIVE' });
 * // '/admin/users?tab=users&status=INACTIVE'
 * ```
 */
export const resourcePath = (ref: ResourceRef): string => {
  const { pathname, search, hash } = resourceLocation(ref);
  return `${pathname}${search ? `?${search}` : ''}${hash}`;
};
