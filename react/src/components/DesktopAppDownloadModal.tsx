import { useAppDownloadMap } from '../hooks';
import { DownloadOutlined } from '@ant-design/icons';
import { Select, Button, Descriptions, Tooltip } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import { map, toUpper } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DesktopAppDownloadModalProps extends BAIModalProps {
  onRequestClose?: () => void;
}

const DesktopAppDownloadModal: React.FC<DesktopAppDownloadModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { selectedOS, setSelectedOS, OS, architectures, getDownloadLink } =
    useAppDownloadMap();

  return (
    <BAIModal
      title={t('summary.DownloadWebUIApp')}
      onCancel={onRequestClose}
      footer={null}
      {...baiModalProps}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label={'OS'}>
          <Select
            value={selectedOS}
            onChange={(value) => setSelectedOS(value)}
            style={{ width: '100%' }}
          >
            {map(OS, (os) => (
              <Select.Option key={os} value={os}>
                {os}
              </Select.Option>
            ))}
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label={t('webui.menu.Architecture')}>
          <BAIFlex gap={'xs'} justify="between">
            {map(architectures, (arch: 'arm64' | 'x64') => (
              <Tooltip title={t('webui.menu.ClickToDownload')} key={arch}>
                <Button
                  key={arch}
                  onClick={() => window.open(getDownloadLink(arch), '_blank')}
                  style={{ flex: 1 }}
                  variant="outlined"
                  color="primary"
                  icon={<DownloadOutlined />}
                >
                  {toUpper(arch)}
                </Button>
              </Tooltip>
            ))}
          </BAIFlex>
        </Descriptions.Item>
      </Descriptions>
    </BAIModal>
  );
};

export default DesktopAppDownloadModal;
