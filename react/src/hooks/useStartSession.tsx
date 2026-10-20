/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useStartSessionCreationQuery } from '../__generated__/useStartSessionCreationQuery.graphql';
import { RESOURCE_ALLOCATION_INITIAL_FORM_VALUES } from '../components/SessionFormItems/ResourceAllocationFormItems';
import { buildSessionPayload } from '../features/session-launcher/domain/payload';
import { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import { useSetBAINotification } from './useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupState,
} from './useCurrentProject';
import { useResolveImageReference } from './useDefaultImagesWithFallback';
import { generateRandomString, toGlobalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

type SessionCreationSuccess = {
  kernelId?: string;
  sessionId: string;
  sessionName: string;
  servicePorts: Array<{ name: string }>;
};

export const SESSION_LAUNCHER_NOTI_PREFIX = 'session-launcher:';

// Field names that have default values in SessionLauncherFormValue
type SessionLauncherDefaultFields =
  | 'sessionType'
  | 'allocationPreset'
  | 'hpcOptimization'
  | 'batch'
  | 'envvars'
  | 'resourceGroup';

// Custom type for environments - mutually exclusive fields
type StartSessionEnvironments = {
  environments:
    | {
        version: string;
        environment?: never;
        image?: never;
        manual?: never;
        customizedTag?: never;
      }
    | {
        version?: never;
        environment: string;
        image?: never;
        manual?: never;
        customizedTag?: never;
      }
    | {
        version?: never;
        environment?: never;
        image?: never;
        manual: string;
        customizedTag?: never;
      };
};

// Type that makes certain fields optional while keeping others required
export type StartSessionValue =
  // Required fields (environments with only version required)
  StartSessionEnvironments &
    // Optional fields from SessionLauncherFormValue
    Partial<Omit<SessionLauncherFormValue, 'environments'>> & {
      /** Pins `group_name` to this project; omitted, the ambient project is
       * used (ADR 0001, FR-3412). */
      projectName?: string;
    };

// Type for minimum required values (all fields except those with defaults are required)
export type StartSessionWithDefaultValue = Omit<
  StartSessionValue,
  | SessionLauncherDefaultFields
  | keyof typeof RESOURCE_ALLOCATION_INITIAL_FORM_VALUES
> &
  DeepPartial<
    Pick<
      StartSessionValue,
      | SessionLauncherDefaultFields
      | keyof typeof RESOURCE_ALLOCATION_INITIAL_FORM_VALUES
    >
  > & {
    dependencies?: string[];
  };

export type StartSessionResults = {
  fulfilled?: PromiseFulfilledResult<SessionCreationSuccess>[];
  rejected?: PromiseRejectedResult[];
};

export const useStartSession = () => {
  'use memo';

  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const { upsertNotification } = useSetBAINotification();

  const relayEnv = useRelayEnvironment();
  const resolveImageReference = useResolveImageReference();
  const baiClient = useSuspendedBackendaiClient();

  const [currentGlobalResourceGroup] = useCurrentResourceGroupState();

  const defaultFormValues: DeepPartial<SessionLauncherFormValue> = {
    sessionType: 'interactive',
    // If you set `allocationPreset` to 'custom', `allocationPreset` is not changed automatically any more.
    allocationPreset: 'auto-select',
    hpcOptimization: {
      autoEnabled: true,
    },
    batch: {
      enabled: false,
      command: undefined,
      scheduleDate: undefined,
      timeoutEnabled: false,
      timeout: undefined,
      timeoutUnit: 's',
    },
    envvars: [],
    ...(baiClient._config?.default_session_environment && {
      environments: normalizeEnvironmentFormat(
        baiClient._config.default_session_environment,
      ),
    }),
    ..._.omit(RESOURCE_ALLOCATION_INITIAL_FORM_VALUES, ['resource']),
    resourceGroup: currentGlobalResourceGroup || undefined,
  };

  const startSessionWithDefault = (
    minimumValues: StartSessionWithDefaultValue,
  ) => {
    const mergedValue = _.merge({}, defaultFormValues, minimumValues);
    return startSession(
      mergedValue as SessionLauncherFormValue & {
        dependencies?: string[];
        projectName?: string;
      },
    );
  };
  const startSession = async (
    values: SessionLauncherFormValue & {
      dependencies?: string[];
      projectName?: string;
    },
  ) => {
    // A manual image is used verbatim; anything else (e.g. a tag-less config
    // value) is resolved against the registered images (FR-3462).
    const imageFullName =
      values.environments.manual ||
      (await resolveImageReference(
        values.environments.version || values.environments.environment,
      ));
    const sessionInfo = buildSessionPayload(values, {
      imageFullName,
      generateSessionName: generateSessionId,
      currentProjectName: currentProject.name,
      domainName: baiClient._config.domainName,
      hideAgents: baiClient?._config?.hideAgents,
    });
    const sessionPromises = _.map(_.range(values.num_of_sessions || 1), (i) => {
      const formattedSessionName =
        (values.num_of_sessions || 1) > 1
          ? `${sessionInfo.sessionName}-${generateRandomString()}-${i}`
          : sessionInfo.sessionName;
      return baiClient
        .createIfNotExists(
          sessionInfo.kernelName,
          formattedSessionName,
          sessionInfo?.resources,
          undefined,
          sessionInfo.architecture,
        )
        .then(
          (res: { created: boolean; status: string; sessionId: string }) => {
            return res;
          },
        )
        .catch((err: any) => {
          if (err?.message?.includes('The session already exists')) {
            throw new Error(t('session.launcher.SessionAlreadyExists'));
          } else {
            throw err;
          }
        });
    });

    return Promise.allSettled(sessionPromises).then(
      async (
        sessionCreations: PromiseSettledResult<SessionCreationSuccess>[],
      ) => {
        const results = _.groupBy(
          sessionCreations,
          'status',
        ) as StartSessionResults;
        return results;
      },
    );
  };

  const upsertSessionNotification = async (
    successCreations: PromiseFulfilledResult<SessionCreationSuccess>[],
    upsertNotificationOverrides?: Parameters<typeof upsertNotification>,
  ) => {
    const promises = _.map(successCreations, (creation) => {
      const session = creation.value;
      return fetchQuery<useStartSessionCreationQuery>(
        relayEnv,
        graphql`
          query useStartSessionCreationQuery($id: GlobalIDField!) {
            compute_session_node(id: $id) {
              ...BAINodeNotificationItemFragment
            }
          }
        `,
        {
          id: toGlobalId('ComputeSessionNode', session.sessionId),
        },
      )
        .toPromise()
        .then((queryResult) => {
          const createdSession = queryResult?.compute_session_node ?? null;

          if (createdSession) {
            upsertNotification(
              {
                key: `${SESSION_LAUNCHER_NOTI_PREFIX}${session.sessionId}`,
                node: createdSession,
                open: true,
                duration: 0,
                ...upsertNotificationOverrides?.[0],
              },
              upsertNotificationOverrides?.[1],
            );
          }
        });
    });
    return Promise.allSettled(promises);
  };

  return {
    startSession,
    startSessionWithDefault,
    defaultFormValues,
    upsertSessionNotification,
  };
};

const generateSessionId = () => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text + '-session';
};

const normalizeEnvironmentFormat = (environment: string) => {
  if (environment.includes(':')) {
    return {
      version: environment,
    };
  } else {
    return {
      environment: environment,
    };
  }
};
