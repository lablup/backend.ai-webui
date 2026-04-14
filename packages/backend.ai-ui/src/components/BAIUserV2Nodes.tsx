import {
  BAIColumnType,
  BAITable,
  BAITableProps,
  BAIText,
  BooleanTag,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from '..';
import type {
  BAIUserV2NodesFragment$data,
  BAIUserV2NodesFragment$key,
} from '../__generated__/BAIUserV2NodesFragment.graphql';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type UserV2InList = NonNullable<BAIUserV2NodesFragment$data[number]>;

const availableUserV2SorterKeys = [
  'email',
  'username',
  'status',
  'domainName',
  'createdAt',
  'modifiedAt',
] as const;

export const availableUserV2SorterValues = [
  ...availableUserV2SorterKeys,
  ...availableUserV2SorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableUserV2SorterKeys, key);
};

interface BAIUserV2NodesProps extends Omit<
  BAITableProps<UserV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  usersFrgmt: BAIUserV2NodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<UserV2InList>[],
  ) => BAIColumnType<UserV2InList>[];
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableUserV2SorterValues)[number] | null,
  ) => void;
}

const BAIUserV2Nodes: React.FC<BAIUserV2NodesProps> = ({
  usersFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const users = useFragment(
    graphql`
      fragment BAIUserV2NodesFragment on UserV2 @relay(plural: true) {
        id @required(action: NONE)
        basicInfo {
          email
          fullName
          username
          description
          integrationName
        }
        organization {
          domainName
          role
          resourcePolicy
        }
        security {
          totpActivated
          sudoSessionEnabled
        }
        status {
          status
          statusInfo
        }
        timestamps {
          createdAt
          modifiedAt
        }
      }
    `,
    usersFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<UserV2InList>>([
      {
        key: 'email',
        title: t('comp:UserNodes.Email'),
        dataIndex: 'email',
        fixed: true,
        required: true,
        sorter: isEnableSorter('email'),
        render: (__, record) => (
          <BAIText copyable>{record.basicInfo?.email ?? '-'}</BAIText>
        ),
      },
      {
        key: 'id',
        title: t('comp:UserNodes.UserID'),
        render: (__, record) => (
          <BAIText copyable ellipsis monospace style={{ maxWidth: 100 }}>
            {toLocalId(record.id)}
          </BAIText>
        ),
      },
      {
        key: 'username',
        title: t('comp:UserNodes.Username'),
        dataIndex: 'username',
        sorter: isEnableSorter('username'),
        render: (__, record) => record.basicInfo?.username || '-',
      },
      {
        key: 'full_name',
        title: t('comp:UserNodes.FullName'),
        render: (__, record) => record.basicInfo?.fullName || '-',
      },
      {
        key: 'domain_name',
        title: t('comp:UserNodes.DomainName'),
        dataIndex: 'domainName',
        minWidth: 100,
        sorter: isEnableSorter('domainName'),
        render: (__, record) => record.organization?.domainName || '-',
      },
      {
        key: 'integration_name',
        title: t('comp:UserNodes.IntegrationName'),
        render: (__, record) => record.basicInfo?.integrationName || '-',
      },
      {
        key: 'system_role',
        title: t('comp:UserNodes.Role'),
        render: (__, record) => record.organization?.role || '-',
      },
      {
        key: 'resource_policy',
        title: t('comp:UserNodes.ResourcePolicy'),
        render: (__, record) => record.organization?.resourcePolicy || '-',
      },
      {
        key: 'sudo_session_enabled',
        title: t('comp:UserNodes.SudoSessionEnabled'),
        render: (__, record) => (
          <BooleanTag value={record.security?.sudoSessionEnabled ?? false} />
        ),
      },
      {
        key: 'totp_activated',
        title: t('comp:UserNodes.TwoFA'),
        render: (__, record) => (
          <BooleanTag
            value={record.security?.totpActivated ?? false}
            trueLabel={t('comp:UserNodes.Enabled')}
            falseLabel={t('comp:UserNodes.Disabled')}
          />
        ),
      },
      {
        key: 'status',
        title: t('comp:UserNodes.Status'),
        dataIndex: 'status',
        sorter: isEnableSorter('status'),
        render: (__, record) => record.status?.status || '-',
      },
      {
        key: 'status_info',
        title: t('comp:UserNodes.StatusInfo'),
        render: (__, record) => record.status?.statusInfo || '-',
      },
      {
        key: 'description',
        title: t('comp:UserNodes.Description'),
        render: (__, record) => record.basicInfo?.description || '-',
      },
      {
        key: 'created_at',
        title: t('comp:UserNodes.CreatedAt'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        defaultSortOrder: 'descend',
        render: (__, record) =>
          record.timestamps?.createdAt
            ? dayjs(record.timestamps.createdAt).format('lll')
            : '-',
      },
      {
        key: 'modified_at',
        title: t('comp:UserNodes.ModifiedAt'),
        dataIndex: 'modifiedAt',
        sorter: isEnableSorter('modifiedAt'),
        render: (__, record) =>
          record.timestamps?.modifiedAt
            ? dayjs(record.timestamps.modifiedAt).format('lll')
            : '-',
      },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable<UserV2InList>
      resizable
      rowKey="id"
      size="small"
      dataSource={filterOutNullAndUndefined(users)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableUserV2SorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIUserV2Nodes;
