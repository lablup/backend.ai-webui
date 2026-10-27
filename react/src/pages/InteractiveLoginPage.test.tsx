/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `/interactive-login` navigates to the `callback` query param on the Login
 * click, so the one thing worth pinning is that only an absolute http(s)
 * callback survives — the raw value is attacker-craftable, and a
 * `javascript:` URL must never reach `window.location.href`. A malformed
 * value must not crash the render either.
 */
import InteractiveLoginPage from './InteractiveLoginPage';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks', () => ({
  useSuspendedBackendaiClient: () => ({
    _config: { endpoint: 'http://manager.example.com:8090' },
  }),
}));

vi.mock('../hooks/backendai', () => ({
  useCurrentUserInfo: () => [{ username: 'admin', email: 'admin@lablup.com' }],
}));

// BUI's locale module needs the real `initReactI18next`; only `t` is stubbed,
// so assertions read as translation keys instead of English copy.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The real window.location is restored in afterEach; the proxy stub used
// during each test replaces it temporarily.
let originalLocation: Location | null = null;
let assignedHref: string | undefined;

const renderLogin = (search: string) => {
  window.history.replaceState(null, '', `/interactive-login${search}`);
  // The router initializes from the real window.location, so create it before
  // the stub below replaces it.
  const router = createBrowserRouter([
    {
      path: '/interactive-login',
      element: <InteractiveLoginPage />,
    },
  ]);
  // jsdom cannot navigate and `window.location` is read-only there — replace
  // it with a proxy that delegates reads to the real location (react-router
  // reads href/origin during render) and swallows `href` assignments,
  // recording the value so the click's navigation becomes observable.
  assignedHref = undefined;
  const realLocation = window.location;
  originalLocation = realLocation;
  const observed = new Proxy(
    {},
    {
      get(_target, prop) {
        const value = Reflect.get(realLocation, prop);
        return typeof value === 'function' ? value.bind(realLocation) : value;
      },
      set(_target, prop, value) {
        if (prop === 'href') {
          assignedHref = String(value);
          return true;
        }
        return Reflect.set(realLocation, prop, value);
      },
    },
  );
  Object.defineProperty(window, 'location', {
    value: observed,
    writable: true,
    configurable: true,
  });
  render(
    <NuqsAdapter defaultOptions={{ shallow: false }}>
      <RouterProvider router={router} />
    </NuqsAdapter>,
  );
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}', { status: 200 })),
  );
});

afterEach(() => {
  if (originalLocation) {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    originalLocation = null;
  }
  vi.unstubAllGlobals();
});

describe('InteractiveLoginPage', () => {
  it('shows the callback origin and navigates to an http(s) callback', async () => {
    renderLogin('?name=webapp&callback=https://webapp.example.com/callback');

    expect(screen.getByText('https://webapp.example.com')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'login.Login' }));

    await waitFor(() => expect(assignedHref).toBeDefined());
    expect(assignedHref).toBe('https://webapp.example.com/callback');
  });

  it('never navigates to a javascript: callback', async () => {
    renderLogin('?name=webapp&callback=javascript:alert(1)');

    // The unsafe callback renders as no origin at all.
    expect(screen.getByText('-')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'login.Login' }));

    expect(assignedHref).toBeUndefined();
  });

  it('does not crash the render on a malformed callback', async () => {
    // `http://` (no host) makes `new URL(callback, documentUrl)` throw, which
    // resolveCallbackUrl turns into null — the render falls back to '-' and
    // the click is a no-op.
    renderLogin('?name=webapp&callback=http%3A%2F%2F');

    expect(screen.getByText('-')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'login.Login' }));

    expect(assignedHref).toBeUndefined();
  });
});
