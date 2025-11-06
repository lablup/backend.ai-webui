import { useSuspendedBackendaiClient } from '.';
import { useSetBAINotification } from './useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupState,
} from './useCurrentProject';
import { toGlobalId } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import { useStartSessionCreationQuery } from 'src/__generated__/useStartSessionCreationQuery.graphql';
import { transformPortValuesToNumbers } from 'src/components/PortSelectFormItem';
import { RESOURCE_ALLOCATION_INITIAL_FORM_VALUES } from 'src/components/SessionFormItems/ResourceAllocationFormItems';
import { generateRandomString } from 'src/helper';
import {
  SessionLauncherFormValue,
  SessionResources,
} from 'src/pages/SessionLauncherPage';

// Type for successful session creation result
type SessionCreationSuccess = {
  kernelId?: string;
  sessionId: string;
  sessionName: string;
  servicePorts: Array<{ name: string }>;
};
interface CreateSessionInfo {
  kernelName: string;
  sessionName: string;
  architecture: string;
  batchTimeout?: string;
  resources: SessionResources;
}

export const SESSION_LAUNCHER_NOTI_PREFIX = 'session-launcher:';

export const useStartSession = () => {
  'use memo';

  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const { upsertNotification } = useSetBAINotification();

  const relayEnv = useRelayEnvironment();
  const baiClient = useSuspendedBackendaiClient();
  const supportsMountById = baiClient.supports('mount-by-id');
  const supportBatchTimeout = baiClient?.supports('batch-timeout') ?? false;

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
      ...(supportBatchTimeout && {
        timeoutEnabled: false,
        timeout: undefined,
        timeoutUnit: 's',
      }),
    },
    envvars: [],
    // set default_session_environment only if set
    ...(baiClient._config?.default_session_environment && {
      environments: {
        environment: baiClient._config?.default_session_environment,
      },
    }),
    ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
    resourceGroup: currentGlobalResourceGroup || undefined,
  };

  const startSession = async (values: SessionLauncherFormValue) => {
    // If manual image is selected, use it as kernelName
    const imageFullName =
      values.environments.manual || values.environments.version;
    const [kernelName, architecture] = imageFullName
      ? imageFullName.split('@')
      : ['', ''];

    const sessionName = _.isEmpty(values.sessionName)
      ? generateSessionId()
      : values.sessionName;

    const sessionInfo: CreateSessionInfo = {
      // Basic session information
      sessionName: sessionName,
      kernelName,
      architecture,
      resources: {
        enqueueOnly: true,
        // Project and domain settings
        group_name: values.owner?.enabled
          ? values.owner.project
          : currentProject.name,
        domain: values.owner?.enabled
          ? values.owner.domainName
          : baiClient._config.domainName,

        // Session configuration
        type: values.sessionType,
        cluster_mode: values.cluster_mode,
        cluster_size: values.cluster_size,
        maxWaitSeconds: 15,

        // Owner settings (optional)
        // FYI, `config.scaling_group` also changes based on owner settings
        ...(values.owner?.enabled
          ? {
              owner_access_key: values.owner.accesskey,
            }
          : {}),

        // Batch mode settings (optional)
        ...(values.sessionType === 'batch'
          ? {
              starts_at: values.batch.enabled
                ? values.batch.scheduleDate
                : undefined,
              startupCommand: values.batch.command,
            }
          : {}),

        // Bootstrap script (optional)
        ...(values.bootstrap_script
          ? { bootstrap_script: values.bootstrap_script }
          : {}),

        // Batch timeout configuration (optional)
        ...(supportBatchTimeout &&
        values?.batch?.timeoutEnabled &&
        !_.isUndefined(values?.batch?.timeout)
          ? {
              batchTimeout:
                _.toString(values.batch.timeout) + values?.batch?.timeoutUnit,
            }
          : undefined),

        config: {
          // Resource allocation
          resources: {
            cpu: values.resource.cpu,
            mem: values.resource.mem,
            // Add accelerator only if specified
            ...(values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    values.resource.accelerator,
                }
              : undefined),
          },
          scaling_group: values.owner?.enabled
            ? values.owner.project
            : values.resourceGroup,
          resource_opts: {
            shmem: values.resource.shmem,
            // allow_fractional_resource_fragmentation can be added here if needed
          },

          // Storage configuration
          [supportsMountById ? 'mount_ids' : 'mounts']: values.mount_ids,
          [supportsMountById ? 'mount_id_map' : 'mount_map']:
            values.mount_id_map,

          // Environment variables
          environ: {
            ..._.fromPairs(values.envvars.map((v) => [v.variable, v.value])),
            // set hpcOptimization options: "OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS"
            ...(values.hpcOptimization.autoEnabled
              ? {}
              : _.omit(values.hpcOptimization, 'autoEnabled')),
          },

          // Networking
          preopen_ports: transformPortValuesToNumbers(values.ports),

          // Agent selection (optional)
          ...(baiClient.supports('agent-select') &&
          !baiClient?._config?.hideAgents &&
          values.agent !== 'auto'
            ? {
                // Filter out undefined values
                agent_list: [values.agent].filter(
                  (agent): agent is string => !!agent,
                ),
              }
            : undefined),
        },
      },
    };
    const sessionPromises = _.map(_.range(values.num_of_sessions || 1), (i) => {
      const formattedSessionName =
        (values.num_of_sessions || 1) > 1
          ? `${sessionInfo.sessionName}-${generateRandomString()}-${i}`
          : sessionInfo.sessionName;
      return baiClient
        .createIfNotExists(
          sessionInfo.kernelName,
          formattedSessionName,
          sessionInfo.resources,
          undefined,
          sessionInfo.architecture,
        )
        .then((res: { created: boolean; status: string }) => {
          // // When session is already created with the same name, the status code
          // // is 200, but the response body has 'created' field as false. For better
          // // user experience, we show the notification message.
          if (!res?.created) {
            // message.warning(t('session.launcher.SessionAlreadyExists'));
            throw new Error(t('session.launcher.SessionAlreadyExists'));
          }
          if (res?.status === 'CANCELLED') {
            // Case about failed to start new session kind of "docker image not found" or etc.
            throw new Error(t('session.launcher.FailedToStartNewSession'));
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
    });

    return Promise.allSettled(sessionPromises).then(
      async (
        sessionCreations: PromiseSettledResult<SessionCreationSuccess>[],
      ) => {
        // Group session creations by their status
        const results = _.groupBy(sessionCreations, 'status') as {
          fulfilled?: PromiseFulfilledResult<SessionCreationSuccess>[];
          rejected?: PromiseRejectedResult[];
        };

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

  return { startSession, defaultFormValues, upsertSessionNotification };
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
