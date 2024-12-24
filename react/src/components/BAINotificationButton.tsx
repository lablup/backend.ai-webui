import {
  useBAINotificationEffect,
  useBAINotificationState,
} from '../hooks/useBAINotification';
import ReverseThemeProvider from './ReverseThemeProvider';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Typography } from 'antd';
import type { ButtonProps } from 'antd';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';
import React, { useEffect } from 'react';

export const isOpenDrawerState = atom(false);

const BAINotificationButton: React.FC<ButtonProps> = ({ ...props }) => {
  const [notifications, { upsertNotification }] = useBAINotificationState();
  useBAINotificationEffect();

  const [isOpenDrawer, setIsOpenDrawer] = useAtom(isOpenDrawerState);
  useEffect(() => {
    const handler = (e: any) => {
      upsertNotification(e.detail);
    };
    document.addEventListener('add-bai-notification', handler);
    return () => {
      document.removeEventListener('add-bai-notification', handler);
    };
  }, [upsertNotification]);

  const hasRunningBackgroundTask = _.some(notifications, (n) => {
    return n.backgroundTask?.status === 'pending';
  });

  // To match complicated theme in WebUIHeader, we need to wrap the icon with nested `ReverseThemeProvider`.
  return (
    <>
      <ReverseThemeProvider>
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
      </ReverseThemeProvider>
      <WEBUINotificationDrawer
        open={isOpenDrawer}
        onClose={() => setIsOpenDrawer((v) => !v)}
      />
    </>
  );
};

export default BAINotificationButton;
