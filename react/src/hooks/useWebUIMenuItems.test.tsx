/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Role matrix of the admin menu's Dashboard entry (#10583): first item for a
 * superadmin (`/admin/dashboard`) and for the current project's project admin
 * (`/project/:name/admin/dashboard`), absent for domain admins and users.
 */
import type { EffectiveAdminRole } from './useCurrentUserProjectRoles';
import { useWebUIMenuItems } from './useWebUIMenuItems';
import { renderHook } from '@testing-library/react';
import type React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

let mockUserRole: string = 'user';
let mockEffectiveAdminRole: EffectiveAdminRole = 'none';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({
    _config: { hideAgents: true, blockList: [], inactiveList: [] },
  }),
}));

vi.mock('./backendai', () => ({
  useCurrentUserRole: () => mockUserRole,
}));

vi.mock('./useCurrentUserProjectRoles', () => ({
  useEffectiveAdminRole: () => mockEffectiveAdminRole,
}));

vi.mock('./useAutoDiagnostics', () => ({
  useDiagnosticsBadgeSeverity: () => null,
}));

vi.mock('./useBAISetting', () => ({
  useBAISettingUserState: () => [false, vi.fn()],
}));

vi.mock('./useCustomThemeConfig', () => ({
  useCustomThemeConfig: () => ({ rawThemeConfig: null }),
}));

vi.mock('./useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('./useRouteScope')>();
  return {
    ...originalModule,
    useActiveProjectName: () => 'alpha',
    useCurrentMenuKey: () => 'session',
  };
});

vi.mock('./useWebUIPluginState', () => ({
  useWebUIPluginValue: () => ({}),
  useWebUIPluginLoadedValue: () => true,
}));

vi.mock('@lablup/ui-common/theme', () => ({
  useTheme: () => ({ token: () => '' }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/project/alpha/session']}>
    {children}
  </MemoryRouter>
);

const renderMenu = (userRole: string, adminRole: EffectiveAdminRole) => {
  mockUserRole = userRole;
  mockEffectiveAdminRole = adminRole;
  return renderHook(() => useWebUIMenuItems(), { wrapper }).result.current;
};

describe('useWebUIMenuItems admin dashboard entry', () => {
  it('is the superadmin first admin item, at /admin/dashboard', () => {
    const { adminMenu, firstAvailableAdminMenuItem } = renderMenu(
      'superadmin',
      'superadmin',
    );
    expect(adminMenu[0]).toMatchObject({
      key: 'admin-dashboard',
      to: '/admin/dashboard',
    });
    expect(firstAvailableAdminMenuItem?.to).toBe('/admin/dashboard');
    // Superadmins still do not see the other project-admin pages.
    expect(adminMenu.map((item) => item.key)).not.toContain(
      'project-admin-users',
    );
  });

  it('is the project admin first admin item, at the URL project', () => {
    const {
      adminMenu,
      firstAvailableAdminMenuItem,
      firstAvailableProjectAdminMenuKey,
    } = renderMenu('user', 'currentProjectAdmin');
    expect(adminMenu[0]).toMatchObject({
      key: 'admin-dashboard',
      to: '/project/alpha/admin/dashboard',
    });
    expect(firstAvailableAdminMenuItem?.to).toBe(
      '/project/alpha/admin/dashboard',
    );
    expect(firstAvailableProjectAdminMenuKey).toBe('admin-dashboard');
  });

  it('is hidden for a domain admin, who keeps the rest of the admin menu', () => {
    const { adminMenu, firstAvailableProjectAdminMenuKey } = renderMenu(
      'admin',
      'domainAdmin',
    );
    const keys = adminMenu.map((item) => item.key);
    expect(keys).not.toContain('admin-dashboard');
    expect(keys).toContain('admin-session');
    expect(firstAvailableProjectAdminMenuKey).toBe('project-admin-users');
  });

  it('is absent for a regular user, who has no admin menu', () => {
    const { adminMenu, firstAvailableAdminMenuItem } = renderMenu(
      'user',
      'none',
    );
    expect(adminMenu).toEqual([]);
    expect(firstAvailableAdminMenuItem).toBeNull();
  });
});
