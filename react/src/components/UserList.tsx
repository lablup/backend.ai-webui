import { filterNonNullItems, localeCompare } from '../helper';
import { useUpdatableState } from '../hooks';
import BAIPropertyFilter from './BAIPropertyFilter';
import BAITable from './BAITable';
import Flex from './Flex';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import {
  UserListQuery,
  UserListQuery$data,
} from './__generated__/UserListQuery.graphql';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Radio, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import { Suspense, useDeferredValue, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type User = NonNullable<
  NonNullable<UserListQuery$data>['user_list']
>['items'][number];

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [isActiveTypePending, startActiveTypeTransition] = useTransition();
  const [isOpenInfoModal, { toggle: toggleInfoModalOpen }] = useToggle(false);
  const [isOpenSettingModal, { toggle: toggleSettingModal }] = useToggle(false);
  const [userListFetchKey, updateUserListFetchKey] =
    useUpdatableState('initial-fetch');
  const [isPendingReload, startReloadTransition] = useTransition();
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null,
  );
  const [paginationState, setPaginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 10,
  });
  const deferredPaginationState = useDeferredValue(paginationState);

  /**FIXME:
   * There is currently an issue with using @skipOnClient or @include within a Fragment.
   * So it is currently implemented to use independent queries within `UserInfoModal.tsx` and `UserSettingModal.tsx`.
   *
   * Issue 1. @skipOnClient does not work inside a fragment.
   * Issue 2. variables used in @include or other conditions can't be referenced in fragment with more than 2depth
   * */
  const { user_list } = useLazyLoadQuery<UserListQuery>(
    graphql`
      query UserListQuery($limit: Int!, $offset: Int!, $is_active: Boolean!) {
        user_list(limit: $limit, offset: $offset, is_active: $is_active) {
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
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey: userListFetchKey,
    },
  );

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
      >
        <Flex gap={token.marginXS}>
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
            filterProperties={[
              {
                key: 'id',
                propertyLabel: 'ID',
                type: 'string',
              },
              {
                key: 'addr',
                propertyLabel: t('agent.Endpoint'),
                type: 'string',
              },
              {
                key: 'schedulable',
                propertyLabel: t('agent.Schedulable'),
                type: 'boolean',
                options: [
                  {
                    label: t('general.Enabled'),
                    value: 'true',
                  },
                  {
                    label: t('general.Disabled'),
                    value: 'false',
                  },
                ],
              },
            ]}
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
            paginationState !== deferredPaginationState || isActiveTypePending,
          indicator: <LoadingOutlined />,
        }}
        bordered={false}
        dataSource={filterNonNullItems(user_list?.items) as User[]}
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
            sorter: (a, b) => localeCompare(a.access_key, b.access_key),
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
                  <Button type="link" danger icon={<DeleteOutlined />} />
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
