/**
 * sToken generation utility for E2E tests.
 *
 * Generates HMAC-SHA256 signed tokens matching the backend.ai-auth-keypair-plugin's
 * sign_token() algorithm. The sToken allows external portals (e.g., education
 * platforms) to authenticate users via URL parameters.
 *
 * Token format: "BackendAI signMethod=HMAC-SHA256, credential=<accessKey>:<signature>"
 *
 * Signing algorithm (from backend.ai-auth-keypair-plugin hook.py sign_token):
 *   1. sign_key = HMAC-SHA256(secretKey, dateYYYYMMDD) → binary
 *   2. sign_key = HMAC-SHA256(sign_key, endpoint) → binary
 *   3. authString = "POST\n/authorize/keypair\n<dateISO>\nhost:<endpoint>\ncontent-type:application/json\nx-backendai-version:<apiVersion>\n<emptyBodyHash>"
 *   4. signature = HMAC-SHA256(sign_key, authString) → hex
 *
 * Key differences from the standard client signing:
 *   - Path is "/authorize/keypair" (plugin-specific), not the actual request path
 *   - Host/endpoint is the full endpoint string (e.g., "http://10.122.10.215:8090"),
 *     not just the hostname:port
 *   - Date in auth string uses dateutil_parse(date).isoformat() format
 */
import crypto from 'crypto';

export interface STokenParams {
  accessKey: string;
  secretKey: string;
  /** Full endpoint URL, e.g., "http://10.122.10.215:8090" */
  endpoint: string;
  /** API version, e.g., "v7.20230615" */
  apiVersion?: string;
  /** Date to use for signing. Defaults to current time. */
  date?: Date;
}

export interface STokenResult {
  /** Full sToken string for URL parameter */
  sToken: string;
  /** Date string for URL parameter (ISO format) */
  date: string;
  /** API version used */
  apiVersion: string;
  /** Full endpoint used for signing */
  endpoint: string;
}

/**
 * Format date as YYYYMMDD (matches Python date.strftime("%Y%m%d"))
 */
function formatDateYYYYMMDD(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Generate a valid sToken for E2E testing.
 *
 * Replicates the backend.ai-auth-keypair-plugin's sign_token() method:
 *   sign_key = HMAC(secret_key, YYYYMMDD) → HMAC(sign_key, endpoint)
 *   auth_string = "POST\n/authorize/keypair\n{date_iso}\nhost:{endpoint}\n..."
 *   signature = HMAC(sign_key, auth_string)
 */
export function generateSToken(params: STokenParams): STokenResult {
  const {
    accessKey,
    secretKey,
    endpoint,
    apiVersion = 'v7.20230615',
    date = new Date(),
  } = params;

  // The plugin uses dateutil_parse(params["date"]).isoformat()
  // JS Date.toISOString() produces "2026-03-19T10:00:00.000Z"
  // Python dateutil_parse of that → datetime with tzinfo=UTC
  // Python .isoformat() → "2026-03-19T10:00:00+00:00"
  // So we need to convert JS ISO format to Python isoformat with +00:00
  const dateIso = date.toISOString().replace('Z', '+00:00');

  // Step 1: sign_key = HMAC-SHA256(secret_key.encode(), YYYYMMDD.encode()).digest()
  const dateStr = formatDateYYYYMMDD(date);
  const k1 = crypto
    .createHmac('sha256', Buffer.from(secretKey, 'utf8'))
    .update(dateStr, 'utf8')
    .digest(); // binary

  // Step 2: sign_key = HMAC-SHA256(k1, endpoint.encode()).digest()
  // NOTE: The plugin uses params["endpoint"] directly (full URL, e.g., "http://10.122.10.215:8090")
  const signKey = crypto
    .createHmac('sha256', k1)
    .update(endpoint, 'utf8')
    .digest(); // binary

  // Step 3: Build auth string (matches plugin's sign_token format)
  const bodyHash = crypto.createHash('sha256').update('').digest('hex');
  const authString = [
    'POST',                               // request.method
    '/authorize/keypair',                  // plugin-specific path (NOT /server/token-login)
    dateIso,                               // dateutil_parse(date).isoformat()
    `host:${endpoint}`,                    // endpoint (full URL, NOT just host:port)
    'content-type:application/json',       // content type
    `x-backendai-version:${apiVersion}`,   // API version
    bodyHash,                              // SHA256 of empty body
  ].join('\n');

  // Step 4: signature = HMAC-SHA256(sign_key, auth_string).hexdigest()
  const signature = crypto
    .createHmac('sha256', signKey)
    .update(authString, 'utf8')
    .digest('hex');

  const sToken = `BackendAI signMethod=HMAC-SHA256, credential=${accessKey}:${signature}`;

  return {
    sToken,
    date: dateIso,
    apiVersion,
    endpoint,
  };
}

/**
 * Build URL search params for /applauncher with sToken authentication.
 */
export function buildAppLauncherParams(
  tokenResult: STokenResult,
  options: {
    endpoint: string;
    app?: string;
    sessionTemplate?: string;
    sessionId?: string;
  },
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('sToken', tokenResult.sToken);
  params.set('api_version', tokenResult.apiVersion);
  params.set('date', tokenResult.date);
  params.set('endpoint', options.endpoint);

  if (options.app) {
    params.set('app', options.app);
  }
  if (options.sessionTemplate) {
    params.set('session_template', options.sessionTemplate);
  }
  if (options.sessionId) {
    params.set('session_id', options.sessionId);
  }

  return params;
}
