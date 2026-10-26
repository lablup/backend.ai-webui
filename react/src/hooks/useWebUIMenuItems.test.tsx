/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Role matrix of the Dashboard entry (#10583) under the split menus: first
 * item of a superadmin's system admin menu (`/admin/dashboard`) and of the
 * current project admin's Project Settings menu
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
let mockIsCurrentProjectAdmin = false;
let mockCurrentMenuKey = 'session';

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
  useIsCurrentProjectAdmin: () => mockIsCurrentProjectAdmin,
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
    useCurrentMenuKey: () => mockCurrentMenuKey,
  };
});

vi.mock('./useWebUIPluginState', () => ({
  useWebUIPluginValue: () => ({}),
  useWebUIPluginLoadedValue: () => true,
}));

vi.mock('@lablup/ui-common/theme', () => ({
  useTheme: () => ({ token: () => '' }),
}));

const renderMenu = (
  userRole: string,
  adminRole: EffectiveAdminRole,
  {
    isCurrentProjectAdmin = adminRole === 'currentProjectAdmin',
    path = '/project/alpha/session',
    menuKey = 'session',
  }: { isCurrentProjectAdmin?: boolean; path?: string; menuKey?: string } = {},
) => {
  mockUserRole = userRole;
  mockEffectiveAdminRole = adminRole;
  mockIsCurrentProjectAdmin = isCurrentProjectAdmin;
  mockCurrentMenuKey = menuKey;
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  );
  return renderHook(() => useWebUIMenuItems(), { wrapper }).result.current;
};

describe('useWebUIMenuItems dashboard entry', () => {
  it('starts the superadmin system admin menu, at /admin/dashboard', () => {
    const {
      adminMenu,
      firstAvailableAdminMenuItem,
      firstAvailableProjectAdminMenuItem,
    } = renderMenu('superadmin', 'superadmin');
    expect(adminMenu[0]).toMatchObject({
      key: 'admin-dashboard',
      to: '/admin/dashboard',
    });
    expect(firstAvailableAdminMenuItem?.to).toBe('/admin/dashboard');
    expect(adminMenu.map((item) => item.key)).not.toContain(
      'project-admin-users',
    );
    expect(firstAvailableProjectAdminMenuItem).toBeUndefined();
  });

  it('selects the system admin menu, not Project Settings, on /admin/dashboard', () => {
    const { isSelectedAdminCategoryMenu, isSelectedProjectAdminMenu } =
      renderMenu('superadmin', 'superadmin', {
        isCurrentProjectAdmin: true,
        path: '/admin/dashboard',
        menuKey: 'admin-dashboard',
      });
    expect(isSelectedAdminCategoryMenu).toBe(true);
    expect(isSelectedProjectAdminMenu).toBe(false);
  });

  it('starts Project Settings at the project dashboard for a superadmin who administers the project', () => {
    const { firstAvailableProjectAdminMenuItem, isSelectedProjectAdminMenu } =
      renderMenu('superadmin', 'superadmin', {
        isCurrentProjectAdmin: true,
        path: '/project/alpha/admin/dashboard',
        menuKey: 'admin-dashboard',
      });
    expect(firstAvailableProjectAdminMenuItem).toMatchObject({
      key: 'admin-dashboard',
      to: '/project/alpha/admin/dashboard',
    });
    expect(isSelectedProjectAdminMenu).toBe(true);
  });

  it('starts the project admin Project Settings menu, at the URL project', () => {
    const {
      firstAvailableProjectAdminMenuItem,
      firstAvailableProjectAdminMenuKey,
    } = renderMenu('user', 'currentProjectAdmin');
    expect(firstAvailableProjectAdminMenuItem).toMatchObject({
      key: 'admin-dashboard',
      to: '/project/alpha/admin/dashboard',
    });
    expect(firstAvailableProjectAdminMenuKey).toBe('admin-dashboard');
  });

  it('is absent from a domain admin system admin menu', () => {
    const {
      adminMenu,
      firstAvailableProjectAdminMenuKey,
      firstAvailableProjectAdminMenuItem,
    } = renderMenu('admin', 'domainAdmin');
    const keys = adminMenu.map((item) => item.key);
    expect(keys).not.toContain('admin-dashboard');
    expect(keys).toContain('admin-session');
    expect(firstAvailableProjectAdminMenuKey).toBe('project-admin-users');
    expect(firstAvailableProjectAdminMenuItem).toBeUndefined();
  });

  it('keeps a domain admin who administers the project on the project dashboard', () => {
    const { adminMenu, firstAvailableProjectAdminMenuItem } = renderMenu(
      'admin',
      'domainAdmin',
      { isCurrentProjectAdmin: true },
    );
    expect(adminMenu.map((item) => item.key)).not.toContain('admin-dashboard');
    expect(firstAvailableProjectAdminMenuItem).toMatchObject({
      key: 'admin-dashboard',
      to: '/project/alpha/admin/dashboard',
    });
  });

  it('is absent for a regular user, who has no admin menu', () => {
    const {
      adminMenu,
      firstAvailableAdminMenuItem,
      firstAvailableProjectAdminMenuItem,
    } = renderMenu('user', 'none');
    expect(adminMenu).toEqual([]);
    expect(firstAvailableAdminMenuItem).toBeNull();
    expect(firstAvailableProjectAdminMenuItem).toBeUndefined();
  });
});
