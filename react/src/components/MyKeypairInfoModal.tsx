/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { MyKeypairInfoModalQuery } from '../__generated__/MyKeypairInfoModalQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { Button, Table, Typography, Tag } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface MyKeypairInfoModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const MyKeypairInfoModal: React.FC<MyKeypairInfoModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const [userInfo] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();
  const { data: keypairs } = useTanQuery({
    queryKey: ['baiClient.keypair.list', baiModalProps.open], // refetch on open state
    queryFn: () => {
      return baiModalProps.open
        ? baiClient.keypair
            .list(
              userInfo.email,
              ['access_key', 'secret_key', 'is_active'],
              true,
            )
            .then((res: any) => res.keypairs)
        : null;
    },
    staleTime: 0,
  });

  const supportMainAccessKey = baiClient?.supports('main-access-key');

  const { user } = useLazyLoadQuery<MyKeypairInfoModalQuery>(
    graphql`
      query MyKeypairInfoModalQuery($email: String) {
        user(email: $email) {
          email
          main_access_key @since(version: "23.09.7")
        }
      }
    `,
    {
      email: userInfo.email,
    },
  );

  return (
    <BAIModal
      {...baiModalProps}
      title={t('userSettings.MyKeypairInfo')}
      centered
      onCancel={onRequestClose}
      destroyOnClose
      width={'auto'}
      footer={[
        <Button
          key="keypairInfoClose"
          onClick={() => {
            onRequestClose();
          }}
        >
          {t('button.Close')}
        </Button>,
      ]}
    >
      <Table
        scroll={{ x: 'max-content' }}
        rowKey={'access_key'}
        dataSource={keypairs}
        columns={[
          {
            title: t('general.AccessKey'),
            key: 'accessKey',
            dataIndex: 'access_key',
            fixed: 'left',
            render: (value) => (
              <Flex direction="column" align="start">
                <Typography.Text ellipsis copyable>
                  {value}
                </Typography.Text>
                {supportMainAccessKey && value === user?.main_access_key && (
                  <Tag color={'red'}>{t('credential.MainAccessKey')}</Tag>
                )}
              </Flex>
            ),
          },
          {
            title: t('general.SecretKey'),
            key: 'secretKey',
            dataIndex: 'secret_key',
            fixed: 'left',
            render: (value) => (
              <Typography.Text ellipsis copyable>
                {value}
              </Typography.Text>
            ),
          },
        ]}
      />
    </BAIModal>
  );
};

export default MyKeypairInfoModal;
