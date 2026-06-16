/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ProjectAdminUsersPageQuery,
  UserV2OrderBy,
} from '../__generated__/ProjectAdminUsersPageQuery.graphql';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import { convertToOrderBy } from '../helper';
import { useTOTPSupported } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Skeleton } from 'antd';
import {
  availableUserV2SorterValues,
  BAICard,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIAdminUserV2Table,
  GraphQLFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const statusFilterValues = ['ACTIVE', 'INACTIVE'] as const;

interface ProjectAdminUsersContentProps {
  projectId: string;
}

const ProjectAdminUsersContent: React.FC<ProjectAdminUsersContentProps> = ({
  projectId,
}) => {
  'use memo';
  const { t } = useTranslation();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      status: parseAsStringLiteral(statusFilterValues).withDefault('ACTIVE'),
      order: parseAsStringLiteral(availableUserV2SorterValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();
  const { isTOTPSupported } = useTOTPSupported();

  const statusFilter =
    queryParams.status === 'ACTIVE'
      ? ({ equals: 'ACTIVE' } as const)
      : ({ notEquals: 'ACTIVE' } as const);

  const queryVariables = {
    projectId,
    filter: {
      ...(queryParams.filter ?? {}),
      status: statusFilter,
    },
    orderBy: convertToOrderBy<Required<UserV2OrderBy>>(queryParams.order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    isNotSupportTotp: !isTOTPSupported,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<ProjectAdminUsersPageQuery>(
    graphql`
      query ProjectAdminUsersPageQuery(
        $projectId: UUID!
        $filter: UserV2Filter
        $orderBy: [UserV2OrderBy!]
        $limit: Int
        $offset: Int
        $isNotSupportTotp: Boolean!
      ) {
        projectUsersV2(
          scope: { projectId: $projectId }
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              ...BAIAdminUserV2TableFragment
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

  const userNodes = data.projectUsersV2?.edges?.map((edge) => edge?.node) ?? [];
  const total = data.projectUsersV2?.count ?? 0;

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            optionType="button"
            value={queryParams.status}
            onChange={(e) => {
              setQueryParams({ status: e.target.value });
              setTablePaginationOption({ current: 1 });
            }}
            options={[
              { label: t('general.Active'), value: 'ACTIVE' },
              { label: t('general.Inactive'), value: 'INACTIVE' },
            ]}
          />
          <BAIGraphQLPropertyFilter
            filterProperties={[
              {
                key: 'email',
                propertyLabel: t('general.E-Mail'),
                type: 'string',
              },
              {
                key: 'uuid',
                propertyLabel: 'ID',
                type: 'uuid',
              },
              {
                key: 'username',
                propertyLabel: t('general.Username'),
                type: 'string',
              },
              {
                key: 'role',
                propertyLabel: t('credential.Role'),
                type: 'enum',
                strictSelection: true,
                options: [
                  { label: 'superadmin', value: 'SUPERADMIN' },
                  { label: 'user', value: 'USER' },
                ],
              },
              {
                key: 'createdAt',
                propertyLabel: t('general.CreatedAt'),
                type: 'datetime',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <AutoUpdateFetchKeyButton
          settingId="project-admin-users"
          loading={isLoading}
          value={fetchKey}
          onChange={(next) => updateFetchKey(next)}
        />
      </BAIFlex>
      <BAIAdminUserV2Table
        usersFrgmt={userNodes}
        customizeColumns={(baseColumns) =>
          // The TOTP columns are meaningless when the manager has no TOTP
          // plugin (their data is skipped via @skipOnClient), so hide them.
          isTOTPSupported
            ? baseColumns
            : baseColumns.filter(
                (column) =>
                  column.key !== 'totp_activated' &&
                  column.key !== 'totp_activated_at',
              )
        }
        loading={isLoading}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({ order });
        }}
        pagination={{
          current: tablePaginationOption.current,
          pageSize: tablePaginationOption.pageSize,
          total,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
      />
    </BAIFlex>
  );
};

const ProjectAdminUsersPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();

  return (
    <BAICard
      variant="borderless"
      title={t('webui.menu.ProjectMembers')}
      styles={{
        header: { borderBottom: 'none' },
        body: { paddingTop: 0 },
      }}
    >
      <BAIErrorBoundary>
        <Suspense fallback={<Skeleton active />}>
          {currentProject.id ? (
            <ProjectAdminUsersContent projectId={currentProject.id} />
          ) : (
            <Skeleton active />
          )}
        </Suspense>
      </BAIErrorBoundary>
    </BAICard>
  );
};

export default ProjectAdminUsersPage;
