/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  BAIColumnsType,
  BAIGraphQLFilterProperty,
  FilterProperty,
  GraphQLFilter,
} from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import type { GraphQLTaggedNode, OperationType } from 'relay-runtime';

/**
 * The decoupled-dashboard "query-as-config" engine: a panel is a serializable
 * {@link PanelDescriptor} (which resource, which condition, which order — never
 * JSX), persisted to localStorage and resolved at render time against the
 * {@link ResourceConfig} registry. The same descriptor can later drive charts or
 * an AI-emitted spec without changing the render path.
 */

/** Data sources a panel can list. Regular-user scope: no admin-only resources. */
export type ResourceKey = 'session' | 'deployment' | 'vfolder';

/** Panel kinds the registry can render. v1 ships the table view. */
export type PanelType = 'resourceTable';

/**
 * Serializable, persisted per-panel configuration. MUST stay plain JSON (no JSX,
 * functions, or class instances) so it survives the localStorage round-trip.
 * The condition is expressed to users through the panel TITLE — panels render no
 * filter UI; the descriptor changes only through the panel modal.
 */
export interface PanelDescriptor {
  resourceType: ResourceKey;
  /** Optional override for the panel header; falls back to the resource label. */
  title?: string;
  /**
   * The condition, verbatim from the modal's filter control: a `GraphQLFilter`
   * object for V2 resources, or the minilang filter STRING for `sessionNodes`
   * resources (same language the sessions page uses).
   */
  filter?: GraphQLFilter | string | null;
  /** Sort order string, e.g. `'-createdAt'`; falls back to the resource default. */
  order?: string | null;
}

/** The fields the panel modal collects when creating or editing a panel. */
export type PanelInput = Pick<
  PanelDescriptor,
  'resourceType' | 'filter' | 'title' | 'order'
>;

/**
 * A persisted custom panel: identity + serializable descriptor only. Layout
 * (order/spans/offset) for the WHOLE board — built-in and custom alike — is
 * owned solely by the unified `dashboard_board_items` list.
 */
export interface PersistedPanel {
  id: string;
  panelType: PanelType;
  descriptor: PanelDescriptor;
}

/** Inputs the generic executor hands to a resource's `buildVariables`. */
export interface ResourceQueryArgs {
  filter?: GraphQLFilter | string;
  order?: string | null;
  limit: number;
  offset: number;
  /** Ambient project scope (ADR-0001) for project-scoped connections. */
  projectId: string;
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
  /**
   * Minimum role required to run this resource's connection (schema-enforced).
   * Undefined = any project member.
   */
  minRole?: 'superadmin' | 'admin';
  /**
   * Render the list PAGE's own table component instead of the generic one, for
   * behavioral parity with that page — name click, badges, column settings.
   * Undefined = generic V2 table built from `getColumns`.
   */
  kind?: 'sessionNodes' | 'deploymentNodes';
  /** Properties offered to `BAIGraphQLPropertyFilter`, built with the host `t`. */
  getFilterProperties?: (
    t: TFunction,
  ) => ReadonlyArray<BAIGraphQLFilterProperty>;
  /** Properties for `BAIPropertyFilter` (string filter) — `kind: 'sessionNodes'`. */
  getStringFilterProperties?: (t: TFunction) => Array<FilterProperty>;
  /** Columns for the generic table (unused for `kind: 'sessionNodes'`). */
  getColumns?: (t: TFunction) => BAIColumnsType<TNode>;
  /** Maps query args into the typed Relay variables for this resource. */
  buildVariables: (args: ResourceQueryArgs) => TQuery['variables'];
  /** Extracts the normalized `{ count, nodes }` slice from the query response. */
  selectConnection: (
    data: TQuery['response'],
  ) => ResourceConnectionResult<TNode> | null | undefined;
}
