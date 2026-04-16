/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RoleNodesFragment$data,
  RoleNodesFragment$key,
} from '../__generated__/RoleNodesFragment.graphql';
import { Tag, Tooltip, Typography } from 'antd';
import {
  BAIColumnType,
  BAIDoubleTag,
  BAIFlex,
  BAIId,
  BAITable,
  BAITableProps,
  BAITag,
  filterOutEmpty,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type RoleNodeInList = NonNullable<RoleNodesFragment$data[number]>;

const availableRoleSorterKeys = ['name', 'created_at', 'updated_at'] as const;

export const availableRoleSorterValues = [
  ...availableRoleSorterKeys,
  ...availableRoleSorterKeys.map((key) => `-${key}` as const),
] as const;

interface RoleNodesProps extends Omit<
  BAITableProps<RoleNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  rolesFrgmt: RoleNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<RoleNodeInList>[],
  ) => BAIColumnType<RoleNodeInList>[];
  onChangeOrder?: (
    order: (typeof availableRoleSorterValues)[number] | null,
  ) => void;
}

const RoleNodes: React.FC<RoleNodesProps> = ({
  rolesFrgmt,
  customizeColumns,
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
        scopes(first: 3) {
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
    `,
    rolesFrgmt,
  );

  const columns: BAIColumnType<RoleNodeInList>[] = filterOutEmpty([
    {
      key: 'name',
      title: t('rbac.RoleName'),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
    },
    {
      key: 'description',
      title: t('rbac.RoleDescription'),
      dataIndex: 'description',
      render: (description: string) => (
        <Tooltip title={description} placement="topLeft">
          <Typography.Text ellipsis style={{ maxWidth: 200 }}>
            {description ?? '-'}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      key: 'scope',
      title: t('rbac.ScopeType'),
      render: (_, record: RoleNodeInList) => {
        const scopeNodes =
          record.scopes?.edges?.map((edge) => edge?.node).filter(Boolean) ?? [];
        const totalCount = record.scopes?.count ?? 0;
        if (scopeNodes.length === 0) return '-';
        const first = scopeNodes[0];
        const scopeTypeLabel = t(`rbac.types.${first?.scopeType}`, {
          defaultValue: first?.scopeType,
        });
        const scopeName =
          first?.scope?.basicInfo?.projectName ??
          first?.scope?.basicInfo?.domainName ??
          first?.scope?.basicInfo?.userEmail ??
          first?.scopeId;
        return (
          <BAIFlex gap="xxs" wrap="wrap" align="center">
            <BAIDoubleTag
              values={[
                { label: scopeTypeLabel, color: 'blue' },
                { label: scopeName, color: 'default' },
              ]}
            />
            {totalCount > 1 && <Tag color="default">+{totalCount - 1}</Tag>}
          </BAIFlex>
        );
      },
    },
    {
      key: 'scopeId',
      title: t('rbac.ScopeRawId'),
      render: (_, record: RoleNodeInList) => {
        const scopeNodes =
          record.scopes?.edges?.map((edge) => edge?.node).filter(Boolean) ?? [];
        const totalCount = record.scopes?.count ?? 0;
        if (scopeNodes.length === 0) return '-';
        return (
          <BAIFlex gap="xxs" wrap="wrap" align="center">
            <BAIId uuid={scopeNodes[0]?.scopeId} />
            {totalCount > 1 && <Tag color="default">+{totalCount - 1}</Tag>}
          </BAIFlex>
        );
      },
    },
    {
      key: 'source',
      title: t('rbac.Source'),
      dataIndex: 'source',
      render: (source: string) => {
        return (
          <BAITag color={source === 'SYSTEM' ? 'default' : 'green'}>
            {source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')}
          </BAITag>
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

  const allColumns = customizeColumns ? customizeColumns(columns) : columns;

  return (
    <BAITable<RoleNodeInList>
      rowKey="id"
      dataSource={roles as RoleNodeInList[]}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      {...tableProps}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableRoleSorterValues)[number]) || null,
        );
      }}
    />
  );
};

export default RoleNodes;
