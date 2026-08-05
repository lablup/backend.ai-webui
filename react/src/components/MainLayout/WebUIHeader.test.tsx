/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the FR-3414 header flip: the header's project selector block
 * (extracted into `WebUIHeaderProjectSelect`) must not be mounted on the
 * project-agnostic routes (`PROJECT_AGNOSTIC_MENU_KEYS` — decided by
 * `useIsProjectAgnosticPage` off the route `handle.menuKey`) and must be
 * mounted everywhere else, including the one admin page that still depends on
 * the ambient project (`admin-dashboard`).
 *
 * External behavior only: routes in → selector block mounted / not mounted.
 * The selector itself is stubbed; its internals are not under test here.
 */
import WebUIHeader from './WebUIHeader';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// The header only reads `supports()` / `_config` off the client.
vi.mock('../../hooks', () => ({
  useSuspendedBackendaiClient: () => ({
    supports: () => false,
    _config: { enableExtendLoginSession: false },
  }),
}));

// The selector block under test — stubbed so this test only asserts WHETHER
// the header mounts it, not what it renders.
vi.mock('./WebUIHeaderProjectSelect', () => ({
  default: () => <div data-testid="header-project-select-stub" />,
}));

// Heavy, irrelevant header children.
vi.mock('../BAINotificationButton', () => ({
  default: () => <div data-testid="stub-notification" />,
}));
vi.mock('../UserDropdownMenu', () => ({
  default: () => <div data-testid="stub-user-dropdown" />,
}));
vi.mock('../WEBUIHelpButton', () => ({
  default: () => <div data-testid="stub-help" />,
}));
vi.mock('../WebUIThemeToggleButton', () => ({
  default: () => <div data-testid="stub-theme-toggle" />,
}));
vi.mock('../LoginSessionExtendButton', () => ({
  default: () => <div data-testid="stub-extend-login" />,
}));
vi.mock('../ReverseThemeProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderHeaderAt = (
  path: string,
  handle?: Record<string, unknown>,
): ReturnType<typeof render> => {
  const router = createMemoryRouter(
    [{ path, element: <WebUIHeader />, handle }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
};

describe('WebUIHeader project selector gating (FR-3414)', () => {
  it.each([
    ['/admin/session', 'admin-session'],
    ['/admin/deployments', 'admin-deployments'],
    ['/admin/data', 'admin-data'],
    // Widened in FR-3414 — note `credential` lives at `/admin/users`.
    ['/admin/users', 'credential'],
    // Widened in FR-3415 — both now have in-page project selection.
    ['/admin/environment', 'environment'],
    ['/admin/reservoir', 'reservoir'],
    ['/admin/resource-policy', 'resource-policy'],
    ['/admin/agent', 'agent'],
    ['/admin/project', 'project'],
    ['/admin/settings', 'settings'],
    ['/admin/information', 'information'],
  ])(
    'does NOT mount the project selector block on the project-agnostic route %s',
    (path, menuKey) => {
      renderHeaderAt(path, { scope: 'admin', menuKey });
      expect(screen.getByTestId('webui-header')).toBeInTheDocument();
      expect(
        screen.queryByTestId('header-project-select-stub'),
      ).not.toBeInTheDocument();
    },
  );

  it.each([['/admin-session'], ['/credential'], ['/rbac']])(
    'does not mount the selector block on the legacy unprefixed admin path %s (pathname fallback)',
    (path) => {
      renderHeaderAt(path);
      expect(
        screen.queryByTestId('header-project-select-stub'),
      ).not.toBeInTheDocument();
    },
  );

  it.each([
    ['/project/default/data', { scope: 'project', menuKey: 'data' }],
    ['/project/default/session', { scope: 'project', menuKey: 'session' }],
    // The only admin page that still genuinely depends on the ambient project.
    ['/admin/dashboard', { scope: 'admin', menuKey: 'admin-dashboard' }],
  ])('mounts the project selector block on %s', (path, handle) => {
    renderHeaderAt(path, handle);
    expect(
      screen.getByTestId('header-project-select-stub'),
    ).toBeInTheDocument();
  });
});
