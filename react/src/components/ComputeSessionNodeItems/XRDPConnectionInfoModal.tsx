'use memo';

import { Alert, Descriptions, Typography } from 'antd';
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
  const { t } = useTranslation();
  const rdpUrl = `rdp://${host}:${port}`;

  return (
    <BAIModal title={t('session.XRDPconnection')} footer={null} {...modalProps}>
      <BAIFlex direction="column" align="stretch" gap="md">
        <Alert
          title={t('session.UseYourFavoriteMSTSCApp')}
          type="info"
          showIcon
        />
        <Descriptions
          column={1}
          bordered
          size="small"
          title={t('session.ConnectionInformation')}
        >
          <Descriptions.Item label="RDP URL">
            <Typography.Link href={rdpUrl} target="_blank">
              {rdpUrl}
            </Typography.Link>
          </Descriptions.Item>
        </Descriptions>
      </BAIFlex>
    </BAIModal>
  );
};

export default XRDPConnectionInfoModal;
