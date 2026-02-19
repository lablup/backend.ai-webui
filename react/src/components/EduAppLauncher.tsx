/**
 * Backend.AI Education App Launcher - React Migration
 *
 * Handles token-based authentication, session management, and app launching
 * for education-specific use cases.
 */
import { openWsproxy, connectToProxyWorker } from '../helper/appLauncherProxy';
import { fetchAndParseConfig } from '../hooks/useWebUIConfig';
import { useBAILogger } from 'backend.ai-ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface EduAppLauncherProps {
  apiEndpoint: string;
  active: boolean;
}

const g = globalThis as any;

/**
 * Dispatch a notification event to the React notification system.
 */
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
        description: detail,
        duration: persistent ? 0 : undefined,
      },
    }),
  );
};

const EduAppLauncher: React.FC<EduAppLauncherProps> = ({
  apiEndpoint,
  active,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const hasLaunchedRef = useRef(false);

  useEffect(() => {
    if (!active || hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;
    _launch(apiEndpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, apiEndpoint]);

  /**
   * Initialize the backend.ai client with session-based auth mode.
   */
  const _initClient = async (endpoint: string) => {
    let resolvedEndpoint = endpoint;

    if (resolvedEndpoint === '') {
      const storedEndpoint = localStorage.getItem(
        'backendaiwebui.api_endpoint',
      );
      if (storedEndpoint != null) {
        resolvedEndpoint = storedEndpoint.replace(/^"+|"+$/g, '');
      }
    }
    resolvedEndpoint = resolvedEndpoint.trim();

    const clientConfig = new g.BackendAIClientConfig(
      '',
      '',
      resolvedEndpoint,
      'SESSION',
    );
    g.backendaiclient = new g.BackendAIClient(
      clientConfig,
      'Backend.AI Web UI.',
    );
    const configPath = g.isElectron ? './config.toml' : '../../config.toml';
    const tomlConfig = await fetchAndParseConfig(configPath);
    if (tomlConfig?.wsproxy?.proxyURL) {
      g.backendaiclient._config._proxyURL = tomlConfig.wsproxy.proxyURL;
    }
    await g.backendaiclient.get_manager_version();
    g.backendaiclient.ready = true;
  };

  /**
   * Authenticate via token from URL query parameters.
   */
  const _token_login = async (): Promise<boolean> => {
    const urlParams = new URLSearchParams(window.location.search);
    const sToken = urlParams.get('sToken') || urlParams.get('stoken') || null;

    if (sToken !== null) {
      document.cookie = `sToken=${encodeURIComponent(sToken)}; path=/; Secure; SameSite=Lax`;
    }

    const extraParams: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      if (key !== 'sToken' && key !== 'stoken') {
        extraParams[key] = value;
      }
    }

    try {
      const alreadyLoggedIn = await g.backendaiclient.check_login();
      if (!alreadyLoggedIn) {
        const loginSuccess = await g.backendaiclient.token_login(
          sToken,
          extraParams,
        );
        if (!loginSuccess) {
          _dispatchNotification(t('eduapi.CannotAuthorizeSessionByToken'));
          return false;
        }
      }
      return true;
    } catch (err) {
      logger.error('Token login failed:', err);
      _dispatchNotification(t('eduapi.CannotAuthorizeSessionByToken'));
      return false;
    }
  };

  /**
   * Fetch and cache group/project information for the current user.
   */
  const _prepareProjectInformation = async () => {
    const fields = ['email', 'groups {name, id}'];
    const query = `query { user{ ${fields.join(' ')} } }`;
    const response = await g.backendaiclient.query(query, {});

    g.backendaiclient.groups = response.user.groups
      .map((item: { name: string }) => item.name)
      .sort();
    g.backendaiclient.groupIds = response.user.groups.reduce(
      (acc: Record<string, string>, group: { name: string; id: string }) => {
        acc[group.name] = group.id;
        return acc;
      },
      {},
    );
    const currentProject = g.backendaiutils._readRecentProjectGroup();
    g.backendaiclient.current_group = currentProject
      ? currentProject
      : g.backendaiclient.groups[0];
    g.backendaiclient.current_group_id = () => {
      return g.backendaiclient.groupIds[g.backendaiclient.current_group];
    };
  };

  /**
   * Open a service app for an existing session using standalone proxy utilities.
   */
  const _openServiceApp = async (sessionId: string, requestedApp: string) => {
    const indicator = await g.lablupIndicator.start();

    try {
      const resp = await openWsproxy(
        g.backendaiclient,
        sessionId,
        requestedApp,
      );
      if (resp?.url) {
        const appRespUrl = await connectToProxyWorker(resp.url, '');
        const appConnectUrl = appRespUrl?.appConnectUrl
          ? String(appRespUrl.appConnectUrl)
          : resp.url;
        if (!appConnectUrl) {
          indicator.end();
          _dispatchNotification(
            t('session.appLauncher.ConnectUrlIsNotValid'),
            undefined,
            true,
          );
          return;
        }
        indicator.set(100, t('session.appLauncher.Prepared'));
        setTimeout(() => {
          g.open(appConnectUrl, '_self');
        });
      }
    } catch (err) {
      logger.error('Failed to open service app:', err);
      indicator.end();
      _handleError(err);
    }
  };

  /**
   * Create or reuse a compute session using the session template,
   * then launch the app.
   */
  const _createEduSession = async (
    resources: Record<string, string | null>,
  ) => {
    const indicator = await g.lablupIndicator.start();
    const eduAppNamePrefix = g.backendaiclient._config.eduAppNamePrefix || '';

    const statusList = [
      'RUNNING',
      'RESTARTING',
      'TERMINATING',
      'PENDING',
      'SCHEDULED',
      g.backendaiclient.supports('prepared-session-status')
        ? 'PREPARED'
        : undefined,
      g.backendaiclient.supports('creating-session-status')
        ? 'CREATING'
        : undefined,
      'PREPARING',
      'PULLING',
    ]
      .filter(Boolean)
      .join(',');

    const sessionFields = [
      'session_id',
      'name',
      'access_key',
      'status',
      'status_info',
      'service_ports',
      'mounts',
    ];
    const accessKey = g.backendaiclient._config.accessKey;

    let sessions: any;
    try {
      indicator.set(20, t('eduapi.QueryingExistingComputeSession'));
      sessions = await g.backendaiclient.computeSession.list(
        sessionFields,
        statusList,
        accessKey,
        30,
        0,
      );
    } catch (err) {
      indicator.end();
      _handleError(err);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const requestedApp = urlParams.get('app') || 'jupyter';
    let parsedAppName = requestedApp;
    const sessionTemplateName =
      urlParams.get('session_template') ||
      urlParams.get('sessionTemplate') ||
      requestedApp;

    if (eduAppNamePrefix !== '' && requestedApp.startsWith(eduAppNamePrefix)) {
      parsedAppName = requestedApp.slice(eduAppNamePrefix.length);
    }

    let sessionTemplates: any[];
    try {
      const allTemplates = await g.backendaiclient.sessionTemplate.list(false);
      sessionTemplates = allTemplates.filter(
        (tmpl: any) => tmpl.name === sessionTemplateName,
      );
    } catch (err) {
      indicator.end();
      _handleError(err);
      return;
    }

    if (sessionTemplates.length < 1) {
      indicator.end();
      _dispatchNotification(t('eduapi.NoSessionTemplate'), undefined, true);
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
          indicator.end();
          _dispatchNotification(
            t('eduapi.CannotCreateSessionWithDifferentImage'),
            undefined,
            true,
          );
          return;
        }

        if (sessionStatus !== 'RUNNING') {
          indicator.end();
          _dispatchNotification(
            t('eduapi.SessionStatusIsWithReload', { status: sessionStatus }),
            undefined,
            true,
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
        indicator.set(50, t('eduapi.FoundExistingComputeSession'));
      } else {
        launchNewSession = true;
      }
    }

    if (launchNewSession) {
      indicator.set(40, t('eduapi.FindingSessionTemplate'));
      const templateId = requestedSessionTemplate.id;

      try {
        const mounts = await g.backendaiclient.eduApp.get_mount_folders();
        const projects = await g.backendaiclient.eduApp.get_user_projects();

        if (!projects) {
          _dispatchNotification(t('eduapi.EmptyProject'));
          return;
        }

        const sToken = urlParams.get('sToken') || urlParams.get('stoken');
        const credentialScript = sToken
          ? (await g.backendaiclient.eduApp.get_user_credential(sToken))[
              'script'
            ]
          : undefined;

        const sessionResources = {
          ...resources,
          group_name: projects[0]['name'],
          ...(mounts && Object.keys(mounts).length > 0 ? { mounts } : {}),
          ...(credentialScript ? { bootstrap_script: credentialScript } : {}),
        };

        try {
          indicator.set(60, t('eduapi.CreatingComputeSession'));
          const response = await g.backendaiclient.createSessionFromTemplate(
            templateId,
            null,
            null,
            sessionResources,
            20000,
          );
          sessionId = response.sessionId;
        } catch (err: any) {
          indicator.end();
          _handleError(err);
          return;
        }
      } catch (err: any) {
        indicator.end();
        if (err?.message && 'statusCode' in err && err.statusCode === 408) {
          _dispatchNotification(
            t('eduapi.SessionStillPreparing'),
            err.message,
            true,
            err,
          );
        } else {
          _handleError(err);
        }
        return;
      }
    }

    indicator.set(100, t('eduapi.ComputeSessionPrepared'));

    if (sessionId) {
      _openServiceApp(sessionId, parsedAppName);
    }
  };

  /**
   * Handle API errors and show notification messages.
   */
  const _handleError = (err: any) => {
    if (err?.message) {
      const message = err.description ?? err.message;
      _dispatchNotification(message, err.message, true, err);
    } else if (err?.title) {
      _dispatchNotification(err.title, undefined, true, err);
    }
  };

  /**
   * Main launch sequence: init client, token login, prepare project,
   * then start or reuse session and launch the app.
   */
  const _launch = async (endpoint: string) => {
    try {
      await _initClient(endpoint);
    } catch (err) {
      logger.error('Failed to initialize client:', err);
      _dispatchNotification(
        t('eduapi.CannotInitializeClient'),
        undefined,
        true,
      );
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const resources: Record<string, string | null> = {
      cpu: urlParams.get('cpu'),
      mem: urlParams.get('mem'),
      shmem: urlParams.get('shmem'),
      'cuda.shares': urlParams.get('cuda-shares'),
      'cuda.device': urlParams.get('cuda-device'),
    };

    const loginSuccess = await _token_login();
    if (!loginSuccess) return;

    try {
      await _prepareProjectInformation();
    } catch (err) {
      logger.error('Failed to prepare project information:', err);
      _handleError(err);
      return;
    }

    const sessionId = urlParams.get('session_id') || null;
    if (sessionId) {
      const requestedApp = urlParams.get('app') || 'jupyter';
      _openServiceApp(sessionId, requestedApp);
    } else {
      await _createEduSession(resources);
    }
  };

  if (!active) {
    return null;
  }

  return <></>;
};

export default EduAppLauncher;
