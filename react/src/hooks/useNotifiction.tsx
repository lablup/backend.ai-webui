import { useWebUINavigate } from '.';
import { App, Button, Progress } from 'antd';
import { ProgressProps } from 'antd/lib';
import { ArgsProps } from 'antd/lib/notification';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { atom, useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

type StoreType = 'notification' | 'task';
export interface NotificationState extends ArgsProps {
  url?: string;
  created?: string;
  storeType?: StoreType;
  progress?: ProgressProps;
}

export const notificationListState = atom<NotificationState[]>({
  key: 'webui-notification',
  default: [],
});

export const useWebUINotification = () => {
  const [notifications, setNotifications] = useRecoilState(
    notificationListState,
  );
  const app = App.useApp();
  const { t } = useTranslation();

  const addNotification = (notification: NotificationState) => {
    const newNotification = {
      created: new Date().toISOString(),
      storeType: notification.storeType || 'notification',
      ...notification,
    };
    setNotifications([newNotification, ...notifications]);
  };

  const webuiNavigate = useWebUINavigate();
  const seeDetailHandler = (n: NotificationState) => {
    if (n.type === 'error' && (n.url === '' || n.url === '/usersettings')) {
      webuiNavigate('/usersettings', {
        params: {
          tab: 'logs',
        },
      });
      // dispatch event to update tab of backend-ai-usersettings
      const event = new CustomEvent('backend-ai-usersettings', {});
      document.dispatchEvent(event);
    } else if (n.url !== '') {
      webuiNavigate(n.url || '');
    }
    app.notification.destroy(n.key);
  };

  const showWebUINotification = (notification: NotificationState) => {
    addNotification(notification);
    app.notification[notification.type || 'open']({
      ...notification,
      placement: notification.placement || 'bottomRight',
      btn: (notification.url ||
        (notification.type === 'error' && notification.url === '')) && (
        <Button
          type="link"
          rel="noreferrer noopener"
          onClick={() => {
            seeDetailHandler(notification);
          }}
        >
          {t('notification.SeeDetail')}
        </Button>
      ),
      description: notification.storeType === 'task' && (
        <>
          {notification.description}
          <Progress
            size="small"
            showInfo={false}
            percent={notification.progress?.percent}
            status={notification.progress?.status}
          />
        </>
      ),
    });
  };

  const getNotificationById = (key: React.Key = uuidv4()) => {
    return _.find(notifications, { key: key });
  };

  const updateNotification = (notification: NotificationState) => {
    const n = getNotificationById(notification.key);
    if (!n) return;
    const newNotification = {
      ...n,
      ...notification,
    };
    setNotifications(
      _.map(notifications, (n) => {
        if (n.key === notification.key) {
          return newNotification;
        }
        return n;
      }),
    );
    app.notification[notification.type || 'open']({
      ...newNotification,
      key: notification.key,
      placement: notification.placement || 'bottomRight',
      btn: (notification.url ||
        (notification.type === 'error' && notification.url === '')) && (
        <Button
          type="link"
          rel="noreferrer noopener"
          onClick={() => {
            seeDetailHandler(notification);
          }}
        >
          {t('notification.SeeDetail')}
        </Button>
      ),
      description: notification.storeType === 'task' && (
        <>
          {notification.description}
          <Progress
            size="small"
            showInfo={false}
            percent={notification.progress?.percent}
            status={notification.progress?.status}
          />
        </>
      ),
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const destroyNotification = (key: React.Key) => {
    app.notification.destroy(key);
  };

  const destroyAllNotifications = () => {
    app.notification.destroy();
  };

  return [
    notifications,
    {
      addNotification,
      seeDetailHandler,
      showWebUINotification,
      getNotificationById,
      updateNotification,
      clearAllNotifications,
      destroyNotification,
      destroyAllNotifications,
    },
  ] as const;
};
