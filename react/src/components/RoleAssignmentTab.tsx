/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabBulkRevokeMutation } from '../__generated__/RoleAssignmentTabBulkRevokeMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import {
  UserV2Filter,
  UserV2OrderBy,
} from '../__generated__/RoleAssignmentTabRefetchQuery.graphql';
import { App } from '../app-shim';
import { convertToOrderBy } from '../helper';
import { useSetBAINotification } from '../hooks/useBAINotification';
import AssignRoleModal from './AssignRoleModal';
import { Banner } from '@lablup/ui-common/Banner';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
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
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon, Trash2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

type AssignmentOrder =
  'EMAIL_ASC' | 'EMAIL_DESC' | 'USERNAME_ASC' | 'USERNAME_DESC';

interface RoleAssignmentTabProps {
  roleNodeFrgmt: RoleAssignmentTabFragment$key;
}

const RoleAssignmentTab: React.FC<RoleAssignmentTabProps> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
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
    filter: UserV2Filter | null;
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
        userFilter: { type: "UserV2Filter" }
        userOrderBy: { type: "[UserV2OrderBy!]" }
        limit: { type: "Int", defaultValue: 10 }
        offset: { type: "Int", defaultValue: 0 }
      )
      @refetchable(queryName: "RoleAssignmentTabRefetchQuery") {
        id
        entityId
        name
        source
        scopeType
        scopeId
        usersV2(
          filter: $userFilter
          orderBy: $userOrderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              entityId
              basicInfo {
                email
                fullName
              }
            }
          }
        }
      }
    `,
    roleNodeFrgmt,
  );

  const roleId = data.entityId;

  const projectScopeId =
    data.scopeType?.toUpperCase() === 'PROJECT'
      ? (data.scopeId ?? undefined)
      : undefined;

  // System project admin roles are managed from the project page (FR-3424).
  const isReadOnly =
    data.source === 'SYSTEM' &&
    !!projectScopeId &&
    !!data.name?.toLowerCase().includes('admin');

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

  // `usersV2` answers users, not assignment rows, so it has no grant time.
  // TODO(needs-backend): BA-8188 — restore Granted At once usersV2 carries it.
  const assignments: Array<{
    id: string;
    userId: string;
    email?: string | null;
    fullName?: string | null;
  }> = _.compact(
    _.map(data.usersV2?.edges, (edge) =>
      edge?.node
        ? {
            id: edge.node.id,
            userId: edge.node.entityId,
            email: edge.node.basicInfo.email,
            fullName: edge.node.basicInfo.fullName,
          }
        : null,
    ),
  );
  const totalCount = data.usersV2?.count ?? 0;

  const doRefetch = (overrides?: {
    filter?: UserV2Filter | null;
    order?: string | null;
    limit?: number;
    offset?: number;
  }) => {
    const filter =
      overrides?.filter !== undefined ? overrides.filter : queryParams.filter;
    const order =
      overrides?.order !== undefined ? overrides.order : queryParams.order;
    startRefetchTransition(() => {
      refetch(
        {
          userFilter: filter,
          userOrderBy: convertToOrderBy<UserV2OrderBy>(order),
          limit: overrides?.limit ?? limit,
          offset: overrides?.offset ?? offset,
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const handleFilterChange = (newFilter: UserV2Filter | undefined) => {
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
      const assignment = assignments.find((a) => a.userId === userId);
      const label = assignment?.email || assignment?.fullName || userId;
      return { userId, label };
    });
    setRevokingTargets(targets);
  };

  return (
    <BAIFlex align="stretch" direction="column" gap="sm">
      {/* `showIcon` dropped — Banner always shows its status icon (MAPPING §4). */}
      {isReadOnly && (
        <Banner
          role="alert"
          status="warning"
          title={t('rbac.SystemRoleNoAssignments')}
        />
      )}
      <BAIFlex justify="between" align="start" gap="sm" wrap="wrap">
        <BAIGraphQLPropertyFilter<UserV2Filter>
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
                    <Trash2
                      style={{ color: token('--color-error') }}
                      size="1em"
                    />
                  }
                  onClick={() => {
                    const userIds = assignments
                      .filter((a) => selectedRowKeys.includes(a.id))
                      .map((a) => a.userId);
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
          total: totalCount,
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
                title={record.email || '-'}
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
                          onClick: () => handleBulkRevoke([record.userId]),
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
            render: (_, record) => record.fullName || '-',
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
