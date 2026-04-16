/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleScopeTabFragment$key } from '../__generated__/RoleScopeTabFragment.graphql';
import { EntityOrderBy } from '../__generated__/RoleScopeTabRefetchQuery.graphql';
import { convertToOrderBy } from '../helper';
import { Tag } from 'antd';
import {
  BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIId,
  BAITable,
  filterOutEmpty,
  type GraphQLFilter,
} from 'backend.ai-ui';
import {
  parseAsInteger,
  parseAsJson,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

const scopeOrderValues = [
  'ENTITY_TYPE_ASC',
  'ENTITY_TYPE_DESC',
  'REGISTERED_AT_ASC',
  'REGISTERED_AT_DESC',
] as const;

interface RoleScopeTabProps {
  queryRef: RoleScopeTabFragment$key;
}

const RoleScopeTab: React.FC<RoleScopeTabProps> = ({ queryRef }) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order: parseAsStringLiteral(scopeOrderValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
      urlKeys: {
        current: 'sCurrent',
        pageSize: 'sPageSize',
        order: 'sOrder',
        filter: 'sFilter',
      },
    },
  );

  const limit = queryParams.pageSize;
  const offset =
    queryParams.current > 1 ? (queryParams.current - 1) * limit : 0;

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RoleScopeTabFragment on Query
      @argumentDefinitions(
        roleId: { type: "UUID!" }
        filter: { type: "EntityFilter" }
        orderBy: { type: "[EntityOrderBy!]" }
        limit: { type: "Int" }
        offset: { type: "Int" }
      )
      @refetchable(queryName: "RoleScopeTabRefetchQuery") {
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
    queryRef,
  );

  const scopeNodes =
    data.adminRole?.paginatedScopes?.edges?.map((edge) => edge?.node) ?? [];

  type ScopeNode = NonNullable<(typeof scopeNodes)[number]>;

  const doRefetch = (overrides?: {
    filter?: GraphQLFilter | null;
    order?: string | null;
    limit?: number;
    offset?: number;
  }) => {
    startRefetchTransition(() => {
      refetch(
        {
          filter:
            overrides?.filter !== undefined
              ? overrides.filter
              : queryParams.filter,
          orderBy: convertToOrderBy<EntityOrderBy>(
            overrides?.order !== undefined
              ? overrides.order
              : queryParams.order,
          ),
          limit: overrides?.limit ?? limit,
          offset: overrides?.offset ?? offset,
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const handleFilterChange = (newFilter: GraphQLFilter | undefined) => {
    setQueryParams({ filter: newFilter ?? null, current: 1 });
    doRefetch({ filter: newFilter ?? null, offset: 0 });
  };

  const columns: BAIColumnType<ScopeNode>[] = filterOutEmpty([
    {
      key: 'scopeType',
      title: t('rbac.ScopeType'),
      dataIndex: 'scopeType',
      sorter: true,
      render: (value: string) => (
        <Tag>{t(`rbac.types.${value}`, { defaultValue: value })}</Tag>
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
        <BAIGraphQLPropertyFilter
          filterProperties={[
            {
              key: 'entityType',
              propertyLabel: t('rbac.ScopeType'),
              type: 'enum',
              valueMode: 'scalar',
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
          value={queryParams.filter ?? undefined}
          onChange={handleFilterChange}
        />
        <BAIFetchKeyButton
          loading={isPendingRefetch}
          value=""
          onChange={() => doRefetch()}
        />
      </BAIFlex>
      <BAITable<ScopeNode>
        rowKey={(record) => `${record.scopeType}|${record.scopeId}`}
        dataSource={scopeNodes as ScopeNode[]}
        columns={columns}
        loading={isPendingRefetch}
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: data.adminRole?.paginatedScopes?.count ?? 0,
          onChange: (current, pageSize) => {
            setQueryParams({ current, pageSize });
            const newOffset = current > 1 ? (current - 1) * pageSize : 0;
            doRefetch({ limit: pageSize, offset: newOffset });
          },
        }}
        order={queryParams.order}
        onChangeOrder={(newOrder) => {
          setQueryParams({
            order: (newOrder as (typeof scopeOrderValues)[number]) ?? null,
          });
          doRefetch({ order: newOrder ?? null });
        }}
      />
    </>
  );
};

export default RoleScopeTab;
