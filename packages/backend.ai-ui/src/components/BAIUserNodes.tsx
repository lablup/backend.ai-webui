import {
  BAITable,
  BAITableProps,
  BAIColumnType,
  BAIText,
  BooleanTag,
  filterOutEmpty,
  toLocalId,
  filterOutNullAndUndefined,
} from '..';
import {
  BAIUserNodesFragment$data,
  BAIUserNodesFragment$key,
} from '../__generated__/BAIUserNodesFragment.graphql';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

export type UserNodeInList = NonNullable<BAIUserNodesFragment$data[number]>;

const availableUserSorterKeys = [
  'email',
  'username',
  'full_name',
  'role',
  'resource_policy',
  'domain_name',
  'sudo_session_enabled',
  'need_password_change',
  'totp_activated',
  'created_at',
  'modified_at',
  'status',
] as const;

export const availableUserSorterValues = [
  ...availableUserSorterKeys,
  ...availableUserSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableUserSorterKeys, key);
};

interface BAIUserNodesProps
  extends Omit<
    BAITableProps<UserNodeInList>,
    'dataSource' | 'columns' | 'onChangeOrder'
  > {
  usersFrgmt: BAIUserNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<UserNodeInList>[],
  ) => BAIColumnType<UserNodeInList>[];
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableUserSorterValues)[number] | null,
  ) => void;
}

const BAIUserNodes: React.FC<BAIUserNodesProps> = ({
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
      fragment BAIUserNodesFragment on UserNode @relay(plural: true) {
        id @required(action: NONE)
        email @required(action: NONE)
        full_name
        role
        description
        username
        created_at
        modified_at
        status
        domain_name
        resource_policy
        allowed_client_ip
        container_gids
        container_main_gid
        container_uid
        status_info
        sudo_session_enabled
        need_password_change
        totp_activated
        project_nodes {
          count
          edges {
            node {
              name
              id
            }
          }
        }
      }
    `,
    usersFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<UserNodeInList>>([
      {
        key: 'email',
        title: t('comp:UserNodes.Email'),
        sorter: isEnableSorter('email'),
        dataIndex: 'email',
        fixed: true,
        render: (__, record) => <BAIText copyable>{record.email}</BAIText>,
        required: true,
      },
      {
        key: 'id',
        title: 'ID',
        render: (__, record) => (
          <BAIText
            copyable
            ellipsis
            monospace
            style={{
              maxWidth: 100,
            }}
          >
            {toLocalId(record.id)}
          </BAIText>
        ),
      },
      {
        key: 'username',
        title: t('comp:UserNodes.Username'),
        dataIndex: 'username',
        sorter: isEnableSorter('username'),
      },
      {
        key: 'full_name',
        title: t('comp:UserNodes.FullName'),
        dataIndex: 'full_name',
        sorter: isEnableSorter('full_name'),
      },
      {
        key: 'domain_name',
        title: t('comp:UserNodes.DomainName'),
        dataIndex: 'domain_name',
        minWidth: 100,
        sorter: isEnableSorter('domain_name'),
      },
      {
        key: 'project',
        title: t('comp:UserNodes.Project'),
        render: (__, record) => {
          return (
            <BAIText ellipsis style={{ maxWidth: 200 }}>
              {_.map(
                record.project_nodes?.edges,
                (edge) => edge?.node?.name,
              ).join(', ')}
            </BAIText>
          );
        },
      },
      {
        key: 'role',
        title: t('comp:UserNodes.Role'),
        dataIndex: 'role',
        sorter: isEnableSorter('role'),
      },
      {
        key: 'resource_policy',
        title: t('comp:UserNodes.ResourcePolicy'),
        dataIndex: 'resource_policy',
        sorter: isEnableSorter('resource_policy'),
      },
      {
        key: 'allowed_client_ip',
        title: t('comp:UserNodes.AllowedClientIps'),
        dataIndex: 'allowed_client_ip',
        render: (value) => (!_.isEmpty(value) ? value : '-'),
      },
      {
        key: 'container_uid',
        title: t('comp:UserNodes.ContainerUID'),
        render: (__, record) =>
          record.container_uid ? (
            <BAIText ellipsis style={{ maxWidth: 200 }}>
              {record.container_uid}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'container_main_gid',
        title: t('comp:UserNodes.ContainerMainGID'),
        render: (__, record) =>
          record.container_main_gid ? (
            <BAIText ellipsis style={{ maxWidth: 200 }}>
              {record.container_main_gid}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'container_gids',
        title: t('comp:UserNodes.ContainerGIDs'),
        render: (__, record) =>
          !_.isEmpty(record.container_gids) ? (
            <BAIText ellipsis style={{ maxWidth: 200 }}>
              {_.join(record.container_gids, ', ')}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'description',
        title: t('comp:UserNodes.Description'),
        dataIndex: 'description',
      },
      {
        key: 'sudo_session_enabled',
        title: t('comp:UserNodes.SudoSessionEnabled'),
        sorter: isEnableSorter('sudo_session_enabled'),
        dataIndex: 'sudo_session_enabled',
        render: (_, record) => (
          <BooleanTag value={record.sudo_session_enabled} />
        ),
      },
      {
        key: 'need_password_change',
        title: t('comp:UserNodes.NeedPasswordChange'),
        sorter: isEnableSorter('need_password_change'),
        dataIndex: 'need_password_change',
        render: (_, record) => (
          <BooleanTag value={record.need_password_change} />
        ),
      },
      {
        key: 'totp_activated',
        title: t('comp:UserNodes.TwoFA'),
        sorter: isEnableSorter('totp_activated'),
        dataIndex: 'totp_activated',
        render: (_, record) => (
          <BooleanTag
            value={record.totp_activated}
            trueLabel={t('comp:UserNodes.Enabled')}
            falseLabel={t('comp:UserNodes.Disabled')}
          />
        ),
      },
      {
        key: 'status',
        title: t('comp:UserNodes.Status'),
        render: (__, record) => record.status,
        dataIndex: 'status',
        sorter: isEnableSorter('status'),
      },
      {
        key: 'status_info',
        title: t('comp:UserNodes.StatusInfo'),
        dataIndex: 'status_info',
      },
      {
        title: t('comp:UserNodes.CreatedAt'),
        key: 'created_at',
        render: (__, record) => dayjs(record.created_at).format('lll'),
        sorter: isEnableSorter('created_at'),
        dataIndex: 'created_at',
        defaultSortOrder: 'descend',
      },
      {
        title: t('comp:UserNodes.ModifiedAt'),
        key: 'modified_at',
        render: (__, record) => dayjs(record.modified_at).format('lll'),
        sorter: isEnableSorter('modified_at'),
        dataIndex: 'modified_at',
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
    <BAITable
      resizable
      rowKey={'id'}
      size="small"
      dataSource={filterOutNullAndUndefined(users)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableUserSorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIUserNodes;
