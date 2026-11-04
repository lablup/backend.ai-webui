/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  loadConfigFromWebServer,
  type WebServerConfigResult,
} from './loginSessionAuth';

export type EndpointCheck =
  | { ok: true; endpoint: string; hasDomain: boolean }
  | { ok: false; error: 'invalidUrl' | 'unreachable' | 'noConfig' };

export const normalizeEndpoint = (raw: string): string =>
  raw
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/\/+$/, '');

/**
 * Loads the server's config.toml and PUBLIC settings for the Electron endpoint
 * step (#10872); the login form is shown only once this succeeds.
 */
export async function checkEndpoint(
  raw: string,
  load: (
    endpoint: string,
  ) => Promise<WebServerConfigResult> = loadConfigFromWebServer,
): Promise<EndpointCheck> {
  const endpoint = normalizeEndpoint(raw);
  if (!/^https?:\/\/[^/]/.test(endpoint)) {
    return { ok: false, error: 'invalidUrl' };
  }
  const result = await load(endpoint);
  switch (result.status) {
    case 'loaded':
      return { ok: true, endpoint, hasDomain: result.domainName !== null };
    case 'unreachable':
      return { ok: false, error: 'unreachable' };
    case 'no-config':
      return { ok: false, error: 'noConfig' };
    default:
      return { ok: false, error: 'invalidUrl' };
  }
}
