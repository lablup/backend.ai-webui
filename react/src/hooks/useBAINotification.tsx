import { useSuspendedBackendaiClient, useWebUINavigate } from '.';
import BAINotificationItem from '../components/BAINotificationItem';
import { App } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import _ from 'lodash';
import { Key, useCallback, useEffect, useRef } from 'react';
import { To } from 'react-router-dom';
import { atom, useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

const _activeNotificationKeys: Key[] = [];

export interface NotificationState
  extends Omit<ArgsProps, 'placement' | 'key'> {
  key: React.Key;
  created?: string;
  toTextKey?: string;
  to?: string | To;
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
  extraDescription?: string;
}

export const notificationListState = atom<NotificationState[]>({
  key: 'webui-notification',
  default: [],
});

export const CLOSING_DURATION = 1; //second

export const useBAINotification = () => {
  // Don't use _notifications carefully when you need to mutate it.
  const [_notifications, setNotifications] = useRecoilState(
    notificationListState,
  );
  const app = App.useApp();

  const listeningTaskIdsRef = useRef<(string | undefined)[]>([]);
  // const closedNotificationKeysRef = useRef<(React.Key | undefined)[]>([]);

  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();

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
      console.log('##3', params);
      let currentKey: React.Key | undefined;
      setNotifications((prevNotifications: NotificationState[]) => {
        let nextNotifications: NotificationState[];
        const existingIndex = params.key
          ? _.findIndex(prevNotifications, { key: params.key })
          : -1;

        const newNotification: NotificationState = _.merge(
          {}, // start with empty object
          prevNotifications[existingIndex],
          params,
          {
            key: params.key || uuidv4(),
            created: new Date().toISOString(),
          },
        );

        // This is to check if the notification should be updated using ant.d notification
        const shouldUpdateUsingAPI =
          (_.isEmpty(params.key) && params.open) ||
          // if it is already opened(active), then apply change to ant.d notification
          (newNotification.key &&
            _activeNotificationKeys.includes(newNotification.key)) ||
          // if it is not opened(active) and params.open is true, then apply change to ant.d notification (open it)
          (newNotification.key &&
            !_activeNotificationKeys.includes(newNotification.key) &&
            params.open);

        // override description according to background task status
        newNotification.description =
          newNotification.backgroundTask?.statusDescriptions?.[
            newNotification.backgroundTask?.status
          ] || newNotification.description;

        if (existingIndex >= 0) {
          nextNotifications = [
            ...prevNotifications.slice(0, existingIndex),
            newNotification,
            ...prevNotifications.slice(existingIndex + 1),
          ];
        } else {
          nextNotifications = [newNotification, ...prevNotifications];
          // If the number of notifications exceeds 100, remove the oldest ones
          if (nextNotifications.length > 100) {
            nextNotifications = nextNotifications.slice(
              nextNotifications.length - 100,
            );
          }
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
            type: undefined, // override type to remove default icon from notification, icon displayed in BAINotificationItem
            placement: 'bottomRight',
            message: undefined,
            description: (
              <BAINotificationItem
                notification={newNotification}
                onClickAction={() => {
                  if (newNotification.to) {
                    webuiNavigate(newNotification.to);
                  }
                  destroyNotification(newNotification.key);
                }}
              />
            ),
            onClose() {
              _.remove(
                _activeNotificationKeys,
                (key) => key === newNotification.key,
              );
              const idx = _.findIndex(prevNotifications, {
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
        currentKey = newNotification.key;
        return nextNotifications;
      });
      return currentKey;
    },
    // webuiNavigate is not a dependency because it is not used in the callback of useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [app.notification, setNotifications, destroyNotification],
  );

  // listen to background task if a notification has a background task
  // and not already listening
  useEffect(() => {
    _.each(_notifications, (notification) => {
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
            duration: CLOSING_DURATION,
          });
        });
        const failHandler = (e: any) => {
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
            extraDescription: data?.message,
            duration: CLOSING_DURATION,
          });
        };
        sse.addEventListener('bgtask_failed', failHandler);
        sse.addEventListener('task_failed', (e) => {
          const data = JSON.parse(e['data']);
          upsertNotification({
            key: notification.key,
            message: notification.message,
            backgroundTask: {
              status: 'rejected',
            },
            extraDescription: data?.message,
            duration: CLOSING_DURATION,
          });
          sse.close();
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
            duration: CLOSING_DURATION,
          });
        });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_notifications, upsertNotification]);

  return [
    _notifications,
    {
      upsertNotification,
      clearAllNotifications,
      destroyNotification,
      destroyAllNotifications,
    },
  ] as const;
};
