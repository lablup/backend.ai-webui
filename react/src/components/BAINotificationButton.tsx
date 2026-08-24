/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAINotificationState } from '../hooks/useBAINotification';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import { useThemeMode } from '../hooks/useThemeMode';
import './BAINotificationButton.css';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { MediaTheme } from '@astryxdesign/core/theme';
import { BAIBadgeCount } from 'backend.ai-ui';
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
  const { isDarkMode } = useThemeMode();

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

  // TRAP (measured, twice). `Tooltip` and the drawer render as inline SIBLINGS
  // of the trigger, not through a portal, so a `MediaTheme` wrapper reaches
  // their panels too — that pinned `color-scheme: dark` on the tooltip in both
  // app modes and gave white text on a white bubble.
  //
  // So the band context sits on the trigger BUTTON via `data-astryx-media`
  // (MediaTheme's own mechanism, at element scope), and only the tooltip
  // CONTENT is wrapped. That content's `mode="dark"` is CONSTANT, not the
  // app's opposite: `ANTD_HOVER_PARITY` pins the bubble to `colorBgSpotlight`
  // (`rgba(0,0,0,0.85)` / `#424242`), dark in BOTH schemes. QA-FINDINGS Q-10.
  const bandMediaMode = isDarkMode ? 'light' : 'dark';

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
            `BAIBadgeCount`; antd `color="red"` becomes
            `variant="error"` (the closed-enum equivalent). */}
        <IconButton
          // `data-astryx-media` IS `MediaTheme`'s whole mechanism, applied at
          // element scope so the sibling tooltip panel cannot inherit it.
          data-astryx-media={bandMediaMode}
          variant="ghost"
          label={t('notification.Notifications')}
          icon={
            <BAIBadgeCount
              // The band's inversion stops at the overlay — see the .css.
              className="bai-notification-badge"
              hasDot={hasRunningBackgroundTask}
              variant="error"
              title={t('notification.Notifications')}
            >
              {/* On the glyph itself, not just the button: the badge wrapper
                  declares its own `color`, so it intercepts inheritance before
                  the icon sees it. `MediaTheme` remaps the token above. */}
              <Bell size="1em" style={{ color: 'var(--color-icon-primary)' }} />
            </BAIBadgeCount>
          }
          onClick={() => setIsOpenDrawer((v) => !v)}
          {...props}
          style={{ color: 'var(--color-icon-primary)', ...props.style }}
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
