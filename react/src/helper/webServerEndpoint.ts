/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Whether the endpoint is a Backend.AI webserver rather than a manager.
 *
 * A webserver renders the WebUI's own `config.toml` and proxies only
 * session-authenticated `/func/*`, so an API-mode sign-in against it can never
 * reach the manager (FR-3562). A manager serves no `config.toml`, so asking
 * for one is what tells the two apart. Anything other than a readable 2xx —
 * a manager's 404, an unreachable host, a blocked cross-origin read — is
 * reported as "not a webserver", which leaves API mode on offer.
 */
export async function isWebServerEndpoint(endpoint: string): Promise<boolean> {
  try {
    const base = new URL(endpoint);
    if (base.protocol !== 'http:' && base.protocol !== 'https:') return false;
    const configUrl = new URL(
      'config.toml',
      base.href.endsWith('/') ? base.href : `${base.href}/`,
    );
    const response = await fetch(configUrl.href, { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}
