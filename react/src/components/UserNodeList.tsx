import { UserNodeListModifyMutation } from '../__generated__/UserNodeListModifyMutation.graphql';
import { UserNodeListQuery } from '../__generated__/UserNodeListQuery.graphql';
import BAIPropertyFilter from '../components/BAIPropertyFilter';
import { filterOutEmpty, filterOutNullAndUndefined } from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import BAIRadioGroup from './BAIRadioGroup';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import {
  ReloadOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Tooltip, Button, theme, Popconfirm, App } from 'antd';
import { BAIFlex, BAITable } from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BanIcon, PlusIcon, UndoIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

interface UserNodeListProps {}

const UserNodeList: React.FC<UserNodeListProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefresh, startRefreshTransition] = useTransition();
  const [isPendingFilter, startFilterTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [filterString, setFilterString] = useState<string>();
  const [order, setOrder] = useState<string | undefined>('-created_at');
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [isPendingStatusFetch, startStatusFetchTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState<
    'status == "active"' | 'status != "active"'
  >('status == "active"');
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
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [pendingUserId, setPendingUserId] = useState<string>();

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
    {
      first: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      filter: [filterString, activeFilter]
        .filter(Boolean)
        .map((x) => `(${x})`)
        .join(' & '),
      order,
    },
    {
      fetchKey,
      fetchPolicy: fetchKey === 'first' ? 'store-and-network' : 'network-only',
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
            value={activeFilter}
            onChange={(e) => {
              startStatusFetchTransition(() => {
                setActiveFilter(e.target?.value);
                // to page 1
                setTablePaginationOption({
                  current: 1,
                  pageSize: tablePaginationOption.pageSize,
                });
              });
            }}
            optionType="button"
            options={[
              {
                label: 'Active',
                value: 'status == "active"',
              },
              {
                label: 'Inactive',
                value: 'status != "active"',
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
                  {
                    label: 'admin',
                    value: 'admin',
                  },
                  {
                    label: 'user',
                    value: 'user',
                  },
                  {
                    label: 'monitor',
                    value: 'monitor',
                  },
                ],
              },
              {
                key: 'description',
                propertyLabel: t('credential.Description'),
                type: 'string',
              },
            ]}
            value={filterString}
            loading={isPendingFilter}
            onChange={(value) => {
              startFilterTransition(() => {
                setFilterString(value);
              });
            }}
          />
        </BAIFlex>
        <BAIFlex gap="xs">
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={isPendingRefresh}
              onClick={() => {
                startRefreshTransition(() => {
                  updateFetchKey();
                });
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
          activeFilter === 'status != "active"' && {
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
                            startRefreshTransition(() => {
                              updateFetchKey();
                            });
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
            startPageChangeTransition(() => {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({
                  current,
                  pageSize,
                });
              }
            });
          },
        }}
        onChangeOrder={(nextOrder) => {
          startPageChangeTransition(() => {
            setOrder(nextOrder);
          });
        }}
        loading={isPendingPageChange || isPendingStatusFetch || isPendingFilter}
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
            startRefreshTransition(() => {
              updateFetchKey();
            });
          }
        }}
      />
    </BAIFlex>
  );
};

export default UserNodeList;
