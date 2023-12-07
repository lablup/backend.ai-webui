/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Button, theme, Table, Typography } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface KeypairInfoModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const KeypairInfoModal: React.FC<KeypairInfoModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [userInfo] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();

  const { data: keypairs } = useTanQuery<
    {
      secret_key: string;
      access_key: string;
    }[]
  >(
    'baiClient.keypair.list',
    () => {
      return baiClient.keypair
        .list(userInfo.email, ['access_key', 'secret_key', 'is_active'], true)
        .then((res: any) => res.keypairs);
    },
    {
      suspense: true,
    },
  );

  return (
    <BAIModal
      {...baiModalProps}
      title={t('usersettings.MyKeypairInfo')}
      centered
      onCancel={onRequestClose}
      destroyOnClose
      footer={[
        <Button
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
            title: '#',
            fixed: 'left',
            render: (id, record, index) => {
              ++index;
              return index;
            },
            showSorterTooltip: false,
          },
          {
            title: t('general.AccessKey'),
            dataIndex: 'access_key',
            fixed: 'left',
            render: (value) => (
              <Typography.Text ellipsis copyable style={{ width: 150 }}>
                {value}
              </Typography.Text>
            ),
          },
          {
            title: t('general.SecretKey'),
            dataIndex: 'secret_key',
            fixed: 'left',
            render: (value) => (
              <Typography.Text ellipsis copyable style={{ width: 150 }}>
                {value}
              </Typography.Text>
            ),
          },
        ]}
      ></Table>
    </BAIModal>
  );
};

export default KeypairInfoModal;
