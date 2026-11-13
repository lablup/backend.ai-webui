/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultLoginConfig } from './loginConfig';
import {
  applyWebUISettings,
  buildWebUISettingsDocument,
  isValidWebUISetting,
  readDomainWebUISettings,
  WEBUI_SETTING_DEFINITIONS,
  withForeignWebUISettings,
  ownedWebUISettings,
} from './webuiSettings';
import { describe, expect, it } from 'vitest';

describe('WEBUI_SETTING_DEFINITIONS', () => {
  it('maps every key onto a distinct LoginConfigState field', () => {
    const defaults = getDefaultLoginConfig() as unknown as Record<
      string,
      unknown
    >;
    const keys = WEBUI_SETTING_DEFINITIONS.map((d) => d.key);
    const fields = WEBUI_SETTING_DEFINITIONS.map((d) => d.field);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(fields).size).toBe(fields.length);
    for (const { field } of WEBUI_SETTING_DEFINITIONS) {
      expect(defaults).toHaveProperty(field);
    }
  });
});

describe('applyWebUISettings', () => {
  const state = getDefaultLoginConfig();

  it('keeps the file-derived state when there is no document', () => {
    expect(applyWebUISettings(state, undefined, 'domain')).toEqual(state);
    expect(applyWebUISettings(state, null, 'domain')).toEqual(state);
    expect(applyWebUISettings(state, 'oops', 'domain')).toEqual(state);
  });

  it('overrides only the keys the document carries', () => {
    const next = applyWebUISettings(
      state,
      { hideAgents: false, maxCPUCoresPerContainer: 128 },
      'domain',
    );
    expect(next.hideAgents).toBe(false);
    expect(next.maxCPUCoresPerContainer).toBe(128);
    expect(next.maxMemoryPerContainer).toBe(state.maxMemoryPerContainer);
  });

  it('maps renamed keys onto their state fields', () => {
    const next = applyWebUISettings(
      state,
      {
        menuBlocklist: ['statistics'],
        menuInactivelist: ['import'],
        defaultSessionEnvironment: 'cr.backend.ai/stable/python',
        allowSignout: true,
      },
      'domain',
    );
    expect(next.blockList).toEqual(['statistics']);
    expect(next.inactiveList).toEqual(['import']);
    expect(next.default_session_environment).toBe(
      'cr.backend.ai/stable/python',
    );
    expect(next.allow_signout).toBe(true);
  });

  it('ignores values of the wrong type and keys of the other scope', () => {
    const next = applyWebUISettings(
      state,
      {
        hideAgents: 'false',
        maxCPUCoresPerContainer: '128',
        menuBlocklist: 'statistics,import',
        allowChangeSigninMode: true,
      },
      'domain',
    );
    expect(next).toEqual(state);
  });

  it('applies public-scope keys only for the public scope', () => {
    const doc = {
      allowChangeSigninMode: true,
      ssoRealmName: 'Corp',
      debug: true,
      autoLogout: true,
      pluginLogin: 'signup-cloud',
      pluginPage: ['test-plugin1', 'test-plugin2'],
    };
    expect(applyWebUISettings(state, doc, 'domain')).toEqual(state);
    const next = applyWebUISettings(state, doc, 'public');
    expect(next.change_signin_support).toBe(true);
    expect(next.ssoRealmName).toBe('Corp');
    // Debug mode is an act-as tab option, not a setting.
    expect(next).not.toHaveProperty('debug');
    expect(next.autoLogout).toBe(true);
    expect(next.loginPlugin).toBe('signup-cloud');
    expect(next.pluginPages).toEqual(['test-plugin1', 'test-plugin2']);
  });

  it('keeps only the known SSO vendors', () => {
    const next = applyWebUISettings(
      state,
      { singleSignOnVendors: ['openid', 'not-a-vendor', 'saml'] },
      'public',
    );
    expect(next.singleSignOnVendors).toEqual(['openid', 'saml']);
    expect(
      buildWebUISettingsDocument('public', {
        singleSignOnVendors: ['not-a-vendor'],
      }),
    ).toEqual({ singleSignOnVendors: [] });
  });

  it('does not mutate the input state', () => {
    const before = { ...state };
    applyWebUISettings(state, { hideAgents: false }, 'domain');
    expect(state).toEqual(before);
  });
});

