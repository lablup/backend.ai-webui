/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BAIAppearanceConfig } from '../helper/customThemeConfig';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { ThemeModeProvider } from '../hooks/useThemeMode';
import AstryxAdminTheme from './AstryxAdminTheme';
import AstryxBrandTheme from './AstryxBrandTheme';
import AstryxReverseTheme from './AstryxReverseTheme';
import { resolveRoleTheme } from './resolveRoleTheme';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Same shim as `nestedThemePortal.test.tsx`.
vi.mock('../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [undefined, vi.fn()],
}));

// The appearance document the bootstrap "loaded"; none unless a test sets one.
const mockGetCustomTheme = vi.fn<() => BAIAppearanceConfig | undefined>();
vi.mock('../helper/customThemeConfig', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../helper/customThemeConfig')>();
  return {
    ...actual,
    getCustomTheme: () => mockGetCustomTheme(),
  };
});

const twoFamilies: BAIAppearanceConfig = {
  schemaVersion: 2,
  theme: {
    families: {
      default: { seeds: { accent: ['#112233', '#445566'] } },
      stained: { seeds: { accent: ['#8b5cf6', '#7c3aed'] } },
    },
  },
  branding: { logo: { src: '', srcCollapsed: '' } },
};

const brandName = resolveRoleTheme(undefined, 'brand').name;
const adminName = resolveRoleTheme(undefined, 'admin').name;

type ShellProps = {
  role: 'brand' | 'admin';
  hasReversedSider?: boolean;
  hasAdminMenu?: boolean;
};

// The theme providers of the shell: the reversed sider (`theme.siderMode`) and
// the admin menu both leave the tree on a narrow viewport.
const Shell = ({ role, hasReversedSider, hasAdminMenu }: ShellProps) => (
  <ThemeModeProvider>
    <AstryxBrandTheme mode="light" role={role}>
      <span>header</span>
      {hasReversedSider && (
        <AstryxReverseTheme>
          <span>sider</span>
        </AstryxReverseTheme>
      )}
      {hasAdminMenu && (
        <AstryxAdminTheme>
          <span>admin menu</span>
        </AstryxAdminTheme>
      )}
    </AstryxBrandTheme>
  </ThemeModeProvider>
);

const themesInUse = () => [
  ...new Set(
    [...document.querySelectorAll('div[data-astryx-theme]')].map((element) =>
      element.getAttribute('data-astryx-theme'),
    ),
  ),
];

/** Theme names some element carries while no injected `<style>` holds their CSS. */
const themesInUseWithoutCss = () => {
  return themesInUse().filter(
    (name) => !document.querySelector(`style[data-astryx-theme="${name}"]`),
  );
};

describe('theme CSS of the shell', () => {
  afterEach(() => {
    localStorage.clear();
    mockGetCustomTheme.mockReset();
  });

  it('uses runtime themes here, so the injected CSS is what is measured', () => {
    expect(adminName).not.toBe(brandName);
    expect(
      (resolveRoleTheme(undefined, 'brand') as { __built?: boolean }).__built,
    ).toBeFalsy();
  });

  it('gives the whole app the admin theme when the role is admin', () => {
    render(<Shell role="admin" />);
    expect(document.documentElement.getAttribute('data-astryx-theme')).toBe(
      adminName,
    );
  });

  it('keeps the CSS of every theme in use across console switches and providers leaving', () => {
    const view = render(<Shell role="brand" hasReversedSider />);
    expect(themesInUseWithoutCss()).toEqual([]);

    // User console -> system admin console.
    view.rerender(<Shell role="admin" hasReversedSider hasAdminMenu />);
    expect(themesInUseWithoutCss()).toEqual([]);

    // Narrow viewport in the admin console: the sider and its menu unmount.
    view.rerender(<Shell role="admin" />);
    expect(themesInUseWithoutCss()).toEqual([]);

    // Back to the user console, sider restored.
    view.rerender(<Shell role="brand" hasReversedSider />);
    expect(themesInUseWithoutCss()).toEqual([]);

    // Narrow viewport in the user console.
    view.rerender(<Shell role="brand" />);
    expect(themesInUseWithoutCss()).toEqual([]);
  });
  it('keeps the CSS when the family changes under every provider at once', () => {
    mockGetCustomTheme.mockReturnValue(twoFamilies);
    const FamilySwitch = () => {
      const { setActiveThemeFamily } = useCustomThemeConfig();
      return (
        <button onClick={() => setActiveThemeFamily('stained')}>stained</button>
      );
    };
    render(
      <ThemeModeProvider>
        <AstryxBrandTheme mode="light" role="admin">
          <AstryxReverseTheme>
            <span>sider</span>
          </AstryxReverseTheme>
          <AstryxAdminTheme>
            <span>admin menu</span>
          </AstryxAdminTheme>
          <FamilySwitch />
        </AstryxBrandTheme>
      </ThemeModeProvider>,
    );
    const defaultFamilyThemes = themesInUse();
    expect(themesInUseWithoutCss()).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'stained' }));

    expect(themesInUse()).toHaveLength(defaultFamilyThemes.length);
    expect(
      themesInUse().filter((name) => defaultFamilyThemes.includes(name)),
    ).toEqual([]);
    expect(themesInUseWithoutCss()).toEqual([]);
  });
});
