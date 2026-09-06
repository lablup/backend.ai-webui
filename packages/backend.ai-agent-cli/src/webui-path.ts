/**
 * Deep-link rules mirroring the WebUI's routes and URL params (`routes.tsx`,
 * `pathBuilder.ts`, `legacyRedirects.tsx`). The CLI takes no dependency on the
 * host app, so the rules are restated here and pinned by
 * `webui-path.fixture.json`; a route or param rename in the app must be
 * followed by a fixture and rule update here.
 */

/** Session detail views. All three resolve to the same drawer URL today. */
export type SessionView = 'detail' | 'scheduling_history' | 'container_log';

/** Deployment detail views — encoded as the page's section hash. */
export type DeploymentView = 'detail' | 'revisions' | 'access_tokens';

/**
 * What a route's `handle.access` demands of the caller (`useRouteAccess.ts`).
 * `'user'` stands for the app's *absent* handle — open to any authenticated
 * account — so every page has a value here and none is silently unmarked.
 */
export type RouteAccess = 'superadmin' | 'admin' | 'projectAdmin' | 'user';

/** List resources whose page exposes a status/category URL param. */
export const LIST_RESOURCES_WITH_STATUS = [
  'session',
  'deployment',
  'vfolder',
  'role',
  'artifact',
  'agent',
  'user',
  'keypair',
  'project',
] as const;

/** List resources whose page has no status param at all. */
export const LIST_RESOURCES_WITHOUT_STATUS = [
  'model_card',
  'environment',
  'my_environment',
  'resource_preset',
  'resource_group',
] as const;

export type ListResourceWithStatus =
  (typeof LIST_RESOURCES_WITH_STATUS)[number];
export type ListResourceWithoutStatus =
  (typeof LIST_RESOURCES_WITHOUT_STATUS)[number];
export type ListResource = ListResourceWithStatus | ListResourceWithoutStatus;

/**
 * A reference to something the UI can open. `agent`, `user`, `keypair`,
 * `project`, `resource_preset` and `resource_group` have list entries but no
 * detail member: their pages carry no per-row URL param.
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
  | {
      type: 'list';
      resource: ListResourceWithoutStatus;
      filter?: string;
      statusCategory?: never;
    };

export interface ResourceLocation {
  pathname: string;
  /** Query string WITHOUT the leading `?`. Empty when there are no params. */
  search: string;
  /** Section hash INCLUDING the leading `#`. Empty when there is none. */
  hash: string;
}

interface ListPageSpec {
  pathname: string;
  /** The route's `handle.access`, or `'user'` where the app declares none. */
  access: RouteAccess;
  /** Params that select the resource's surface on a shared page (e.g. a tab). */
  fixedParams?: Readonly<Record<string, string>>;
  /** Absent when the page parses no free-text filter — a `filter` is dropped. */
  filterParam?: string;
  statusParam?: string;
}

/**
 * `list` resource -> its page, the access that page's route demands and the URL
 * params the page actually parses.
 *
 * `access` is read off `routes.tsx`: the `/admin/*` subtree declares
 * `handle: { access: 'admin' }` and several leaves under it raise that to
 * `'superadmin'`; the project subtree's `/project/:name/admin/*` declares
 * `'projectAdmin'`; everything else declares nothing, which the app treats as
 * open to any authenticated account and this table spells `'user'`.
 */
