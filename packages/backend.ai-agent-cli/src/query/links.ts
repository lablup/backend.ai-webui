import type { SchemaIndex } from '../search/schema-sdl.js';
import type { ResourceRef } from '../webui-path.js';
import { resourcePath, webuiUrl } from '../webui-path.js';

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
 * Id fields checked on a node, in **preference** order. `row_id` first: the
 * WebUI pages take the raw UUID, not the base64 Relay global id that `id`
 * carries. (The truncator protects the same names — see `UNCUTTABLE_KEYS` —
 * but that list is about what may be cut, not which id wins.)
 */
export const ID_FIELDS = ['row_id', 'endpoint_id', 'id'] as const;

export interface QueryLink {
  /** JSON path of the annotated node inside `data.result`. */
  path: string;
  resource: LinkedResource;
  id: string;
  webui_path: string;
  webui_url?: string;
}

const namedFieldType = (
  schema: SchemaIndex,
  typeName: string,
  fieldName: string,
): string | undefined =>
  schema.byName
    .get(typeName)
    ?.fields.find((field) => field.name === fieldName)?.namedType;

/**
 * The resource a root field's rows belong to, unwrapping the one level of
 * container the schema uses: a Relay `*Connection` (`edges { node }`) or a
 * Graphene `*List` (`items`).
 */
export function resourceForRootField(
  schema: SchemaIndex,
  rootTypeName: 'Query' | 'Mutation',
  fieldName: string,
): LinkedResource | undefined {
  const named = namedFieldType(schema, rootTypeName, fieldName);
  if (!named) return undefined;
  const direct = RESOURCE_BY_TYPE[named];
  if (direct) return direct;

  const items = namedFieldType(schema, named, 'items');
  if (items && RESOURCE_BY_TYPE[items]) return RESOURCE_BY_TYPE[items];

  const edges = namedFieldType(schema, named, 'edges');
  const node = edges ? namedFieldType(schema, edges, 'node') : undefined;
  if (node && RESOURCE_BY_TYPE[node]) return RESOURCE_BY_TYPE[node];

  // Strawberry mutations return a single-field `*Payload` wrapper around the
  // thing they made, so one field is unambiguous enough to unwrap.
  const only = schema.byName.get(named)?.fields;
  return only?.length === 1 ? RESOURCE_BY_TYPE[only[0].namedType] : undefined;
}

const refFor = (resource: LinkedResource, id: string): ResourceRef =>
  ({ type: resource, id }) as ResourceRef;

/** A `Type:local-id` payload, once the base64 has been peeled off. */
const GLOBAL_ID_BODY = /^[A-Za-z][A-Za-z0-9_]*:.+$/;

/**
 * A Relay global id decoded to the local id the WebUI's URL params take —
 * `atob(id).split(':')[1]`, the same conversion the host does with
 * `toLocalId` before it opens a folder or a session. Anything that is not
 * base64 of `Type:id` is returned untouched, so a raw UUID passes through.
 *
 * This matters for the Strawberry types (`VFolder`, …), which expose only the
 * global `id`; the Graphene ones carry `row_id` and never reach here.
 */
export function toLocalId(value: string): string {
  let decoded: string;
  try {
    decoded = Buffer.from(value, 'base64').toString('utf8');
  } catch {
    return value;
  }
  if (!GLOBAL_ID_BODY.test(decoded)) return value;
  // Base64 decoding is lenient; re-encoding is what proves the input was one.
  const strip = (text: string): string => text.replace(/=+$/, '');
  if (strip(Buffer.from(decoded, 'utf8').toString('base64')) !== strip(value)) {
    return value;
  }
  return decoded.slice(decoded.indexOf(':') + 1);
}

const idOf = (node: Record<string, unknown>): string | undefined => {
  for (const field of ID_FIELDS) {
    const value = node[field];
    if (typeof value === 'string' && value.length > 0) {
      return field === 'id' ? toLocalId(value) : value;
    }
  }
  return undefined;
};

/**
 * Annotates every identifiable node under `value` with `webui_path` (and
 * `webui_url` when an origin is known), **in place**.
 *
 * "Identifiable" is one of `ID_FIELDS` carrying a non-empty string. The walk
 * does not descend into a node it annotated: the first object with an id under
 * a root field IS the row, and its children belong to other types.
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
    const id = idOf(object);
    if (id !== undefined) {
      const path_ = resourcePath(refFor(resource, id));
      const link: QueryLink = {
        path,
        resource,
        id,
        webui_path: path_,
        ...(webuiOrigin ? { webui_url: webuiUrl(webuiOrigin, path_) } : {}),
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
 * Annotates each root field of a result whose return type maps to a page.
 * Root fields with no mapping are left untouched.
 */
export function annotateResult(
  schema: SchemaIndex,
  rootTypeName: 'Query' | 'Mutation',
  result: unknown,
  webuiOrigin: string | undefined,
): QueryLink[] {
  if (result === null || typeof result !== 'object') return [];
  const links: QueryLink[] = [];
  for (const [field, value] of Object.entries(
    result as Record<string, unknown>,
  )) {
    const resource = resourceForRootField(schema, rootTypeName, field);
    if (!resource) continue;
    links.push(...annotateLinks(value, resource, field, webuiOrigin));
  }
  return links;
}
