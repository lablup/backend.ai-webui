/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useWebUINavigate } from '.';
import { useBackendAIAppLauncherFragment$key } from '../__generated__/useBackendAIAppLauncherFragment.graphql';
import { useSetBAINotification } from './useBAINotification';
import { BAILink, useBAILogger, useErrorMessageResolver } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export const TCP_APPS = ['sshd', 'vscode-desktop', 'xrdp', 'vnc'];
export const useBackendAIAppLauncher = (
  sessionFrgmt?: useBackendAIAppLauncherFragment$key | null,
  debugOptions?: {
    forceUseV1Proxy?: boolean;
    forceUseV2Proxy?: boolean;
    subdomain?: string;
  },
) => {
  'use memo';

  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const { getErrorMessage } = useErrorMessageResolver();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const { logger } = useBAILogger();

  const session = useFragment(
    graphql`
      fragment useBackendAIAppLauncherFragment on ComputeSessionNode {
        name
        row_id @required(action: NONE)
        vfolder_mounts
        scaling_group
        project_id
        service_ports
      }
    `,
    sessionFrgmt,
  );

  const appNotificationKey = `session-app-${session?.row_id}`;

  // Constants for proxy worker connection
  const PERMIT_KEY_STORAGE_KEY = 'backendaiwebui.appproxy-permit-key';
  const MAX_RETRY_ATTEMPTS = 5;
  const RETRY_DELAY_MS = 1000;
  const SERVER_ERROR_CODES = [500, 501, 502];

  /**
   * Maps progress stage to translated description
   */
  const getStageDescription = (stage: string, appName: string): string => {
    const stageKeyMap: Record<string, string> = {
      configuring: t('session.launcher.SettingUpProxyForApp', { appName }),
      connecting: t('session.launcher.AddingKernelToSocketQueue', { appName }),
      connected: t('session.appLauncher.Prepared', { appName }),
    };

    return (
      stageKeyMap[stage] || t('session.appLauncher.LaunchingApp', { appName })
    );
  };

  const getWSProxyVersion = async (): Promise<'v1' | 'v2'> => {
    logger.info('[wsproxy] getWSProxyVersion() called', {
      scaling_group: session?.scaling_group,
      project_id: session?.project_id,
      isElectron: globalThis.isElectron,
      // @ts-ignore
      debug: globalThis?.backendaiwebui?.debug,
      forceUseV1Proxy: debugOptions?.forceUseV1Proxy,
      forceUseV2Proxy: debugOptions?.forceUseV2Proxy,
    });
    // @ts-ignore
    if (globalThis?.backendaiwebui?.debug === true) {
      if (debugOptions?.forceUseV1Proxy) {
        logger.info('[wsproxy] forced v1 via debugOptions');
        return 'v1';
      } else if (debugOptions?.forceUseV2Proxy) {
        logger.info('[wsproxy] forced v2 via debugOptions');
        return 'v2';
      }
    }
    if (globalThis.isElectron) {
      logger.info('[wsproxy] Electron environment → v1');
      return 'v1';
    }
    try {
      const result: { wsproxy_version: 'v1' | 'v2' } =
        await baiClient.scalingGroup.getWsproxyVersion(
          session?.scaling_group,
          session?.project_id,
        );
      logger.info('[wsproxy] backend reported version:', result);
      return result.wsproxy_version;
    } catch (err) {
      logger.error(
        '[wsproxy] getWsproxyVersion() failed; defaulting to v1',
        err,
      );
      return 'v1';
    }
  };

  /**
   * Get proxy URL with proper trailing slash handling.
   *
   * IMPORTANT: Always returns URL with trailing slash to ensure proper
   * path resolution when used with new URL(relativePath, baseURL).
   * Without trailing slash, new URL() treats the last segment as a file
   * and replaces it instead of appending to it.
   *
   * Example:
   * - new URL('conf', 'http://host/v2/') → 'http://host/v2/conf' ✓
   * - new URL('conf', 'http://host/v2')  → 'http://host/conf' ✗
   */
  const getProxyURL = async (wsproxyVersion: string) => {
    let url = 'http://127.0.0.1:5050/';
    // Truthy check covers undefined, null, and empty string. The
    // Backend.AI client initializes `_config._proxyURL = null` by default,
    // and `config.toml` can ship `wsproxy.proxyURL = ""` for environments
    // that rely on the local default. Both cases must fall through to the
    // default URL above instead of overwriting it with a non-string value
    // (which would later crash on `url.endsWith(...)`).
    if (
      // @ts-ignore
      globalThis.__local_proxy?.url
    ) {
      // @ts-ignore
      url = globalThis.__local_proxy.url;
    } else if (baiClient._config.proxyURL) {
      url = baiClient._config.proxyURL;
    }
    // Normalize base URL (remove trailing slash if exists)
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    if (session) {
      if (wsproxyVersion !== 'v1') {
        return `${baseUrl}/${wsproxyVersion}/`;
      }
    }
    return `${baseUrl}/`;
  };

  const _resolveV1ProxyUri = async ({
    proxyURL,
    app,
  }: {
    proxyURL: string;
    app: string;
  }) => {
    const param: {
      endpoint: string;
      mode?: string;
      auth_mode?: string;
      session?: string;
      access_key?: string;
      secret_key?: string;
      api_version?: string;
    } = {
      endpoint: baiClient._config.endpoint,
    };
    if (baiClient._config.connectionMode === 'SESSION') {
      param['mode'] = 'SESSION';
      if (baiClient._loginSessionId) {
        param['auth_mode'] = 'header';
        param['session'] = baiClient._loginSessionId;
      } else {
        param['auth_mode'] = 'cookie';
        param['session'] = baiClient._config._session_id;
      }
    } else {
      param['mode'] = 'API';
      param['access_key'] = baiClient._config.accessKey;
      param['secret_key'] = baiClient._config.secretKey;
    }
    param['api_version'] = baiClient.APIMajorVersion;
    // @ts-ignore
    if (globalThis.isElectron && window.__local_proxy?.url === undefined) {
      throw new AppLaunchError(
        'Proxy is not ready yet. Check proxy settings for detail.',
        'configuring',
      );
    }
    const rqst = {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      uri: new URL('conf', proxyURL).href,
    };
    const response = await sendRequest(rqst);
    if (response === undefined) {
      throw new AppLaunchError(
        'Proxy configurator is not responding.',
        'configuring',
      );
    }
    const token = response.token;
    return new URL(
      `proxy/${token}/${session?.row_id}/add?${new URLSearchParams({ app }).toString()}`,
      proxyURL,
    ).href;
  };

  /**
   * Open V2 WsProxy (direct connection) with session and app and port number.
   *
   * @param {string} sessionUuid
   * @param {string} app
   * @param {number} port
   * @param {object | null} envs
   * @param {object | null} args
   */
  const _resolveV2ProxyUri = async ({
    app,
    port = null,
    envs = null,
    args = null,
  }: {
    app: string;
    port: number | null;
    envs?: Record<string, unknown> | null;
    args?: Record<string, unknown> | null;
  }) => {
    try {
      const loginSessionToken = baiClient._config._session_id;
      const tokenResponse = await baiClient.computeSession.startService(
        loginSessionToken,
        session?.row_id,
        app,
        port,
        envs,
        args,
      );

      if (tokenResponse === undefined) {
        throw new AppLaunchError(
          'Proxy configurator is not responding.',
          'configuring',
        );
      }
      const token = tokenResponse.token;
      return new URL(
        `v2/proxy/${token}/${session?.row_id}/add?${new URLSearchParams({ app }).toString()}`,
        tokenResponse.wsproxy_addr,
      ).href;
    } catch (err) {
      // Wrap in AppLaunchError if not already
      if (err instanceof AppLaunchError) {
        throw err;
      }
      // Detect "session not accessible" on session lookup. The manager
      // scopes session lookups by the *current* access key; if the
      // session was created under a different AK (or was terminated
      // between page render and click), the lookup returns 404 /
      // "session not found", which is misleading to end users (FR-2586).
      if (isSessionNotFoundError(err)) {
        throw new AppLaunchError(
          t('session.appLauncher.SessionNotAccessible'),
          'configuring',
          err instanceof Error ? err : undefined,
        );
      }
      throw new AppLaunchError(
        err instanceof Error
          ? err.message
          : 'Proxy configurator is not responding.',
        'configuring',
        err instanceof Error ? err : undefined,
      );
    }
  };

  /**
   * Close wsproxy connection for a specific app.
   * Used when re-launching apps like tensorboard that need to be restarted with different args.
   */
  const _close_wsproxy = async (app: string) => {
    const token = baiClient._config.accessKey;
    const proxyURL = await getProxyURL(await getWSProxyVersion());

    const uri = new URL(
      `proxy/${token}/${session?.row_id}/delete?${new URLSearchParams({ app }).toString()}`,
      proxyURL,
    );

    const permitKey = localStorage.getItem(PERMIT_KEY_STORAGE_KEY);
    if (permitKey) {
      uri.searchParams.set('permit_key', permitKey);
    }

    const response = await fetch(uri.href, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    });
    return response.ok;
  };

  const _open_wsproxy = async ({
    // sessionUuid,
    app,
    port = null,
    envs,
    args,
    allowedClientIps = [],
    openToPublic = false,
    proxyVersion,
    proxyURL,
  }: {
    app: string;
    port?: number | null;
    envs?: Record<string, unknown>;
    args?: Record<string, unknown>;
    allowedClientIps?: Array<string>;
    openToPublic?: boolean;
    proxyVersion: string;
    proxyURL: string;
  }) => {
    if (!session?.service_ports) {
      return false;
    }

    const uri =
      proxyVersion === 'v1'
        ? await _resolveV1ProxyUri({
            app,
            proxyURL,
          })
        : await _resolveV2ProxyUri({ app, port: null, envs, args });

    const servicePortInfo = JSON.parse(session?.service_ports || '{}').find(
      ({ name }: { name?: string }) => name === app,
    );

    if (_.isEmpty(servicePortInfo)) {
      throw new AppLaunchError(
        `Service port not found for app: ${app}`,
        'configuring',
      );
    }

    if (!uri) {
      throw new AppLaunchError('Failed to resolve proxy URI', 'configuring');
    }

    const searchParams = new URLSearchParams();

    if (port !== null && port > 1024 && port < 65535) {
      searchParams.set('port', port.toString());
    }
    if (openToPublic) {
      searchParams.set('open_to_public', 'true');
      if (allowedClientIps?.length > 0) {
        searchParams.set(
          'allowed_client_ips',
          _.map(allowedClientIps, _.trim).join(','),
        );
      }
    }
    if (_.keys(envs).length > 0) {
      searchParams.set('envs', JSON.stringify(envs));
    }
    if (_.keys(args).length > 0) {
      searchParams.set('args', JSON.stringify(args));
    }

    if (debugOptions?.subdomain) {
      searchParams.set('subdomain', debugOptions?.subdomain);
    }
    if (servicePortInfo.is_inference) {
      searchParams.set('is_inference', 'true');
    }
    const getAppProtocol = (appName: string, defaultProtocol: string) => {
      const protocolMap: Record<string, string> = {
        vnc: 'vnc',
        xrdp: 'rdp',
        sshd: 'tcp',
        'vscode-desktop': 'tcp',
      };
      return protocolMap[appName] || defaultProtocol;
    };

    searchParams.set(
      'protocol',
      getAppProtocol(app, servicePortInfo.protocol || 'tcp'),
    );

    const rqst_proxy = {
      method: 'GET',
      app: app,
      uri: `${uri}&${searchParams.toString()}`,
    };

    try {
      return await sendRequest(rqst_proxy);
    } catch (err) {
      // Wrap error in AppLaunchError with proper stage
      throw new AppLaunchError(
        err instanceof Error && err.message
          ? err.message
          : 'Failed to connect to coordinator',
        'requesting',
        err instanceof Error ? err : undefined,
      );
    }
  };

  /**
   * Pure data operation that launches an app by coordinating all proxy operations.
   * @returns Promise that resolves with app connection details
   */
  const _launchApp = async ({
    app,
    port,
    envs,
    args,
    openToPublic,
    allowedClientIps,
    onProgress,
  }: {
    app: string;
    port?: number;
    envs?: Record<string, unknown>;
    args?: Record<string, unknown>;
    openToPublic?: boolean;
    allowedClientIps?: Array<string>;
    onProgress?: (progress: { percent: number; stage: string }) => void;
  }) => {
    logger.info('[_launchApp] start', {
      app,
      port,
      session_row_id: session?.row_id,
      session_name: session?.name,
      scaling_group: session?.scaling_group,
      project_id: session?.project_id,
      service_ports_raw: session?.service_ports,
    });

    // vscode-desktop uses sshd service internally
    // Legacy implementation: sendAppName = 'sshd' when app === 'vscode-desktop'
    const serviceAppName = app === 'vscode-desktop' ? 'sshd' : app;

    // Stage 1: Detecting proxy version (0-20%)
    const proxyVersion = await getWSProxyVersion();
    logger.info('[_launchApp] resolved proxyVersion:', proxyVersion);

    // Stage 2: Getting proxy URL (20-40%)
    onProgress?.({ percent: 20, stage: 'configuring' });
    const proxyURL = await getProxyURL(proxyVersion);
    logger.info('[_launchApp] resolved proxyURL:', proxyURL);

    // Stage 3: Adding to socket queue (40-60%)
    onProgress?.({ percent: 40, stage: 'connecting' });
    logger.info('[_launchApp] calling _open_wsproxy...', {
      app: serviceAppName,
      proxyVersion,
      proxyURL,
    });
    const response = await _open_wsproxy({
      app: serviceAppName, // Use actual service name for API call
      port, // Pass as-is (undefined becomes null in _open_wsproxy)
      envs,
      args,
      openToPublic,
      allowedClientIps,
      proxyVersion,
      proxyURL,
    });
    // Log only a narrow summary of the proxy response. The full payload
    // may contain sensitive fields (proxy tokens, permit keys, internal
    // URLs) that should not land in browser logs.
    logger.debug('[_launchApp] _open_wsproxy returned summary:', {
      url: response && typeof response === 'object' ? response.url : undefined,
      port:
        response && typeof response === 'object' ? response.port : undefined,
      reused:
        response && typeof response === 'object' ? response.reused : undefined,
      reuse:
        response && typeof response === 'object' ? response.reuse : undefined,
      status:
        response && typeof response === 'object' ? response.status : undefined,
    });

    if (!response || typeof response === 'boolean') {
      logger.error(
        '[_launchApp] _open_wsproxy returned falsy/boolean — throwing AppLaunchError',
        response,
      );
      throw new AppLaunchError('Failed to configure proxy', 'configuring');
    }

    // Stage 4: Connecting to proxy worker (60-100%)
    onProgress?.({ percent: 60, stage: 'connecting' });
    logger.info('[_launchApp] calling _connectToProxyWorker...', response.url);
    const { appConnectUrl, reused, redirectUrl } = await _connectToProxyWorker(
      response.url,
      '',
      !TCP_APPS.includes(app) || globalThis.isElectron, // Enable direct TCP for non-TCP apps, or when running in Electron
    );
    logger.info('[_launchApp] _connectToProxyWorker returned:', {
      appConnectUrl: appConnectUrl?.href,
      reused,
      redirectUrl,
    });

    // Initialize TCP connection info variables
    let tcpHost: string | null = null;
    let tcpPort: string | null = null;
    let directTCPSupported = false;

    // Extract TCP connection information for TCP apps
    if (TCP_APPS.includes(app)) {
      if (globalThis.isElectron) {
        // Electron environment: Use local proxy port
        tcpHost = '127.0.0.1';
        tcpPort = response.port?.toString() || null;
      } else {
        // Browser environment: Parse redirectUrl for gateway information
        if (!reused) {
          // New connection: Fetch redirect with do-not-redirect parameter
          const redirectCheckUrl = new URL(appConnectUrl.href);
          redirectCheckUrl.searchParams.set('do-not-redirect', 'true');

          try {
            const result = await fetch(redirectCheckUrl.href);
            const body = await result.json();
            const { redirectURI } = body;

            if (redirectURI) {
              const redirectURL = new URL(redirectURI);

              // Check if directTCP is supported
              const directTCPParam = redirectURL.searchParams.get('directTCP');
              directTCPSupported = directTCPParam === 'true';

              // Extract gateway URI
              const gatewayURI = redirectURL.searchParams.get('gateway');

              if (directTCPSupported && gatewayURI) {
                // Parse gateway URL (format: tcp://host:port)
                const gatewayURL = new URL(gatewayURI.replace('tcp', 'http'));
                tcpHost = gatewayURL.hostname;
                tcpPort = gatewayURL.port;
              }
            }
          } catch (error) {
            logger.error('Failed to fetch TCP connection info:', error);
          }
        } else {
          // Reused connection: Use appConnectUrl directly
          tcpHost = appConnectUrl.hostname;
          tcpPort = appConnectUrl.port;
          directTCPSupported = true; // Assume supported for reused connections
        }
      }
    }

    // Handle generic TCP apps (non-standard protocols)
    if (response.url?.includes('protocol=tcp') && redirectUrl) {
      try {
        const redirectResponse = await fetch(redirectUrl);
        const redirectBody = await redirectResponse.json();
        const finalUrl = redirectBody?.redirect;

        if (finalUrl) {
          const decodedUrl = decodeURIComponent(finalUrl);

          // Extract gateway from URL (format: gateway=tcp://host:port)
          const gatewayMatch = decodedUrl.match(
            /gateway=tcp:\/\/([^:]+):(\d+)/,
          );

          if (gatewayMatch) {
            const [, gatewayHost, gatewayPort] = gatewayMatch;

            if (gatewayHost && gatewayPort) {
              tcpHost = gatewayHost;
              tcpPort = gatewayPort;
              directTCPSupported = true;
            }
          }
        }
      } catch (error) {
        logger.error('Failed to parse generic TCP app URL:', error);
      }
    }

    // Validate TCP connection info before returning
    if (TCP_APPS.includes(app) && (!tcpHost || !tcpPort)) {
      logger.warn(
        `TCP connection info not available for ${app}. Using defaults.`,
        {
          tcpHost,
          tcpPort,
          directTCPSupported,
          isElectron: globalThis.isElectron,
          reused,
        },
      );
    }

    onProgress?.({ percent: 100, stage: 'connected' });

    const result = {
      appConnectUrl,
      reused,
      redirectUrl,
      tcpHost,
      tcpPort,
      directTCPSupported,
    };
    logger.info('[_launchApp] resolved final workInfo:', {
      appConnectUrl: appConnectUrl?.href,
      reused,
      redirectUrl,
      tcpHost,
      tcpPort,
      directTCPSupported,
    });
    return result;
  };

  /**
   * Launch an app with full notification integration.
   * This is the main public API that combines data operations with UI feedback.
   */
  const launchAppWithNotification = ({
    app,
    port,
    envs,
    args,
    openToPublic,
    allowedClientIps,
    onPrepared,
  }: {
    app: string;
    port?: number;
    envs?: Record<string, unknown>;
    args?: Record<string, unknown>;
    openToPublic?: boolean;
    allowedClientIps?: Array<string>;
    onPrepared?: (workInfo: Awaited<ReturnType<typeof _launchApp>>) => void;
  }) => {
    const notificationKey = `${appNotificationKey}-${app}`;
    const appName = app === 'ttyd' ? 'Console' : app;

    // Create promise that will drive the notification lifecycle
    const launchPromise = _launchApp({
      app,
      port,
      envs,
      args,
      openToPublic,
      allowedClientIps,
      onProgress: (progress) => {
        // Update notification with progress during stages
        upsertNotification({
          key: notificationKey,
          backgroundTask: {
            status: 'pending',
            percent: progress.percent,
          },
          description: getStageDescription(progress.stage, appName),
          skipDesktopNotification: true,
        });
      },
    });

    // Initial notification with promise-based lifecycle
    upsertNotification({
      key: notificationKey,
      message: (
        <span>
          {t('general.Session')}:&nbsp;
          <BAILink
            style={{ fontWeight: 'normal' }}
            onClick={() => {
              const newSearchParams = new URLSearchParams(location.search);
              newSearchParams.set('sessionDetail', session?.row_id || '');
              webuiNavigate({
                pathname: `/session`,
                search: newSearchParams.toString(),
              });
            }}
          >
            {session?.name}
          </BAILink>
        </span>
      ),
      description: t('session.appLauncher.LaunchingApp', { appName }),
      duration: 0,
      open: true,
      backgroundTask: {
        promise: launchPromise,
        status: 'pending',
        percent: 0,
        onChange: {
          resolved: (data) => {
            onPrepared?.(data);

            return {
              description: t('session.appLauncher.Prepared'),
              backgroundTask: {
                percent: 100,
                status: 'resolved',
              },
              duration: 3,
            };
          },
          rejected: (error: any) => {
            return {
              description: getErrorMessage(error),
              extraDescription: error?.stack || JSON.stringify(error, null, 2),
              duration: 0, // Persistent error notification
            };
          },
        },
      },
    });

    return launchPromise;
  };

  const _sleep = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  /**
   * Retry a request with backoff for server errors (500, 501, 502).
   *
   * @param request - Request configuration object
   * @param maxRetries - Maximum number of retry attempts
   * @param delayMs - Delay between retries in milliseconds
   * @returns Result of the request
   */
  const _retryRequestWithBackoff = async (
    request: any,
    maxRetries: number = MAX_RETRY_ATTEMPTS,
    delayMs: number = RETRY_DELAY_MS,
  ): Promise<any> => {
    let lastResult;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      lastResult = await sendRequest(request);

      // Check if we got a server error response
      const isServerError =
        typeof lastResult === 'object' &&
        lastResult?.status &&
        SERVER_ERROR_CODES.includes(lastResult.status);

      if (!isServerError) {
        return lastResult;
      }

      // Wait before retrying (but not after the last attempt)
      if (attempt < maxRetries - 1) {
        await _sleep(delayMs);
      }
    }

    // If all retries failed, return last result
    return lastResult;
  };

  /**
   * Add permit key from localStorage to URL if available.
   *
   * @param url - Base URL to add permit key to
   * @returns URL with permit key parameter added (if available)
   */
  const _addPermitKeyToUrl = (url: URL): URL => {
    const permitKey = localStorage.getItem(PERMIT_KEY_STORAGE_KEY);
    if (permitKey) {
      url.searchParams.set('permit_key', permitKey);
    }
    return url;
  };

  /**
   * Extract and save permit key from redirect URL to localStorage.
   *
   * @param redirectUrl - URL containing permit_key parameter
   */
  const _savePermitKey = (redirectUrl: URL): void => {
    const permitKey = redirectUrl.searchParams.get('permit_key');
    if (permitKey && permitKey.length > 0) {
      localStorage.setItem(PERMIT_KEY_STORAGE_KEY, permitKey);
    }
  };

  const _connectToProxyWorker = async (
    url: string,
    urlPostfix: string,
    executeRedirectRequest: boolean = true,
  ) => {
    // Initialize base URL with permit key if available
    let targetUrl = _addPermitKeyToUrl(new URL(url + urlPostfix));

    // Request permit key from proxy
    const permitKeyRequest = {
      method: 'GET',
      uri: targetUrl.href,
      headers: { Accept: 'application/json' },
    };

    const response = await sendRequest(permitKeyRequest);

    if (response.error_code) {
      throw response;
    }

    // Handle successful response with redirect_url
    if (response?.redirect_url) {
      const redirectUrl = new URL(response.redirect_url);

      // Save permit key for reuse
      _savePermitKey(redirectUrl);

      const isReused = response.reuse || false;

      // Execute redirect request if needed (for new permits)
      if (executeRedirectRequest && !isReused) {
        const redirectRequest = {
          method: 'GET',
          uri: redirectUrl.href,
          mode: 'no-cors',
          redirect: 'follow',
          credentials: 'include',
        };

        await _retryRequestWithBackoff(redirectRequest);
      }

      // Use redirect URL as final target
      targetUrl = _addPermitKeyToUrl(redirectUrl);

      return {
        appConnectUrl: targetUrl,
        reused: isReused,
        redirectUrl: response.redirect_url,
      };
    }

    // Fallback: No redirect_url, use original URL with retry
    targetUrl = _addPermitKeyToUrl(new URL(url + urlPostfix));

    const fallbackRequest = {
      method: 'GET',
      uri: targetUrl.href,
      mode: 'no-cors',
      redirect: 'follow',
      credentials: 'include',
    };

    await _retryRequestWithBackoff(fallbackRequest);

    return {
      appConnectUrl: targetUrl,
      reused: false,
      redirectUrl: null,
    };
  };

  return {
    /**
     * Convenience method to launch terminal (ttyd) app.
     * Uses the new launchApp() wrapper with full notification integration.
     */
    runTerminal: ({
      openToPublic = false,
      allowedClientIps = [],
    }: {
      openToPublic?: boolean;
      allowedClientIps?: Array<string>;
    }) => {
      return launchAppWithNotification({
        app: 'ttyd',
        openToPublic,
        allowedClientIps,
        onPrepared(workInfo) {
          // Auto-open window after 1 second
          setTimeout(() => {
            globalThis.open(workInfo.appConnectUrl?.href || '', '_blank');
          }, 1000);
        },
      });
    },
    /**
     * Convenience method to launch Jupyter Notebook app.
     * Uses the new launchApp() wrapper with full notification integration.
     */
    runJupyter: ({
      openToPublic = false,
      allowedClientIps = [],
    }: {
      openToPublic?: boolean;
      allowedClientIps?: Array<string>;
    }) => {
      return launchAppWithNotification({
        app: 'jupyter',
        openToPublic,
        allowedClientIps,
      });
    },
    /**
     * Convenience method to launch JupyterLab app.
     * Uses the new launchApp() wrapper with full notification integration.
     */
    runJupyterLab: ({
      openToPublic = false,
      allowedClientIps = [],
    }: {
      openToPublic?: boolean;
      allowedClientIps?: Array<string>;
    }) => {
      return launchAppWithNotification({
        app: 'jupyterlab',
        openToPublic,
        allowedClientIps,
      });
    },
    /**
     * Convenience method to launch VSCode app.
     * Uses the new launchApp() wrapper with full notification integration.
     */
    runVSCode: ({
      openToPublic = false,
      allowedClientIps = [],
    }: {
      openToPublic?: boolean;
      allowedClientIps?: Array<string>;
    }) => {
      return launchAppWithNotification({
        app: 'vscode',
        openToPublic,
        allowedClientIps,
      });
    },
    /**
     * Main API to launch any app with notification integration.
     */
    launchAppWithNotification,
    /**
     * Lower-level launch API that returns the resolved work info via promise
     * without going through the notification lifecycle. Use this from contexts
     * where the BAI notification drawer is not mounted (e.g. anonymous pages
     * outside `MainLayout`), since `launchAppWithNotification`'s `onPrepared`
     * callback only fires when `useBAINotificationEffect` is subscribed to the
     * background task promise.
     *
     * Throws `AppLaunchError` for known failure stages (e.g. service port
     * missing → stage `'configuring'`).
     */
    launchApp: _launchApp,
    /**
     * Close wsproxy connection for a specific app.
     * Used when re-launching apps like tensorboard that need to be restarted with different args.
     */
    closeWsproxy: _close_wsproxy,
  };
};

