/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
  loginConfigState,
} from '../hooks/useWebUIConfig';
import { pluginApiEndpointState } from '../hooks/useWebUIPluginState';
import { jotaiStore } from './DefaultProviders';
import LoginFormPanel from './LoginFormPanel';
import { App, Button, Form, type MenuProps } from 'antd';
import { BAIModal, BAIFlex, BAIConfigProvider } from 'backend.ai-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ConnectionMode = 'SESSION' | 'API';

/**
 * Extract the error type suffix from a Backend.AI problem type URL.
 * e.g., "https://api.backend.ai/probs/auth-failed" → "auth-failed"
 */
const extractErrorType = (typeUrl?: string): string => {
  if (!typeUrl) return '';
  const parts = typeUrl.split('/');
  return parts[parts.length - 1] || '';
};

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
  const setPluginApiEndpoint = useSetAtom(pluginApiEndpointState);

  // State
  const [loginConfig, setLoginConfig] = useState<LoginConfigState>(() =>
    getDefaultLoginConfig(),
  );
  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>('SESSION');
  const [apiEndpoint, setApiEndpoint] = useState(() => {
    const stored = localStorage.getItem('backendaiwebui.api_endpoint');
    return stored ? stored.replace(/^"+|"+$/g, '') : '';
  });
  const [otpRequired, setOtpRequired] = useState(false);
  const [needsOtpRegistration, setNeedsOtpRegistration] = useState(false);
  const [totpRegistrationToken, setTotpRegistrationToken] = useState('');
  const [needToResetPassword, setNeedToResetPassword] = useState(false);
  // Use useRef instead of useState to avoid exposing plaintext credentials
  // in React DevTools and to prevent unnecessary re-renders.
  const expiredCredentialsRef = useRef<{
    username: string;
    password: string;
  } | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupPreloadedToken, setSignupPreloadedToken] = useState<
    string | undefined
  >();
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false);
  const [isBlockPanelOpen, setIsBlockPanelOpen] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [blockType, setBlockType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<{
    message: string;
    description?: string;
  } | null>(null);
  const [endpoints, setEndpoints] = useState<string[]>(() => {
    return (globalThis as any).backendaioptions?.get('endpoints', []) ?? [];
  });
  const [showEndpointInput, setShowEndpointInput] = useState(true);
  const [isEndpointDisabled, setIsEndpointDisabled] = useState(false);

  const [form] = Form.useForm();
  const clientRef =
    useRef<ReturnType<typeof createBackendAIClient>['client']>(null);
  const configRef = useRef<LoginConfigState>(loginConfig);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

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
    } else {
      setShowEndpointInput(false);
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
      setLoginError({ message: t('error.LoginFailed') });
    });
  }, [isConfigLoaded, loginPlugin, t]);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = loginConfig;
  }, [loginConfig]);

  // Sync apiEndpoint state changes to the form field.
  // Ant Design's initialValues only applies on first render, so subsequent
  // state updates (from config loading, localStorage restoration, etc.)
  // must be explicitly synced to the form.
  useEffect(() => {
    if (apiEndpoint) {
      form.setFieldsValue({ api_endpoint: apiEndpoint });
    }
  }, [apiEndpoint, form]);

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
    setLoginError({ message: text, description: detail });
  }, []);

  const open = useCallback(() => {
    // Cancel any pending block timer so the block modal doesn't overlay
    // the login panel (and any error notifications) after a login failure.
    if (blockTimerRef.current) {
      clearTimeout(blockTimerRef.current);
      blockTimerRef.current = null;
    }
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
    // Cancel any pending block timer so a delayed timer from block()
    // doesn't re-open the block panel after a successful login.
    if (blockTimerRef.current) {
      clearTimeout(blockTimerRef.current);
      blockTimerRef.current = null;
    }
    setIsLoginPanelOpen(false);
    setIsBlockPanelOpen(false);
    setLoginError(null);
  }, []);

  const block = useCallback((message = '', type = '') => {
    setBlockMessage(message);
    setBlockType(type);

    // Clear any existing block timer to prevent a stale timer from firing.
    if (blockTimerRef.current) {
      clearTimeout(blockTimerRef.current);
    }

    blockTimerRef.current = setTimeout(() => {
      blockTimerRef.current = null;
      // Use the functional updater pattern to read the current isLoginPanelOpen
      // value at callback time, avoiding the stale closure that previously caused
      // the block modal to overlay error notifications after a login failure.
      setIsLoginPanelOpen((currentIsLoginPanelOpen) => {
        if (!currentIsLoginPanelOpen) {
          setIsBlockPanelOpen(true);
        }
        // Return unchanged value — this is a read-only check, not a state change.
        return currentIsLoginPanelOpen;
      });
    }, 2000);
  }, []);

  const clearSavedLoginInfo = useCallback(() => {
    localStorage.removeItem('backendaiwebui.login.api_key');
    localStorage.removeItem('backendaiwebui.login.secret_key');
    localStorage.removeItem('backendaiwebui.login.user_id');
    localStorage.removeItem('backendaiwebui.login.password');
  }, []);

  const doGQLConnect = useCallback(
    async (client: ReturnType<typeof createBackendAIClient>['client']) => {
      // Read directly from Jotai store to get the latest config synchronously,
      // including any merged webserver config from loadConfigFromWebServer().
      // Using configRef.current here would return stale config because React
      // hasn't re-rendered yet after the Jotai atom update.
      const cfg = jotaiStore.get(loginConfigState) ?? configRef.current;
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
      // Read the endpoint from the connected client to avoid stale closure
      // values. When handleLogin calls setApiEndpoint(ep) then immediately
      // invokes connectUsingSession, the doGQLConnect closure still captures
      // the OLD apiEndpoint (often "" on first launch). The client object
      // always has the correct endpoint that was used for the connection.
      const connectedEndpoint =
        (globalThis as any).backendaiclient?._config?.endpoint || apiEndpoint;
      localStorage.setItem('backendaiwebui.api_endpoint', connectedEndpoint);
      setPluginApiEndpoint(connectedEndpoint);
    },
    [endpoints, close, clearSavedLoginInfo, apiEndpoint, setPluginApiEndpoint],
  );

  const connectUsingSession = useCallback(
    async (showError = true, endpointOverride?: string) => {
      const ep = (endpointOverride ?? apiEndpoint).trim();
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
        try {
          await doGQLConnect(client);
        } catch (err: unknown) {
          handleGQLError(err, showError);
        }
        return;
      }

      // Not yet authenticated. Show block panel while connecting (only for user-initiated login).
      if (showError) {
        block(t('login.PleaseWait'), t('login.ConnectingToCluster'));
      }

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
          window.location.href = '/';
          return;
        } catch {
          notification(t('eduapi.CannotAuthorizeSessionByToken'));
          window.location.href = '/';
          return;
        }
      }

      // Do session login
      // client.login() returns only on success (authenticated === true).
      // All failure cases throw: login errors carry `isLoginError: true` with
      // `data.type` for classification; server errors carry `isError: true`
      // with structured info from _wrapWithPromise.
      try {
        await client.login(otp);
        await doGQLConnect(client);
        return;
      } catch (err: unknown) {
        setIsBlockPanelOpen(false);

        const handled = handleLoginError(err, showError, userId, password);
        if (handled === 'keep-open') {
          // A dedicated modal (password reset, TOTP registration) was opened.
          // Keep the login panel open to preserve form values for child modals.
          setIsLoading(false);
          return;
        }
      }

      setIsBlockPanelOpen(false);
      open();
      setIsLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiEndpoint, form, endpoints, doGQLConnect, block, open, notification, t],
  );

  /**
   * Unified login error handler. Classifies errors from client.login() and
   * shows the appropriate notification or opens a dedicated modal.
   *
   * Returns 'keep-open' when a child modal (password reset, TOTP registration)
   * needs the login panel to stay open (to preserve form values). Returns
   * 'reopen' for all other cases so the caller reopens the login panel.
   */
  const handleLoginError = useCallback(
    (
      err: unknown,
      showError: boolean,
      userId: string,
      password: string,
    ): 'keep-open' | 'reopen' => {
      const e = err as {
        isLoginError?: boolean;
        isError?: boolean;
        type?: string;
        title?: string;
        message?: string;
        description?: string;
        statusCode?: number;
        data?: Record<string, unknown>;
      };

      // --- Login errors (envelope responses from /server/login) ---
      if (e.isLoginError && e.data) {
        const errorType = extractErrorType(e.data.type as string);
        const details = ((e.data.details as string) || '') as string;

        switch (errorType) {
          case 'password-expired':
            expiredCredentialsRef.current = { username: userId, password };
            setNeedToResetPassword(true);
            return 'keep-open';

          case 'require-totp-registration':
            setTotpRegistrationToken(
              e.data.two_factor_registration_token as string,
            );
            setNeedsOtpRegistration(true);
            return 'keep-open';

          case 'require-totp-authentication':
            if (showError && otpRequired) {
              notification(t('login.PleaseInputOTPCode'));
            }
            setOtpRequired(true);
            setIsLoading(false);
            return 'reopen';

          case 'rejected-by-hook':
            if (
              details.includes('Invalid TOTP code provided') ||
              details.includes('Failed to validate OTP')
            ) {
              setOtpRequired(true);
              form.setFieldValue('otp', '');
              setIsLoading(false);
              if (showError) {
                notification(t('totp.InvalidTotpCode'));
              }
            } else if (showError) {
              notification(t('error.LoginFailed'), details);
            }
            return 'reopen';

          case 'active-login-session-exists':
            // TODO(needs-backend): Add force login confirmation dialog that
            // calls client.login(otp, true) to override the existing session.
            // The `force` parameter is already supported by the backend API
            // and client.login(). See FR-2377 for details.
            if (showError) {
              notification(
                t('login.ActiveSessionExists'),
                t('login.ActiveSessionExistsDescription'),
              );
            }
            return 'reopen';

          case 'login-session-expired':
            if (showError) {
              notification(t('login.SessionExpired'));
            }
            return 'reopen';

          case 'auth-failed':
            if (showError) {
              if (details.toLowerCase().includes('email verification')) {
                notification(t('login.EmailVerificationRequired'));
              } else {
                notification(t('error.LoginInformationMismatch'));
              }
            }
            return 'reopen';

          case 'monitor-role-login-forbidden':
            if (showError) {
              notification(t('login.MonitorRoleLoginForbidden'));
            }
            return 'reopen';

          default:
            // Legacy string-based fallbacks for backward compatibility
            // with older backends that may not send a `type` field.
            if (details.includes('User credential mismatch.')) {
              if (showError) {
                notification(t('error.LoginInformationMismatch'));
              }
            } else if (
              details.includes('You must register Two-Factor Authentication.')
            ) {
              setTotpRegistrationToken(
                e.data.two_factor_registration_token as string,
              );
              setNeedsOtpRegistration(true);
              return 'keep-open';
            } else if (
              details.includes(
                'You must authenticate using Two-Factor Authentication.',
              ) ||
              details.includes('OTP not provided')
            ) {
              if (showError && otpRequired) {
                notification(t('login.PleaseInputOTPCode'));
              }
              setOtpRequired(true);
              setIsLoading(false);
              return 'reopen';
            } else if (
              details.includes('Invalid TOTP code provided') ||
              details.includes('Failed to validate OTP')
            ) {
              setOtpRequired(true);
              form.setFieldValue('otp', '');
              setIsLoading(false);
              if (showError) {
                notification(t('totp.InvalidTotpCode'));
              }
              return 'reopen';
            } else if (details.indexOf('Password expired on ') === 0) {
              expiredCredentialsRef.current = { username: userId, password };
              setNeedToResetPassword(true);
              return 'keep-open';
            } else if (showError) {
              const fallbackMessage =
                (typeof e.title === 'string' && e.title.trim()) ||
                (typeof e.message === 'string' && e.message.trim()) ||
                t('error.UnknownError');
              notification(fallbackMessage);
            }
            return 'reopen';
        }
      }

      // --- Server errors (429, 502, 503, etc. from _wrapWithPromise) ---
      if (e.isError && e.type) {
        const errorType = extractErrorType(e.type);
        if (showError) {
          switch (errorType) {
            case 'login-blocked':
            case 'too-many-requests':
            case 'rate-limit-exceeded':
              notification(t('error.TooManyLoginFailures'));
              break;
            case 'server-frozen':
              notification(t('login.ServerMaintenance'));
              break;
            case 'bad-gateway':
              notification(t('login.ServerUnreachable'));
              break;
            case 'invalid-api-params':
            case 'generic-bad-request':
              notification(e.title || t('error.LoginFailed'));
              break;
            default:
              notification(
                e.title || t('error.LoginFailed'),
                e.description || e.message,
              );
              break;
          }
        }
        return 'reopen';
      }

      // --- Unstructured errors (network failures, etc.) ---
      if (showError) {
        if (e.message) {
          notification(e.title || t('error.LoginFailed'), e.message);
        } else {
          notification(t('error.LoginInformationMismatch'));
        }
      }
      return 'reopen';
    },
    [notification, t, otpRequired, form],
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
    async (_showError = true, endpointOverride?: string) => {
      const ep = (endpointOverride ?? apiEndpoint).trim();
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
    setLoginError(null);

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

    if ((globalThis as Record<string, unknown>).isElectron) {
      await loadConfigFromWebServer(ep);
    }

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
      await connectUsingSession(true, ep);
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
      await connectUsingAPI(true, ep);
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
    return ep.trim().replace(/\/+$/, '');
  }, [apiEndpoint]);

  // Login method: attempts silent or interactive login depending on mode.
  // Used by the orchestration hook as `onLogin`.
  const login = useCallback(
    async (showError = true) => {
      const ep = resolveEndpoint();
      if ((globalThis as Record<string, unknown>).isElectron) {
        await loadConfigFromWebServer(ep);
      }
      if (connectionMode === 'SESSION') {
        await connectUsingSession(showError, ep);
      } else if (connectionMode === 'API') {
        await connectUsingAPI(showError, ep);
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
    if ((globalThis as Record<string, unknown>).isElectron) {
      await loadConfigFromWebServer(ep);
    }
    if (connectionMode === 'SESSION') {
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

  const handleConnectionModeChange = useCallback(
    (mode: ConnectionMode) => {
      if (!loginConfig.change_signin_support) return;
      setConnectionMode(mode);
      setLoginError(null);
      localStorage.setItem('backendaiwebui.connection_mode', mode);
    },
    [loginConfig.change_signin_support],
  );

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
    // ConfigProvider is needed to override Message z-index for error notifications
    // so they appear above the block panel (z-index 10000) instead of behind it.
    <BAIConfigProvider
      theme={{
        components: {
          Message: { zIndexPopup: 10001 },
        },
      }}
    >
      <App>
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
            loginError={loginError}
            onClearLoginError={() => setLoginError(null)}
            connectionMode={connectionMode}
            loginConfig={loginConfig}
            apiEndpoint={apiEndpoint}
            otpRequired={otpRequired}
            needsOtpRegistration={needsOtpRegistration}
            totpRegistrationToken={totpRegistrationToken}
            needToResetPassword={needToResetPassword}
            expiredCredentials={expiredCredentialsRef.current}
            showSignupModal={showSignupModal}
            signupPreloadedToken={signupPreloadedToken}
            showEndpointInput={showEndpointInput}
            isEndpointDisabled={isEndpointDisabled}
            form={form}
            endpointMenuItems={endpointMenuItems}
            onEndpointMenuClick={handleEndpointMenuClick}
            onKeyDown={handleKeyDown}
            onLogin={handleLogin}
            onConnectionModeChange={handleConnectionModeChange}
            onShowSignupDialog={showSignupDialog}
            onSAMLLogin={handleSAMLLogin}
            onOpenIDLogin={handleOpenIDLogin}
            onSetApiEndpoint={setApiEndpoint}
            onSetOtpRequired={setOtpRequired}
            onSetNeedsOtpRegistration={setNeedsOtpRegistration}
            onSetNeedToResetPassword={(v: boolean) => {
              setNeedToResetPassword(v);
              if (!v) expiredCredentialsRef.current = null;
            }}
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
            mask={{ closable: false }}
            getContainer={false}
            destroyOnHidden
          >
            <div style={{ textAlign: 'center', paddingTop: 15 }}>
              {blockMessage}
            </div>
          </BAIModal>
        </div>
      </App>
    </BAIConfigProvider>
  );
};

export default LoginView;
