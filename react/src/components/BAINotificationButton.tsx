import {
  useBAINotificationEffect,
  useBAINotificationState,
} from '../hooks/useBAINotification';
import ReverseThemeProvider from './ReverseThemeProvider';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip, Typography, type ButtonProps } from 'antd';
import { BAIText } from 'backend.ai-ui';
import { t } from 'i18next';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';
import React, { useEffect } from 'react';
import useKeyboardShortcut, {
  useKeyboardShortcutTextStyles,
} from 'src/hooks/useKeyboardShortcut';

export const isOpenDrawerState = atom(false);

const BAINotificationButton: React.FC<ButtonProps> = ({ ...props }) => {
  const { styles } = useKeyboardShortcutTextStyles();
  const [notifications, { upsertNotification, clearNotification }] =
    useBAINotificationState();
  useBAINotificationEffect();

  const [isOpenDrawer, setIsOpenDrawer] = useAtom(isOpenDrawerState);
  useEffect(() => {
    const addNotificationHandler = (e: any) => {
      upsertNotification(e.detail);
    };
    const clearNotificationHandler = (e: any) => {
      clearNotification(e.detail.key);
    };
    document.addEventListener('add-bai-notification', addNotificationHandler);
    document.addEventListener(
      'clear-bai-notification',
      clearNotificationHandler,
    );
    return () => {
      document.removeEventListener(
        'add-bai-notification',
        addNotificationHandler,
      );
      document.removeEventListener(
        'clear-bai-notification',
        clearNotificationHandler,
      );
    };
  }, [upsertNotification, clearNotification]);

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
              <BAIText
                code
                className={styles.shortcutText}
                style={{
                  color: 'inherit',
                }}
              >
                {']'}
              </BAIText>
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
