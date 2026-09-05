import type { SchemaField, SchemaIndex } from '../search/schema-sdl.js';
import type { ListResource, ResourceRef, RouteAccess } from '../webui-path.js';
import {
  listAccess,
  listPath,
  resourceAccess,
  resourcePath,
  webuiUrl,
} from '../webui-path.js';

/** Resource kinds a GraphQL result can be deep-linked to. */
export type LinkedResource = Extract<
  ResourceRef,
  { id: string }
>['type'];

/**
 * GraphQL type name -> the WebUI page its rows open on.
 *
 * Deliberately **small and hand-maintained**: only types whose page takes a
 * per-row URL param are here, so an unrecognised type produces no link rather
 * than a guessed one. Both the Graphene (`*Node`, `Item`) and the Strawberry
 * (`V2`) spellings are listed because the two subgraphs name the same resource
 * differently. Add a row when a page gains an addressable row.
 */
export const RESOURCE_BY_TYPE: Readonly<Record<string, LinkedResource>> = {
  // session — /session?sessionDetail=<id>
  ComputeSessionNode: 'session',
  ComputeSession: 'session',
  SessionV2: 'session',
  // vfolder — /data?folder=<id>
  VirtualFolderNode: 'vfolder',
  VirtualFolder: 'vfolder',
  VFolder: 'vfolder',
  // deployment — /deployments/<id>
  Endpoint: 'deployment',
  EndpointNode: 'deployment',
  // model card — /model-store?modelCard=<id>
  ModelCard: 'model_card',
  ModelCardV2: 'model_card',
  // role — /admin/rbac?roleDetail=<id>
  Role: 'role',
  RoleNode: 'role',
  // artifact — /admin/reservoir/<id>
  Artifact: 'artifact',
  ArtifactNode: 'artifact',
};

/**
 * GraphQL type name -> the list page its rows live on, for resources whose page
 * carries **no** per-row URL param. Consulted only when `RESOURCE_BY_TYPE` has
 * no row link to give, and it yields ONE link per root field, not per row.
 */
export const LIST_RESOURCE_BY_TYPE: Readonly<Record<string, ListResource>> = {
  // users — /admin/users?tab=users
  User: 'user',
  UserNode: 'user',
  UserV2: 'user',
  // keypairs — /admin/users?tab=credentials
  KeyPair: 'keypair',
  KeyPairV2: 'keypair',
  // agents — /admin/agent?tab=agents
  Agent: 'agent',
  AgentNode: 'agent',
  AgentV2: 'agent',
  // resource groups — /admin/agent?tab=resourceGroup
  ScalingGroup: 'resource_group',
  ResourceGroup: 'resource_group',
  // projects (called groups on the Graphene subgraph) — /admin/project
  Group: 'project',
  GroupNode: 'project',
  ProjectV2: 'project',
  // resource presets — /admin/environment?tab=preset
  ResourcePreset: 'resource_preset',
  ResourcePresetV2: 'resource_preset',
  // images — /admin/environment, whose default tab is the image list
  Image: 'environment',
  ImageNode: 'environment',
  ImageV2: 'environment',
};

/**
 * Root fields the manager scopes to the **calling account**, overriding what
 * `LIST_RESOURCE_BY_TYPE` would say from the row type alone. The row type is
 * shared with the admin-wide field (`myKeypairs` and `adminKeypairsV2` both
 * resolve to `KeyPairV2`), so the distinction only exists at the field.
 *
 * `null` means "emit no link": the rows are the caller's own, but no page in
 * the app lists them for a non-admin, and a wrong link is worse than none.
 *
 * - `myKeypairs` -> null. The only keypair list is the credentials tab of
 *   `/admin/users`, which the `/admin/*` subtree gates on domain admin.
 *   `/my-environment` is NOT it: that page renders `CustomizedImageList`
 *   only — images, no keypairs (`MyEnvironmentPage.tsx`).
 * - `customized_images` -> `/my-environment`, which is exactly the page that
 *   runs this field (`CustomizedImageList.tsx`). Its rows are `ImageNode`, so
 *   the type table would otherwise send a regular account to the admin-only
 *   `/admin/environment`.
 */
