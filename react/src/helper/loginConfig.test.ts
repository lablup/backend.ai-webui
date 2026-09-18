import { isServedByWebServer, refreshConfigFromToml } from './loginConfig';
import { beforeEach, describe, expect, it } from 'vitest';

// jsdom gives the test page a real origin; "same origin" means that one.
const pageOrigin = globalThis.location.origin;
const otherOrigin = 'https://manager.example.com:8091';

describe('isServedByWebServer', () => {
  it('is true only when apiEndpoint shares the page origin', () => {
    expect(isServedByWebServer(pageOrigin)).toBe(true);
    expect(isServedByWebServer(`${pageOrigin}/`)).toBe(true);
    expect(isServedByWebServer(otherOrigin)).toBe(false);
  });

  it('is false for an empty, non-string, or unparsable endpoint', () => {
    expect(isServedByWebServer('')).toBe(false);
    expect(isServedByWebServer(undefined)).toBe(false);
    expect(isServedByWebServer('not a url')).toBe(false);
    expect(isServedByWebServer('[Default API Endpoint]')).toBe(false);
  });
});

describe('refreshConfigFromToml sign-in mode', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (globalThis as any).isElectron;
  });

  const general = (apiEndpoint: string, connectionMode = 'API') => ({
    general: { apiEndpoint, connectionMode, allowChangeSigninMode: true },
  });

  it('hides the switch on a webserver-served page but keeps the configured mode', () => {
    const state = refreshConfigFromToml(general(pageOrigin));
    expect(state.change_signin_support).toBe(false);
    expect(state.connection_mode).toBe('API');
  });

  it('keeps the switch when apiEndpoint is another host', () => {
    const state = refreshConfigFromToml(general(otherOrigin));
    expect(state.change_signin_support).toBe(true);
    expect(state.connection_mode).toBe('API');
  });

  it('keeps the switch when the endpoint field is left for the user', () => {
    expect(refreshConfigFromToml(general('')).change_signin_support).toBe(true);
  });

  it('restores the mode Electron stored, except on a webserver-served page', () => {
    (globalThis as any).isElectron = true;
    localStorage.setItem('backendaiwebui.connection_mode', 'API');

    expect(
      refreshConfigFromToml(general(otherOrigin, 'SESSION')).connection_mode,
    ).toBe('API');
    expect(
      refreshConfigFromToml(general(pageOrigin, 'SESSION')).connection_mode,
    ).toBe('SESSION');
  });
});
