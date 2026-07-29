/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SUPER_ADMIN_SCOPED_MENU_KEYS,
  useIsSuperAdminScopedPage,
} from './useIsSuperAdminScopedPage';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

const Probe = () => {
  const isSuperAdminScopedPage = useIsSuperAdminScopedPage();
  return <div data-testid="probe">{String(isSuperAdminScopedPage)}</div>;
};

// Mirrors the shape the route generator attaches in routes.tsx: the three
// admin feature pages live under `/admin/*` and carry `handle.menuKey`
// ('admin-session' | 'admin-deployments' | 'admin-data'); legacy unprefixed
// paths (`/admin-session`, …) have no handle and fall back to the pathname's
// first segment inside `useCurrentMenuKey`.
const renderAt = (
  path: string,
  routes: Parameters<typeof createMemoryRouter>[0],
) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

describe('useIsSuperAdminScopedPage (FR-3413)', () => {
  it('exports the three super-admin menu keys for FR-3414 reuse', () => {
    expect(SUPER_ADMIN_SCOPED_MENU_KEYS).toEqual([
      'admin-session',
      'admin-deployments',
      'admin-data',
    ]);
  });

  it.each([
    ['/admin/session', 'admin-session'],
    ['/admin/deployments/some-deployment-id', 'admin-deployments'],
    ['/admin/data', 'admin-data'],
  ])('is true on the handle-marked admin route %s', (path, menuKey) => {
    renderAt(path, [
      {
        path,
        element: <Probe />,
        handle: { scope: 'admin', menuKey },
      },
    ]);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });

  it('is true on a legacy unprefixed admin path without a handle (pathname fallback)', () => {
    renderAt('/admin-session', [
      { path: '/admin-session', element: <Probe /> },
    ]);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });

  it.each([
    ['/project/default/data', { scope: 'project', menuKey: 'data' }],
    [
      '/project/default/admin/deployments/dep-1',
      { scope: 'projectAdmin', menuKey: 'project-admin-deployments' },
    ],
    ['/admin/users', { scope: 'admin', menuKey: 'admin-users' }],
  ])('is false on non-super-admin-scoped route %s', (path, handle) => {
    renderAt(path, [{ path, element: <Probe />, handle }]);
    expect(screen.getByTestId('probe')).toHaveTextContent('false');
  });
});
