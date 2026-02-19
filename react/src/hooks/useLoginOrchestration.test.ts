/**
 * Tests for useLoginOrchestration hook.
 *
 * The hook orchestrates the initial login flow once config is loaded.
 * It handles:
 *   - Skipping when the client is already connected
 *   - Skipping for edu-applauncher / applauncher pages
 *   - Electron web-server config loading
 *   - Normal login flow (silent re-login)
 *   - Auto-logout flow (single tab, fresh navigation, auto_logout enabled)
 *     - Stale session (closed > 3s ago) → logout + open login panel
 *     - Recent session (closed < 3s ago) → silent re-login
 *     - Not logged in → open login panel
 *   - Error path → block with error message
 *   - Running only once even if configLoaded fires again
 *
 * Jotai atoms (configLoadedState, autoLogoutState) are driven by writing to
 * the atom store, simulating the config load that normally happens in
 * useInitializeConfig.
 */
import { backendaiOptions } from '../global-stores';
import { loadConfigFromWebServer } from '../helper/loginSessionAuth';
import TabCount from '../lib/TabCounter';
import { useLoginOrchestration } from './useLoginOrchestration';
import { configLoadedState, autoLogoutState } from './useWebUIConfig';
import { renderHook, act } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import React from 'react';

// ---------------------------------------------------------------------------
// jsdom window.location helper
// ---------------------------------------------------------------------------

/**
 * Change window.location.pathname without triggering a real navigation.
 * jsdom supports window.history.pushState() for URL manipulation.
 */
function setWindowPathname(pathname: string): void {
  window.history.pushState({}, '', pathname);
}

// ---------------------------------------------------------------------------
// Jest module mocks
// ---------------------------------------------------------------------------

// Prevent TabCount from starting real setInterval timers in jsdom.
jest.mock('../lib/TabCounter', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      tabsCounter: 1,
      tabsCount: jest.fn().mockReturnValue(1),
      pause: jest.fn(),
    })),
  };
});

// Mock loadConfigFromWebServer so we don't make real network requests.
jest.mock('../helper/loginSessionAuth', () => ({
  loadConfigFromWebServer: jest.fn().mockResolvedValue(undefined),
}));

const MockedTabCount = TabCount as jest.MockedClass<typeof TabCount>;
const mockedLoadConfig = loadConfigFromWebServer as jest.MockedFunction<
  typeof loadConfigFromWebServer
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a Jotai store with configLoadedState and autoLogoutState set to the
 * desired values, then build a wrapper provider for renderHook.
 */
function makeWrapper(
  configLoaded: boolean,
  autoLogout: boolean,
): React.ComponentType<{ children: React.ReactNode }> {
  const store = createStore();
  store.set(configLoadedState, configLoaded);
  store.set(autoLogoutState, autoLogout);

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store }, children);
  return Wrapper;
}

/**
 * Build default options for useLoginOrchestration.
 */
function makeOptions(
  overrides: Partial<Parameters<typeof useLoginOrchestration>[0]> = {},
) {
  return {
    onLogin: jest.fn().mockResolvedValue(undefined),
    onOpen: jest.fn(),
    onBlock: jest.fn(),
    onCheckLogin: jest.fn().mockResolvedValue(false),
    onLogoutSession: jest.fn().mockResolvedValue(undefined),
    apiEndpoint: 'https://api.example.com',
    connectionMode: 'SESSION' as const,
    ...overrides,
  };
}

/**
 * Ensure globalThis.backendaiclient is cleared between tests.
 */
function clearClient() {
  (globalThis as any).backendaiclient = null;
}

/**
 * Set up a fake, already-connected client.
 */
