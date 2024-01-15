import { useSuspendedBackendaiClient } from '.';
import BAINotificationItem from '../components/BAINotificationItem';
import { App } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import _ from 'lodash';
import { Key, useCallback, useEffect, useRef } from 'react';
import { atom, useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

const _activeNotificationKeys: Key[] = [];

export interface NotificationState
  extends Omit<ArgsProps, 'placement' | 'key'> {
  key: React.Key;
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

export const useBAINotification = () => {
  const [notifications, setNotifications] = useRecoilState(
    notificationListState,
  );
  const app = App.useApp();

  const listeningTaskIdsRef = useRef<(string | undefined)[]>([]);
  // const closedNotificationKeysRef = useRef<(React.Key | undefined)[]>([]);

  const baiClient = useSuspendedBackendaiClient();

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const destroyNotification = useCallback(
    (key: React.Key) => {
      app.notification.destroy(key);
    },
    [app.notification],
  );

  const destroyAllNotifications = useCallback(() => {
    app.notification.destroy();
  }, [app.notification]);

  const upsertNotification = useCallback(
    (params: Partial<Omit<NotificationState, 'created'>>) => {
      const existingIndex = params.key
        ? _.findIndex(notifications, { key: params.key })
        : -1;

      const newNotification: NotificationState = _.merge(
        {}, // start with empty object
        notifications[existingIndex],
        params,
        {
          created: new Date().toISOString(),
        },
      );

      const shouldUpdateUsingAPI =
        (_.isEmpty(params.key) && params.open) ||
        // if it is already open, then apply change to ant.d notification
        (newNotification.key &&
          _activeNotificationKeys.includes(newNotification.key)) ||
        // if it is not open and params.open is true, then apply change to ant.d notification
        (newNotification.key &&
          !_activeNotificationKeys.includes(newNotification.key) &&
          params.open);

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

      newNotification.key = newNotification.key || uuidv4();
      if (existingIndex >= 0) {
        setNotifications([
          ...notifications.slice(0, existingIndex),
          newNotification,
          ...notifications.slice(existingIndex + 1),
        ]);
      } else {
        setNotifications((prevNotifications) => {
          const newNotifications = [newNotification, ...prevNotifications];
          // If the number of notifications exceeds 100, remove the oldest ones
          if (newNotifications.length > 100) {
            return newNotifications.slice(newNotifications.length - 100);
          }
          return newNotifications;
        });
      }

      if (shouldUpdateUsingAPI) {
        if (
          newNotification.key &&
          newNotification.open &&
          _activeNotificationKeys.includes(newNotification.key) === false
        ) {
          _activeNotificationKeys.push(newNotification.key);
        }

        app.notification.open({
          ...newNotification,
          placement: 'bottomRight',
          message: undefined,
          description: <BAINotificationItem notification={newNotification} />,
          onClose() {
            _.remove(
              _activeNotificationKeys,
              (key) => key === newNotification.key,
            );
            const idx = _.findIndex(notifications, {
              key: newNotification.key,
            });
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

      return newNotification;
    },
    [notifications, app.notification, setNotifications, destroyNotification],
  );

  // listen to background task if a notification has a background task
  // and not already listening
  useEffect(() => {
    _.each(notifications, (notification) => {
      if (
        notification.backgroundTask?.taskId &&
        !_.includes(
          listeningTaskIdsRef.current,
          notification.backgroundTask?.taskId,
        )
      ) {
        // sse and update progress
        listeningTaskIdsRef.current.push(notification.backgroundTask?.taskId);
        const sse: EventSource = baiClient.maintenance.attach_background_task(
          notification.backgroundTask?.taskId,
        );
        sse.onerror = () => {
          sse.close();
        };
        let count = 0;
        sse.addEventListener(
          'bgtask_updated',
          _.throttle(
            (e) => {
              const data = JSON.parse(e['data']);
              const ratio = data.current_progress / data.total_progress;
              upsertNotification({
                // ...notification,
                key: notification.key,
                message: notification.message,
                backgroundTask: {
                  // ...notification.backgroundTask,
                  status: 'pending',
                  percent: ratio * 100,
                },
              });
            },
            100,
            // Set 'trailing' to false to ensure that the 'bgtask_done' will be handled at last.
            { leading: true, trailing: false },
          ),
        );
        sse.addEventListener('bgtask_done', () => {
          listeningTaskIdsRef.current = _.without(
            listeningTaskIdsRef.current,
            notification.backgroundTask?.taskId,
          );
          sse.close();
          if (_.startsWith(_.toString(notification.key), 'image-rescan:')) {
            const event = new CustomEvent('image-rescanned');
            document.dispatchEvent(event);
          }
          upsertNotification({
            key: notification.key,
            message: notification.message,
            backgroundTask: {
              status: 'resolved',
              percent: 100,
            },
            duration: 1,
          });
        });
        sse.addEventListener('bgtask_failed', (e) => {
          listeningTaskIdsRef.current = _.without(
            listeningTaskIdsRef.current,
            notification.backgroundTask?.taskId,
          );
          sse.close();
          const data = JSON.parse(e['data']);
          const ratio = data.current_progress / data.total_progress;
          upsertNotification({
            key: notification.key,
            message: notification.message,
            backgroundTask: {
              status: 'rejected',
              percent: ratio * 100,
            },
            duration: 1,
          });
        });
        sse.addEventListener('bgtask_cancelled', (e) => {
          listeningTaskIdsRef.current = _.without(
            listeningTaskIdsRef.current,
            notification.backgroundTask?.taskId,
          );
          sse.close();
          const data = JSON.parse(e['data']);
          const ratio = data.current_progress / data.total_progress;
          upsertNotification({
            key: notification.key,
            message: notification.message,
            backgroundTask: {
              // ...notification.backgroundTask,
              status: 'rejected',
              percent: ratio * 100,
            },
            duration: 1,
          });
        });
      }
    });
  }, [notifications, upsertNotification]);

  return [
    notifications,
    {
      addNotification: upsertNotification,
      clearAllNotifications,
      destroyNotification,
      destroyAllNotifications,
    },
  ] as const;
};
