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
import { Alert, Steps } from 'antd';
import { BAICard, BAIFlex, toGlobalId, useBAILogger } from 'backend.ai-ui';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  | { name: 'done'; appConnectUrl: string }
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
  const notify = (
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
  };

  /**
   * Transition helper for the internal state machine. Debug logs trace
   * transitions so the lifecycle is observable from the console.
   */
  const transition = (next: EduAppLaunchStage) => {
    logger.info('[EduAppLauncher] stage transition:', next);
    setStage(next);
  };

  /**
   * Called by EduAppSessionRelayLoader once the Relay query for the
   * resolved session resolves. Hands the `ComputeSessionNode` fragment
   * ref to the state machine so the launching child can feed it into
   * `useBackendAIAppLauncher`.
   */
  const handleSessionFragmentLoaded = (
    sessionFrgmt: useBackendAIAppLauncherFragment$key,
  ) => {
    setStage((prev) => {
      if (prev.name !== 'session') {
        // Defensive guard: a stale Relay load resolved after the parent
        // already transitioned away from the 'session' stage.
        logger.info(
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
  };

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
    logger.info('[EduAppLauncher] handleLaunchSuccess', { appConnectUrl });
    // Best-effort auto-open. Browsers block `window.open` when the call
    // is too far removed from a user gesture, which is exactly our case
    // (the call originates from an async chain following a useEffect).
    // The success card below renders a clickable link as a fallback so
    // a single user click guarantees the new tab. `noopener,noreferrer`
    // prevents reverse-tabnabbing via the opened document.
    const popup = window.open(appConnectUrl, '_blank', 'noopener,noreferrer');
    if (!popup) {
      logger.warn(
        '[EduAppLauncher] window.open returned null — likely blocked by popup blocker; user must click the link in the success card',
        { appConnectUrl },
      );
    } else {
      logger.info('[EduAppLauncher] window.open succeeded', { appConnectUrl });
    }
    transition({ name: 'done', appConnectUrl });
  };

  /**
   * Create or reuse a compute session using the session template,
   * then launch the app.
   */
  const _createEduSession = async (
    resources: Record<string, string | null>,
  ) => {
    logger.info('[_createEduSession] start', { resources });

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
      'image',
      'status',
      'status_info',
      'service_ports',
      'mounts',
    ];
    const accessKey = g.backendaiclient._config.accessKey;

    logger.info('[_createEduSession] step 1: computeSession.list', {
      statusList,
    });
    let sessions: any;
    try {
      sessions = await g.backendaiclient.computeSession.list(
        sessionFields,
        statusList,
        accessKey,
        30,
        0,
      );
      logger.info('[_createEduSession] step 1 result', {
        total_count: sessions?.compute_session_list?.total_count,
        items_len: sessions?.compute_session_list?.items?.length,
      });
    } catch (err) {
      logger.error('[_createEduSession] step 1 FAILED', err);
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
    logger.info('[_createEduSession] parsed url params', {
      requestedApp,
      parsedAppName,
      sessionTemplateName,
      eduAppNamePrefix,
    });

    logger.info('[_createEduSession] step 2: sessionTemplate.list');
    let sessionTemplates: any[];
    try {
      const allTemplates = await g.backendaiclient.sessionTemplate.list(false);
      sessionTemplates = allTemplates.filter(
        (tmpl: any) => tmpl.name === sessionTemplateName,
      );
      logger.info('[_createEduSession] step 2 result', {
        all_templates_count: allTemplates.length,
        looking_for: sessionTemplateName,
        matched_templates_count: sessionTemplates.length,
        matched_template_names: sessionTemplates.map((tmpl: any) => tmpl.name),
      });
      logger.debug('[_createEduSession] step 2 templates', {
        templates: allTemplates.map((t: any) => ({
          id: t.id,
          name: t.name,
          kernel_image: t?.template?.spec?.kernel?.image,
        })),
      });
    } catch (err) {
      logger.error('[_createEduSession] step 2 FAILED', err);
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
      logger.warn(
        '[_createEduSession] no template matched name:',
        sessionTemplateName,
      );
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
    logger.info('[_createEduSession] selected template', {
      id: requestedSessionTemplate?.id,
      name: requestedSessionTemplate?.name,
      kernel_image: requestedSessionTemplate?.template?.spec?.kernel?.image,
    });
    let launchNewSession = true;
    let sessionId: string | null = null;

    logger.info('[_createEduSession] step 3: try matching existing session', {
      existing_count: sessions.compute_session_list.total_count,
    });
    if (sessions.compute_session_list.total_count > 0) {
      let matchedSession: Record<string, unknown> | null = null;

      // Strip the `@<arch>` suffix (Backend.AI convention) from both sides
      // before comparing. The compute_session list returns the base image
      // name (e.g. `cr.backend.ai/stable/python:3.9-ubuntu20.04`) while
      // session templates store the fully qualified form including the
      // architecture (e.g. `...ubuntu20.04@x86_64`). Comparing them as-is
      // would always classify a same-image session as duplicate-image.
      const normalizeImageName = (img: string | undefined | null): string =>
        (img ?? '').split('@')[0];
      const templateImageRaw =
        requestedSessionTemplate?.template?.spec?.kernel?.image;
      const templateImageNorm = normalizeImageName(templateImageRaw);

      for (let i = 0; i < sessions.compute_session_list.items.length; i++) {
        const sess = sessions.compute_session_list.items[i];
        const sessionImage = sess.image;
        const sessionImageNorm = normalizeImageName(sessionImage);
        const servicePorts = JSON.parse(sess.service_ports || '{}');
        const services: string[] =
          Object.keys(servicePorts).map((s: string) => servicePorts[s].name) ||
          [];
        const sessionStatus = sess.status;
        logger.info(`[_createEduSession] step 3: inspecting session #${i}`, {
          session_id: sess.session_id,
          name: sess.name,
          status: sessionStatus,
          image_raw: sessionImage,
          image_normalized: sessionImageNorm,
          template_kernel_image_raw: templateImageRaw,
          template_kernel_image_normalized: templateImageNorm,
          services_joined: services.join(' | '),
          services,
          looking_for_app: parsedAppName,
          image_match: sessionImageNorm === templateImageNorm,
          app_in_services: services.includes(parsedAppName),
        });

        if (sessionImageNorm !== templateImageNorm) {
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
        logger.info('[_createEduSession] step 3: REUSING existing session', {
          sessionId,
        });
      } else {
        launchNewSession = true;
        logger.info(
          '[_createEduSession] step 3: no existing session matched the requested app — will create new',
        );
      }
    } else {
      logger.info(
        '[_createEduSession] step 3: no existing sessions at all — will create new',
      );
    }

    if (launchNewSession) {
      const templateId = requestedSessionTemplate.id;
      logger.info('[_createEduSession] step 4: creating new session', {
        templateId,
      });

      try {
        // The `eduApp.*` API surface is only implemented by specific
        // customer deployments. In environments that do not ship it each
        // call rejects (typically 404 or similar). Treat each as optional
        // and fall back to sensible defaults so the generic session
        // creation still proceeds.

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

        // 4b. projects: fall back to `current_group` that
        // `_prepareProjectInformation` already set on the backend client.
        let projects: Array<{ name: string }> | undefined;
        try {
          projects = await g.backendaiclient.eduApp.get_user_projects();
          logger.info('[_createEduSession] step 4b result', { projects });
        } catch (err) {
          logger.warn(
            '[_createEduSession] step 4b: eduApp.get_user_projects not available, using default (current_group)',
            err,
          );
          projects = undefined;
        }

        const groupName: string | undefined =
          projects?.[0]?.name ?? g.backendaiclient.current_group;
        logger.info('[_createEduSession] step 4b resolved group_name', {
          groupName,
          from_eduapp: !!projects?.[0]?.name,
        });

        // 4c. credential bootstrap script (only when an sToken is present
        // AND the customer-specific endpoint is available).
        const sToken = urlParams.get('sToken') || urlParams.get('stoken');
        logger.info('[_createEduSession] step 4c: get_user_credential', {
          has_sToken: !!sToken,
        });
        let credentialScript: string | undefined;
        if (sToken) {
          try {
            const credResponse =
              await g.backendaiclient.eduApp.get_user_credential(sToken);
            credentialScript = credResponse?.['script'];
            logger.info('[_createEduSession] step 4c result', {
              has_credential_script: !!credentialScript,
              credential_script_length: credentialScript?.length,
            });
          } catch (err) {
            logger.warn(
              '[_createEduSession] step 4c: eduApp.get_user_credential not available, using default (no bootstrap script)',
              err,
            );
            credentialScript = undefined;
          }
        }

        const sessionResources = {
          ...resources,
          ...(groupName ? { group_name: groupName } : {}),
          ...(mounts && Object.keys(mounts).length > 0 ? { mounts } : {}),
          ...(credentialScript ? { bootstrap_script: credentialScript } : {}),
        };
        logger.info('[_createEduSession] step 4d: createSessionFromTemplate', {
          templateId,
          sessionResources: {
            ...sessionResources,
            // Avoid logging the full bootstrap script body
            bootstrap_script: sessionResources.bootstrap_script
              ? `<${(sessionResources.bootstrap_script as string).length} chars>`
              : undefined,
          },
        });

        try {
          const response = await g.backendaiclient.createSessionFromTemplate(
            templateId,
            null,
            null,
            sessionResources,
            20000,
          );
          sessionId = response.sessionId;
          logger.info('[_createEduSession] step 4d result', {
            sessionId,
            response,
          });
        } catch (err: any) {
          logger.error(
            '[_createEduSession] step 4d FAILED createSessionFromTemplate',
            err,
          );
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
        logger.error(
          '[_createEduSession] step 4 outer FAILED (mounts/projects/credential)',
          err,
        );
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
      logger.info(
        '[_createEduSession] step 5: transitioning to session stage',
        { sessionId, parsedAppName, launchNewSession },
      );
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
    logger.info('[EduAppLauncher] _launch() start', { endpoint });
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

    // Dispatch `backend-ai-connected` so any descendant component using
    // `useSuspendedBackendaiClient()` (e.g. `useBackendAIAppLauncher` deep
    // inside `EduAppSessionLauncher`) can resolve. The shared
    // `backendaiClientPromise` is created at module load time and only
    // resolves on this event — `LoginView` dispatches it after a normal
    // login, but the EduAppLauncher token-login flow bypasses LoginView
    // entirely, so we have to dispatch it ourselves once the client is
    // authenticated and ready.
    logger.info('[EduAppLauncher] dispatching backend-ai-connected');
    document.dispatchEvent(
      new CustomEvent('backend-ai-connected', {
        detail: g.backendaiclient,
      }),
    );

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
      logger.info('[EduAppLauncher] _launch: Path A (session_id provided)', {
        sessionId,
      });
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
      logger.info(
        '[EduAppLauncher] _launch: Path B (no session_id, will create or reuse)',
        { resources },
      );
      await _createEduSession(resources);
    }
  };

  // Map the state machine stage to the visual Steps component:
  //   step 0 = Authentication
  //   step 1 = Session (lookup or create)
  //   step 2 = Launch (proxy + window.open)
  // - Stages strictly before the current step are 'finish'.
  // - The current step is 'process', or 'error' when stage.name === 'error'
  //   and the error step matches.
  // - Stages after the current step are 'wait'.
  // - On 'done', all three steps are 'finish'.
  const { currentStep, stepStatuses } = useMemo(() => {
    const STEP_AUTH = 0;
    const STEP_SESSION = 1;
    const STEP_LAUNCH = 2;
    let current = STEP_AUTH;
    let statuses: Array<'wait' | 'process' | 'finish' | 'error'> = [
      'wait',
      'wait',
      'wait',
    ];
    switch (stage.name) {
      case 'idle':
      case 'auth':
        current = STEP_AUTH;
        statuses = ['process', 'wait', 'wait'];
        break;
      case 'session':
        current = STEP_SESSION;
        statuses = ['finish', 'process', 'wait'];
        break;
      case 'launching':
        current = STEP_LAUNCH;
        statuses = ['finish', 'finish', 'process'];
        break;
      case 'done':
        current = STEP_LAUNCH;
        statuses = ['finish', 'finish', 'finish'];
        break;
      case 'error': {
        if (stage.step === 'auth') {
          current = STEP_AUTH;
          statuses = ['error', 'wait', 'wait'];
        } else if (stage.step === 'session') {
          current = STEP_SESSION;
          statuses = ['finish', 'error', 'wait'];
        } else {
          current = STEP_LAUNCH;
          statuses = ['finish', 'finish', 'error'];
        }
        break;
      }
    }
    return { currentStep: current, stepStatuses: statuses };
  }, [stage]);

  // Compute the user-facing Alert title and description for the error
  // stage. For the `session` step, switch on `stage.category` so the five
  // classified error kinds (resource-exhausted, template-missing, timeout,
  // duplicate-image, other) each surface a distinct, translated message —
  // this is the contract from the spec's 인수 조건. For the `launch` step,
  // specialize the "Service port not found" case thrown by
  // `useBackendAIAppLauncher`. In all other cases, fall through to the
  // raw `stage.message`.
  //
  // The Alert description shows the underlying technical `stage.message`
  // (when it adds information) plus the `RefreshToRetry` hint so power
  // users can still see the raw API error detail.
  const { errorTitle, errorDetail } = useMemo(() => {
    if (stage.name !== 'error') {
      return {
        errorTitle: null as string | null,
        errorDetail: null as string | null,
      };
    }

    let title: string;
    if (stage.step === 'session') {
      switch (stage.category) {
        case 'resource-exhausted':
          title = t('eduapi.ResourceExhausted');
          break;
        case 'template-missing':
          title = t('eduapi.NoSessionTemplate');
          break;
        case 'timeout':
          title = t('eduapi.SessionStillPreparing');
          break;
        case 'duplicate-image':
          title = t('eduapi.CannotCreateSessionWithDifferentImage');
          break;
        case 'other':
        default:
          title = t('eduapi.SessionCreationFailed');
          break;
      }
    } else if (
      stage.step === 'launch' &&
      typeof stage.message === 'string' &&
      stage.message.toLowerCase().includes('service port')
    ) {
      title = t('eduapi.ServicePortNotAvailable');
    } else {
      title = stage.message;
    }

    // Only include the raw technical message in the description when it
    // adds information beyond the user-facing title, to avoid duplication.
    const rawMessage =
      typeof stage.message === 'string' &&
      stage.message &&
      stage.message !== title
        ? stage.message
        : null;
    const refreshHint = t('eduapi.RefreshToRetry');
    const detail = rawMessage ? `${rawMessage}\n${refreshHint}` : refreshHint;

    return { errorTitle: title, errorDetail: detail };
  }, [stage, t]);

  if (!active) {
    return null;
  }

  // Render the Step-based card UI. The headless Relay loader and
  // launcher children mount alongside the card when their respective
  // stages are active — the card visualizes progress; the children drive
  // the data flow.
  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ minHeight: '100vh', padding: 24 }}
    >
      <BAICard
        title={t('eduapi.AppLaunch')}
        style={{ width: '100%', maxWidth: 560 }}
      >
        <Steps
          orientation="vertical"
          current={currentStep}
          items={[
            {
              title: t('eduapi.CheckingAuthentication'),
              status: stepStatuses[0],
            },
            {
              title: t('eduapi.PreparingSession'),
              status: stepStatuses[1],
            },
            {
              title: t('eduapi.LaunchingAppStep'),
              status: stepStatuses[2],
            },
          ]}
        />
        {stage.name === 'error' && errorTitle ? (
          <Alert
            style={{ marginTop: 16 }}
            type="error"
            showIcon
            title={errorTitle}
            description={
              <span style={{ whiteSpace: 'pre-line' }}>{errorDetail}</span>
            }
          />
        ) : null}
        {stage.name === 'done' ? (
          <Alert
            style={{ marginTop: 16 }}
            type="success"
            showIcon
            title={t('eduapi.LaunchCompleted')}
          />
        ) : null}
      </BAICard>
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
    </BAIFlex>
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

  // The effect only reacts to the query result. `useEffectEvent` reads
  // the latest parent callbacks (`onLoaded`/`onError`) without forcing
  // them into the dep array — so identity churn from parent re-renders
  // does not re-invoke the effect.
  const onResolved = useEffectEvent(() => {
    if (data?.compute_session_node) {
      onLoaded(data.compute_session_node);
    } else {
      const err = new Error(
        `ComputeSessionNode not found for id: ${sessionRowId}`,
      );
      logger.error('[EduAppLauncher] Relay session lookup returned null', err);
      onError(err);
    }
  });
  useEffect(() => {
    onResolved();
  }, [data, sessionRowId]);

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

  const { logger } = useBAILogger();
  const { launchApp } = useBackendAIAppLauncher(sessionFrgmt);
  // React.StrictMode in development invokes the empty-dep effect below
  // twice on mount. `launchApp` is not idempotent — a duplicate call
  // would allocate a second wsproxy connection and open a second
  // window — so this ref guards against the second invocation.
  const hasLaunchedRef = useRef(false);

  // The effect should fire once per mount (the parent re-mounts this
  // child whenever `requestedApp:sessionRowId` changes via the `key`
  // prop on the JSX). `useEffectEvent` reads the latest closures for
  // `launchApp`, `onLaunched`, `onError`, and `requestedApp` without
  // forcing them into the dep array.
  const onMount = useEffectEvent(() => {
    if (hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;
    logger.info('[EduAppSessionLauncher] effect: calling launchApp', {
      requestedApp,
    });
    launchApp({ app: requestedApp })
      .then((workInfo) => {
        logger.info('[EduAppSessionLauncher] launchApp resolved', {
          appConnectUrl: workInfo?.appConnectUrl?.href,
          reused: workInfo?.reused,
          redirectUrl: workInfo?.redirectUrl,
        });
        const url = workInfo?.appConnectUrl?.href;
        if (!url) {
          logger.error(
            '[EduAppSessionLauncher] resolved appConnectUrl is empty',
            workInfo,
          );
          onError(new Error('Resolved app connect URL is empty.'));
          return;
        }
        onLaunched(url);
      })
      .catch((err) => {
        logger.error('[EduAppSessionLauncher] launchApp rejected', err);
        onError(err);
      });
  });
  useEffect(() => {
    onMount();
  }, []);

  return null;
};

export default EduAppLauncher;