/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Backend.AI Education App Launcher - React Migration
 *
 * Handles token-based authentication, session management, and app launching
 * for education-specific use cases.
 */
import { openWsproxy, connectToProxyWorker } from '../helper/appLauncherProxy';
import { fetchAndParseConfig } from '../hooks/useWebUIConfig';
import { useMemoizedFn } from 'ahooks';
import { toGlobalId, useBAILogger } from 'backend.ai-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { EduAppLauncherSessionQuery } from 'src/__generated__/EduAppLauncherSessionQuery.graphql';
import { useBackendAIAppLauncherFragment$key } from 'src/__generated__/useBackendAIAppLauncherFragment.graphql';

interface EduAppLauncherProps {
  apiEndpoint: string;
  active: boolean;
}

/**
 * Classified session-creation error categories.
 *
 * FR-2487 will map these to per-step Card UI messages. For now the state
 * is produced but not rendered; the legacy notification path still fires
 * alongside so the user still sees feedback in this intermediate PR.
 */
export type EduAppSessionErrorCategory =
  | 'resource-exhausted'
  | 'template-missing'
  | 'timeout'
  | 'duplicate-image'
  | 'other';

/**
 * Staged state machine for the EduAppLauncher flow.
 *
 * Stages progress:
 *   idle -> auth -> session -> launching -> done
 * Any stage may transition to `error` with a step label. The Card UI
 * (FR-2487) consumes this state; FR-2484 introduces the machine only.
 */
export type EduAppLaunchStage =
  | { name: 'idle' }
  | { name: 'auth' }
  | {
      name: 'session';
      sessionRowId: string;
      requestedApp: string;
    }
  | {
      name: 'launching';
      sessionRowId: string;
      requestedApp: string;
      sessionFrgmt: useBackendAIAppLauncherFragment$key;
    }
  | { name: 'done' }
  | {
      name: 'error';
      step: 'auth' | 'session' | 'launch';
      category?: EduAppSessionErrorCategory;
      message: string;
    };

/**
 * Fallback classification of session-creation errors. Only keys off
 * structured fields on the error object — never on message substrings,
 * which are unreliable across locales and wording changes.
 *
 * Categories that can be determined from control flow (e.g.
 * `template-missing` when no template matches, `duplicate-image` when a
 * RUNNING session uses a different image) are set directly at those call
 * sites. This helper is only used as a catch-all when an API call
 * rejects with an unknown error:
 *   - timeout : HTTP 408 (caller kept session creation waiting too long)
 *   - other   : anything else
 */
