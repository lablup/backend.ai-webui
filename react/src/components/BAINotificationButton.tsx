import { useWebUINotification } from '../hooks';
import BAINotificationDrawer from './BAINotificationDrawer';
import { BellOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button } from 'antd';
import type { ButtonProps } from 'antd/';
import _ from 'lodash';
import React, { useEffect } from 'react';

interface Props extends ButtonProps {}

const BAINotificationButton: React.FC<Props> = ({ ...props }) => {
  const [, { showWebUINotification }] = useWebUINotification();
  const [isOpenDrawer, { toggle: toggleDrawer }] = useToggle();

  useEffect(() => {
    const handler = (e: any) => {
      showWebUINotification(e.detail);
    };
    document.addEventListener('show-bai-notification', handler);
    return () => {
      document.removeEventListener('show-bai-notification', handler);
    };
  }, [showWebUINotification]);
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
