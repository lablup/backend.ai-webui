import { useWebUINavigate } from '../hooks';
import { useBAINotification } from '../hooks/useBAINotification';
import BAINotificationItem from './BAINotificationItem';
import {
  CheckOutlined,
  ClearOutlined,
  CloseOutlined,
  InfoOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Drawer,
  List,
  type DrawerProps,
  theme,
  Popconfirm,
  Button,
} from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends DrawerProps {}
const WEBUINotificationDrawer: React.FC<Props> = ({ ...drawerProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const webuiNavigate = useWebUINavigate();

  const [notifications, { clearAllNotifications }] = useBAINotification();

  const avatarMap = {
    success: { icon: <CheckOutlined />, color: token.colorSuccess },
    info: { icon: <InfoOutlined />, color: token.colorInfo },
    warning: { icon: <InfoOutlined />, color: token.colorWarning },
    error: { icon: <CloseOutlined />, color: token.colorError },
  };

  return (
    <Drawer
      title={t('notification.Notifications')}
      styles={{
        mask: { backgroundColor: 'transparent' },
        body: {
          padding: 0,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        },
        header: {
          padding: 15,
        },
        // header: {
        //   height: 88,
        // },
      }}
      contentWrapperStyle={{ padding: 0 }}
      // comment out the following line because list item
      extra={
        <Popconfirm
          title={t('notification.ClearNotifications')}
          description={t('notification.AreYouSureToClearAllNotifications')}
          okButtonProps={{
            danger: true,
          }}
          okText={t('button.Delete')}
          onConfirm={clearAllNotifications}
          icon={<QuestionCircleOutlined />}
        >
          <Button
            type="text"
            icon={<ClearOutlined />}
            disabled={notifications.length === 0}
          />
        </Popconfirm>
      }
      {...drawerProps}
    >
      <List
        itemLayout="vertical"
        dataSource={notifications}
        rowKey={(item) => item.key}
        renderItem={(item) => (
          <BAINotificationItem
            notification={item}
            onClickAction={(e) => {
              item.toUrl && webuiNavigate(item.toUrl);
              drawerProps.onClose && drawerProps.onClose(e);
            }}
            showDate
          />
          // <List.Item
          //   key={item.key}
          //   actions={[
          //     item.toUrl ? (
          //       <Button
          //         type="link"
          //         rel="noreferrer noopener"
          //         onClick={(e) => {
          //           item.toUrl && webuiNavigate(item.toUrl);
          //         }}
          //       >
          //         {item.toTextKey
          //           ? t(item.toTextKey)
          //           : t('notification.SeeDetail')}
          //       </Button>
          //     ) : null,
          //   ]}
          // >
          //   <List.Item.Meta
          //     title={item.message}
          //     description={
          //       <>
          //         {item.description}
          //         {item.backgroundTask && (
          //           <Progress
          //             size="small"
          //             showInfo={false}
          //             percent={item.backgroundTask.percent}
          //             // status={item.progressStatus}
          //           />
          //         )}
          //         <br />({dayjs(item.created).format('ll LTS')})
          //       </>
          //     }
          //     avatar={
          //       !!item.type && (
          //         <Avatar
          //           size="small"
          //           icon={_.get(avatarMap, `${item.type}.icon`)}
          //           style={{
          //             backgroundColor: _.get(avatarMap, `${item.type}.color`),
          //           }}
          //         />
          //       )
          //     }
          //   />
          // </List.Item>
        )}
      />
    </Drawer>
  );
};

export default WEBUINotificationDrawer;
