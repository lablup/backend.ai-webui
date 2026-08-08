/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIFormItem from './BAIFormItem';
import { AstryxFormTextArea } from './astryx-bui/astryxFormControls';
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
      {/* PILOT-DECISION: the antd `Input.TextArea` sites carried a hand-rolled
          `backgroundColor: rgba(150,150,150,.1)` (mimicking
          `.ant-typography pre`'s tint) — `AstryxFormTextArea` has no `style`
          escape hatch, dropped; the textarea's own default surface stands
          in. */}
      <Form ref={formRef} preserve={false} layout="vertical">
        <BAIFormItem
          name="pubkey"
          label={t('userSettings.PublicKey')}
          rules={[{ required: true, message: t('settings.InputRequired') }]}
        >
          <AstryxFormTextArea label={t('userSettings.PublicKey')} rows={5} />
        </BAIFormItem>
        <BAIFormItem
          name="privkey"
          label={t('userSettings.PrivateKey')}
          rules={[{ required: true, message: t('settings.InputRequired') }]}
        >
          <AstryxFormTextArea label={t('userSettings.PrivateKey')} rows={5} />
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default SSHKeypairManualFormModal;
