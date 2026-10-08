/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Login Session Authentication Utilities
 *
 * Extracted from backend-ai-login.ts _connectViaGQL method.
 * Handles post-authentication GQL connection and client setup.
 */
import { RelayEnvironment } from '../RelayEnvironment';
import { loginSessionAuthMyUserQuery } from '../__generated__/loginSessionAuthMyUserQuery.graphql';
import { fetchAndParseConfig } from '../hooks/useWebUIConfig';
import { getActAsTarget } from './actAs';
import type { LoginBootstrap } from './loginBootstrap';
import { applyConfigToClient, type LoginConfigState } from './loginConfig';
import { toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { fetchQuery, graphql } from 'react-relay';

// Only the starting project is needed: the remembered one if it is still a
// GENERAL project of the user, else the first by name (the header's order).
const myUserQuery = graphql`
  query loginSessionAuthMyUserQuery(
    $recentProjectName: String!
    $hasRecentProject: Boolean!
  ) {
    myUserV2 {
      id
      basicInfo {
        email
        fullName
      }
      organization {
        domainName
        role
      }
      domain {
        entityId
        basicInfo {
          name
        }
      }
      recentProject: projects(
        filter: {
          isActive: true
          type: { equals: GENERAL }
          name: { equals: $recentProjectName }
        }
        limit: 1
      ) @include(if: $hasRecentProject) {
        edges {
          node {
            id
            basicInfo {
              name
            }
          }
        }
      }
      defaultProject: projects(
        filter: { isActive: true, type: { equals: GENERAL } }
        orderBy: [{ field: NAME, direction: ASC }]
        limit: 1
      ) {
        edges {
          node {
            id
            basicInfo {
              name
            }
          }
        }
      }
    }
  }
`;

/**
 * Create a Backend.AI client with the given credentials.
 */
export function createBackendAIClient(
  userId: string,
  password: string,
  apiEndpoint: string,
  mode: 'SESSION' | 'API' = 'SESSION',
): { client: any; clientConfig: any } {
  const clientConfig = new (globalThis as any).BackendAIClientConfig(
    userId,
    password,
    apiEndpoint,
    mode === 'SESSION' ? 'SESSION' : undefined,
  );
  const client = new (globalThis as any).BackendAIClient(
    clientConfig,
    'Backend.AI Console.',
  );
  client.actAsUserId = getActAsTarget()?.userId ?? null;
  return { client, clientConfig };
}

/**
 * Dev-only escape from a hung login. A reviewer's dev server is usually pinned
 * to a backend they cannot reach, and the reachability probe then holds the
 * screen for the client-wide timeout; Esc (see LoginView) aborts it. The
 * production path is untouched — `import.meta.env.DEV` is statically false.
 */
export class LoginProbeCancelledError extends Error {
  constructor() {
    super('The login reachability probe was aborted with Esc.');
    this.name = 'LoginProbeCancelledError';
  }
}

const LOGIN_PROBE_ESCAPED = 'login-probe-escaped';
let activeProbe: AbortController | null = null;

/** Abort the in-flight reachability probe, if any. Dev builds only. */
export function escapeLoginProbe(): boolean {
  if (!import.meta.env.DEV || activeProbe === null) return false;
  activeProbe.abort(LOGIN_PROBE_ESCAPED);
  return true;
}

/**
 * The login screen's reachability probe. In a dev build it runs under an
 * AbortController that `escapeLoginProbe` can fire; a caller-supplied signal
 * replaces the client-wide timer, so the same deadline is re-created here.
 */
export async function probeManager(client: any): Promise<void> {
  if (!import.meta.env.DEV) {
    await client.get_manager_version();
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), client.requestTimeout);
  activeProbe = controller;
  try {
    await client.get_manager_version(controller.signal);
  } catch (err) {
    if (controller.signal.reason === LOGIN_PROBE_ESCAPED) {
      throw new LoginProbeCancelledError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
    if (activeProbe === controller) activeProbe = null;
  }
}

/**
 * Perform GQL connection after successful authentication.
 * Sets up globalThis.backendaiclient with user info, projects, and config.
 * Pass the `bootstrap` a `probeLoginSession` call already fetched to reuse
 * its keypair under act-as.
 */
export async function connectViaGQL(
  client: any,
  cfg: LoginConfigState,
  endpoints: string[],
  bootstrap?: LoginBootstrap | null,
): Promise<string[]> {
  // The login cookie is shared with the super admin's other tabs, so an act-as
  // tab must never log it out.
  const isActingAs = !!client.actAsUserId;

  (globalThis as any).backendaiclient = client;

  const recentProjectName =
    (globalThis as any).backendaiutils._peekRecentProjectGroup() ?? '';
  let response: loginSessionAuthMyUserQuery['response'] | undefined;
  try {
    response = await fetchQuery<loginSessionAuthMyUserQuery>(
      RelayEnvironment,
      myUserQuery,
      { recentProjectName, hasRecentProject: !!recentProjectName },
      { fetchPolicy: 'network-only' },
    ).toPromise();
  } catch (err) {
    // A refused session is cleaned up like a missing user; a network blip is not.
    // RelayEnvironment rewraps a 401 as an `AuthorizationError`.
    const e = err as { statusCode?: unknown; name?: unknown } | null;
    if (
      !isActingAs &&
      (e?.name === 'AuthorizationError' ||
        e?.statusCode === 401 ||
        e?.statusCode === 403)
    )
      await client.logout().catch(() => {});
    throw err;
  }
  if (!response?.myUserV2) {
    if (!isActingAs) await client.logout();
    throw new Error('User information is missing.');
  }
  const me = response.myUserV2;
  const projects = _.uniqBy(
    _.map(
      [...(me.recentProject?.edges ?? []), ...(me.defaultProject?.edges ?? [])],
      ({ node }) => ({ id: toLocalId(node.id), name: node.basicInfo.name }),
    ),
    'name',
  );

  // `check_login` reads the access key from the webserver session, which stays
  // the super admin's; under act-as the manager answers with the target's.
  if (isActingAs) {
    const accessKey =
      bootstrap?.keypair?.access_key ??
      (await client.query('query { keypair { access_key } }', {}))?.keypair
        ?.access_key;
    if (accessKey) {
      client._config._accessKey = accessKey;
    }
  }

  const role = (me.organization.role ?? '').toLowerCase();
  const domainName =
    me.organization.domainName ?? me.domain?.basicInfo.name ?? '';

  (globalThis as any).backendaiclient.email = me.basicInfo.email;
  (globalThis as any).backendaiclient.user_uuid = toLocalId(me.id);
  (globalThis as any).backendaiclient.full_name = me.basicInfo.fullName;
  (globalThis as any).backendaiclient.is_admin = [
    'superadmin',
    'admin',
  ].includes(role);
  (globalThis as any).backendaiclient.is_superadmin = role === 'superadmin';

  // `_readRecentProjectGroup` keeps the remembered name only if it is listed
  // here, so the remembered project goes first and the default second.
  (globalThis as any).backendaiclient.groups = projects.map(({ name }) => name);
  const groupMap: Record<string, string> = {};
  projects.forEach(({ id, name }) => {
    groupMap[name] = id;
  });
  (globalThis as any).backendaiclient.groupIds = groupMap;

  const currentGroup = (
    globalThis as any
  ).backendaiutils._readRecentProjectGroup();
  (globalThis as any).backendaiclient.current_group = currentGroup
    ? currentGroup
    : (globalThis as any).backendaiclient.groups[0];
  (globalThis as any).backendaiclient.current_group_id = () => {
    return (globalThis as any).backendaiclient.groupIds[
      (globalThis as any).backendaiclient.current_group
    ];
  };

  // Apply config
  applyConfigToClient({
    ...cfg,
    domain_name: domainName,
    domain_id: me.domain?.entityId ?? '',
  });

  // Manage endpoint history
  let updatedEndpoints = [...endpoints];
  const endpoint = (globalThis as any).backendaiclient._config
    .endpoint as string;
  if (updatedEndpoints.indexOf(endpoint) === -1) {
    updatedEndpoints.push(endpoint);
    if (updatedEndpoints.length > 5) {
      updatedEndpoints = updatedEndpoints.slice(1, 6);
    }
    (globalThis as any).backendaioptions.set('endpoints', updatedEndpoints);
  }

  return updatedEndpoints;
}

/**
 * Structured error thrown by `tokenLogin` when the webserver reports
 * `authenticated === false`. Carries the raw `fail_reason` string and the
 * authenticated-probe `type` when available so callers (the
 * `STokenLoginBoundary` classifier) can discriminate `require-totp-*`,
 * `active-login-session-exists`, and generic invalid-token cases without
 * string-matching the user-visible message.
 *
 * The prior implementation collapsed every non-success result into a
 * generic `Error('Cannot authorize session by token.')`, which silently
 * broke for `{ fail_reason }` returns (`client.token_login` returns an
 * object in that case — truthy, so the old `!loginSuccess` check passed
 * through and `connectViaGQL` ran against an unauthenticated client).
 */
export class TokenLoginFailedError extends Error {
  readonly failReason: string | null;
  readonly failType: string | null;
  readonly raw: unknown;
  constructor(
    failReason: string | null,
    failType: string | null,
    raw: unknown,
  ) {
    super(failReason ?? 'Cannot authorize session by token.');
    this.name = 'TokenLoginFailedError';
    this.failReason = failReason;
    this.failType = failType;
    this.raw = raw;
  }
}

/**
 * Perform token-based login (SSO).
 *
 * `extraParams` are forwarded to `client.token_login` alongside the explicit
 * `sToken` argument. Callers typically collect these from URL query parameters
 * (for example, EduAppLauncher forwards `app`, `session_id`, resource hints)
 * for the server-side token handler. The `STokenLoginBoundary` also folds
 * interactive inputs (`otp`, `force`) into this object when retrying after a
 * TOTP or concurrent-session challenge. LoginView callers that do not need
 * to forward anything can omit the argument.
 *
 * Reserved keys (`sToken`, `stoken`) are stripped from `extraParams` before
 * forwarding so that the explicit `sToken` argument always wins, regardless
 * of whether a caller accidentally (or maliciously) included the token in
 * the forwarded query parameters. `client.token_login` merges `extraParams`
 * into the request body via `Object.assign`, so an unsanitized map would
 * otherwise overwrite the authenticated token field.
 */
export async function tokenLogin(
  client: any,
  sToken: string,
  cfg: LoginConfigState,
  endpoints: string[],
  extraParams?: Record<string, string | boolean>,
): Promise<string[]> {
  const sanitizedExtraParams = extraParams
    ? Object.fromEntries(
        Object.entries(extraParams).filter(
          ([key]) => key !== 'sToken' && key !== 'stoken',
        ),
      )
    : {};
  const result = await client.token_login(sToken, sanitizedExtraParams);
  // `client.token_login` returns:
  //   - truthy check_login result object                       → authenticated
  //   - `{ fail_reason: string, fail_type: string }`           → authenticated: false
  //   - `false`                                                → authenticated: false, no envelope
  // Only the first is a successful login.
  const failed =
    result === false ||
    result == null ||
    (typeof result === 'object' &&
      ('fail_reason' in result || 'fail_type' in result));
  if (failed) {
    const envelope =
      typeof result === 'object' && result
        ? (result as { fail_reason?: string; fail_type?: string })
        : null;
    throw new TokenLoginFailedError(
      envelope?.fail_reason ?? null,
      envelope?.fail_type ?? null,
      result,
    );
  }
  return connectViaGQL(client, cfg, endpoints);
}

/**
 * Persist the state a successful login should leave behind, independent of
 * which UI surface performed the login (LoginView panel, STokenLoginBoundary,
 * etc.). Centralized here so every successful login path keeps the same
 * side effects in lockstep:
 *
 *   - `last_login` timestamp + reset of `login_attempt` counter
 *   - drop any saved username / password / keypair credentials from prior
 *     signed-out sessions on this device
 *   - persist the resolved API endpoint into `localStorage` so the next
 *     cold start can re-use it
 *   - mark the client `ready` so `useLoginOrchestration` short-circuits on
 *     subsequent mounts within the same page load
 *
 * Callers: the `STokenLoginBoundary` `onSuccess` route handlers (route-level
 * sToken flow for `/`, `/interactive-login`, `/edu-applauncher`, `/applauncher`).
 * LoginView's panel-based login still runs its own `postConnectSetup` inline —
 * unifying both paths through this helper is tracked as a follow-up refactor
 * once the boundary migrations settle (see PR #6861 review discussion). Kept
 * separate from `connectViaGQL` because the GQL step also runs for the
 * non-authenticated paths (e.g. an already-logged-in session refresh) where
 * the counter and credential-cleanup side effects would be incorrect.
 */
export function persistPostLoginState(client: any): void {
  const options = (globalThis as any).backendaioptions;
  if (options) {
    options.set('last_login', Math.floor(Date.now() / 1000), 'general');
    options.set('login_attempt', 0, 'general');
  }
  localStorage.removeItem('backendaiwebui.login.api_key');
  localStorage.removeItem('backendaiwebui.login.secret_key');
  localStorage.removeItem('backendaiwebui.login.user_id');
  localStorage.removeItem('backendaiwebui.login.password');
  const endpoint = client?._config?.endpoint;
  if (typeof endpoint === 'string' && endpoint) {
    localStorage.setItem('backendaiwebui.api_endpoint', endpoint);
  }
  if (client) {
    client.ready = true;
  }
}

/**
 * Load webserver config when the api_endpoint differs from current URL origin.
 * Uses React's fetchAndParseConfig instead of the Lit shell's _parseConfig.
 */
export async function loadConfigFromWebServer(
  apiEndpoint: string,
): Promise<void> {
  if (!window.location.href.startsWith(apiEndpoint)) {
    // Validate the endpoint URL scheme to prevent fetching config from
    // unexpected protocols (e.g., javascript:, data:, file:).
    try {
      const endpointUrl = new URL(apiEndpoint);
      if (!['http:', 'https:'].includes(endpointUrl.protocol)) {
        return;
      }
    } catch {
      return;
    }
    const webserverConfigURL = new URL('./config.toml', apiEndpoint).href;
    const { config } = await fetchAndParseConfig(webserverConfigURL);
    if (!config) return;

    const backendaiutils = (globalThis as Record<string, any>).backendaiutils;
    if (!backendaiutils) return;

    const fieldsToExclude = [
      'general.apiEndpoint',
      'general.apiEndpointText',
      'general.appDownloadUrl',
      'wsproxy',
    ];
    fieldsToExclude.forEach((key) => {
      backendaiutils.deleteNestedKeyFromObject(config, key);
    });

    // Merge with the current raw config stored in the Jotai atom.
    // For backward compat, we also try the Lit shell element.
    const { jotaiStore } = await import('../components/DefaultProviders');
    const { rawConfigState } = await import('../hooks/useWebUIConfig');
    const currentConfig = jotaiStore.get(rawConfigState) ?? {};
    const mergedConfig = backendaiutils.mergeNestedObjects(
      currentConfig,
      config,
    );

    // Update the Jotai store with merged config
    jotaiStore.set(rawConfigState, mergedConfig);

    // Re-process the merged config
    const { refreshConfigFromToml } = await import('./loginConfig');
    const { loginConfigState } = await import('../hooks/useWebUIConfig');
    const loginConfig = refreshConfigFromToml(mergedConfig);
    jotaiStore.set(loginConfigState, loginConfig);
  }
}

/**
 * SAML login via form submit.
 */
export function loginWithSAML(client: any): void {
  const rqst = client.newUnsignedRequest('POST', '/saml/login', null);
  const form = document.createElement('form');
  const redirectTo = document.createElement('input');
  form.appendChild(redirectTo);
  document.body.appendChild(form);
  form.setAttribute('method', 'POST');
  form.setAttribute('action', rqst?.uri as string);
  redirectTo.setAttribute('type', 'hidden');
  redirectTo.setAttribute('name', 'redirect_to');
  redirectTo.setAttribute('value', window.location.href);
  form.submit();
}

/**
 * OpenID login via form submit.
 */
export function loginWithOpenID(client: any): void {
  const rqst = client.newUnsignedRequest('POST', '/openid/login', null);
  const form = document.createElement('form');
  const redirectTo = document.createElement('input');
  form.appendChild(redirectTo);
  document.body.appendChild(form);
  form.setAttribute('method', 'POST');
  form.setAttribute('action', rqst?.uri as string);
  redirectTo.setAttribute('type', 'hidden');
  redirectTo.setAttribute('name', 'redirect_to');
  redirectTo.setAttribute('value', window.location.href);
  form.submit();
}
