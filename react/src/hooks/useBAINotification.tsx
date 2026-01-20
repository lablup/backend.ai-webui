import { useWebUINavigate } from '.';
import BAIGeneralNotificationItem from '../components/BAIGeneralNotificationItem';
import { SSEEventHandlerTypes, listenToBackgroundTask } from '../helper';
import { useBAISettingUserState } from './useBAISetting';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { ArgsProps } from 'antd/lib/notification';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import _ from 'lodash';
import React, { Key, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { To, createPath } from 'react-router-dom';
import { BAINodeNotificationItemFragment$key } from 'src/__generated__/BAINodeNotificationItemFragment.graphql';
import BAINodeNotificationItem from 'src/components/BAINodeNotificationItem';
import { v4 as uuidv4 } from 'uuid';

const _activeNotificationKeys: Key[] = [];

const useStyle = createStyles(({ css }) => ({
  notificationItem: css`
    .ant-notification-notice-description {
      margin-top: 0 !important;
    }
  `,
}));

// Helper type to ensure promise and onChange.resolved have matching types
type BackgroundTaskConfig<T> = {
  taskId?: string;
  percent?: number;
  status: 'pending' | 'rejected' | 'resolved';
  onChange?: {
    pending?:
      | string
      | Partial<NotificationState<any>>
      | ((
          data: unknown,
          notification: NotificationStateForOnChange,
        ) => string | Partial<NotificationState<any>>);
    resolved?:
      | string
      | Partial<NotificationState<any>>
      | ((
          data: T,
          notification: NotificationStateForOnChange,
        ) => string | Partial<NotificationState<any>>);
    rejected?:
      | string
      | Partial<NotificationState<any>>
      | ((
          data: unknown,
          notification: NotificationStateForOnChange,
        ) => string | Partial<NotificationState<any>>);
  };
  renderDataMessage?: (message?: string) => React.ReactNode;
  promise?: Promise<T> | null;
};

export interface NotificationState<T = any>
  extends Omit<ArgsProps, 'placement' | 'key' | 'icon'> {
  key: React.Key;
  created?: string;
  toTextKey?: string;
  toText?: string;
  to?: To;
  open?: boolean;
  icon?: 'folder';
  node?: BAINodeNotificationItemFragment$key;
  backgroundTask?: BackgroundTaskConfig<T>;
  extraDescription?: ReactNode | null;
  onCancel?: (() => void) | null;
  skipDesktopNotification?: boolean;
  extraData: any;
}

interface NotificationOptions {
  skipOverrideByStatus?: boolean;
}

export type NotificationStateForOnChange = Partial<
  Omit<NotificationState, 'key' | 'created'>
>;

export const notificationListState = atom<NotificationState[]>([]);

export const CLOSING_DURATION = 4; //second

/**
 * Custom hook that returns the BAI notification state.
 * @returns A tuple containing the notifications and a function to set the BAI notification.
 */
export const useBAINotificationState = () => {
  const _notifications = useAtomValue(notificationListState);

  return [_notifications, useSetBAINotification()] as const;
};

type BackgroundTaskEvent = {
  task_id: string;
  message: string;
  current_progress: number;
  total_progress: number;
};
/**
 * Custom hook that listens to background tasks and updates notifications accordingly.
 */
export const useBAINotificationEffect = () => {
  const _notifications = useAtomValue(notificationListState);

  const listeningTaskIdsRef = useRef<(string | undefined)[]>([]);
  // const closedNotificationKeysRef = useRef<(React.Key | undefined)[]>([]);
  const listeningPromiseKeysRef = useRef<NotificationState['key'][]>([]);
  const { upsertNotification } = useSetBAINotification();
  // listen to background task if a notification has a background task
  // and not already listening
  useEffect(() => {
    _.each(_notifications, (notification) => {
      if (
        notification.backgroundTask?.promise &&
        !_.includes(listeningPromiseKeysRef.current, notification.key) &&
        notification.backgroundTask.status === 'pending'
      ) {
        listeningPromiseKeysRef.current.push(notification.key);
        notification.backgroundTask?.promise
          .then((data) => {
            const updatedNotification = _.merge({}, notification, {
              backgroundTask: {
                status: 'resolved',
              },
              duration: CLOSING_DURATION,
            });
            const overrideData = generateOverrideByStatus(
              updatedNotification,
              data,
            );
            upsertNotification(_.merge({}, updatedNotification, overrideData), {
              skipOverrideByStatus: true,
            });
          })
          .catch((e) => {
            const updatedNotification = _.merge({}, notification, {
              backgroundTask: {
                status: 'rejected',
              },
              duration: CLOSING_DURATION,
            });
            const overrideData = generateOverrideByStatus(
              updatedNotification,
              e,
            );
            upsertNotification(_.merge({}, updatedNotification, overrideData), {
              skipOverrideByStatus: true,
            });
          })
          .finally(() => {
            listeningPromiseKeysRef.current = _.without(
              listeningPromiseKeysRef.current,
              notification.key,
            );
          });
      }
    });
    _.each(_notifications, (notification) => {
      if (
        notification.backgroundTask?.taskId &&
        !_.includes(
          listeningTaskIdsRef.current,
          notification.backgroundTask?.taskId,
        ) &&
        notification.backgroundTask.status === 'pending'
      ) {
        // sse and update progress
        listeningTaskIdsRef.current.push(notification.backgroundTask?.taskId);
        const SSEEventHandler: SSEEventHandlerTypes<BackgroundTaskEvent> = {
          onUpdated: _.throttle(
            (data) => {
              const ratio = data.current_progress / data.total_progress;
              upsertNotification({
                key: notification.key,
                message: notification.message,
                backgroundTask: {
                  status: 'pending',
                  percent: ratio * 100,
                },
                skipDesktopNotification: true,
              });
            },
            100,
            {
              leading: true,
              trailing: false,
            },
          ),
          onDone: () => {
            listeningTaskIdsRef.current = _.without(
              listeningTaskIdsRef.current,
              notification.backgroundTask?.taskId,
            );
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
              skipDesktopNotification: notification.skipDesktopNotification,
            });
          },
          onTaskFailed: (data) => {
            listeningTaskIdsRef.current = _.without(
              listeningTaskIdsRef.current,
              notification.backgroundTask?.taskId,
            );
            const ratio = data.current_progress / data.total_progress;
            upsertNotification({
              key: notification.key,
              message: notification.message,
              backgroundTask: {
                status: 'rejected',
                percent: ratio * 100,
              },
              extraDescription:
                notification?.backgroundTask
                  ?.renderDataMessage?.(data?.message)
                  ?.toString() || data?.message,
              duration: CLOSING_DURATION,
              skipDesktopNotification: notification.skipDesktopNotification,
            });
          },
          onFailed: (data) => {
            upsertNotification({
              key: notification.key,
              message: notification.message,
              backgroundTask: {
                status: 'rejected',
              },
              extraDescription:
                notification?.backgroundTask
                  ?.renderDataMessage?.(data?.message)
                  ?.toString() || data?.message,
              duration: CLOSING_DURATION,
              skipDesktopNotification: notification.skipDesktopNotification,
            });
          },
          onTaskCancelled: (data) => {
            listeningTaskIdsRef.current = _.without(
              listeningTaskIdsRef.current,
              notification.backgroundTask?.taskId,
            );
            const ratio = data.current_progress / data.total_progress;
            upsertNotification({
              key: notification.key,
              message: notification.message,
              backgroundTask: {
                status: 'rejected',
                percent: ratio * 100,
              },
              duration: CLOSING_DURATION,
              skipDesktopNotification: notification.skipDesktopNotification,
            });
          },
        };

        listenToBackgroundTask(
          notification.backgroundTask?.taskId,
          SSEEventHandler,
        );
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_notifications, upsertNotification]);
};

/**
 * Custom hook for managing BAI notifications.
 * @returns An object containing functions for manipulating notifications.
 */
export const useSetBAINotification = () => {
  'use memo';

  // Don't use _notifications carefully when you need to mutate it.
  const setNotifications = useSetAtom(notificationListState);
  const [desktopNotification] = useBAISettingUserState('desktop_notification');

  const app = App.useApp();
  const { t } = useTranslation();

  const webuiNavigate = useWebUINavigate();
  const { styles } = useStyle();

  const closeAllNotifications = useCallback(() => {
    _activeNotificationKeys.splice(0, _activeNotificationKeys.length);
    app.notification.destroy();
  }, [app.notification]);

  /**
   * Function to permanently clear all notifications.
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    closeAllNotifications();
  }, [setNotifications, closeAllNotifications]);

  /**
   * Function to hide specific notification. It remains in the drawer.
   */
  const closeNotification = useCallback(
    (key: React.Key) => {
      app.notification.destroy(key);
    },
    [app.notification],
  );

  /**
   * Function to remove specific notification from the list and hide it.
   */
  const clearNotification = useCallback(
    (key: React.Key) => {
      setNotifications((prev) => {
        return prev.filter((n) => n.key !== key);
      });
      closeNotification(key);
    },
    [setNotifications, closeNotification],
  );

  /**
   * Function to upsert a notification.
   * @param params - The parameters for the notification.
   * @param options - Options for the notification.
   */
  const upsertNotification = useCallback(
    <T = any,>(
      params: Partial<Omit<NotificationState<T>, 'created'>>,
      options: NotificationOptions = {},
    ) => {
      const { skipDesktopNotification = false } = params;
      const { skipOverrideByStatus } = options;
      let currentKey: React.Key | undefined;
      setNotifications((prevNotifications: NotificationState[]) => {
        let nextNotifications: NotificationState[];
        const existingIndex = params.key
          ? _.findIndex(prevNotifications, { key: params.key })
          : -1;
        const existingNotification =
          existingIndex > -1 ? prevNotifications[existingIndex] : undefined;
        let newNotification: NotificationState<T> = _.merge(
          {}, // start with empty object
          existingNotification,
          params,
          {
            key: params.key || uuidv4(),
            created: existingNotification?.created ?? new Date().toISOString(),
          },
        ) as NotificationState<T>;

        if (!skipOverrideByStatus) {
          const overrideData = generateOverrideByStatus(newNotification);
          newNotification = _.merge({}, newNotification, overrideData);
        }

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

          if (!skipDesktopNotification && desktopNotification) {
            upsertDesktopNotification(newNotification);
          }
          app.notification.open({
            ...newNotification,
            icon: undefined, // override icon to remove default icon from notification, icon displayed in BAINotificationItem
            type: undefined, // override type to remove default icon from notification, icon displayed in BAINotificationItem
            placement: 'bottomRight',
            message: undefined,
            className: styles.notificationItem,
            description: newNotification.node ? (
              <BAINodeNotificationItem
                notification={newNotification}
                nodeFrgmt={newNotification.node}
              />
            ) : (
              <BAIGeneralNotificationItem
                notification={newNotification}
                onClickAction={() => {
                  if (newNotification.to) {
                    webuiNavigate(newNotification.to);
                  }
                  closeNotification(newNotification.key);
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
                  // check the notification is removed by clearNotification function. If so, do nothing.
                  const exists = prevList.some(
                    (n) => n.key === newNotification.key,
                  );
                  if (!exists) return prevList;

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
          closeNotification(newNotification.key);
        }
        currentKey = newNotification.key;
        return nextNotifications;
      });
      return currentKey;
    },
    // webuiNavigate is not a dependency because it is not used in the callback of useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      app.notification,
      setNotifications,
      closeNotification,
      desktopNotification,
    ],
  );

  const upsertDesktopNotification = useCallback(
    (params: Partial<Omit<NotificationState, 'created'>>) => {
      const title =
        extractTextFromReactNode(params.message) ||
        `[Backend.AI] ${t('sidePanel.Notification')}`;
      const options: Partial<Notification> = {
        body: extractTextFromReactNode(params.description),
        tag: _.toString(params.key),
      };

      const notification = new Notification(title, options);
      notification.onclick = () => {
        if (params.to) {
          window.focus();
          const href =
            typeof params.to === 'string' ? params.to : createPath(params.to);
          window.location.href = href;
        }
      };
    },
    [t],
  );

  return {
    upsertNotification,
    clearNotification,
    clearAllNotifications,
    closeNotification,
    closeAllNotifications,
  };
};

function generateOverrideByStatus<T = any>(
  notification?: NotificationState<T>,
  dataOrError?: any,
) {
  const currentHandler =
    notification?.backgroundTask?.onChange?.[
      notification.backgroundTask?.status
    ];

  if (currentHandler) {
    const overrideData = _.isFunction(currentHandler)
      ? currentHandler(dataOrError, notification)
      : currentHandler;
    if (typeof overrideData === 'string') {
      return {
        description: overrideData,
      };
    } else {
      return overrideData;
    }
  } else {
    // If there is no handler for rejected case, set description using error message
    if (
      notification?.backgroundTask?.status === 'rejected' &&
      dataOrError?.message
    ) {
      return {
        // TODO: need to sanitize the error message using Painkiller
        description: dataOrError.message,
      };
    }
  }
  return {};
}

/**
 *
 * @param message
 * @returns string | undefined
 * @description Extracts text from the message used in the antd's notification. If the message's type is ReactNode, it will return undefined.
 */
function extractTextFromReactNode(message: ReactNode): string | undefined {
  if (typeof message === 'string' || typeof message === 'number') {
    return _.toString(message);
  }

  return undefined;
}
