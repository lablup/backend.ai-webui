import {
  useBAINotificationEffect,
  useBAINotificationState,
} from '../hooks/useBAINotification';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button } from 'antd';
import type { ButtonProps } from 'antd';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';
import React, { useEffect } from 'react';

interface Props extends ButtonProps {
  iconColor?: string;
}
export const isOpenDrawerState = atom(false);

const BAINotificationButton: React.FC<Props> = ({ ...props }) => {
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
  return (
    <>
      <Button
        size="large"
        icon={
          <Badge dot={hasRunningBackgroundTask}>
            <BellOutlined style={{ color: props.iconColor ?? 'inherit' }} />
          </Badge>
        }
        type="text"
        onClick={() => setIsOpenDrawer((v) => !v)}
        {...props}
      />
      <WEBUINotificationDrawer
        open={isOpenDrawer}
        onClose={() => setIsOpenDrawer((v) => !v)}
      />
    </>
  );
};

export default BAINotificationButton;
