/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabBulkRevokeMutation } from '../__generated__/RoleAssignmentTabBulkRevokeMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import {
  RoleAssignmentFilter,
  RoleAssignmentOrderBy,
} from '../__generated__/RoleAssignmentTabRefetchQuery.graphql';
import { App } from '../app-shim';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { theme } from '../theme-shim';
import AssignRoleModal from './AssignRoleModal';
import { Banner } from '@astryxdesign/core/Banner';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISelectionLabel,
  BAITable,
  BAIUnmountAfterClose,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Trash2, PlusIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

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
  const baiClient = useSuspendedBackendaiClient();
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
        name
        source
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

  // System-generated project admin roles are managed through the project
  // page's one-click admin setting, which requires manager >= 26.8.0
  // (role-mapped-scope-filter). Show their assignments read-only there; on
  // older managers direct assignment here is the only way to grant project
  // admin, so keep the actions available (FR-3424).
  const isReadOnly =
    data.source === 'SYSTEM' &&
    !!projectScopeId &&
    !!data.name?.toLowerCase().includes('admin') &&
    baiClient.supports('role-mapped-scope-filter');

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
    <BAIFlex align="stretch" direction="column" gap="sm">
      {/* `showIcon` dropped — Banner always shows its status icon (MAPPING §4). */}
      {isReadOnly && (
        <Banner status="warning" title={t('rbac.SystemRoleNoAssignments')} />
      )}
      <BAIFlex justify="between" align="start" gap="sm" wrap="wrap">
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
              <Tooltip content={t('rbac.RevokeUser')}>
                <BAIButton
                  icon={
                    <Trash2 style={{ color: token.colorError }} size="1em" />
                  }
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
          {!isReadOnly && (
            <BAIButton
              type="primary"
              icon={<PlusIcon />}
              onClick={() => setIsAssignModalOpen(true)}
            >
              {t('rbac.AssignUser')}
            </BAIButton>
          )}
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
        rowSelection={
          isReadOnly
            ? undefined
            : {
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }
        }
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
                actions={
                  isReadOnly
                    ? []
                    : [
                        {
                          key: 'delete',
                          title: t('rbac.RevokeUser'),
                          icon: <Trash2 size="1em" />,
                          type: 'danger',
                          onClick: () => handleBulkRevoke([record?.userId]),
                        },
                      ]
                }
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
      <BAIUnmountAfterClose>
        <AssignRoleModal
          open={isAssignModalOpen}
          roleId={roleId}
          projectId={projectScopeId}
          onRequestClose={(success) => {
            setIsAssignModalOpen(false);
            if (success) {
              handleRefresh();
            }
          }}
        />
      </BAIUnmountAfterClose>
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
                  t('rbac.BulkRevokePartialFailure', {
                    count: failed.length,
                  }),
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
    </BAIFlex>
  );
};

export default RoleAssignmentTab;
