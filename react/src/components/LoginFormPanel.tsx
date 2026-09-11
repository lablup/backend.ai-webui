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
// The Form ENGINE is self-hosted since ticket 34 (live again since ticket 35),
// and its visual layer is BAI's (`Form.Item` IS `BAIFormItem`); the controls
// are the Astryx form-control adapters.
import { Form, type FormInstance } from '../form-engine';
import { baiSignedRequestWithPromise } from '../helper';
import type { LoginConfigState } from '../helper/loginConfig';
import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { useThemeMode } from '../hooks/useThemeMode';
import { theme } from '../theme-shim';
import BAIFormItem from './BAIFormItem';
import './LoginFormPanel.css';
import SignupModal from './SignupModal';
import {
  TOTPActivateForm,
  type TOTPActivateFormData,
} from './TOTPActivateModal';
import { AstryxFormTextInput } from './astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import { List, ListItem } from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIModal,
  BAIFlex,
  useBAILogger,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import DOMPurify from 'dompurify';
import { Trash2, TriangleAlert } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ConnectionMode = 'SESSION' | 'API';

/** One row of the endpoint history list. */
export interface EndpointHistoryEntry {
  endpoint: string;
  /** Pinned from `VITE_DEFAULT_API_ENDPOINT`; tagged, but deletable like the rest. */
  isFromEnv?: boolean;
}

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
  form: FormInstance;
  isRememberUserId: boolean;
  onChangeRememberUserId: (next: boolean) => void;
  endpointHistory: EndpointHistoryEntry[];
  onSelectEndpoint: (ep: string) => void;
  onDeleteEndpoint: (ep: string) => void;
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
  form,
  isRememberUserId,
  onChangeRememberUserId,
  endpointHistory,
  onSelectEndpoint,
  onDeleteEndpoint,
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

  const [isEndpointHistoryOpen, setIsEndpointHistoryOpen] = useState(false);
  const [showChangePasswordEmailModal, setShowChangePasswordEmailModal] =
    useState(false);

  const modalWidth = 400;
  // The dialog's own slots pad 24px; the login screen wants 32px around a form
  // this sparse, so the header sets its inline padding outright and the body
  // adds the remaining 8px on top of `LayoutContent`'s.
  const dialogPaddingInline = 32;
  const bodyExtraPaddingInline = dialogPaddingInline - 24;
  // The logo is the screen's masthead: it gets more room above than below,
  // and clears the first field by more than one field gap.
  const logoPaddingTop = 48;
  const logoToFirstFieldGap = 32;
  const fieldSize = 'lg' as const;
  const fieldGap = token.margin;

  return (
    <>
      <BAIModal
        open={isOpen}
        closable={false}
        // The mask dims the persisted splash behind it, softening the weave and
        // the version/copyright metadata the login screen uses as its backdrop.
        mask={!needToResetPassword}
        keyboard={false}
        maskClosable={false}
        footer={null}
        width={modalWidth}
        title={
          // A flex row, not `textAlign: center`: as an inline image the 35px
          // logo overflows the header's 27px line box and paints outside its
          // padding box.
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
        classNames={{ body: 'bai-login-form' }}
        styles={{
          header: {
            borderBottom: 'none',
            paddingBottom: 0,
            paddingInline: dialogPaddingInline,
            paddingTop: logoPaddingTop,
          },
          // `LayoutContent` owns the body padding (`16px 24px`), so anything
          // set here ADDS to it — see `dialogPaddingInline` above.
          body: {
            paddingInline: bodyExtraPaddingInline,
            paddingTop: logoToFirstFieldGap - 16,
            paddingBottom: 16,
          },
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
          // `marginTop` keeps the masthead gap identical whether or not this
          // control is present: the field label that otherwise follows the logo
          // paints 2px below its box (half-leading of a 14px/22px line), while
          // the segmented pill fills from its box edge. Measured, not guessed.
          <div style={{ marginTop: 2, marginBottom: fieldGap }}>
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
          // Every field here is required to sign in, so the app-wide
          // "(optional)" suffix would be both noise and wrong.
          requiredMark={false}
          onKeyDown={onKeyDown}
          initialValues={{ api_endpoint: apiEndpoint }}
        >
          {/* The endpoint is the form's first field: which server you sign in
              to decides which credentials apply (FR-3560). */}
          <div
            // The saved endpoints behave as the field's own autofill: focus
            // opens the list, focus-out closes it. Picking a row unmounts the
            // row that holds focus, so focus lands outside and the next click
            // on the input opens the list again.
            onFocus={() => setIsEndpointHistoryOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsEndpointHistoryOpen(false);
              }
            }}
            style={{ marginBottom: fieldGap }}
          >
            <BAIFormItem
              name="api_endpoint"
              label={t('login.Endpoint', { postProcess: [] })}
              tooltip={
                <VStack gap={1} align="stretch">
                  <Text weight="semibold">{t('login.EndpointInfo')}</Text>
                  {/* `login.DescEndpoint` is authored with `<br/>`s. */}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(t('login.DescEndpoint')),
                    }}
                  />
                </VStack>
              }
              style={{ marginBottom: 0 }}
              rules={[
                {
                  pattern: /^https?:\/\/(.*)/,
                  message: t('login.EndpointStartWith'),
                },
              ]}
            >
              <AstryxFormTextInput
                size={fieldSize}
                label={t('login.Endpoint', { postProcess: [] })}
                disabled={isLoading}
                onChange={(value) => onSetApiEndpoint(value)}
              />
            </BAIFormItem>
            {isEndpointHistoryOpen && endpointHistory.length > 0 && (
              <div
                // In FLOW under the input, not floating over it: the list has
                // to sit below the field it fills, and an absolutely-positioned
                // panel here either overflowed the dialog's scroll box or,
                // opening upward, covered the very label it belongs to. Height
                // is capped so a long history scrolls inside the list instead
                // of growing the dialog.
                style={{
                  marginTop: 'var(--spacing-1)',
                  maxHeight: 140,
                  overflowY: 'auto',
                  background: 'var(--color-background-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-element)',
                }}
              >
                <List density="compact" hasDividers>
                  {endpointHistory.map(({ endpoint, isFromEnv }) => (
                    <ListItem
                      key={endpoint}
                      label={isFromEnv ? `${endpoint} (env)` : endpoint}
                      onClick={() => {
                        onSelectEndpoint(endpoint);
                        setIsEndpointHistoryOpen(false);
                      }}
                      endContent={
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size="1em" />}
                          label={`${t('button.Delete')}: ${endpoint}`}
                          onClick={(e) => {
                            // The row is an invisible-button target; deleting
                            // must not also select it.
                            e.stopPropagation();
                            onDeleteEndpoint(endpoint);
                          }}
                        />
                      }
                    />
                  ))}
                </List>
              </div>
            )}
          </div>

          {/* SESSION login fields */}
          {connectionMode === 'SESSION' && (
            <>
              {/* `autoComplete` is what lets a password manager recognise this
                  as a login form; Astryx spreads it onto the native `<input>`.
                  The webserver authenticates by EMAIL only — a bare `username`
                  is rejected with a credential mismatch (FR-3560). */}
              <BAIFormItem
                name="user_id"
                label={t('login.Email', { postProcess: [] })}
                style={{ marginBottom: fieldGap }}
              >
                <AstryxFormTextInput
                  size={fieldSize}
                  label={t('login.Email', { postProcess: [] })}
                  maxLength={64}
                  autoComplete="username"
                  // Focus the first field when the login form opens. When OTP is
                  // later required, the OTP input mounts with its own autoFocus
                  // and takes over.
                  hasAutoFocus={!otpRequired}
                  disabled={isLoading}
                />
              </BAIFormItem>
              <BAIFormItem
                name="password"
                label={t('login.Password', { postProcess: [] })}
                style={{ marginBottom: fieldGap }}
              >
                <AstryxFormTextInput
                  size={fieldSize}
                  type="password"
                  label={t('login.Password', { postProcess: [] })}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </BAIFormItem>
              {otpRequired && (
                <BAIFormItem
                  name="otp"
                  label={t('totp.OTP', { postProcess: [] })}
                  style={{ marginBottom: fieldGap }}
                >
                  <AstryxFormTextInput
                    size={fieldSize}
                    label={t('totp.OTP', { postProcess: [] })}
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
                label={t('login.APIKey', { postProcess: [] })}
                style={{ marginBottom: fieldGap }}
              >
                <AstryxFormTextInput
                  size={fieldSize}
                  label={t('login.APIKey', { postProcess: [] })}
                  maxLength={20}
                  hasAutoFocus
                  disabled={isLoading}
                />
              </BAIFormItem>
              <BAIFormItem
                name="secret_key"
                label={t('login.SecretKey', { postProcess: [] })}
                style={{ marginBottom: fieldGap }}
              >
                <AstryxFormTextInput
                  size={fieldSize}
                  type="password"
                  label={t('login.SecretKey', { postProcess: [] })}
                  maxLength={40}
                  disabled={isLoading}
                />
              </BAIFormItem>
            </>
          )}

          {/* Remember-ID and password recovery sit with the credentials they
              belong to: one row directly under the last field, above the CTA. */}
          {connectionMode === 'SESSION' && (
            <BAIFlex
              gap="xs"
              justify="between"
              align="center"
              wrap="wrap"
              style={{ marginBottom: fieldGap }}
            >
              <span className="bai-login-remember-id">
                <CheckboxInput
                  size="sm"
                  label={t('login.RememberID')}
                  value={isRememberUserId}
                  onChange={onChangeRememberUserId}
                  isDisabled={isLoading}
                />
              </span>
              {loginConfig.allowAnonymousChangePassword && (
                // Quiet by design: it reads as an emphasised label, not as a
                // second call to action competing with Login.
                <span className="bai-login-find-password">
                  <Link
                    isStandalone
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowChangePasswordEmailModal(true);
                    }}
                  >
                    {t('login.FindPassword')}
                  </Link>
                </span>
              )}
            </BAIFlex>
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
          <BAIFormItem
            className="bai-login-submit"
            style={{ marginBottom: token.marginSM }}
          >
            <Button
              variant="primary"
              size={fieldSize}
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
                size={fieldSize}
                width="100%"
                onClick={onSAMLLogin}
                label={t('login.singleSignOn.LoginWithSAML')}
              />
            </BAIFormItem>
          )}
          {loginConfig.singleSignOnVendors.includes('openid') && (
            <BAIFormItem style={{ marginBottom: token.marginSM }}>
              <Button
                size={fieldSize}
                width="100%"
                onClick={onOpenIDLogin}
                label={t('login.singleSignOn.LoginWithRealm', {
                  realmName: loginConfig.ssoRealmName || 'OpenID',
                })}
              />
            </BAIFormItem>
          )}

          {/* Sign-up stays at the very bottom, centred. */}
          {loginConfig.signup_support && (
            <BAIFlex
              justify="center"
              align="center"
              style={{ marginTop: token.marginLG }}
            >
              <Link
                isStandalone
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onShowSignupDialog();
                }}
              >
                {t('login.SignUp')}
              </Link>
            </BAIFlex>
          )}
        </Form>
      </BAIModal>

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
    // ticket 30; converting this one call site to the pilot dialog now would
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
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text as="p" display="block" style={{ margin: 0 }}>
          {t('login.DescChangePasswordEmail')}
        </Text>
        <Form ref={form} layout="vertical" disabled={mutation.isPending}>
          <BAIFormItem
            name="email"
            label={t('signUp.E-mail')}
            style={{ marginBottom: 0 }}
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
      </BAIFlex>
    </BAIModal>
  );
};

export default LoginFormPanel;
