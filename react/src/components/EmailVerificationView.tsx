/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAnonymousBackendaiClient } from '../hooks';
import { App, Form, Input } from 'antd';
import { BAIButton, BAIFlex, BAIModal } from 'backend.ai-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type VerificationState = 'loading' | 'success' | 'failed';

interface EmailVerificationViewProps {
  apiEndpoint: string;
  active: boolean;
}

interface ResendFormValues {
  email: string;
}

const EmailVerificationView: React.FC<EmailVerificationViewProps> = ({
  apiEndpoint,
  active,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<ResendFormValues>();
  const [verificationState, setVerificationState] =
    useState<VerificationState>('loading');

  const anonBaiClient = useAnonymousBackendaiClient({
    api_endpoint: apiEndpoint,
  });

  useEffect(() => {
    if (!active) return;

    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('verification_code');

    if (token) {
      anonBaiClient.cloud
        .verify_email(token)
        .then(() => {
          setVerificationState('success');
        })
        .catch((error: unknown) => {
          message.error(
            error instanceof Error
              ? error.message
              : t('signUp.VerificationError'),
          );
          setVerificationState('failed');
        });
    } else {
      setVerificationState('failed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const redirectToLoginPage = () => {
    window.location.href = '/';
  };

  const handleResendVerification = async () => {
    const values = await form.validateFields();
    try {
      await anonBaiClient.cloud.send_verification_email(values.email);
      message.success(t('signUp.EmailSent'));
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : t('signUp.SendError');
      message.error(errorMessage);
    }
  };

  if (!active || verificationState === 'loading') {
    return null;
  }

  return (
    <>
      <BAIModal
        open={verificationState === 'success'}
        title={t('signUp.EmailVerified')}
        footer={
          <BAIButton type="primary" block onClick={redirectToLoginPage}>
            {t('login.Login')}
          </BAIButton>
        }
        closable={false}
        maskClosable={false}
        afterClose={redirectToLoginPage}
      >
        <BAIFlex direction="row" align="center">
          <p style={{ width: 256 }}>{t('signUp.EmailVerifiedMessage')}</p>
        </BAIFlex>
      </BAIModal>

      <BAIModal
        open={verificationState === 'failed'}
        title={t('signUp.EmailVerificationFailed')}
        footer={
          <BAIButton
            type="primary"
            block
            action={async () => {
              await handleResendVerification();
            }}
          >
            {t('signUp.SendEmail')}
          </BAIButton>
        }
        closable={false}
        maskClosable={false}
        afterClose={redirectToLoginPage}
      >
        <BAIFlex direction="column" gap="sm">
          <p style={{ width: 256 }}>
            {t('signUp.EmailVerificationFailedMessage')}
          </p>
          <Form form={form} style={{ marginTop: 20 }}>
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
          </Form>
        </BAIFlex>
      </BAIModal>
    </>
  );
};

export default EmailVerificationView;
