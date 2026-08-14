/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the FR-3414 gating of the globally-mounted "no resource group in
 * this project" banner: it is a project-scoped warning, so it must never
 * render on the project-agnostic routes, and keep its existing behavior
 * (render only when the project has no resource group) elsewhere.
 */
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import NoResourceGroupAlert from './NoResourceGroupAlert';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { type MockedFunction, describe, expect, it, vi } from 'vitest';

// Drive the resource-group source directly; the derivation chain behind it is
// not under test.
vi.mock('../hooks/useCurrentProject', () => ({
  useCurrentResourceGroupValue: vi.fn(),
}));

// Deterministic translations: assert on the raw key. Partial mock — BAIAlert
// (backend.ai-ui) pulls `initReactI18next` from the same module at import
// time, so the rest of the module must stay real.
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const mockedUseCurrentResourceGroupValue =
  useCurrentResourceGroupValue as unknown as MockedFunction<
    () => string | null
  >;

const ALERT_TEXT = 'resourceGroup.NoScalingGroupAssignedToThisProject';

const renderAt = (path: string, handle?: Record<string, unknown>) => {
  const router = createMemoryRouter(
    [{ path, element: <NoResourceGroupAlert />, handle }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
};

describe('NoResourceGroupAlert (FR-3414 project-agnostic gating)', () => {
  it('renders on a general page when the project has no resource group', () => {
    mockedUseCurrentResourceGroupValue.mockReturnValue(null);
    renderAt('/project/default/session', {
      scope: 'project',
      menuKey: 'session',
    });
    expect(screen.getByText(ALERT_TEXT)).toBeInTheDocument();
  });

  it('renders nothing on a general page when a resource group exists', () => {
    mockedUseCurrentResourceGroupValue.mockReturnValue('default');
    renderAt('/project/default/session', {
      scope: 'project',
      menuKey: 'session',
    });
    expect(screen.queryByText(ALERT_TEXT)).not.toBeInTheDocument();
  });

  it.each([
    ['/admin/session', 'admin-session'],
    ['/admin/deployments', 'admin-deployments'],
    ['/admin/data', 'admin-data'],
    // Widened in FR-3414 — note `credential` lives at `/admin/users`.
    ['/admin/users', 'credential'],
    ['/admin/scheduler', 'scheduler'],
    ['/admin/maintenance', 'maintenance'],
    ['/admin/diagnostics', 'diagnostics'],
    ['/admin/branding', 'branding'],
    // Widened in FR-3415 — both now have explicit in-page project selection.
    ['/admin/environment', 'environment'],
    ['/admin/reservoir', 'reservoir'],
  ])(
    'renders nothing on the project-agnostic route %s even without a resource group',
    (path, menuKey) => {
      mockedUseCurrentResourceGroupValue.mockReturnValue(null);
      renderAt(path, { scope: 'admin', menuKey });
      expect(screen.queryByText(ALERT_TEXT)).not.toBeInTheDocument();
    },
  );

  it('still renders on the one admin page that depends on the ambient project', () => {
    mockedUseCurrentResourceGroupValue.mockReturnValue(null);
    renderAt('/admin/dashboard', {
      scope: 'admin',
      menuKey: 'admin-dashboard',
    });
    expect(screen.getByText(ALERT_TEXT)).toBeInTheDocument();
  });
});
