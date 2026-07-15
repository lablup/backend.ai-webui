/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabBulkAssignMutation } from '../__generated__/RoleAssignmentTabBulkAssignMutation.graphql';
import { RoleAssignmentTabBulkRevokeMutation } from '../__generated__/RoleAssignmentTabBulkRevokeMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import {
  RoleAssignmentFilter,
  RoleAssignmentOrderBy,
} from '../__generated__/RoleAssignmentTabRefetchQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useSetBAINotification } from '../hooks/useBAINotification';
import AssignRoleModal from './AssignRoleModal';
import { DeleteFilled } from '@ant-design/icons';
import { App, Tooltip, theme } from 'antd';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISelectionLabel,
  BAITable,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment, useMutation } from 'react-relay';

type AssignmentOrder =
  | 'EMAIL_ASC'
  | 'EMAIL_DESC'
  | 'USERNAME_ASC'
  | 'USERNAME_DESC'
  | 'GRANTED_AT_ASC'
  | 'GRANTED_AT_DESC';

interface RoleAssignmentTabProps {
  roleNodeFrgmt: RoleAssignmentTabFragment$key;
}

const RoleAssignmentTab: React.FC<RoleAssignmentTabProps> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [revokingTargets, setRevokingTargets] = useState<
    { userId: string; label: string }[] | null
  >(null);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  // Pagination / order / filter live in local React state (not the URL);
  // they reset whenever the drawer content remounts.
  const [queryParams, setQueryParams] = useState<{
    current: number;
    pageSize: number;
    order: AssignmentOrder | null;
    filter: RoleAssignmentFilter | null;
  }>({
    current: 1,
    pageSize: 10,
    order: null,
    filter: null,
  });

  const limit = queryParams.pageSize;
  const offset =
    queryParams.current > 1 ? (queryParams.current - 1) * limit : 0;

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RoleAssignmentTabFragment on Role
      @argumentDefinitions(
        filter: { type: "RoleAssignmentFilter" }
        orderBy: { type: "[RoleAssignmentOrderBy!]" }
        limit: { type: "Int", defaultValue: 10 }
        offset: { type: "Int", defaultValue: 0 }
      )
      @refetchable(queryName: "RoleAssignmentTabRefetchQuery") {
        id
        # Aliased: RoleNodesFragment selects scopes(first: 3) on the same list
        # nodes the drawer fragment now composes with, and unaliased fields
        # with different arguments conflict in one query.
        firstScope: scopes(first: 1) {
          edges {
            node {
              scopeType
              scopeId
            }
          }
        }
        users(
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
    roleNodeFrgmt,
  );

  const roleId = toLocalId(data.id);

  const projectScopeId =
    data.firstScope?.edges?.[0]?.node?.scopeType === 'PROJECT'
      ? data.firstScope.edges[0].node.scopeId
      : undefined;

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

  const mutateBulkRevokeRole =
    useMutationWithPromise<RoleAssignmentTabBulkRevokeMutation>(graphql`
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

  const assignments = data.users?.edges?.map((edge) => edge?.node) ?? [];

  const doRefetch = (overrides?: {
    filter?: RoleAssignmentFilter | null;
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

  const handleFilterChange = (newFilter: RoleAssignmentFilter | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      filter: newFilter ?? null,
      current: 1,
    }));
    doRefetch({ filter: newFilter ?? null, offset: 0 });
  };

  const handleRefresh = () => {
    doRefetch();
  };

  const handleBulkAssign = (userIds: string[]) => {
    commitBulkAssignRole({
      variables: {
        input: {
          userIds,
          roleId,
          ...(projectScopeId ? { projectId: projectScopeId } : {}),
        },
      },
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
          _.forEach(failed, (item) =>
            upsertNotification({
              key: `rbac-bulk-assign-failed-${item.userId}`,
              open: true,
              duration: 0,
              type: 'error',
              message: item.message,
            }),
          );
        } else {
          message.success(t('rbac.UsersAssigned'));
        }
        setIsAssignModalOpen(false);
        handleRefresh();
      },
      onError: (error) => {
        logger.error(error);
        message.error(error?.message || t('general.ErrorOccurred'));
      },
    });
  };

  const handleBulkRevoke = (userIds: string[]) => {
    const targets = userIds.map((userId) => {
      const assignment = assignments.find((a) => a?.userId === userId);
      const label =
        assignment?.user?.basicInfo?.email ||
        assignment?.user?.basicInfo?.fullName ||
        userId;
      return { userId, label };
    });
    setRevokingTargets(targets);
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
        <BAIGraphQLPropertyFilter<RoleAssignmentFilter>
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
              <BAISelectionLabel
                count={selectedRowKeys.length}
                onClearSelection={() => setSelectedRowKeys([])}
              />
              <Tooltip title={t('rbac.RevokeUser')}>
                <BAIButton
                  danger
                  icon={<DeleteFilled />}
                  style={{
                    borderColor: token.colorBorder,
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
          total: data.users?.count ?? 0,
          onChange: (current, pageSize) => {
            setQueryParams((prev) => ({ ...prev, current, pageSize }));
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
          setQueryParams((prev) => ({
            ...prev,
            order: (newOrder as AssignmentOrder) ?? null,
          }));
          doRefetch({ order: newOrder ?? null });
        }}
        columns={[
          {
            key: 'email',
            dataIndex: 'email',
            title: t('credential.UserID'),
            fixed: 'left',
            render: (_, record) => (
              <BAINameActionCell
                title={record?.user?.basicInfo?.email || '-'}
                showActions="always"
                actions={[
                  {
                    key: 'delete',
                    title: t('rbac.RevokeUser'),
                    icon: <DeleteFilled />,
                    type: 'danger',
                    onClick: () => handleBulkRevoke([record?.userId]),
                  },
                ]}
              />
            ),
            sorter: true,
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
        onRequestClose={(userIds) => {
          if (userIds) {
            handleBulkAssign(userIds);
          } else {
            setIsAssignModalOpen(false);
          }
        }}
      />
      <BAIDeleteConfirmModal
        open={!!revokingTargets}
        title={t('rbac.RevokeUser')}
        description={t('rbac.ConfirmRevokeWithName')}
        items={
          revokingTargets?.map(({ userId, label }) => ({
            key: userId,
            label,
          })) ?? []
        }
        reversible
        okText={t('rbac.RevokeUser')}
        onOk={() => {
          if (!revokingTargets) return;
          const userIds = revokingTargets.map((t) => t.userId);
          return mutateBulkRevokeRole({
            input: { userIds, roleId },
          })
            .then((data) => {
              const failed = data.adminBulkRevokeRole?.failed ?? [];
              if (failed.length > 0) {
                message.warning(
                  t('rbac.BulkRevokePartialFailure', { count: failed.length }),
                );
                _.forEach(failed, (item) =>
                  upsertNotification({
                    key: `rbac-bulk-revoke-failed-${item.userId}`,
                    open: true,
                    duration: 0,
                    type: 'error',
                    message: item.message,
                  }),
                );
              } else {
                message.success(t('rbac.UserRevoked'));
              }
              setRevokingTargets(null);
              setSelectedRowKeys([]);
              handleRefresh();
            })
            .catch((error) => {
              logger.error('Failed to bulk revoke role', error);
              message.error(error?.message || t('general.ErrorOccurred'));
              setRevokingTargets(null);
            });
        }}
        onCancel={() => setRevokingTargets(null)}
      />
    </>
  );
};

export default RoleAssignmentTab;
