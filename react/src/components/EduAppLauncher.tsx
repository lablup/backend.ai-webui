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
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useBackendAIAppLauncher } from '../hooks/useBackendAIAppLauncher';
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

const EduAppLauncher: React.FC<EduAppLauncherProps> = ({
  apiEndpoint,
  active,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const hasLaunchedRef = useRef(false);
  const [stage, setStage] = useState<EduAppLaunchStage>({ name: 'idle' });

  /**
   * Surface a user-facing notification via the React notification system
   * using `useSetBAINotification` on the EduAppLauncher page.
   */
  const notify = useCallback(
    (
      message: string,
      detail?: string,
      persistent = false,
      log?: Record<string, unknown>,
    ) => {
      const shouldSaveLog = log && Object.keys(log).length !== 0;
      upsertNotification({
        open: true,
        type: shouldSaveLog ? 'error' : undefined,
        message,
        description: message === detail ? undefined : detail,
        duration: persistent ? 0 : undefined,
      });
    },
    [upsertNotification],
  );

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
          notify(t('eduapi.CannotAuthorizeSessionByToken'));
          return false;
        }
      }
      return true;
    } catch (err) {
      logger.error('Token login failed:', err);
      notify(t('eduapi.CannotAuthorizeSessionByToken'));
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
   * Handle API errors and show notification messages.
   */
  const _handleError = useCallback(
    (err: any) => {
      if (err?.message) {
        const message = err.description ?? err.message;
        notify(message, err.message, true, err);
      } else if (err?.title) {
        notify(err.title, undefined, true, err);
      }
    },
    [notify],
  );

  /**
   * Transition the state machine to the launch error state and surface
   * the error via the React notification system. FR-2487 will render
   * this state in the Card UI.
   *
   * Not wrapped in `useCallback`: the outer component uses `'use memo'`
   * so the React Compiler handles memoization. This avoids the stale-dep
   * hazard flagged by reviewers (closes over `_handleError`, which is
   * declared lower in the body and would otherwise be TDZ-unsafe in a
   * useCallback deps array).
   */
  const handleLaunchError = (err: unknown) => {
    logger.error('Failed to launch app:', err);
    const message = (err as any)?.message ?? String(err);
    transition({
      name: 'error',
      step: 'launch',
      message,
    });
    _handleError(err);
  };

  /**
   * Called by the launching child once `useBackendAIAppLauncher` has
   * resolved the proxy connection. Opens the app URL in a new window
   * (per spec) and moves the state machine to `done`. If a popup blocker
   * prevents `window.open` (the launch is not user-gesture driven), fall
   * back to same-tab navigation so the user still reaches the app.
   * `noopener,noreferrer` is passed to prevent reverse-tabnabbing via the
   * opened document (it cannot navigate `window.opener`).
   */
  const handleLaunchSuccess = (appConnectUrl: string) => {
    const newWindow = window.open(
      appConnectUrl,
      '_blank',
      'noopener,noreferrer',
    );
    if (!newWindow) {
      window.location.assign(appConnectUrl);
    }
    transition({ name: 'done' });
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
      notify(t('eduapi.NoSessionTemplate'), undefined, true);
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
          notify(
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
          notify(
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
          notify(t('eduapi.EmptyProject'));
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
          notify(t('eduapi.SessionStillPreparing'), err.message, true, err);
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
      // The Relay loader child mounts on the 'session' stage, fetches
      // the ComputeSessionNode fragment, and transitions to 'launching'.
      // EduAppSessionLauncher then drives useBackendAIAppLauncher.
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
      notify(t('eduapi.CannotInitializeClient'), undefined, true);
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
      // The Relay loader child mounts on the 'session' stage, fetches
      // the ComputeSessionNode fragment, and transitions to 'launching'.
      // EduAppSessionLauncher then drives useBackendAIAppLauncher.
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
      {stage.name === 'launching' ? (
        <React.Suspense fallback={null}>
          <EduAppSessionLauncher
            key={`${stage.requestedApp}:${stage.sessionRowId}`}
            sessionFrgmt={stage.sessionFrgmt}
            requestedApp={stage.requestedApp}
            onLaunched={handleLaunchSuccess}
            onError={handleLaunchError}
          />
        </React.Suspense>
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

/**
 * Headless child that drives `useBackendAIAppLauncher` against the
 * resolved `ComputeSessionNode` fragment. Mounted only when the parent
 * state machine reaches the `launching` stage so that the hook (which
 * suspends on `useSuspendedBackendaiClient` and reads a `useFragment`)
 * can be called unconditionally per the Rules of Hooks.
 *
 * Calls `launchApp` directly (not `launchAppWithNotification`) because
 * the EduAppLauncher page renders outside `MainLayout` and therefore
 * has no `useBAINotificationEffect` subscriber attached to drive the
 * notification's `backgroundTask.promise` lifecycle. The card UI
 * already shows per-step progress, so the notification surface is not
 * needed here. The promise resolves with the work info containing the
 * `appConnectUrl`, which is forwarded to `onLaunched`. `AppLaunchError`
 * (e.g. service port missing → stage `'configuring'`) is forwarded to
 * `onError`.
 */
const EduAppSessionLauncher: React.FC<{
  sessionFrgmt: useBackendAIAppLauncherFragment$key;
  requestedApp: string;
  onLaunched: (appConnectUrl: string) => void;
  onError: (err: unknown) => void;
}> = ({ sessionFrgmt, requestedApp, onLaunched, onError }) => {
  'use memo';

  const { launchApp } = useBackendAIAppLauncher(sessionFrgmt);

  // Stabilize parent callbacks so the effect below only fires once per
  // mount key (`${requestedApp}:${sessionRowId}` on the parent JSX) and
  // is not re-triggered by parent re-renders (e.g., stage transitions
  // that recreate the `onLaunched` / `onError` identities).
  const stableOnLaunched = useMemoizedFn(onLaunched);
  const stableOnError = useMemoizedFn(onError);

  useEffect(() => {
    launchApp({ app: requestedApp })
      .then((workInfo) => {
        const url = workInfo?.appConnectUrl?.href;
        if (!url) {
          stableOnError(new Error('Resolved app connect URL is empty.'));
          return;
        }
        stableOnLaunched(url);
      })
      .catch((err) => {
        stableOnError(err);
      });
  }, [launchApp, requestedApp, stableOnLaunched, stableOnError]);

  return null;
};

export default EduAppLauncher;
