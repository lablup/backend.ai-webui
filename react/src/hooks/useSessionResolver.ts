/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * useSessionResolver - React hook for session find/create logic.
 *
 * Handles both resolution paths for the Education App Launcher:
 * 1. Direct session_id: Skip template lookup and launch app via proxy.
 * 2. Template-based: List existing sessions, match against template image,
 *    check status, and create a new session from the template if needed.
 */
import { connectToProxyWorker, openWsproxy } from '../helper/appLauncherProxy';
import type { AppLauncherResources } from './useAppLauncherParams';
import { useBAILogger } from 'backend.ai-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SessionResolverStatus =
  | 'idle'
  | 'finding'
  | 'creating'
  | 'launching'
  | 'done'
  | 'error';

export interface SessionResolverParams {
  app: string;
  session_id: string | null;
  session_template: string | null;
  resources: AppLauncherResources;
  sToken: string | null;
}

export interface UseSessionResolverReturn {
  resolveSession: () => Promise<void>;
  status: SessionResolverStatus;
  error: string | null;
}

const g = globalThis as any;

const _dispatchNotification = (
  message: string,
  detail?: string,
  persistent = false,
  log?: Record<string, unknown>,
) => {
  const shouldSaveLog = log && Object.keys(log).length !== 0;
  document.dispatchEvent(
    new CustomEvent('add-bai-notification', {
      detail: {
        open: true,
        type: shouldSaveLog ? 'error' : undefined,
        message,
        description: message === detail ? undefined : detail,
        duration: persistent ? 0 : undefined,
      },
    }),
  );
};

