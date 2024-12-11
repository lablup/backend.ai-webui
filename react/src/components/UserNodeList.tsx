import BAIPropertyFilter from '../components/BAIPropertyFilter';
import Flex from '../components/Flex';
import {
  filterEmptyItem,
  filterNonNullItems,
  transformSorterToOrderString,
} from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import { UserNodeListDeleteMutation } from './__generated__/UserNodeListDeleteMutation.graphql';
import { UserNodeListQuery } from './__generated__/UserNodeListQuery.graphql';
import {
  ReloadOutlined,
  LoadingOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Tooltip, Button, Table, theme, Radio, Popconfirm, App } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { PlusIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

interface UserNodeListProps {}

const UserNodeList: React.FC<UserNodeListProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefresh, startRefreshTransition] = useTransition();
  const [isPendingFilter, startFilterTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [filterString, setFilterString] = useState<string>();
  const [order, setOrder] = useState<string>();
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
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 20,
  });

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
      fetchPolicy: 'network-only',
    },
  );

  const [commitDeleteUser, isInFlightCommitDeleteUser] =
    useMutation<UserNodeListDeleteMutation>(graphql`
      mutation UserNodeListDeleteMutation($email: String!) {
        delete_user(email: $email) {
          ok
          msg
        }
      }
    `);
  return (
    <Flex direction="column" align="stretch">
      <Flex
        justify="between"
        align="start"
        gap="xs"
        style={{ padding: token.paddingXS }}
        wrap="wrap"
      >
        <Flex direction="row" gap={'sm'} align="start" wrap="wrap">
          <Radio.Group
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
                    label: 'super admin',
                    value: 'SUPERADMIN',
                  },
                  {
                    label: 'admin',
                    value: 'ADMIN',
                  },
                  {
                    label: 'user',
                    value: 'user',
                  },
                  {
                    label: 'monitor',
                    value: 'MONITOR',
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
        </Flex>
        <Flex gap="xs">
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
              // toggleSettingModal();
            }}
          >
            {t('credential.CreateUser')}
          </Button>
        </Flex>
      </Flex>
      <Table
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={_.map(filterNonNullItems(user_nodes?.edges), (e) => e.node)}
        columns={filterEmptyItem([
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
            title: t('credential.CreatedAt'),
            dataIndex: 'created_at',
            render: (text) => dayjs(text).format('lll'),
            sorter: true,
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
              return (
                <Flex gap={token.marginXS}>
                  <Button
                    type="link"
                    icon={<InfoCircleOutlined />}
                    onClick={() => {
                      startInfoModalOpenTransition(() => {
                        setEmailForInfoModal(record?.email || null);
                      });
                    }}
                  />
                  <Button
                    type="link"
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      startSettingModalOpenTransition(() => {
                        setEmailForSettingModal(record?.email || null);
                      });
                    }}
                  />
                  {activeFilter === 'status == "active"' && (
                    <Popconfirm
                      title={t('dialog.ask.DoYouWantToProceed')}
                      description={t('dialog.warning.CannotBeUndone')}
                      okButtonProps={{
                        loading: isInFlightCommitDeleteUser,
                      }}
                      okType="danger"
                      okText={t('button.Delete')}
                      placement="left"
                      onConfirm={() => {
                        commitDeleteUser({
                          variables: {
                            email: record?.email || '',
                          },
                          onCompleted: () => {
                            message.success(
                              t('credential.SignoutSuccessfullyFinished'),
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
                      <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  )}
                </Flex>
              );
            },
          },
        ])}
        showSorterTooltip={false}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          showSizeChanger: true,
          total: user_nodes?.count || 0,
          current: tablePaginationOption.current,
          showTotal(total, range) {
            return `${range[0]}-${range[1]} of ${total} users`;
          },
          pageSizeOptions: ['10', '20', '50'],
          style: { marginRight: token.marginXS },
        }}
        onChange={({ pageSize, current }, filters, sorter) => {
          startPageChangeTransition(() => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
            setOrder(transformSorterToOrderString(sorter));
          });
        }}
        loading={{
          spinning:
            isPendingPageChange || isPendingStatusFetch || isPendingFilter,
          indicator: <LoadingOutlined />,
        }}
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
        open={!!emailForSettingModal || isPendingSettingModalOpen}
        loading={isPendingSettingModalOpen}
        onRequestClose={(success) => {
          setEmailForSettingModal(null);
          if (success) {
            startRefreshTransition(() => {
              updateFetchKey();
            });
          }
        }}
      />
    </Flex>
  );
};

export default UserNodeList;
