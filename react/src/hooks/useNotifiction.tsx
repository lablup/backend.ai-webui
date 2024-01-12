import { useSuspendedBackendaiClient, useWebUINavigate } from '.';
import { App, Button, Progress } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { atom, useRecoilState } from 'recoil';

export interface NotificationState extends Omit<ArgsProps, 'placement'> {
  created?: string;
  toTextKey?: string;
  toUrl?: string;
  open?: boolean;
  backgroundTask?: {
    taskId?: string;
    percent?: number;
    status: 'pending' | 'rejected' | 'resolved';
    statusDescriptions?: {
      pending?: string;
      resolved?: string;
      rejected?: string;
    };
    promise?: Promise<any>;
  };
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

  const runningTaskIdsRef = useRef<(string | undefined)[]>([]);

  const baiClient = useSuspendedBackendaiClient();
  const addNotification = (params: Omit<NotificationState, 'created'>) => {
    const existingIndex = params.key
      ? _.findIndex(notifications, { key: params.key })
      : -1;
    const previousNotification =
      existingIndex >= 0 ? notifications[existingIndex] : undefined;

    const shouldOpen =
      (existingIndex < 0 && params.open !== false) || // new
      (params.open === true && notifications[existingIndex].open !== false); // existing not already closed

    const newNotification: NotificationState = _.merge(
      {}, // start with empty object
      notifications[existingIndex],
      params,
      {
        created: new Date().toISOString(),
      },
    );

    // override description if background task
    newNotification.description =
      newNotification.backgroundTask?.status &&
      newNotification.backgroundTask?.statusDescriptions?.[
        newNotification.backgroundTask?.status
      ]
        ? newNotification.backgroundTask?.statusDescriptions?.[
            newNotification.backgroundTask?.status
          ]
        : newNotification.description;

    if (
      newNotification.backgroundTask?.taskId &&
      !_.includes(
        runningTaskIdsRef.current,
        newNotification.backgroundTask?.taskId,
      )
    ) {
      // sse and update progress
      runningTaskIdsRef.current.push(newNotification.backgroundTask?.taskId);
      const sse: EventSource = baiClient.maintenance.attach_background_task(
        newNotification.backgroundTask?.taskId,
      );
      sse.onerror = (e) => {
        sse.close();
      };
      sse.addEventListener('bgtask_updated', (e) => {
        const data = JSON.parse(e['data']);
        const ratio = data.current_progress / data.total_progress;
        addNotification({
          ...newNotification,
          backgroundTask: {
            ...newNotification.backgroundTask,
            status: 'pending',
            percent: ratio * 100,
          },
        });
      });
      sse.addEventListener('bgtask_done', (e) => {
        runningTaskIdsRef.current = _.without(
          runningTaskIdsRef.current,
          newNotification.backgroundTask?.taskId,
        );
        sse.close();
        if (_.startsWith(_.toString(newNotification.key), 'image-rescan:')) {
          const event = new CustomEvent('image-rescanned');
          document.dispatchEvent(event);
        }
        addNotification({
          ...newNotification,
          backgroundTask: {
            ...newNotification.backgroundTask,
            status: 'resolved',
            percent: 100,
          },
          duration: 1,
        });
      });
      sse.addEventListener('bgtask_failed', (e) => {
        runningTaskIdsRef.current = _.without(
          runningTaskIdsRef.current,
          newNotification.backgroundTask?.taskId,
        );
        sse.close();
        const data = JSON.parse(e['data']);
        const ratio = data.current_progress / data.total_progress;
        addNotification({
          ...newNotification,
          backgroundTask: {
            ...newNotification.backgroundTask,
            status: 'rejected',
            percent: ratio * 100,
          },
          duration: 1,
        });
      });
      sse.addEventListener('bgtask_cancelled', (e) => {
        runningTaskIdsRef.current = _.without(
          runningTaskIdsRef.current,
          newNotification.backgroundTask?.taskId,
        );
        sse.close();
        const data = JSON.parse(e['data']);
        const ratio = data.current_progress / data.total_progress;
        addNotification({
          ...newNotification,
          backgroundTask: {
            ...newNotification.backgroundTask,
            status: 'rejected',
            percent: ratio * 100,
          },
          duration: 1,
        });
      });
    }

    if (existingIndex >= 0) {
      setNotifications([
        ...notifications.slice(0, existingIndex),
        newNotification,
        ...notifications.slice(existingIndex + 1),
      ]);
    } else {
      setNotifications([newNotification, ...notifications]);
    }

    if (shouldOpen) {
      app.notification.open({
        ...newNotification,
        placement: 'bottomRight',
        description: (
          <>
            {newNotification.description}
            {newNotification.backgroundTask && (
              <Progress
                size="small"
                showInfo={false}
                percent={newNotification.backgroundTask.percent}
                // status={
                //   {
                //     pending: 'active',
                //     resolved: 'success',
                //     reject: 'exception',
                //   }[newNotification.backgroundTask.status] || 'normal'
                // }
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
            setNotifications((prevList) => {
              const newList = [...prevList];
              newList[idx] = {
                ...newList[idx],
                open: false,
              };
              return newList;
            });
          }
        },
      });
    } else if (newNotification.open === false && newNotification.key) {
      destroyNotification(newNotification.key);
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