/**
 * Detect a "session not found" response from the manager.
 *
 * The manager looks up sessions scoped by the *current* access key. The
 * most common cause of a 404 from the `start-service` endpoint is an
 * access-key mismatch — the session was created under a different keypair
 * (e.g. the user switched access keys after creating it), so the lookup
 * returns HTTP 404 even though the session still exists. The same 404
 * also surfaces when the session was genuinely terminated between page
 * render and the user's click; we cannot disambiguate the two cases from
 * the response, so the user-facing copy covers both.
 *
 * Called exclusively from `_resolveV2ProxyUri`'s catch (the `startService`
 * call site). At that endpoint any 404 is by definition "session lookup
 * failed" — the manager produces a `SessionNotFound` exception there with
 * varying English titles (`"No such session."`, `"Session ... not found"`,
 * etc.). Keying off `statusCode === 404` alone is therefore the safest
 * heuristic: it is robust against title wording changes, against
 * locale-translated manager responses, and against `_wrapWithPromise`
 * reformatting (it concatenates `statusText` into `title`, which is empty
 * on some manager versions).
 */
function isSessionNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { statusCode?: unknown };
  return e.statusCode === 404;
}

// Custom error class for app launch errors
class AppLaunchError extends Error {
  stage: 'detecting' | 'configuring' | 'requesting' | 'connecting';
  originalError?: Error;

