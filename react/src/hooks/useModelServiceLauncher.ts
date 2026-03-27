/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ServiceCreateType,
  ServiceLauncherFormValue,
} from '../components/ServiceLauncherPageContent';
import {
  baiSignedRequestWithPromise,
  useBaiSignedRequestWithPromise,
} from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import { ESMClientErrorResponse, generateRandomString } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

// Re-export for consumers who need only these types
export type { ServiceCreateType, ServiceLauncherFormValue };

export type ModelTryFormValue = Omit<
  ServiceLauncherFormValue,
  'environments' | 'resource'
>;

export interface CloneVFolderInput {
  permission: string;
  target_host?: string;
  target_name: string;
  usage_mode: string;
  cloneable?: boolean;
}

export interface CloneResponse {
  bgtask_id: string;
  id: string;
}

export interface ServiceResult {
  endpoint_id?: string;
}

const MAX_RETRIES = 12; // 12 retries * 5 seconds = 1 minute max
const RETRY_INTERVAL_MS = 5000;

/**
 * Creates minimal default service input values.
 * Fields will be overridden by service-definition.toml values where applicable.
 */
export function createServiceInput(
  modelName: string,
  vfolderID: string,
  resourceGroup: string,
): ModelTryFormValue {
  return {
    serviceName: `${modelName}-${generateRandomString(4)}`,
    replicas: 1,
    runtimeVariant: 'vllm',
    cluster_size: 1,
    cluster_mode: 'single-node',
    openToPublic: true,
    resourceGroup: resourceGroup,
    vFolderID: vfolderID,
    modelMountDestination: '/models',
    modelDefinitionPath: '',
    mount_id_map: {},
    envvars: [],
    enabledAutomaticShmem: false,
  };
}

/**
 * Hook that encapsulates all reusable service creation logic for model store:
 * - vfolder clone mutation (`baiClient.vfolder.clone`)
 * - service creation mutation (`POST /services`)
 * - service readiness polling via notification background task
 *
 * Use `mutationToClone` to start a folder clone.
 * Use `mutationToCreateService` to create a service from an existing folder.
 * Use `createServiceNotificationMsg` to attach a polling notification to a new service.
 */
export function useModelServiceLauncher() {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();
  const { upsertNotification } = useSetBAINotification();

  // ── Mutation: POST /services ──────────────────────────────────────────────
  const mutationToCreateService = useTanMutation<
    ServiceResult,
    {
      message?: string;
      error_code?: string;
    },
    ModelTryFormValue
  >({
    mutationFn: (values) => {
      const environ: { [key: string]: string } = {};
      if (values.envvars) {
        values.envvars.forEach((v) => (environ[v.variable] = v.value));
      }
      // These fields are replaced with contents from service-definition.toml
      const body: ServiceCreateType = {
        name: values.serviceName,
        desired_session_count: values.replicas,
        runtime_variant: values.runtimeVariant,
        group: baiClient.current_group,
        domain: currentDomain,
        cluster_size: values.cluster_size,
        cluster_mode: values.cluster_mode,
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderID,
          model_version: 1,
          model_mount_destination: '/models',
          environ,
          scaling_group: currentResourceGroupByProject ?? '',
          resources: {},
        },
      };
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/services',
        body,
        client: baiClient,
      });
    },
  });

  // ── Mutation: vfolder.clone ───────────────────────────────────────────────
  const mutationToClone = useTanMutation<
    CloneResponse,
    ESMClientErrorResponse,
    {
      input: CloneVFolderInput;
      name: string;
    }
  >({
    mutationFn: ({ input, name }) => {
      return baiClient.vfolder.clone(input, name);
    },
  });

  // ── Service readiness polling notification ────────────────────────────────
  /**
   * Creates a BAI notification that polls the service endpoint until active
   * routes appear (or times out after MAX_RETRIES * RETRY_INTERVAL_MS ms).
   *
   * @param result - The service creation result containing the endpoint ID
   * @param modelId - The model ID used to build the chat link on success
   * @param notificationKey - Unique key for this notification entry
   */
  const createServiceNotificationMsg = (
    result: ServiceResult,
    modelId: string,
    notificationKey: string,
  ) => {
    let interval: ReturnType<typeof setInterval> | null = null;

    upsertNotification({
      key: notificationKey,
      open: true,
      message: t('modelService.StartingModelService'),
      description: null,
      duration: 0,
      backgroundTask: {
        promise: new Promise<void>((resolve, reject) => {
          let progress = 0;
          let retryCount = 0;

          // Service creation isn't handled via bgTask, so we poll periodically.
          // We use a fake progress value to indicate that the process is ongoing.
          interval = setInterval(async () => {
            try {
              retryCount++;
              progress += _.random(2, 5);
              upsertNotification({
                key: notificationKey,
                backgroundTask: {
                  status: 'pending',
                  percent: progress > 100 ? 100 : progress,
                },
              });
              const routingStatus = await baiRequestWithPromise({
                method: 'GET',
                url: `/services/${result?.endpoint_id}`,
              });

              // Success: service has active routes
              if (routingStatus.active_routes?.length > 0) {
                return resolve();
              }

              // Timeout: exceeded maximum retries
              if (retryCount >= MAX_RETRIES) {
                return reject(
                  new Error(t('modelService.ModelServiceFailedToStart')),
                );
              }
            } catch (error) {
              return reject(error);
            }
          }, RETRY_INTERVAL_MS);
        }).finally(() => {
          // Cleanup interval regardless of promise outcome
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }),
        onChange: {
          pending: {
            message: t('modelService.StartingModelService'),
            description: null,
          },
          resolved: {
            duration: 0,
            open: true,
            key: notificationKey,
            backgroundTask: {
              status: 'resolved',
              percent: 100,
            },
            message: t('modelService.StartingModelService'),
            description: null,
            to: `/chat?${new URLSearchParams({
              endpointId: result?.endpoint_id ?? '',
              modelId: modelId,
            }).toString()}`,
            toText: t('modelService.PlayYourModelNow'),
          },
          rejected: {
            duration: 0,
            key: notificationKey,
            backgroundTask: {
              status: 'rejected',
              percent: 99,
            },
            message: t('modelService.StartingModelService'),
            description: null,
            to: `/serving/${result?.endpoint_id}`,
            toText: t('modelService.GoToServiceDetailPage'),
          },
        },
        status: 'pending',
        percent: 0,
      },
    });
  };

  return {
    mutationToClone,
    mutationToCreateService,
    createServiceNotificationMsg,
    createServiceInput,
    isPending: mutationToClone.isPending || mutationToCreateService.isPending,
    isClonePending: mutationToClone.isPending,
    isCreatePending: mutationToCreateService.isPending,
  };
}
