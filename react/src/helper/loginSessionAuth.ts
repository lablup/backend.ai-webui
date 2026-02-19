/**
 * Login Session Authentication Utilities
 *
 * Extracted from backend-ai-login.ts _connectViaGQL method.
 * Handles post-authentication GQL connection and client setup.
 */
import { applyConfigToClient, type LoginConfigState } from './loginConfig';

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
  return { client, clientConfig };
}

/**
 * Check if the current session is already logged in.
 */
export async function checkLoginSession(apiEndpoint: string): Promise<boolean> {
  if (!apiEndpoint) return false;
  const { client } = createBackendAIClient('', '', apiEndpoint, 'SESSION');
  try {
    await client.get_manager_version();
    const isLogon = await client.check_login();
    return !!isLogon;
  } catch {
    return false;
  }
}

/**
 * Perform GQL connection after successful authentication.
 * Sets up globalThis.backendaiclient with user info, groups, and config.
 */
export async function connectViaGQL(
  client: any,
  cfg: LoginConfigState,
  endpoints: string[],
): Promise<string[]> {
  const fields = ['user_id', 'resource_policy', 'user'];
  const q = `query { keypair { ${fields.join(' ')} } }`;
  const v = {};

  const response = await client.query(q, v);

  (globalThis as any).backendaiclient = client;

  if (!response['keypair']) {
    await client.logout();
    throw new Error('Keypair information is missing.');
  }

  const resourcePolicy = response['keypair'].resource_policy;
  (globalThis as any).backendaiclient.resource_policy = resourcePolicy;
  const user = response['keypair'].user;

  // Get user details
  const userFields = [
    'username',
    'email',
    'full_name',
    'is_active',
    'role',
    'domain_name',
    'groups {name, id}',
    'need_password_change',
    'uuid',
  ];
  const userQuery = `query { user{ ${userFields.join(' ')} } }`;
  const userResponse = await (globalThis as any).backendaiclient.query(
    userQuery,
    { uuid: user },
  );

  const email = userResponse['user'].email;
  const userGroups = userResponse['user'].groups;
  const role = userResponse['user'].role;
  const domainName = userResponse['user'].domain_name;

  (globalThis as any).backendaiclient.email = email;
  (globalThis as any).backendaiclient.user_uuid = userResponse['user'].uuid;
  (globalThis as any).backendaiclient.full_name =
    userResponse['user'].full_name;
  (globalThis as any).backendaiclient.is_admin = false;
  (globalThis as any).backendaiclient.is_superadmin = false;
  (globalThis as any).backendaiclient.need_password_change =
    userResponse['user'].need_password_change;

  if (['superadmin', 'admin'].includes(role)) {
    (globalThis as any).backendaiclient.is_admin = true;
  }
  if (['superadmin'].includes(role)) {
    (globalThis as any).backendaiclient.is_superadmin = true;
  }

  // Get group list
  const groupResponse = await (globalThis as any).backendaiclient.group.list(
    true,
    false,
    ['id', 'name', 'description', 'is_active'],
  );

  const groups = groupResponse.groups;
  const userGroupIds = userGroups.map(({ id }: { id: string }) => id);

  if (groups !== null) {
    (globalThis as any).backendaiclient.groups = groups
      .filter((item: any) => userGroupIds.includes(item.id))
      .map((item: any) => item.name)
      .sort();

    const groupMap: Record<string, string> = {};
    groups.forEach((element: any) => {
      groupMap[element.name] = element.id;
    });
    (globalThis as any).backendaiclient.groupIds = groupMap;
  } else {
    (globalThis as any).backendaiclient.groups = ['default'];
  }

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
  const updatedConfig = { ...cfg, domain_name: domainName };
  applyConfigToClient(updatedConfig);

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
 * Perform token-based login (SSO).
 */
export async function tokenLogin(
  client: any,
  sToken: string,
  cfg: LoginConfigState,
  endpoints: string[],
): Promise<string[]> {
  const loginSuccess = await client.token_login(sToken);
  if (!loginSuccess) {
    throw new Error('Cannot authorize session by token.');
  }
  return connectViaGQL(client, cfg, endpoints);
}

/**
 * Load webserver config when the api_endpoint differs from current URL origin.
 */
export async function loadConfigFromWebServer(
  apiEndpoint: string,
): Promise<void> {
  if (!window.location.href.startsWith(apiEndpoint)) {
    const webuiEl = document.querySelector('backend-ai-webui') as any;
    if (webuiEl) {
      const fieldsToExclude = [
        'general.apiEndpoint',
        'general.apiEndpointText',
        'general.appDownloadUrl',
        'wsproxy',
      ];
      const webserverConfigURL = new URL('./config.toml', apiEndpoint).href;
      const config = await webuiEl._parseConfig(webserverConfigURL, true);
      fieldsToExclude.forEach((key) => {
        (globalThis as any).backendaiutils.deleteNestedKeyFromObject(
          config,
          key,
        );
      });
      const mergedConfig = (
        globalThis as any
      ).backendaiutils.mergeNestedObjects(webuiEl.config, config);
      webuiEl.config = mergedConfig;
    }
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
