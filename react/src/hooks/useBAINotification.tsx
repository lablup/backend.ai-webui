/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '.';
import BAIGeneralNotificationItem from '../components/BAIGeneralNotificationItem';
import BAIMultiStepNotificationItem from '../components/BAIMultiStepNotificationItem';
import { SSEEventHandlerTypes, listenToBackgroundTask } from '../helper';
import { useBAISettingUserState } from './useBAISetting';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { ArgsProps } from 'antd/lib/notification';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import React, {
  Key,
  ReactNode,
  useEffect,
  useEffectEvent,
  useRef,
} from 'react';
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

export interface NotificationState<T = any> extends Omit<
  ArgsProps,
  'placement' | 'key' | 'icon'
> {
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
  onRetry?: (() => void) | null;
  skipDesktopNotification?: boolean;
  extraData: any;
  multiStep?: {
    currentStep: number;
    totalSteps: number;
    steps: Array<{
      label: string;
      status:
        | 'idle'
        | 'pending'
        | 'resolved'
        | 'rejected'
        | 'warned'
        | 'cancelled';
      progress?: number;
    }>;
    overallStatus:
      | 'idle'
      | 'running'
      | 'completed'
      | 'failed'
      | 'warned'
      | 'cancelled';
  };
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
 * Module-level helper: fires a desktop Notification for the given state.
 */
function _upsertDesktopNotification(
  params: Partial<Omit<NotificationState, 'created'>>,
  t: (key: string) => string,
) {
  // Access `message` via cast: it is deprecated in antd v6 ArgsProps but
  // existing callers still populate it. Prefer `title` when available.
  const legacyMessage = (params as { message?: ReactNode }).message;
  const title =
    extractTextFromReactNode(params.title ?? legacyMessage) ||
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
}

/**
 * Custom hook that listens to background tasks and updates notifications accordingly.
 * Also reactively opens/updates/closes antd notifications based on notificationListState.
 */
export const useBAINotificationEffect = () => {
  'use memo';
  const _notifications = useAtomValue(notificationListState);
  const setNotifications = useSetAtom(notificationListState);

  const app = App.useApp();
  const { styles } = useStyle();
  const webuiNavigate = useWebUINavigate();
  const [desktopNotification] = useBAISettingUserState('desktop_notification');
  const { t } = useTranslation();

  const listeningTaskIdsRef = useRef<(string | undefined)[]>([]);
  const listeningPromiseKeysRef = useRef<NotificationState['key'][]>([]);
  const { upsertNotification, closeNotification } = useSetBAINotification();

  // Reactive antd notification opener.
  //
  // upsertNotification is PURE (only updates Jotai state). This effect is the
  // single place that calls app.notification.open() / destroy(), ensuring the
  // antd side-effect is always deferred to after React's commit phase rather
  // than being called synchronously during a state update or event handler.
  // That separation prevents antd's NoticeList from recreating its internal
  // `keys` array mid-render and triggering an infinite setHoverKeys loop.
  const processNotifications = useEffectEvent(
    (notifications: NotificationState[]) => {
      notifications.forEach((notification) => {
        if (!notification.key) return;
        const isActive = _activeNotificationKeys.includes(notification.key);

        if (notification.open === true) {
          const isNew = !isActive;
          if (isNew) {
            _activeNotificationKeys.push(notification.key);
            if (!notification.skipDesktopNotification && desktopNotification) {
              _upsertDesktopNotification(notification, t);
            }
          }
          const key = notification.key;
          app.notification.open({
            ...notification,
            icon: undefined,
            type: undefined,
            placement: 'bottomRight',
            // Suppress antd's built-in header; all content lives in description.
            message: undefined,
            title: undefined,
            className: styles.notificationItem,
            description: notification.node ? (
              <BAINodeNotificationItem
                notification={notification}
                nodeFrgmt={notification.node}
              />
            ) : notification.multiStep ? (
              <BAIMultiStepNotificationItem
                notification={notification}
                onRetry={notification.onRetry ?? undefined}
                onCancel={notification.onCancel ?? undefined}
              />
            ) : (
              <BAIGeneralNotificationItem
                notification={notification}
                onClickAction={() => {
                  if (notification.to) {
                    webuiNavigate(notification.to);
                  }
                  closeNotification(key);
                }}
              />
            ),
            onClose() {
              _.remove(_activeNotificationKeys, (k) => k === key);
              setNotifications((prevList) => {
                const idx = prevList.findIndex((n) => n.key === key);
                if (idx < 0) return prevList;
                const newList = [...prevList];
                newList[idx] = { ...newList[idx], open: false };
                return newList;
              });
            },
          });
        } else if (notification.open === false && isActive) {
          _.remove(_activeNotificationKeys, (k) => k === notification.key);
          app.notification.destroy(notification.key);
        }
      });
    },
  );

  useEffect(() => {
    processNotifications(_notifications);
  }, [_notifications]);

  // Background task listeners
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
              open: true,
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
              open: true,
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
        listeningTaskIdsRef.current.push(notification.backgroundTask?.taskId);
        const SSEEventHandler: SSEEventHandlerTypes<BackgroundTaskEvent> = {
          onUpdated: _.throttle(
            (data) => {
              const ratio = data.current_progress / data.total_progress;
              upsertNotification({
                key: notification.key,
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
              backgroundTask: {
                status: 'resolved',
                percent: 100,
              },
              duration: CLOSING_DURATION,
              open: true,
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
              backgroundTask: {
                status: 'rejected',
                percent: ratio * 100,
              },
              extraDescription:
                notification?.backgroundTask
                  ?.renderDataMessage?.(data?.message)
                  ?.toString() || data?.message,
              duration: CLOSING_DURATION,
              open: true,
              skipDesktopNotification: notification.skipDesktopNotification,
            });
          },
          onFailed: (data) => {
            upsertNotification({
              key: notification.key,
              backgroundTask: {
                status: 'rejected',
              },
              extraDescription:
                notification?.backgroundTask
                  ?.renderDataMessage?.(data?.message)
                  ?.toString() || data?.message,
              duration: CLOSING_DURATION,
              open: true,
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
              backgroundTask: {
                status: 'rejected',
                percent: ratio * 100,
              },
              duration: CLOSING_DURATION,
              open: true,
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
  }, [_notifications, upsertNotification]);
};

/**
 * Custom hook for managing BAI notifications.
 * @returns An object containing functions for manipulating notifications.
 */
export const useSetBAINotification = () => {
  'use memo';

  const setNotifications = useSetAtom(notificationListState);
  const app = App.useApp();

  const closeAllNotifications = () => {
    _activeNotificationKeys.splice(0, _activeNotificationKeys.length);
    app.notification.destroy();
    // Mark all notifications as closed so the reactive opener does not
    // re-show them on the next state change.
    setNotifications((prev) => prev.map((n) => ({ ...n, open: false })));
  };

  /**
   * Function to permanently clear all notifications.
   */
  const clearAllNotifications = () => {
    _activeNotificationKeys.splice(0, _activeNotificationKeys.length);
    app.notification.destroy();
    setNotifications([]);
  };

  /**
   * Function to hide specific notification. It remains in the drawer.
   */
  const closeNotification = (key: React.Key) => {
    app.notification.destroy(key);
  };

  /**
   * Function to remove specific notification from the list and hide it.
   */
  const clearNotification = (key: React.Key) => {
    setNotifications((prev) => prev.filter((n) => n.key !== key));
    closeNotification(key);
  };

  /**
   * Pure state updater — only writes to notificationListState.
   * The reactive effect in useBAINotificationEffect is solely responsible
   * for calling app.notification.open() / destroy().
   */
  const upsertNotification = <T = any,>(
    params: Partial<Omit<NotificationState<T>, 'created'>>,
    options: NotificationOptions = {},
  ): React.Key | undefined => {
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
        {},
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

      // For pending background tasks, default to duration: 0 (stay open) unless explicitly set
      if (
        newNotification.backgroundTask?.status === 'pending' &&
        !('duration' in params)
      ) {
        newNotification = {
          ...newNotification,
          duration: 0,
        };
      }

      if (existingIndex >= 0) {
        nextNotifications = [
          ...prevNotifications.slice(0, existingIndex),
          newNotification,
          ...prevNotifications.slice(existingIndex + 1),
        ];
      } else {
        nextNotifications = [newNotification, ...prevNotifications];
        if (nextNotifications.length > 100) {
          nextNotifications = nextNotifications.slice(
            nextNotifications.length - 100,
          );
        }
      }

      currentKey = newNotification.key;
      return nextNotifications;
    });

    return currentKey;
  };

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
