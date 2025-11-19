import { UserNodeListModifyMutation } from '../__generated__/UserNodeListModifyMutation.graphql';
import { UserNodeListQuery } from '../__generated__/UserNodeListQuery.graphql';
import { INITIAL_FETCH_KEY, useFetchKey } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import BAIRadioGroup from './BAIRadioGroup';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import {
  ReloadOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Tooltip, Button, theme, Popconfirm, App } from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIFlex,
  BAITable,
  BAIPropertyFilter,
  mergeFilterValues,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BanIcon, PlusIcon, UndoIcon } from 'lucide-react';
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

const UserNodeList: React.FC<UserNodeListProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useFetchKey();

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
              status
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
            filterProperties={[
              {
                key: 'email',
                propertyLabel: t('credential.UserID'),
                type: 'string',
              },
              {
                key: 'username',
                propertyLabel: t('credential.Name'),
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
                  // {
                  //   label: 'admin',
                  //   value: 'admin',
                  // },
                  {
                    label: 'user',
                    value: 'user',
                  },
                  // {
                  //   label: 'monitor',
                  //   value: 'monitor',
                  // },
                ],
              },
              {
                key: 'description',
                propertyLabel: t('credential.Description'),
                type: 'string',
              },
            ]}
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
            title: t('credential.UserID'),
            dataIndex: 'email',
            sorter: true,
          },
          {
            key: 'username',
            title: t('credential.Name'),
            dataIndex: 'username',
            sorter: true,
          },
          {
            key: 'role',
            title: t('credential.Role'),
            dataIndex: 'role',
            sorter: true,
          },
          {
            key: 'description',
            title: t('credential.Description'),
            dataIndex: 'description',
          },
          {
            title: t('credential.CreatedAt'),
            dataIndex: 'created_at',
            render: (text) => dayjs(text).format('lll'),
            sorter: true,
            defaultSortOrder: 'descend',
          },
          queryParams.status !== 'active' && {
            key: 'status',
            title: t('credential.Status'),
            dataIndex: 'status',
            sorter: true,
          },
          {
            title: t('general.Control'),
            render: (record) => {
              const isActive = record?.status === 'active';
              return (
                <BAIFlex gap={token.marginXS}>
                  <Button
                    type="text"
                    icon={
                      <InfoCircleOutlined
                        style={{ color: token.colorSuccess }}
                      />
                    }
                    onClick={() => {
                      startInfoModalOpenTransition(() => {
                        setEmailForInfoModal(record?.email || null);
                      });
                    }}
                  />
                  <Button
                    type="text"
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
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
                            console.error(error);
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
        ])}
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
