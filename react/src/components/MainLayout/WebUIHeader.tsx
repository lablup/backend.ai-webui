/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useIsProjectAgnosticPage } from '../../hooks/useIsProjectAgnosticPage';
import { useThemeMode } from '../../hooks/useThemeMode';
import { theme, useBAIBreakpoint } from '../../theme-shim';
import BAINotificationButton from '../BAINotificationButton';
import LoginSessionExtendButton from '../LoginSessionExtendButton';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import { spotlightOpenAtom } from '../WebUISpotlight/WebUISpotlight';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
import './WebUIHeader.css';
import WebUIHeaderProjectSelect from './WebUIHeaderProjectSelect';
import { IconButton } from '@astryxdesign/core/IconButton';
import { MediaTheme } from '@astryxdesign/core/theme';
import {
  ANTD_REVERSED_BAND_OVERLAYS,
  BAIFlex,
  BAIFlexProps,
} from 'backend.ai-ui';
import { useSetAtom } from 'jotai';
import { MenuIcon, SearchIcon } from 'lucide-react';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

export interface WebUIHeaderProps extends BAIFlexProps {
  onClickMenuIcon?: () => void;
}

const WebUIHeader: React.FC<WebUIHeaderProps> = ({ onClickMenuIcon }) => {
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const setSpotlightOpen = useSetAtom(spotlightOpenAtom);
  // The brand band is a REVERSED surface: its content polarity is the opposite
  // of the app's, so it is "on dark" in light mode and "on light" in dark.
  const bandMediaMode = isDarkMode ? 'light' : 'dark';
  const bandOverlays =
    ANTD_REVERSED_BAND_OVERLAYS[isDarkMode ? 'dark' : 'light'];
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  // RESPONSIVE-POLICY R3: `Grid.useBreakpoint()` → theme-shim hook.
  const gridBreakpoint = useBAIBreakpoint();
  // FR-3414 (ADR-0001): the project-agnostic pages operate above project
  // scope, so the header's current-project selector (and the selector-bound
  // admin-exit confirm flow inside it) is not mounted there at all. Nothing
  // then reads or writes the current-project atom from the header on those
  // routes — leaving admin restores the previous selection untouched. The
  // header layout keeps `justify="between"`, so the left slot simply
  // collapses (no placeholder needed); the mobile menu button stays.
  const isProjectAgnosticPage = useIsProjectAgnosticPage();

  return (
    <BAIFlex
      data-testid="webui-header"
      align="center"
      justify="between"
      direction="row"
      style={{
        height: token.Layout?.headerHeight || 60,
        backgroundColor: token.Layout?.headerBg,
        paddingRight: token.marginLG,
        paddingLeft: token.marginLG,
        // The inherited colour for band content that declares none of its own
        // (bare `currentColor` glyphs). Inverts with the app mode, like the
        // `MediaTheme`s below.
        color: isDarkMode ? 'var(--color-on-light)' : 'var(--color-on-dark)',
        // Declared HERE, outside the `MediaTheme`s, and indexed in JS: the pair
        // must resolve against the APP scheme, but a custom property holding
        // `light-dark(a, b)` is substituted at USE time by consumers that sit
        // inside a forced-scheme subtree (measured, QA-FINDINGS Q-20).
        ...bandOverlays,
      }}
      className="bai-webui-header"
    >
      <BAIFlex data-testid="label-selector-project" direction="row" gap={'sm'}>
        {/* `MediaTheme` declares the SURFACE LUMINANCE its content sits on —
            not a theme flip — so it maps `--color-text-primary` /
            `--color-icon-primary` onto `--color-on-{dark,light}`. It renders
            `display: contents`, so it costs no layout. */}
        <MediaTheme mode={bandMediaMode}>
          {!gridBreakpoint.sm && (
            <IconButton
              icon={<MenuIcon size="1em" />}
              variant="ghost"
              label={t('webui.menu.Menu')}
              onClick={() => {
                onClickMenuIcon?.();
              }}
              className="non-draggable"
              style={{
                marginLeft: token.marginSM * -1,
              }}
            />
          )}
        </MediaTheme>
        {!isProjectAgnosticPage && (
          <Suspense>
            <WebUIHeaderProjectSelect />
          </Suspense>
        )}
      </BAIFlex>
      <BAIFlex
        direction="row"
        className="non-draggable"
        gap="xxs"
        align="center"
      >
        {baiClient.supports('extend-login-session') &&
          baiClient._config.enableExtendLoginSession && (
            <Suspense>
              <LoginSessionExtendButton data-testid="button-extend-login-session" />
              {/* PILOT-DECISION: the antd `Divider orientation="vertical"`
                  here was painted `borderColor: 'transparent'` — i.e. it was
                  a SPACER, not a rule. Astryx `Divider` has no colour prop
                  (closed enums, P5), so the spacer is expressed as spacing
                  instead of a hidden rule. */}
              {gridBreakpoint.md && <span style={{ width: token.marginXS }} />}
            </Suspense>
          )}
        {/* `BAINotificationButton` scopes its own on-dark context to its
            button, because it also owns a `Tooltip` whose panel is an inline
            sibling — see that file. */}
        <BAINotificationButton data-testid="button-notification" />
        {/* Same swap, same reason as the project group above: these controls
            sit ON the accent band, so they take the on-dark media context and
            their glyphs come out white instead of the dark theme's grey.
            Both are plain `IconButton`s — they open no floating surface, so a
            shared wrapper has nothing to leak into. */}
        <MediaTheme mode={bandMediaMode}>
          <IconButton
            data-testid="button-spotlight"
            icon={<SearchIcon size="1em" />}
            variant="ghost"
            label={t('spotlight.Search')}
            onClick={() => setSpotlightOpen(true)}
          />
          <WebUIThemeToggleButton data-testid="button-theme" />
          <WEBUIHelpButton data-testid="button-help" />
        </MediaTheme>
        {/* `UserDropdownMenu` declares its OWN on-dark context, on just the
            trigger button.

            It used to sit inside the `MediaTheme` above. Astryx renders both
            the popover panel and the component's three `Dialog`s as inline
            siblings/descendants rather than through a portal (measured), so a
            wrapper here reached all of them: the modals painted as dark
            surfaces in LIGHT mode, and the dropdown panel stayed dark in both
            modes. Scoping the context to the trigger element is therefore the
            component's own business, not the header's — see
            `UserDropdownMenu.tsx`. */}
        <UserDropdownMenu
          style={{
            marginLeft: token.marginXXS,
            marginRight: token.marginSM * -1,
            paddingLeft: token.paddingSM,
            paddingRight: token.paddingSM,
          }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default WebUIHeader;