const classifySessionError = (err: any): EduAppSessionErrorCategory => {
  if (err && typeof err === 'object' && (err as any).statusCode === 408) {
    return 'timeout';
  }
  return 'other';
};

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
        description: message === detail ? undefined : detail,
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
  const [stage, setStage] = useState<EduAppLaunchStage>({ name: 'idle' });

  /**
   * Transition helper for the internal state machine. The state is not
   * rendered yet (FR-2487 will consume it); debug logs trace transitions
   * so the migration is observable until the Card UI lands.
   */
  const transition = useCallback(
    (next: EduAppLaunchStage) => {
      logger.debug('[EduAppLauncher] stage transition:', next);
      setStage(next);
    },
    [logger],
  );

  /**
   * Called by EduAppSessionRelayLoader once the Relay query for the
   * resolved session resolves. This hands the `ComputeSessionNode`
   * fragment ref to the state machine so FR-2485 can later feed it into
   * `useBackendAIAppLauncher`.
   */
  const handleSessionFragmentLoaded = useCallback(
    (sessionFrgmt: useBackendAIAppLauncherFragment$key) => {
      setStage((prev) => {
        if (prev.name !== 'session') {
          // Defensive guard: a stale Relay load resolved after the parent
          // already transitioned away from the 'session' stage. Log it
          // so orphaned loads are visible during debugging (Minor #11).
          logger.debug(
            '[EduAppLauncher] dropping stale session fragment; current stage:',
            prev.name,
          );
          return prev;
        }
        return {
          name: 'launching',
          sessionRowId: prev.sessionRowId,
          requestedApp: prev.requestedApp,
          sessionFrgmt,
        };
      });
    },
    [logger],
  );

  useEffect(() => {
    if (!active || hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;
    _launch(apiEndpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, apiEndpoint]);

  /**
   * Initialize the backend.ai client with session-based auth mode.
   *
   * The caller (`EduAppLauncherPage`) is responsible for providing a
   * non-empty endpoint via `useEduAppApiEndpoint()`, which reads from
   * `config.toml` and suspends until resolved. If the endpoint is still
   * empty here, client initialization will be rejected and the outer
   * catch in `_launch` will surface the error via notification.
   */
  const _initClient = async (endpoint: string) => {
    const resolvedEndpoint = endpoint.trim();

    if (!resolvedEndpoint) {
      throw new Error('API endpoint is empty; cannot initialize client.');
    }

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
    const { config: tomlConfig } = await fetchAndParseConfig(configPath);
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
   *
   * NOTE(FR-2484): The legacy proxy path is still used here to preserve the
   * end-to-end flow while the component is being migrated. FR-2485 will
   * replace this with `useBackendAIAppLauncher().launchAppWithNotification`
   * consuming the Relay fragment ref produced by `EduAppSessionRelayLoader`.
   */
  const _openServiceApp = async (sessionId: string, requestedApp: string) => {
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
          _dispatchNotification(
            t('session.appLauncher.ConnectUrlIsNotValid'),
            undefined,
            true,
          );
          return;
        }
        setTimeout(() => {
          g.open(appConnectUrl, '_self');
        });
        transition({ name: 'done' });
      }
    } catch (err) {
      logger.error('Failed to open service app:', err);
      transition({
        name: 'error',
        step: 'launch',
        message: (err as any)?.message ?? String(err),
      });
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
      sessions = await g.backendaiclient.computeSession.list(
        sessionFields,
        statusList,
        accessKey,
        30,
        0,
      );
    } catch (err) {
      transition({
        name: 'error',
        step: 'session',
        category: classifySessionError(err),
        message: (err as any)?.message ?? String(err),
      });
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
      transition({
        name: 'error',
        step: 'session',
        category: classifySessionError(err),
        message: (err as any)?.message ?? String(err),
      });
      _handleError(err);
      return;
    }

    if (sessionTemplates.length < 1) {
      transition({
        name: 'error',
        step: 'session',
        category: 'template-missing',
        message: t('eduapi.NoSessionTemplate'),
      });
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
          transition({
            name: 'error',
            step: 'session',
            category: 'duplicate-image',
            message: t('eduapi.CannotCreateSessionWithDifferentImage'),
          });
          _dispatchNotification(
            t('eduapi.CannotCreateSessionWithDifferentImage'),
            undefined,
            true,
          );
          return;
        }

        if (sessionStatus !== 'RUNNING') {
          transition({
            name: 'error',
            step: 'session',
            category: 'other',
            message: t('eduapi.SessionStatusIsWithReload', {
              status: sessionStatus,
            }),
          });
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
      } else {
        launchNewSession = true;
      }
    }

    if (launchNewSession) {
      const templateId = requestedSessionTemplate.id;

      try {
        const mounts = await g.backendaiclient.eduApp.get_mount_folders();
        const projects = await g.backendaiclient.eduApp.get_user_projects();

        if (!projects) {
          transition({
            name: 'error',
            step: 'session',
            category: 'other',
            message: t('eduapi.EmptyProject'),
          });
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
          const response = await g.backendaiclient.createSessionFromTemplate(
            templateId,
            null,
            null,
            sessionResources,
            20000,
          );
          sessionId = response.sessionId;
        } catch (err: any) {
          transition({
            name: 'error',
            step: 'session',
            category: classifySessionError(err),
            message: err?.message ?? String(err),
          });
          _handleError(err);
          return;
        }
      } catch (err: any) {
        if (err?.message && 'statusCode' in err && err.statusCode === 408) {
          transition({
            name: 'error',
            step: 'session',
            category: 'timeout',
            message: err.message ?? t('eduapi.SessionStillPreparing'),
          });
          _dispatchNotification(
            t('eduapi.SessionStillPreparing'),
            err.message,
            true,
            err,
          );
        } else {
          transition({
            name: 'error',
            step: 'session',
            category: classifySessionError(err),
            message: err?.message ?? String(err),
          });
          _handleError(err);
        }
        return;
      }
    }

    if (sessionId) {
      // Move the state machine to the 'session' stage so the Relay loader
      // child mounts and fetches the ComputeSessionNode fragment.
      transition({
        name: 'session',
        sessionRowId: sessionId,
        requestedApp: parsedAppName,
      });
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
    transition({ name: 'auth' });
    try {
      await _initClient(endpoint);
    } catch (err) {
      logger.error('Failed to initialize client:', err);
      transition({
        name: 'error',
        step: 'auth',
        message: t('eduapi.CannotInitializeClient'),
      });
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
    if (!loginSuccess) {
      transition({
        name: 'error',
        step: 'auth',
        message: t('eduapi.CannotAuthorizeSessionByToken'),
      });
      return;
    }

    try {
      await _prepareProjectInformation();
    } catch (err) {
      logger.error('Failed to prepare project information:', err);
      transition({
        name: 'error',
        step: 'auth',
        message: (err as any)?.message ?? String(err),
      });
      _handleError(err);
      return;
    }

    const sessionId = urlParams.get('session_id') || null;
    if (sessionId) {
      const requestedApp = urlParams.get('app') || 'jupyter';
      transition({
        name: 'session',
        sessionRowId: sessionId,
        requestedApp,
      });
      _openServiceApp(sessionId, requestedApp);
    } else {
      await _createEduSession(resources);
    }
  };

  if (!active) {
    return null;
  }

  // Mount the Relay loader child only once the session stage has a
  // resolved session row id. The loader does not render any UI; it
  // produces a `ComputeSessionNode` fragment ref via useLazyLoadQuery and
  // hands it back to the parent state machine through onLoaded. The
  // resulting `sessionFrgmt` in the `launching` stage is what FR-2485
  // will feed into `useBackendAIAppLauncher`.
  return (
    <>
      {stage.name === 'session' ? (
        // `useLazyLoadQuery` throws network/GraphQL errors to the nearest
        // ErrorBoundary instead of surfacing them via the `onError` prop
        // below, so an ErrorBoundary is required here to route Relay
        // failures back into the launcher state machine. `resetKeys` on
        // `sessionRowId` lets a subsequent transition recover. The
        // `onError` prop on EduAppSessionRelayLoader still handles the
        // "data resolved but null" case, which does not throw.
        <ErrorBoundary
          fallback={null}
          resetKeys={[stage.sessionRowId]}
          onError={(err) =>
            transition({
              name: 'error',
              step: 'session',
              category: classifySessionError(err),
              message: (err as Error)?.message ?? String(err),
            })
          }
        >
          <React.Suspense fallback={null}>
            <EduAppSessionRelayLoader
              sessionRowId={stage.sessionRowId}
              onLoaded={handleSessionFragmentLoaded}
              onError={(err) =>
                transition({
                  name: 'error',
                  step: 'session',
                  category: classifySessionError(err),
                  message: (err as any)?.message ?? String(err),
                })
              }
            />
          </React.Suspense>
        </ErrorBoundary>
      ) : null}
    </>
  );
};

