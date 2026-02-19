/**
 * LoginFormPanel - The form UI for the login dialog.
 *
 * Renders SESSION/API login forms, endpoint configuration,
 * SSO buttons, signup/password change links, and integrates
 * child React modals (TOTP, ResetPassword, Signup).
 */
import { baiSignedRequestWithPromise } from '../helper';
import type { LoginConfigState } from '../helper/loginConfig';
import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import SignupModal from './SignupModal';
import {
  TOTPActivateForm,
  type TOTPActivateFormData,
} from './TOTPActivateModal';
import {
  CloudOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  KeyOutlined,
  WarningTwoTone,
} from '@ant-design/icons';
import {
  App,
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Spin,
  Typography,
  theme,
  type FormInstance,
  type MenuProps,
} from 'antd';
import { BAIModal, BAIFlex } from 'backend.ai-ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type ConnectionMode = 'SESSION' | 'API';

interface LoginFormPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  connectionMode: ConnectionMode;
  loginConfig: LoginConfigState;
  apiEndpoint: string;
  otpRequired: boolean;
  needsOtpRegistration: boolean;
  totpRegistrationToken: string;
  needToResetPassword: boolean;
  showSignupModal: boolean;
  signupPreloadedToken?: string;
  showEndpointInput: boolean;
  isEndpointDisabled: boolean;
  form: FormInstance;
  endpointMenuItems: MenuProps['items'];
  onEndpointMenuClick: MenuProps['onClick'];
  onKeyDown: (e: React.KeyboardEvent) => void;
  onLogin: () => void;
  onChangeSigninMode: () => void;
  onShowSignupDialog: (token?: string) => void;
  onShowEndpointDescription: () => void;
  onSAMLLogin: () => void;
  onOpenIDLogin: () => void;
  onSetApiEndpoint: (ep: string) => void;
  onSetOtpRequired: (v: boolean) => void;
  onSetNeedsOtpRegistration: (v: boolean) => void;
  onSetNeedToResetPassword: (v: boolean) => void;
  onSetShowSignupModal: (v: boolean) => void;
}

