/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `AstryxAdminTheme` applies through a wrapper element, so a portalled modal is
 no longer its DOM descendant. Theme CSS is `@scope`d to `[data-astryx-theme]`,
 which makes the nearest such ancestor the whole measurement (FR-3578 T7).
*/
import { ThemeModeProvider } from '../hooks/useThemeMode';
import AstryxAdminTheme from './AstryxAdminTheme';
import AstryxBrandTheme from './AstryxBrandTheme';
import { resolveRoleTheme } from './resolveRoleTheme';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { MediaTheme } from '@astryxdesign/core/theme';
import { render, screen } from '@testing-library/react';
import { BAIDialog } from 'backend.ai-ui';
import { describe, expect, it, vi } from 'vitest';

// `useCustomThemeConfig` reaches into `useBAISetting`, which drags in
// `DefaultProviders` and the whole app graph. Same shim as
// `useCustomThemeConfig.test.tsx`.
vi.mock('../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [undefined, vi.fn()],
}));

const brandName = resolveRoleTheme(undefined, 'brand').name;
const adminName = resolveRoleTheme(undefined, 'admin').name;

const modalBody = (
  <Layout
    header={<DialogHeader title="Admin modal" />}
    content={<LayoutContent>body</LayoutContent>}
  />
);

const renderInAdminRegion = (children: React.ReactNode) =>
  render(
    <ThemeModeProvider>
      <AstryxBrandTheme mode="light">
        <AstryxAdminTheme>
          <span data-testid="in-region">admin region</span>
          {children}
        </AstryxAdminTheme>
      </AstryxBrandTheme>
    </ThemeModeProvider>,
  );

const nearestThemeOf = (node: Element | null) =>
  node?.closest('[data-astryx-theme]')?.getAttribute('data-astryx-theme') ??
  null;

describe('nested Astryx theme across a portal', () => {
  it('gives brand and admin distinct theme names', () => {
    expect(adminName).not.toBe(brandName);
  });

  it('syncs the ROOT theme onto <html>, which is what a portal would fall back to', () => {
    renderInAdminRegion(null);

    expect(nearestThemeOf(screen.getByTestId('in-region'))).toBe(adminName);
    expect(document.documentElement.getAttribute('data-astryx-theme')).toBe(
      brandName,
    );
  });

  it('kept the admin theme by DOM ancestry while the dialog was non-portalled', () => {
    renderInAdminRegion(
      <Dialog isOpen onOpenChange={vi.fn()} aria-label="Native dialog">
        {modalBody}
      </Dialog>,
    );

    expect(
      nearestThemeOf(screen.getByRole('dialog', { name: 'Native dialog' })),
    ).toBe(adminName);
  });

  it('keeps a portalled modal on the admin theme it was opened from', () => {
    renderInAdminRegion(
      <BAIDialog isOpen onOpenChange={vi.fn()}>
        {modalBody}
      </BAIDialog>,
    );

    expect(
      nearestThemeOf(screen.getByRole('dialog', { name: 'Admin modal' })),
    ).toBe(adminName);
  });

  it('escapes a MediaTheme band instead of inheriting its on-dark tokens', () => {
    renderInAdminRegion(
      <MediaTheme mode="dark">
        <BAIDialog isOpen onOpenChange={vi.fn()}>
          {modalBody}
        </BAIDialog>
      </MediaTheme>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Admin modal' });
    expect(dialog.closest('[data-astryx-media]')).toBeNull();
    expect(nearestThemeOf(dialog)).toBe(adminName);
  });
});