export const LIST_PAGES: Readonly<Record<ListResource, ListPageSpec>> = {
  session: {
    pathname: '/session',
    access: 'user',
    filterParam: 'filter',
    statusParam: 'statusCategory',
  },
  deployment: {
    pathname: '/deployments',
    access: 'user',
    filterParam: 'filter',
    statusParam: 'statusCategory',
  },
  vfolder: {
    pathname: '/data',
    access: 'user',
    filterParam: 'filter',
    statusParam: 'statusCategory',
  },
  model_card: { pathname: '/model-store', access: 'user', filterParam: 'filter' },
  my_environment: {
    // The caller's OWN customized images (`MyEnvironmentPage.tsx` ->
    // `CustomizedImageList.tsx`, which queries `customized_images`). Its one
    // tab defaults to `image` and its search box is component state, so there
    // is no param worth pinning.
    pathname: '/my-environment',
    access: 'user',
  },
  // Images / resource presets / registries share one admin page, tabbed.
  environment: {
    pathname: '/admin/environment',
    access: 'admin',
    filterParam: 'filter',
  },
  role: {
    pathname: '/admin/rbac',
    access: 'superadmin',
    filterParam: 'filter',
    statusParam: 'status',
  },
  artifact: {
    pathname: '/admin/reservoir',
    access: 'admin',
    filterParam: 'filter',
    statusParam: 'mode',
  },
  agent: {
    pathname: '/admin/agent',
    access: 'superadmin',
    fixedParams: { tab: 'agents' },
    filterParam: 'filter',
    statusParam: 'status',
  },
  user: {
    pathname: '/admin/users',
    access: 'admin',
    fixedParams: { tab: 'users' },
    filterParam: 'filter',
    statusParam: 'status',
  },
  keypair: {
    // Same page as `user`, other tab — and the credentials tab spells its
    // status segment `activeType`, not `status`.
    pathname: '/admin/users',
    access: 'admin',
    fixedParams: { tab: 'credentials' },
    filterParam: 'filter',
    statusParam: 'activeType',
  },
  project: {
    // Single-tab page, so no tab param — `ProjectPage.tsx` parses `filter`
    // and a `status` of active | inactive.
    pathname: '/admin/project',
    access: 'superadmin',
    filterParam: 'filter',
    statusParam: 'status',
  },
  resource_preset: {
    // Presets are the environment page's second tab (`EnvironmentPage.tsx`).
    pathname: '/admin/environment',
    access: 'admin',
    fixedParams: { tab: 'preset' },
  },
  resource_group: {
    // Resource groups are the resources page's third tab (`ResourcesPage.tsx`).
    pathname: '/admin/agent',
    access: 'superadmin',
    fixedParams: { tab: 'resourceGroup' },
  },
};

/**
 * The access each **detail** page's route demands, same source as `LIST_PAGES`.
 * `role` lives on `/admin/rbac` and `artifact` on `/admin/reservoir/:id`; the
 * rest are project-scope pages with no `access` handle.
 */
const DETAIL_PAGE_ACCESS: Readonly<
  Record<Exclude<ResourceRef['type'], 'list'>, RouteAccess>
> = {
  session: 'user',
  vfolder: 'user',
  deployment: 'user',
  model_card: 'user',
  role: 'superadmin',
  artifact: 'admin',
};

export const SESSION_DETAIL_PARAM = 'sessionDetail';
export const VFOLDER_PARAM = 'folder';
export const VFOLDER_PATH_PARAM = 'path';
export const MODEL_CARD_PARAM = 'modelCard';
export const ROLE_DETAIL_PARAM = 'roleDetail';

const DEPLOYMENT_VIEW_HASH: Readonly<Record<DeploymentView, string>> = {
  detail: '',
  revisions: '#revisions',
  access_tokens: '#access-tokens',
};

export const SESSION_VIEW_NOTE =
  'session views share one URL: the drawer is the only addressable surface';

const toSearch = (params: Array<[string, string]>): string =>
  params.length === 0 ? '' : new URLSearchParams(params).toString();

/** Resolves a resource reference to `pathname` / `search` / `hash`. */
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
      if (ref.filter !== undefined && spec.filterParam) {
        params.push([spec.filterParam, ref.filter]);
      }
      if (ref.statusCategory !== undefined && spec.statusParam) {
        params.push([spec.statusParam, ref.statusCategory]);
      }
      return { pathname: spec.pathname, search: toSearch(params), hash: '' };
    }
  }
};

/** The WebUI route for a resource reference: `path[?query][#hash]`, no origin. */
export const resourcePath = (ref: ResourceRef): string => {
  const { pathname, search, hash } = resourceLocation(ref);
  return `${pathname}${search ? `?${search}` : ''}${hash}`;
};

/** The bare list page for a resource — the "go do it in the UI" destination. */
export const listPath = (resource: ListResource): string =>
  resourcePath({ type: 'list', resource } as ResourceRef);

/**
 * What the WebUI will demand of whoever opens this reference. `'user'` means
 * the page is open to any authenticated account; anything else means a link to
 * it should say so, because a caller allowed to run the query is not
 * necessarily allowed to open the page it points at.
 */
export const resourceAccess = (ref: ResourceRef): RouteAccess =>
  ref.type === 'list'
    ? LIST_PAGES[ref.resource].access
    : DETAIL_PAGE_ACCESS[ref.type];

/** The access the bare list page for a resource demands. */
export const listAccess = (resource: ListResource): RouteAccess =>
  LIST_PAGES[resource].access;

/** `webuiUrl('https://ui.example.com/', '/session?x=1')` -> absolute URL. */
export const webuiUrl = (webuiOrigin: string, path: string): string => {
  let end = webuiOrigin.length;
  while (end > 0 && webuiOrigin[end - 1] === '/') end -= 1;
  return `${webuiOrigin.slice(0, end)}${path}`;
};
