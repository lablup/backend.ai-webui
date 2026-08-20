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

  const drawer = (
    <MobileNav
      data-testid="webui-mobile-nav"
      label={t('webui.menu.Menu')}
      // Pin the drawer to the start edge (where the rail lives) instead of
      // `auto`, whose trigger-position heuristic defaults to `end` when no
      // trigger position is readable.
      side="start"
      header={
        // The wordmark assets are brand-band artwork (white/near-black fills),
        // invisible on the drawer's plain surface — paint the same accent band
        // the rail's `.logo-and-text-container` provides.
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
