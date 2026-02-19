/**
 * Tests for useLogout hook and related utilities.
 *
 * These tests cover:
 * - clearLoginStorage: removes BackendAIWebUI.login.* keys and clears sessionStorage
 * - logoutBackendAIClient: calls client.logout() in SESSION mode and nullifies global ref
 * - performLogoutCleanup: coordinates cleanup and returns true/false
 * - performAppCloseCleanup: respects preserve_login setting
 * - useLogoutEventListeners: registers and removes DOM event listeners
 * - LogoutEventHandler: renders null and registers listeners via the hook
 *
 * React-hook tests (useLogout, useLogoutEventListeners) use
 * renderHook with a MemoryRouter wrapper so that useNavigate works.
 */
import { backendaiOptions, backendaiUtils } from '../global-stores';
import {
  LogoutEventHandler,
  useLogout,
  useLogoutEventListeners,
} from './useLogout';
import { render, renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Helpers / wrapper
// ---------------------------------------------------------------------------

/** Wrap in a MemoryRouter so hooks that call useNavigate succeed. */
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, null, children);

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock react-i18next so that t() returns the key as-is, making assertions
// independent of the actual translation strings.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// ---------------------------------------------------------------------------
// Helper: set up a fake backendaiclient on globalThis
// ---------------------------------------------------------------------------
function makeFakeClient(connectionMode: 'SESSION' | 'API' = 'SESSION') {
  const logoutFn = jest.fn().mockResolvedValue(undefined);
  (globalThis as any).backendaiclient = {
    _config: { connectionMode },
    logout: logoutFn,
  };
  return { logoutFn };
}

function clearFakeClient() {
  (globalThis as any).backendaiclient = null;
}

// ---------------------------------------------------------------------------
// Tests: clearLoginStorage (tested indirectly via performLogoutCleanup/logout)
// ---------------------------------------------------------------------------

describe('clearLoginStorage (via useLogout)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    makeFakeClient();
  });

  afterEach(() => {
    clearFakeClient();
  });

  it('removes BackendAIWebUI.login.* keys from localStorage', async () => {
    localStorage.setItem('BackendAIWebUI.login.token', 'abc123');
    localStorage.setItem('BackendAIWebUI.login.user', 'alice');
    localStorage.setItem('other.key', 'keep-me');

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });

    expect(localStorage.getItem('BackendAIWebUI.login.token')).toBeNull();
    expect(localStorage.getItem('BackendAIWebUI.login.user')).toBeNull();
    // Non-login keys must be preserved
    expect(localStorage.getItem('other.key')).toBe('keep-me');
  });

  it('clears sessionStorage on logout', async () => {
    sessionStorage.setItem('session-data', 'value');

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });

    expect(sessionStorage.getItem('session-data')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: logoutBackendAIClient (tested indirectly via useLogout)
// ---------------------------------------------------------------------------

describe('logoutBackendAIClient (via useLogout)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearFakeClient();
  });

  it('calls client.logout() when connectionMode is SESSION', async () => {
    const { logoutFn } = makeFakeClient('SESSION');

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });

    expect(logoutFn).toHaveBeenCalledTimes(1);
  });

  it('does NOT call client.logout() when connectionMode is API', async () => {
    const { logoutFn } = makeFakeClient('API');

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });

    expect(logoutFn).not.toHaveBeenCalled();
  });

  it('nullifies globalThis.backendaiclient after logout', async () => {
    makeFakeClient();

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });

    expect((globalThis as any).backendaiclient).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: performLogoutCleanup (tested via useLogout)
// ---------------------------------------------------------------------------

describe('performLogoutCleanup (via useLogout)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearFakeClient();
  });

  it('dispatches add-bai-notification event with cleanup message when client exists', async () => {
    makeFakeClient();

    const events: CustomEvent[] = [];
    document.addEventListener('add-bai-notification', (e) =>
      events.push(e as CustomEvent),
    );

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });

    document.removeEventListener('add-bai-notification', (e) =>
      events.push(e as CustomEvent),
    );

    expect(events.length).toBeGreaterThanOrEqual(1);
    const notifEvent = events[0];
    expect(notifEvent.detail.open).toBe(true);
    // The message is the i18n key (our mock returns the key as-is)
    expect(notifEvent.detail.message).toBe('webui.CleanUpNow');
  });

  it('does NOT dispatch notification when there is no client', async () => {
    (globalThis as any).backendaiclient = null;

    const events: CustomEvent[] = [];
    document.addEventListener('add-bai-notification', (e) =>
      events.push(e as CustomEvent),
    );

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });

    document.removeEventListener('add-bai-notification', (e) =>
      events.push(e as CustomEvent),
    );

    expect(events).toHaveLength(0);
  });

  it('tolerates failure in _deleteRecentProjectGroupInfo gracefully', async () => {
    makeFakeClient();
    const originalFn = backendaiUtils._deleteRecentProjectGroupInfo;
    backendaiUtils._deleteRecentProjectGroupInfo = () => {
      throw new Error('utils not ready');
    };

    const { result } = renderHook(() => useLogout(), { wrapper });
    // Should not throw
    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    backendaiUtils._deleteRecentProjectGroupInfo = originalFn;
  });
});

// ---------------------------------------------------------------------------
// Tests: performAppCloseCleanup (via closeAppWindow)
// ---------------------------------------------------------------------------