export const SELF_SCOPED_LIST_BY_ROOT_FIELD: Readonly<
  Record<string, ListResource | null>
> = {
  myKeypairs: null,
  customized_images: 'my_environment',
};

/**
 * Id fields checked on a node, in **preference** order. `row_id` first: most
 * WebUI pages take the raw UUID, not the base64 Relay global id that `id`
 * carries. (The truncator protects the same names — see `UNCUTTABLE_KEYS` —
 * but that list is about what may be cut, not which id wins.)
 */
export const ID_FIELDS = ['row_id', 'endpoint_id', 'id'] as const;

/**
 * The id form each detail page's URL param takes. A `uuid` page reads the raw
 * uuid and opens nothing when handed a global id; `/admin/rbac` matches
 * `roleDetail` against the node's global `id` (`RBACManagementPage.tsx`).
 */
export const ID_FORM: Readonly<Record<LinkedResource, 'uuid' | 'global'>> = {
  session: 'uuid',
  vfolder: 'uuid',
  deployment: 'uuid',
  model_card: 'uuid',
  artifact: 'uuid',
  role: 'global',
};

/** Annotated on a node whose id cannot produce a link the page would open. */
export const NO_LINK_HINT =
  'no WebUI link: this id is neither a uuid nor a Relay global id — select row_id';

const UUID =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32})$/i;

const GLOBAL_ID = /^[A-Za-z_][A-Za-z0-9_]*:(.+)$/;

/**
 * The id to put in a `uuid` page's URL. A Relay global id is base64 of
 * `<TypeName>:<uuid>`, which those pages reject, so it is decoded; a value
 * that is neither yields no link rather than one that opens nothing.
 */
export function resolveLinkId(
  resource: LinkedResource,
  raw: string,
): string | undefined {
  if (ID_FORM[resource] === 'global' || UUID.test(raw)) return raw;
  const inner = GLOBAL_ID.exec(
    Buffer.from(raw, 'base64').toString('utf8'),
  )?.[1];
  return inner !== undefined && UUID.test(inner) ? inner : undefined;
}

export interface QueryLink {
  /** JSON path of the annotated node inside `data.result`. */
  path: string;
  resource: LinkedResource | ListResource;
  /** Absent on a list link: the page has no per-row URL param to carry. */
  id?: string;
  webui_path: string;
  webui_url?: string;
  /**
   * The role the destination page demands, when it demands one. Omitted for a
   * page open to any authenticated account, so the field's presence alone is
   * the "warn the user before handing this over" signal.
   */
  requires?: Exclude<RouteAccess, 'user'>;
}

/** `{ requires }` for a page that gates, `{}` for one that does not. */
const requiresOf = (
  access: RouteAccess,
): { requires?: Exclude<RouteAccess, 'user'> } =>
  access === 'user' ? {} : { requires: access };

const fieldOf = (
  schema: SchemaIndex,
  typeName: string,
  fieldName: string,
): SchemaField | undefined =>
  schema.byName.get(typeName)?.fields.find((field) => field.name === fieldName);

/** `[X]`, `[X!]!`, … — a printed type reference carrying a list wrapper. */
const isListType = (printed: string): boolean => printed.includes('[');

/**
 * A row type a root field resolves to, plus whether the way there ran through
 * a list. That is what separates a root field returning MANY rows from one
 * returning a single object of the same type — `Query.user_nodes` and
 * `Query.user` both resolve to `User`.
 */
interface RowTypeCandidate {
  typeName: string;
  listShaped: boolean;
}

/**
 * The row types a root field can resolve to, in match order: the field's own
 * type, then the one container level the schema uses — a Graphene `*List`
 * (`items`), a Relay `*Connection` (`edges { node }`), or a single-field
 * Strawberry `*Payload`, which is unambiguous enough to unwrap.
 */
