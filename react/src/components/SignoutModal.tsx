import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Form, Input, message, Alert } from 'antd';
import React from 'react';
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
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const baiClient = useSuspendedBackendaiClient();
  const mutationToSignout = useTanMutation({
    mutationFn: (values: { email: string; password: string }) => {
      return baiClient.signout(values.email, values.password);
    },
  });
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        mutationToSignout.mutate(
          {
            email: values.email,
            password: values.password,
          },
          {
            onSuccess: () => {
              const event = new CustomEvent('backend-ai-logout');
              document.dispatchEvent(event);
            },
            onError: (e: any) => {
              messageApi.open({
                type: 'error',
                content: e.message,
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
        title={t('webui.menu.LeaveService')}
        centered
        width={450}
        open={open}
        onOk={handleOk}
        okText={t('webui.menu.LeaveService')}
        onCancel={() => {
          onRequestClose();
        }}
        {...modalProps}
      >
        <Form form={form} labelCol={{ span: 6 }}>
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
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input />
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
