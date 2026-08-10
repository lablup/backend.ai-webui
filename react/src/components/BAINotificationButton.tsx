/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAINotificationState } from '../hooks/useBAINotification';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import { useThemeMode } from '../hooks/useThemeMode';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import BAIBadgeCountAstryx from './astryx-bui/BAIBadgeCountAstryx';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { MediaTheme } from '@astryxdesign/core/theme';
import { BAIText } from 'backend.ai-ui';
import { t } from 'i18next';
import { atom, useAtom } from 'jotai';
import * as _ from 'lodash-es';
import { Bell } from 'lucide-react';
import React from 'react';

export const isOpenDrawerState = atom(false);

// Pure UI: badge + drawer toggle. Notification event handling and toast
// rendering live in the app-wide <NotificationHost /> (DefaultProviders),
// which stays mounted regardless of authentication state.
/**
 * PILOT-DECISION: the props no longer extend antd `ButtonProps` (P1 grep — the
 * single consumer, `WebUIHeader`, passes only `data-testid`). Astryx's
 * `IconButton` props are the natural base now that the render is one.
 */
type BAINotificationButtonProps = Pick<
  React.ComponentProps<typeof IconButton>,
  'style' | 'className' | 'isDisabled'
> & { 'data-testid'?: string };

const BAINotificationButton: React.FC<BAINotificationButtonProps> = ({
  ...props
}) => {
  const { isDarkMode } = useThemeMode();
  const [notifications] = useBAINotificationState();

  const [isOpenDrawer, setIsOpenDrawer] = useAtom(isOpenDrawerState);

  useKeyboardShortcut(
    (event) => {
      if (event.key === ']') {
        event.preventDefault();
        setIsOpenDrawer((v) => !v);
      }
    },
    {
      skipShortcutOnMetaKey: true,
    },
  );

  const hasRunningBackgroundTask = _.some(notifications, (n) => {
    return n.backgroundTask?.status === 'pending';
  });

  // This button only ever renders on `WebUIHeader`'s brand-accent band. The
  // three nested `ReverseThemeProvider`s here were the legacy way to force the
  // bell to the OPPOSITE polarity of the page so it read white on the orange —
  // but "opposite of the page" only coincides with white in light mode: in dark
  // mode the flip resolves to the LIGHT palette and painted the bell near-black
  // (measured `rgb(20,20,20)`) on a still-orange band.
  //
  // The band is a dark surface in BOTH modes, so the glyph is simply "on dark".
  // Naming that directly (`--color-on-dark`, `#ffffff` in both modes) drops two
  // of the three providers and the `Typography.Text` whose only job was to
  // supply a colour, and matches what `WebUIHeader` now does for the rest of
  // the band.
  //
  // The last provider is gone too (final switch). It was still an antd
  // `ConfigProvider`, and by then nothing under it was an antd component —
  // the tooltip, the button and the badge are all Astryx — so it re-themed
  // exactly nothing. `MediaTheme mode="dark"` is the live replacement and the
  // same primitive `WebUIHeader` wraps the sibling band controls
  // (`WebUIThemeToggleButton`, `WEBUIHelpButton`) in, so the tooltip panel now
  // matches theirs instead of following the page polarity.
  //
  // It wraps ONLY the trigger. `WEBUINotificationDrawer` stays outside on
  // purpose: Astryx renders overlays as inline siblings rather than through a
  // portal (measured — see `UserDropdownMenu.tsx`), so a drawer inside this
  // context would paint as a dark surface in light mode.
  //
  // ...and the TOOLTIP is such an overlay too. `Tooltip` renders
  // `<div display:contents>{trigger}</div>` and its `[popover]` panel as
  // SIBLINGS, so a `MediaTheme` wrapped around the whole `Tooltip` reached the
  // panel as well and pinned `color-scheme: dark` on it in BOTH app modes.
  // Astryx's tooltip surface is deliberately INVERTED (`light-dark()` the other
  // way round), so the forced dark scheme resolved it to WHITE while the
  // on-dark tokens painted the content `--color-on-dark` — white text on a
  // white tooltip, illegible in light *and* dark mode (measured
  // `bg rgb(255,255,255)` / `color rgb(255,255,255)`).
  //
  // So the on-dark context now sits on the trigger BUTTON itself
  // (`data-astryx-media="dark"` is exactly what `MediaTheme` renders — a
  // wrapper is only needed when several elements share the context), and the
  // tooltip CONTENT takes the opposite-of-app media mode, the same recipe
  // `SiderToggleButton` uses for its inverted tooltip.
  return (
    <>
      {/* antd `Tooltip title` -> `content`; `placement="left"` -> `"start"`
          (Astryx uses logical placements — MAPPING §4). */}
      <Tooltip
        content={
          <MediaTheme mode={isDarkMode ? 'light' : 'dark'}>
            {t('notification.Notifications')}{' '}
            <BAIText keyboardWithLightBorder>{']'}</BAIText>
          </MediaTheme>
        }
        placement="start"
      >
        {/* antd icon-only `Button type="text"` -> `IconButton
            variant="ghost"`, which requires the accessible name antd let
            this button ship without (P8). The `Badge dot` overlay is
            MAPPING §3.8's NONE branch, already self-built once as
            `BAIBadgeCountAstryx`; antd `color="red"` becomes
            `variant="error"` (the closed-enum equivalent). */}
        <IconButton
          // The band's on-dark context, scoped to this element instead of a
          // `MediaTheme` wrapper that the sibling tooltip panel would inherit.
          // `data-astryx-media` IS `MediaTheme`'s whole mechanism (it renders
          // `<div data-astryx-media={mode} style="display:contents">`; the
          // theme CSS keys the on-dark tokens off that attribute), so this is
          // the same primitive applied at element scope.
          data-astryx-media="dark"
          variant="ghost"
          label={t('notification.Notifications')}
          icon={
            <BAIBadgeCountAstryx
              hasDot={hasRunningBackgroundTask}
              variant="error"
              title={t('notification.Notifications')}
            >
              {/* On the glyph itself, not just the button: the overlay
                  wrapper declares its own `color`, so it intercepts
                  inheritance from the button before the icon sees it.
                  `Bell` strokes with `currentColor`. */}
              <Bell size="1em" style={{ color: 'var(--color-on-dark)' }} />
            </BAIBadgeCountAstryx>
          }
          onClick={() => setIsOpenDrawer((v) => !v)}
          {...props}
          style={{ color: 'var(--color-on-dark)', ...props.style }}
        />
      </Tooltip>
      <WEBUINotificationDrawer
        open={isOpenDrawer}
        onClose={() => setIsOpenDrawer((v) => !v)}
      />
    </>
  );
};

export default BAINotificationButton;
