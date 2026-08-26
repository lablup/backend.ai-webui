/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { BAIMetadataList, BAIModal, BAIModalProps } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface TCPConnectionInfoModalProps extends BAIModalProps {
  appName: string;
  host: string;
  port: number;
}

const TCPConnectionInfoModal: React.FC<TCPConnectionInfoModalProps> = ({
  appName,
  host,
  port,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();

  return (
    <BAIModal
      title={t('session.appLauncher.TCPConnection')}
      footer={null}
      {...modalProps}
    >
      <BAIMetadataList
        columns="single"
        title={t('session.ConnectionInformation')}
      >
        <MetadataListItem label={t('environment.AppName')}>
          {appName}
        </MetadataListItem>
        <MetadataListItem label={t('session.Host')}>{host}</MetadataListItem>
        <MetadataListItem label={t('session.Port')}>{port}</MetadataListItem>
      </BAIMetadataList>
    </BAIModal>
  );
};

export default TCPConnectionInfoModal;
