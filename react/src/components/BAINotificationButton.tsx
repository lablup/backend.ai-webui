import { useWebUINotification } from '../hooks/useNotifiction';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Progress, Spin } from 'antd';
import type { ButtonProps } from 'antd';
import React, { useEffect } from 'react';

interface Props extends ButtonProps {}

const BAINotificationButton: React.FC<Props> = ({ ...props }) => {
  const app = App.useApp();
  const [, { addNotification, showWebUINotification, updateNotification }] =
    useWebUINotification();
  const [isOpenDrawer, { toggle: toggleDrawer }] = useToggle();

  useEffect(() => {
    const handler = (e: any) => {
      addNotification(e.detail);
    };
    document.addEventListener('add-bai-notification', handler);
    return () => {
      document.removeEventListener('add-bai-notification', handler);
    };
  }, [addNotification]);

  useEffect(() => {
    const handler = (e: any) => {
      showWebUINotification(e.detail);
    };
    document.addEventListener('show-bai-notification', handler);
    return () => {
      document.removeEventListener('show-bai-notification', handler);
    };
  }, [showWebUINotification]);

  useEffect(() => {
    const handler = (e: any) => {
      updateNotification(e.detail);
    };
    document.addEventListener('update-bai-notification', handler);
    return () => {
      document.removeEventListener('update-bai-notification', handler);
    };
  }, [updateNotification]);

  // handle webui-notification-indicator event
  // to show notification in antd notification
  // use app.notification.open directly to avoid duplicated item with useWebUINotification
  useEffect(() => {
    const handler = (
      e: CustomEvent<{
        key: string;
        set?: {
          value: number;
          text: string;
          mode: 'determinate' | 'indeterminate';
        };
        end?: {
          delay: number;
        };
      }>,
    ) => {
      if (e.detail.set) {
        app.notification.open({
          key: e.detail.key,
          message: e.detail.set.text,
          placement: 'bottomRight',
          description:
            e.detail.set.mode === 'determinate' ? (
              <Progress
                percent={Math.floor(e.detail.set.value)}
                showInfo={false}
              />
            ) : (
              <Spin />
            ),
          duration: 0,
        });
      } else if (e.detail.end) {
        setTimeout(() => {
          app.notification.destroy(e.detail.key);
        }, e.detail.end.delay);
      }
    };

    document.addEventListener(
      'webui-notification-indicator',
      handler as EventListener,
    );
    return () => {
      document.removeEventListener(
        'webui-notification-indicator',
        handler as EventListener,
      );
    };
  }, [app]);

  return (
    <>
      <Button
        size="large"
        icon={<BellOutlined />}
        type="text"
        onClick={toggleDrawer}
        {...props}
      />
      <WEBUINotificationDrawer open={isOpenDrawer} onClose={toggleDrawer} />
    </>
  );
};

export default BAINotificationButton;
