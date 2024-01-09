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
    open: { icon: null, color: null },
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
        renderItem={(item) => (
          <List.Item
            key={item.created}
            actions={[
              item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {t('notification.SeeDetail')}
                </a>
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
                _.get(avatarMap, item.type + '.icon') && (
                  <Avatar
                    size="small"
                    icon={_.get(avatarMap, item.type + '.icon')}
                    style={{
                      backgroundColor: _.get(avatarMap, item.type + '.color'),
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
