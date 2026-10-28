/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultLoginConfig } from './loginConfig';
import {
  applyWebUISettings,
  buildWebUISettingsDocument,
  fetchDomainWebUISettings,
  WEBUI_SETTING_DEFINITIONS,
} from './webuiSettings';
import { describe, expect, it, vi } from 'vitest';

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
      loginAttemptLimit: 5,
      loginBlockTime: 600,
      autoLogout: true,
      pluginLogin: 'signup-cloud',
      pluginPage: ['test-plugin1', 'test-plugin2'],
    };
    expect(applyWebUISettings(state, doc, 'domain')).toEqual(state);
    const next = applyWebUISettings(state, doc, 'public');
    expect(next.change_signin_support).toBe(true);
    expect(next.ssoRealmName).toBe('Corp');
    expect(next.debug).toBe(true);
    expect(next.login_attempt_limit).toBe(5);
    expect(next.login_block_time).toBe(600);
    expect(next.autoLogout).toBe(true);
    expect(next.loginPlugin).toBe('signup-cloud');
    expect(next.pluginPages).toEqual(['test-plugin1', 'test-plugin2']);
  });

  it('does not mutate the input state', () => {
    const before = { ...state };
    applyWebUISettings(state, { hideAgents: false }, 'domain');
    expect(state).toEqual(before);
  });
});

describe('buildWebUISettingsDocument', () => {
  const fileState = getDefaultLoginConfig();

  it('keeps only the keys that differ from the file value', () => {
    const doc = buildWebUISettingsDocument(
      'domain',
      {
        hideAgents: fileState.hideAgents,
        maxCPUCoresPerContainer: 128,
        menuBlocklist: [],
        allowChangeSigninMode: true,
      },
      fileState,
    );
    expect(doc).toEqual({ maxCPUCoresPerContainer: 128 });
  });

  it('is undefined when nothing differs', () => {
    expect(
      buildWebUISettingsDocument(
        'domain',
        { hideAgents: fileState.hideAgents },
        fileState,
      ),
    ).toBeUndefined();
  });

  it('drops values of the wrong type', () => {
    expect(
      buildWebUISettingsDocument(
        'domain',
        { maxCPUCoresPerContainer: '128' },
        fileState,
      ),
    ).toBeUndefined();
  });
});

describe('fetchDomainWebUISettings', () => {
  it('returns the settings sub-key of domainConfig', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({
        myAppConfigs: [
          {
            configName: 'domainConfig',
            config: { settings: { hideAgents: false } },
          },
        ],
      }),
    };
    await expect(fetchDomainWebUISettings(client)).resolves.toEqual({
      hideAgents: false,
    });
    expect(client.query).toHaveBeenCalledWith(expect.any(String), {
      configNames: ['domainConfig'],
    });
  });

  it('is undefined without a document or when the read fails', async () => {
    await expect(
      fetchDomainWebUISettings({
        query: vi.fn().mockResolvedValue({ myAppConfigs: [] }),
      }),
    ).resolves.toBeUndefined();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(
      fetchDomainWebUISettings({
        query: vi.fn().mockRejectedValue(new Error('boom')),
      }),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
