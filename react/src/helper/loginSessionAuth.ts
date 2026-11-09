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
import {
  fetchAndParseConfig,
  fetchAppConfigOnce,
} from '../hooks/useWebUIConfig';
import { getActAsTarget } from './actAs';
import {
  LoginBootstrapIncompleteError,
  type LoginBootstrap,
} from './loginBootstrap';
import { applyConfigToClient, type LoginConfigState } from './loginConfig';
import {
  fetchPublicDomainConfigOnce,
  PUBLIC_CONFIG_FETCH_TIMEOUT_MS,
  resolvePublicConfigTarget,
} from './publicAppConfig';
import {
  applyWebUISettings,
  readDomainWebUISettings,
  WEBUI_SETTINGS_CONFIG_KEY,
} from './webuiSettings';
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
      entityId
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
            entityId
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
            entityId
            basicInfo {
              name
            }
          }
        }
      }
    }
    # The domain's System Settings; a failed read keeps the base config.
    myAppConfigs(configNames: ["domainConfig"]) @catch(to: NULL) {
      configName
      config
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
 * screen for the client-wide timeout; Backspace (see LoginView) aborts it. The
 * production path is untouched — `import.meta.env.DEV` is statically false.
 */
export class LoginProbeCancelledError extends Error {
  constructor() {
    super('The login reachability probe was aborted with Backspace.');
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

const MOCK_MANAGER_KEY = 'backendaiwebui.dev.mockManager';
const MOCK_MANAGER_MODES = ['down', '502', '504', 'timeout'] as const;
type MockManagerMode = (typeof MOCK_MANAGER_MODES)[number];
const MOCK_TIMEOUT_MS = 5000;

/**
 * Dev-only: `?mockManager=down|502|504|timeout` makes the reachability probe
 * fail that way for this tab until `?mockManager=off`, to test outage screens.
 */
function readMockManagerMode(): MockManagerMode | null {
  const param = new URLSearchParams(window.location.search).get('mockManager');
  if (param === 'off') sessionStorage.removeItem(MOCK_MANAGER_KEY);
  else if (MOCK_MANAGER_MODES.includes(param as MockManagerMode)) {
    sessionStorage.setItem(MOCK_MANAGER_KEY, param as string);
  }
  const stored = sessionStorage.getItem(MOCK_MANAGER_KEY);
  return MOCK_MANAGER_MODES.includes(stored as MockManagerMode)
    ? (stored as MockManagerMode)
    : null;
}

async function failAsMockedManager(
  mode: MockManagerMode,
  signal: AbortSignal,
): Promise<never> {
  if (mode === 'down') throw new TypeError('Failed to fetch');
  if (mode === 'timeout') {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, MOCK_TIMEOUT_MS);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        resolve();
      });
    });
    throw Object.assign(new Error('Request timeout'), {
      isError: true,
      statusCode: 408,
    });
  }
  const statusCode = Number(mode);
  throw Object.assign(
    new Error(statusCode === 502 ? 'Bad Gateway' : 'Gateway Timeout'),
    { isError: true, statusCode },
  );
}

/**
 * The login screen's reachability probe. In a dev build it runs under an
 * AbortController that `escapeLoginProbe` can fire; a caller-supplied signal
 * replaces the client-wide timer, so the same deadline is re-created here.
 */
