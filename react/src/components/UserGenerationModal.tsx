import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Form, Input, message } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UserGenerationModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const UserGenerationModal: React.FC<UserGenerationModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: defaultGroupId } = useTanQuery({
    queryKey: ['baiClient', 'group', 'list'],
    queryFn: () =>
      baiClient.group.list().then((res: any) => {
        return res.groups.find((x: any) => x.name === 'default').id;
      }),
  });
  const userCreationMutation = useTanMutation({
    mutationFn: (values: { email: string; name: string; password: string }) => {
      return baiClient.user.create(values.email, {
        username: values.name,
        password: values.password,
        need_password_change: false,
        full_name: values.name,
        description: `${values.name ?? values.email}'s Account`,
        is_active: true,
        domain_name: 'default',
        role: 'user',
        group_ids: [defaultGroupId],
      });
    },
  });
  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        userCreationMutation.mutate(
          {
            email: values.email,
            name: values.name ?? values.email,
            password: values.password,
          },
          {
            onSuccess: () => {
              messageApi.open({
                type: 'success',
                content: t('credential.UserAccountCreated'),
              });
              onRequestClose();
            },
            onError: (e: any) => {
              messageApi.open({
                type: 'error',
                content: e.message,
              });
              onRequestClose();
            },
          },
        );
      })
      .catch(() => {});
  };
  return (
    <>
      <BAIModal
        {...baiModalProps}
        title={t('credential.CreateUser')}
        okText={t('button.Add')}
        onOk={onSubmit}
        onCancel={onRequestClose}
      >
        <Form
          layout="vertical"
          labelCol={{ span: 8 }}
          form={form}
          preserve={false}
        >
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
              {
                type: 'email',
                message: t('credential.validation.InvalidEmailAddress'),
              },
            ]}
          >
            <Input placeholder={t('maxLength.64chars')} maxLength={64} />
          </Form.Item>
          <Form.Item name="name" label={t('general.Username')}>
            <Input placeholder={t('maxLength.64chars')} maxLength={64} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('general.Password')}
            required
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(
                      new Error(t('webui.menu.InvalidPasswordMessage')),
                    );
                  }
                  return Promise.resolve();
                },
              }),
              {
                pattern: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/,
                message: t('webui.menu.InvalidPasswordMessage'),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="passwordConfirm"
            label={t('general.ConfirmPassword')}
            dependencies={['password']}
            required
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('password') !== value) {
                    return Promise.reject(
                      new Error(t('webui.menu.NewPasswordMismatch')),
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

export default UserGenerationModal;
