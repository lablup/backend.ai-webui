/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ThemeModeProvider } from '../hooks/useThemeMode';
import AstryxAdminTheme from './AstryxAdminTheme';
import AstryxBrandTheme from './AstryxBrandTheme';
import AstryxReverseTheme from './AstryxReverseTheme';
import { resolveRoleTheme } from './resolveRoleTheme';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Same shim as `nestedThemePortal.test.tsx`.
vi.mock('../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [undefined, vi.fn()],
}));

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

/** Theme names some element carries while no injected `<style>` holds their CSS. */
const themesInUseWithoutCss = () => {
  const inUse = new Set(
    [...document.querySelectorAll('div[data-astryx-theme]')].map((element) =>
      element.getAttribute('data-astryx-theme'),
    ),
  );
  return [...inUse].filter(
    (name) => !document.querySelector(`style[data-astryx-theme="${name}"]`),
  );
};

describe('theme CSS of the shell', () => {
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
});