function makeConnectedClient() {
  (globalThis as any).backendaiclient = { ready: true };
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

/**
 * Set window.performance.getEntriesByType to return a specific navigation type.
 * jsdom does not implement the full Performance API, so we replace it on the
 * prototype (or the instance) before each test.
 */
function mockNavigationType(
  type: 'navigate' | 'reload' | 'back_forward',
): void {
  (window.performance as any).getEntriesByType = jest
    .fn()
    .mockImplementation((entryType: string) => {
      if (entryType === 'navigation') {
        return [{ type } as PerformanceNavigationTiming];
      }
      return [];
    });
}

beforeEach(() => {
  clearClient();
  localStorage.clear();
  (globalThis as any).isElectron = false;

  // Reset pathname to root
  setWindowPathname('/');

  // Default: non-reload navigation
  mockNavigationType('navigate');

  // Reset TabCount mock: single tab, not reloaded
  MockedTabCount.mockImplementation(
    () =>
      ({
        tabsCounter: 1,
        tabsCount: jest.fn().mockReturnValue(1),
        pause: jest.fn(),
      }) as unknown as TabCount,
  );

  mockedLoadConfig.mockResolvedValue(undefined);
});

afterEach(() => {
  clearClient();
  jest.restoreAllMocks();
  backendaiOptions.set('last_window_close_time', 0);
});

// ---------------------------------------------------------------------------
// Utility: run the hook to completion (let async effects settle)
// ---------------------------------------------------------------------------

async function renderOrchestrationHook(
  configLoaded: boolean,
  autoLogout: boolean,
  opts?: Partial<Parameters<typeof useLoginOrchestration>[0]>,
) {
  const options = makeOptions(opts);
  const wrapper = makeWrapper(configLoaded, autoLogout);
  const { result } = renderHook(() => useLoginOrchestration(options), {
    wrapper,
  });
  // Allow async effects to settle
  await act(async () => {
    await Promise.resolve();
  });
  return { options, result };
}

// ---------------------------------------------------------------------------
// Tests: skipping before config is loaded
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - not yet loaded', () => {
  it('does not call any callbacks before config is loaded', async () => {
    const { options } = await renderOrchestrationHook(false, false);
    expect(options.onLogin).not.toHaveBeenCalled();
    expect(options.onOpen).not.toHaveBeenCalled();
    expect(options.onBlock).not.toHaveBeenCalled();
    expect(options.onCheckLogin).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: skipping when client is already connected
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - client already connected', () => {
  it('does nothing when backendaiclient is ready', async () => {
    makeConnectedClient();
    const { options } = await renderOrchestrationHook(true, false);
    expect(options.onLogin).not.toHaveBeenCalled();
    expect(options.onOpen).not.toHaveBeenCalled();
    expect(options.onCheckLogin).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: skipping for applauncher pages
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - applauncher pages', () => {
  it('does nothing on the edu-applauncher route', async () => {
    setWindowPathname('/edu-applauncher/some-app');
    const { options } = await renderOrchestrationHook(true, false);
    expect(options.onLogin).not.toHaveBeenCalled();
    expect(options.onOpen).not.toHaveBeenCalled();
  });

  it('does nothing on the applauncher route', async () => {
    setWindowPathname('/applauncher/something');
    const { options } = await renderOrchestrationHook(true, false);
    expect(options.onLogin).not.toHaveBeenCalled();
    expect(options.onOpen).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: normal login flow
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - normal flow', () => {
  it('calls onLogin(false) in the normal case (auto_logout off)', async () => {
    const { options } = await renderOrchestrationHook(true, false);
    expect(options.onLogin).toHaveBeenCalledWith(false);
    expect(options.onOpen).not.toHaveBeenCalled();
  });

  it('calls onLogin(false) when there are multiple tabs even with auto_logout on', async () => {
    // Multiple tabs: tabsCounter > 1
    MockedTabCount.mockImplementation(
      () =>
        ({
          tabsCounter: 2,
          tabsCount: jest.fn().mockReturnValue(2),
          pause: jest.fn(),
        }) as unknown as TabCount,
    );
    const { options } = await renderOrchestrationHook(true, true);
    expect(options.onLogin).toHaveBeenCalledWith(false);
    expect(options.onOpen).not.toHaveBeenCalled();
  });

  it('calls onLogin(false) when page is reloaded even with auto_logout on', async () => {
    // Simulate a reload navigation entry
    mockNavigationType('reload');
    const { options } = await renderOrchestrationHook(true, true);
    expect(options.onLogin).toHaveBeenCalledWith(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Electron config loading
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - Electron', () => {
  it('loads config from web server in SESSION mode on Electron', async () => {
    (globalThis as any).isElectron = true;
    const { options } = await renderOrchestrationHook(true, false, {
      connectionMode: 'SESSION',
      apiEndpoint: 'https://api.example.com',
    });
    expect(mockedLoadConfig).toHaveBeenCalledWith('https://api.example.com');
    expect(options.onLogin).toHaveBeenCalled();
  });

  it('falls back to localStorage endpoint if apiEndpoint is empty on Electron', async () => {
    (globalThis as any).isElectron = true;
    localStorage.setItem(
      'backendaiwebui.api_endpoint',
      '"https://stored.example.com"',
    );
    await renderOrchestrationHook(true, false, {
      connectionMode: 'SESSION',
      apiEndpoint: '',
    });
    expect(mockedLoadConfig).toHaveBeenCalledWith('https://stored.example.com');
  });

  it('does not load config from web server in API mode on Electron', async () => {
    (globalThis as any).isElectron = true;
    await renderOrchestrationHook(true, false, {
      connectionMode: 'API',
      apiEndpoint: 'https://api.example.com',
    });
    expect(mockedLoadConfig).not.toHaveBeenCalled();
  });

  it('does not load config from web server when not Electron', async () => {
    (globalThis as any).isElectron = false;
    await renderOrchestrationHook(true, false, {
      connectionMode: 'SESSION',
      apiEndpoint: 'https://api.example.com',
    });
    expect(mockedLoadConfig).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: auto-logout flow
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - auto-logout (single tab, fresh navigation)', () => {
  beforeEach(() => {
    // Single tab, fresh navigation (not a reload)
    MockedTabCount.mockImplementation(
      () =>
        ({
          tabsCounter: 1,
          tabsCount: jest.fn().mockReturnValue(1),
          pause: jest.fn(),
        }) as unknown as TabCount,
    );
    mockNavigationType('navigate');
  });

  it('shows login panel when session is stale (closed > 3s ago)', async () => {
    const now = Date.now() / 1000;
    backendaiOptions.set('last_window_close_time', now - 10); // 10 seconds ago

    const { options } = await renderOrchestrationHook(true, true, {
      onCheckLogin: jest.fn().mockResolvedValue(true), // logged in but stale
    });

    expect(options.onLogoutSession).toHaveBeenCalled();
    expect(options.onOpen).toHaveBeenCalled();
    expect(options.onLogin).not.toHaveBeenCalled();
  });

  it('silently re-logs in when window was closed recently (< 3s ago)', async () => {
    const now = Date.now() / 1000;
    backendaiOptions.set('last_window_close_time', now - 1); // 1 second ago

    const { options } = await renderOrchestrationHook(true, true, {
      onCheckLogin: jest.fn().mockResolvedValue(true), // logged in, recent
    });

    expect(options.onLogoutSession).not.toHaveBeenCalled();
    expect(options.onLogin).toHaveBeenCalledWith(false);
    expect(options.onOpen).not.toHaveBeenCalled();
  });

  it('shows login panel when session does not exist', async () => {
    const now = Date.now() / 1000;
    backendaiOptions.set('last_window_close_time', now - 1);

    const { options } = await renderOrchestrationHook(true, true, {
      onCheckLogin: jest.fn().mockResolvedValue(false), // not logged in
    });

    expect(options.onOpen).toHaveBeenCalled();
    expect(options.onLogin).not.toHaveBeenCalled();
    expect(options.onLogoutSession).not.toHaveBeenCalled();
  });

  it('defaults last_window_close_time to current time when key is absent', async () => {
    // Remove any stored close time so the hook uses currentTime as the default.
    // When lastCloseTime defaults to currentTime, (currentTime - currentTime) = 0 < 3,
    // so the hook should silently re-login rather than triggering auto-logout.
    backendaiOptions.delete('last_window_close_time');

    const { options } = await renderOrchestrationHook(true, true, {
      onCheckLogin: jest.fn().mockResolvedValue(true),
    });

    // currentTime - currentTime === 0 which is NOT > 3, so silent re-login
    expect(options.onLogin).toHaveBeenCalledWith(false);
    expect(options.onLogoutSession).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: error handling
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - error handling', () => {
  it('calls onBlock when orchestration throws', async () => {
    // Force an error by making onCheckLogin throw
    const { options } = await renderOrchestrationHook(true, true, {
      onCheckLogin: jest.fn().mockRejectedValue(new Error('network failure')),
    });

    expect(options.onBlock).toHaveBeenCalledWith(
      'Configuration is not loaded.',
      'Error',
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: idempotency (runs only once)
// ---------------------------------------------------------------------------

describe('useLoginOrchestration - runs only once', () => {
  it('does not re-run orchestration if the hook re-renders while configLoaded stays true', async () => {
    const options = makeOptions();
    const wrapper = makeWrapper(true, false);

    const { rerender } = renderHook(() => useLoginOrchestration(options), {
      wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Trigger a re-render
    rerender();

    await act(async () => {
      await Promise.resolve();
    });

    // onLogin should have been called exactly once despite re-renders
    expect(options.onLogin).toHaveBeenCalledTimes(1);
  });
});
