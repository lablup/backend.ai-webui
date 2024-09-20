import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { FilterOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  Switch,
  theme,
  Typography,
} from 'antd';
import Markdown from 'markdown-to-jsx';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

type Service = {
  url: string;
  inference_engine_version?: string;
  replica_number?: number;
};

interface ImportFromHuggingFaceModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const ImportFromHuggingFaceModal: React.FC<ImportFromHuggingFaceModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const formRef = useRef<FormInstance<Service>>(null);
  const [isImportOnly, { toggle: toggleIsImportOnly }] = useToggle(false);

  const handleOnClick = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        // TODO: Implement import from Hugging Face
        onRequestClose();
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      title={t('data.modelStore.ImportFromHuggingFace')}
      centered
      footer={
        <Button type="primary" htmlType="submit" onClick={handleOnClick}>
          {isImportOnly
            ? t('data.modelStore.Import')
            : t('data.modelStore.ImportAndStartService')}
        </Button>
      }
      onCancel={onRequestClose}
      {...baiModalProps}
    >
      <Form
        ref={formRef}
        preserve={false}
        layout="vertical"
        requiredMark="optional"
      >
        <Form.Item name="url" rules={[{ required: true }]}>
          <Input placeholder={t('data.modelStore.huggingFaceUrlPlaceholder')} />
        </Form.Item>
        <Card
          size="small"
          title={
            <Flex direction="row" gap="xs">
              <FilterOutlined />
              README.md
            </Flex>
          }
          styles={{
            body: {
              padding: token.paddingLG,
              overflow: 'auto',
              minHeight: 200,
              maxHeight: token.screenXS,
            },
          }}
        >
          <Markdown>{''}</Markdown>
        </Card>
        <Flex
          gap={'xs'}
          style={{ marginTop: token.marginLG, marginBottom: token.marginLG }}
        >
          <Switch
            checked={isImportOnly}
            onChange={(e) => {
              toggleIsImportOnly();
            }}
          />
          <Typography.Text>{t('data.modelStore.ImportOnly')}</Typography.Text>
        </Flex>
      </Form>
    </BAIModal>
  );
};

export default ImportFromHuggingFaceModal;
