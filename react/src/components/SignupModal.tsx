/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { baiSignedRequestWithPromise } from '../helper';
import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIFormItem from './BAIFormItem';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import {
  AstryxFormCheckbox,
  AstryxFormTextInput,
} from './astryx-bui/astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form engine stays until ticket 34.
import { Form } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/;

interface SignupFormValues {
  email: string;
  user_name: string;
  token: string;
  password: string;
  passwordConfirm: string;
  agreement: boolean;
}

interface SignupModalProps extends BAIModalProps {
  onRequestClose: () => void;
  endpoint: string;
  allowSignupWithoutConfirmation: boolean;
  preloadedToken?: string;
}

const SignupModal: React.FC<SignupModalProps> = ({
  onRequestClose,
  endpoint,
  allowSignupWithoutConfirmation,
  preloadedToken,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<SignupFormValues>();
  const [showTOS, setShowTOS] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showEmailSentDialog, setShowEmailSentDialog] = useState(false);

  const anonymousBaiClient = useAnonymousBackendaiClient({
    api_endpoint: endpoint,
  });

  const signupMutation = useTanMutation({
    mutationFn: (values: SignupFormValues) => {
      const body: Record<string, string> = {
        email: values.email,
        user_name: values.user_name,
        password: values.password,
      };
      if (!allowSignupWithoutConfirmation) {
        body.token = values.token;
      }
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/auth/signup',
        body,
        client: anonymousBaiClient,
      });
    },
  });

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => undefined);
    if (!values) return;

    try {
      await signupMutation.mutateAsync(values);
      if (!allowSignupWithoutConfirmation) {
        onRequestClose();
        setShowEmailSentDialog(true);
      } else {
        onRequestClose();
      }
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : t('error.UpdateError');
      message.error(errorMessage);
    }
  };

  return (
    <>
      <BAIModal
        title={
          allowSignupWithoutConfirmation
            ? t('signUp.SignUp')
            : t('signUp.SignUpBETA')
        }
        onCancel={onRequestClose}
        destroyOnHidden
        getContainer={false}
        width={400}
        styles={{
          body: { fontSize: 14 },
        }}
        footer={
          // BUI `BAIButton.action` (async click + auto loading) IS Astryx's
          // native `clickAction` (SKILL.md wrapper policy: BAIButton
          // DISSOLVES), so the footer drops the wrapper entirely.
          <HStack justify="end" gap={2}>
            <Button onClick={onRequestClose} label={t('button.Cancel')} />
            <Button
              variant="primary"
              clickAction={handleSubmit}
              label={t('signUp.SignUp')}
            />
          </HStack>
        }
        {...modalProps}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={{
            token: preloadedToken || '',
          }}
          disabled={signupMutation.isPending}
          requiredMark="optional"
        >
          {/* `Input maxLength` has no destination on Astryx `TextInput`
              (MAPPING §3.6) — dropped everywhere in this form; the server
              still validates length and the placeholder still states it. */}
          <BAIFormItem
            name="email"
            label={t('signUp.E-mail')}
            rules={[
              {
                required: true,
                message: t('signUp.EmailInputRequired'),
              },
              {
                type: 'email',
                message: t('signUp.InvalidEmail'),
              },
            ]}
          >
            <AstryxFormTextInput
              type="email"
              label={t('signUp.E-mail')}
              placeholder={t('maxLength.64chars')}
              hasAutoFocus
            />
          </BAIFormItem>
          <BAIFormItem name="user_name" label={t('signUp.UserName')}>
            <AstryxFormTextInput
              label={t('signUp.UserName')}
              placeholder={t('maxLength.64chars')}
            />
          </BAIFormItem>
          {!allowSignupWithoutConfirmation && (
            <BAIFormItem
              name="token"
              label={t('signUp.InvitationToken')}
              rules={[
                {
                  required: true,
                  message: t('signUp.TokenInputRequired'),
                },
              ]}
            >
              <AstryxFormTextInput label={t('signUp.InvitationToken')} />
            </BAIFormItem>
          )}
          <BAIFormItem
            name="password"
            label={t('signUp.Password')}
            rules={[
              {
                required: true,
                message: t('signUp.PasswordInputRequired'),
              },
              {
                pattern: passwordPattern,
                message: t('signUp.PasswordInvalid'),
              },
            ]}
            hasFeedback
          >
            <AstryxFormTextInput type="password" label={t('signUp.Password')} />
          </BAIFormItem>
          <BAIFormItem
            name="passwordConfirm"
            label={t('signUp.PasswordAgain')}
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: t('signUp.PasswordInputRequired'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('signUp.PasswordNotMatched')),
                  );
                },
              }),
            ]}
          >
            <AstryxFormTextInput
              type="password"
              label={t('signUp.PasswordAgain')}
            />
          </BAIFormItem>
          <BAIFormItem
            name="agreement"
            valuePropName="checked"
            extra={
              <HStack gap={2} align="center">
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTOS(true);
                  }}
                >
                  {t('signUp.TermsOfService')}
                </Link>
                <Text type="supporting">·</Text>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacyPolicy(true);
                  }}
                >
                  {t('signUp.PrivacyPolicy')}
                </Link>
              </HStack>
            }
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(t('signUp.RequestAgreementTermsOfService')),
                      ),
              },
            ]}
          >
            {/* PILOT-DECISION: antd let a `Checkbox` take arbitrary JSX
                children, which is how the policy sentence carried two inline
                links. Astryx `CheckboxInput` has a REQUIRED STRING `label`
                (§1 contract 1) and no slot for trailing content, so the
                sentence becomes the label (plain text — the accessible name
                is now complete, which it was not before) and the two policy
                links move to the field's `extra` row, where they are real
                links instead of anchors nested inside a `<label>` that
                swallowed their clicks. */}
            <AstryxFormCheckbox
              label={`${t('signUp.PolicyAgreement_1')}${t('signUp.TermsOfService')}${t('signUp.PolicyAgreement_2')}${t('signUp.PrivacyPolicy')}${t('signUp.PolicyAgreement_3')}`}
            />
          </BAIFormItem>
        </Form>
      </BAIModal>
      <TermsOfServiceModal
        open={showTOS}
        onRequestClose={() => setShowTOS(false)}
        getContainer={false}
      />
      <PrivacyPolicyModal
        open={showPrivacyPolicy}
        onRequestClose={() => setShowPrivacyPolicy(false)}
        getContainer={false}
      />
      <BAIModal
        open={showEmailSentDialog}
        title={t('signUp.ThankYou')}
        closable={false}
        destroyOnHidden
        getContainer={false}
        footer={
          <Button
            variant="primary"
            onClick={() => setShowEmailSentDialog(false)}
            label={t('button.Okay')}
          />
        }
        width={400}
      >
        <Text as="p" display="block" style={{ maxWidth: 350 }}>
          {t('signUp.VerificationMessage')}
        </Text>
      </BAIModal>
    </>
  );
};

export default SignupModal;
