/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * useTokenAuth - Hook for sToken-based authentication flow.
 *
 * Extracts and encapsulates the three-step authentication sequence from
 * EduAppLauncher:
 *   1. initClient  – initialize the BackendAI client with SESSION auth mode
 *   2. tokenLogin  – authenticate via sToken URL parameter
 *   3. prepareProjectInformation – fetch and cache group/project info
 *
 * Returns an `authenticate()` function that runs all three steps in order,
 * plus a `status` and `error` field for tracking the outcome.
 */
import { fetchAndParseConfig } from './useWebUIConfig';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type TokenAuthStatus =
  | 'idle'
  | 'authenticating'
  | 'authenticated'
  | 'error';

export interface TokenAuthResult {
  authenticate: () => Promise<void>;
  status: TokenAuthStatus;
  error: string | null;
}

const g = globalThis as any;

/**
 * Hook that provides token-based authentication for the EduAppLauncher flow.
 *
 * @param sToken  - The session token extracted from URL params (may be null)
 * @param endpoint - The API endpoint URL string (may be empty string)
 */
export function useTokenAuth(
  sToken: string | null,
  endpoint: string,
): TokenAuthResult {
  'use memo';

  const { t } = useTranslation();
  const [status, setStatus] = useState<TokenAuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  /**
   * Step 1: Initialize the BackendAI client in SESSION auth mode.
   */
  const _initClient = useCallback(
    async (resolvedEndpointArg: string): Promise<void> => {
      let resolvedEndpoint = resolvedEndpointArg;

      if (resolvedEndpoint === '') {
        const storedEndpoint = localStorage.getItem(
          'backendaiwebui.api_endpoint',
        );
        if (storedEndpoint != null) {
          resolvedEndpoint = storedEndpoint.replace(/^"+|"+$/g, '');
        }
      }
      resolvedEndpoint = resolvedEndpoint.trim();

      const clientConfig = new g.BackendAIClientConfig(
        '',
        '',
        resolvedEndpoint,
        'SESSION',
      );
      g.backendaiclient = new g.BackendAIClient(
        clientConfig,
        'Backend.AI Web UI.',
      );

      const configPath = g.isElectron ? './config.toml' : '../../config.toml';
      const tomlConfig = await fetchAndParseConfig(configPath);
      if (tomlConfig?.wsproxy?.proxyURL) {
        g.backendaiclient._config._proxyURL = tomlConfig.wsproxy.proxyURL;
      }

      await g.backendaiclient.get_manager_version();
      g.backendaiclient.ready = true;
    },
    [],
  );

  /**
   * Step 2: Perform token-based login.
   *
   * @returns true if authenticated successfully, false otherwise
   */
  const _tokenLogin = useCallback(
    async (tokenArg: string | null): Promise<boolean> => {
      const urlParams = new URLSearchParams(window.location.search);
      const resolvedToken =
        tokenArg ?? urlParams.get('sToken') ?? urlParams.get('stoken') ?? null;

      if (resolvedToken !== null) {
        document.cookie = `sToken=${encodeURIComponent(resolvedToken)}; path=/; Secure; SameSite=Lax`;
      }

      const extraParams: Record<string, string> = {};
      for (const [key, value] of urlParams.entries()) {
        if (key !== 'sToken' && key !== 'stoken') {
          extraParams[key] = value;
        }
      }

      try {
        const alreadyLoggedIn = await g.backendaiclient.check_login();
        if (!alreadyLoggedIn) {
          const loginSuccess = await g.backendaiclient.token_login(
            resolvedToken,
            extraParams,
          );
          if (!loginSuccess) {
            return false;
          }
        }
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  /**
   * Step 3: Fetch and cache group/project information for the current user.
   */
  const _prepareProjectInformation = useCallback(async (): Promise<void> => {
    const fields = ['email', 'groups {name, id}'];
    const query = `query { user{ ${fields.join(' ')} } }`;
    const response = await g.backendaiclient.query(query, {});

    g.backendaiclient.groups = response.user.groups
      .map((item: { name: string }) => item.name)
      .sort();
    g.backendaiclient.groupIds = response.user.groups.reduce(
      (acc: Record<string, string>, group: { name: string; id: string }) => {
        acc[group.name] = group.id;
        return acc;
      },
      {},
    );

    const currentProject = g.backendaiutils._readRecentProjectGroup();
    g.backendaiclient.current_group = currentProject
      ? currentProject
      : g.backendaiclient.groups[0];
    g.backendaiclient.current_group_id = () => {
      return g.backendaiclient.groupIds[g.backendaiclient.current_group];
    };
  }, []);

  /**
   * Run the full authentication sequence:
   *   initClient → tokenLogin → prepareProjectInformation
   */
  const authenticate = useCallback(async (): Promise<void> => {
    setStatus('authenticating');
    setError(null);

    try {
      await _initClient(endpoint);
    } catch {
      setError(t('eduapi.CannotInitializeClient'));
      setStatus('error');
      return;
    }

    const loginSuccess = await _tokenLogin(sToken);
    if (!loginSuccess) {
      setError(t('eduapi.CannotAuthorizeSessionByToken'));
      setStatus('error');
      return;
    }

    try {
      await _prepareProjectInformation();
    } catch {
      setError(t('eduapi.CannotAuthorizeSessionByToken'));
      setStatus('error');
      return;
    }

    setStatus('authenticated');
  }, [
    _initClient,
    _tokenLogin,
    _prepareProjectInformation,
    endpoint,
    sToken,
    t,
  ]);

  return { authenticate, status, error };
}
