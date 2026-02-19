/**
 * LoginView - React implementation of the Backend.AI login component.
 *
 * Supports SESSION and API connection modes, OTP/TOTP flows,
 * endpoint configuration, and integrates with existing React child components.
 *
 * Config is fetched and parsed entirely within React via useInitializeConfig.
 * Login flow orchestration (auto-logout, tab counting, initial login) is
 * handled by the useLoginOrchestration hook, replacing the Lit shell's
 * firstUpdated() logic.
 */
import {
  getDefaultLoginConfig,
  type LoginConfigState,
} from '../helper/loginConfig';
import {
  createBackendAIClient,
  connectViaGQL,
  tokenLogin,
  loadConfigFromWebServer,
  loginWithSAML,
  loginWithOpenID,
} from '../helper/loginSessionAuth';
import { useLoginOrchestration } from '../hooks/useLoginOrchestration';
import {
  useInitializeConfig,
  useConfigRefreshPageEffect,
  loginPluginState,
} from '../hooks/useWebUIConfig';
import LoginFormPanel from './LoginFormPanel';
import { Button, Form, Modal, type MenuProps } from 'antd';
import { BAIModal, BAIFlex } from 'backend.ai-ui';
import DOMPurify from 'dompurify';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ConnectionMode = 'SESSION' | 'API';

