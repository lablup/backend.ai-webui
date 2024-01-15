import { useBAINotification } from '../hooks/useBAINotification';
import WEBUINotificationDrawer from './WEBUINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Badge, Button } from 'antd';
import type { ButtonProps } from 'antd';
import _ from 'lodash';
import React, { useEffect } from 'react';

interface Props extends ButtonProps {}

const BAINotificationButton: React.FC<Props> = ({ ...props }) => {
  const [notifications, { addNotification }] = useBAINotification();
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

  const hasRunningBackgroundTask = _.some(notifications, (n) => {
    return n.backgroundTask?.status === 'pending';
  });
  return (
    <>
      <Button
        size="large"
        icon={
          <Badge dot={hasRunningBackgroundTask}>
            <BellOutlined />
          </Badge>
        }
        type="text"
        onClick={toggleDrawer}
        {...props}
      />
      <WEBUINotificationDrawer open={isOpenDrawer} onClose={toggleDrawer} />
    </>
  );
};

export default BAINotificationButton;