describe('performAppCloseCleanup (via closeAppWindow)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearFakeClient();
    backendaiOptions.set('preserve_login', false);
  });

  it('cleans up storage and calls logout when preserve_login is false', async () => {
    makeFakeClient();
    backendaiOptions.set('preserve_login', false);
    localStorage.setItem('BackendAIWebUI.login.token', 'abc');
    sessionStorage.setItem('session', 'data');

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.closeAppWindow();
    });

    expect(localStorage.getItem('BackendAIWebUI.login.token')).toBeNull();
    expect(sessionStorage.getItem('session')).toBeNull();
    expect((globalThis as any).backendaiclient).toBeNull();
  });

  it('does NOT clean up when preserve_login is true', async () => {
    makeFakeClient();
    backendaiOptions.set('preserve_login', true);
    localStorage.setItem('BackendAIWebUI.login.token', 'abc');
    sessionStorage.setItem('session', 'data');

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.closeAppWindow();
    });

    expect(localStorage.getItem('BackendAIWebUI.login.token')).toBe('abc');
    expect(sessionStorage.getItem('session')).toBe('data');
    // Client must still be present (not nullified)
    expect((globalThis as any).backendaiclient).not.toBeNull();
  });

  it('dispatches cleanup notification when preserve_login is false', async () => {
    makeFakeClient();
    backendaiOptions.set('preserve_login', false);

    const events: CustomEvent[] = [];
    document.addEventListener('add-bai-notification', (e) =>
      events.push(e as CustomEvent),
    );

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.closeAppWindow();
    });

    document.removeEventListener('add-bai-notification', (e) =>
      events.push(e as CustomEvent),
    );

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].detail.open).toBe(true);
    expect(events[0].detail.message).toBe('webui.CleanUpLoginSession');
  });
});

// ---------------------------------------------------------------------------
// Tests: useLogoutEventListeners
// ---------------------------------------------------------------------------

describe('useLogoutEventListeners', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    makeFakeClient();
    // Ensure Electron flag is off by default
    (globalThis as any).isElectron = false;
  });

  afterEach(() => {
    clearFakeClient();
    (globalThis as any).isElectron = false;
  });

  it('registers backend-ai-logout listener on mount', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');

    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    const registeredEvents = addSpy.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain('backend-ai-logout');

    unmount();
    addSpy.mockRestore();
  });

  it('removes backend-ai-logout listener on unmount', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    unmount();

    const removedEvents = removeSpy.mock.calls.map(([event]) => event);
    expect(removedEvents).toContain('backend-ai-logout');

    removeSpy.mockRestore();
  });

  it('registers beforeunload listener on mount', () => {
    const addSpy = jest.spyOn(globalThis, 'addEventListener');

    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    const registeredEvents = addSpy.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain('beforeunload');

    unmount();
    addSpy.mockRestore();
  });

  it('removes beforeunload listener on unmount', () => {
    const removeSpy = jest.spyOn(globalThis, 'removeEventListener');

    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    unmount();

    const removedEvents = removeSpy.mock.calls.map(([event]) => event);
    expect(removedEvents).toContain('beforeunload');

    removeSpy.mockRestore();
  });

  it('registers backend-ai-app-close listener when isElectron is true', () => {
    (globalThis as any).isElectron = true;
    const addSpy = jest.spyOn(document, 'addEventListener');

    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    const registeredEvents = addSpy.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain('backend-ai-app-close');

    unmount();
    addSpy.mockRestore();
  });

  it('does NOT register backend-ai-app-close listener when isElectron is false', () => {
    (globalThis as any).isElectron = false;
    const addSpy = jest.spyOn(document, 'addEventListener');

    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    const registeredEvents = addSpy.mock.calls.map(([event]) => event);
    expect(registeredEvents).not.toContain('backend-ai-app-close');

    unmount();
    addSpy.mockRestore();
  });

  it('saves last_window_close_time on beforeunload', () => {
    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    const beforeUnloadEvent = new Event('beforeunload');
    act(() => {
      globalThis.dispatchEvent(beforeUnloadEvent);
    });

    const saved = backendaiOptions.get('last_window_close_time');
    expect(typeof saved).toBe('number');
    expect(saved).toBeGreaterThan(0);

    unmount();
  });

  it('triggers logout when backend-ai-logout event is dispatched', async () => {
    const { unmount } = renderHook(() => useLogoutEventListeners(), {
      wrapper,
    });

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent('backend-ai-logout', {
          detail: { callbackURL: '/some-path' },
        }),
      );
      // Allow microtasks to settle
      await Promise.resolve();
    });

    // Storage should be cleared as part of logout
    expect((globalThis as any).backendaiclient).toBeNull();

    unmount();
  });
});

// ---------------------------------------------------------------------------
// Tests: LogoutEventHandler component
// ---------------------------------------------------------------------------

describe('LogoutEventHandler component', () => {
  it('is a React function component', () => {
    expect(typeof LogoutEventHandler).toBe('function');
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(LogoutEventHandler),
      ),
    );
    expect(container.firstChild).toBeNull();
  });

  it('registers event listeners when mounted', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');

    const { unmount } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(LogoutEventHandler),
      ),
    );

    const registeredEvents = addSpy.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain('backend-ai-logout');

    unmount();
    addSpy.mockRestore();
  });
});
