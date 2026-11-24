/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The OpenID Connect manager plugin's etcd keys
 (`ai/backend/manager/plugin/openid/config.py`), as form values and back.
 */
import {
  emptyPluginConfigChange,
  getPluginConfigLeaf,
  getPluginConfigSubtree,
  quotePluginConfigKey,
  type PluginConfigChange,
  type PluginSecretStatus,
  type PluginConfigTree,
} from './pluginEtcdConfig';
import * as _ from 'lodash-es';

export const OPENID_WEBAPP_ROOT = 'webapp/openid';
export const OPENID_HOOK_ROOT = 'hook/openid';

/** Leaves of `OpenIDProviderConfig`, nested under `webapp/openid/openid/`. */
export const OPENID_PROVIDER_TEXT_KEYS = [
  'well_known',
  'issuer',
  'authorization_endpoint',
  'token_endpoint',
  'jwks_uri',
  'client_id',
  'certificate',
  'client_assertion_alg',
] as const;
/** Leaves of `OIDCWebAppConfig` itself, directly under `webapp/openid/`. */
export const OPENID_WEBAPP_TEXT_KEYS = [
  'login_uri',
  'allowed_redirect_hosts',
] as const;

export const OPENID_CLIENT_ASSERTION_ALGS = [
  'PS256',
  'PS384',
  'PS512',
  'RS256',
  'RS384',
  'RS512',
] as const;

export type OpenIDClientAuth = 'client_secret' | 'private_key_jwt';

export interface OpenIDGroupMappingRow {
  group?: string;
  domain?: string;
  project?: string;
  user_resource_policy?: string;
  keypair_resource_policy?: string;
}

type ProviderTextKey = (typeof OPENID_PROVIDER_TEXT_KEYS)[number];
type WebAppTextKey = (typeof OPENID_WEBAPP_TEXT_KEYS)[number];

export type OpenIDFormValues = Partial<
  Record<ProviderTextKey | WebAppTextKey, string>
> & {
  client_auth: OpenIDClientAuth;
  /** Write-only: blank keeps the stored value. */
  client_secret?: string;
  private_key?: string;
  secret?: string;
  /** Row order is the match priority (`group_order`). */
  group_mapping: Array<OpenIDGroupMappingRow>;
};

/** What the editor knows about the stored config. Holds no secret value. */
export interface OpenIDStoredConfig {
  values: OpenIDFormValues;
  secrets: {
    client_secret: boolean;
    private_key: boolean;
    secret: PluginSecretStatus;
  };
  /** Credential leaves present in etcd, an empty string included. */
  storedCredentials: {
    client_secret: boolean;
    private_key: boolean;
  };
  /** The raw `group_order` leaf, which may disagree with the rows. */
  groupOrder?: string;
}

export const OPENID_GROUP_MAPPING_FIELDS = [
  'domain',
  'project',
  'user_resource_policy',
  'keypair_resource_policy',
] as const;

