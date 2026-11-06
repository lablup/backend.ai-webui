/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import BAIFormItem from './BAIFormItem';
import {
  BAIModal,
  BAIModalProps,
  BAITextArea,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SSHKeypairManagementModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
}

const SSHKeypairManagementModal: React.FC<SSHKeypairManagementModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance>(null);

  const { data, isFetching, refetch } = useTanQuery<{
    ssh_public_key: string;
  }>({
    queryKey: ['fetchSSHKeypair'],
    queryFn: () => baiClient.fetchSSHKeypair(),
    enabled: !!modalProps.open,
  });

  // Hook-level callbacks, not `mutate(…, { onSuccess })`: per-call callbacks
  // never fire once the modal has unmounted.
  const mutationToPostSSHKeypair = useTanMutation({
    mutationFn: (values: { pubkey: string }) =>
      baiClient.postSSHKeypair(values),
    onSuccess: () => {
      message.success(t('userSettings.SSHKeypairEnterManuallyFinished'));
      refetch();
      onRequestClose(true);
    },
    onError: (error) => {
      message.error(getErrorMessage(error));
    },
  });

  return (
    <BAIModal
      title={t('userSettings.SSHKeypairManagement')}
      okText={t('button.Save')}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            mutationToPostSSHKeypair.mutate(values);
          })
          .catch(() => {});
      }}
      onCancel={() => onRequestClose()}
      confirmLoading={mutationToPostSSHKeypair.isPending}
      {...modalProps}
    >
      {/* Remounts once the key arrives so the field starts from it. */}
      <Form
        key={data ? 'loaded' : 'loading'}
        ref={formRef}
        preserve={false}
        layout="vertical"
        initialValues={{ pubkey: data?.ssh_public_key ?? '' }}
      >
        <BAIFormItem
          name="pubkey"
          label={t('userSettings.PublicKey')}
          rules={[{ required: true, message: t('settings.InputRequired') }]}
        >
          <BAITextArea
            aria-label={t('userSettings.PublicKey')}
            placeholder={t('userSettings.NoExistingSSHKeypair')}
            disabled={isFetching && !data}
            rows={6}
          />
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default SSHKeypairManagementModal;
