import { notificationState } from '../hooks';
import { CheckOutlined, CloseOutlined, InfoOutlined } from '@ant-design/icons';
import { Drawer, List, type DrawerProps, theme, Avatar } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

interface Props extends DrawerProps {}
const BAINotificationDrawer: React.FC<Props> = ({ ...drawerProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const notifications = useRecoilValue(notificationState);
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
      {...drawerProps}
    >
      <List
        dataSource={notifications}
        renderItem={(item) =>
          notifications.length > 0 ? (
            <List.Item
              key={item.created}
              actions={[
                item.url ? (
                  <a href={item.url} target="_blank">
                    {t('notification.SeeDetail')}
                  </a>
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={item.text}
                description={
                  <>
                    {item.detail}
                    <br />({dayjs(item.created).format('ll LTS')})
                  </>
                }
                avatar={
                  <Avatar
                    size="small"
                    icon={_.get(avatarMap, (item.type || 'info') + '.icon')}
                    style={{
                      backgroundColor: _.get(
                        avatarMap,
                        (item.type || 'info') + '.color',
                      ),
                    }}
                  />
                }
              />
            </List.Item>
          ) : (
            <>{t('notification.NoNotification')}</>
          )
        }
      />
    </Drawer>
  );
};

export default BAINotificationDrawer;
