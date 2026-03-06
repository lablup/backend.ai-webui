/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RoleNodesFragment$data,
  RoleNodesFragment$key,
} from '../__generated__/RoleNodesFragment.graphql';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Button, Tag, Typography } from 'antd';
import {
  BAIColumnType,
  BAILink,
  BAITable,
  BAITableProps,
  filterOutEmpty,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type RoleNodeInList = NonNullable<RoleNodesFragment$data[number]>;

const availableRoleSorterKeys = ['NAME', 'CREATED_AT', 'UPDATED_AT'] as const;

export const availableRoleSorterValues = [
  ...availableRoleSorterKeys.map((key) => `${key}_ASC` as const),
  ...availableRoleSorterKeys.map((key) => `${key}_DESC` as const),
] as const;

interface RoleNodesProps extends Omit<
  BAITableProps<RoleNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  rolesFrgmt: RoleNodesFragment$key;
  onClickRoleName?: (role: RoleNodeInList) => void;
  onClickEdit?: (role: RoleNodeInList) => void;
  onClickDelete?: (role: RoleNodeInList) => void;
  onClickPurge?: (role: RoleNodeInList) => void;
  statusFilter?: string;
  order?: string | null;
  onChangeOrder?: (
    order: (typeof availableRoleSorterValues)[number] | null,
  ) => void;
}

const RoleNodes: React.FC<RoleNodesProps> = ({
  rolesFrgmt,
  onClickRoleName,
  onClickEdit,
  onClickDelete,
  onClickPurge,
  statusFilter,
  order,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const roles = useFragment(
    graphql`
      fragment RoleNodesFragment on Role @relay(plural: true) {
        id @required(action: NONE)
        name @required(action: NONE)
        description
        source
        status
        createdAt
        updatedAt
        ...RoleFormModalFragment
      }
    `,
    rolesFrgmt,
  );

  const isDeletedFilter = statusFilter === 'DELETED';

  const columns: BAIColumnType<RoleNodeInList>[] = filterOutEmpty([
    {
      key: 'name',
      title: t('rbac.RoleName'),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
      render: (name: string, role: RoleNodeInList) => {
        return onClickRoleName ? (
          <BAILink
            type="hover"
            onClick={() => {
              onClickRoleName(role);
            }}
          >
            {name}
          </BAILink>
        ) : (
          name
        );
      },
    },
    {
      key: 'actions',
      title: '',
      width: 100,
      render: (_: unknown, role: RoleNodeInList) => {
        const isSystem = role.source === 'SYSTEM';
        return (
          <>
            {isDeletedFilter ? (
              <Button
                type="text"
                danger
                icon={<ExclamationCircleOutlined />}
                size="small"
                onClick={() => onClickPurge?.(role)}
              />
            ) : (
              <>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  disabled={isSystem}
                  onClick={() => onClickEdit?.(role)}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => onClickDelete?.(role)}
                />
              </>
            )}
          </>
        );
      },
    },
    {
      key: 'description',
      title: t('rbac.RoleDescription'),
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      key: 'source',
      title: t('rbac.Source'),
      dataIndex: 'source',
      render: (source: string) => {
        return (
          <Tag color={source === 'SYSTEM' ? 'default' : 'green'}>
            {source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')}
          </Tag>
        );
      },
    },
    {
      key: 'createdAt',
      title: t('general.CreatedAt'),
      dataIndex: 'createdAt',
      sorter: true,
      render: (createdAt: string) =>
        createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      key: 'updatedAt',
      title: t('general.UpdatedAt'),
      dataIndex: 'updatedAt',
      sorter: true,
      render: (updatedAt: string) =>
        updatedAt ? dayjs(updatedAt).format('YYYY-MM-DD HH:mm') : '-',
    },
  ]);

  return (
    <BAITable<RoleNodeInList>
      rowKey="id"
      dataSource={roles as RoleNodeInList[]}
      columns={columns}
      scroll={{ x: 'max-content' }}
      order={order}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableRoleSorterValues)[number]) || null,
        );
      }}
      locale={{
        emptyText: (
          <Typography.Text type="secondary">
            {t('rbac.NoRolesToDisplay')}
          </Typography.Text>
        ),
      }}
      {...tableProps}
    />
  );
};

export default RoleNodes;