const LoginFormPanel: React.FC<LoginFormPanelProps> = ({
  isOpen,
  isLoading,
  connectionMode,
  loginConfig,
  apiEndpoint,
  otpRequired,
  needsOtpRegistration,
  totpRegistrationToken,
  needToResetPassword,
  showSignupModal,
  signupPreloadedToken,
  showEndpointInput,
  isEndpointDisabled,
  form,
  endpointMenuItems,
  onEndpointMenuClick,
  onKeyDown,
  onLogin,
  onChangeSigninMode,
  onShowSignupDialog,
  onShowEndpointDescription,
  onSAMLLogin,
  onOpenIDLogin,
  onSetApiEndpoint,
  onSetOtpRequired,
  onSetNeedsOtpRegistration,
  onSetNeedToResetPassword,
  onSetShowSignupModal,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <>
      <BAIModal
        open={isOpen}
        closable={false}
        maskClosable={false}
        keyboard={false}
        footer={null}
        width={400}
        styles={{
          body: { padding: 0 },
        }}
        destroyOnHidden
      >
        {/* Title */}
        <div style={{ padding: '15px 0 15px 5px' }}>
          <img
            src="manifest/backend.ai-text.svg"
            alt="backend.ai"
            style={{ height: 35 }}
          />
        </div>

        {/* Mode header */}
        <BAIFlex
          justify="space-between"
          align="center"
          style={{
            margin: '0 25px',
            fontWeight: 700,
            minHeight: 40,
            paddingBottom: 10,
          }}
        >
          <h3 style={{ flex: 1, margin: 0, wordBreak: 'break-word' }}>
            {connectionMode === 'SESSION'
              ? t('login.LoginWithE-mailOrUsername')
              : t('login.LoginWithIAM')}
          </h3>
          {loginConfig.change_signin_support && (
            <BAIFlex
              direction="column"
              align="end"
              style={{ flex: 1, textAlign: 'right' }}
            >
              <div style={{ fontSize: 12, margin: '5px 0' }}>
                {t('login.LoginAnotherWay')}
              </div>
              <Button size="small" onClick={onChangeSigninMode}>
                {connectionMode === 'SESSION'
                  ? t('login.ClickToUseIAM')
                  : t('login.ClickToUseID')}
              </Button>
            </BAIFlex>
          )}
        </BAIFlex>

        {/* Form area */}
        <div style={{ position: 'relative', padding: '0 15px' }}>
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '40%',
                zIndex: 2,
              }}
            >
              <Spin />
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onKeyDown={onKeyDown}
            initialValues={{ api_endpoint: apiEndpoint }}
          >
            {/* SESSION login fields */}
            {connectionMode === 'SESSION' && (
              <>
                <Form.Item name="user_id" style={{ marginBottom: 8 }}>
                  <Input
                    prefix={<MailOutlined />}
                    placeholder={t('login.E-mailOrUsername')}
                    maxLength={64}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </Form.Item>
                <Form.Item name="password" style={{ marginBottom: 8 }}>
                  <Input.Password
                    prefix={<KeyOutlined />}
                    placeholder={t('login.Password')}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </Form.Item>
                {otpRequired && (
                  <Form.Item name="otp" style={{ marginBottom: 8 }}>
                    <Input
                      prefix={<LockOutlined />}
                      placeholder={t('totp.OTP')}
                      disabled={isLoading}
                      autoFocus
                    />
                  </Form.Item>
                )}
              </>
            )}

            {/* API login fields */}
            {connectionMode === 'API' && (
              <>
                <Form.Item name="api_key" style={{ marginBottom: 8 }}>
                  <Input
                    prefix={<LockOutlined />}
                    placeholder={t('login.APIKey')}
                    maxLength={20}
                    disabled={isLoading}
                  />
                </Form.Item>
                <Form.Item name="secret_key" style={{ marginBottom: 8 }}>
                  <Input.Password
                    prefix={<KeyOutlined />}
                    placeholder={t('login.SecretKey')}
                    maxLength={40}
                    disabled={isLoading}
                  />
                </Form.Item>
              </>
            )}

            {/* Endpoint field */}
            {showEndpointInput && (
              <BAIFlex gap="xs" align="center">
                <Dropdown
                  menu={{
                    items: endpointMenuItems,
                    onClick: onEndpointMenuClick,
                  }}
                  trigger={['click']}
                >
                  <Button
                    icon={<CloudOutlined />}
                    type="text"
                    style={{ color: token.colorInfo }}
                  />
                </Dropdown>
                <Form.Item
                  name="api_endpoint"
                  style={{ flex: 1, marginBottom: 8 }}
                  rules={[
                    {
                      pattern: /^https?:\/\/(.*)/,
                      message: t('login.EndpointStartWith'),
                    },
                  ]}
                >
                  <Input
                    placeholder={t('login.Endpoint')}
                    maxLength={2048}
                    disabled={isEndpointDisabled || isLoading}
                    onChange={(e) => onSetApiEndpoint(e.target.value)}
                  />
                </Form.Item>
                <Button
                  icon={<InfoCircleOutlined />}
                  type="text"
                  onClick={onShowEndpointDescription}
                />
              </BAIFlex>
            )}

            {/* Login button */}
            <Form.Item style={{ marginBottom: 8 }}>
              <Button
                type="primary"
                block
                onClick={onLogin}
                loading={isLoading}
              >
                {t('login.Login')}
              </Button>
            </Form.Item>

            {/* SSO buttons */}
            {loginConfig.singleSignOnVendors.includes('saml') && (
              <Form.Item style={{ marginBottom: 8 }}>
                <Button block onClick={onSAMLLogin}>
                  {t('login.singleSignOn.LoginWithSAML')}
                </Button>
              </Form.Item>
            )}
            {loginConfig.singleSignOnVendors.includes('openid') && (
              <Form.Item style={{ marginBottom: 8 }}>
                <Button block onClick={onOpenIDLogin}>
                  {t('login.singleSignOn.LoginWithRealm', {
                    realmName: loginConfig.ssoRealmName || 'OpenID',
                  })}
                </Button>
              </Form.Item>
            )}

            {/* Signup and change password links */}
            <BAIFlex gap="sm" justify="center" style={{ marginTop: '2em' }}>
              {loginConfig.signup_support && (
                <BAIFlex direction="column" align="center" style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, textAlign: 'center' }}>
                    {t('login.NotAUser')}
                  </div>
                  <Button size="small" onClick={() => onShowSignupDialog()}>
                    {t('login.SignUp')}
                  </Button>
                </BAIFlex>
              )}
              {loginConfig.allowAnonymousChangePassword && (
                <BAIFlex direction="column" align="center" style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, textAlign: 'center' }}>
                    {t('login.ForgotPassword')}
                  </div>
                  <Button size="small">{t('login.ChangePassword')}</Button>
                </BAIFlex>
              )}
            </BAIFlex>
          </Form>
        </div>
      </BAIModal>

      {/* Child modals rendered outside login panel */}
      <ResetPasswordRequiredInline
        open={needToResetPassword}
        username={form.getFieldValue('user_id') || ''}
        currentPassword={form.getFieldValue('password') || ''}
        apiEndpoint={apiEndpoint}
        onCancel={() => onSetNeedToResetPassword(false)}
        onOk={() => {
          onSetNeedToResetPassword(false);
          form.setFieldValue('password', '');
        }}
      />

      <TOTPActivateInline
        open={needsOtpRegistration}
        totpRegistrationToken={totpRegistrationToken}
        apiEndpoint={apiEndpoint}
        onCancel={() => onSetNeedsOtpRegistration(false)}
        onOk={() => {
          onSetNeedsOtpRegistration(false);
          onSetOtpRequired(true);
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        open={showSignupModal}
        endpoint={apiEndpoint}
        allowSignupWithoutConfirmation={
          loginConfig.allowSignupWithoutConfirmation
        }
        preloadedToken={signupPreloadedToken}
        onRequestClose={() => onSetShowSignupModal(false)}
      />
    </>
  );
};

