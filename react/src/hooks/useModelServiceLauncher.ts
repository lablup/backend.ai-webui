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
import {
  MultiStepNotificationConfig,
  StepDefinition,
  StepWarning,
  useMultiStepNotification,
} from '../hooks/useMultiStepNotification';
import { ESMClientErrorResponse, generateRandomString } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { parse as parseYaml } from 'yaml';

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
 * Fields will be overridden by deployment-config.yaml values where applicable.
 */
export function createServiceInput(
  modelName: string,
  vfolderID: string,
  resourceGroup: string,
): ModelTryFormValue {
  return {
    serviceName: `${modelName}-${generateRandomString(4)}`,
    replicas: 1,
    runtimeVariant: 'custom',
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
      // These fields are replaced with contents from deployment-config.yaml
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

interface DefinitionCheckResult {
  runtimeVariant: string;
}

/**
 * Hook that provides a multi-step notification based service launch flow
 * for starting a service directly from an existing model folder (no clone).
 *
 * Steps:
 *   1. "Checking definition files..." — validate model-definition.yaml & deployment-config.yaml
 *   2. "Creating service..." — POST /services
 *   3. "Waiting for service to be ready..." — poll GET /services/:id
 *
 * On completion: auto-navigates to service detail page
 * On step 1 failure: navigates to folder page or service launcher depending on missing files
 * Supports cancel and retry via useMultiStepNotification.
 */
export function useStartServiceFromFolder(options: {
  modelName: string;
  vfolderId: string;
  navigate: (path: string) => void;
}) {
  'use memo';
  const { modelName, vfolderId, navigate } = options;
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();

  // Store the endpoint_id from step 2 so step 3 and action buttons can reference it
  const endpointIdRef = useRef('');

  const config: MultiStepNotificationConfig = useMemo(() => {
    const steps: StepDefinition[] = [
      {
        label: t('modelService.CheckingDefinitionFiles'),
        type: 'promise',
        executor: async (): Promise<DefinitionCheckResult> => {
          const res = await baiClient.vfolder.list_files('.', vfolderId);
          const files: Array<{ name: string }> = res?.items ?? [];
          const hasModelDefinition = files.some(
            (f) =>
              f.name === 'model-definition.yaml' ||
              f.name === 'model-definition.yml',
          );
          const hasDeploymentConfig = files.some(
            (f) => f.name === 'deployment-config.yaml',
          );

          // No deployment-config → redirect to service start page
          if (!hasDeploymentConfig) {
            throw new StepWarning(t('modelService.DeploymentConfigMissing'));
          }

          // Download and parse deployment-config.yaml
          let text: string;
          try {
            const tokenResponse =
              await baiClient.vfolder.request_download_token(
                'deployment-config.yaml',
                vfolderId,
                false,
              );
            const downloadUrl = `${tokenResponse.url}?token=${tokenResponse.token}&archive=false`;
            const response = await fetch(downloadUrl);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            text = await response.text();
          } catch {
            throw new Error(t('modelService.DeploymentConfigDownloadError'));
          }

          let parsed: Record<string, unknown>;
          try {
            const raw: unknown = parseYaml(text);
            if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
              throw new Error('Invalid YAML structure');
            }
            parsed = raw as Record<string, unknown>;
          } catch {
            throw new Error(t('modelService.DeploymentConfigParseError'));
          }

          // Check runtime_variants field
          const rawVariants = parsed.runtime_variants;

          // runtime_variants not specified → user must choose manually
          if (rawVariants === undefined || rawVariants === null) {
            throw new StepWarning(t('modelService.RuntimeVariantNotSpecified'));
          }

          let runtimeVariant: string;

          if (typeof rawVariants === 'string') {
            const trimmed = rawVariants.trim();
            if (!trimmed) {
              throw new StepWarning(
                t('modelService.RuntimeVariantNotSpecified'),
              );
            }
            runtimeVariant = trimmed;
          } else if (Array.isArray(rawVariants)) {
            if (rawVariants.length === 0) {
              throw new StepWarning(
                t('modelService.RuntimeVariantNotSpecified'),
              );
            }
            if (rawVariants.length > 1) {
              throw new StepWarning(
                t('modelService.RuntimeVariantSelectionRequired'),
              );
            }
            const only = rawVariants[0];
            if (typeof only !== 'string' || !only.trim()) {
              throw new StepWarning(
                t('modelService.RuntimeVariantNotSpecified'),
              );
            }
            runtimeVariant = only.trim();
          } else {
            // Unsupported type (number, object, etc.) → treat as not specified
            throw new StepWarning(t('modelService.RuntimeVariantNotSpecified'));
          }

          // runtime_variant is "custom" → model-definition is required
          if (runtimeVariant === 'custom') {
            if (!hasModelDefinition) {
              throw new Error(t('modelService.ModelDefinitionRequired'));
            }
          }

          return { runtimeVariant };
        },
        onRejected: (error) => {
          // For warnings (StepWarning), redirect to service start page
          if (error instanceof StepWarning) {
            const vfolderIdNoDash = vfolderId.replaceAll('-', '');
            navigate(
              `/service/start?formValues=${encodeURIComponent(JSON.stringify({ vFolderID: vfolderIdNoDash }))}`,
            );
          }
        },
        actionButtons: {
          rejected: {
            label: t('modelService.OpenFolder'),
            onClick: () => {
              navigate(`/data?folder=${vfolderId}`);
            },
          },
        },
      },
      {
        label: t('modelService.CreatingService'),
        type: 'promise',
        executor: async (prevResult) => {
          const definitionResult = prevResult as DefinitionCheckResult;
          const runtimeVariant = definitionResult.runtimeVariant;
          const input = createServiceInput(
            modelName,
            vfolderId,
            currentResourceGroupByProject ?? '',
          );
          const environ: { [key: string]: string } = {};
          if (input.envvars) {
            input.envvars.forEach((v) => (environ[v.variable] = v.value));
          }
          const body: ServiceCreateType = {
            name: input.serviceName,
            desired_session_count: input.replicas,
            runtime_variant: runtimeVariant,
            group: baiClient.current_group,
            domain: currentDomain,
            cluster_size: input.cluster_size,
            cluster_mode: input.cluster_mode,
            open_to_public: input.openToPublic,
            config: {
              model: input.vFolderID,
              model_version: 1,
              model_mount_destination: '/models',
              environ,
              scaling_group: currentResourceGroupByProject ?? '',
              resources: {},
            },
          };
          const result: ServiceResult = await baiSignedRequestWithPromise({
            method: 'POST',
            url: '/services',
            body,
            client: baiClient,
          });
          endpointIdRef.current = result?.endpoint_id ?? '';
          return result;
        },
        onChange: {
          rejected: t('modelService.FailedToStartService'),
        },
      },
    ];

    return {
      key: `start-service-${vfolderId}-${Date.now()}`,
      message: t('modelService.StartModelServiceWithName', {
        name: modelName,
      }),
      steps,
      onAllCompleted: {
        message: t('modelService.StartingModelService'),
        actionButtons: {
          primary: {
            label: t('modelService.GoToServiceDetailPage'),
            onClick: () => {
              navigate(`/serving/${endpointIdRef.current}`);
            },
          },
        },
        callback: (stepResults) => {
          const serviceResult = stepResults[1] as ServiceResult | undefined;
          const endpointId =
            serviceResult?.endpoint_id ?? endpointIdRef.current;
          if (endpointId) {
            navigate(`/serving/${endpointId}`);
          }
        },
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, vfolderId, currentResourceGroupByProject]);

  return useMultiStepNotification(config);
}
