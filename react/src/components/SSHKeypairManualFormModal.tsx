/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { Form, type FormInstance, Input, Typography } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
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
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance>(null);

  const mutationToPostSSHKeypair = useTanMutation({
    mutationFn: (values: { pubkey: string; privkey: string }) => {
      return baiClient.postSSHKeypair(values);
    },
  });

  return (
    <BAIModal
      title={t('userSettings.SSHKeypairEnterManually')}
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
      destroyOnHidden={true}
      {...baiModalProps}
    >
      <Form ref={formRef} preserve={false} layout="vertical">
        <Form.Item
          name="pubkey"
          label={
            <Typography.Text strong>
              {t('userSettings.PublicKey')}
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
              {t('userSettings.PrivateKey')}
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
