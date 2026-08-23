/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  forgetNonSettingsLocation,
  rememberNonSettingsLocation,
} from '../helper/userSettingsModal';
import UserSettingsRouteRedirect from './UserSettingsRouteRedirect';
import { render, screen } from '@testing-library/react';
import {
  Outlet,
  RouterProvider,
  createMemoryRouter,
  useLocation,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    // `WebUINavigate` only calls this to wait for the client.
    useSuspendedBackendaiClient: () => ({}),
  };
});

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
};

// The probe sits in a layout route so it also reports locations that resolve
// back to `/usersettings` itself (the cold-deep-link case).
const renderAt = (initialEntry: string) => {
  const router = createMemoryRouter(
    [
      {
        element: (
          <>
            <LocationProbe />
            <Outlet />
          </>
        ),
        children: [
          { path: '/usersettings', element: <UserSettingsRouteRedirect /> },
          { path: '*', element: null },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  );
  return render(<RouterProvider router={router} />);
};

describe('UserSettingsRouteRedirect', () => {
  beforeEach(() => {
    forgetNonSettingsLocation();
  });

  it('converts a cold `?tab=` deep link into the settings param on its own route', async () => {
    renderAt('/usersettings?tab=logs');
    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/usersettings?settings=logs',
    );
  });

  it('defaults a bare visit to the general category', async () => {
    renderAt('/usersettings');
    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/usersettings?settings=general',
    );
  });

  it('reopens over the tracked background page, keeping its query string', async () => {
    rememberNonSettingsLocation({
      pathname: '/session',
      search: '?tab=running',
    });
    renderAt('/usersettings?tab=logs');
    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/session?tab=running&settings=logs',
    );
  });

  it('renders nothing once the param is already present, so it cannot loop', async () => {
    renderAt('/usersettings?settings=general');
    // Unchanged location: the opener owns the modal from here.
    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/usersettings?settings=general',
    );
  });
});
