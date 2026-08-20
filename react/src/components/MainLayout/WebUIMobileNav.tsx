/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxReverseTheme } from '../../astryx-theme';
import './WebUIMobileNav.css';
import { useSiderThemeReversed } from './WebUISider';
import WebUISiderFooter from './WebUISiderFooter';
import WebUISiderLogo from './WebUISiderLogo';
import WebUISiderNavigation from './WebUISiderNavigation';
import { MobileNav } from '@astryxdesign/core/MobileNav';
import { SideNavRenderContext } from '@astryxdesign/core/SideNav';
import { VStack } from '@astryxdesign/core/Stack';
import { useTheme } from '@astryxdesign/core/theme';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * WCAG relative luminance of the resolved `--color-accent`, measured through
 * a throwaway probe element (custom properties may hold an unresolved
 * `light-dark()` pair; a computed `color` is always concrete rgb). Returns
 * which `on-*` context content sitting ON the band needs: luminance above the
 * 0.179 white-vs-black contrast midpoint → dark content, else light content.
 */
const measureAccentSurfaceMode = (
  // Unused directly — passing the resolved theme mode re-keys the React
  // Compiler's memoization of this call when the app theme flips (the accent
  // may be a light-dark() pair).
  _themeMode: string | undefined,
): 'dark' | 'light' => {
  if (typeof document === 'undefined') {
    return 'dark';
  }
  const probe = document.createElement('span');
  probe.style.color = 'var(--color-accent)';
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  const m = rgb.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!m) {
    return 'dark';
  }
  const [r, g, b] = [+m[1], +m[2], +m[3]].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? 'light' : 'dark';
};

/**
 * Below the mobile breakpoint, AppShell swaps the inline sider rail for this
 * drawer (FR-3612). `MobileNav` is a native `<dialog>` shown via
 * `showModal()`: focus trap, body scroll lock and backdrop come built in —
 * a strictly better phone UX than the old push-collapsed 74px rail. Open
 * state flows through AppShell's mobile context from `MainLayout`'s
 * `mobileNav` config.
 */
const WebUIMobileNav: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  // Match the rail: the operator's `sider.theme` polarity override applies to
  // the drawer's navigation surface too.
  const shouldReverse = useSiderThemeReversed();
  const { mode } = useTheme();
  const bandSurfaceMode = measureAccentSurfaceMode(mode);

  const drawer = (
    <MobileNav
      data-testid="webui-mobile-nav"
      className={classNames(
        'webui-mobile-nav',
        bandSurfaceMode === 'dark'
          ? 'webui-mobile-nav--on-dark'
          : 'webui-mobile-nav--on-light',
      )}
      label={t('webui.menu.Menu')}
      // Pin the drawer to the start edge (where the rail lives) instead of
      // `auto`, whose trigger-position heuristic defaults to `end` when no
      // trigger position is readable.
      side="start"
      header={
        <div className="webui-mobile-nav-brand">
          <WebUISiderLogo />
        </div>
      }
    >
      {/* `drawer-content` render mode makes every `SideNavItem` close the
          drawer on activation (the pathname-change reset in MainLayout only
          covers taps that navigate — not FastTrack's window.open item or
          re-tapping the current page). */}
      <SideNavRenderContext value="drawer-content">
        <VStack align="stretch" gap={4}>
          <WebUISiderNavigation />
          <WebUISiderFooter />
        </VStack>
      </SideNavRenderContext>
    </MobileNav>
  );

  return shouldReverse ? (
    <AstryxReverseTheme>{drawer}</AstryxReverseTheme>
  ) : (
    drawer
  );
};

export default WebUIMobileNav;