function rowTypeCandidates(
  schema: SchemaIndex,
  rootTypeName: 'Query' | 'Mutation',
  fieldName: string,
): RowTypeCandidate[] {
  const root = fieldOf(schema, rootTypeName, fieldName);
  if (!root) return [];
  const named = root.namedType;
  const candidates: RowTypeCandidate[] = [
    { typeName: named, listShaped: isListType(root.type) },
  ];

  const items = fieldOf(schema, named, 'items');
  if (items) {
    candidates.push({
      typeName: items.namedType,
      listShaped: isListType(items.type),
    });
  }

  const edges = fieldOf(schema, named, 'edges');
  const node = edges ? fieldOf(schema, edges.namedType, 'node') : undefined;
  if (edges && node) {
    candidates.push({
      typeName: node.namedType,
      listShaped: isListType(edges.type),
    });
  }

  const only = schema.byName.get(named)?.fields;
  if (only?.length === 1) {
    candidates.push({
      typeName: only[0].namedType,
      listShaped: isListType(only[0].type),
    });
  }

  return candidates;
}

const lookupRootField = <T>(
  table: Readonly<Record<string, T>>,
  schema: SchemaIndex,
  rootTypeName: 'Query' | 'Mutation',
  fieldName: string,
  /** Skip candidates the root field reaches with no list on the way. */
  listShapedOnly = false,
): T | undefined => {
  for (const candidate of rowTypeCandidates(schema, rootTypeName, fieldName)) {
    if (listShapedOnly && !candidate.listShaped) continue;
    const hit = table[candidate.typeName];
    if (hit) return hit;
  }
  return undefined;
};

/** The resource a root field's rows deep-link to, one row per link. */
export function resourceForRootField(
  schema: SchemaIndex,
  rootTypeName: 'Query' | 'Mutation',
  fieldName: string,
): LinkedResource | undefined {
  return lookupRootField(RESOURCE_BY_TYPE, schema, rootTypeName, fieldName);
}

/**
 * The list page a root field's rows live on, when they have no detail page.
 *
 * List-shaped root fields only. A list-page link answers "where do these rows
 * live", which a singular field (`Query.user: User`) never asked; and several
 * of these pages are admin-only, so a regular account running a query it is
 * allowed to run would get a link it cannot open.
 */
export function listResourceForRootField(
  schema: SchemaIndex,
  rootTypeName: 'Query' | 'Mutation',
  fieldName: string,
): ListResource | undefined {
  if (rootTypeName === 'Query') {
    const scoped = SELF_SCOPED_LIST_BY_ROOT_FIELD[fieldName];
    if (scoped !== undefined) return scoped ?? undefined;
  }
  return lookupRootField(
    LIST_RESOURCE_BY_TYPE,
    schema,
    rootTypeName,
    fieldName,
    true,
  );
}

const refFor = (resource: LinkedResource, id: string): ResourceRef =>
  ({ type: resource, id }) as ResourceRef;

const idOf = (node: Record<string, unknown>): string | undefined => {
  for (const field of ID_FIELDS) {
    const value = node[field];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
};

/**
 * Annotates every identifiable node under `value` with `webui_path` (and
 * `webui_url` when an origin is known), **in place**.
 *
 * "Identifiable" is one of `ID_FIELDS` carrying a non-empty string that
 * `resolveLinkId` can turn into the id the page takes; a node whose id it
 * refuses gets `webui_link_hint` instead of a link that opens nothing. The
 * walk does not descend into a node it saw an id on: the first object with an
 * id under a root field IS the row, and its children belong to other types.
 */
export function annotateLinks(
  value: unknown,
  resource: LinkedResource,
  rootPath: string,
  webuiOrigin: string | undefined,
): QueryLink[] {
  const links: QueryLink[] = [];
  const walk = (node: unknown, path: string): void => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const object = node as Record<string, unknown>;
    const raw = idOf(object);
    if (raw !== undefined) {
      const id = resolveLinkId(resource, raw);
      if (id === undefined) {
        object.webui_link_hint = NO_LINK_HINT;
        return;
      }
      const ref = refFor(resource, id);
      const path_ = resourcePath(ref);
      const link: QueryLink = {
        path,
        resource,
        id,
        webui_path: path_,
        ...(webuiOrigin ? { webui_url: webuiUrl(webuiOrigin, path_) } : {}),
        ...requiresOf(resourceAccess(ref)),
      };
      object.webui_path = link.webui_path;
      if (link.webui_url) object.webui_url = link.webui_url;
      links.push(link);
      return;
    }
    for (const [key, item] of Object.entries(object)) {
      walk(item, path ? `${path}.${key}` : key);
    }
  };
  walk(value, rootPath);
  return links;
}