const parseGroupOrder = (raw?: string) =>
  (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const readOpenIDStoredConfig = (
  webapp: PluginConfigTree,
  hook: PluginConfigTree,
): OpenIDStoredConfig => {
  const provider = getPluginConfigSubtree(webapp, ['openid']);
  const mapping = getPluginConfigSubtree(provider, ['group_mapping']);
  const order = parseGroupOrder(getPluginConfigLeaf(provider, ['group_order']));
  const groups = _.uniq([...order, ...Object.keys(mapping).sort()]);
  const webappSecret = getPluginConfigLeaf(webapp, ['secret']);
  const hookSecret = getPluginConfigLeaf(hook, ['secret']);
  const privateKey = getPluginConfigLeaf(provider, ['private_key']);
  const clientSecret = getPluginConfigLeaf(provider, ['client_secret']);

  const values: OpenIDFormValues = {
    client_auth: privateKey ? 'private_key_jwt' : 'client_secret',
    group_mapping: groups.map((group) => ({
      group,
      ..._.fromPairs(
        OPENID_GROUP_MAPPING_FIELDS.map((field) => [
          field,
          getPluginConfigLeaf(mapping, [group, field]),
        ]),
      ),
    })),
  };
  for (const key of OPENID_PROVIDER_TEXT_KEYS) {
    values[key] = getPluginConfigLeaf(provider, [key]);
  }
  for (const key of OPENID_WEBAPP_TEXT_KEYS) {
    values[key] = getPluginConfigLeaf(webapp, [key]);
  }

  return {
    values,
    secrets: {
      client_secret: !!clientSecret,
      private_key: !!privateKey,
      secret:
        !webappSecret && !hookSecret
          ? 'unset'
          : webappSecret === hookSecret
            ? 'set'
            : 'mismatch',
    },
    storedCredentials: {
      client_secret: clientSecret !== undefined,
      private_key: privateKey !== undefined,
    },
    groupOrder: getPluginConfigLeaf(provider, ['group_order']),
  };
};

const trimmed = (value?: string) => value?.trim() ?? '';

const normalizeRows = (rows: ReadonlyArray<OpenIDGroupMappingRow>) =>
  rows
    .map(
      (row) =>
        Object.fromEntries(
          (['group', ...OPENID_GROUP_MAPPING_FIELDS] as const).map((key) => [
            key,
            trimmed(row[key]),
          ]),
        ) as Required<OpenIDGroupMappingRow>,
    )
    .filter((row) => row.group);

/** The etcd writes that turn `stored` into `values`; unchanged keys are left alone. */
export const buildOpenIDConfigChange = (
  values: OpenIDFormValues,
  stored: OpenIDStoredConfig,
): PluginConfigChange => {
  const change = emptyPluginConfigChange();
  const provider = (key: string) => `${OPENID_WEBAPP_ROOT}/openid/${key}`;
  const webapp = (key: string) => `${OPENID_WEBAPP_ROOT}/${key}`;

  // A stored '' is still a key the plugin reads, so clearing deletes it too.
  const putText = (path: string, next: string, prev?: string) => {
    if (next) {
      if (next !== trimmed(prev)) change.set[path] = next;
    } else if (prev !== undefined) change.remove.push(path);
  };

  const usesKey = values.client_auth === 'private_key_jwt';
  for (const key of OPENID_PROVIDER_TEXT_KEYS) {
    const isKeyOnly = key === 'certificate' || key === 'client_assertion_alg';
    putText(
      provider(key),
      isKeyOnly && !usesKey ? '' : trimmed(values[key]),
      stored.values[key],
    );
  }
  for (const key of OPENID_WEBAPP_TEXT_KEYS) {
    putText(webapp(key), trimmed(values[key]), stored.values[key]);
  }

  // The plugin accepts exactly one credential, so switching drops the other.
  if (usesKey) {
    if (trimmed(values.private_key))
      change.set[provider('private_key')] = values.private_key!.trim();
    if (stored.storedCredentials.client_secret)
      change.remove.push(provider('client_secret'));
  } else {
    if (trimmed(values.client_secret))
      change.set[provider('client_secret')] = values.client_secret!.trim();
    if (stored.storedCredentials.private_key)
      change.remove.push(provider('private_key'));
  }

  // The hook verifies the token the webapp signs, so both copies move together.
  if (trimmed(values.secret)) {
    change.set[webapp('secret')] = values.secret!.trim();
    change.set[`${OPENID_HOOK_ROOT}/secret`] = values.secret!.trim();
  }

  const rows = normalizeRows(values.group_mapping);
  const storedRows = normalizeRows(stored.values.group_mapping);
  const rowsChanged = !_.isEqual(rows, storedRows);
  if (rowsChanged) {
    if (storedRows.length > 0)
      change.removeTree.push(provider('group_mapping'));
    for (const row of rows) {
      const groupKey = quotePluginConfigKey(row.group!);
      for (const field of OPENID_GROUP_MAPPING_FIELDS) {
        if (row[field])
          change.set[provider(`group_mapping/${groupKey}/${field}`)] =
            row[field]!;
      }
    }
  }
  // An empty or missing group_order admits no group, so it is written even unchanged.
  if (rowsChanged || (!trimmed(stored.groupOrder) && rows.length > 0)) {
    putText(
      provider('group_order'),
      rows.map((row) => row.group).join(','),
      stored.groupOrder,
    );
  }

  return change;
};
