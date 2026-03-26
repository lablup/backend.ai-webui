/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAnonymousBackendaiClient } from '../hooks';
import { CheckCircleOutlined } from '@ant-design/icons';
import { App, Form, Input, theme, Typography } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  ESMClientErrorResponse,
} from 'backend.ai-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ViewState = 'change-password' | 'invalid-token' | 'changed-success';

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
  const { token } = theme.useToken();
  const [form] = Form.useForm<ChangePasswordFormValues>();

  // token is derived from URL params which are stable for the lifetime of this page
  const [initialToken] = useState(readTokenFromUrl);
  const initialTokenRef = useRef(initialToken);

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
        initialTokenRef.current,
      );
      setViewState('changed-success');
    } catch (e: unknown) {
      const error = e as ESMClientErrorResponse;
      if (error?.response?.msg === 'Email mismatch') {
        form.setFields([
          {
            name: 'email',
            errors: [t('login.EmailMismatch')],
          },
        ]);
      } else {
        setViewState('invalid-token');
      }
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
        width={420}
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
        mask={{ closable: false }}
      >
        <BAIFlex direction="column" gap="sm">
          <Form
            form={form}
            layout="vertical"
            preserve={false}
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              label={t('data.explorer.EnterEmailAddress')}
              rules={[
                {
                  required: true,
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
              <Input autoFocus maxLength={64} />
            </Form.Item>
            <Form.Item
              name="password1"
              label={t('webui.menu.NewPassword')}
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
              <Input.Password maxLength={64} />
            </Form.Item>
            <Form.Item
              name="password2"
              label={t('webui.menu.NewPasswordAgain')}
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
              <Input.Password maxLength={64} />
            </Form.Item>
          </Form>
        </BAIFlex>
      </BAIModal>

      <BAIModal
        open={viewState === 'changed-success'}
        title={t('webui.menu.ChangePassword')}
        width={420}
        footer={
          <BAIButton type="primary" block onClick={redirectToLoginPage}>
            {t('button.Close')}
          </BAIButton>
        }
        closable={false}
        mask={{ closable: false }}
      >
        <BAIFlex gap="xs" align="center">
          <CheckCircleOutlined
            style={{ color: token.colorSuccess, fontSize: token.fontSizeLG }}
          />
          <Typography.Text>{t('login.PasswordChanged')}</Typography.Text>
        </BAIFlex>
      </BAIModal>

      <BAIModal
        open={viewState === 'invalid-token'}
        title={t('login.InvalidChangePasswordToken')}
        width={420}
        footer={
          <BAIButton type="primary" block onClick={redirectToLoginPage}>
            {t('button.Close')}
          </BAIButton>
        }
        closable={false}
        mask={{ closable: false }}
        afterClose={redirectToLoginPage}
      >
        <BAIFlex direction="column" gap="sm">
          <p>{t('login.InvalidChangePasswordTokenMessage')}</p>
        </BAIFlex>
      </BAIModal>
    </>
  );
};

export default ChangePasswordView;
