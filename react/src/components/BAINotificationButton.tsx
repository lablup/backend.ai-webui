/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAINotificationState } from '../hooks/useBAINotification';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import BAIBadgeCountAstryx from './astryx-bui/BAIBadgeCountAstryx';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { MediaTheme } from '@astryxdesign/core/theme';
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

  // TRAP (measured, twice). `MediaTheme` must wrap the tooltip CONTENT, never
  // the whole `Tooltip`: `Tooltip` renders trigger and `[popover]` panel as
  // SIBLINGS, so wrapping it pinned `color-scheme: dark` on the panel in both
  // app modes and Astryx's inverted tooltip surface then resolved to WHITE —
  // white on white (`bg rgb(255,255,255)` / `color rgb(255,255,255)`).
  // The mode is the CONSTANT "dark", not the opposite of the app's:
  // `ANTD_HOVER_PARITY` pins the bubble to `colorBgSpotlight`
  // (`rgba(0,0,0,0.85)` / `#424242`), dark in BOTH schemes. QA-FINDINGS Q-10.
  //
  // The band's on-dark context sits on the trigger BUTTON via
  // `data-astryx-media` (MediaTheme's own mechanism, at element scope) so the
  // sibling panel does not inherit it; `WEBUINotificationDrawer` stays outside
  // for the same reason — Astryx overlays are inline siblings, not portalled.
  return (
    <>
      {/* antd `Tooltip title` -> `content`; `placement="left"` -> `"start"`
          (Astryx uses logical placements — MAPPING §4). */}
      <Tooltip
        content={
          <MediaTheme mode="dark">
            {t('notification.Notifications')} <Kbd keys="]" />
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
