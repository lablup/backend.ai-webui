/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAINotificationState } from '../hooks/useBAINotification';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import ReverseThemeProvider from './ReverseThemeProvider';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip, Typography, type ButtonProps } from 'antd';
import { BAIText } from 'backend.ai-ui';
import { t } from 'i18next';
import { atom, useAtom } from 'jotai';
import * as _ from 'lodash-es';
import React from 'react';

export const isOpenDrawerState = atom(false);

// Pure UI: badge + drawer toggle. Notification event handling and toast
// rendering live in the app-wide <NotificationHost /> (DefaultProviders),
// which stays mounted regardless of authentication state.
const BAINotificationButton: React.FC<ButtonProps> = ({ ...props }) => {
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

  // To match complicated theme in WebUIHeader, we need to wrap the icon with nested `ReverseThemeProvider`.
  return (
    <>
      <ReverseThemeProvider>
        <Tooltip
          title={
            <>
              {t('notification.Notifications')}{' '}
              <BAIText keyboardWithLightBorder>{']'}</BAIText>
            </>
          }
          placement="left"
        >
          <Button
            icon={
              <ReverseThemeProvider>
                <Badge color="red" dot={hasRunningBackgroundTask}>
                  <ReverseThemeProvider>
                    <Typography.Text>
                      <BellOutlined />
                    </Typography.Text>
                  </ReverseThemeProvider>
                </Badge>
              </ReverseThemeProvider>
            }
            type="text"
            onClick={() => setIsOpenDrawer((v) => !v)}
            {...props}
          />
        </Tooltip>
      </ReverseThemeProvider>
      <WEBUINotificationDrawer
        open={isOpenDrawer}
        onClose={() => setIsOpenDrawer((v) => !v)}
      />
    </>
  );
};

export default BAINotificationButton;