export async function probeManager(client: any): Promise<void> {
  if (!import.meta.env.DEV) {
    await client.probeServer();
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), client.requestTimeout);
  activeProbe = controller;
  try {
    const mockMode = readMockManagerMode();
    if (mockMode) await failAsMockedManager(mockMode, controller.signal);
    await client.probeServer(controller.signal);
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

/** Thrown by `connectViaGQL` when its login attempt was cancelled mid-flight. */
export class LoginAttemptCancelledError extends Error {
  constructor() {
    super('The login attempt was cancelled.');
    this.name = 'LoginAttemptCancelledError';
  }
}

/**
 * Perform GQL connection after successful authentication.
 * Sets up globalThis.backendaiclient with user info, projects, and config.
 * Pass the `bootstrap` a `probeLoginSession` call already fetched to reuse
 * its keypair under act-as.
 * A cancelled attempt (`isCancelled`) leaves the globals and the login
 * cookie untouched, since a newer attempt may already own them.
 */
export async function connectViaGQL(
  client: any,
  cfg: LoginConfigState,
  endpoints: string[],
  bootstrap?: LoginBootstrap | null,
  isCancelled?: () => boolean,
): Promise<string[]> {
  // The login cookie is shared with the super admin's other tabs, so an act-as
  // tab must never log it out.
  const isActingAs = !!client.actAsUserId;

  // The manager tells its version only to an authenticated caller; the Relay
  // query below needs it to keep version-gated fields.
  await client.get_manager_version();
  if (isCancelled?.()) throw new LoginAttemptCancelledError();
  // The Relay query below reads the global client, so a cancelled attempt
  // puts the previous one back.
  const previousClient = (globalThis as any).backendaiclient;
  const cancel = () => {
    (globalThis as any).backendaiclient = previousClient;
    return new LoginAttemptCancelledError();
  };
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
    if (isCancelled?.()) throw cancel();
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
    // Any other HTTP failure (a wrapped manager 5xx, a timeout) leaves the
    // session live; the recovery dialog handles it.
    const status = e?.statusCode;
    if (
      typeof status === 'number' &&
      status >= 400 &&
      status !== 401 &&
      status !== 403
    ) {
      throw new LoginBootstrapIncompleteError(err);
    }
    throw err;
  }
  if (isCancelled?.()) throw cancel();
  // The session is live; the manager failed to resolve the user (an errors[]
  // entry Relay hands back as null data). Not a reason to log out.
  if (!response?.myUserV2) {
    throw new LoginBootstrapIncompleteError(response);
  }
  const me = response.myUserV2;
  const projects = _.uniqBy(
    _.map(
      [...(me.recentProject?.edges ?? []), ...(me.defaultProject?.edges ?? [])],
      ({ node }) => ({ id: node.entityId, name: node.basicInfo.name }),
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
  (globalThis as any).backendaiclient.user_uuid = me.entityId;
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

  // The domain's `settings` document overrides the base config for the keys
  // it carries (#10436).
  const domainSettings = readDomainWebUISettings(response?.myAppConfigs);
  const effectiveCfg = applyWebUISettings(cfg, domainSettings, 'domain');
  const { jotaiStore } = await import('../components/DefaultProviders');
  const { loginConfigState } = await import('../hooks/useWebUIConfig');
  jotaiStore.set(loginConfigState, effectiveCfg);

  applyConfigToClient({
    ...effectiveCfg,
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
 * the credential-cleanup side effect would be incorrect.
 */
export function persistPostLoginState(client: any): void {
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

export type WebServerConfigResult =
  | { status: 'invalid-url' | 'unreachable' | 'no-config' }
  /** `domainName` is null when the server names no domain (code defaults then). */
  | { status: 'loaded'; domainName: string | null };

const isPageOrigin = (endpoint: string) => {
  try {
    return new URL(endpoint).origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Load webserver config when the api_endpoint differs from current URL origin.
 * Uses React's fetchAndParseConfig instead of the Lit shell's _parseConfig.
 */
export async function loadConfigFromWebServer(
  apiEndpoint: string,
): Promise<WebServerConfigResult> {
  // Same origin: this page's own config.toml is the server's, so only the
  // bundled config is merged — which also drops a previous server's.
  let serverConfig: Record<string, any> = {};
  if (!isPageOrigin(apiEndpoint)) {
    // Validate the endpoint URL scheme to prevent fetching config from
    // unexpected protocols (e.g., javascript:, data:, file:).
    try {
      const endpointUrl = new URL(apiEndpoint);
      if (!['http:', 'https:'].includes(endpointUrl.protocol)) {
        return { status: 'invalid-url' };
      }
    } catch {
      return { status: 'invalid-url' };
    }
    // A trailing slash keeps a sub-path deployment's last segment.
    const webserverConfigURL = new URL(
      'config.toml',
      apiEndpoint.endsWith('/') ? apiEndpoint : `${apiEndpoint}/`,
    ).href;
    const { config, unreachable } = await fetchAndParseConfig(
      webserverConfigURL,
      PUBLIC_CONFIG_FETCH_TIMEOUT_MS,
    );
    if (!config) return { status: unreachable ? 'unreachable' : 'no-config' };
    serverConfig = config;
  }

  const backendaiutils = (globalThis as Record<string, any>).backendaiutils;
  if (!backendaiutils) return { status: 'no-config' };

  if (Object.keys(serverConfig).length > 0) {
    ['general.apiEndpoint', 'wsproxy'].forEach((key) => {
      backendaiutils.deleteNestedKeyFromObject(serverConfig, key);
    });
  }

  // Merge onto the bundled config.toml, not the current state: that may
  // already carry another endpoint's server config.
  const { jotaiStore } = await import('../components/DefaultProviders');
  const { rawConfigState } = await import('../hooks/useWebUIConfig');
  const { config: bundledConfig } = await fetchAppConfigOnce();
  const currentConfig = structuredClone(bundledConfig ?? {});
  const mergedConfig = backendaiutils.mergeNestedObjects(
    currentConfig,
    serverConfig,
  );

  // Update the Jotai store with merged config
  jotaiStore.set(rawConfigState, mergedConfig);

  // Re-process the merged config
  const { refreshConfigFromToml } = await import('./loginConfig');
  const { loginConfigState, autoLogoutState } =
    await import('../hooks/useWebUIConfig');
  // `mergedConfig` keeps this page's own endpoint (the webserver's was
  // stripped above); the public slice belongs to the server being joined.
  const publicTarget = resolvePublicConfigTarget({
    ...mergedConfig,
    general: { ...mergedConfig.general, apiEndpoint },
  });
  const publicSlice = await fetchPublicDomainConfigOnce(publicTarget);
  const { applyJoinedServerAppearance } = await import('./customThemeConfig');
  await applyJoinedServerAppearance(publicSlice, publicTarget);
  const effectiveLoginConfig = applyWebUISettings(
    refreshConfigFromToml(mergedConfig),
    publicSlice?.[WEBUI_SETTINGS_CONFIG_KEY],
    'public',
  );
  jotaiStore.set(loginConfigState, effectiveLoginConfig);
  jotaiStore.set(autoLogoutState, effectiveLoginConfig.autoLogout);
  // loginPluginState stays on the bundled value; whether the joined
  // server's login plugin should load is still open (#10872).
  return { status: 'loaded', domainName: publicTarget?.domainName ?? null };
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