/**
 * Headless child that loads the `ComputeSessionNode` fragment via Relay
 * for the session resolved by the parent's session-creation / lookup
 * flow. Rendering is intentionally empty (FR-2487 will wire this into
 * the Card UI); it only exists so `useLazyLoadQuery` can suspend outside
 * of the parent's async launch pipeline.
 */
const EduAppSessionRelayLoader: React.FC<{
  sessionRowId: string;
  onLoaded: (sessionFrgmt: useBackendAIAppLauncherFragment$key) => void;
  onError: (err: unknown) => void;
}> = ({ sessionRowId, onLoaded, onError }) => {
  'use memo';

  const { logger } = useBAILogger();

  // Stabilize parent callbacks so the effect below only reacts to the
  // query result itself, not to identity changes from parent re-renders.
  // This avoids re-invoking the callbacks whenever the parent state
  // updates (e.g., during transitions through the stage machine).
  const stableOnLoaded = useMemoizedFn(onLoaded);
  const stableOnError = useMemoizedFn(onError);

  const data = useLazyLoadQuery<EduAppLauncherSessionQuery>(
    graphql`
      query EduAppLauncherSessionQuery($id: GlobalIDField!) {
        compute_session_node(id: $id) {
          ...useBackendAIAppLauncherFragment
        }
      }
    `,
    {
      id: toGlobalId('ComputeSessionNode', sessionRowId),
    },
    // `store-or-network` reuses any ComputeSessionNode already in the Relay
    // store (e.g., after session creation) and only hits the network when it
    // is absent. `network-only` forced an unconditional extra request on
    // every launcher run, which is wasteful since this PR does not yet
    // consume the fragment data along the launch path.
    { fetchPolicy: 'store-or-network' },
  );

  useEffect(() => {
    if (data?.compute_session_node) {
      stableOnLoaded(data.compute_session_node);
    } else {
      const err = new Error(
        `ComputeSessionNode not found for id: ${sessionRowId}`,
      );
      logger.error('[EduAppLauncher] Relay session lookup returned null', err);
      stableOnError(err);
    }
  }, [data, sessionRowId, stableOnLoaded, stableOnError, logger]);

  return null;
};

export default EduAppLauncher;
