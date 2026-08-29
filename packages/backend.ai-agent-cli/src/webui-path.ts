/**
 * Deep-link rules, duplicated from the WebUI's `react/src/helper/resourcePath.ts`
 * (FR-3759).
 *
 * The CLI ships without a dependency on the host app, so the rules cannot be
 * imported — they are restated here and pinned by `webui-path.fixture.json`,
 * a byte-for-byte copy of the host's `resourcePath.fixture.json`. Change one
 * side and the parity test fails.
 */

/** Session detail views. All three resolve to the same drawer URL today. */
export type SessionView = 'detail' | 'scheduling_history' | 'container_log';

/** Deployment detail views — encoded as the page's section hash. */
export type DeploymentView = 'detail' | 'revisions' | 'access_tokens';

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
] as const;

/** List resources whose page has no status param at all. */
export const LIST_RESOURCES_WITHOUT_STATUS = ['model_card'] as const;

export type ListResourceWithStatus =
  (typeof LIST_RESOURCES_WITH_STATUS)[number];
export type ListResourceWithoutStatus =
  (typeof LIST_RESOURCES_WITHOUT_STATUS)[number];
export type ListResource = ListResourceWithStatus | ListResourceWithoutStatus;

/**
 * A reference to something the UI can open. `agent`, `user` and `keypair` have
 * list entries but no detail member: their pages carry no per-row URL param.
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
  /** Params that select the resource's surface on a shared page (e.g. a tab). */
  fixedParams?: Readonly<Record<string, string>>;
  filterParam: string;
  statusParam?: string;
}

/** `list` resource -> its page and URL params, as the pages actually parse them. */
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

/** The WebUI route for a resource reference: `path[?query][#hash]`, no origin. */
export const resourcePath = (ref: ResourceRef): string => {
  const { pathname, search, hash } = resourceLocation(ref);
  return `${pathname}${search ? `?${search}` : ''}${hash}`;
};

/** The bare list page for a resource — the "go do it in the UI" destination. */
export const listPath = (resource: ListResource): string =>
  resourcePath({ type: 'list', resource } as ResourceRef);

/** `webuiUrl('https://ui.example.com/', '/session?x=1')` -> absolute URL. */
export const webuiUrl = (webuiOrigin: string, path: string): string =>
  `${webuiOrigin.replace(/\/+$/, '')}${path}`;
