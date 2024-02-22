import BAIModal, { BAIModalProps } from './BAIModal';
import { UserGenerationModalMutation } from './__generated__/UserGenerationModalMutation.graphql';
import { Form, Input, message } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';

interface UserGenerationModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const UserGenerationModal: React.FC<UserGenerationModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const [commitCreateUser, isInFlightCommitCreateUser] =
    useMutation<UserGenerationModalMutation>(graphql`
      mutation UserGenerationModalMutation(
        $email: String!
        $props: UserInput!
      ) {
        create_user(email: $email, props: $props) {
          ok
          msg
          user {
            id
            email
            username
            need_password_change
            full_name
            description
            status
            domain_name
            role
          }
        }
      }
    `);

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        commitCreateUser({
          variables: {
            email: values?.email || '',
            props: {
              username: values.name ?? values.email,
              password: values.password,
              need_password_change: false,
              domain_name: 'default',
            },
          },
          onCompleted(res) {
            if (res?.create_user?.ok) {
              message.success(t('credential.UserAccountCreated'));
            } else {
              message.error(res?.create_user?.msg);
            }
            onRequestClose();
          },
          onError(err) {
            message.error(err?.message);
          },
        });
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose={true}
      centered
      title={t('credential.CreateUser')}
      okText={t('button.Add')}
      onOk={onSubmit}
      onCancel={onRequestClose}
      confirmLoading={isInFlightCommitCreateUser}
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
            () => ({
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
                } else if (!value) {
                  return Promise.reject(
                    new Error(t('webui.menu.InvalidPasswordMessage')),
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
  );
};

export default UserGenerationModal;
