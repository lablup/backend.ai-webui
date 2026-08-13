/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Banner } from '@astryxdesign/core/Banner';
import { Link } from '@astryxdesign/core/Link';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface XRDPConnectionInfoModalProps extends BAIModalProps {
  host?: string;
  port: number;
}

const XRDPConnectionInfoModal: React.FC<XRDPConnectionInfoModalProps> = ({
  host = '127.0.0.1',
  port,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const rdpUrl = `rdp://${host}:${port}`;

  return (
    <BAIModal title={t('session.XRDPconnection')} footer={null} {...modalProps}>
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner status="info" title={t('session.UseYourFavoriteMSTSCApp')} />
        <MetadataList
          columns="single"
          title={t('session.ConnectionInformation')}
        >
          <MetadataListItem label="RDP URL">
            <Link href={rdpUrl} target="_blank">
              {rdpUrl}
            </Link>
          </MetadataListItem>
        </MetadataList>
      </BAIFlex>
    </BAIModal>
  );
};

export default XRDPConnectionInfoModal;
