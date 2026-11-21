// The team dev gateway's config (`~/.config/fw/dev-gw.json`, written by
// `dev-gw join`), read the same way by dev.mjs, dev-env.mjs and advertise.sh.
//
// Two file shapes are live: a box that joined before the internal domain has
// `share_base: "http://{app}.<box>.<sslip domain>"`; one that re-joined has
// `share_base: "https://{app}--<box>.<public_domain>"` plus `public_domain`.
// URLs come from `share_base` only, never composed from box/domain parts.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** RFC 1035: one DNS label is at most 63 octets. */
export const DNS_LABEL_MAX = 63;
/** On the one-label scheme `box--<box>` is the box's bare address, not an app. */
export const RESERVED_APP = 'box';
const SHARE_BASE_RE = /^https?:\/\/\{app\}(\.|--)/;

export function devGwConfigPath(env = process.env) {
  return env.DEV_GW_CONFIG?.trim() || join(homedir(), '.config', 'fw', 'dev-gw.json');
}

/** The parsed config, or null when the box has not joined or the file is unreadable. */
export function readDevGwConfig(path = devGwConfigPath()) {
  try {
    const config = JSON.parse(readFileSync(path, 'utf8'));
    return config && typeof config === 'object' ? config : null;
  } catch {
    return null;
  }
}

/** The `{app}` URL template, or null when the config carries no usable one. */
export function shareBaseOf(config) {
  const base = config?.share_base;
  return typeof base === 'string' && SHARE_BASE_RE.test(base) ? base : null;
}

/** True for the one-label `{app}--<box>` template. */
export const isOneLabel = (base) => SHARE_BASE_RE.exec(base ?? '')?.[1] === '--';

/** The longest app name whose share host label still fits in one DNS label. */
export function appNameBudget(shareBase) {
  if (!shareBase) return DNS_LABEL_MAX;
  const label = shareBase.replace(/^https?:\/\//, '').split(/[./:]/)[0];
  return DNS_LABEL_MAX - (label.length - '{app}'.length);
}

/** `{ url }` for `app`, or `{ error }` saying why the gateway cannot route it. */
export function shareUrlFor(shareBase, app) {
  if (!shareBase || !app) return { error: 'no share_base template or no app name' };
  if (isOneLabel(shareBase)) {
    if (app === RESERVED_APP)
      return { error: `app name \`${RESERVED_APP}\` is reserved for the box's bare address — set PORTLESS_APP_NAME` };
    if (app.includes('.'))
      return { error: `app name \`${app}\` is not a single DNS label` };
  }
  const budget = appNameBudget(shareBase);
  if (app.length > budget)
    return { error: `app name \`${app}\` is ${app.length} characters; this box's share host allows ${budget}` };
  return { url: shareBase.replaceAll('{app}', app) };
}

/**
 * The PR board's catalog endpoints, preferred first: the public domain (public
 * certificate), then the legacy domain, which stays valid during the move and
 * is plain http because Node's fetch rejects the gateway's CA.
 */
export function boardCatalogUrls(config) {
  const pub = typeof config?.public_domain === 'string' ? config.public_domain.trim() : '';
  const legacy = typeof config?.domain === 'string' ? config.domain.trim() : '';
  return [
    pub && `https://board.${pub}/api/catalog`,
    legacy && `http://board.${legacy}/api/catalog`,
  ].filter(Boolean);
}

export function boardCatalogUrl(config) {
  return boardCatalogUrls(config)[0] ?? null;
}
