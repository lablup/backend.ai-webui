/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isValidUrl } from '../../../diagnostics/rules/configRules';
import {
  buildOpenIDConfigChange,
  readOpenIDStoredConfig,
} from './openidPluginConfig';
import {
  applyPluginConfigChange,
  getPluginConfigLeaf,
  type PluginSettingClient,
} from './pluginEtcdConfig';
import { describe, expect, it, vi } from 'vitest';

const storedWebapp = {
  secret: 'jwt-secret',
  login_uri: 'https://webui.example.com',
  openid: {
    well_known: 'https://idp.example.com/.well-known/openid-configuration',
    client_id: 'backend-ai',
    client_secret: 'client-secret',
    group_order: 'admins, users',
    group_mapping: {
      users: { domain: 'default', project: 'default' },
      admins: { domain: 'default', project: 'ops' },
      '/nested/group': { domain: 'lab', project: 'research' },
    },
  },
};

describe('readOpenIDStoredConfig', () => {
  it('reports secrets as flags and never copies their values', () => {
    const stored = readOpenIDStoredConfig(storedWebapp, {
      secret: 'jwt-secret',
    });
    expect(stored.secrets).toEqual({
      client_secret: true,
      private_key: false,
      secret: 'set',
    });
    expect(JSON.stringify(stored)).not.toContain('client-secret');
    expect(JSON.stringify(stored)).not.toContain('jwt-secret');
    expect(stored.values.client_auth).toBe('client_secret');
    expect(stored.values.client_id).toBe('backend-ai');
  });

  it('orders the mapping rows by group_order, then the rest', () => {
    const stored = readOpenIDStoredConfig(storedWebapp, {});
    expect(stored.values.group_mapping.map((row) => row.group)).toEqual([
      'admins',
      'users',
      '/nested/group',
    ]);
    expect(stored.values.group_mapping[0].project).toBe('ops');
  });

  it('flags a JWT secret set on only one side, or set differently', () => {
    expect(readOpenIDStoredConfig(storedWebapp, {}).secrets.secret).toBe(
      'mismatch',
    );
    expect(
      readOpenIDStoredConfig(storedWebapp, { secret: 'other' }).secrets.secret,
    ).toBe('mismatch');
    expect(readOpenIDStoredConfig({}, {}).secrets.secret).toBe('unset');
  });
});

describe('buildOpenIDConfigChange', () => {
  const stored = readOpenIDStoredConfig(storedWebapp, {
    secret: 'jwt-secret',
  });

  it('writes nothing when the form is saved unchanged with blank secrets', () => {
    expect(buildOpenIDConfigChange(stored.values, stored)).toEqual({
      set: {},
      remove: [],
      removeTree: [],
    });
  });

  it('writes the JWT secret to both the webapp and the hook', () => {
    const change = buildOpenIDConfigChange(
      { ...stored.values, secret: ' new ' },
      stored,
    );
    expect(change.set).toEqual({
      'webapp/openid/secret': 'new',
      'hook/openid/secret': 'new',
    });
  });

  it('drops the client secret when switching to a private key', () => {
    const change = buildOpenIDConfigChange(
      {
        ...stored.values,
        client_auth: 'private_key_jwt',
        private_key: 'PEM KEY',
        certificate: 'PEM CERT',
      },
      stored,
    );
    expect(change.set).toEqual({
      'webapp/openid/openid/certificate': 'PEM CERT',
      'webapp/openid/openid/private_key': 'PEM KEY',
    });
    expect(change.remove).toEqual(['webapp/openid/openid/client_secret']);
  });

  it('removes a cleared optional key and replaces a changed mapping whole', () => {
    const change = buildOpenIDConfigChange(
      {
        ...stored.values,
        well_known: '',
        group_mapping: [
          { group: '/nested/group', domain: 'lab', project: 'research' },
        ],
      },
      stored,
    );
    expect(change.remove).toEqual(['webapp/openid/openid/well_known']);
    expect(change.removeTree).toEqual(['webapp/openid/openid/group_mapping']);
    expect(change.set).toEqual({
      'webapp/openid/openid/group_mapping/%2Fnested%2Fgroup/domain': 'lab',
      'webapp/openid/openid/group_mapping/%2Fnested%2Fgroup/project':
        'research',
      'webapp/openid/openid/group_order': '/nested/group',
    });
  });
});

describe('buildOpenIDConfigChange against odd stored state', () => {
  it('writes a missing group_order even when the rows did not change', () => {
    const { group_order: _order, ...openid } = storedWebapp.openid;
    const stored = readOpenIDStoredConfig(
      { ...storedWebapp, openid },
      { secret: 'jwt-secret' },
    );
    expect(buildOpenIDConfigChange(stored.values, stored).set).toEqual({
      'webapp/openid/openid/group_order': '/nested/group,admins,users',
    });
  });

  it('writes a group_order stored as an empty string', () => {
    const stored = readOpenIDStoredConfig(
      { ...storedWebapp, openid: { ...storedWebapp.openid, group_order: '' } },
      { secret: 'jwt-secret' },
    );
    expect(buildOpenIDConfigChange(stored.values, stored).set).toEqual({
      'webapp/openid/openid/group_order': '/nested/group,admins,users',
    });
  });

  it('deletes credential and key-only leaves stored as empty strings', () => {
    const stored = readOpenIDStoredConfig(
      {
        ...storedWebapp,
        openid: { ...storedWebapp.openid, client_secret: '', certificate: '' },
      },
      { secret: 'jwt-secret' },
    );
    expect(stored.secrets.client_secret).toBe(false);
    const toKey = buildOpenIDConfigChange(
      { ...stored.values, client_auth: 'private_key_jwt', private_key: 'K' },
      stored,
    );
    expect(toKey.remove).toContain('webapp/openid/openid/client_secret');
    const unchanged = buildOpenIDConfigChange(stored.values, stored);
    expect(unchanged.remove).toEqual(['webapp/openid/openid/certificate']);
  });
});

describe('applyPluginConfigChange', () => {
  it('deletes before it writes, in transactions of at most 16 leaves', async () => {
    const calls: Array<string> = [];
    const client: PluginSettingClient = {
      setting: {
        list: vi.fn(),
        set: vi.fn(async (key, value) => {
          calls.push(`set ${key} ${Object.keys(value as object).length}`);
          return { result: 'ok' };
        }),
        delete: vi.fn(async (key, prefix) => {
          calls.push(`delete ${key} ${!!prefix}`);
          return { result: 'ok' };
        }),
      },
    };
    const set = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`webapp/openid/k${i}`, `${i}`]),
    );
    await applyPluginConfigChange(client, {
      set,
      remove: ['webapp/openid/x'],
      removeTree: ['webapp/openid/openid/group_mapping'],
    });
    expect(calls).toEqual([
      'delete plugins/webapp/openid/openid/group_mapping/ true',
      'delete plugins/webapp/openid/x false',
      'set plugins 16',
      'set plugins 4',
    ]);
  });
});

describe('helpers', () => {
  it('reads a key that is also a prefix from its empty-string entry', () => {
    expect(getPluginConfigLeaf({ a: { '': 'v', b: 'w' } }, ['a'])).toBe('v');
  });

  it('accepts http(s) URLs with an Entra ID tenant placeholder', () => {
    expect(
      isValidUrl('https://login.microsoftonline.com/{tenantid}/v2.0'),
    ).toBe(true);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
  });
});
