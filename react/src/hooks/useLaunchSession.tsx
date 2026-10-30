/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { sanitizeSensitiveEnv } from '../components/EnvVarFormList';
import type { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import { useCurrentResourceGroupState } from './useCurrentProject';
import { useRecentSessionHistory } from './useRecentSessionHistory';
import { type StartSessionResults, useStartSession } from './useStartSession';
import { useBAILogger, useErrorMessageResolver } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

/**
 * The launcher form values as they are shared through `?formValues=`: the
 * resolved image object is dropped and sensitive environment variables are
 * masked.
 */
export const toShareableFormValues = (
  values: Partial<SessionLauncherFormValue>,
) =>
  _.assign(
    _.omit(values, [
      'environments.image',
      'environments.customizedTag',
      'envvars',
    ]),
    { envvars: sanitizeSensitiveEnv(values.envvars ?? []) },
  );

/** Recent-history params for a launch that has no launcher URL to record. */
export const toSessionHistoryParams = (
  values: Partial<SessionLauncherFormValue>,
) =>
  new URLSearchParams({
    formValues: JSON.stringify(toShareableFormValues(values)),
  }).toString();

export interface LaunchSessionOptions {
  numOfSessions?: number;
  /** Ask before launching without a mounted folder. Defaults to `true`. */
  confirmNoFolder?: boolean;
  /** Make the session's resource group the global current one. Defaults to `true`. */
  setGlobalResourceGroup?: boolean;
  /** The recent-history entry to push; `false` skips it. */
  history?: { params: string } | false;
  onSuccess?: (
    fulfilled: NonNullable<StartSessionResults['fulfilled']>,
  ) => void;
}

/**
 * Launches sessions from launcher-shaped form values with the launcher's
 * post-launch handling: the no-folder confirm, the session notification, the
 * global resource group, recent history and the error modals.
 */
export const useLaunchSession = () => {
  'use memo';
  const { t } = useTranslation();
  const app = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();
  const { startSession, defaultFormValues, upsertSessionNotification } =
    useStartSession();
  const [, setCurrentGlobalResourceGroup] = useCurrentResourceGroupState();
  const [, { push: pushSessionHistory }] = useRecentSessionHistory();

  const showLaunchError = (error: any) => {
    if (error?.error_code === 'session_create_already-exists') {
      app.modal.error({
        title: t('session.launcher.SessionAlreadyExists'),
      });
    } else if (
      error?.error_code === 'storage_access_forbidden' ||
      error?.error_code === 'vfolder_access_forbidden'
    ) {
      app.modal.error({
        title: t('session.launcher.StorageAccessForbidden'),
        content: getErrorMessage(error),
      });
    } else if (error?.error_code === 'vfolder_read_not-found') {
      app.modal.error({
        title: t('session.launcher.VFolderNotFound'),
        content: getErrorMessage(error),
      });
    } else {
      app.modal.error({
        title: error?.title,
        content: getErrorMessage(error),
      });
    }
  };

  const confirmNoFolder = () =>
    app.modal.confirm({
      title: t('session.launcher.NoFolderMounted'),
      content: (
        <>
          {t('session.launcher.HomeDirectoryDeletionDialog')}
          <br />
          <br />
          {t('session.launcher.LaunchConfirmationDialog')}
          <br />
          <br />
          {t('dialog.ask.DoYouWantToProceed')}
        </>
      ),
      okText: t('session.launcher.Start'),
      closable: true,
    });

  const launch = async (
    values: SessionLauncherFormValue & { projectName?: string },
    options: LaunchSessionOptions = {},
  ): Promise<StartSessionResults | undefined> => {
    const {
      numOfSessions = 1,
      confirmNoFolder: shouldConfirmNoFolder = true,
      setGlobalResourceGroup = true,
      history,
      onSuccess,
    } = options;

    if (shouldConfirmNoFolder && _.isEmpty(values.vfolderMounts)) {
      const isConfirmed = await confirmNoFolder();
      if (!isConfirmed) return undefined;
    }

    // Shallow defaults: a caller without `envvars` / `hpcOptimization` would
    // otherwise crash in `startSession`.
    const mergedValues = {
      ...defaultFormValues,
      ..._.omitBy(values, _.isUndefined),
      num_of_sessions: numOfSessions,
    } as SessionLauncherFormValue & { projectName?: string };

    return startSession(mergedValues)
      .then((results) => {
        if (results?.fulfilled && results.fulfilled.length > 0) {
          // Not awaited, so callers can navigate or close right away.
          upsertSessionNotification(results.fulfilled);
          if (setGlobalResourceGroup) {
            setCurrentGlobalResourceGroup(values.resourceGroup);
          }
          if (history) {
            pushSessionHistory({
              params: history.params,
              name: results.fulfilled[0].value.sessionName,
            });
          }
          onSuccess?.(results.fulfilled);
        }
        if (results?.rejected && results.rejected.length > 0) {
          showLaunchError(results.rejected[0].reason);
        }
        return results;
      })
      .catch((error) => {
        logger.error('Unexpected error during session creation:', error);
        app.message.error(t('error.UnexpectedError'));
        return undefined;
      });
  };

  return { launch, showLaunchError };
};
