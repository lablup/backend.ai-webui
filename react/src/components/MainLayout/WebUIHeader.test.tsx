/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the FR-3414 header flip: the header's project selector block
 * (extracted into `WebUIHeaderProjectSelect`) must not be mounted on the
 * three super-admin-scoped routes (`admin-session`, `admin-deployments`,
 * `admin-data` — decided by `useIsSuperAdminScopedPage` off the route
 * `handle.menuKey`) and must be mounted everywhere else.
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
  ])(
    'does NOT mount the project selector block on the super-admin route %s',
    (path, menuKey) => {
      renderHeaderAt(path, { scope: 'admin', menuKey });
      expect(screen.getByTestId('webui-header')).toBeInTheDocument();
      expect(
        screen.queryByTestId('header-project-select-stub'),
      ).not.toBeInTheDocument();
    },
  );

  it('does not mount the selector block on a legacy unprefixed admin path (pathname fallback)', () => {
    renderHeaderAt('/admin-session');
    expect(
      screen.queryByTestId('header-project-select-stub'),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['/project/default/data', { scope: 'project', menuKey: 'data' }],
    ['/project/default/session', { scope: 'project', menuKey: 'session' }],
    ['/admin/users', { scope: 'admin', menuKey: 'credential' }],
  ])('mounts the project selector block on %s', (path, handle) => {
    renderHeaderAt(path, handle);
    expect(
      screen.getByTestId('header-project-select-stub'),
    ).toBeInTheDocument();
  });
});
