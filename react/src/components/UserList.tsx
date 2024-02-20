import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal from './BAIModal';
import Flex from './Flex';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
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
import { Tabs, Table, theme, Button, Typography, message } from 'antd';
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
  const [messageApi, contextHolder] = message.useMessage();
  const baiClient = useSuspendedBackendaiClient();
  const [isPendingReload, startReloadTransition] = useTransition();
  const [userListFetchKey, updateUserListFetchKey] =
    useUpdatableState('initial-fetch');
  const [curTabKey, setCurTabKey] = useState('active');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
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
        $before: String
        $after: String
        $first: Int
        $last: Int
        $isTOTPSupported: Boolean!
      ) {
        user_nodes(
          filter: $filter
          before: $before
          after: $after
          first: $first
          last: $last
        ) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
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
      filter:
        curTabKey === 'active' ? 'status == "active"' : 'status != "active"',
      isTOTPSupported: totpSupported ?? false,
    },
    {
      fetchPolicy:
        userListFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
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
              loading={isPendingReload}
              icon={<SolutionOutlined />}
              style={{
                color: token.colorPrimary,
              }}
              onClick={() => {
                toggleUserInfoModal();
                setSelectedUserEmail(record.node?.email);
              }}
            />
            <Button
              size="large"
              type="text"
              loading={isPendingReload}
              icon={<SettingOutlined />}
              style={{
                color: token.colorInfo,
              }}
              onClick={() => {
                toggleUserSettingModal();
                setSelectedUserEmail(record.node?.email);
              }}
            />
            {curTabKey === 'active' ? (
              <Button
                size="large"
                type="text"
                danger
                loading={isPendingReload}
                icon={<DeleteOutlined />}
                onClick={() => {
                  toggleUserSignoutModal();
                  setSelectedUserEmail(record.node?.email);
                }}
              />
            ) : undefined}
          </Flex>
        );
      },
    },
  ];

  const userSignoutMutation = useTanMutation({
    mutationFn: (email: string) => {
      return baiClient.user.delete(email);
    },
  });

  const handleSignoutOk = () => {
    userSignoutMutation.mutate(selectedUserEmail, {
      onSuccess: () => {
        messageApi.open({
          type: 'success',
          content: t('credential.SignoutSeccessfullyFinished'),
        });
        toggleUserSignoutModal();
        startReloadTransition(() => {
          updateUserListFetchKey();
        });
      },
      onError: (e: any) => {
        messageApi.open({
          type: 'error',
          content: e.message,
        });
        toggleUserSignoutModal();
      },
    });
  };
  return (
    <Flex direction="column" align="stretch">
      <Tabs
        activeKey={curTabKey}
        onChange={(key) => setCurTabKey(key)}
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
      />
      <Suspense fallback={<div>loading..</div>}>
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={(user_nodes?.edges || []) as UserNode[]}
          style={{
            width: '100%',
            paddingLeft: token.paddingMD,
            paddingRight: token.paddingMD,
            borderTopLeftRadius: token.borderRadius,
            borderTopRightRadius: token.borderRadius,
          }}
        />
        <UserInfoModal
          draggable
          open={isOpenUserInfoModal}
          onRequestClose={toggleUserInfoModal}
          email={selectedUserEmail}
        />
        <UserSettingModal
          draggable
          open={isOpenUserSettingModal}
          onRequestOk={() => {
            toggleUserSettingModal();
            startReloadTransition(() => {
              updateUserListFetchKey();
            });
          }}
          onRequestClose={toggleUserSettingModal}
          email={selectedUserEmail}
        />
        <BAIModal
          open={isOpenUserSignoutModal}
          title={t('dialog.title.LetsDouble-Check')}
          onOk={handleSignoutOk}
          okText={t('button.Okay')}
          okButtonProps={{ danger: true }}
          onCancel={toggleUserSignoutModal}
          cancelText={t('button.Cancel')}
        >
          <Flex direction="column" align="start" gap={'xxs'}>
            <Typography.Text>
              {t('credential.ConfirmSignoutUser')}
            </Typography.Text>
            <Flex justify="center" style={{ width: '100%' }}>
              <Typography.Text type="danger" strong>
                {selectedUserEmail}
              </Typography.Text>
            </Flex>
            <Typography.Text>
              {t('dialog.ask.DoYouWantToProceed')}
            </Typography.Text>
          </Flex>
        </BAIModal>
      </Suspense>
      {contextHolder}
    </Flex>
  );
};

export default UserList;
