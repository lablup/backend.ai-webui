import { App, Typography } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { atom, useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

type StoreType = 'notification' | 'task';
type ProgressStatus = 'inProgress' | 'success' | 'error';
export interface NotificationState extends ArgsProps {
  id?: string;
  url?: string;
  created?: string;
  storeType?: StoreType;
  progressStatus?: ProgressStatus;
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
      id: notification.id ?? uuidv4(),
      created: new Date().toISOString(),
      storeType: notification.storeType || 'notification',
      ...notification,
    };
    setNotifications([...notifications, newNotification]);
  };

  const showWebUINotification = (notification: NotificationState) => {
    addNotification(notification);
    app.notification[notification.type || 'open']({
      placement: notification.placement || 'bottomRight',
      btn: notification.url && (
        <Typography.Link
          href={notification.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          {t('notification.SeeDetail')}
        </Typography.Link>
      ),
      ...notification,
    });
  };

  const getNotificationById = (id: string) => {
    return _.find(notifications, { id });
  };

  const updateNotification = (notification: NotificationState) => {
    const n = getNotificationById(notification.id || '');
    if (!n) return;
    const newNotification = {
      ...n,
      ...notification,
    };
    setNotifications(
      _.map(notifications, (n) => {
        if (n.id === notification.id) {
          return newNotification;
        }
        return n;
      }),
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    // notification.destroy();
  };

  return [
    notifications,
    {
      addNotification,
      showWebUINotification,
      getNotificationById,
      updateNotification,
      clearAllNotifications,
    },
  ] as const;
};
