import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { Form, FormInstance, Input, Typography, theme } from 'antd';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SSHKeypairManualFormModalProps extends BAIModalProps {
  onRequestClose: () => void;
  onRequestRefresh: () => void;
}

const SSHKeypairManualFormModal: React.FC<SSHKeypairManualFormModalProps> = ({
  onRequestClose,
  onRequestRefresh,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance>(null);

  const mutationToPostSSHKeypair = useTanMutation({
    mutationFn: (values: { pubkey: string; privkey: string }) => {
      return baiClient.postSSHKeypair(values);
    },
  });

  return (
    <BAIModal
      title={t('usersettings.SSHKeypairEnterManually')}
      okText={t('button.Save')}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            mutationToPostSSHKeypair.mutate(values, {
              onSuccess: () => {
                onRequestRefresh();
              },
            });
            onRequestClose();
          })
          .catch(() => {});
      }}
      destroyOnClose={true}
      {...baiModalProps}
    >
      <Form
        ref={formRef}
        preserve={false}
        layout="vertical"
        requiredMark="optional"
      >
        <Form.Item
          name="pubkey"
          label={
            <Typography.Text strong>
              {t('usersettings.PublicKey')}
            </Typography.Text>
          }
          rules={[{ required: true, message: t('settings.InputRequired') }]}
        >
          <Input.TextArea
            rows={5}
            // color of "ant-typography pre" class
            style={{ backgroundColor: 'rgba(150, 150, 150, 0.1)' }}
          />
        </Form.Item>
        <Form.Item
          name="privkey"
          label={
            <Typography.Text strong>
              {t('usersettings.PrivateKey')}
            </Typography.Text>
          }
          rules={[{ required: true, message: t('settings.InputRequired') }]}
        >
          <Input.TextArea
            rows={5}
            // color of "ant-typography pre" class
            style={{ backgroundColor: 'rgba(150, 150, 150, 0.1)' }}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default SSHKeypairManualFormModal;
