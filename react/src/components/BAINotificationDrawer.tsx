import { useWebUINotification } from '../hooks/useNotifiction';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  InfoOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Drawer,
  List,
  type DrawerProps,
  theme,
  Avatar,
  Button,
  Popconfirm,
  Progress,
} from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends DrawerProps {}
const BAINotificationDrawer: React.FC<Props> = ({ ...drawerProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [notifications, { seeDetailHandler, clearAllNotifications }] =
    useWebUINotification();

  const avatarMap = {
    success: { icon: <CheckOutlined />, color: token.colorSuccess },
    info: { icon: <InfoOutlined />, color: token.colorInfo },
    warning: { icon: <InfoOutlined />, color: token.colorWarning },
    error: { icon: <CloseOutlined />, color: token.colorError },
  };

  return (
    <Drawer
      title={t('notification.Notifications')}
      styles={{ mask: { backgroundColor: 'transparent' } }}
      extra={
        notifications.length > 0 && (
          <Popconfirm
            title={t('notification.ClearNotifications')}
            description={t('notification.AreYouSureToClearAllNotifications')}
            okButtonProps={{
              danger: true,
            }}
            okText={t('button.Delete')}
            onConfirm={clearAllNotifications}
            icon={
              <QuestionCircleOutlined style={{ color: token.colorError }} />
            }
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        )
      }
      {...drawerProps}
    >
      <List
        itemLayout="vertical"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            key={item.key}
            actions={[
              (item.url || (item.type === 'error' && item.url === '')) && (
                <Button
                  type="link"
                  rel="noreferrer noopener"
                  onClick={() => {
                    seeDetailHandler(item);
                  }}
                  style={{ marginLeft: 240 }}
                >
                  {t('notification.SeeDetail')}
                </Button>
              ),
            ]}
          >
            <List.Item.Meta
              title={item.message}
              description={
                <>
                  {item.description}
                  {item.storeType === 'task' && (
                    <Progress
                      size="small"
                      showInfo={false}
                      percent={item.progress?.percent}
                      status={item.progress?.status}
                    />
                  )}
                  <br />({dayjs(item.created).format('ll LTS')})
                </>
              }
              avatar={
                !!item.type && (
                  <Avatar
                    size="small"
                    icon={_.get(avatarMap, `${item.type}.icon`)}
                    style={{
                      backgroundColor: _.get(avatarMap, `${item.type}.color`),
                    }}
                  />
                )
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default BAINotificationDrawer;
