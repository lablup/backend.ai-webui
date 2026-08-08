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
// to-astryx ticket 04: this screen's `App.useApp()` is served by the Astryx
// app-shim (message → Toast) instead of antd.
import { App } from '../app-shim';
import { baiSignedRequestWithPromise } from '../helper';
import type { LoginConfigState } from '../helper/loginConfig';
import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { useThemeMode } from '../hooks/useThemeMode';
import { theme } from '../theme-shim';
import BAIFormItem from './BAIFormItem';
import SignupModal from './SignupModal';
import {
  TOTPActivateForm,
  type TOTPActivateFormData,
} from './TOTPActivateModal';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@astryxdesign/core/DropdownMenu';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form ENGINE stays until ticket 34; only its
// visual layer moves (`Form.Item` -> `BAIFormItem`, antd controls -> the
// Astryx form-control adapters).
import { Form, type FormInstance } from 'antd';
import {
  BAIModal,
  BAIFlex,
  useBAILogger,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import DOMPurify from 'dompurify';
import {
  X,
  Cloud,
  ChevronDown,
  Info,
  ChevronRight,
  TriangleAlert,
} from 'lucide-react';
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
  expiredCredentials: { username: string; password: string } | null;
  showSignupModal: boolean;
  signupPreloadedToken?: string;
  showEndpointInput: boolean;
  isEndpointDisabled: boolean;
  form: FormInstance;
  endpointMenuItems: DropdownMenuOption[];
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
  expiredCredentials,
  showSignupModal,
  signupPreloadedToken,
  showEndpointInput,
  isEndpointDisabled,
  form,
  endpointMenuItems,
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
  const { isDarkMode } = useThemeMode();
  const { themeConfig } = useCustomThemeConfig();

  const [isEndpointExpanded, setIsEndpointExpanded] = useState(
    () => showEndpointInput && !isEndpointDisabled && apiEndpoint === '',
  );
  const [helpPanel, setHelpPanel] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [showChangePasswordEmailModal, setShowChangePasswordEmailModal] =
    useState(false);

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
        // The login screen backdrop (weave + version/copyright metadata) is the
        // persisted splash element behind this modal (z-index 10000). The modal
        // mask dims that backdrop, so the metadata reads softly behind the mask.
        mask={!needToResetPassword}
        keyboard={false}
        maskClosable={false}
        footer={null}
        width={modalWidth}
        getContainer={false}
        title={
          <div style={{ textAlign: 'center' }}>
            <img
              src={
                isDarkMode
                  ? themeConfig?.logo?.loginLogoSrcDark ||
                    themeConfig?.logo?.src ||
                    'manifest/backend.ai-text-bgdark.svg'
                  : themeConfig?.logo?.loginLogoSrc ||
                    themeConfig?.logo?.srcDark ||
                    'manifest/backend.ai-text.svg'
              }
              alt={themeConfig?.logo?.alt || 'backend.ai'}
              style={{
                width: themeConfig?.logo?.loginLogoSize?.width,
                height: themeConfig?.logo?.loginLogoSize?.height || 35,
              }}
            />
          </div>
        }
        styles={{
          header: { borderBottom: 'none', paddingBottom: 0 },
          body: { padding: token.paddingLG, paddingTop: token.paddingSM },
          // When needToResetPassword is true, hide the login modal wrapper via
          // display:none while keeping open={true}. This preserves the Form
          // instance (and its field values) that child modals depend on.
          // Trade-off: screen readers may announce two open dialogs. A future
          // refactor should decouple form state from modal lifecycle.
          ...(needToResetPassword ? { wrapper: { display: 'none' } } : {}),
        }}
        destroyOnHidden
      >
        {/* Mode switching: Segmented control */}
        {loginConfig.change_signin_support && (
          <div style={{ marginBottom: token.marginMD }}>
            <SegmentedControl
              value={connectionMode}
              onChange={(value) =>
                onConnectionModeChange(value as ConnectionMode)
              }
              layout="fill"
              label={t('login.Login', { postProcess: [] })}
            >
              <SegmentedControlItem
                value="SESSION"
                label={t('login.SessionMode')}
              />
              <SegmentedControlItem value="API" label={t('login.APIMode')} />
            </SegmentedControl>
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
              {/* PILOT-DECISION: antd `Input prefix={<icon/>}` (MAPPING
                  §3.6) -> `TextInput startIcon`; the adapters do not expose
                  `startIcon`, and `maxLength` / `autoComplete` have no
                  destination on the Astryx control either, so the leading
                  glyphs and both attributes are dropped. The placeholder
                  already carries the field meaning, and the `label` (hidden,
                  supplied for a11y) carries the accessible name that antd's
                  `aria-label` used to. */}
              <BAIFormItem
                name="user_id"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  label={t('login.E-mailOrUsername', { postProcess: [] })}
                  placeholder={t('login.E-mailOrUsername', { postProcess: [] })}
                  // Focus the first field when the login form opens. When OTP is
                  // later required, the OTP input mounts with its own autoFocus
                  // and takes over.
                  hasAutoFocus={!otpRequired}
                  disabled={isLoading}
                />
              </BAIFormItem>
              <BAIFormItem
                name="password"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  type="password"
                  label={t('login.Password', { postProcess: [] })}
                  placeholder={t('login.Password', { postProcess: [] })}
                  disabled={isLoading}
                />
              </BAIFormItem>
              {otpRequired && (
                <BAIFormItem
                  name="otp"
                  style={{ marginBottom: token.marginSM }}
                >
                  <AstryxFormTextInput
                    label={t('totp.OTP', { postProcess: [] })}
                    placeholder={t('totp.OTP', { postProcess: [] })}
                    disabled={isLoading}
                    hasAutoFocus
                  />
                </BAIFormItem>
              )}
            </>
          )}

          {/* API login fields */}
          {connectionMode === 'API' && (
            <>
              <BAIFormItem
                name="api_key"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  label={t('login.APIKey', { postProcess: [] })}
                  placeholder={t('login.APIKey', { postProcess: [] })}
                  hasAutoFocus
                  disabled={isLoading}
                />
              </BAIFormItem>
              <BAIFormItem
                name="secret_key"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  type="password"
                  label={t('login.SecretKey', { postProcess: [] })}
                  placeholder={t('login.SecretKey', { postProcess: [] })}
                  disabled={isLoading}
                />
              </BAIFormItem>
            </>
          )}

          {/* Login error alert */}
          {loginError && (
            <Banner
              status="error"
              title={loginError.message}
              description={loginError.description}
              style={{ marginBottom: token.marginSM }}
              isDismissable
              onDismiss={onClearLoginError}
            />
          )}

          {/* Login button */}
          <BAIFormItem style={{ marginBottom: token.marginSM }}>
            <Button
              variant="primary"
              width="100%"
              onClick={onLogin}
              isLoading={isLoading}
              label={t('login.Login')}
            />
          </BAIFormItem>

          {/* SSO buttons */}
          {loginConfig.singleSignOnVendors.includes('saml') && (
            <BAIFormItem style={{ marginBottom: token.marginSM }}>
              <Button
                width="100%"
                onClick={onSAMLLogin}
                label={t('login.singleSignOn.LoginWithSAML')}
              />
            </BAIFormItem>
          )}
          {loginConfig.singleSignOnVendors.includes('openid') && (
            <BAIFormItem style={{ marginBottom: token.marginSM }}>
              <Button
                width="100%"
                onClick={onOpenIDLogin}
                label={t('login.singleSignOn.LoginWithRealm', {
                  realmName: loginConfig.ssoRealmName || 'OpenID',
                })}
              />
            </BAIFormItem>
          )}

          {/* Collapsible endpoint section */}
          {showEndpointInput && (
            <div style={{ marginTop: token.marginSM }}>
              {/* `Typography.Link onClick` with no href -> Astryx `Link`
                  is anchor-first (MAPPING §3.16), so the router-less toggle
                  uses `href="#"` + `preventDefault` (the pilot's fallback).
                  The hand-set 13px/10px sizes are dropped (closed type
                  scale). */}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEndpointExpanded((prev) => !prev);
                }}
                style={{ userSelect: 'none' }}
              >
                {/* Astryx `Link` lays its children out in a block flow, so the
                    disclosure chevron and the label are kept on one line by an
                    explicit inline-flex row rather than by the anchor itself. */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {isEndpointExpanded ? (
                    <ChevronDown size="1em" />
                  ) : (
                    <ChevronRight size="1em" />
                  )}
                  {t('login.AdvancedSettings')}
                </span>
              </Link>
              {isEndpointExpanded && (
                <BAIFlex
                  gap="xs"
                  align="center"
                  style={{ marginTop: token.marginXS }}
                >
                  {/* antd `Dropdown` wrapped an arbitrary trigger element;
                      Astryx `DropdownMenu` renders its own trigger from
                      `button` props and binds `onClick` per ITEM, so the
                      endpoint-select handler is attached where the items are
                      built (LoginView). The `overlayStyle` z-index and the
                      hand-painted info-blue icon tint have no destination
                      (P5). */}
                  <DropdownMenu
                    hasChevron={false}
                    menuWidth={340}
                    button={{
                      variant: 'ghost',
                      isIconOnly: true,
                      icon: <Cloud size="1em" />,
                      label: t('login.EndpointHistory'),
                    }}
                    items={endpointMenuItems}
                  />
                  <BAIFormItem
                    name="api_endpoint"
                    style={{ flex: 1, marginBottom: 0 }}
                    rules={[
                      {
                        pattern: /^https?:\/\/(.*)/,
                        message: t('login.EndpointStartWith'),
                      },
                    ]}
                  >
                    <AstryxFormTextInput
                      label={t('login.Endpoint', { postProcess: [] })}
                      placeholder={t('login.Endpoint', { postProcess: [] })}
                      disabled={isEndpointDisabled || isLoading}
                      onChange={(value) => onSetApiEndpoint(value)}
                    />
                  </BAIFormItem>
                  <IconButton
                    icon={<Info size="1em" />}
                    variant="ghost"
                    label={t('login.EndpointInfo')}
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
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onShowSignupDialog();
                  }}
                >
                  {t('login.SignUp')}
                </Link>
              )}
              {loginConfig.signup_support &&
                loginConfig.allowAnonymousChangePassword && (
                  <Text color="secondary">|</Text>
                )}
              {loginConfig.allowAnonymousChangePassword && (
                <>
                  <Text color="secondary">{t('login.ForgotPassword')}</Text>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowChangePasswordEmailModal(true);
                    }}
                  >
                    {t('login.ChangePassword')}
                  </Link>
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
            <Text weight="semibold">{effectiveHelpPanel.title}</Text>
            <IconButton
              variant="ghost"
              size="sm"
              icon={<X size="1em" />}
              label={t('button.Close')}
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
        username={expiredCredentials?.username || ''}
        currentPassword={expiredCredentials?.password || ''}
        apiEndpoint={apiEndpoint}
        onCancel={() => onSetNeedToResetPassword(false)}
        onOk={(newPassword) => {
          onSetNeedToResetPassword(false);
          form.setFieldValue('password', newPassword);
          // Defer onLogin to the next microtask so that Ant Design's
          // setFieldValue has settled before the login handler reads the
          // form. Without this, React 19 batching could cause onLogin()
          // to read the stale (expired) password.
          setTimeout(() => onLogin(), 0);
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

      {/* Change Password Email Modal */}
      <BAIUnmountAfterClose>
        <ChangePasswordEmailModal
          open={showChangePasswordEmailModal}
          apiEndpoint={apiEndpoint}
          onClose={() => setShowChangePasswordEmailModal(false)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

/**
 * Inline ResetPasswordRequired with direct props (no WebComponent context).
 */
export const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/;

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
  const { logger } = useBAILogger();
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
    form
      .validateFields()
      .then((values) => {
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
      })
      .catch((e) => {
        logger.warn('validation errors', e);
      });
  };

  return (
    // PILOT-DECISION: the bare antd `Modal` becomes BUI `BAIModal` — the
    // frontier wrapper this file already uses everywhere else — rather than a
    // second dialog vocabulary. `BAIModal` is rebased on Astryx `Dialog` by
    // ticket 30; converting this one call site to `BAIModalAstryx` now would
    // split the login screen across two dialog implementations.
    <BAIModal
      open={open}
      centered
      onCancel={onCancel}
      keyboard={false}
      mask={{ closable: false }}
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
        <Heading level={3} style={{ margin: 0 }}>
          <TriangleAlert style={{ color: token.colorWarning }} size="1em" />{' '}
          {t('webui.menu.PleaseChangeYourPassword')}
        </Heading>
        {t('webui.menu.YouMushChangeYourPassword')}
        <Form form={form} layout="vertical" disabled={mutation.isPending}>
          <BAIFormItem
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
            <AstryxFormTextInput
              type="password"
              label={t('webui.menu.NewPassword')}
            />
          </BAIFormItem>
          <BAIFormItem
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
            {/* antd `Input.Password onPressEnter` -> dropped: the Astryx
                adapter exposes no Enter hook, and the visible Update button
                below is the submit affordance. */}
            <AstryxFormTextInput
              type="password"
              label={t('webui.menu.NewPasswordAgain')}
            />
          </BAIFormItem>
        </Form>
        <Button
          variant="primary"
          onClick={onSubmit}
          isLoading={mutation.isPending}
          label={t('webui.menu.Update')}
        />
      </BAIFlex>
    </BAIModal>
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
      mask={{ closable: false }}
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

/**
 * Modal for sending a password change email (forgot password flow).
 */
const ChangePasswordEmailModal: React.FC<{
  open: boolean;
  apiEndpoint: string;
  onClose: () => void;
}> = ({ open, apiEndpoint, onClose }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const form = useRef<FormInstance>(null);
  const anonymousBaiClient = useAnonymousBackendaiClient({
    api_endpoint: apiEndpoint,
  });

  const mutation = useTanMutation({
    mutationFn: (email: string) => {
      return anonymousBaiClient.cloud.send_password_change_email(email);
    },
  });

  const handleSend = () => {
    form.current
      ?.validateFields()
      .then((values) => {
        mutation.mutate(values.email, {
          onSuccess() {
            message.success({
              content: t('signUp.PasswordChangeEmailSent'),
            });
            onClose();
          },
          onError(error: any) {
            message.error({
              content:
                error?.statusCode === 400
                  ? t('signUp.EmailNotRegistered')
                  : t('signUp.SendError'),
            });
          },
        });
      })
      .catch((e) => {
        logger.error('Validation failed for change password email form', e);
      });
  };

  return (
    <BAIModal
      title={t('login.SendChangePasswordEmail')}
      open={open}
      onCancel={onClose}
      onOk={handleSend}
      confirmLoading={mutation.isPending}
      okText={t('login.EmailSendButton')}
      destroyOnHidden
      getContainer={false}
    >
      <Text as="p" display="block">
        {t('login.DescChangePasswordEmail')}
      </Text>
      <Form ref={form} layout="vertical" disabled={mutation.isPending}>
        <BAIFormItem
          name="email"
          label={t('signUp.E-mail')}
          rules={[
            { required: true, message: t('signUp.EmailInputRequired') },
            {
              pattern: /^[A-Z0-9a-z#\-_]+@.+\..+$/,
              message: t('signUp.InvalidEmail'),
            },
          ]}
        >
          <AstryxFormTextInput
            type="email"
            label={t('signUp.E-mail')}
            hasAutoFocus
          />
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default LoginFormPanel;
