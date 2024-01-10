import { useWebUINotification } from '../hooks';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  InfoOutlined,
  LoadingOutlined,
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
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends DrawerProps {}
const BAINotificationDrawer: React.FC<Props> = ({ ...drawerProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { Link } = Typography;

  const [notifications, { destroyNotifications }] = useWebUINotification();

  const avatarMap = {
    success: { icon: <CheckOutlined />, color: token.colorSuccess },
    info: { icon: <InfoOutlined />, color: token.colorInfo },
    warning: { icon: <InfoOutlined />, color: token.colorWarning },
    error: { icon: <CloseOutlined />, color: token.colorError },
  };

  const progressStatusIconMap = {
    inProgress: <LoadingOutlined style={{ color: token.colorPrimary }} />,
    success: <CheckOutlined style={{ color: token.colorSuccess }} />,
    error: <CloseOutlined style={{ color: token.colorError }} />,
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
            onConfirm={destroyNotifications}
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
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            key={item.created}
            actions={[
              item.url && (
                <Link href={item.url} target="_blank" rel="noopener noreferrer">
                  {t('notification.SeeDetail')}
                </Link>
              ),
            ]}
          >
            <List.Item.Meta
              title={item.message}
              description={
                <>
                  {item.description}
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
            {item.storeType === 'task' &&
              _.get(progressStatusIconMap, item.progressStatus || 'inProgress')}
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default BAINotificationDrawer;
