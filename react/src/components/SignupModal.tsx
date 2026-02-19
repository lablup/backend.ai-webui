import { baiSignedRequestWithPromise } from '../helper';
import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import { Checkbox, Form, Input, Modal, theme, Typography } from 'antd';
import { BAIButton, BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
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
  const { token } = theme.useToken();
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
    const values = await form.validateFields();
    await signupMutation.mutateAsync(values, {
      onSuccess: () => {
        if (!allowSignupWithoutConfirmation) {
          onRequestClose();
          setShowEmailSentDialog(true);
        } else {
          onRequestClose();
        }
      },
    });
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
          <BAIFlex justify="end" gap="sm">
            <BAIButton onClick={onRequestClose}>{t('button.Cancel')}</BAIButton>
            <BAIButton type="primary" action={handleSubmit}>
              {t('signUp.SignUp')}
            </BAIButton>
          </BAIFlex>
        }
        {...modalProps}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            token: preloadedToken || '',
          }}
          disabled={signupMutation.isPending}
          requiredMark="optional"
        >
          <Form.Item
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
            <Input
              type="email"
              maxLength={64}
              placeholder={t('maxLength.64chars')}
              autoFocus
            />
          </Form.Item>
          <Form.Item name="user_name" label={t('signUp.UserName')}>
            <Input maxLength={64} placeholder={t('maxLength.64chars')} />
          </Form.Item>
          {!allowSignupWithoutConfirmation && (
            <Form.Item
              name="token"
              label={t('signUp.InvitationToken')}
              rules={[
                {
                  required: true,
                  message: t('signUp.TokenInputRequired'),
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
          )}
          <Form.Item
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
            <Input.Password maxLength={64} />
          </Form.Item>
          <Form.Item
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
            <Input.Password maxLength={64} />
          </Form.Item>
          <Form.Item
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
            <Checkbox>
              <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                {t('signUp.PolicyAgreement_1')}
                <Typography.Link
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTOS(true);
                  }}
                >
                  {t('signUp.TermsOfService')}
                </Typography.Link>
                {t('signUp.PolicyAgreement_2')}
                <Typography.Link
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacyPolicy(true);
                  }}
                >
                  {t('signUp.PrivacyPolicy')}
                </Typography.Link>
                {t('signUp.PolicyAgreement_3')}
              </Typography.Text>
            </Checkbox>
          </Form.Item>
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
      <Modal
        open={showEmailSentDialog}
        title={t('signUp.ThankYou')}
        closable={false}
        getContainer={false}
        footer={
          <BAIButton
            type="primary"
            onClick={() => setShowEmailSentDialog(false)}
          >
            {t('button.Okay')}
          </BAIButton>
        }
        width={400}
      >
        <Typography.Paragraph style={{ maxWidth: 350 }}>
          {t('signUp.VerificationMessage')}
        </Typography.Paragraph>
      </Modal>
    </>
  );
};

export default SignupModal;
