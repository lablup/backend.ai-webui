/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type EntityFilter,
  type EntityOrderBy,
  LegacyRoleScopeTabQuery,
} from '../__generated__/LegacyRoleScopeTabQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { Badge } from '@astryxdesign/core/Badge';
import {
  BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIId,
  BAITableAstryx,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  useFetchKey,
  badgeVariantForTagColor,
} from 'backend.ai-ui';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type ScopeOrder =
  | 'ENTITY_TYPE_ASC'
  | 'ENTITY_TYPE_DESC'
  | 'REGISTERED_AT_ASC'
  | 'REGISTERED_AT_DESC';

interface LegacyRoleScopeTabProps {
  roleId: string;
}

/**
 * Legacy Scopes tab for managers without `role-mapped-scope-filter`
 * (< 26.8.0). Managers with the flag get the merged Detailed Permissions view
 * (`RolePermissionDetailTab`) instead. Filtering, ordering, and pagination all
 * run server-side via query variables.
 */
const LegacyRoleScopeTab: React.FC<LegacyRoleScopeTabProps> = ({ roleId }) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  // Drawer-internal view state — nothing inside the drawer writes to the URL.
  const [order, setOrder] = useState<ScopeOrder | null>(null);
  const [filter, setFilter] = useState<EntityFilter | undefined>();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables: LegacyRoleScopeTabQuery['variables'] = {
    roleId,
    filter: filter ?? null,
    orderBy: convertToOrderBy<EntityOrderBy>(order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  // Defer the variables / fetchKey so a refresh / page change / search updates
  // the table inline (previous rows stay visible) instead of re-suspending the
  // tab.
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<LegacyRoleScopeTabQuery>(
    graphql`
      query LegacyRoleScopeTabQuery(
        $roleId: UUID!
        $filter: EntityFilter
        $orderBy: [EntityOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        adminRole(id: $roleId) {
          paginatedScopes: scopes(
            filter: $filter
            orderBy: $orderBy
            limit: $limit
            offset: $offset
          ) {
            count
            edges {
              node {
                scopeType
                scopeId
                scope {
                  ... on ProjectV2 {
                    basicInfo {
                      projectName: name
                    }
                  }
                  ... on DomainV2 {
                    basicInfo {
                      domainName: name
                    }
                  }
                  ... on UserV2 {
                    basicInfo {
                      userEmail: email
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const scopeNodes =
    data.adminRole?.paginatedScopes?.edges?.map((edge) => edge?.node) ?? [];

  type ScopeNode = NonNullable<(typeof scopeNodes)[number]>;

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const columns: BAIColumnType<ScopeNode>[] = filterOutEmpty([
    {
      key: 'scopeType',
      title: t('rbac.ScopeType'),
      dataIndex: 'scopeType',
      sorter: true,
      render: (value: string) => (
        <Badge
          variant={badgeVariantForTagColor(undefined)}
          label={t(`rbac.types.${value}`, { defaultValue: value })}
        />
      ),
    },
    {
      key: 'target',
      title: t('rbac.ScopeId'),
      render: (_, record) =>
        record.scope?.basicInfo?.projectName ??
        record.scope?.basicInfo?.domainName ??
        record.scope?.basicInfo?.userEmail ??
        record.scopeId,
    },
    {
      key: 'scopeId',
      title: t('rbac.ScopeRawId'),
      render: (_, record) => <BAIId uuid={record.scopeId} ellipsis={false} />,
    },
  ]);

  return (
    <>
      <BAIFlex
        justify="between"
        align="start"
        gap="sm"
        wrap="wrap"
        style={{ marginBottom: 12 }}
      >
        <BAIGraphQLPropertyFilter<EntityFilter>
          filterProperties={[
            {
              key: 'entityType',
              propertyLabel: t('rbac.ScopeType'),
              type: 'enum',
              valueMode: baiClient.supports('rbac-filter-wrapper')
                ? 'operator'
                : 'scalar',
              options: [
                'DOMAIN',
                'PROJECT',
                'USER',
                'SESSION',
                'VFOLDER',
                'RESOURCE_GROUP',
                'CONTAINER_REGISTRY',
                'STORAGE_HOST',
                'KEYPAIR',
                'MODEL_DEPLOYMENT',
              ].map((type) => ({
                label: t(`rbac.types.${type}`, { defaultValue: type }),
                value: type,
              })),
              strictSelection: true,
            },
          ]}
          value={filter}
          onChange={(value) => {
            setFilter(value);
            // The filter narrows the result set — land back on page 1 so the
            // offset stays in range.
            setTablePaginationOption({ current: 1 });
          }}
        />
        <BAIFetchKeyButton
          loading={isLoading}
          value={fetchKey}
          onChange={updateFetchKey}
        />
      </BAIFlex>
      <BAITableAstryx<ScopeNode>
        rowKey={(record) => `${record.scopeType}|${record.scopeId}`}
        dataSource={scopeNodes as ScopeNode[]}
        columns={columns}
        loading={isLoading}
        size="small"
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: data.adminRole?.paginatedScopes?.count ?? 0,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
        order={order}
        onChangeOrder={(newOrder) => {
          setOrder((newOrder as ScopeOrder) ?? null);
        }}
      />
    </>
  );
};

export default LegacyRoleScopeTab;
