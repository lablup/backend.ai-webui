import { useWebUINotification } from '../hooks/useNotifiction';
import BAINotificationDrawer from './BAINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import React, { useEffect } from 'react';

interface Props extends ButtonProps {}

const BAINotificationButton: React.FC<Props> = ({ ...props }) => {
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

  return (
    <>
      <Button
        size="large"
        icon={<BellOutlined />}
        type="text"
        onClick={toggleDrawer}
        {...props}
      />
      <BAINotificationDrawer open={isOpenDrawer} onClose={toggleDrawer} />
    </>
  );
};

export default BAINotificationButton;
