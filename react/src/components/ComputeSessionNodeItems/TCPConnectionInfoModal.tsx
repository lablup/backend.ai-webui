'use memo';

import { Descriptions } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
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
  const { t } = useTranslation();

  return (
    <BAIModal
      title={t('session.appLauncher.TCPConnection')}
      footer={null}
      {...modalProps}
    >
      <Descriptions
        column={1}
        bordered
        size="small"
        title={t('session.ConnectionInformation')}
      >
        <Descriptions.Item label={t('environment.AppName')}>
          {appName}
        </Descriptions.Item>
        <Descriptions.Item label={t('session.Host')}>{host}</Descriptions.Item>
        <Descriptions.Item label={t('session.Port')}>{port}</Descriptions.Item>
      </Descriptions>
    </BAIModal>
  );
};

export default TCPConnectionInfoModal;