const SEGMENT = /[^.[\]]+|\[\d+\]/g;

/** Resolves a `a.b[0].c` path produced by `annotateLinks`. */
export function valueAtPath(root: unknown, path: string): unknown {
  let current = root;
  for (const segment of path.match(SEGMENT) ?? []) {
    if (current === null || typeof current !== 'object') return undefined;
    const key = segment.startsWith('[')
      ? Number(segment.slice(1, -1))
      : segment;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

/**
 * Links whose node survived the budget cut. Annotation runs before truncation
 * so `webui_path` counts against the budget rather than blowing past it; a
 * dropped row must then drop its link too, or `data.links` would advertise
 * something `data.result` no longer contains.
 */
export const survivingLinks = (
  links: QueryLink[],
  truncatedResult: unknown,
): QueryLink[] =>
  links.filter((link) => valueAtPath(truncatedResult, link.path) !== undefined);

/**
 * The list-page link for one root field. Carries no `id` and annotates no row:
 * the page it points at addresses no single row.
 */
export function listLink(
  resource: ListResource,
  rootPath: string,
  webuiOrigin: string | undefined,
): QueryLink {
  const path = listPath(resource);
  return {
    path: rootPath,
    resource,
    webui_path: path,
    ...(webuiOrigin ? { webui_url: webuiUrl(webuiOrigin, path) } : {}),
    ...requiresOf(listAccess(resource)),
  };
}

/**
 * Empty enough that a list link would point at rows the result does not have.
 * Besides a null and a bare `[]`, that covers the two containers the schema
 * wraps rows in: a Relay connection (`edges`) and a Graphene list (`items`).
 * Conservative on purpose — an object carrying neither key says nothing about
 * emptiness, so it keeps its link.
 */
const isEmptyRootField = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value !== 'object') return false;
  const container = value as Record<string, unknown>;
  for (const key of ['edges', 'items'] as const) {
    const rows = container[key];
    if (Array.isArray(rows)) return rows.length === 0;
  }
  return false;
};

/**
 * Annotates each root field of a result whose return type maps to a page: one
 * link per row where the page addresses rows, else one link to the list page.
 * Root fields with no mapping are left untouched.
 *
 * A result object is keyed by **response key**, which is the alias when the
 * document gave one — so `fieldNameByResponseKey` (from `parseDocument`) is
 * what turns a key back into the schema field every lookup here needs. Without
 * it `customized_images: images` would be read as the self-scoped field it is
 * aliased to, and `sessions: compute_session_nodes` would resolve nothing.
 * The map is optional and falls back to identity, which is exactly the
 * behaviour of a document that uses no aliases.
 *
 * `QueryLink.path` keeps using the response key: it points into the response.
 */
export function annotateResult(
  schema: SchemaIndex,
  rootTypeName: 'Query' | 'Mutation',
  result: unknown,
  webuiOrigin: string | undefined,
  fieldNameByResponseKey: Readonly<Record<string, string>> = {},
): QueryLink[] {
  if (result === null || typeof result !== 'object') return [];
  const links: QueryLink[] = [];
  for (const [responseKey, value] of Object.entries(
    result as Record<string, unknown>,
  )) {
    const field = fieldNameByResponseKey[responseKey] ?? responseKey;
    const resource = resourceForRootField(schema, rootTypeName, field);
    if (resource) {
      links.push(...annotateLinks(value, resource, responseKey, webuiOrigin));
      continue;
    }
    const listResource = listResourceForRootField(schema, rootTypeName, field);
    if (listResource && !isEmptyRootField(value)) {
      links.push(listLink(listResource, responseKey, webuiOrigin));
    }
  }
  return links;
}
