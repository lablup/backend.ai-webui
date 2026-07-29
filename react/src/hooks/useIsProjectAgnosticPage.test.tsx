/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PROJECT_AGNOSTIC_MENU_KEYS,
  useIsProjectAgnosticPage,
} from './useIsProjectAgnosticPage';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

const Probe = () => {
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  return <div data-testid="probe">{String(isProjectAgnosticPage)}</div>;
};

// Mirrors the shape the route generator attaches in routes.tsx: the admin
// feature pages live under `/admin/*` and carry `handle.menuKey`; legacy
// unprefixed paths (`/admin-session`, `/credential`, …) have no handle and
// fall back to the pathname's first segment inside `useCurrentMenuKey`.
const renderAt = (
  path: string,
  routes: Parameters<typeof createMemoryRouter>[0],
) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

describe('useIsProjectAgnosticPage (FR-3413, widened in FR-3414 and FR-3415)', () => {
  it('exports the full project-agnostic menu key list', () => {
    expect(PROJECT_AGNOSTIC_MENU_KEYS).toEqual([
      'admin-session',
      'admin-deployments',
      'admin-data',
      'credential',
      'environment',
      'resource-policy',
      'reservoir',
      'scheduler',
      'agent',
      'project',
      'settings',
      'maintenance',
      'diagnostics',
      'rbac',
      'branding',
      'information',
    ]);
  });

  it.each([
    // FR-3413 originals
    ['/admin/session', 'admin-session'],
    ['/admin/deployments/some-deployment-id', 'admin-deployments'],
    ['/admin/data', 'admin-data'],
    // FR-3414 widening — note `credential` lives at `/admin/users`
    ['/admin/users', 'credential'],
    // FR-3415 widening
    ['/admin/environment', 'environment'],
    ['/admin/reservoir', 'reservoir'],
    ['/admin/reservoir/artifact-1', 'reservoir'],
    ['/admin/resource-policy', 'resource-policy'],
    ['/admin/scheduler', 'scheduler'],
    ['/admin/agent', 'agent'],
    ['/admin/project', 'project'],
    ['/admin/settings', 'settings'],
    ['/admin/maintenance', 'maintenance'],
    ['/admin/diagnostics', 'diagnostics'],
    ['/admin/rbac', 'rbac'],
    ['/admin/branding', 'branding'],
    ['/admin/information', 'information'],
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

  it.each([['/admin-session'], ['/credential'], ['/scheduler'], ['/rbac']])(
    'is true on the legacy unprefixed admin path %s (pathname fallback)',
    (path) => {
      renderAt(path, [{ path, element: <Probe /> }]);
      expect(screen.getByTestId('probe')).toHaveTextContent('true');
    },
  );

  it.each([
    ['/project/default/data', { scope: 'project', menuKey: 'data' }],
    [
      '/project/default/admin/deployments/dep-1',
      { scope: 'projectAdmin', menuKey: 'project-admin-deployments' },
    ],
    [
      '/project/default/admin/users',
      {
        scope: 'projectAdmin',
        menuKey: 'project-admin-users',
      },
    ],
    // The only excluded admin page: it still reads the ambient project.
    ['/admin/dashboard', { scope: 'admin', menuKey: 'admin-dashboard' }],
  ])('is false on the project-dependent route %s', (path, handle) => {
    renderAt(path, [{ path, element: <Probe />, handle }]);
    expect(screen.getByTestId('probe')).toHaveTextContent('false');
  });
});
