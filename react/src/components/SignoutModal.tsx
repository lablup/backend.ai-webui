/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { message } from '../app-shim';
// Ticket 34: `Form` is the self-hosted engine (was the antd SHIM).
import { Form, type FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import {
  BAIModal,
  BAIModalProps,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SignoutModalProps extends BAIModalProps {
  open: boolean;
  onRequestClose: () => void;
}

const SignoutModal: React.FC<SignoutModalProps> = ({
  open,
  onRequestClose,
  ...modalProps
}) => {
  const formRef = useRef<FormInstance>(null);
  const { t } = useTranslation();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();
  const signoutMutation = useTanMutation({
    mutationFn: (values: { email: string; password: string }) => {
      return baiClient.signout(values.email, values.password);
    },
  });
  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        signoutMutation.mutate(
          {
            email: values.email,
            password: values.password,
          },
          {
            onSuccess: () => {
              const event = new CustomEvent('backend-ai-logout');
              document.dispatchEvent(event);
            },
            onError: (e) => {
              message.open({
                type: 'error',
                content: getErrorMessage(e),
              });
            },
          },
        );
      })
      .catch(() => {});
  };
  return (
    <BAIModal
      title={t('login.LeaveService')}
      centered
      width={450}
      open={open}
      onOk={handleOk}
      okText={t('login.LeaveService')}
      okButtonProps={{ danger: true }}
      confirmLoading={signoutMutation.isPending}
      onCancel={() => {
        onRequestClose();
      }}
      {...modalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        labelCol={{ span: 6 }}
        disabled={signoutMutation.isPending}
      >
        {/* The warning was wrapped in a state-less `Form.Item name="alert"`
            purely for spacing; it holds no field value, so the wrapper goes
            and the `Alert` becomes an Astryx `Banner` (MAPPING §4). */}
        <Banner title={t('login.DescConfirmLeave')} status="warning" />
        <BAIFormItem
          name="email"
          label={t('general.E-Mail')}
          required
          rules={[
            () => ({
              validator(_, value) {
                if (!value) {
                  return Promise.reject(
                    new Error(t('webui.menu.InvalidBlankEmail')),
                  );
                } else if (value !== baiClient.email) {
                  return Promise.reject(
                    new Error(t('webui.menu.DisMatchUserEmail')),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <AstryxFormTextInput label={t('general.E-Mail')} />
        </BAIFormItem>
        <BAIFormItem
          name="password"
          label={t('general.Password')}
          required
          rules={[
            () => ({
              validator(_, value) {
                if (!value) {
                  return Promise.reject(
                    new Error(t('webui.menu.InvalidBlankPassword')),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <AstryxFormTextInput type="password" label={t('general.Password')} />
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default SignoutModal;
