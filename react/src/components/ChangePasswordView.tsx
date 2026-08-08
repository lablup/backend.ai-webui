/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { useAnonymousBackendaiClient } from '../hooks';
import { theme } from '../theme-shim';
import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form engine stays until ticket 34.
import { Form } from 'antd';
import { BAIFlex, BAIModal, ESMClientErrorResponse } from 'backend.ai-ui';
import { CircleCheck } from 'lucide-react';
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
      const response = error?.response;
      if (
        typeof response === 'object' &&
        response !== null &&
        'msg' in response &&
        response.msg === 'Email mismatch'
      ) {
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
          // BUI `BAIButton.action` is Astryx's native `clickAction`
          // (wrapper policy: BAIButton DISSOLVES); `block` -> `width="100%"`.
          <Button
            variant="primary"
            width="100%"
            clickAction={async () => {
              await handleUpdatePassword();
            }}
            label={t('webui.menu.Update')}
          />
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
            <BAIFormItem
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
              <AstryxFormTextInput
                label={t('data.explorer.EnterEmailAddress')}
                hasAutoFocus
              />
            </BAIFormItem>
            <BAIFormItem
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
              <AstryxFormTextInput
                type="password"
                label={t('webui.menu.NewPassword')}
              />
            </BAIFormItem>
            <BAIFormItem
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
              <AstryxFormTextInput
                type="password"
                label={t('webui.menu.NewPasswordAgain')}
              />
            </BAIFormItem>
          </Form>
        </BAIFlex>
      </BAIModal>

      <BAIModal
        open={viewState === 'changed-success'}
        title={t('webui.menu.ChangePassword')}
        width={420}
        footer={
          <Button
            variant="primary"
            width="100%"
            onClick={redirectToLoginPage}
            label={t('button.Close')}
          />
        }
        closable={false}
        mask={{ closable: false }}
      >
        <BAIFlex gap="xs" align="center">
          <CircleCheck
            style={{ color: token.colorSuccess, fontSize: token.fontSizeLG }}
            size="1em"
          />
          <Text>{t('login.PasswordChanged')}</Text>
        </BAIFlex>
      </BAIModal>

      <BAIModal
        open={viewState === 'invalid-token'}
        title={t('login.InvalidChangePasswordToken')}
        width={420}
        footer={
          <Button
            variant="primary"
            width="100%"
            onClick={redirectToLoginPage}
            label={t('button.Close')}
          />
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
