/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabBulkRevokeMutation } from '../../../__generated__/RoleAssignmentTabBulkRevokeMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../../../__generated__/RoleAssignmentTabFragment.graphql';
import {
  RoleAssignmentFilter,
  RoleAssignmentOrderBy,
  RoleAssignmentTabQuery,
} from '../../../__generated__/RoleAssignmentTabQuery.graphql';
import { App } from '../../../app-shim';
import { convertToOrderBy } from '../../../helper';
import { reasonMessage } from '../../../helper/mutationError';
import AssignRoleModal from './AssignRoleModal';
import { Banner } from '@lablup/ui-common/Banner';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBulkErrorModal,
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISelectionLabel,
  BAITable,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  useBAILogger,
  useFetchKey,
  useMutationWithPromise,
  type BAIColumnsType,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon, Trash2 } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

type AssignmentOrder =
  | 'EMAIL_ASC'
  | 'EMAIL_DESC'
  | 'USERNAME_ASC'
  | 'USERNAME_DESC'
  | 'GRANTED_AT_ASC'
  | 'GRANTED_AT_DESC';

/** One failed revocation, shaped for the shared `BAIBulkErrorModal` table. */
interface FailedRevocation {
  key: string;
  userLabel: string;
  message: string;
}

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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [revokingTargets, setRevokingTargets] = useState<
    { userId: string; label: string }[] | null
  >(null);
  // One row per user the server refused on the last revoke; the error modal
  // is open while non-empty.
  const [failedRevocations, setFailedRevocations] = useState<
    FailedRevocation[]
  >([]);
  const [fetchKey, updateFetchKey] = useFetchKey();

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

  const data = useFragment(
    graphql`
      fragment RoleAssignmentTabFragment on Role {
        id
        entityId
        name
        source
        scopeType
        scopeId
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
        partialBulkRevokeRoles(input: $input) {
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

  const limit = queryParams.pageSize;
  const queryVariables = {
    filter: {
      ...(queryParams.filter ?? {}),
      roleId: { equals: roleId },
    },
    orderBy: convertToOrderBy<RoleAssignmentOrderBy>(queryParams.order),
    limit,
    offset: queryParams.current > 1 ? (queryParams.current - 1) * limit : 0,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  // RBAC management is superadmin-only, so this reads adminRoleAssignments on
  // purpose instead of a scoped search (ADR 0011's system-management exception).
  const { adminRoleAssignments } = useLazyLoadQuery<RoleAssignmentTabQuery>(
    graphql`
      query RoleAssignmentTabQuery(
        $filter: RoleAssignmentFilter
        $orderBy: [RoleAssignmentOrderBy!]
        $limit: Int
        $offset: Int
      ) {
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
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );
  const isPendingRefetch =
    !_.isEqual(deferredQueryVariables, queryVariables) ||
    deferredFetchKey !== fetchKey;

  const assignments = _.compact(
    _.map(adminRoleAssignments?.edges, (edge) =>
      edge?.node
        ? {
            userId: edge.node.userId,
            email: edge.node.user?.basicInfo?.email,
            fullName: edge.node.user?.basicInfo?.fullName,
            grantedAt: edge.node.grantedAt,
          }
        : null,
    ),
  );
  const totalCount = adminRoleAssignments?.count ?? 0;

  const handleFilterChange = (newFilter: RoleAssignmentFilter | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      filter: newFilter ?? null,
      current: 1,
    }));
  };

  const handleRefresh = () => {
    updateFetchKey();
  };

  const handleBulkRevoke = (userIds: string[]) => {
    const targets = userIds.map((userId) => {
      const assignment = assignments.find((a) => a.userId === userId);
      const label = assignment?.email || assignment?.fullName || userId;
      return { userId, label };
    });
    setRevokingTargets(targets);
  };

  const failureColumns: BAIColumnsType<FailedRevocation> = [
    {
      key: 'user',
      title: t('credential.UserID'),
      dataIndex: 'userLabel',
    },
    {
      key: 'message',
      title: t('rbac.ErrorMessage'),
      dataIndex: 'message',
    },
  ];

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
                    <Trash2
                      style={{ color: token('--color-error') }}
                      size="1em"
                    />
                  }
                  onClick={() => {
                    handleBulkRevoke(selectedRowKeys.map(String));
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
        rowKey="userId"
        dataSource={assignments}
        loading={isPendingRefetch}
        size="small"
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: totalCount,
          onChange: (current, pageSize) => {
            setQueryParams((prev) => ({ ...prev, current, pageSize }));
          },
        }}
        rowSelection={
          isReadOnly
            ? undefined
            : {
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                getRowLabel: (record) => record.email ?? record.userId,
              }
        }
        order={queryParams.order}
        onChangeOrder={(newOrder) => {
          setQueryParams((prev) => ({
            ...prev,
            order: (newOrder as AssignmentOrder) ?? null,
          }));
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
          {
            key: 'grantedAt',
            dataIndex: 'grantedAt',
            title: t('rbac.GrantedAt'),
            render: (_, record) =>
              record.grantedAt
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
          const targets = revokingTargets;
          const labelOf = (userId: string) =>
            targets.find((target) => target.userId === userId)?.label ?? userId;
          // Keep only the failed users selected so the next revoke retries them.
          const markFailures = (failures: FailedRevocation[]) => {
            setSelectedRowKeys(failures.map((failure) => failure.key));
            message.error(
              t('rbac.BulkRevokePartialFailure', { count: failures.length }),
            );
            setFailedRevocations(failures);
          };
          return mutateBulkRevokeRole({
            input: { userIds: targets.map((target) => target.userId), roleId },
          })
            .then(({ partialBulkRevokeRoles: { revoked, failed } }) => {
              setRevokingTargets(null);
              if (!_.isEmpty(revoked)) {
                handleRefresh();
              }
              if (_.isEmpty(failed)) {
                message.success(t('rbac.UserRevoked'));
                setSelectedRowKeys([]);
                return;
              }
              failed.forEach((failure) =>
                logger.error('Failed to revoke role', failure.message),
              );
              markFailures(
                failed.map((failure) => ({
                  key: failure.userId,
                  userLabel: labelOf(failure.userId),
                  message: failure.message,
                })),
              );
            })
            .catch((error) => {
              // A rejected request counts every requested user as failed.
              logger.error('Failed to bulk revoke role', error);
              setRevokingTargets(null);
              markFailures(
                targets.map(({ userId, label }) => ({
                  key: userId,
                  userLabel: label,
                  message: reasonMessage(error),
                })),
              );
            });
        }}
        onCancel={() => setRevokingTargets(null)}
      />
      <BAIBulkErrorModal<FailedRevocation>
        open={!_.isEmpty(failedRevocations)}
        alertDescription={t('rbac.BulkRevokePartialFailure', {
          count: failedRevocations.length,
        })}
        columns={failureColumns}
        dataSource={failedRevocations}
        onRequestClose={() => setFailedRevocations([])}
      />
    </BAIFlex>
  );
};

export default RoleAssignmentTab;
