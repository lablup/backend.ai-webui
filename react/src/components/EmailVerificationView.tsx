/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
// Ticket 34: `Form` is the self-hosted engine (was the antd SHIM).
import { Form } from '../form-engine';
import { useAnonymousBackendaiClient } from '../hooks';
import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { BAIFlex, BAIModal } from 'backend.ai-ui';
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- missing-token failure state kept per review
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
          <Button
            variant="primary"
            width="100%"
            onClick={redirectToLoginPage}
            label={t('login.Login')}
          />
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
          <Button
            variant="primary"
            width="100%"
            clickAction={async () => {
              await handleResendVerification();
            }}
            label={t('signUp.SendEmail')}
          />
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
            <BAIFormItem
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
              <AstryxFormTextInput
                label={t('data.explorer.EnterEmailAddress')}
                placeholder={t('data.explorer.EnterEmailAddress')}
                hasAutoFocus
              />
            </BAIFormItem>
          </Form>
        </BAIFlex>
      </BAIModal>
    </>
  );
};

export default EmailVerificationView;
