/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAnonymousBackendaiClient } from '../hooks';
import { App, Form, Input } from 'antd';
import { BAIButton, BAIFlex, BAIModal } from 'backend.ai-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ViewState = 'change-password' | 'invalid-token';

interface ChangePasswordViewProps {
  apiEndpoint: string;
  active: boolean;
}

interface ChangePasswordFormValues {
  email: string;
  password1: string;
  password2: string;
}

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/;

const readTokenFromUrl = () =>
  new URLSearchParams(window.location.search).get('token') || '';

const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({
  apiEndpoint,
  active,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<ChangePasswordFormValues>();

  // token is derived from URL params which are stable for the lifetime of this page
  const [initialToken] = useState(readTokenFromUrl);
  const token = useRef(initialToken);

  const [viewState, setViewState] = useState<ViewState>(
    initialToken ? 'change-password' : 'invalid-token',
  );

  const anonBaiClient = useAnonymousBackendaiClient({
    api_endpoint: apiEndpoint,
  });

  const redirectToLoginPage = () => {
    window.location.href = '/';
  };

  const handleUpdatePassword = async () => {
    const values = await form.validateFields().catch(() => undefined);
    if (!values) return;

    if (values.password1 !== values.password2) {
      message.error(t('webui.menu.PasswordMismatch'));
      return;
    }

    try {
      await anonBaiClient.cloud.change_password(
        values.email,
        values.password1,
        token.current,
      );
      message.success(t('login.PasswordChanged'));
      setTimeout(() => {
        redirectToLoginPage();
      }, 2000);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : t('error.UpdateError');
      message.error(errorMessage);
      setViewState('invalid-token');
    }
  };

  if (!active) {
    return null;
  }

  return (
    <>
      <BAIModal
        open={viewState === 'change-password'}
        title={t('webui.menu.ChangePassword')}
        footer={
          <BAIButton
            type="primary"
            block
            action={async () => {
              await handleUpdatePassword();
            }}
          >
            {t('webui.menu.Update')}
          </BAIButton>
        }
        closable={false}
        maskClosable={false}
        afterClose={redirectToLoginPage}
      >
        <BAIFlex direction="column" gap="sm">
          <p style={{ width: 350 }}>{t('login.UpdatePasswordMessage')}</p>
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  type: 'email',
                  message: t('signUp.InvalidEmail'),
                },
                {
                  pattern: /^[A-Z0-9a-z#\-_]+@.+\..+$/,
                  message: t('signUp.InvalidEmail'),
                },
                {
                  max: 64,
                  message: t('maxLength.64chars'),
                },
              ]}
            >
              <Input
                placeholder={t('data.explorer.EnterEmailAddress')}
                autoFocus
                maxLength={64}
              />
            </Form.Item>
            <Form.Item
              name="password1"
              rules={[
                {
                  required: true,
                  message: t('webui.menu.InvalidPasswordMessage'),
                },
                {
                  pattern: PASSWORD_REGEX,
                  message: t('webui.menu.InvalidPasswordMessage'),
                },
                {
                  max: 64,
                  message: t('maxLength.64chars'),
                },
              ]}
            >
              <Input.Password
                placeholder={t('webui.menu.NewPassword')}
                maxLength={64}
              />
            </Form.Item>
            <Form.Item
              name="password2"
              rules={[
                {
                  required: true,
                  message: t('webui.menu.InvalidPasswordMessage'),
                },
                {
                  pattern: PASSWORD_REGEX,
                  message: t('webui.menu.InvalidPasswordMessage'),
                },
                {
                  max: 64,
                  message: t('maxLength.64chars'),
                },
              ]}
            >
              <Input.Password
                placeholder={t('webui.menu.NewPasswordAgain')}
                maxLength={64}
              />
            </Form.Item>
          </Form>
        </BAIFlex>
      </BAIModal>

      <BAIModal
        open={viewState === 'invalid-token'}
        title={t('login.InvalidChangePasswordToken')}
        footer={
          <BAIButton type="primary" block onClick={redirectToLoginPage}>
            {t('button.Close')}
          </BAIButton>
        }
        closable={false}
        maskClosable={false}
        afterClose={redirectToLoginPage}
      >
        <BAIFlex direction="column" gap="sm">
          <p style={{ width: 350 }}>
            {t('login.InvalidChangePasswordTokenMessage')}
          </p>
        </BAIFlex>
      </BAIModal>
    </>
  );
};

export default ChangePasswordView;