const LoginView: React.FC = () => {
  'use memo';

  const { t } = useTranslation();

  // Initialize config from config.toml (replaces Lit shell's _parseConfig + loadConfig)
  const {
    isLoaded: isConfigLoaded,
    loginConfig: atomLoginConfig,
    loadConfig,
  } = useInitializeConfig();

  // Set up proxy URL on backend client when connected
  useConfigRefreshPageEffect();

  // Login plugin name from config
  const loginPlugin = useAtomValue(loginPluginState);

  // State
  const [loginConfig, setLoginConfig] = useState<LoginConfigState>(() =>
    getDefaultLoginConfig(),
  );
  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>('SESSION');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [needsOtpRegistration, setNeedsOtpRegistration] = useState(false);
  const [totpRegistrationToken, setTotpRegistrationToken] = useState('');
  const [needToResetPassword, setNeedToResetPassword] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupPreloadedToken, setSignupPreloadedToken] = useState<
    string | undefined
  >();
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false);
  const [isBlockPanelOpen, setIsBlockPanelOpen] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [blockType, setBlockType] = useState('');
  const [helpDescription, setHelpDescription] = useState('');
  const [helpDescriptionTitle, setHelpDescriptionTitle] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [showEndpointInput, setShowEndpointInput] = useState(true);
  const [isEndpointDisabled, setIsEndpointDisabled] = useState(false);

  const [form] = Form.useForm();
  const clientRef =
    useRef<ReturnType<typeof createBackendAIClient>['client']>(null);
  const configRef = useRef<LoginConfigState>(loginConfig);

  // Trigger config loading on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // When config finishes loading from the atom, apply it to local state
  useEffect(() => {
    if (!isConfigLoaded || !atomLoginConfig) return;

    const newCfg = atomLoginConfig;
    setLoginConfig(newCfg);
    setConnectionMode(newCfg.connection_mode);
    setApiEndpoint((prev) => newCfg.api_endpoint || prev);

    // Handle endpoint visibility
    if (newCfg.api_endpoint === '') {
      setShowEndpointInput(true);
      setIsEndpointDisabled(false);
    } else if (newCfg.api_endpoint_text === '') {
      setShowEndpointInput(true);
      setIsEndpointDisabled(false);
    } else {
      setIsEndpointDisabled(true);
    }
  }, [isConfigLoaded, atomLoginConfig]);

  // Load login plugin when config is ready
  useEffect(() => {
    if (!isConfigLoaded || !loginPlugin) return;

    // Sanitize the plugin name to prevent path traversal attacks.
    // Only allow alphanumeric characters, hyphens, and underscores.
    const sanitizedPlugin = loginPlugin.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedPlugin || sanitizedPlugin !== loginPlugin) return;

    import(
      /* webpackIgnore: true */
      `../../../src/plugins/${sanitizedPlugin}`
    ).catch(() => {
      document.dispatchEvent(
        new CustomEvent('add-bai-notification', {
          detail: {
            open: true,
            message: t('error.LoginFailed'),
          },
        }),
      );
    });
  }, [isConfigLoaded, loginPlugin, t]);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = loginConfig;
  }, [loginConfig]);

  // Initialize endpoints from options
  useEffect(() => {
    const storedEndpoints =
      (globalThis as any).backendaioptions?.get('endpoints', []) ?? [];

    setEndpoints(storedEndpoints);
  }, []);

  // Language initialization: bridge selected_language -> general.language
  // (replaces Lit shell's connectedCallback language setup)
  useEffect(() => {
    const supportLanguageCodes = [
      'en',
      'ko',
      'de',
      'el',
      'es',
      'fi',
      'fr',
      'id',
      'it',
      'ja',
      'mn',
      'ms',
      'pl',
      'pt',
      'pt-BR',
      'ru',
      'th',
      'tr',
      'vi',
      'zh-CN',
      'zh-TW',
    ];
    const selectedLang = (globalThis as any).backendaioptions?.get(
      'selected_language',
    );

    // Try full locale first (e.g., 'zh-CN'), then base language (e.g., 'zh')
    const browserLang = globalThis.navigator.language;
    let defaultLang: string;
    if (supportLanguageCodes.includes(browserLang)) {
      defaultLang = browserLang;
    } else {
      const baseLang = browserLang.split('-')[0];
      defaultLang = supportLanguageCodes.includes(baseLang) ? baseLang : 'en';
    }

    let lang: string;
    if (!selectedLang || selectedLang === 'default') {
      lang = defaultLang;
    } else {
      lang = supportLanguageCodes.includes(selectedLang)
        ? selectedLang
        : defaultLang;
    }
    (globalThis as any).backendaioptions.set('language', lang, 'general');
  }, []);

  const notification = useCallback((text: string, detail?: string) => {
    document.dispatchEvent(
      new CustomEvent('add-bai-notification', {
        detail: {
          open: true,
          message: text,
          description: detail,
        },
      }),
    );
  }, []);

  const open = useCallback(() => {
    setIsLoginPanelOpen(true);
    setIsBlockPanelOpen(false);

    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (
      loginConfig.signup_support &&
      apiEndpoint !== '' &&
      tokenParam !== undefined &&
      tokenParam !== null
    ) {
      setSignupPreloadedToken(tokenParam);
      setShowSignupModal(true);
    }
  }, [loginConfig.signup_support, apiEndpoint]);

  const close = useCallback(() => {
    setIsLoginPanelOpen(false);
    setIsBlockPanelOpen(false);
  }, []);

  const block = useCallback(
    (message = '', type = '') => {
      setBlockMessage(message);
      setBlockType(type);

      setTimeout(() => {
        if (!isBlockPanelOpen && !isConnected && !isLoginPanelOpen) {
          setIsBlockPanelOpen(true);
        }
      }, 2000);
    },
    [isBlockPanelOpen, isConnected, isLoginPanelOpen],
  );

  const clearSavedLoginInfo = useCallback(() => {
    localStorage.removeItem('backendaiwebui.login.api_key');
    localStorage.removeItem('backendaiwebui.login.secret_key');
    localStorage.removeItem('backendaiwebui.login.user_id');
    localStorage.removeItem('backendaiwebui.login.password');
  }, []);

  const doGQLConnect = useCallback(
    async (client: ReturnType<typeof createBackendAIClient>['client']) => {
      const cfg = configRef.current;
      const currentTime = Math.floor(Date.now() / 1000);

      (globalThis as any).backendaioptions.set(
        'last_login',
        currentTime,
        'general',
      );
      (globalThis as any).backendaioptions.set('login_attempt', 0, 'general');

      const updatedEndpoints = await connectViaGQL(client, cfg, endpoints);
      setEndpoints(updatedEndpoints);

      const event = new CustomEvent('backend-ai-connected', {
        detail: client,
      });
      document.dispatchEvent(event);
      close();
      clearSavedLoginInfo();
      localStorage.setItem('backendaiwebui.api_endpoint', apiEndpoint);
    },
    [endpoints, close, clearSavedLoginInfo, apiEndpoint],
  );

  const connectUsingSession = useCallback(
    async (showError = true) => {
      const ep = apiEndpoint.trim();
      if (ep === '') {
        setIsBlockPanelOpen(false);
        open();
        return;
      }

      const userId = form.getFieldValue('user_id') || '';
      const password = form.getFieldValue('password') || '';
      const otp = form.getFieldValue('otp') || '';

      const { client } = createBackendAIClient(userId, password, ep, 'SESSION');
      clientRef.current = client;

      try {
        await client.get_manager_version();
      } catch {
        setIsBlockPanelOpen(false);
        open();
        setIsLoading(false);
        if (showError) {
          notification(t('error.NetworkConnectionFailed'));
        }
        return;
      }

      // Check if already logged in
      let isLogon = false;
      try {
        isLogon = !!(await client.check_login());
      } catch {
        isLogon = false;
      }

      if (isLogon) {
        setIsConnected(true);
        try {
          await doGQLConnect(client);
        } catch (err: unknown) {
          handleGQLError(err, showError);
        }
        return;
      }

      // Not yet authenticated. Show block panel while connecting.
      block(t('login.PleaseWait'), t('login.ConnectingToCluster'));

      // Check for SSO token
      const urlParams = new URLSearchParams(window.location.search);
      const sToken = urlParams.get('sToken');
      if (sToken) {
        try {
          document.cookie = `sToken=${sToken}; expires=Session; path=/; Secure; SameSite=Lax`;
          const updatedEndpoints = await tokenLogin(
            client,
            sToken,
            configRef.current,
            endpoints,
          );
          setEndpoints(updatedEndpoints);
          setIsConnected(true);
          window.location.href = '/';
          return;
        } catch {
          notification(t('eduapi.CannotAuthorizeSessionByToken'));
          window.location.href = '/';
          return;
        }
      }

      // Do session login
      try {
        const { fail_reason, data } = await client.login(otp);
        if (fail_reason) {
          handleLoginFailReason(fail_reason, data, showError);
        } else {
          setIsConnected(true);
          await doGQLConnect(client);
        }
      } catch (err: unknown) {
        setIsBlockPanelOpen(false);
        if (showError) {
          const e = err as { title?: string; message?: string };
          if (e.message) {
            notification(e.title || t('error.LoginFailed'), e.message);
          } else {
            notification(t('error.LoginInformationMismatch'));
          }
        }
      }

      open();
      setIsLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiEndpoint, form, endpoints, doGQLConnect, block, open, notification, t],
  );

  const handleLoginFailReason = useCallback(
    (failReason: string, data: Record<string, unknown>, showError: boolean) => {
      if (failReason.includes('User credential mismatch.')) {
        open();
        notification(t('error.LoginInformationMismatch'));
        return;
      }
      if (failReason.includes('You must register Two-Factor Authentication.')) {
        setTotpRegistrationToken(data.two_factor_registration_token as string);
        setNeedsOtpRegistration(true);
        return;
      }
      if (
        failReason.includes(
          'You must authenticate using Two-Factor Authentication.',
        ) ||
        failReason.includes('OTP not provided')
      ) {
        if (otpRequired) {
          notification(t('login.PleaseInputOTPCode'));
        }
        setOtpRequired(true);
        setIsLoading(false);
        return;
      }
      if (
        failReason.includes('Invalid TOTP code provided') ||
        failReason.includes('Failed to validate OTP')
      ) {
        setOtpRequired(true);
        form.setFieldValue('otp', '');
        setIsLoading(false);
        notification(t('totp.InvalidTotpCode'));
        return;
      }
      if (failReason.indexOf('Password expired on ') === 0) {
        setNeedToResetPassword(true);
        return;
      }
      if (showError) {
        notification(t('error.UnknownError'));
      }
    },
    [open, notification, t, otpRequired, form],
  );

  const handleGQLError = useCallback(
    (err: unknown, showError: boolean) => {
      setIsBlockPanelOpen(false);
      if (showError) {
        const e = err as {
          title?: string;
          message?: string;
          status?: number;
        };
        if (e.message) {
          if (e.status === 408) {
            notification(
              t('error.LoginSucceededManagerNotResponding'),
              e.message,
            );
          } else {
            notification(e.title || t('error.LoginFailed'), e.message);
          }
        } else {
          notification(t('error.LoginInformationMismatch'));
        }
      }
      open();
      setIsLoading(false);
    },
    [notification, t, open],
  );

  const connectUsingAPI = useCallback(
    async (_showError = true) => {
      const ep = apiEndpoint.trim();
      const apiKey = form.getFieldValue('api_key') || '';
      const secretKey = form.getFieldValue('secret_key') || '';

      const { client } = createBackendAIClient(apiKey, secretKey, ep, 'API');
      clientRef.current = client;
      client.ready = false;

      try {
        await client.get_manager_version();
        await doGQLConnect(client);
      } catch {
        notification(t('error.NetworkConnectionFailed'));
        setIsLoading(false);
      }
    },
    [apiEndpoint, form, doGQLConnect, notification, t],
  );

  const handleLogin = useCallback(async () => {
    const loginAttempt = (globalThis as any).backendaioptions.get(
      'login_attempt',
      0,
      'general',
    );
    const lastLogin = (globalThis as any).backendaioptions.get(
      'last_login',
      Math.floor(Date.now() / 1000),
      'general',
    );

    const currentTime = Math.floor(Date.now() / 1000);

    if (
      loginAttempt >= loginConfig.login_attempt_limit &&
      currentTime - lastLogin > loginConfig.login_block_time
    ) {
      (globalThis as any).backendaioptions.set(
        'last_login',
        currentTime,
        'general',
      );
      (globalThis as any).backendaioptions.set('login_attempt', 0, 'general');
    } else if (loginAttempt >= loginConfig.login_attempt_limit) {
      (globalThis as any).backendaioptions.set(
        'last_login',
        currentTime,
        'general',
      );
      (globalThis as any).backendaioptions.set(
        'login_attempt',
        loginAttempt + 1,
        'general',
      );

      notification(t('login.TooManyAttempt'));
      return;
    } else {
      (globalThis as any).backendaioptions.set(
        'login_attempt',
        loginAttempt + 1,
        'general',
      );
    }

    const epInput = form.getFieldValue('api_endpoint') || apiEndpoint;
    const ep = epInput.replace(/\/+$/, '').trim();
    setApiEndpoint(ep);

    if (ep === '') {
      notification(t('login.APIEndpointEmpty'));
      return;
    }

    setIsLoading(true);

    if (connectionMode === 'SESSION') {
      const userId = (form.getFieldValue('user_id') || '').trim();
      const password = form.getFieldValue('password') || '';

      if (
        !userId ||
        userId === 'undefined' ||
        !password ||
        password === 'undefined'
      ) {
        notification(t('login.PleaseInputLoginInfo'));
        setIsLoading(false);
        return;
      }
      await connectUsingSession(true);
    } else {
      const apiKey = form.getFieldValue('api_key') || '';
      const secretKey = form.getFieldValue('secret_key') || '';

      if (
        !apiKey ||
        apiKey === 'undefined' ||
        !secretKey ||
        secretKey === 'undefined'
      ) {
        notification(t('login.PleaseInputLoginInfo'));
        setIsLoading(false);
        return;
      }
      await connectUsingAPI(true);
    }
  }, [
    loginConfig,
    form,
    apiEndpoint,
    connectionMode,
    connectUsingSession,
    connectUsingAPI,
    notification,
    t,
  ]);

  // Resolve the effective API endpoint from state or localStorage.
  const resolveEndpoint = useCallback((): string => {
    let ep = apiEndpoint;
    if (ep === '') {
      const stored = localStorage.getItem('backendaiwebui.api_endpoint');
      if (stored) {
        ep = stored.replace(/^"+|"+$/g, '');
        setApiEndpoint(ep);
      }
    }
    return ep.trim();
  }, [apiEndpoint]);

  // Login method: attempts silent or interactive login depending on mode.
  // Used by the orchestration hook as `onLogin`.
  const login = useCallback(
    async (showError = true) => {
      const ep = resolveEndpoint();
      if (connectionMode === 'SESSION') {
        if ((globalThis as Record<string, unknown>).isElectron) {
          await loadConfigFromWebServer(ep);
        }
        await connectUsingSession(showError);
      } else if (connectionMode === 'API') {
        await connectUsingAPI(showError);
      } else {
        open();
      }
    },
    [
      resolveEndpoint,
      connectionMode,
      connectUsingSession,
      connectUsingAPI,
      open,
    ],
  );

  // Check if a session login exists on the server.
  // Used by the orchestration hook as `onCheckLogin`.
  const checkLogin = useCallback(async (): Promise<boolean> => {
    const ep = resolveEndpoint();
    if (connectionMode === 'SESSION') {
      if ((globalThis as Record<string, unknown>).isElectron) {
        await loadConfigFromWebServer(ep);
      }
      if (ep === '') return false;
      const { client } = createBackendAIClient('', '', ep, 'SESSION');
      clientRef.current = client;
      try {
        await client.get_manager_version();
        const isLogon = await client.check_login();
        return !!isLogon;
      } catch {
        return false;
      }
    }
    return false;
  }, [resolveEndpoint, connectionMode]);

  // Log out the current session on the server.
  // Used by the orchestration hook as `onLogoutSession`.
  const logoutSession = useCallback(async (): Promise<void> => {
    if (clientRef.current) {
      await clientRef.current.logout();
    }
  }, []);

  // Orchestrate the initial login flow (auto-logout, tab counting, etc.)
  // This replaces the Lit shell's firstUpdated() login orchestration.
  useLoginOrchestration({
    onLogin: login,
    onOpen: open,
    onBlock: block,
    onCheckLogin: checkLogin,
    onLogoutSession: logoutSession,
    apiEndpoint,
    connectionMode,
  });

  const changeSigninMode = useCallback(() => {
    if (!loginConfig.change_signin_support) return;
    const newMode: ConnectionMode =
      connectionMode === 'SESSION' ? 'API' : 'SESSION';
    setConnectionMode(newMode);
    localStorage.setItem('backendaiwebui.connection_mode', newMode);
  }, [connectionMode, loginConfig.change_signin_support]);

  const showSignupDialog = useCallback(
    (preloadToken?: string) => {
      const ep =
        (form.getFieldValue('api_endpoint') || '').replace(/\/+$/, '') ||
        apiEndpoint.trim();
      if (ep === '') {
        notification(t('error.APIEndpointIsEmpty'));
        return;
      }
      setApiEndpoint(ep);
      setSignupPreloadedToken(preloadToken);
      setShowSignupModal(true);
    },
    [form, apiEndpoint, notification, t],
  );

  const deleteEndpoint = useCallback(
    (endpoint: string) => {
      const updated = endpoints.filter((e) => e !== endpoint);
      setEndpoints(updated);

      (globalThis as any).backendaioptions.set('endpoints', updated);
    },
    [endpoints],
  );

  const endpointMenuItems: MenuProps['items'] = [
    { key: 'header', label: t('login.EndpointHistory'), disabled: true },
    ...(endpoints.length === 0
      ? [{ key: 'empty', label: t('login.NoEndpointSaved') }]
      : endpoints.map((ep) => ({
          key: ep,
          label: (
            <BAIFlex justify="between" align="center" style={{ minWidth: 300 }}>
              <span>{ep}</span>
              <Button
                type="text"
                size="small"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  deleteEndpoint(ep);
                }}
              >
                {t('button.Delete')}
              </Button>
            </BAIFlex>
          ),
        }))),
  ];

  const handleEndpointMenuClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      if (key !== 'header' && key !== 'empty') {
        setApiEndpoint(key);
        form.setFieldValue('api_endpoint', key);
      }
    },
    [form],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    },
    [handleLogin],
  );

  const showEndpointDescription = useCallback(() => {
    setHelpDescriptionTitle(t('login.EndpointInfo'));
    setHelpDescription(t('login.DescEndpoint'));
    setIsHelpOpen(true);
  }, [t]);

  const handleSAMLLogin = useCallback(() => {
    const ep = apiEndpoint.trim();
    const { client } = createBackendAIClient('', '', ep, 'SESSION');
    loginWithSAML(client);
  }, [apiEndpoint]);

  const handleOpenIDLogin = useCallback(() => {
    const ep = apiEndpoint.trim();
    const { client } = createBackendAIClient('', '', ep, 'SESSION');
    loginWithOpenID(client);
  }, [apiEndpoint]);

  // Wrapper creates a stacking context above LoadingCurtain (z-index 9999).
  // Zero-sized so it doesn't intercept pointer events. Child modals use
  // position:fixed internally so they are visible and interactive.
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: 10000,
        overflow: 'visible',
      }}
    >
      <LoginFormPanel
        isOpen={isLoginPanelOpen}
        isLoading={isLoading}
        connectionMode={connectionMode}
        loginConfig={loginConfig}
        apiEndpoint={apiEndpoint}
        otpRequired={otpRequired}
        needsOtpRegistration={needsOtpRegistration}
        totpRegistrationToken={totpRegistrationToken}
        needToResetPassword={needToResetPassword}
        showSignupModal={showSignupModal}
        signupPreloadedToken={signupPreloadedToken}
        showEndpointInput={showEndpointInput}
        isEndpointDisabled={isEndpointDisabled}
        form={form}
        endpointMenuItems={endpointMenuItems}
        onEndpointMenuClick={handleEndpointMenuClick}
        onKeyDown={handleKeyDown}
        onLogin={handleLogin}
        onChangeSigninMode={changeSigninMode}
        onShowSignupDialog={showSignupDialog}
        onShowEndpointDescription={showEndpointDescription}
        onSAMLLogin={handleSAMLLogin}
        onOpenIDLogin={handleOpenIDLogin}
        onSetApiEndpoint={setApiEndpoint}
        onSetOtpRequired={setOtpRequired}
        onSetNeedsOtpRegistration={setNeedsOtpRegistration}
        onSetNeedToResetPassword={setNeedToResetPassword}
        onSetShowSignupModal={setShowSignupModal}
      />

      {/* Block/Error Panel */}
      <BAIModal
        open={isBlockPanelOpen && blockMessage !== ''}
        title={blockType || undefined}
        footer={
          <Button
            block
            onClick={() => {
              setIsBlockPanelOpen(false);
              open();
            }}
          >
            {t('login.CancelLogin')}
          </Button>
        }
        closable={false}
        maskClosable={false}
        getContainer={false}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', paddingTop: 15 }}>
          {blockMessage}
        </div>
      </BAIModal>

      {/* Help Description - zIndex above login modal */}
      <Modal
        open={isHelpOpen}
        title={helpDescriptionTitle}
        onCancel={() => setIsHelpOpen(false)}
        footer={null}
        width={350}
        zIndex={1050}
        getContainer={false}
      >
        <div
          style={{
            fontSize: 14,
            margin: 10,
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(helpDescription),
          }}
        />
      </Modal>
    </div>
  );
};

export default LoginView;
