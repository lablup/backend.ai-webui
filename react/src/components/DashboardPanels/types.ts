/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BAIBoardItem } from '../BAIBoard';
import type {
  BAIColumnsType,
  BAIGraphQLFilterProperty,
  GraphQLFilter,
} from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import type { GraphQLTaggedNode, OperationType } from 'relay-runtime';

/**
 * The decoupled-dashboard "query-as-config" engine.
 *
 * A panel is described by a serializable {@link PanelDescriptor} (which resource,
 * which filter, which order) — never by JSX. The descriptor is persisted as-is to
 * localStorage and resolved at render time against the {@link ResourceConfig}
 * registry. The same descriptor can later drive a full-page explorer, a URL link,
 * or an AI-emitted spec without changing the render path.
 */

/** Resource types available to the engine. Strawberry V2 typed connections only. */
export type ResourceKey = 'session' | 'user' | 'vfolder';

/** Panel kinds the registry can render. v1 ships only the table view. */
export type PanelType = 'resourceTable';

/**
 * Serializable, persisted per-panel configuration. MUST stay plain JSON (no JSX,
 * functions, or class instances) so it survives the localStorage round-trip.
 */
export interface PanelDescriptor {
  resourceType: ResourceKey;
  /** Optional override for the panel header; falls back to the resource label. */
  title?: string;
  /** The `BAIGraphQLPropertyFilter` value, verbatim. */
  filter?: GraphQLFilter | null;
  /** Sort order string, e.g. `'-createdAt'`; falls back to the resource default. */
  order?: string | null;
}

/** The fields the "Add panel" flow collects before creating a panel. */
export type AddPanelInput = Pick<
  PanelDescriptor,
  'resourceType' | 'filter' | 'title'
>;

/**
 * A persisted panel = the Cloudscape board layout fields (id/rowSpan/columnSpan/
 * columnOffset/definition, mirrored from {@link BAIBoardItem} minus its runtime
 * `data`) plus the serializable panel identity. The list of these IS the source
 * of truth for the board (no diff against an in-code defaults array), which is
 * what fixes the legacy resurrection bug.
 */
export type PersistedPanel = Omit<BAIBoardItem, 'data'> & {
  panelType: PanelType;
  descriptor: PanelDescriptor;
};

/** Inputs the generic executor hands to a resource's `buildVariables`. */
export interface ResourceQueryArgs {
  filter?: GraphQLFilter;
  order?: string | null;
  limit: number;
  offset: number;
}

/** Normalized connection slice the executor renders. */
export interface ResourceConnectionResult<TNode> {
  count: number;
  nodes: ReadonlyArray<TNode>;
}

/**
 * Non-serializable registry entry — one per {@link ResourceKey}. Holds the
 * statically-compiled Relay query (Relay is compile-time, so each resource ships
 * its own query) plus the per-resource glue the generic panel needs.
 */
export interface ResourceConfig<
  TQuery extends OperationType = OperationType,
  TNode = unknown,
> {
  key: ResourceKey;
  /** i18n key for the resource's display label. */
  labelKey: string;
  /** Statically-defined `graphql` query. */
  query: GraphQLTaggedNode;
  /** Default sort order string when the descriptor doesn't specify one. */
  defaultOrder: string;
  /** Properties offered to `BAIGraphQLPropertyFilter`, built with the host `t`. */
  getFilterProperties: (
    t: TFunction,
  ) => ReadonlyArray<BAIGraphQLFilterProperty>;
  /** Columns for the table, built with the host `t` so titles are translated. */
  getColumns: (t: TFunction) => BAIColumnsType<TNode>;
  /** Maps query args into the typed Relay variables for this resource. */
  buildVariables: (args: ResourceQueryArgs) => TQuery['variables'];
  /** Extracts the normalized `{ count, nodes }` slice from the query response. */
  selectConnection: (
    data: TQuery['response'],
  ) => ResourceConnectionResult<TNode> | null | undefined;
}
