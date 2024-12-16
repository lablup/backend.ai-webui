import { filterNonNullItems, localeCompare } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import BAIPropertyFilter, { FilterProperty } from './BAIPropertyFilter';
import BAITable from './BAITable';
import Flex from './Flex';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import { UserListDeleteMutation } from './__generated__/UserListDeleteMutation.graphql';
import { UserListQuery } from './__generated__/UserListQuery.graphql';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Popconfirm, Radio, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Suspense, useDeferredValue, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [isOpenInfoModal, { toggle: toggleInfoModalOpen }] = useToggle(false);
  const [isOpenSettingModal, { toggle: toggleSettingModal }] = useToggle(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null,
  );
  const [filterString, setFilterString] = useState<string>();
  const [isPendingFilter, startFilterTransition] = useTransition();
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [isActiveTypePending, startActiveTypeTransition] = useTransition();
  const [userListFetchKey, updateUserListFetchKey] =
    useUpdatableState('initial-fetch');
  const [isPendingReload, startReloadTransition] = useTransition();
  const [paginationState, setPaginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 10,
  });
  const deferredPaginationState = useDeferredValue(paginationState);
  const baiClient = useSuspendedBackendaiClient();
  const filterProperties: FilterProperty[] = [
    {
      key: 'email',
      propertyLabel: t('credential.UserID'),
      type: 'string',
    },
    {
      key: 'username',
      propertyLabel: t('credential.UserName'),
      type: 'string',
    },
    {
      key: 'role',
      propertyLabel: t('credential.Role'),
      type: 'string',
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
  ];

  /**FIXME:
   * There is currently an issue with using @skipOnClient or @include within a Fragment.
   * So it is currently implemented to use independent queries within `UserInfoModal.tsx` and `UserSettingModal.tsx`.
   *
   * Issue 1. @skipOnClient does not work inside a fragment.
   * Issue 2. variables used in @include or other conditions can't be referenced in fragment with more than 2depth
   * */
  const { user_list } = useLazyLoadQuery<UserListQuery>(
    graphql`
      query UserListQuery(
        $limit: Int!
        $offset: Int!
        $is_active: Boolean!
        $filter: String
      ) {
        user_list(
          limit: $limit
          offset: $offset
          is_active: $is_active
          filter: $filter
        ) {
          items {
            username
            email
            created_at
            role
            main_access_key @since(version: "23.09.7")
          }
          total_count
        }
      }
    `,
    {
      offset:
        (deferredPaginationState.current - 1) *
        deferredPaginationState.pageSize,
      limit: deferredPaginationState.pageSize,
      is_active: activeType === 'active',
      filter: filterString,
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey: userListFetchKey,
    },
  );

  const [commitDeleteUser, isInFlightCommitDeleteUser] =
    useMutation<UserListDeleteMutation>(graphql`
      mutation UserListDeleteMutation($email: String!) {
        delete_user(email: $email) {
          ok
          msg
        }
      }
    `);

  return (
    <Flex direction="column">
      <Flex
        justify="between"
        style={{
          width: '100%',
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
        align="start"
      >
        <Flex gap={token.marginXS} align="start">
          <Radio.Group
            value={activeType}
            onChange={(value) => {
              startActiveTypeTransition(() => {
                setActiveType(value.target.value);
              });
              setPaginationState({
                current: 1,
                pageSize: paginationState.pageSize,
              });
            }}
            optionType="button"
            buttonStyle="solid"
            options={[
              {
                label: t('credential.Active'),
                value: 'active',
              },
              {
                label: t('credential.Inactive'),
                value: 'inactive',
              },
            ]}
          />
          <BAIPropertyFilter
            value={filterString}
            onChange={(value) => {
              startFilterTransition(() => {
                setFilterString(value);
              });
            }}
            filterProperties={
              baiClient.isManagerVersionCompatibleWith('23.09.7')
                ? _.concat(filterProperties, [
                    {
                      key: 'main_access_key',
                      propertyLabel: t('credential.MainAccessKey'),
                      type: 'string',
                    },
                  ])
                : filterProperties
            }
          />
        </Flex>
        <Flex gap={token.marginXS}>
          <Button
            icon={<ReloadOutlined />}
            loading={isPendingReload}
            onClick={() =>
              startReloadTransition(() => {
                updateUserListFetchKey();
              })
            }
          />
          <Button
            type="primary"
            onClick={() => {
              toggleSettingModal();
            }}
          >
            {t('credential.CreateUser')}
          </Button>
        </Flex>
      </Flex>
      <BAITable
        loading={{
          spinning:
            paginationState !== deferredPaginationState ||
            isActiveTypePending ||
            isPendingFilter,
          indicator: <LoadingOutlined />,
        }}
        bordered={false}
        dataSource={filterNonNullItems(user_list?.items)}
        sortDirections={['descend', 'ascend', 'descend']}
        showSorterTooltip={false}
        columns={[
          {
            title: '#',
            fixed: 'left',
            render: (text, record, index) => {
              ++index;
              return index;
            },
            width: 50,
            showSorterTooltip: false,
            rowScope: 'row',
          },
          {
            title: t('credential.UserID'),
            dataIndex: 'email',
            sorter: (a, b) => localeCompare(a.email, b.email),
          },
          {
            title: t('credential.Name'),
            dataIndex: 'username',
            sorter: (a, b) => localeCompare(a.username, b.username),
          },
          {
            title: t('credential.Role'),
            dataIndex: 'role',
            sorter: (a, b) => localeCompare(a.role, b.role),
          },
          {
            title: t('credential.MainAccessKey'),
            dataIndex: 'main_access_key',
            sorter: (a, b) =>
              localeCompare(a.main_access_key, b.main_access_key),
          },
          {
            title: t('credential.CreatedAt'),
            dataIndex: 'created_at',
            render: (text) => dayjs(text).format('lll'),
            sorter: (a, b) => localeCompare(a?.created_at, b?.created_at),
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
                      setSelectedUserEmail(record?.email || null);
                      toggleInfoModalOpen();
                    }}
                  />
                  <Button
                    type="link"
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      setSelectedUserEmail(record?.email || null);
                      toggleSettingModal();
                    }}
                  />
                  {activeType === 'active' && (
                    <Popconfirm
                      title={t('dialog.ask.DoYouWantToProceed')}
                      description={t('dialog.warning.CannotBeUndone')}
                      okButtonProps={{
                        loading: isInFlightCommitDeleteUser,
                      }}
                      okType="danger"
                      okText={t('button.Delete')}
                      onConfirm={() => {
                        commitDeleteUser({
                          variables: {
                            email: record?.email || '',
                          },
                          onCompleted: () => {
                            message.success(
                              t('credential.SignoutSuccessfullyFinished'),
                            );
                            startReloadTransition(() => {
                              updateUserListFetchKey();
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
        ]}
        pagination={{
          pageSize: paginationState.pageSize,
          current: paginationState.current,
          pageSizeOptions: ['10', '20', '50'],
          total: user_list?.total_count || 0,
          showSizeChanger: true,
          onChange(page, pageSize) {
            setPaginationState({
              current: page,
              pageSize: pageSize,
            });
          },
          style: {
            paddingRight: token.paddingContentHorizontalSM,
          },
        }}
        style={{ width: '100%' }}
      />
      <Suspense>
        <UserInfoModal
          userEmail={selectedUserEmail || ''}
          open={!!selectedUserEmail && isOpenInfoModal}
          onRequestClose={() => {
            toggleInfoModalOpen();
          }}
          afterClose={() => {
            setSelectedUserEmail(null);
          }}
        />
      </Suspense>
      <Suspense>
        <UserSettingModal
          userEmail={selectedUserEmail}
          open={isOpenSettingModal}
          onRequestClose={(success) => {
            if (success) {
              updateUserListFetchKey();
            }
            toggleSettingModal();
          }}
          afterClose={() => {
            setSelectedUserEmail(null);
          }}
        />
      </Suspense>
    </Flex>
  );
};

export default UserList;