describe('buildWebUISettingsDocument', () => {
  const defaults = getDefaultLoginConfig();

  it('keeps every key of the scope, a default value included', () => {
    const doc = buildWebUISettingsDocument('domain', {
      hideAgents: defaults.hideAgents,
      maxCPUCoresPerContainer: 128,
      menuBlocklist: [],
      allowChangeSigninMode: true,
    });
    expect(doc).toEqual({
      hideAgents: defaults.hideAgents,
      maxCPUCoresPerContainer: 128,
      menuBlocklist: [],
    });
  });

  it('is undefined when the draft holds no key of the scope', () => {
    expect(
      buildWebUISettingsDocument('domain', { allowChangeSigninMode: true }),
    ).toBeUndefined();
  });

  it('drops values of the wrong type', () => {
    expect(
      buildWebUISettingsDocument('domain', { maxCPUCoresPerContainer: '128' }),
    ).toBeUndefined();
  });
});

describe('isValidWebUISetting', () => {
  const byKey = (key: string) =>
    WEBUI_SETTING_DEFINITIONS.find((d) => d.key === key)!;

  it('gives every number setting a range', () => {
    for (const d of WEBUI_SETTING_DEFINITIONS.filter(
      (d) => d.type === 'number',
    )) {
      expect([d.key, typeof d.min, typeof d.max]).toEqual([
        d.key,
        'number',
        'number',
      ]);
    }
  });

  it('accepts the bounds and rejects a number outside them', () => {
    const cpu = byKey('maxCPUCoresPerContainer');
    expect(isValidWebUISetting(cpu, 1)).toBe(true);
    expect(isValidWebUISetting(cpu, 8192)).toBe(true);
    expect(isValidWebUISetting(cpu, 0)).toBe(false);
    expect(isValidWebUISetting(cpu, -4)).toBe(false);
    expect(isValidWebUISetting(byKey('maxFileUploadSize'), -1)).toBe(true);
    expect(isValidWebUISetting(byKey('maxFileUploadSize'), -2)).toBe(false);
    expect(isValidWebUISetting(byKey('storageWarningThreshold'), 101)).toBe(
      false,
    );
  });

  it('keeps an out-of-range number out of the state and the document', () => {
    const state = getDefaultLoginConfig();
    expect(
      applyWebUISettings(state, { maxCountForPreopenPorts: -1 }, 'domain')
        .maxCountForPreopenPorts,
    ).toBe(state.maxCountForPreopenPorts);
    expect(
      buildWebUISettingsDocument('domain', { maxCountForPreopenPorts: -1 }),
    ).toBeUndefined();
  });
});

describe('readDomainWebUISettings', () => {
  it('returns the settings sub-key of domainConfig', () => {
    expect(
      readDomainWebUISettings([
        {
          configName: 'domainConfig',
          config: { settings: { hideAgents: false } },
        },
      ]),
    ).toEqual({ hideAgents: false });
  });

  it('is undefined without a document or when the read failed', () => {
    expect(readDomainWebUISettings([])).toBeUndefined();
    expect(readDomainWebUISettings(null)).toBeUndefined();
    expect(
      readDomainWebUISettings([{ configName: 'domainConfig', config: {} }]),
    ).toBeUndefined();
  });
});

describe('withForeignWebUISettings', () => {
  const announcement = { enabled: true, title: 'hi' };
  it('keeps keys no definition owns and drops the ones it does', () => {
    expect(
      withForeignWebUISettings(
        { hideAgents: true, announcement },
        { maxCPUCoresPerContainer: 2 },
      ),
    ).toEqual({ announcement, maxCPUCoresPerContainer: 2 });
  });
  it('is undefined when neither side leaves a key', () => {
    expect(
      withForeignWebUISettings({ hideAgents: true }, undefined),
    ).toBeUndefined();
    expect(withForeignWebUISettings(undefined, undefined)).toBeUndefined();
    expect(withForeignWebUISettings('x', undefined)).toBeUndefined();
  });
});

describe('ownedWebUISettings', () => {
  it('keeps only the keys a definition owns', () => {
    expect(
      ownedWebUISettings({
        hideAgents: true,
        announcement: { enabled: true, title: 'hi' },
      }),
    ).toEqual({ hideAgents: true });
  });
});
