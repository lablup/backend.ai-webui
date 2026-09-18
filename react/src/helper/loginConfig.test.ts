import { isServedByWebServer, refreshConfigFromToml } from './loginConfig';
import { afterEach, describe, expect, it } from 'vitest';

describe('isServedByWebServer', () => {
  it('is true when apiEndpoint shares the page origin', () => {
    expect(
      isServedByWebServer(
        'https://webui.example.com',
        'https://webui.example.com',
        false,
      ),
    ).toBe(true);
    expect(
      isServedByWebServer(
        'https://webui.example.com/',
        'https://webui.example.com',
        false,
      ),
    ).toBe(true);
  });

  it('is false for another origin, an empty endpoint, or a bad URL', () => {
    expect(
      isServedByWebServer(
        'https://manager.example.com:8091',
        'https://webui.example.com',
        false,
      ),
    ).toBe(false);
    expect(isServedByWebServer('', 'https://webui.example.com', false)).toBe(
      false,
    );
    expect(
      isServedByWebServer('not a url', 'https://webui.example.com', false),
    ).toBe(false);
  });

  it('is false in Electron even on a matching origin', () => {
    expect(
      isServedByWebServer(
        'https://webui.example.com',
        'https://webui.example.com',
        true,
      ),
    ).toBe(false);
  });
});

describe('refreshConfigFromToml on a webserver-served page', () => {
  afterEach(() => {
    delete (globalThis as any).isElectron;
  });

  const pageOrigin = globalThis.location.origin;

  it('drops the mode switch and forces SESSION when apiEndpoint is the page origin', () => {
    const state = refreshConfigFromToml({
      general: {
        apiEndpoint: pageOrigin,
        connectionMode: 'API',
        allowChangeSigninMode: true,
      },
    });
    expect(state.change_signin_support).toBe(false);
    expect(state.connection_mode).toBe('SESSION');
  });

  it('keeps the switch when apiEndpoint is another host', () => {
    const state = refreshConfigFromToml({
      general: {
        apiEndpoint: 'https://manager.example.com:8091',
        connectionMode: 'API',
        allowChangeSigninMode: true,
      },
    });
    expect(state.change_signin_support).toBe(true);
    expect(state.connection_mode).toBe('API');
  });

  it('keeps the switch when the endpoint field is left for the user', () => {
    const state = refreshConfigFromToml({
      general: { apiEndpoint: '', allowChangeSigninMode: true },
    });
    expect(state.change_signin_support).toBe(true);
  });
});