  constructor(
    message: string,
    stage: 'detecting' | 'configuring' | 'requesting' | 'connecting',
    originalError?: Error,
  ) {
    super(message);
    this.name = 'AppLaunchError';
    this.stage = stage;
    this.originalError = originalError;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppLaunchError);
    }
  }
}

/**
 * Send a request and return the response body.
 * For error status codes, returns an object with status information for retry logic.
 *
 * @param request - Request configuration object
 * @returns Parsed response body or error object with status
 */
interface SendRequestConfig extends RequestInit {
  uri: string;
  method?: string;
}
async function sendRequest(request: SendRequestConfig) {
  try {
    if (request.method === 'GET') {
      request.body = undefined;
    }

    const resp = await fetch(request.uri, request);
    const contentType = resp.headers.get('Content-Type');

    let body;
    if (contentType === null) {
      body = resp.ok;
    } else if (
      contentType.startsWith('application/json') ||
      contentType.startsWith('application/problem+json')
    ) {
      body = await resp.json();
    } else if (contentType.startsWith('text/')) {
      body = await resp.text();
    } else {
      body = await resp.blob();
    }

    // For error status codes, return an object with status for retry logic
    if (!resp.ok) {
      return {
        status: resp.status,
        statusText: resp.statusText,
        body: body,
      };
    }

    return body;
  } catch (e) {
    // Network errors or other exceptions
    throw new Error(
      `Request failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
    );
  }
}
