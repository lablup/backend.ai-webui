/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectStartRedirect } from './legacyRedirects';
import { render, screen } from '@testing-library/react';
import {
  Outlet,
  RouterProvider,
  createMemoryRouter,
  useLocation,
} from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('./hooks')>();
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
          {
            path: '/project/:projectName/start',
            element: <ProjectStartRedirect />,
          },
          { path: '*', element: null },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  );
  return render(<RouterProvider router={router} />);
};

const importQuery = `?${new URLSearchParams({
  type: 'url',
  data: JSON.stringify({ url: 'https://github.com/a/b.ipynb' }),
})}`;

describe('the retired Start page redirects', () => {
  it('sends the project start URL to its dashboard with the import link', async () => {
    renderAt(`/project/team-nlp/start${importQuery}`);
    expect(await screen.findByTestId('location')).toHaveTextContent(
      `/project/team-nlp/dashboard${importQuery}`,
    );
  });

  it('keeps the legacy bare GitHub query', async () => {
    renderAt('/project/team-nlp/start?owner/repo/nb.ipynb');
    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/project/team-nlp/dashboard?owner/repo/nb.ipynb',
    );
  });
});
