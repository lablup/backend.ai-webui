import { useWebUINotification } from '../hooks/useNotifiction';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import React, { useEffect } from 'react';

interface Props extends ButtonProps {}

const BAINotificationButton: React.FC<Props> = ({ ...props }) => {
  const [, { addNotification }] = useWebUINotification();
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