/**
 * Inline ResetPasswordRequired with direct props (no WebComponent context).
 */
const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/;

const ResetPasswordRequiredInline: React.FC<{
  open: boolean;
  username: string;
  currentPassword: string;
  apiEndpoint: string;
  onCancel: () => void;
  onOk: () => void;
}> = ({ open, username, currentPassword, apiEndpoint, onCancel, onOk }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<{ newPassword: string; confirm: string }>();
  const anonymousBaiClient = useAnonymousBackendaiClient({
    api_endpoint: apiEndpoint,
  });

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const mutation = useTanMutation({
    mutationFn: (body: {
      username: string;
      current_password: string;
      new_password: string;
    }) => {
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/server/update-password-no-auth',
        body,
        client: anonymousBaiClient,
      });
    },
  });

  const onSubmit = () => {
    form.validateFields().then((values) => {
      mutation.mutate(
        {
          username,
          current_password: currentPassword,
          new_password: values.newPassword,
        },
        {
          onSuccess() {
            onOk();
          },
          onError() {
            // Error handled by mutation state
          },
        },
      );
    });
  };

  return (
    <Modal
      open={open}
      centered
      mask={false}
      onCancel={onCancel}
      keyboard={false}
      maskClosable={false}
      footer={null}
      width={450}
      destroyOnHidden
    >
      <BAIFlex
        direction="column"
        justify="start"
        align="stretch"
        gap="md"
        style={{
          alignSelf: 'stretch',
          paddingTop: token.paddingMD,
          paddingBottom: token.paddingMD,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          <WarningTwoTone twoToneColor={token.colorWarning} />{' '}
          {t('webui.menu.PleaseChangeYourPassword')}
        </Typography.Title>
        {t('webui.menu.YouMushChangeYourPassword')}
        <Form form={form} layout="vertical" disabled={mutation.isPending}>
          <Form.Item
            name="newPassword"
            label={t('webui.menu.NewPassword')}
            rules={[
              { required: true },
              {
                pattern: passwordPattern,
                message: t('webui.menu.InvalidPasswordMessage').toString(),
              },
              () => ({
                validator(_, value) {
                  if (currentPassword === value) {
                    return Promise.reject(
                      new Error(
                        t('webui.menu.NewPasswordCannotBeSame').toString(),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={t('webui.menu.NewPasswordAgain')}
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('environment.PasswordsDoNotMatch').toString()),
                  );
                },
              }),
            ]}
          >
            <Input.Password onPressEnter={onSubmit} />
          </Form.Item>
        </Form>
        <Button type="primary" onClick={onSubmit} loading={mutation.isPending}>
          {t('webui.menu.Update')}
        </Button>
      </BAIFlex>
    </Modal>
  );
};

/**
 * Inline TOTP activation with direct props (no WebComponent context).
 */
const TOTPActivateInline: React.FC<{
  open: boolean;
  totpRegistrationToken: string;
  apiEndpoint: string;
  onCancel: () => void;
  onOk: () => void;
}> = ({ open, totpRegistrationToken, apiEndpoint, onCancel, onOk }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<TOTPActivateFormData>>(null);
  const anonBaiClient = useAnonymousBackendaiClient({
    api_endpoint: apiEndpoint,
  });

  const {
    data: initializedTotp,
    isSuccess,
    isError,
    mutate,
  } = useTanMutation<
    { totp_key: string; totp_uri: string },
    null,
    { registration_token: string }
  >({
    mutationFn: ({ registration_token }) => {
      return anonBaiClient.initialize_totp_anon({ registration_token });
    },
  });

  useEffect(() => {
    if (open) {
      mutate({ registration_token: totpRegistrationToken });
    }
  }, [open, mutate, totpRegistrationToken]);

  const activateMutation = useTanMutation<
    NonNullable<unknown>,
    null,
    { registration_token: string; otp: number }
  >({
    mutationFn: (values: TOTPActivateFormData) => {
      return anonBaiClient.activate_totp_anon(values);
    },
  });

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        activateMutation.mutate(
          {
            otp: values.otp,
            registration_token: totpRegistrationToken,
          },
          {
            onSuccess: () => {
              message.success(t('totp.TotpSetupCompleted'));
              onOk();
            },
            onError: () => {
              message.error(t('totp.InvalidTotpCode'));
            },
          },
        );
      })
      .catch(() => {
        // Validation failed - errors shown by form
      });
  };

  return (
    <BAIModal
      title={t('webui.menu.SetupTotp')}
      maskClosable={false}
      confirmLoading={activateMutation.isPending}
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      onOk={handleOk}
      loading={!isSuccess}
    >
      {isError || !initializedTotp?.totp_uri || !initializedTotp?.totp_key ? (
        <BAIFlex>{t('totp.TotpSetupNotAvailable')}</BAIFlex>
      ) : (
        <TOTPActivateForm
          ref={formRef}
          totp_uri={initializedTotp.totp_uri}
          totp_key={initializedTotp.totp_key}
        />
      )}
    </BAIModal>
  );
};

export default LoginFormPanel;
