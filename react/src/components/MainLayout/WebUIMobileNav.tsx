/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxReverseTheme } from '../../astryx-theme';
import { useThemeMode } from '../../hooks/useThemeMode';
import { SIDER_WIDTH } from '../BAISider';
import './WebUIMobileNav.css';
import { useSiderThemeReversed } from './WebUISider';
import WebUISiderFooter from './WebUISiderFooter';
import WebUISiderLogo from './WebUISiderLogo';
import WebUISiderNavigation from './WebUISiderNavigation';
import { MobileNav } from '@astryxdesign/core/MobileNav';
import { SideNavRenderContext } from '@astryxdesign/core/SideNav';
import { VStack } from '@astryxdesign/core/Stack';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  // Same rule as the header band's right-side buttons (WebUIHeader): the
  // brand band is a REVERSED surface, so its content is on-dark in light
  // mode and on-light in dark mode.
  const { isDarkMode } = useThemeMode();

  const drawer = (
    <MobileNav
      data-testid="webui-mobile-nav"
      className={classNames(
        'webui-mobile-nav',
        isDarkMode ? 'webui-mobile-nav--on-light' : 'webui-mobile-nav--on-dark',
      )}
      label={t('webui.menu.Menu')}
      // The rail's own width, so a menu row is the same size on both surfaces
      // (MobileNav's own default is 320px).
      width={SIDER_WIDTH}
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
          re-tapping the current page).

          `bai-nav-surface` opts this menu into the nav metrics the rail
          defines (BAISider.css) — pill radius, group-heading size and indent —
          which are otherwise `.bai-sider`-scoped. `gap={0}`: a stack gap here
          lands BETWEEN the menu's own sections and stretches the row pitch
          past the rail's 44px; the footer brings its own divider and spacing. */}
      <SideNavRenderContext value="drawer-content">
        <VStack className="bai-nav-surface" align="stretch" gap={0}>
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
