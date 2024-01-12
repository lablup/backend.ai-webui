import { useWebUINavigate } from '.';
import { App, Button, Progress } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { atom, useRecoilState } from 'recoil';

export interface NotificationState extends Omit<ArgsProps, 'placement'> {
  taskId?: string;
  created?: string;
  progressStatus?: 'success' | 'exception' | 'active' | 'normal';
  progressPercent?: number;
  toTextKey?: string;
  toUrl?: string;
  open?: boolean;
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
  const webuiNavigate = useWebUINavigate();
  const { t } = useTranslation();

  const addNotification = (params: Omit<NotificationState, 'created'>) => {
    const existingIndex = params.key
      ? _.findIndex(notifications, { key: params.key })
      : -1;

    const shouldOpen =
      existingIndex < 0 || // new
      (params.open === true && notifications[existingIndex].open !== false); // existing not already closed

    const newNotification: NotificationState = {
      ...notifications[existingIndex],
      ...params,
      created: new Date().toISOString(),
      open: shouldOpen,
    };

    if (existingIndex >= 0) {
      setNotifications(_.set(notifications, existingIndex, newNotification));
    } else {
      setNotifications([newNotification, ...notifications]);
    }

    if (newNotification.open) {
      //  open
      app.notification[newNotification.type || 'open']({
        ...newNotification,
        placement: 'bottomRight',
        description: (
          <>
            {newNotification.description}
            {newNotification.taskId && (
              <Progress
                size="small"
                showInfo={false}
                percent={newNotification.progressPercent}
                status={newNotification.progressStatus}
              />
            )}
          </>
        ),
        btn: newNotification.toUrl ? (
          <Button
            type="link"
            rel="noreferrer noopener"
            onClick={(e) => {
              newNotification.toUrl && webuiNavigate(newNotification.toUrl);
            }}
          >
            {newNotification.toTextKey
              ? t(newNotification.toTextKey)
              : t('notification.SeeDetail')}
          </Button>
        ) : null,
        onClose() {
          const idx = _.findIndex(notifications, { key: newNotification.key });
          if (idx >= 0) {
            setNotifications(
              _.set(notifications, idx, {
                ...notifications[idx],
                open: false,
              }),
            );
          }
        },
      });
    }
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
      clearAllNotifications,
      destroyNotification,
      destroyAllNotifications,
    },
  ] as const;
};
