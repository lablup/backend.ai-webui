import {
  BAIColumnType,
  BAIFlex,
  BAIQuestionIconWithTooltip,
  BAITable,
  BAITableProps,
  BAIText,
  BooleanTag,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from '..';
import type {
  BAIAdminUserV2TableFragment$data,
  BAIAdminUserV2TableFragment$key,
} from '../__generated__/BAIAdminUserV2TableFragment.graphql';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export type UserV2InList = NonNullable<
  BAIAdminUserV2TableFragment$data[number]
>;

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

interface BAIAdminUserV2TableProps extends Omit<
  BAITableProps<UserV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  usersFrgmt: BAIAdminUserV2TableFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<UserV2InList>[],
  ) => BAIColumnType<UserV2InList>[];
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableUserV2SorterValues)[number] | null,
  ) => void;
}

const BAIAdminUserV2Table: React.FC<BAIAdminUserV2TableProps> = ({
  usersFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useBAIi18n();

  // Show only the first item inline on a single line; collapse the rest into a
  // `+N` tag whose tooltip reveals the full list (all items) on hover.
  const renderOverflowList = (
    items: ReadonlyArray<string | number> | null | undefined,
  ) => {
    if (!items || items.length === 0) return '-';
    const [first, ...rest] = items;
    return (
      <BAIFlex gap="xxs" align="center">
        <span style={{ whiteSpace: 'nowrap' }}>{first}</span>
        {rest.length > 0 && (
          <Tooltip
            title={
              <BAIFlex direction="column" align="start">
                {items.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </BAIFlex>
            }
          >
            <Tag color="default" style={{ marginInlineEnd: 0, cursor: 'help' }}>
              +{rest.length}
            </Tag>
          </Tooltip>
        )}
      </BAIFlex>
    );
  };

  const users = useFragment(
    graphql`
      fragment BAIAdminUserV2TableFragment on UserV2 @relay(plural: true) {
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
          mainAccessKey
        }
        security {
          totpActivated
          totpActivatedAt
          sudoSessionEnabled
          allowedClientIp
        }
        status {
          status
          statusInfo
          needPasswordChange
        }
        container {
          containerUid
          containerMainGid
          containerGids
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
        exportKey: 'uuid',
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
        exportKey: 'full_name',
        render: (__, record) => record.basicInfo?.fullName || '-',
      },
      {
        key: 'domain_name',
        title: t('comp:UserNodes.DomainName'),
        dataIndex: 'domainName',
        exportKey: 'domain_name',
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
        exportKey: 'role',
        render: (__, record) => record.organization?.role || '-',
      },
      {
        key: 'resource_policy',
        title: t('comp:UserNodes.ResourcePolicy'),
        exportKey: 'resource_policy_name',
        render: (__, record) => record.organization?.resourcePolicy || '-',
      },
      {
        key: 'main_access_key',
        title: t('comp:UserNodes.MainAccessKey'),
        exportKey: 'main_access_key',
        render: (__, record) =>
          record.organization?.mainAccessKey ? (
            <BAIText copyable ellipsis monospace style={{ maxWidth: 120 }}>
              {record.organization.mainAccessKey}
            </BAIText>
          ) : (
            '-'
          ),
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
        key: 'totp_activated_at',
        title: t('comp:UserNodes.TwoFAActivatedAt'),
        render: (__, record) =>
          record.security?.totpActivatedAt
            ? dayjs(record.security.totpActivatedAt).format('lll')
            : '-',
      },
      {
        key: 'allowed_client_ip',
        title: t('comp:UserNodes.AllowedClientIps'),
        render: (__, record) =>
          renderOverflowList(record.security?.allowedClientIp),
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
        key: 'need_password_change',
        title: t('comp:UserNodes.NeedPasswordChange'),
        render: (__, record) => (
          <BooleanTag value={record.status?.needPasswordChange} />
        ),
      },
      {
        key: 'description',
        title: t('comp:UserNodes.Description'),
        render: (__, record) => record.basicInfo?.description || '-',
      },
      {
        key: 'container_uid',
        title: (
          <BAIFlex gap="xxs" align="center">
            {t('comp:UserNodes.ContainerUID')}
            <BAIQuestionIconWithTooltip
              title={t('comp:UserNodes.ContainerUIDTooltip')}
            />
          </BAIFlex>
        ),
        render: (__, record) => record.container?.containerUid ?? '-',
      },
      {
        key: 'container_main_gid',
        title: (
          <BAIFlex gap="xxs" align="center">
            {t('comp:UserNodes.ContainerMainGID')}
            <BAIQuestionIconWithTooltip
              title={t('comp:UserNodes.ContainerMainGIDTooltip')}
            />
          </BAIFlex>
        ),
        render: (__, record) => record.container?.containerMainGid ?? '-',
      },
      {
        key: 'container_gids',
        title: (
          <BAIFlex gap="xxs" align="center">
            {t('comp:UserNodes.ContainerGIDs')}
            <BAIQuestionIconWithTooltip
              title={t('comp:UserNodes.ContainerGIDsTooltip')}
            />
          </BAIFlex>
        ),
        render: (__, record) =>
          renderOverflowList(record.container?.containerGids),
      },
      {
        key: 'created_at',
        title: t('comp:UserNodes.CreatedAt'),
        dataIndex: 'createdAt',
        exportKey: 'created_at',
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
        exportKey: 'modified_at',
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

export default BAIAdminUserV2Table;
