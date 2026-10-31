/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/**
 * The anonymous `publicConfigByDomain` read (FR-1964): REST (`POST
 * /func/v2/app-config/public/get`) rather than Relay, because it runs at
 * bootstrap, before login and outside `RelayEnvironmentProvider`. One request
 * per page load serves every consumer of the domain's slice (`appearance`,
 * `settings`, …). A failed fetch is logged once and yields `undefined`; the
 * callers keep their file-based fallback until the next reload.
 */
export type PublicDomainConfigSlice = Record<string, unknown>;

export interface PublicConfigTarget {
  domainName: string;
  restBase: string;
}

const PUBLIC_CONFIG_FETCH_TIMEOUT_MS = 10_000;

/**
 * Where to read from, out of the parsed `config.toml`: `general.apiDomainName`
 * (webserver-hosted deployments are 1:1 with a domain, BA-7405/BA-7406) and
 * `general.apiEndpoint`, else the stored login endpoint. Electron / direct
 * API mode has no single domain, so this is `undefined` there.
 */
export const resolvePublicConfigTarget = (
  config: Record<string, any> | null | undefined,
): PublicConfigTarget | undefined => {
  const rawDomain = config?.general?.apiDomainName;
  const domainName =
    typeof rawDomain === 'string' && rawDomain.trim() ? rawDomain.trim() : '';
  if (!domainName) return undefined;

  const rawEndpoint = config?.general?.apiEndpoint;
  let endpoint = typeof rawEndpoint === 'string' ? rawEndpoint.trim() : '';
  if (!endpoint) {
    try {
      endpoint = (localStorage.getItem('backendaiwebui.api_endpoint') ?? '')
        .replace(/^"+|"+$/g, '')
        .trim();
    } catch {
      endpoint = '';
    }
  }
  const restBase = endpoint.replace(/^"+|"+$/g, '').replace(/\/+$/, '');
  if (!restBase) return undefined;
  return { domainName, restBase };
};

let cachedTarget: PublicConfigTarget | undefined;
let inflight: Promise<PublicDomainConfigSlice | undefined> | null = null;

const fetchSlice = async ({
  domainName,
  restBase,
}: PublicConfigTarget): Promise<PublicDomainConfigSlice | undefined> => {
  const response = await fetch(`${restBase}/func/v2/app-config/public/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config_names: ['publicConfigByDomain'] }),
    signal: AbortSignal.timeout(PUBLIC_CONFIG_FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Failed to load the public app config: ${response.status}`);
  }
  const payload = await response.json();
  const doc = payload?.app_configs?.find(
    (c: { config_name: string }) => c.config_name === 'publicConfigByDomain',
  )?.config;
  const slice = _.get(doc, [domainName]);
  return _.isPlainObject(slice)
    ? (slice as PublicDomainConfigSlice)
    : undefined;
};

/**
 * The current domain's slice of `publicConfigByDomain`, fetched at most once
 * per page load for a given target. `undefined` when there is no target, no
 * saved slice, or the request failed.
 */
export const fetchPublicDomainConfigOnce = (
  target: PublicConfigTarget | undefined,
): Promise<PublicDomainConfigSlice | undefined> => {
  if (!target) return Promise.resolve(undefined);
  if (
    inflight &&
    cachedTarget &&
    cachedTarget.domainName === target.domainName &&
    cachedTarget.restBase === target.restBase
  ) {
    return inflight;
  }
  cachedTarget = target;
  inflight = fetchSlice(target).catch((error) => {
    // eslint-disable-next-line no-console -- module-scope diagnostics; no logger exists outside React here
    console.warn(
      `[publicConfigByDomain] the domain slice could not be fetched (${String(error)}).`,
    );
    return undefined;
  });
  return inflight;
};

/** Test hook: forget the cached request. */
export const resetPublicDomainConfigCache = () => {
  cachedTarget = undefined;
  inflight = null;
};
