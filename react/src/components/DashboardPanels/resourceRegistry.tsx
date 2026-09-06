/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { resourceRegistryDeploymentQuery } from '../../__generated__/resourceRegistryDeploymentQuery.graphql';
import type { resourceRegistrySessionQuery } from '../../__generated__/resourceRegistrySessionQuery.graphql';
import type { resourceRegistryVfolderQuery } from '../../__generated__/resourceRegistryVfolderQuery.graphql';
import { convertToOrderBy } from '../../helper';
import { getSessionFilterProperties } from './sessionFilterProperties';
import type {
  PanelDescriptor,
  ResourceConfig,
  ResourceConnectionResult,
  ResourceKey,
  ResourceQueryArgs,
} from './types';
import { Badge } from '@astryxdesign/core/Badge';
import {
  badgeVariantForStatus,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { graphql } from 'react-relay';
import type { OperationType } from 'relay-runtime';

/**
 * One statically-compiled query per resource (Relay is compile-time). Adding a
 * resource = one entry here; the generic panel needs no per-resource code.
 * `session` intentionally uses the LEGACY `compute_session_nodes` graph +
 * `SessionNodesFragment` so the panel renders the sessions page's own table
 * component with identical behavior (any project member, ADR-0001 ambient
 * project); `vfolder` is V2 and superadmin-only via `minRole`.
 *
 * This is the REGULAR-USER dashboard, so admin-shaped data sources (users, and
 * anything else scoped to operating the cluster) do not belong here — they are
 * for the separate admin dashboard.
 * V2 resources use offset pagination (`limit`+`offset`) per
 * .claude/rules/graphql-pagination.md; the legacy connection uses its
 * historical `first`+`offset` offset mode (as the sessions page does).
 */

type SessionNode = NonNullable<
  NonNullable<
    NonNullable<
      resourceRegistrySessionQuery['response']['compute_session_nodes']
    >['edges'][number]
  >['node']
>;
type DeploymentNode = NonNullable<
  resourceRegistryDeploymentQuery['response']['myDeployments']
>['edges'][number]['node'];
type VfolderNode = NonNullable<
  resourceRegistryVfolderQuery['response']['adminVfoldersV2']
>['edges'][number]['node'];

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('lll') : '-';

// Offset-pagination variables shared by the unscoped admin connections; the
// project-scoped session query adds `scope` itself.
const makeOffsetVariables =
  <Q extends OperationType>(): ResourceConfig<Q, unknown>['buildVariables'] =>
  ({ filter, order, limit, offset }: ResourceQueryArgs) =>
    ({
      // V2 filters are GraphQLFilter objects; a (session-style) string never
      // reaches a V2 resource, but guard anyway.
      filter: typeof filter === 'string' ? undefined : (filter ?? undefined),
      orderBy: convertToOrderBy(order ?? null),
      limit,
      offset,
    }) as Q['variables'];

// Normalize a V2 offset connection ({ count, edges { node } }) to the panel's rows.
const selectOffsetConnection = <T extends Record<string, any>>(
  connection:
    | { count: number; edges: ReadonlyArray<{ node: T } | null | undefined> }
    | null
    | undefined,
): ResourceConnectionResult<T> | null =>
  connection
    ? {
        count: connection.count,
        nodes: filterOutNullAndUndefined(connection.edges.map((e) => e?.node)),
      }
    : null;

const sessionConfig: ResourceConfig<resourceRegistrySessionQuery, SessionNode> =
  {
    key: 'session',
    labelKey: 'webui.menu.Sessions',
    defaultOrder: '-created_at',
    kind: 'sessionNodes',
    query: graphql`
      query resourceRegistrySessionQuery(
        $scopeId: ScopeField
        $first: Int
        $offset: Int
        $filter: String
        $order: String
      ) {
        compute_session_nodes(
          scope_id: $scopeId
          first: $first
          offset: $offset
          filter: $filter
          order: $order
        ) {
          count
          edges {
            node {
              id
              ...SessionNodesFragment
            }
          }
        }
      }
    `,
    // Same condition language as the sessions page's filter, over every field
    // the manager's queryfilter accepts.
    getStringFilterProperties: getSessionFilterProperties,
    buildVariables: ({ filter, order, limit, offset, projectId }) => ({
      scopeId: `project:${projectId}`,
      first: limit,
      offset,
      filter: typeof filter === 'string' && filter ? filter : undefined,
      order: order ?? '-created_at',
    }),
    // Legacy connection: count and nodes are individually nullable.
    selectConnection: (data) => {
      const connection = data.compute_session_nodes;
      return connection
        ? {
            count: connection.count ?? 0,
            nodes: filterOutNullAndUndefined(
              connection.edges.map((e) => e?.node),
            ),
          }
        : null;
    },
  };

const deploymentConfig: ResourceConfig<
  resourceRegistryDeploymentQuery,
  DeploymentNode
> = {
  key: 'deployment',
  labelKey: 'webui.menu.Deployments',
  defaultOrder: '-createdAt',
  kind: 'deploymentNodes',
  // `myDeployments` narrowed to the current project, exactly as the user-facing
  // DeploymentListPage does. The project-scoped `projectDeployments` field is
  // what the project-ADMIN page uses, so it is not the regular-member path.
  query: graphql`
    query resourceRegistryDeploymentQuery(
      $filter: DeploymentFilter
      $orderBy: [DeploymentOrderBy!]
      $limit: Int
      $offset: Int
    ) {
      myDeployments(
        filter: $filter
        orderBy: $orderBy
        limit: $limit
        offset: $offset
      ) {
        count
        edges {
          node {
            id
            ...BAIModelDeploymentNodesFragment
          }
        }
      }
    }
  `,
  // Same properties the user-facing deployments page offers.
  getFilterProperties: (t) => [
    { key: 'name', propertyLabel: t('deployment.filter.Name'), type: 'string' },
    { key: 'tags', propertyLabel: t('deployment.filter.Tags'), type: 'string' },
    {
      key: 'endpointUrl',
      propertyLabel: t('deployment.filter.EndpointUrl'),
      type: 'string',
    },
    {
      key: 'openToPublic',
      propertyLabel: t('deployment.filter.OpenToPublic'),
      type: 'boolean',
    },
  ],
  buildVariables: ({ filter, order, limit, offset, projectId }) => ({
    filter: {
      ...(typeof filter === 'string' ? {} : (filter ?? {})),
      ...(projectId ? { projectId: { equals: projectId } } : {}),
    },
    orderBy: convertToOrderBy(order ?? null),
    limit,
    offset,
  }),
  selectConnection: (data) => selectOffsetConnection(data.myDeployments),
};

const vfolderConfig: ResourceConfig<resourceRegistryVfolderQuery, VfolderNode> =
  {
    key: 'vfolder',
    labelKey: 'webui.menu.Data&Storage',
    defaultOrder: '-createdAt',
    minRole: 'superadmin',
    query: graphql`
      query resourceRegistryVfolderQuery(
        $filter: VFolderFilter
        $orderBy: [VFolderOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        adminVfoldersV2(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              host
              status
              metadata {
                name
                usageMode
                createdAt
              }
            }
          }
        }
      }
    `,
    getFilterProperties: (t) => [
      { key: 'name', propertyLabel: t('data.folders.Name'), type: 'string' },
      {
        key: 'host',
        propertyLabel: t('data.folders.Location'),
        type: 'string',
      },
    ],
    getColumns: (t) => [
      {
        key: 'name',
        dataIndex: 'name',
        title: t('data.folders.Name'),
        sorter: true,
        render: (_value, record) => record.metadata?.name,
      },
      {
        key: 'host',
        dataIndex: 'host',
        title: t('data.folders.Location'),
        sorter: true,
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: t('general.Status'),
        sorter: true,
        minWidth: 140,
        render: (_value, record) =>
          record.status ? (
            <Badge
              label={record.status}
              variant={badgeVariantForStatus('vfolder', record.status)}
            />
          ) : null,
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        title: t('general.CreatedAt'),
        sorter: true,
        render: (_value, record) => formatDate(record.metadata?.createdAt),
      },
    ],
    buildVariables: makeOffsetVariables<resourceRegistryVfolderQuery>(),
    selectConnection: (data) => selectOffsetConnection(data.adminVfoldersV2),
  };

export const resourceRegistry: {
  [K in ResourceKey]: ResourceConfig<any, any>;
} = {
  session: sessionConfig,
  deployment: deploymentConfig,
  vfolder: vfolderConfig,
};

export const resourceKeys = Object.keys(resourceRegistry) as ResourceKey[];

/** Resources the given role may query (schema-enforced minRole). */
export const availableResourceKeys = (
  userRole: string | undefined,
): ResourceKey[] =>
  resourceKeys.filter((key) => {
    const minRole = resourceRegistry[key].minRole;
    if (!minRole) return true;
    if (minRole === 'superadmin') return userRole === 'superadmin';
    return userRole === 'superadmin' || userRole === 'admin';
  });

export const resolvePanelTitle = (
  descriptor: PanelDescriptor,
  t: TFunction,
): string => {
  if (descriptor.title) return descriptor.title;
  const config = resourceRegistry[descriptor.resourceType];
  return config ? t(config.labelKey) : descriptor.resourceType;
};
