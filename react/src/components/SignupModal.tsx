/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
// Ticket 34: `Form` is the self-hosted engine (was the antd SHIM).
import { Form } from '../form-engine';
import { baiSignedRequestWithPromise } from '../helper';
import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIFormItem from './BAIFormItem';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import { AstryxFormCheckbox, AstryxFormTextInput } from './astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/;

/**
 * The policy-agreement checkbox: a hidden-label `CheckboxInput` (so only the
 * box toggles) next to the sentence, whose two policy names are links that
 * open their own modal. `Form.Item` injects `checked`/`onChange`.
 */
const AstryxFormCheckboxWithPolicyLinks: React.FC<{
  label: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  onOpenTOS: () => void;
  onOpenPrivacyPolicy: () => void;
}> = ({ label, checked, onChange, onOpenTOS, onOpenPrivacyPolicy }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <HStack gap={2} align="start">
      <AstryxFormCheckbox
        label={label}
        isLabelHidden
        checked={checked}
        onChange={onChange}
      />
      <Text>
        {t('signUp.PolicyAgreement_1')}
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOpenTOS();
          }}
        >
          {t('signUp.TermsOfService')}
        </Link>
        {t('signUp.PolicyAgreement_2')}
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOpenPrivacyPolicy();
          }}
        >
          {t('signUp.PrivacyPolicy')}
        </Link>
        {t('signUp.PolicyAgreement_3')}
      </Text>
    </HStack>
  );
};

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
          {/* RESTORED (input-parity pass): `maxLength` DOES reach the
              native `<input>` — Astryx spreads unknown props onto it, so the
              adapter only had to declare the prop. The placeholders in this
              form state the limit ("Up to 64 characters"), so silently
              accepting a 200-character password was the UI contradicting
              itself. */}
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
              maxLength={64}
              hasAutoFocus
            />
          </BAIFormItem>
          <BAIFormItem name="user_name" label={t('signUp.UserName')}>
            <AstryxFormTextInput
              label={t('signUp.UserName')}
              placeholder={t('maxLength.64chars')}
              maxLength={64}
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
              <AstryxFormTextInput
                label={t('signUp.InvitationToken')}
                maxLength={50}
              />
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
            <AstryxFormTextInput
              type="password"
              label={t('signUp.Password')}
              maxLength={64}
            />
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
              maxLength={64}
            />
          </BAIFormItem>
          <BAIFormItem
            name="agreement"
            valuePropName="checked"
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
            {/* The sentence is rendered BESIDE the box, not as its label:
                only the box itself toggles, and the two policy names can be
                real links (a link inside a `<label>` has its click swallowed
                by the label's own toggle). The label still carries the full
                sentence for screen readers. */}
            <AstryxFormCheckboxWithPolicyLinks
              label={`${t('signUp.PolicyAgreement_1')}${t('signUp.TermsOfService')}${t('signUp.PolicyAgreement_2')}${t('signUp.PrivacyPolicy')}${t('signUp.PolicyAgreement_3')}`}
              onOpenTOS={() => setShowTOS(true)}
              onOpenPrivacyPolicy={() => setShowPrivacyPolicy(true)}
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