const useSessionResolver = (
  params: SessionResolverParams,
): UseSessionResolverReturn => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const [status, setStatus] = useState<SessionResolverStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const _handleError = useCallback((err: any) => {
    setStatus('error');
    if (err?.message) {
      const message: string = err.description ?? err.message;
      setError(message);
      _dispatchNotification(message, err.message, true, err);
    } else if (err?.title) {
      setError(err.title);
      _dispatchNotification(err.title, undefined, true, err);
    }
  }, []);

  /**
   * Open a service app for a resolved session using standalone proxy utilities.
   */
  const _openServiceApp = useCallback(
    async (sessionId: string, appName: string) => {
      setStatus('launching');
      try {
        const resp = await openWsproxy(g.backendaiclient, sessionId, appName);
        if (resp?.url) {
          const appRespUrl = await connectToProxyWorker(resp.url, '');
          const appConnectUrl = appRespUrl?.appConnectUrl
            ? String(appRespUrl.appConnectUrl)
            : resp.url;
          if (!appConnectUrl) {
            _dispatchNotification(
              t('session.appLauncher.ConnectUrlIsNotValid'),
              undefined,
              true,
            );
            setStatus('error');
            setError(t('session.appLauncher.ConnectUrlIsNotValid'));
            return;
          }
          setStatus('done');
          setTimeout(() => {
            window.open(appConnectUrl, '_self');
          });
        }
      } catch (err) {
        logger.error('Failed to open service app:', err);
        _handleError(err);
      }
    },
    [t, logger, _handleError],
  );

  /**
   * Find or create a session from a session template, then launch the app.
   */
  const _resolveViaTemplate = useCallback(async () => {
    setStatus('finding');

    const baiClient = g.backendaiclient;
    const eduAppNamePrefix = baiClient._config.eduAppNamePrefix || '';

    const statusList = [
      'RUNNING',
      'RESTARTING',
      'TERMINATING',
      'PENDING',
      'SCHEDULED',
      baiClient.supports('prepared-session-status') ? 'PREPARED' : undefined,
      baiClient.supports('creating-session-status') ? 'CREATING' : undefined,
      'PREPARING',
      'PULLING',
    ]
      .filter(Boolean)
      .join(',');

    const sessionFields = [
      'session_id',
      'name',
      'image',
      'access_key',
      'status',
      'status_info',
      'service_ports',
      'mounts',
    ];
    const accessKey = baiClient._config.accessKey;

    let sessions: any;
    try {
      sessions = await baiClient.computeSession.list(
        sessionFields,
        statusList,
        accessKey,
        30,
        0,
      );
    } catch (err) {
      _handleError(err);
      return;
    }

    const { app, session_template, resources, sToken } = params;
    let parsedAppName = app;
    const sessionTemplateName = session_template || app;

    if (eduAppNamePrefix !== '' && app.startsWith(eduAppNamePrefix)) {
      parsedAppName = app.slice(eduAppNamePrefix.length);
    }

    let sessionTemplates: any[];
    try {
      const allTemplates = await baiClient.sessionTemplate.list(false);
      sessionTemplates = allTemplates.filter(
        (tmpl: any) => tmpl.name === sessionTemplateName,
      );
    } catch (err) {
      _handleError(err);
      return;
    }

    if (sessionTemplates.length < 1) {
      _dispatchNotification(t('eduapi.NoSessionTemplate'), undefined, true);
      setStatus('error');
      setError(t('eduapi.NoSessionTemplate'));
      return;
    }

    const requestedSessionTemplate = sessionTemplates[0];
    let launchNewSession = true;
    let sessionId: string | null = null;

    if (sessions.compute_session_list.total_count > 0) {
      let matchedSession: Record<string, unknown> | null = null;

      for (let i = 0; i < sessions.compute_session_list.items.length; i++) {
        const sess = sessions.compute_session_list.items[i];
        const sessionImage = sess.image;
        const servicePorts = JSON.parse(sess.service_ports || '{}');
        const services: string[] =
          Object.keys(servicePorts).map((s: string) => servicePorts[s].name) ||
          [];
        const sessionStatus = sess.status;

        if (
          sessionImage !== requestedSessionTemplate.template.spec.kernel.image
        ) {
          _dispatchNotification(
            t('eduapi.CannotCreateSessionWithDifferentImage'),
            undefined,
            true,
          );
          setStatus('error');
          setError(t('eduapi.CannotCreateSessionWithDifferentImage'));
          return;
        }

        if (sessionStatus !== 'RUNNING') {
          _dispatchNotification(
            t('eduapi.SessionStatusIsWithReload', { status: sessionStatus }),
            undefined,
            true,
          );
          setStatus('error');
          setError(
            t('eduapi.SessionStatusIsWithReload', { status: sessionStatus }),
          );
          return;
        }

        if (services.includes(parsedAppName)) {
          matchedSession = sess;
          break;
        }
      }

      if (matchedSession) {
        launchNewSession = false;
        sessionId =
          'session_id' in matchedSession
            ? (matchedSession.session_id as string)
            : null;
      } else {
        launchNewSession = true;
      }
    }

    if (launchNewSession) {
      setStatus('creating');
      const templateId = requestedSessionTemplate.id;

      try {
        const mounts = await baiClient.eduApp.get_mount_folders();
        const projects = await baiClient.eduApp.get_user_projects();

        if (!projects) {
          _dispatchNotification(t('eduapi.EmptyProject'));
          setStatus('error');
          setError(t('eduapi.EmptyProject'));
          return;
        }

        const credentialScript = sToken
          ? (await baiClient.eduApp.get_user_credential(sToken))['script']
          : undefined;

        const sessionResources = {
          ...resources,
          group_name: projects[0]['name'],
          ...(mounts && Object.keys(mounts).length > 0 ? { mounts } : {}),
          ...(credentialScript ? { bootstrap_script: credentialScript } : {}),
        };

        try {
          const response = await baiClient.createSessionFromTemplate(
            templateId,
            null,
            null,
            sessionResources,
            20000,
          );
          sessionId = response.sessionId;
        } catch (err: any) {
          _handleError(err);
          return;
        }
      } catch (err: any) {
        if (err?.message && 'statusCode' in err && err.statusCode === 408) {
          _dispatchNotification(
            t('eduapi.SessionStillPreparing'),
            err.message,
            true,
            err,
          );
          setStatus('error');
          setError(t('eduapi.SessionStillPreparing'));
        } else {
          _handleError(err);
        }
        return;
      }
    }

    if (sessionId) {
      await _openServiceApp(sessionId, parsedAppName);
    }
  }, [params, t, _handleError, _openServiceApp]);

  /**
   * Main entry point: resolve the session using either direct session_id
   * or template-based path, then launch the app.
   */
  const resolveSession = useCallback(async () => {
    const { session_id, app } = params;

    if (session_id) {
      await _openServiceApp(session_id, app);
    } else {
      await _resolveViaTemplate();
    }
  }, [params, _openServiceApp, _resolveViaTemplate]);

  return { resolveSession, status, error };
};

export default useSessionResolver;
