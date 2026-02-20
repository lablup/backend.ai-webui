/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Alert, Descriptions, Typography } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
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
  // Note: Original code uses ssh:// in href but displays vnc://
  const vncHref = `vnc://${host}:${port}`;

  return (
    <BAIModal title={t('session.VNCconnection')} footer={null} {...modalProps}>
      <BAIFlex direction="column" align="stretch" gap="md">
        <Alert
          title={t('session.UseYourFavoriteVNCApp')}
          type="info"
          showIcon
        />
        <Descriptions
          column={1}
          bordered
          size="small"
          title={t('session.ConnectionInformation')}
        >
          <Descriptions.Item label="VNC URL">
            <Typography.Link href={vncHref} target="_blank">
              {vncDisplayUrl}
            </Typography.Link>
          </Descriptions.Item>
        </Descriptions>
      </BAIFlex>
    </BAIModal>
  );
};

export default VNCConnectionInfoModal;
