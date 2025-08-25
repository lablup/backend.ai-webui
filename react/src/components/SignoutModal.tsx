import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Form, Input, message, Alert, FormInstance } from 'antd';
import { useErrorMessageResolver } from 'backend.ai-ui';
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
  const [messageApi, contextHolder] = message.useMessage();
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
              messageApi.open({
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
    <>
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
          <Form.Item name="alert">
            <Alert message={t('login.DescConfirmLeave')} type="warning" />
          </Form.Item>
          <Form.Item
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
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
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
            <Input.Password />
          </Form.Item>
        </Form>
      </BAIModal>
      {contextHolder}
    </>
  );
};

export default SignoutModal;
