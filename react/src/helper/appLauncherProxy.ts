/**
 * Standalone proxy utility functions for app launching.
 *
 * These functions are extracted from useBackendAIAppLauncher hook to allow
 * non-GraphQL consumers (e.g., EduAppLauncher) to perform proxy operations
 * with a session ID directly, without needing a Relay fragment.
 */

type BackendAIClient = any;

const PERMIT_KEY_STORAGE_KEY = 'backendaiwebui.appproxy-permit-key';
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1000;
const SERVER_ERROR_CODES = [500, 501, 502];

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

    if (!resp.ok) {
      return {
        status: resp.status,
        statusText: resp.statusText,
        body: body,
      };
    }

    return body;
  } catch (e) {
    throw new Error(
      `Request failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
    );
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryRequestWithBackoff(
  request: SendRequestConfig,
  maxRetries: number = MAX_RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY_MS,
): Promise<any> {
  let lastResult;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    lastResult = await sendRequest(request);

    const isServerError =
      typeof lastResult === 'object' &&
      lastResult?.status &&
      SERVER_ERROR_CODES.includes(lastResult.status);

    if (!isServerError) {
      return lastResult;
    }

    if (attempt < maxRetries - 1) {
      await sleep(delayMs);
    }
  }

  return lastResult;
}

function addPermitKeyToUrl(url: URL): URL {
  const permitKey = localStorage.getItem(PERMIT_KEY_STORAGE_KEY);
  if (permitKey) {
    url.searchParams.set('permit_key', permitKey);
  }
  return url;
}

function savePermitKey(redirectUrl: URL): void {
  const permitKey = redirectUrl.searchParams.get('permit_key');
  if (permitKey && permitKey.length > 0) {
    localStorage.setItem(PERMIT_KEY_STORAGE_KEY, permitKey);
  }
}

/**
 * Get the proxy URL for the given wsproxy version.
 * Standalone version that does not depend on session fragment data.
 */
export async function getProxyURL(
  baiClient: BackendAIClient,
  wsproxyVersion: string,
): Promise<string> {
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
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  if (wsproxyVersion !== 'v1') {
    return `${baseUrl}/${wsproxyVersion}/`;
  }
  return `${baseUrl}/`;
}

/**
 * Determine the wsproxy version to use.
 * Standalone version that does not depend on session fragment data.
 */
export async function getWSProxyVersion(
  baiClient: BackendAIClient,
  scalingGroup?: string,
  projectId?: string,
): Promise<'v1' | 'v2'> {
  if (globalThis.isElectron) {
    return 'v1';
  }
  if (scalingGroup && projectId) {
    return baiClient.scalingGroup
      .getWsproxyVersion(scalingGroup, projectId)
      .then((result: { wsproxy_version: 'v1' | 'v2' }) => {
        return result.wsproxy_version;
      });
  }
  return 'v1';
}

/**
 * Resolve V1 proxy URI for a session and app.
 */
async function resolveV1ProxyUri(
  baiClient: BackendAIClient,
  sessionId: string,
  app: string,
  proxyURL: string,
): Promise<string> {
  const param: Record<string, string> = {
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
    throw new Error('Proxy is not ready yet. Check proxy settings for detail.');
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
    throw new Error('Proxy configurator is not responding.');
  }
  const token = response.token;
  return new URL(
    `proxy/${token}/${sessionId}/add?${new URLSearchParams({ app }).toString()}`,
    proxyURL,
  ).href;
}

/**
 * Resolve V2 proxy URI for a session and app.
 */
async function resolveV2ProxyUri(
  baiClient: BackendAIClient,
  sessionId: string,
  app: string,
  port: number | null = null,
  envs: Record<string, unknown> | null = null,
  args: Record<string, unknown> | null = null,
): Promise<string> {
  const loginSessionToken = baiClient._config._session_id;
  const tokenResponse = await baiClient.computeSession.startService(
    loginSessionToken,
    sessionId,
    app,
    port,
    envs,
    args,
  );

  if (tokenResponse === undefined) {
    throw new Error('Proxy configurator is not responding.');
  }
  const token = tokenResponse.token;
  return new URL(
    `v2/proxy/${token}/${sessionId}/add?${new URLSearchParams({ app }).toString()}`,
    tokenResponse.wsproxy_addr,
  ).href;
}

/**
 * Open a wsproxy connection for a session and app.
 * Standalone version that accepts baiClient and sessionId directly.
 *
 * @returns The proxy response containing `url` and optionally `port`.
 */
export async function openWsproxy(
  baiClient: BackendAIClient,
  sessionId: string,
  app: string,
  port: number | null = null,
  envs: Record<string, unknown> | null = null,
) {
  const wsproxyVersion = await getWSProxyVersion(baiClient);
  const proxyURL = await getProxyURL(baiClient, wsproxyVersion);

  const uri =
    wsproxyVersion === 'v1'
      ? await resolveV1ProxyUri(baiClient, sessionId, app, proxyURL)
      : await resolveV2ProxyUri(baiClient, sessionId, app, port, envs);

  const searchParams = new URLSearchParams();
  if (port !== null && port > 1024 && port < 65535) {
    searchParams.set('port', port.toString());
  }
  if (envs && Object.keys(envs).length > 0) {
    searchParams.set('envs', JSON.stringify(envs));
  }

  const rqstProxy = {
    method: 'GET',
    app: app,
    uri: `${uri}&${searchParams.toString()}`,
  };

  return sendRequest(rqstProxy);
}

/**
 * Connect to the proxy worker and obtain the final app URL.
 * Standalone version that does not depend on hook state.
 *
 * @returns Object with `appConnectUrl`, `reused`, and `redirectUrl`.
 */
export async function connectToProxyWorker(
  url: string,
  urlPostfix: string,
  executeRedirectRequest: boolean = true,
) {
  let targetUrl = addPermitKeyToUrl(new URL(url + urlPostfix));

  const permitKeyRequest = {
    method: 'GET',
    uri: targetUrl.href,
    headers: { Accept: 'application/json' },
  };

  const response = await sendRequest(permitKeyRequest);

  if (response.error_code) {
    throw response;
  }

  if (response?.redirect_url) {
    const redirectUrl = new URL(response.redirect_url);
    savePermitKey(redirectUrl);

    const isReused = response.reuse || false;

    if (executeRedirectRequest && !isReused) {
      const redirectRequest = {
        method: 'GET',
        uri: redirectUrl.href,
        mode: 'no-cors' as RequestMode,
        redirect: 'follow' as RequestRedirect,
        credentials: 'include' as RequestCredentials,
      };

      await retryRequestWithBackoff(redirectRequest);
    }

    targetUrl = addPermitKeyToUrl(redirectUrl);

    return {
      appConnectUrl: targetUrl,
      reused: isReused,
      redirectUrl: response.redirect_url,
    };
  }

  targetUrl = addPermitKeyToUrl(new URL(url + urlPostfix));

  const fallbackRequest = {
    method: 'GET',
    uri: targetUrl.href,
    mode: 'no-cors' as RequestMode,
    redirect: 'follow' as RequestRedirect,
    credentials: 'include' as RequestCredentials,
  };

  await retryRequestWithBackoff(fallbackRequest);

  return {
    appConnectUrl: targetUrl,
    reused: false,
    redirectUrl: null,
  };
}
