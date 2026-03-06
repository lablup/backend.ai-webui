/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabBulkAssignMutation } from '../__generated__/RoleAssignmentTabBulkAssignMutation.graphql';
import { RoleAssignmentTabBulkRevokeMutation } from '../__generated__/RoleAssignmentTabBulkRevokeMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import { RoleAssignmentOrderBy } from '../__generated__/RoleAssignmentTabRefetchQuery.graphql';
import { convertToOrderBy } from '../helper';
import AssignRoleModal from './AssignRoleModal';
import { App, Tooltip, theme } from 'antd';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAITable,
  BAIText,
  BAITrashBinIcon,
  type GraphQLFilter,
  useBAILogger,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import {
  parseAsInteger,
  parseAsJson,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment, useMutation } from 'react-relay';

const assignmentOrderValues = [
  'EMAIL_ASC',
  'EMAIL_DESC',
  'USERNAME_ASC',
  'USERNAME_DESC',
  'GRANTED_AT_ASC',
  'GRANTED_AT_DESC',
] as const;

interface RoleAssignmentTabProps {
  queryRef: RoleAssignmentTabFragment$key;
  roleId: string;
  onAssignmentChange?: () => void;
}

const RoleAssignmentTab: React.FC<RoleAssignmentTabProps> = ({
  queryRef,
  roleId,
  onAssignmentChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const { logger } = useBAILogger();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order: parseAsStringLiteral(assignmentOrderValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
      urlKeys: {
        current: 'aCurrent',
        pageSize: 'aPageSize',
        order: 'aOrder',
        filter: 'aFilter',
      },
    },
  );

  const limit = queryParams.pageSize;
  const offset =
    queryParams.current > 1 ? (queryParams.current - 1) * limit : 0;

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RoleAssignmentTabFragment on Query
      @argumentDefinitions(
        filter: { type: "RoleAssignmentFilter" }
        orderBy: { type: "[RoleAssignmentOrderBy!]" }
        limit: { type: "Int" }
        offset: { type: "Int" }
      )
      @refetchable(queryName: "RoleAssignmentTabRefetchQuery") {
        adminRoleAssignments(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              userId
              grantedBy
              grantedAt
              user {
                id
                basicInfo {
                  email
                  fullName
                }
              }
            }
          }
        }
      }
    `,
    queryRef,
  );

  const [commitBulkAssignRole, isInFlightBulkAssign] =
    useMutation<RoleAssignmentTabBulkAssignMutation>(graphql`
      mutation RoleAssignmentTabBulkAssignMutation(
        $input: BulkAssignRoleInput!
      ) {
        adminBulkAssignRole(input: $input) {
          assigned {
            id
            userId
            grantedBy
            grantedAt
          }
          failed {
            userId
            message
          }
        }
      }
    `);

  const [commitBulkRevokeRole, isInFlightBulkRevoke] =
    useMutation<RoleAssignmentTabBulkRevokeMutation>(graphql`
      mutation RoleAssignmentTabBulkRevokeMutation(
        $input: BulkRevokeRoleInput!
      ) {
        adminBulkRevokeRole(input: $input) {
          revoked {
            id
          }
          failed {
            userId
            message
          }
        }
      }
    `);

  const assignments =
    data.adminRoleAssignments?.edges?.map((edge) => edge?.node) ?? [];

  const doRefetch = (overrides?: {
    filter?: GraphQLFilter | null;
    order?: string | null;
    limit?: number;
    offset?: number;
  }) => {
    startRefetchTransition(() => {
      refetch(
        {
          filter: {
            roleId,
            ...(overrides?.filter !== undefined
              ? overrides.filter
              : queryParams.filter),
          },
          orderBy: convertToOrderBy<RoleAssignmentOrderBy>(
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

  const handleRefresh = () => {
    doRefetch();
  };

  const handleBulkAssign = (userIds: string[]) => {
    commitBulkAssignRole({
      variables: { input: { userIds, roleId } },
      onCompleted: (data, errors) => {
        if (errors && errors.length > 0) {
          logger.error(errors[0]);
          message.error(errors[0]?.message || t('general.ErrorOccurred'));
          return;
        }
        const failed = data.adminBulkAssignRole?.failed ?? [];
        if (failed.length > 0) {
          message.warning(
            t('rbac.BulkAssignPartialFailure', { count: failed.length }),
          );
        } else {
          message.success(t('rbac.UsersAssigned'));
        }
        setIsAssignModalOpen(false);
        handleRefresh();
        onAssignmentChange?.();
      },
      onError: (error) => {
        logger.error(error);
        message.error(error?.message || t('general.ErrorOccurred'));
      },
    });
  };

  const handleBulkRevoke = (userIds: string[]) => {
    modal.confirm({
      title: t('rbac.DeleteUser'),
      content:
        userIds.length > 1
          ? t('rbac.ConfirmBulkRevoke', { count: userIds.length })
          : t('rbac.ConfirmRevoke'),
      okText: t('button.Delete'),
      okButtonProps: { danger: true, type: 'primary' },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          commitBulkRevokeRole({
            variables: { input: { userIds, roleId } },
            onCompleted: (data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              const failed = data.adminBulkRevokeRole?.failed ?? [];
              if (failed.length > 0) {
                message.warning(
                  t('rbac.BulkRevokePartialFailure', {
                    count: failed.length,
                  }),
                );
              } else {
                message.success(t('rbac.UserRevoked'));
              }
              setSelectedRowKeys([]);
              handleRefresh();
              onAssignmentChange?.();
              resolve();
            },
            onError: (error) => {
              logger.error(error);
              message.error(error?.message || t('general.ErrorOccurred'));
              reject();
            },
          });
        }),
    });
  };

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
              key: 'email',
              propertyLabel: t('credential.UserID'),
              type: 'string',
            },
            {
              key: 'username',
              propertyLabel: t('credential.FullName'),
              type: 'string',
            },
          ]}
          value={queryParams.filter ?? undefined}
          onChange={handleFilterChange}
        />
        <BAIFlex gap="xs">
          {selectedRowKeys.length > 0 && (
            <BAIFlex gap="xs" align="center">
              <BAIText>
                {t('general.NSelected', { count: selectedRowKeys.length })}
              </BAIText>
              <Tooltip title={t('rbac.DeleteUser')}>
                <BAIButton
                  icon={<BAITrashBinIcon />}
                  loading={isInFlightBulkRevoke}
                  style={{
                    color: token.colorError,
                    background: token.colorErrorBg,
                  }}
                  onClick={() => {
                    const userIds = assignments
                      .filter((a) => selectedRowKeys.includes(a?.id ?? ''))
                      .map((a) => a?.userId)
                      .filter(Boolean) as string[];
                    handleBulkRevoke(userIds);
                  }}
                />
              </Tooltip>
            </BAIFlex>
          )}
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value=""
            onChange={() => handleRefresh()}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => setIsAssignModalOpen(true)}
          >
            {t('rbac.AssignUser')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        rowKey="id"
        dataSource={assignments}
        loading={isPendingRefetch}
        size="small"
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: data.adminRoleAssignments?.count ?? 0,
          onChange: (current, pageSize) => {
            setQueryParams({ current, pageSize });
            const newOffset = current > 1 ? (current - 1) * pageSize : 0;
            doRefetch({ limit: pageSize, offset: newOffset });
          },
        }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        order={queryParams.order}
        onChangeOrder={(newOrder) => {
          setQueryParams({
            order: (newOrder as (typeof assignmentOrderValues)[number]) ?? null,
          });
          doRefetch({ order: newOrder ?? null });
        }}
        columns={[
          {
            key: 'email',
            dataIndex: 'email',
            title: t('credential.UserID'),
            render: (_, record) => record?.user?.basicInfo?.email || '-',
            sorter: true,
          },
          {
            key: 'control',
            title: t('general.Control'),
            width: 60,
            render: (_, record) => (
              <BAIButton
                type="text"
                danger
                icon={<BAITrashBinIcon />}
                size="small"
                title={t('rbac.DeleteUser')}
                onClick={() => handleBulkRevoke([record?.userId])}
              />
            ),
          },
          {
            key: 'username',
            dataIndex: 'username',
            title: t('credential.FullName'),
            render: (_, record) => record?.user?.basicInfo?.fullName || '-',
            sorter: true,
          },
          {
            key: 'grantedAt',
            dataIndex: 'grantedAt',
            title: t('rbac.GrantedAt'),
            render: (_, record) =>
              record?.grantedAt
                ? dayjs(record.grantedAt).format('YYYY-MM-DD HH:mm')
                : '-',
            sorter: true,
          },
        ]}
      />
      <AssignRoleModal
        open={isAssignModalOpen}
        confirmLoading={isInFlightBulkAssign}
        onCancel={() => setIsAssignModalOpen(false)}
        onAssign={handleBulkAssign}
      />
    </>
  );
};

export default RoleAssignmentTab;
