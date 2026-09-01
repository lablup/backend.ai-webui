/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Banner } from '@astryxdesign/core/Banner';
import { Link } from '@astryxdesign/core/Link';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import {
  BAIFlex,
  BAIMetadataList,
  BAIModal,
  BAIModalProps,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface VNCConnectionInfoModalProps extends BAIModalProps {
  host?: string;
  port: number;
}

const VNCConnectionInfoModal: React.FC<VNCConnectionInfoModalProps> = ({
  host = '127.0.0.1',
  port,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const vncDisplayUrl = `vnc://${host}:${port}`;
  const vncHref = `vnc://${host}:${port}`;

  return (
    <BAIModal title={t('session.VNCconnection')} footer={null} {...modalProps}>
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner status="info" title={t('session.UseYourFavoriteVNCApp')} />
        <BAIMetadataList
          columns="single"
          title={t('session.ConnectionInformation')}
        >
          <MetadataListItem label="VNC URL">
            <Link href={vncHref} target="_blank">
              {vncDisplayUrl}
            </Link>
          </MetadataListItem>
        </BAIMetadataList>
      </BAIFlex>
    </BAIModal>
  );
};

export default VNCConnectionInfoModal;
