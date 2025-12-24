import { UserNodeListModifyMutation } from '../__generated__/UserNodeListModifyMutation.graphql';
import {
  UserNodeListQuery,
  UserNodeListQuery$data,
} from '../__generated__/UserNodeListQuery.graphql';
import {
  INITIAL_FETCH_KEY,
  useFetchKey,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import BAIRadioGroup from './BAIRadioGroup';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, Button, theme, Popconfirm, App } from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIFlex,
  BAITable,
  BAIPropertyFilter,
  mergeFilterValues,
  useBAILogger,
  BAIText,
  BAIColumnsType,
  toLocalId,
  BooleanTag,
  isValidUUID,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BanIcon, EditIcon, PlusIcon, UndoIcon } from 'lucide-react';
import React, {
  useState,
  useTransition,
  useDeferredValue,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

interface UserNodeListProps {}

type UserNode = NonNullableNodeOnEdges<UserNodeListQuery$data['user_nodes']>;

const UserNodeList: React.FC<UserNodeListProps> = () => {
  const { logger } = useBAILogger();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const baiClient = useSuspendedBackendaiClient();

  const [queryParams, setQueryParams] = useQueryParams({
    filter: withDefault(StringParam, undefined),
    order: withDefault(StringParam, '-created_at'),
    status: withDefault(StringParam, 'active'),
  });
  const { message } = App.useApp();

  const [emailForInfoModal, setEmailForInfoModal] = useState<string | null>(
    null,
  );
  const [isPendingInfoModalOpen, startInfoModalOpenTransition] =
    useTransition();
  const [isPendingSettingModalOpen, startSettingModalOpenTransition] =
    useTransition();
  const [emailForSettingModal, setEmailForSettingModal] = useState<
    string | null
  >(null);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const [pendingUserId, setPendingUserId] = useState<string>();

  const queryVariables = useMemo(() => {
    const statusFilter =
      queryParams.status === 'active'
        ? 'status == "active"'
        : 'status != "active"';

    return {
      first: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      filter: mergeFilterValues([queryParams.filter, statusFilter]),
      order: queryParams.order,
    };
  }, [
    baiPaginationOption.limit,
    baiPaginationOption.offset,
    queryParams.filter,
    queryParams.status,
    queryParams.order,
  ]);

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { user_nodes } = useLazyLoadQuery<UserNodeListQuery>(
    graphql`
      query UserNodeListQuery(
        $first: Int
        $offset: Int
        $filter: String
        $order: String
      ) {
        user_nodes(
          first: $first
          offset: $offset
          filter: $filter
          order: $order
        ) {
          count
          edges {
            node {
              id
              full_name
              role
              description
              email
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

  const [commitModifyUser, isInFlightCommitModifyUser] =
    useMutation<UserNodeListModifyMutation>(graphql`
      mutation UserNodeListModifyMutation(
        $email: String!
        $props: ModifyUserInput!
      ) {
        modify_user(email: $email, props: $props) {
          ok
          msg
        }
      }
    `);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="start" gap="xs" wrap="wrap">
        <BAIFlex direction="row" gap={'sm'} align="start" wrap="wrap">
          <BAIRadioGroup
            value={queryParams.status}
            onChange={(e) => {
              setQueryParams({ status: e.target.value }, 'replaceIn');
              setTablePaginationOption({
                current: 1,
              });
            }}
            optionType="button"
            options={[
              {
                label: t('general.Active'),
                value: 'active',
              },
              {
                label: t('general.Inactive'),
                value: 'inactive',
              },
            ]}
          />
          <BAIPropertyFilter
            filterProperties={filterOutEmpty([
              {
                key: 'email',
                propertyLabel: t('general.E-Mail'),
                type: 'string',
              },
              {
                key: 'uuid',
                propertyLabel: 'ID',
                type: 'string',
                defaultOperator: '==',
                rule: {
                  message: 'Invalid UUID.',
                  validate: (value) => isValidUUID(value),
                },
              },
              {
                key: 'username',
                propertyLabel: t('credential.Name'),
                type: 'string',
              },
              {
                key: 'full_name',
                propertyLabel: t('credential.FullName'),
                type: 'string',
              },
              baiClient.isManagerVersionCompatibleWith('25.15.2') && {
                key: 'project_name',
                propertyLabel: t('general.Project'),
                type: 'string',
              },
              {
                key: 'role',
                propertyLabel: t('credential.Role'),
                type: 'string',
                strictSelection: true,
                defaultOperator: '==',
                options: [
                  {
                    label: 'superadmin',
                    value: 'superadmin',
                  },
                  {
                    label: 'user',
                    value: 'user',
                  },
                ],
              },
              {
                key: 'resource_policy',
                propertyLabel: t('credential.ResourcePolicy'),
                type: 'string',
              },
              {
                key: 'description',
                propertyLabel: t('credential.Description'),
                type: 'string',
              },
              {
                key: 'status_info',
                propertyLabel: t('credential.StatusInfo'),
                type: 'string',
              },
              {
                key: 'need_password_change',
                propertyLabel: 'Need Password Change',
                type: 'boolean',
              },
              {
                key: 'totp_activated',
                propertyLabel: '2FA Enabled',
                type: 'boolean',
              },
              {
                key: 'sudo_session_enabled',
                propertyLabel: 'Sudo Session Enabled',
                type: 'boolean',
              },
            ])}
            value={queryParams.filter}
            onChange={(value) => {
              setQueryParams({ filter: value }, 'replaceIn');
            }}
          />
        </BAIFlex>
        <BAIFlex gap="xs">
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={deferredFetchKey !== fetchKey}
              onClick={() => {
                updateFetchKey();
              }}
              icon={<ReloadOutlined />}
            ></Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setOpenCreateModal(true);
            }}
          >
            {t('credential.CreateUser')}
          </Button>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={filterOutNullAndUndefined(_.map(user_nodes?.edges, 'node'))}
        columns={filterOutEmpty([
          {
            key: 'email',
            title: t('general.E-Mail'),
            sorter: true,
            fixed: true,
            render: (__, record) => <BAIText copyable>{record.email}</BAIText>,
          },
          {
            title: t('general.Control'),
            fixed: true,
            render: (__, record) => {
              const isActive = record?.status === 'active';
              return (
                <BAIFlex gap={token.marginXXS}>
                  <Button
                    type="text"
                    icon={
                      <InfoCircleOutlined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      startInfoModalOpenTransition(() => {
                        setEmailForInfoModal(record?.email || null);
                      });
                    }}
                  />
                  <Button
                    type="text"
                    icon={<EditIcon style={{ color: token.colorInfo }} />}
                    onClick={() => {
                      startSettingModalOpenTransition(() => {
                        setEmailForSettingModal(record?.email || null);
                      });
                    }}
                  />
                  <Tooltip
                    title={
                      isActive
                        ? t('credential.Deactivate')
                        : t('credential.Activate')
                    }
                  >
                    <Popconfirm
                      title={
                        isActive
                          ? t('credential.DeactivateUser')
                          : t('credential.ActivateUser')
                      }
                      placement="left"
                      okType={isActive ? 'danger' : 'primary'}
                      okText={
                        isActive
                          ? t('credential.Deactivate')
                          : t('credential.Activate')
                      }
                      description={record?.email}
                      onConfirm={() => {
                        setPendingUserId(record?.id || '');
                        commitModifyUser({
                          variables: {
                            email: record?.email || '',
                            props: {
                              status: isActive ? 'inactive' : 'active',
                            },
                          },
                          onCompleted: () => {
                            message.success(
                              t('credential.StatusUpdatedSuccessfully'),
                            );
                            updateFetchKey();
                          },
                          onError: (error) => {
                            message.error(error?.message);
                            logger.error(error);
                          },
                        });
                      }}
                    >
                      <Button
                        type="text"
                        danger={isActive}
                        icon={isActive ? <BanIcon /> : <UndoIcon />}
                        disabled={
                          isInFlightCommitModifyUser &&
                          pendingUserId !== record?.id
                        }
                        loading={
                          isInFlightCommitModifyUser &&
                          pendingUserId === record?.id
                        }
                      />
                    </Popconfirm>
                  </Tooltip>
                </BAIFlex>
              );
            },
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
            title: t('credential.Name'),
            dataIndex: 'username',
            sorter: true,
          },
          {
            key: 'full_name',
            title: t('credential.FullName'),
            dataIndex: 'full_name',
            sorter: true,
          },
          {
            key: 'project',
            title: t('general.Project'),
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
            title: t('credential.Role'),
            dataIndex: 'role',
            sorter: true,
          },
          {
            key: 'resource_policy',
            title: t('credential.ResourcePolicy'),
            dataIndex: 'resource_policy',
            sorter: true,
          },
          {
            key: 'allowed_client_ip',
            title: t('session.AllowedClientIps'),
            dataIndex: 'allowed_client_ip',
            render: (value) => (!_.isEmpty(value) ? value : '-'),
          },
          {
            key: 'container_uid',
            title: 'Container UID',
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
            title: 'Container Main GID',
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
            title: 'Container GIDs',
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
            title: t('credential.Description'),
            dataIndex: 'description',
          },
          {
            key: 'sudo_session_enabled',
            title: 'Sudo Session Enabled',
            sorter: true,
            render: (_, record) => (
              <BooleanTag value={record.sudo_session_enabled} />
            ),
          },
          {
            key: 'need_password_change',
            title: 'Need Password Change',
            sorter: true,
            render: (_, record) => (
              <BooleanTag value={record.need_password_change} />
            ),
          },
          {
            key: 'totp_activated',
            title: '2FA',
            sorter: true,
            render: (_, record) => (
              <BooleanTag
                value={record.totp_activated}
                trueLabel={t('general.Enabled')}
                falseLabel={t('general.Disabled')}
              />
            ),
          },
          {
            key: 'status_info',
            title: t('credential.StatusInfo'),
            dataIndex: 'status_info',
          },
          {
            title: t('general.CreatedAt'),
            render: (__, record) => dayjs(record.created_at).format('lll'),
            sorter: true,
            defaultSortOrder: 'descend',
          },
          {
            title: t('general.ModifiedAt'),
            render: (__, record) => dayjs(record.modified_at).format('lll'),
            sorter: true,
          },
          queryParams.status !== 'active' && {
            key: 'status',
            title: t('credential.Status'),
            render: (__, record) => record.status,
            sorter: true,
          },
        ] as BAIColumnsType<UserNode>)}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: user_nodes?.count || 0,
          current: tablePaginationOption.current,
          style: { marginRight: token.marginXS },
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
          },
        }}
        onChangeOrder={(nextOrder) => {
          setQueryParams({ order: nextOrder }, 'replaceIn');
        }}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
      />
      <UserInfoModal
        userEmail={emailForInfoModal || ''}
        open={!!emailForInfoModal || isPendingInfoModalOpen}
        loading={isPendingInfoModalOpen}
        onRequestClose={() => {
          setEmailForInfoModal(null);
        }}
      />
      <UserSettingModal
        userEmail={emailForSettingModal}
        open={
          !!emailForSettingModal || isPendingSettingModalOpen || openCreateModal
        }
        loading={isPendingSettingModalOpen}
        onRequestClose={(success) => {
          setEmailForSettingModal(null);
          setOpenCreateModal(false);
          if (success) {
            updateFetchKey();
          }
        }}
      />
    </BAIFlex>
  );
};

export default UserNodeList;
