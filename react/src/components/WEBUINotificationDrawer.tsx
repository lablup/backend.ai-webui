import { useWebUINavigate } from '../hooks';
import { useBAINotificationState } from '../hooks/useBAINotification';
import BAINotificationItem from './BAINotificationItem';
import { MoreOutlined } from '@ant-design/icons';
import {
  Drawer,
  List,
  type DrawerProps,
  theme,
  Button,
  Segmented,
  Badge,
  Dropdown,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NotificationCategory = 'all' | 'in progress';
interface Props extends DrawerProps {}

export const DRAWER_WIDTH = 280;
const WEBUINotificationDrawer: React.FC<Props> = ({ ...drawerProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const webuiNavigate = useWebUINavigate();

  const [notifications, { clearAllNotifications }] = useBAINotificationState();
  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory>('all');

  const inProgressNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        return n.backgroundTask?.status === 'pending';
      }),
    [notifications],
  );

  return (
    <Drawer
      width={DRAWER_WIDTH}
      title={t('notification.Notifications')}
      mask={false}
      className="webui-notification-drawer"
      styles={{
        // mask: { backgroundColor: 'transparent' },
        body: {
          padding: 0,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        },
        header: {
          // @ts-ignore
          '-webkit-app-region': 'drag',
        },
        wrapper: {
          padding: 0,
        },
      }}
      // style={{
      //   boxShadow: 'none !important',
      // }}
      // comment out the following line because list item
      extra={
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'clear-all',
                label: t('notification.ClearNotifications'),
                danger: true,
                onClick: clearAllNotifications,
              },
            ],
          }}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            disabled={notifications.length === 0}
          />
        </Dropdown>
      }
      {...drawerProps}
    >
      <style>
        {`
          .ant-drawer-header-title .ant-drawer-close,
          .ant-drawer-header .ant-drawer-extra{
            -webkit-app-region: no-drag;
          }
        `}
      </style>
      <List
        itemLayout="vertical"
        dataSource={
          selectedCategory === 'all' ? notifications : inProgressNotifications
        }
        header={
          <BAIFlex justify="end">
            <Segmented
              value={selectedCategory}
              onChange={(value) =>
                setSelectedCategory(value as NotificationCategory)
              }
              options={[
                {
                  value: 'all',
                  // icon: 'All
                  label: t('general.All'),
                },
                {
                  value: 'in progress',
                  label: (
                    <Badge dot={inProgressNotifications.length > 0}>
                      {t('general.InProgress')}
                    </Badge>
                  ),
                },
              ]}
            />
          </BAIFlex>
        }
        rowKey={(item) => item.key}
        renderItem={(item) => (
          <BAINotificationItem
            notification={item}
            onClickAction={(e) => {
              item.to && webuiNavigate(item.to);
              drawerProps.onClose && drawerProps.onClose(e);
            }}
            showDate
          />
        )}
      />
    </Drawer>
  );
};

export default WEBUINotificationDrawer;
