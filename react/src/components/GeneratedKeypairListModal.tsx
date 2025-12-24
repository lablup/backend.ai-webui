import { localeCompare } from '../helper';
import { exportCSVWithFormattingRules } from '../helper/csv-util';
import { Alert } from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIText,
} from 'backend.ai-ui';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  GeneratedKeypairListModalFragment$data,
  GeneratedKeypairListModalFragment$key,
} from 'src/__generated__/GeneratedKeypairListModalFragment.graphql';

type KeypairType = NonNullable<
  NonNullable<GeneratedKeypairListModalFragment$data>[number]
>;

interface GeneratedKeypairListModalProps
  extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
  keypairFragment: GeneratedKeypairListModalFragment$key;
  onRequestClose: () => void;
}

const GeneratedKeypairListModal: React.FC<GeneratedKeypairListModalProps> = ({
  keypairFragment,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const keypairData = useFragment(
    graphql`
      fragment GeneratedKeypairListModalFragment on KeyPair
      @relay(plural: true) {
        access_key
        secret_key
        user_info {
          email
        }
      }
    `,
    keypairFragment,
  );

  const handleDownload = () => {
    if (!keypairData) return;

    exportCSVWithFormattingRules(
      _.map(keypairData, (keypair) => {
        return {
          email: keypair?.user_info?.email,
          'access key': keypair?.access_key,
          'secret key': keypair?.secret_key,
        };
      }),
      'backendai_api_keypair',
    );
  };

  return (
    <BAIModal
      title={t('credential.NewCredentialCreated')}
      width={600}
      destroyOnHidden
      okText={t('button.Download')}
      onOk={handleDownload}
      okButtonProps={{
        icon: <DownloadIcon />,
      }}
      cancelText={t('button.Close')}
      onCancel={onRequestClose}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Alert
          showIcon
          type="success"
          message={t('credential.GeneratedKeypairSuccess')}
        />
        <Alert
          showIcon
          type="warning"
          message={t('credential.GeneratedKeypairWarning')}
        />
        <BAIText>{t('credential.GeneratedKeypairInfo')}</BAIText>
        <BAITable<KeypairType>
          size="small"
          style={{ overflowX: 'auto' }}
          scroll={{ x: 'max-content', y: 500 }}
          pagination={false}
          dataSource={keypairData}
          rowKey={'access_key'}
          columns={[
            {
              title: t('general.E-Mail'),
              dataIndex: ['user_info', 'email'],
              key: 'email',
              sorter: (a, b) =>
                localeCompare(a?.user_info?.email, b?.user_info?.email),
              defaultSortOrder: 'ascend',
            },
            {
              title: t('credential.AccessKey'),
              dataIndex: 'access_key',
              key: 'access_key',
              render: (value) => (
                <BAIText copyable monospace>
                  {value}
                </BAIText>
              ),
              sorter: (a, b) => localeCompare(a?.access_key, b?.access_key),
            },
            {
              title: t('credential.SecretKey'),
              dataIndex: 'secret_key',
              key: 'secret_key',
              render: (value) => (
                <BAIText copyable={{ text: value }}>**********</BAIText>
              ),
              sorter: (a, b) => localeCompare(a?.secret_key, b?.secret_key),
            },
          ]}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default GeneratedKeypairListModal;
