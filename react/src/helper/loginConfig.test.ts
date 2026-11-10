/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultLoginConfig, refreshConfigFromToml } from './loginConfig';
import { WEBUI_SETTING_DEFINITIONS } from './webuiSettings';
import { describe, expect, it } from 'vitest';

describe('refreshConfigFromToml', () => {
  it('reads the keys config.toml still owns', () => {
    const state = refreshConfigFromToml({
      general: {
        apiEndpoint: 'https://webserver.example.com',
        connectionMode: 'API',
        signupSupport: true,
      },
      wsproxy: { proxyURL: 'https://proxy.example.com/' },
    });
    expect(state.api_endpoint).toBe('https://webserver.example.com');
    expect(state.connection_mode).toBe('API');
    expect(state.signup_support).toBe(true);
    expect(state.proxy_url).toBe('https://proxy.example.com/');
  });

  it('ignores a System Settings key left in the file', () => {
    const state = refreshConfigFromToml({
      general: { hideAgents: false, debug: true, maxCountForPreopenPorts: 3 },
      resources: { maxCPUCoresPerContainer: 2 },
      menu: { blocklist: 'data' },
      plugin: { login: 'custom-login' },
    });
    const defaults = getDefaultLoginConfig();
    for (const { field } of WEBUI_SETTING_DEFINITIONS) {
      expect(state[field]).toEqual(defaults[field]);
    }
  });
});

describe('refreshConfigFromToml — enableWebMCP', () => {
  it('defaults to true', () => {
    expect(getDefaultLoginConfig().enableWebMCP).toBe(true);
    expect(refreshConfigFromToml({ general: {} }).enableWebMCP).toBe(true);
    expect(refreshConfigFromToml(null).enableWebMCP).toBe(true);
  });

  it('reads [general] enableWebMCP', () => {
    expect(
      refreshConfigFromToml({ general: { enableWebMCP: true } }).enableWebMCP,
    ).toBe(true);
    expect(
      refreshConfigFromToml({ general: { enableWebMCP: false } }).enableWebMCP,
    ).toBe(false);
  });

  it('stays off for a quoted value', () => {
    for (const quoted of ['false', 'true']) {
      expect(
        refreshConfigFromToml({ general: { enableWebMCP: quoted } })
          .enableWebMCP,
      ).toBe(false);
    }
  });
});
