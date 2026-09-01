/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  GeneratedKeypairListModalFragment$data,
  GeneratedKeypairListModalFragment$key,
} from '../__generated__/GeneratedKeypairListModalFragment.graphql';
import { localeCompare } from '../helper';
import { exportCSVWithFormattingRules } from '../helper/csv-util';
import { Banner } from '@astryxdesign/core/Banner';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIText,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { DownloadIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type KeypairType = NonNullable<
  NonNullable<GeneratedKeypairListModalFragment$data>[number]
>;

interface GeneratedKeypairListModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  keypairFragment: GeneratedKeypairListModalFragment$key;
  onRequestClose: () => void;
}

const GeneratedKeypairListModal: React.FC<GeneratedKeypairListModalProps> = ({
  keypairFragment,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const keypairData = useFragment(
    graphql`
      fragment GeneratedKeypairListModalFragment on CreateKeypairPayload
      @relay(plural: true) {
        secretKey
        keypair {
          accessKey
          user {
            basicInfo {
              email
            }
          }
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
          email: keypair?.keypair?.user?.basicInfo?.email,
          'access key': keypair?.keypair?.accessKey,
          'secret key': keypair?.secretKey,
        };
      }),
      'backendai_api_keypair',
    );
  };

  return (
    <BAIModal
      title={t('credential.NewCredentialCreated')}
      // 600 left the three columns at 200px each, one of which cannot fit an
      // access key plus its copy button; 780 clears the table's natural width
      // so the default view needs no horizontal scroll (FR-3519).
      width={780}
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
        <Banner
          status="success"
          title={t('credential.GeneratedKeypairSuccess')}
        />
        <Banner
          status="warning"
          title={t('credential.GeneratedKeypairWarning')}
        />
        <BAIText>{t('credential.GeneratedKeypairInfo')}</BAIText>
        {/* No `scroll` prop: Astryx's scroll wrapper owns overflow here, and
            these columns take their floors from `minWidth`. */}
        <BAITable<KeypairType>
          size="small"
          resizable
          pagination={false}
          dataSource={keypairData}
          rowKey={(record) => record?.keypair?.accessKey ?? ''}
          columns={[
            {
              title: t('general.E-Mail'),
              dataIndex: ['keypair', 'user', 'basicInfo', 'email'],
              key: 'email',
              sorter: (a, b) =>
                localeCompare(
                  a?.keypair?.user?.basicInfo?.email,
                  b?.keypair?.user?.basicInfo?.email,
                ),
              defaultSortOrder: 'ascend',
            },
            {
              title: t('credential.AccessKey'),
              dataIndex: ['keypair', 'accessKey'],
              key: 'access_key',
              // Widest cell in the table: 20 monospace chars plus the copy
              // button. Without a floor it takes an equal third and clips the
              // button, since `<td>` is `overflow: hidden` (FR-3519).
              minWidth: 240,
              render: (value) => (
                <BAIText copyable monospace>
                  {value}
                </BAIText>
              ),
              sorter: (a, b) =>
                localeCompare(a?.keypair?.accessKey, b?.keypair?.accessKey),
            },
            {
              title: t('credential.SecretKey'),
              dataIndex: 'secretKey',
              key: 'secret_key',
              render: (value) => (
                <BAIText copyable={{ text: value }}>**********</BAIText>
              ),
              sorter: (a, b) => localeCompare(a?.secretKey, b?.secretKey),
            },
          ]}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default GeneratedKeypairListModal;
