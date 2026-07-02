/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { resourceRegistrySessionQuery } from '../../__generated__/resourceRegistrySessionQuery.graphql';
import type { resourceRegistryUserQuery } from '../../__generated__/resourceRegistryUserQuery.graphql';
import type { resourceRegistryVfolderQuery } from '../../__generated__/resourceRegistryVfolderQuery.graphql';
import { convertToOrderBy } from '../../helper';
import type {
  PanelDescriptor,
  ResourceConfig,
  ResourceConnectionResult,
  ResourceKey,
  ResourceQueryArgs,
} from './types';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { graphql } from 'react-relay';
import type { OperationType } from 'relay-runtime';

/**
 * Each resource ships ONE statically-compiled query (Relay is compile-time, so a
 * runtime-synthesized query is impossible). Adding a resource = adding one entry
 * here — the generic `ResourceTablePanel` needs no per-resource code.
 *
 * All three target unscoped Strawberry V2 typed connections
 * (`adminSessionsV2` / `adminUsersV2` / `adminVfoldersV2`) and use offset
 * pagination (`limit` + `offset`, never `first`) per .claude/rules/graphql-pagination.md.
 */

type SessionNode = NonNullable<
  resourceRegistrySessionQuery['response']['adminSessionsV2']
>['edges'][number]['node'];
type UserNode = NonNullable<
  resourceRegistryUserQuery['response']['adminUsersV2']
>['edges'][number]['node'];
type VfolderNode = NonNullable<
  resourceRegistryVfolderQuery['response']['adminVfoldersV2']
>['edges'][number]['node'];

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('lll') : '-';

// Offset-pagination query variables, shared by every resource. The filter/orderBy
// types are erased at runtime, so one builder serves all (cast per resource query).
const makeOffsetVariables =
  <Q extends OperationType>(): ResourceConfig<Q, unknown>['buildVariables'] =>
  ({ filter, order, limit, offset }: ResourceQueryArgs) =>
    ({
      filter: filter ?? undefined,
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
    defaultOrder: '-createdAt',
    query: graphql`
      query resourceRegistrySessionQuery(
        $filter: SessionV2Filter
        $orderBy: [SessionV2OrderBy!]
        $limit: Int
        $offset: Int
      ) {
        adminSessionsV2(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              metadata {
                name
              }
              lifecycle {
                status
                createdAt
              }
            }
          }
        }
      }
    `,
    getFilterProperties: (t) => [
      { key: 'name', propertyLabel: t('session.SessionName'), type: 'string' },
      { key: 'id', propertyLabel: 'ID', type: 'uuid' },
    ],
    getColumns: (t) => [
      {
        key: 'name',
        dataIndex: 'name',
        title: t('session.SessionName'),
        sorter: true,
        render: (_value, record) => record.metadata?.name,
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: t('general.Status'),
        sorter: true,
        render: (_value, record) => record.lifecycle?.status,
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        title: t('general.CreatedAt'),
        sorter: true,
        render: (_value, record) => formatDate(record.lifecycle?.createdAt),
      },
    ],
    buildVariables: makeOffsetVariables<resourceRegistrySessionQuery>(),
    selectConnection: (data) => selectOffsetConnection(data.adminSessionsV2),
  };

const userConfig: ResourceConfig<resourceRegistryUserQuery, UserNode> = {
  key: 'user',
  labelKey: 'webui.menu.Users',
  defaultOrder: '-createdAt',
  query: graphql`
    query resourceRegistryUserQuery(
      $filter: UserV2Filter
      $orderBy: [UserV2OrderBy!]
      $limit: Int
      $offset: Int
    ) {
      adminUsersV2(
        filter: $filter
        orderBy: $orderBy
        limit: $limit
        offset: $offset
      ) {
        count
        edges {
          node {
            id
            basicInfo {
              username
              email
            }
            status {
              status
            }
            timestamps {
              createdAt
            }
          }
        }
      }
    }
  `,
  getFilterProperties: (t) => [
    { key: 'email', propertyLabel: t('general.E-Mail'), type: 'string' },
    { key: 'username', propertyLabel: t('general.Username'), type: 'string' },
    { key: 'uuid', propertyLabel: 'ID', type: 'uuid' },
  ],
  getColumns: (t) => [
    {
      key: 'email',
      dataIndex: 'email',
      title: t('general.E-Mail'),
      sorter: true,
      render: (_value, record) => record.basicInfo?.email,
    },
    {
      key: 'username',
      dataIndex: 'username',
      title: t('general.Username'),
      sorter: true,
      render: (_value, record) => record.basicInfo?.username,
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: t('general.Status'),
      sorter: true,
      render: (_value, record) => record.status?.status,
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: t('general.CreatedAt'),
      sorter: true,
      render: (_value, record) => formatDate(record.timestamps?.createdAt),
    },
  ],
  buildVariables: makeOffsetVariables<resourceRegistryUserQuery>(),
  selectConnection: (data) => selectOffsetConnection(data.adminUsersV2),
};

const vfolderConfig: ResourceConfig<resourceRegistryVfolderQuery, VfolderNode> =
  {
    key: 'vfolder',
    labelKey: 'webui.menu.Data&Storage',
    defaultOrder: '-createdAt',
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
        render: (_value, record) => record.host,
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: t('general.Status'),
        sorter: true,
        render: (_value, record) => record.status,
      },
      {
        key: 'usageMode',
        dataIndex: 'usageMode',
        title: t('data.UsageMode'),
        sorter: true,
        render: (_value, record) => record.metadata?.usageMode,
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

export const resourceRegistry: Record<ResourceKey, ResourceConfig<any, any>> = {
  session: sessionConfig,
  user: userConfig,
  vfolder: vfolderConfig,
};

export const resourceKeys = Object.keys(resourceRegistry) as Array<ResourceKey>;

/** The panel's display title: its explicit title, else the resource's label. */
export const resolvePanelTitle = (
  descriptor: PanelDescriptor,
  t: TFunction,
): string => {
  if (descriptor.title) return descriptor.title;
  const config = resourceRegistry[descriptor.resourceType];
  return config ? t(config.labelKey) : descriptor.resourceType;
};
