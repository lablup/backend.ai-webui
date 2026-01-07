import { useSuspendedBackendaiClient, useWebUINavigate } from '.';
import { useSetBAINotification } from './useBAINotification';
import { BAILink, useBAILogger, useErrorMessageResolver } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useBackendAIAppLauncherFragment$key } from 'src/__generated__/useBackendAIAppLauncherFragment.graphql';

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

  // TODO: migrate backend-ai-app-launcher features to this hook using fragment data.
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
    // TODO: remove globalThis.appLauncher(backend-ai-app-launcher) dependency after migration to React
    if (baiClient.debug === true) {
      if (debugOptions?.forceUseV1Proxy) return 'v1';
      else if (debugOptions?.forceUseV2Proxy) return 'v2';
    }
    if (globalThis.isElectron) {
      return 'v1';
    }
    return baiClient.scalingGroup
      .getWsproxyVersion(session?.scaling_group, session?.project_id)
      .then((result: { wsproxy_version: 'v1' | 'v2' }) => {
        return result.wsproxy_version;
      });
  };

  const getProxyURL = async (wsproxyVersion: string) => {
    let url = 'http://127.0.0.1:5050/';
    if (
      // @ts-ignore
      globalThis.__local_proxy?.url !== undefined
    ) {
      // @ts-ignore
      url = globalThis.__local_proxy.url;
    } else if (baiClient._config.proxyURL !== undefined) {
      url = baiClient._config.proxyURL;
    }
    if (session) {
      if (wsproxyVersion !== 'v1') {
        url = new URL(`${wsproxyVersion}/`, url).href;
      }
    }
    return url;
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
        : await _resolveV2ProxyUri({ app, port, envs, args });

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
    searchParams.set('protocol', servicePortInfo.protocol || 'tcp');

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
    // vscode-desktop uses sshd service internally
    // Legacy implementation: sendAppName = 'sshd' when app === 'vscode-desktop'
    const serviceAppName = app === 'vscode-desktop' ? 'sshd' : app;

    // Stage 1: Detecting proxy version (0-20%)
    const proxyVersion = await getWSProxyVersion();

    // Stage 2: Getting proxy URL (20-40%)
    onProgress?.({ percent: 20, stage: 'configuring' });
    const proxyURL = await getProxyURL(proxyVersion);

    // Stage 3: Adding to socket queue (40-60%)
    onProgress?.({ percent: 40, stage: 'connecting' });
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

    if (!response || typeof response === 'boolean') {
      throw new AppLaunchError('Failed to configure proxy', 'configuring');
    }

    // Stage 4: Connecting to proxy worker (60-100%)
    onProgress?.({ percent: 60, stage: 'connecting' });
    const { appConnectUrl, reused, redirectUrl } = await _connectToProxyWorker(
      response.url,
      '',
      !TCP_APPS.includes(app) || globalThis.isElectron,
      // ^^ false for TCP apps in browser, true otherwise
    );

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

    return {
      appConnectUrl,
      reused,
      redirectUrl,
      tcpHost,
      tcpPort,
      directTCPSupported,
    };
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

  // @ts-ignore
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
     * Close wsproxy connection for a specific app.
     * Used when re-launching apps like tensorboard that need to be restarted with different args.
     */
    closeWsproxy: _close_wsproxy,
    // TODO: implement below function
    // showLauncher: (params: {
    //   'session-uuid'?: string;
    //   'access-key'?: string;
    //   'app-services'?: string;
    //   mode?: string;
    //   'app-services-option'?: string;
    //   'service-ports'?: string;
    //   runtime?: string;
    //   filename?: string;
    //   arguments?: string;
    // }) => {},
  };
};

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
async function sendRequest(request: any) {
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
