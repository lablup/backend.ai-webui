/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabAssignMutation } from '../__generated__/RoleAssignmentTabAssignMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import { RoleAssignmentOrderBy } from '../__generated__/RoleAssignmentTabRefetchQuery.graphql';
import { RoleAssignmentTabRevokeMutation } from '../__generated__/RoleAssignmentTabRevokeMutation.graphql';
import { convertToOrderBy } from '../helper';
import AssignRoleModal from './AssignRoleModal';
import { App } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAITable,
  BAITrashBinIcon,
  type GraphQLFilter,
  useBAILogger,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment, useMutation } from 'react-relay';

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
  const { modal, message } = App.useApp();
  const { logger } = useBAILogger();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filter, setFilter] = useState<GraphQLFilter>();
  const [order, setOrder] = useState<string | null>(null);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RoleAssignmentTabFragment on Query
      @argumentDefinitions(
        filter: { type: "RoleAssignmentFilter" }
        orderBy: { type: "[RoleAssignmentOrderBy!]" }
      )
      @refetchable(queryName: "RoleAssignmentTabRefetchQuery") {
        adminRoleAssignments(filter: $filter, orderBy: $orderBy, limit: 100) {
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

  const [commitAssignRole, isInFlightAssign] =
    useMutation<RoleAssignmentTabAssignMutation>(graphql`
      mutation RoleAssignmentTabAssignMutation($input: AssignRoleInput!) {
        adminAssignRole(input: $input) {
          id
          userId
          grantedBy
          grantedAt
        }
      }
    `);

  const [commitRevokeRole] = useMutation<RoleAssignmentTabRevokeMutation>(
    graphql`
      mutation RoleAssignmentTabRevokeMutation($input: RevokeRoleInput!) {
        adminRevokeRole(input: $input) {
          id
        }
      }
    `,
  );

  const assignments =
    data.adminRoleAssignments?.edges?.map((edge) => edge?.node) ?? [];

  const handleFilterChange = (newFilter: GraphQLFilter | undefined) => {
    setFilter(newFilter);
    startRefetchTransition(() => {
      refetch(
        {
          filter: {
            roleId,
            ...newFilter,
          },
          orderBy: convertToOrderBy<RoleAssignmentOrderBy>(order),
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const handleRefresh = () => {
    startRefetchTransition(() => {
      refetch(
        {
          filter: {
            roleId,
            ...filter,
          },
          orderBy: convertToOrderBy<RoleAssignmentOrderBy>(order),
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const handleAssign = (userId: string) => {
    commitAssignRole({
      variables: { input: { userId, roleId } },
      onCompleted: (_data, errors) => {
        if (errors && errors.length > 0) {
          logger.error(errors[0]);
          message.error(errors[0]?.message || t('general.ErrorOccurred'));
          return;
        }
        message.success(t('rbac.UserAssigned'));
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

  const handleRevoke = (userId: string) => {
    modal.confirm({
      title: t('rbac.RevokeUser'),
      content: t('rbac.ConfirmRevoke'),
      okText: t('rbac.RevokeUser'),
      okButtonProps: { danger: true, type: 'primary' },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          commitRevokeRole({
            variables: { input: { userId, roleId } },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.UserRevoked'));
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
          value={filter}
          onChange={handleFilterChange}
        />
        <BAIButton
          type="primary"
          icon={<PlusIcon />}
          onClick={() => setIsAssignModalOpen(true)}
        >
          {t('rbac.AssignUser')}
        </BAIButton>
      </BAIFlex>
      <BAITable
        rowKey="id"
        dataSource={assignments}
        loading={isPendingRefetch}
        size="small"
        pagination={false}
        order={order}
        onChangeOrder={(newOrder) => {
          setOrder(newOrder ?? null);
          startRefetchTransition(() => {
            refetch(
              {
                filter: {
                  roleId,
                  ...filter,
                },
                orderBy: convertToOrderBy<RoleAssignmentOrderBy>(
                  newOrder ?? null,
                ),
              },
              { fetchPolicy: 'network-only' },
            );
          });
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
                title={t('rbac.RevokeUser')}
                onClick={() => handleRevoke(record?.userId)}
              />
            ),
          },
        ]}
      />
      <AssignRoleModal
        open={isAssignModalOpen}
        confirmLoading={isInFlightAssign}
        onCancel={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
      />
    </>
  );
};

export default RoleAssignmentTab;
