/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
  CloseOutlined,
  CloudOutlined,
  DownOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  KeyOutlined,
  RightOutlined,
  WarningTwoTone,
} from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Segmented,
  Typography,
  theme,
  type FormInstance,
  type MenuProps,
} from 'antd';
import { BAIModal, BAIFlex } from 'backend.ai-ui';
import DOMPurify from 'dompurify';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ConnectionMode = 'SESSION' | 'API';

interface LoginFormPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  loginError: { message: string; description?: string } | null;
  onClearLoginError?: () => void;
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
  onConnectionModeChange: (mode: ConnectionMode) => void;
  onShowSignupDialog: (token?: string) => void;
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
  loginError,
  onClearLoginError,
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
  onConnectionModeChange,
  onShowSignupDialog,
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

  const [isEndpointExpanded, setIsEndpointExpanded] = useState(
    () => showEndpointInput && !isEndpointDisabled && apiEndpoint === '',
  );
  const [helpPanel, setHelpPanel] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // Derive effective help panel visibility: hidden when modal is closed
  const effectiveHelpPanel = isOpen ? helpPanel : null;

  const hasBottomLinks =
    loginConfig.signup_support || loginConfig.allowAnonymousChangePassword;

  const modalWidth = 400;
  const helpPanelWidth = 280;
  const helpPanelGap = 12;

  return (
    <>
      <BAIModal
        open={isOpen}
        closable={false}
        maskClosable={false}
        keyboard={false}
        footer={null}
        width={modalWidth}
        getContainer={false}
        mask={!needToResetPassword}
        title={
          <div style={{ textAlign: 'center' }}>
            <img
              src="manifest/backend.ai-text.svg"
              alt="backend.ai"
              style={{ height: 35 }}
            />
          </div>
        }
        styles={{
          header: { borderBottom: 'none', paddingBottom: 0 },
          body: { padding: token.paddingLG, paddingTop: token.paddingSM },
          ...(needToResetPassword ? { wrapper: { display: 'none' } } : {}),
        }}
        destroyOnHidden
      >
        {/* Mode switching: Segmented control */}
        {loginConfig.change_signin_support && (
          <div style={{ marginBottom: token.marginMD }}>
            <Segmented
              value={connectionMode}
              options={[
                { label: t('login.SessionMode'), value: 'SESSION' },
                { label: t('login.APIMode'), value: 'API' },
              ]}
              onChange={(value) =>
                onConnectionModeChange(value as ConnectionMode)
              }
              block
            />
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
              <Form.Item
                name="user_id"
                style={{ marginBottom: token.marginSM }}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder={t('login.E-mailOrUsername')}
                  aria-label="Email or Username"
                  maxLength={64}
                  autoComplete="username"
                  disabled={isLoading}
                />
              </Form.Item>
              <Form.Item
                name="password"
                style={{ marginBottom: token.marginSM }}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  placeholder={t('login.Password')}
                  aria-label="Password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </Form.Item>
              {otpRequired && (
                <Form.Item name="otp" style={{ marginBottom: token.marginSM }}>
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
              <Form.Item
                name="api_key"
                style={{ marginBottom: token.marginSM }}
              >
                <Input
                  prefix={<LockOutlined />}
                  placeholder={t('login.APIKey')}
                  maxLength={20}
                  disabled={isLoading}
                />
              </Form.Item>
              <Form.Item
                name="secret_key"
                style={{ marginBottom: token.marginSM }}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  placeholder={t('login.SecretKey')}
                  maxLength={40}
                  disabled={isLoading}
                />
              </Form.Item>
            </>
          )}

          {/* Login error alert */}
          {loginError && (
            <Alert
              type="error"
              showIcon
              title={loginError.message}
              description={loginError.description}
              style={{ marginBottom: token.marginSM }}
              closable={{
                closeIcon: true,
                onClose: onClearLoginError,
              }}
            />
          )}

          {/* Login button */}
          <Form.Item style={{ marginBottom: token.marginSM }}>
            <Button
              type="primary"
              block
              onClick={onLogin}
              loading={isLoading}
              aria-label="Login"
            >
              {t('login.Login')}
            </Button>
          </Form.Item>

          {/* SSO buttons */}
          {loginConfig.singleSignOnVendors.includes('saml') && (
            <Form.Item style={{ marginBottom: token.marginSM }}>
              <Button block onClick={onSAMLLogin}>
                {t('login.singleSignOn.LoginWithSAML')}
              </Button>
            </Form.Item>
          )}
          {loginConfig.singleSignOnVendors.includes('openid') && (
            <Form.Item style={{ marginBottom: token.marginSM }}>
              <Button block onClick={onOpenIDLogin}>
                {t('login.singleSignOn.LoginWithRealm', {
                  realmName: loginConfig.ssoRealmName || 'OpenID',
                })}
              </Button>
            </Form.Item>
          )}

          {/* Collapsible endpoint section */}
          {showEndpointInput && (
            <div style={{ marginTop: token.marginSM }}>
              <Typography.Link
                onClick={() => setIsEndpointExpanded((prev) => !prev)}
                style={{ fontSize: 13, userSelect: 'none' }}
              >
                {isEndpointExpanded ? (
                  <DownOutlined style={{ fontSize: 10, marginRight: 4 }} />
                ) : (
                  <RightOutlined style={{ fontSize: 10, marginRight: 4 }} />
                )}
                {t('login.AdvancedSettings')}
              </Typography.Link>
              {isEndpointExpanded && (
                <BAIFlex
                  gap="xs"
                  align="center"
                  style={{ marginTop: token.marginXS }}
                >
                  <Dropdown
                    menu={{
                      items: endpointMenuItems,
                      onClick: onEndpointMenuClick,
                    }}
                    trigger={['click']}
                    overlayStyle={{ zIndex: 10001 }}
                  >
                    <Button
                      icon={<CloudOutlined />}
                      type="text"
                      style={{ color: token.colorInfo }}
                    />
                  </Dropdown>
                  <Form.Item
                    name="api_endpoint"
                    style={{ flex: 1, marginBottom: 0 }}
                    rules={[
                      {
                        pattern: /^https?:\/\/(.*)/,
                        message: t('login.EndpointStartWith'),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t('login.Endpoint')}
                      aria-label="Endpoint"
                      maxLength={2048}
                      disabled={isEndpointDisabled || isLoading}
                      onChange={(e) => onSetApiEndpoint(e.target.value)}
                    />
                  </Form.Item>
                  <Button
                    icon={<InfoCircleOutlined />}
                    type="text"
                    onClick={() =>
                      setHelpPanel({
                        title: t('login.EndpointInfo'),
                        content: t('login.DescEndpoint'),
                      })
                    }
                  />
                </BAIFlex>
              )}
            </div>
          )}

          {/* Signup and change password links */}
          {hasBottomLinks && (
            <BAIFlex
              gap="xs"
              justify="center"
              align="center"
              wrap="wrap"
              style={{
                marginTop: token.marginLG,
                fontSize: 13,
              }}
            >
              {loginConfig.signup_support && (
                <Typography.Link
                  style={{ fontSize: 'inherit' }}
                  onClick={() => onShowSignupDialog()}
                >
                  {t('login.SignUp')}
                </Typography.Link>
              )}
              {loginConfig.signup_support &&
                loginConfig.allowAnonymousChangePassword && (
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 'inherit' }}
                  >
                    |
                  </Typography.Text>
                )}
              {loginConfig.allowAnonymousChangePassword && (
                <>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 'inherit' }}
                  >
                    {t('login.ForgotPassword')}
                  </Typography.Text>
                  <Typography.Link
                    style={{ fontSize: 'inherit' }}
                    onClick={() =>
                      setHelpPanel({
                        title: t('login.SendChangePasswordEmail'),
                        content: t('login.DescChangePasswordEmail'),
                      })
                    }
                  >
                    {t('login.ChangePassword')}
                  </Typography.Link>
                </>
              )}
            </BAIFlex>
          )}
        </Form>
      </BAIModal>

      {/* Help side panel - positioned to the right of the login modal */}
      {effectiveHelpPanel && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: `calc(50% + ${modalWidth / 2 + helpPanelGap}px)`,
            transform: 'translateY(-50%)',
            width: helpPanelWidth,
            maxHeight: '60vh',
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            padding: token.paddingLG,
            overflow: 'auto',
            zIndex: 1060,
          }}
        >
          <BAIFlex
            justify="between"
            align="center"
            style={{ marginBottom: token.marginSM }}
          >
            <Typography.Text strong>{effectiveHelpPanel.title}</Typography.Text>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setHelpPanel(null)}
            />
          </BAIFlex>
          <div
            style={{ fontSize: 13, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(effectiveHelpPanel.content),
            }}
          />
        </div>
      )}

      {/* Child modals rendered outside login panel */}
      <ResetPasswordRequiredInline
        open={needToResetPassword}
        username={form.getFieldValue('user_id') || ''}
        currentPassword={form.getFieldValue('password') || ''}
        apiEndpoint={apiEndpoint}
        onCancel={() => onSetNeedToResetPassword(false)}
        onOk={(newPassword) => {
          onSetNeedToResetPassword(false);
          form.setFieldValue('password', newPassword);
          onLogin();
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
  onOk: (newPassword: string) => void;
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
            onOk(values.newPassword);
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
      onCancel={onCancel}
      keyboard={false}
      maskClosable={false}
      footer={null}
      width={450}
      destroyOnHidden
      zIndex={1002}
      getContainer={false}
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
      getContainer={false}
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
