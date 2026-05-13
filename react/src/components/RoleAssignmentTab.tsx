/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabBulkAssignMutation } from '../__generated__/RoleAssignmentTabBulkAssignMutation.graphql';
import { RoleAssignmentTabBulkRevokeMutation } from '../__generated__/RoleAssignmentTabBulkRevokeMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import { RoleAssignmentOrderBy } from '../__generated__/RoleAssignmentTabRefetchQuery.graphql';
import { RoleAssignmentTab_roleScopeFragment$key } from '../__generated__/RoleAssignmentTab_roleScopeFragment.graphql';
import { convertToOrderBy } from '../helper';
import { useSetBAINotification } from '../hooks/useBAINotification';
import AssignRoleModal from './AssignRoleModal';
import { DeleteFilled } from '@ant-design/icons';
import { App, Tooltip, theme } from 'antd';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISelectionLabel,
  BAITable,
  type GraphQLFilter,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import {
  parseAsInteger,
  parseAsJson,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useRefetchableFragment,
  useMutation,
} from 'react-relay';

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
  roleScopeFrgmt?: RoleAssignmentTab_roleScopeFragment$key | null;
  onAssignmentChange?: () => void;
}

const RoleAssignmentTab: React.FC<RoleAssignmentTabProps> = ({
  queryRef,
  roleId,
  roleScopeFrgmt,
  onAssignmentChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const roleScope = useFragment(
    graphql`
      fragment RoleAssignmentTab_roleScopeFragment on Role {
        scopes(first: 1) {
          edges {
            node {
              scopeType
              scopeId
            }
          }
        }
      }
    `,
    roleScopeFrgmt ?? null,
  );

  const projectScopeId =
    roleScope?.scopes?.edges?.[0]?.node?.scopeType === 'PROJECT'
      ? roleScope.scopes.edges[0].node.scopeId
      : undefined;

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
            roleId: { equals: roleId },
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
          _.forEach(failed, (arr) =>
            upsertNotification({
              open: true,
              duration: 0,
              title: arr.message,
            }),
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
    const targets = userIds.map((userId) => {
      const assignment = assignments.find((a) => a?.userId === userId);
      const label =
        assignment?.user?.basicInfo?.email ||
        assignment?.user?.basicInfo?.fullName ||
        userId;
      return { userId, label };
    });
    modal.confirm({
      title: t('rbac.RevokeUser'),
      content: (
        <BAIFlex direction="column" align="stretch" gap="xs">
          <span>{t('rbac.ConfirmRevokeWithName')}</span>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            {targets.map(({ userId, label }) => (
              <li key={userId}>{label}</li>
            ))}
          </ul>
        </BAIFlex>
      ),
      okText: t('rbac.RevokeUser'),
      okButtonProps: { danger: true },
      onOk: () =>
        mutateBulkRevokeRole({
          input: { userIds, roleId },
        })
          .then((data) => {
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
          })
          .catch((error) => {
            logger.error('Failed to bulk revoke role', error);
            message.error(error?.message || t('general.ErrorOccurred'));
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
    </>
  );
};

export default RoleAssignmentTab;
