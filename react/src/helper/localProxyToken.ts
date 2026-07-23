import { type BackendAIClient } from '../hooks';

/**
 * Request the local (v1) wsproxy's per-instance secret token (FR-3227).
 *
 * The Backend.AI Desktop / local wsproxy (`src/wsproxy/manager.js`) used to
 * return a fixed token `"local"` from `PUT /conf` and never validated the token
 * on the `/proxy/:token/...` routes. It now returns a random per-instance
 * secret and rejects any other token, so every v1 proxy call — the launch
 * (`/add`), the existence check, and the cleanup (`/delete`) routes — must
 * present the token returned by `/conf`.
 *
 * This performs that `PUT /conf` handshake (idempotent — it only stores the
 * caller's config and echoes the secret) and returns the token. It applies
 * ONLY to the v1 (local) proxy; the v2 remote App Proxy uses a different token
 * scheme and must not call this.
 *
 * @param baiClient - the active Backend.AI client (source of endpoint/auth)
 * @param proxyURL - the v1 proxy base URL, with a trailing slash
 * @returns the per-instance proxy token
 */
export async function requestLocalProxyToken(
  baiClient: BackendAIClient,
  proxyURL: string,
): Promise<string> {
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
    param.mode = 'SESSION';
    if (baiClient._loginSessionId) {
      param.auth_mode = 'header';
      param.session = baiClient._loginSessionId;
    } else {
      param.auth_mode = 'cookie';
      param.session = baiClient._config._session_id;
    }
  } else {
    param.mode = 'API';
    param.access_key = baiClient._config.accessKey;
    param.secret_key = baiClient._config.secretKey;
  }
  param.api_version = baiClient.APIMajorVersion;

  const response = await fetch(new URL('conf', proxyURL).href, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(param),
  });
  // Fail loudly instead of returning `undefined` (which would build
  // `/proxy/undefined/...` URLs). /conf can legitimately reject the request —
  // e.g. 403 from the origin allowlist on a self-hosted WebUI.
  if (!response.ok) {
    throw new Error(
      `Failed to obtain local proxy token: /conf responded with status ${response.status}.`,
    );
  }
  const data = await response.json().catch(() => undefined);
  if (typeof data?.token !== 'string' || data.token.length === 0) {
    throw new Error(
      'Failed to obtain local proxy token: /conf response did not contain a token.',
    );
  }
  return data.token;
}
