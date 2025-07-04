import { createSessionConfig } from '../helper';
import { generateSessionId } from '../pages/SessionLauncherPage';
import { useSuspendedBackendaiClient, useCurrentDomainValue } from './index';
import { useSetBAINotification } from './useBAINotification';
import { useCurrentProjectValue } from './useCurrentProject';
import { App } from 'antd';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type SessionType = 'filebrowser' | 'sftp';

interface SessionButtonConfig {
  vfolderName: string;
  sessionType: SessionType;
  installedImage: any;
  defaultImage?: string;
  resourceLimits: any[];
  architecture?: string;
  labels?: Record<string, any>;
  additionalSessionConfig?: any;
}

interface UseSessionButtonReturn {
  sessionName: string;
  resources: any;
  executeSession: () => Promise<void>;
  config: {
    installedImage: any;
    resourceLimits: any[];
    image: string;
    architecture?: string;
  };
}

export const useSessionButton = ({
  vfolderName,
  sessionType,
  installedImage,
  defaultImage,
  resourceLimits,
  architecture,
  labels = {},
  additionalSessionConfig,
}: SessionButtonConfig): UseSessionButtonReturn => {
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();

  const sessionName = useMemo(() => generateSessionId(), []);

  const config = useMemo(() => {
    const image = defaultImage
      ? defaultImage
      : `${_.get(installedImage, 'registry')}/${_.get(installedImage, 'namespace') ?? _.get(installedImage, 'name')}:${_.get(installedImage, 'tag')}`;

    return {
      installedImage,
      resourceLimits,
      image,
      architecture,
    };
  }, [installedImage, defaultImage, resourceLimits, architecture]);

  const resources = useMemo(
    () =>
      createSessionConfig(
        vfolderName,
        currentDomain,
        currentProject?.name,
        _.toArray(config.resourceLimits ?? []),
        config.architecture,
        labels,
        additionalSessionConfig,
      ),
    [
      vfolderName,
      currentDomain,
      currentProject?.name,
      config.resourceLimits,
      config.architecture,
      labels,
      additionalSessionConfig,
    ],
  );

  const executeSession = async (): Promise<void> => {
    if (!config.image) {
      const errorMessage =
        sessionType === 'filebrowser'
          ? t('data.explorer.NoImagesSupportingFileBrowser')
          : t('data.explorer.SFTPSessionNotAvailable');
      message.error(errorMessage);
      return;
    }

    const sessionPromise = baiClient
      .createIfNotExists(config.image, sessionName, resources, 30000)
      .then((res: { created: boolean; status: string }) => {
        if (!res?.created) {
          throw new Error(t('session.launcher.SessionAlreadyExists'));
        }
        if (res?.status === 'CANCELLED') {
          const errorMessage =
            sessionType === 'filebrowser'
              ? t('session.launcher.FailedToStartNewSession')
              : t('data.explorer.NumberOfSFTPSessionsExceededTitle');
          throw new Error(errorMessage);
        }
        return res;
      })
      .catch((err: any) => {
        if (err?.message?.includes('The session already exists')) {
          throw new Error(t('session.launcher.SessionAlreadyExists'));
        } else {
          throw err;
        }
      });

    upsertNotification({
      key: 'session-launcher:' + sessionName,
      backgroundTask: {
        promise: sessionPromise,
        status: 'pending',
        onChange: {
          pending: t('session.PreparingSession'),
          resolved: t('eduapi.ComputeSessionPrepared'),
        },
      },
      duration: 0,
      message: t('general.Session') + ': ' + sessionName,
      open: true,
    });

    let backupTo = '';

    return await sessionPromise
      .then((res: any) => {
        upsertNotification({
          key: 'session-launcher:' + sessionName,
          to: {
            pathname: '/session',
            search: new URLSearchParams({
              sessionDetail: res.sessionId,
            }).toString(),
          },
        });
        backupTo = `/session?sessionDetail=${res.sessionId}`;
        return { ...res, sessionName };
      })
      .catch(() => {
        upsertNotification({
          key: 'session-launcher:' + sessionName,
          to: backupTo,
          toText: t('button.Edit'),
        });
        throw new Error('Session creation failed');
      });
  };

  return {
    sessionName,
    resources,
    executeSession,
    config,
  };
};
