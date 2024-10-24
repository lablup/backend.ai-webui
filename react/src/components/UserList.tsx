import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import Flex from './Flex';
import UserGenerationModal from './UserGenerationModal';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import UserSignoutModal from './UserSignoutModal';
import {
  UserListQuery,
  UserListQuery$data,
} from './__generated__/UserListQuery.graphql';
import {
  SolutionOutlined,
  SettingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Tabs, Table, theme, Button, Input, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import React, { useState, useTransition, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useLazyLoadQuery } from 'react-relay';

type UserNode = NonNullable<
  NonNullable<
    NonNullable<NonNullable<UserListQuery$data>['user_nodes']>['edges']
  >[0]
>;

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const [, startReloadTransition] = useTransition();
  const [userListFetchKey, updateUserListFetchKey] =
    useUpdatableState('initial-fetch');
  const [curTabKey, setCurTabKey] = useState('active');
  const [selectedUser, setSelectedUser] = useState<UserNode['node'] | null>(
    null,
  );
  const [filterValue, setFilterValue] = useState('');
  const [filterType, setFilterType] = useState('email');
  const [paginationState, setPaginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 10,
  });
  const [isOpenUserGenerationModal, { toggle: toggleUserGenerationModal }] =
    useToggle(false);
  const [isOpenUserInfoModal, { toggle: toggleUserInfoModal }] =
    useToggle(false);
  const [isOpenUserSettingModal, { toggle: toggleUserSettingModal }] =
    useToggle(false);
  const [isOpenUserSignoutModal, { toggle: toggleUserSignoutModal }] =
    useToggle(false);
  let totpSupported = false;
  let { data: isManagerSupportingTOTP } = useQuery(
    'isManagerSupportingTOTP',
    () => {
      return baiClient.isManagerSupportingTOTP();
    },
    {
      // for to render even this fail query failed
      suspense: false,
    },
  );
  totpSupported = baiClient?.supports('2FA') && isManagerSupportingTOTP;

  const { user_nodes } = useLazyLoadQuery<UserListQuery>(
    graphql`
      query UserListQuery(
        $filter: String
        $offset: Int!
        $first: Int!
        $isTOTPSupported: Boolean!
      ) {
        user_nodes(
          filter: $filter
          offset: $offset
          first: $first
          order: "-created_at"
        ) {
          edges {
            node {
              email
              username
              need_password_change
              full_name
              description
              domain_name
              role
              status
              totp_activated @include(if: $isTOTPSupported)
            }
          }
          count
        }
      }
    `,
    {
      //todo: core can't filter status
      offset: (paginationState.current - 1) * paginationState.pageSize,
      first: paginationState.pageSize,
      filter:
        curTabKey === 'active'
          ? `${filterType} ilike "%${filterValue}%" & status == "active"`
          : `${filterType} ilike "%${filterValue}%" & status != "active"`,
      isTOTPSupported: totpSupported ?? false,
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey: userListFetchKey,
    },
  );

  const columns: ColumnsType<UserNode> = [
    {
      title: t('credential.UserID'),
      key: 'userId',
      render(record) {
        return record.node.email;
      },
    },
    {
      title: t('credential.Name'),
      key: 'name',
      render(record) {
        return record.node.username;
      },
    },
    ...(totpSupported
      ? [
          {
            title: t('webui.menu.TotpActivated'),
            key: 'TotpActivated',
            render(record: UserNode) {
              return record.node?.totp_activated;
            },
          },
        ]
      : []),
    ...(curTabKey !== 'active'
      ? [
          {
            title: t('credential.Status'),
            key: 'Status',
            render(record: UserNode) {
              return record.node?.status;
            },
          },
        ]
      : []),
    ...(baiClient.supports('main-access-key')
      ? [
          {
            title: t('credential.MainAccessKey'),
            key: 'mainAccessKey',
          },
        ]
      : []),
    {
      title: t('general.Control'),
      key: 'control',
      render(record) {
        return (
          <Flex>
            <Button
              size="large"
              type="text"
              icon={<SolutionOutlined />}
              style={{
                color: token.colorPrimary,
              }}
              onClick={() => {
                startReloadTransition(() => {
                  toggleUserInfoModal();
                  setSelectedUser(record.node);
                });
              }}
            />
            <Button
              size="large"
              type="text"
              icon={<SettingOutlined />}
              style={{
                color: token.colorInfo,
              }}
              onClick={() => {
                startReloadTransition(() => {
                  toggleUserSettingModal();
                  setSelectedUser(record.node);
                });
              }}
            />
            {curTabKey === 'active' ? (
              <Button
                size="large"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  startReloadTransition(() => {
                    toggleUserSignoutModal();
                    setSelectedUser(record.node);
                  });
                }}
              />
            ) : undefined}
          </Flex>
        );
      },
    },
  ];
  return (
    <>
      <style>
        {`
          .ant-tabs-nav {
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .ant-tabs > .ant-tabs-nav .ant-tabs-nav-operations {
            display: none;
          }
          .ant-tabs-nav-wrap {
            flex:none;
          }
          .ant-tabs-nav-wrap-ping-right {
            padding-bottom: ${token.paddingSM}px;
          }
          .ant-tabs .ant-tabs-extra-content {
            display: flex;
            flex-shrink: 1;
          }
        `}
      </style>
      <Flex direction="column" align="stretch">
        <Tabs
          activeKey={curTabKey}
          onChange={(key) => startReloadTransition(() => setCurTabKey(key))}
          items={[
            {
              key: 'active',
              label: t('credential.Active'),
            },
            {
              key: 'inActive',
              label: t('credential.Inactive'),
            },
          ]}
          style={{
            width: '100%',
            paddingLeft: token.paddingMD,
            paddingRight: token.paddingMD,
            borderTopLeftRadius: token.borderRadius,
            borderTopRightRadius: token.borderRadius,
          }}
          tabBarExtraContent={{
            right: (
              <Flex
                direction="row"
                gap={'sm'}
                wrap="wrap"
                style={{ flexShrink: 1 }}
              >
                <Flex style={{ flexGrow: 1 }}>
                  <Input.Search
                    addonBefore={
                      <Select
                        defaultValue={filterType}
                        onChange={(value) =>
                          startReloadTransition(() => setFilterType(value))
                        }
                        dropdownStyle={{ minWidth: 'max-content' }}
                        options={[
                          { value: 'email', label: t('credential.UserID') },
                          { value: 'username', label: t('credential.Name') },
                          {
                            value: 'main_access_key',
                            label: t('credential.MainAccessKey'),
                          },
                        ]}
                      />
                    }
                    onSearch={(value) => {
                      setFilterValue(value);
                      startReloadTransition(() => {
                        updateUserListFetchKey();
                      });
                    }}
                  />
                </Flex>
                <Flex>
                  <Button type="primary" onClick={toggleUserGenerationModal}>
                    {t('credential.CreateUser')}
                  </Button>
                </Flex>
              </Flex>
            ),
          }}
        />
        <Suspense fallback={<div>loading..</div>}>
          <Table
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={(user_nodes?.edges || []) as UserNode[]}
            pagination={{
              total: user_nodes?.count ?? 0,
              pageSize: paginationState.pageSize,
              current: paginationState.current,
              onChange(page, pageSize) {
                startReloadTransition(() => {
                  setPaginationState({
                    current: page,
                    pageSize: pageSize || 100,
                  });
                });
              },
            }}
            style={{
              width: '100%',
              paddingLeft: token.paddingMD,
              paddingRight: token.paddingMD,
              borderTopLeftRadius: token.borderRadius,
              borderTopRightRadius: token.borderRadius,
            }}
          />
        </Suspense>
        <UserGenerationModal
          open={isOpenUserGenerationModal}
          onRequestClose={() => {
            toggleUserGenerationModal();
            startReloadTransition(() => {
              updateUserListFetchKey();
            });
          }}
        />
        <UserInfoModal
          draggable
          email={selectedUser?.email || ''}
          open={isOpenUserInfoModal}
          onRequestClose={toggleUserInfoModal}
        />
        <UserSettingModal
          draggable
          email={selectedUser?.email || ''}
          open={isOpenUserSettingModal}
          onRequestOk={() => {
            toggleUserSettingModal();
            startReloadTransition(() => {
              updateUserListFetchKey();
            });
          }}
          onRequestClose={toggleUserSettingModal}
        />
        <UserSignoutModal
          draggable
          email={selectedUser?.email || ''}
          open={isOpenUserSignoutModal}
          onRequestClose={() => {
            toggleUserSignoutModal();
            startReloadTransition(() => {
              updateUserListFetchKey();
            });
          }}
        />
      </Flex>
    </>
  );
};

export default UserList;
