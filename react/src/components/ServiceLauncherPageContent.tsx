/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ServiceLauncherPageContentFragment$key } from '../__generated__/ServiceLauncherPageContentFragment.graphql';
import { ServiceLauncherPageContentModifyMutation } from '../__generated__/ServiceLauncherPageContentModifyMutation.graphql';
import { ServiceLauncherPageContent_AutoScalingRulesQuery } from '../__generated__/ServiceLauncherPageContent_AutoScalingRulesQuery.graphql';
import { ServiceLauncherPageContent_ModelDefinitionQuery } from '../__generated__/ServiceLauncherPageContent_ModelDefinitionQuery.graphql';
import { ServiceLauncherPageContent_UserInfoQuery } from '../__generated__/ServiceLauncherPageContent_UserInfoQuery.graphql';
import { ServiceLauncherPageContent_UserResourcePolicyQuery } from '../__generated__/ServiceLauncherPageContent_UserResourcePolicyQuery.graphql';
import {
  baiSignedRequestWithPromise,
  compareNumberWithUnits,
  convertToBinaryUnit,
  useBaiSignedRequestWithPromise,
} from '../helper';
import { generateModelDefinitionYaml } from '../helper/generateModelDefinitionYaml';
import { parseCliCommand } from '../helper/parseCliCommand';
import { parseModelDefinitionYaml } from '../helper/parseModelDefinitionYaml';
import {
  mergeExtraArgs,
  reverseMapExtraArgs,
} from '../helper/runtimeExtraArgsParser';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { KnownAcceleratorResourceSlotName } from '../hooks/backendai';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import {
  useCurrentResourceGroupState,
  useCurrentProjectValue,
} from '../hooks/useCurrentProject';
import {
  getExtraArgsEnvVarName,
  getAllExtraArgsEnvVarNames,
  flattenPresets,
  buildArgsSchemaKeySet,
  buildDefaultsMap,
  type RuntimeParameterGroup,
} from '../hooks/useRuntimeParameterSchema';
import { useValidateServiceName } from '../hooks/useValidateServiceName';
import { useRuntimeEnvVarConfigs } from '../hooks/useVariantConfigs';
import EnvVarFormList, {
  sanitizeSensitiveEnv,
  EnvVarFormListValue,
} from './EnvVarFormList';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import InputNumberWithSlider from './InputNumberWithSlider';
import RuntimeParameterFormSection, {
  RuntimeParameterValues,
} from './RuntimeParameterFormSection';
import ClusterModeFormItems from './SessionFormItems/ClusterModeFormItems';
import ResourceAllocationFormItems, {
  AUTOMATIC_DEFAULT_SHMEM,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from './SessionFormItems/ResourceAllocationFormItems';
import SwitchToProjectButton from './SwitchToProjectButton';
import VFolderLazyViewV2 from './VFolderLazyViewV2';
import VFolderSelect from './VFolderSelect';
import VFolderTableFormItem from './VFolderTableFormItem';
import { useDebounceFn } from 'ahooks';
import {
  App,
  Button,
  Card,
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Segmented,
  Skeleton,
  Select,
  theme,
  Tooltip,
  Tag,
  Alert,
} from 'antd';
import {
  BAIModal,
  BAIFlex,
  ESMClientErrorResponse,
  filterOutNullAndUndefined,
  useErrorMessageResolver,
  useBAILogger,
  BAIResourceNumberWithIcon,
  BAIButton,
  toGlobalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';
import {
  BooleanParam,
  JsonParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

const ServiceValidationView = React.lazy(
  () => import('./ServiceValidationView'),
);

type ClusterMode = 'single-node' | 'multi-node';

interface ServiceCreateConfigResourceOptsType {
  shmem?: number | string;
}

type ServiceCreateConfigResourceType = {
  cpu?: number | string;
  mem?: string;
} & {
  [key in KnownAcceleratorResourceSlotName]?: number | string;
};
export interface MountOptionType {
  mount_destination?: string;
  type?: string;
  permission?: string;
}

interface ServiceCreateConfigType {
  model: string;
  model_version?: number;
  model_mount_destination?: string; // default == "/models"
  model_definition_path?: string; // default == "model-definition.yaml"
  environ: object; // environment variable
  scaling_group: string;
  resources: ServiceCreateConfigResourceType;
  resource_opts?: ServiceCreateConfigResourceOptsType;
  extra_mounts?: Record<string, MountOptionType>;
}
export interface ServiceCreateType {
  name: string;
  desired_session_count?: number;
  replicas?: number;
  image?: string;
  architecture?: string;
  runtime_variant: string;
  group: string;
  domain: string;
  cluster_size: number;
  cluster_mode: ClusterMode;
  tag?: string;
  startup_command?: string;
  bootstrap_script?: string;
  owner_access_key?: string;
  open_to_public: boolean;
  config: ServiceCreateConfigType;
}
export type CustomDefinitionMode = 'command' | 'file';

interface ServiceLauncherInput extends ImageEnvironmentFormInput {
  serviceName: string;
  vFolderID: string;
  replicas: number;
  openToPublic: boolean;
  modelMountDestination: string;
  modelDefinitionPath: string;
  mount_id_map: Record<string, string>;
  mount_ids?: Array<string>;
  envvars: EnvVarFormListValue[];
  runtimeVariant: string;
  // "Paste Your Command" fields
  customDefinitionMode?: CustomDefinitionMode;
  startCommand?: string;
  commandPort?: number;
  commandHealthCheck?: string;
  commandModelMount?: string;
  commandInitialDelay?: number;
  commandMaxRetries?: number;
}

export type ServiceLauncherFormValue = ServiceLauncherInput &
  ImageEnvironmentFormInput &
  ResourceAllocationFormValue;

interface InitialModelDef {
  readonly models: ReadonlyArray<{
    readonly service?: {
      readonly startCommand: unknown;
      readonly port?: number | null;
      readonly healthCheck?: {
        readonly path?: string | null;
        readonly initialDelay?: number | null;
        readonly maxRetries?: number | null;
      } | null;
    } | null;
  } | null> | null;
}

interface ServiceLauncherPageContentProps {
  endpointFrgmt?: ServiceLauncherPageContentFragment$key | null;
  initialModelDef?: InitialModelDef | null;
}

const ServiceLauncherPageContent: React.FC<ServiceLauncherPageContentProps> = ({
  endpointFrgmt = null,
  initialModelDef,
}) => {
  'use memo';
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  const relayEnv = useRelayEnvironment();

  // Setup query parameters for URL synchronization
  const FormValuesParam = withDefault(JsonParam, {});
  const [
    { model, formValues: formValuesFromQueryParams, advancedMode },
    setQuery,
  ] = useQueryParams({
    model: StringParam,
    formValues: FormValuesParam,
    advancedMode: withDefault(BooleanParam, false),
  });

  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const validationRules = useValidateServiceName();
  const [isOpenServiceValidationModal, setIsOpenServiceValidationModal] =
    useState(false);
  const [form] = Form.useForm<ServiceLauncherFormValue>();
  const [wantToChangeResource, setWantToChangeResource] = useState(false);
  const [currentGlobalResourceGroup, setCurrentGlobalResourceGroup] =
    useCurrentResourceGroupState();

  const { getErrorMessage } = useErrorMessageResolver();
  const RUNTIME_ENV_VAR_CONFIGS = useRuntimeEnvVarConfigs();
  const currentProject = useCurrentProjectValue();

  // Runtime parameter values stored in a ref to avoid re-rendering the entire
  // page on every slider change. Values are read at submit time only.
  const runtimeParamValuesRef = useRef<RuntimeParameterValues>({});
  const runtimeParamTouchedKeysRef = useRef<Set<string>>(new Set());
  // Preset groups from the API, stored in a ref for serialization at submit time.
  const runtimeParamGroupsRef = useRef<RuntimeParameterGroup[] | null>(null);
  const handleGroupsLoaded = useCallback(
    (groups: RuntimeParameterGroup[] | null) => {
      runtimeParamGroupsRef.current = groups;
    },
    [],
  );
  const handleRuntimeParamChange = useCallback(
    (values: RuntimeParameterValues) => {
      runtimeParamValuesRef.current = {
        ...runtimeParamValuesRef.current,
        ...values,
      };
    },
    [],
  );
  const handleTouchedKeysChange = useCallback((keys: Set<string>) => {
    runtimeParamTouchedKeysRef.current = keys;
  }, []);
  const getTouchedRuntimeValues = useCallback(() => {
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(runtimeParamValuesRef.current)) {
      if (runtimeParamTouchedKeysRef.current.has(key)) {
        result[key] = val;
      }
    }
    return result;
  }, []);

  /**
   * Serialize runtime parameter UI values into environ.
   * - Removes stale EXTRA_ARGS env vars from other runtime variants.
   * - For ARGS-type presets: merges touched values into the runtime's EXTRA_ARGS env var.
   * - For ENV-type presets: sets touched values as individual env vars.
   */
  const serializeRuntimeParamsToEnviron = useCallback(
    (environ: Record<string, string>, runtimeVariant: string) => {
      const groups = runtimeParamGroupsRef.current;

      // Skip cleanup and serialization when no preset groups are loaded
      // (e.g., custom runtime — don't erase user-specified EXTRA_ARGS)
      if (!groups || Object.keys(runtimeParamValuesRef.current).length === 0) {
        return;
      }

      const extraArgsEnvVar = getExtraArgsEnvVarName(runtimeVariant);

      // Remove stale EXTRA_ARGS env vars from other runtime variants
      for (const envName of getAllExtraArgsEnvVarNames()) {
        if (envName !== extraArgsEnvVar) {
          delete environ[envName];
        }
      }

      const touchedValues = getTouchedRuntimeValues();
      const presets = flattenPresets(groups);
      const presetMap = new Map(presets.map((p) => [p.key, p]));
      const defaults = buildDefaultsMap(groups);

      // Separate touched values by presetTarget
      const argsValues: Record<string, string> = {};
      const envValues: Record<string, string> = {};

      for (const [key, val] of Object.entries(touchedValues)) {
        // Skip empty/cleared values — omit the key entirely
        if (val === '' || val === undefined) continue;

        const preset = presetMap.get(key);
        if (!preset) continue;

        if (preset.presetTarget === 'ENV') {
          envValues[key] = val;
        } else {
          // ARGS: use CLI flag key
          argsValues[key] = val;
        }
      }

      // Always strip managed ARGS keys from existing EXTRA_ARGS.
      // This ensures reset (empty touchedKeys) properly cleans up previously set values.
      const argsSchemaKeys = buildArgsSchemaKeySet(groups);
      if (environ[extraArgsEnvVar] && argsSchemaKeys.size > 0) {
        const { unmappedText } = reverseMapExtraArgs(
          environ[extraArgsEnvVar],
          argsSchemaKeys,
        );
        if (unmappedText) {
          environ[extraArgsEnvVar] = unmappedText;
        } else {
          delete environ[extraArgsEnvVar];
        }
      }

      // Always strip all ENV-preset keys from environ.
      // This ensures reset (empty touchedKeys) properly cleans up previously set values.
      for (const preset of presets) {
        if (preset.presetTarget === 'ENV') {
          delete environ[preset.key];
        }
      }

      // Merge ARGS-type values into EXTRA_ARGS env var
      if (Object.keys(argsValues).length > 0) {
        const manualArgs = environ[extraArgsEnvVar] ?? '';
        const merged = mergeExtraArgs(argsValues, manualArgs, defaults);
        if (merged) {
          environ[extraArgsEnvVar] = merged;
        } else {
          delete environ[extraArgsEnvVar];
        }
      }

      // Set ENV-type values as individual env vars
      for (const [key, val] of Object.entries(envValues)) {
        // Skip if value matches default
        const preset = presetMap.get(key);
        if (preset?.defaultValue !== null && preset?.defaultValue === val) {
          continue;
        }
        environ[key] = val;
      }
    },
    [getTouchedRuntimeValues],
  );

  // Environment search prefill keyword driven by runtime variant selection
  const RUNTIME_SEARCH_KEYWORD_MAP: Partial<Record<string, string>> = {
    vllm: 'vllm',
    sglang: 'sglang',
    'modular-max': 'max',
    nim: 'nim',
  };
  const [envSearchPrefill, setEnvSearchPrefill] = useState<string>();

  // "Paste Your Command" — GPU hint from parsed CLI command
  const [gpuHint, setGpuHint] = useState<number | null>(null);

  // Debounced CLI command parser for auto-filling port/health/mount fields
  const { run: parseCommandWithDebounce } = useDebounceFn(
    (command: string) => {
      const parsed = parseCliCommand(command);

      // Auto-fill port, health check, model mount
      form.setFieldsValue({
        commandPort: parsed.port,
        commandHealthCheck: parsed.healthCheckPath,
        commandModelMount: parsed.modelMountDestination,
      });

      // Update GPU hint
      setGpuHint(parsed.gpuHint);

      // Auto-add docker env vars to envvars list
      if (parsed.envVars.length > 0) {
        const currentEnvVars = form.getFieldValue('envvars') || [];
        const existingKeys = new Set(
          currentEnvVars
            .filter((e: EnvVarFormListValue) => e?.variable)
            .map((e: EnvVarFormListValue) => e.variable),
        );
        const newEnvVars = parsed.envVars.filter(
          (e) => !existingKeys.has(e.variable),
        );
        if (newEnvVars.length > 0) {
          form.setFieldValue('envvars', [...currentEnvVars, ...newEnvVars]);
        }
      }
    },
    { wait: 400 },
  );

  // Helper function to set environment variables based on runtime variant
  const setEnvironmentVariablesForRuntimeVariant = (
    runtimeVariant: string,
    allValues: ServiceLauncherFormValue,
  ) => {
    const runtimeConfig = RUNTIME_ENV_VAR_CONFIGS[runtimeVariant];
    if (!runtimeConfig) return;

    const currentEnvVars = allValues.envvars || [];
    const existingVariables = _.map(
      _.filter(
        currentEnvVars,
        (env: EnvVarFormListValue) => env != null && !!env.variable,
      ),
      'variable',
    );

    // Add required environment variables that don't exist
    const newRequiredEnvVars = _.map(
      _.filter(
        runtimeConfig.requiredEnvVars || [],
        (envVar) => !_.includes(existingVariables, envVar.variable),
      ),
      (envVar) => ({
        variable: envVar.variable,
        value: '',
      }),
    );

    if (newRequiredEnvVars.length > 0) {
      const updatedEnvVars = [...currentEnvVars, ...newRequiredEnvVars];
      form.setFieldValue('envvars', updatedEnvVars);
    }
  };

  // Validation function for environment variables based on runtime variant
  const validateVariable = (
    runtimeVariant: string | undefined,
    variableName: string,
  ) => {
    if (!runtimeVariant || !variableName) {
      return true; // Don't validate if no runtime variant or variable name
    }
    const currentRuntimeConfig = RUNTIME_ENV_VAR_CONFIGS[runtimeVariant];
    if (!currentRuntimeConfig) {
      return true; // Don't validate if runtime config not found
    }

    // Get all variables from current runtime
    const currentRuntimeVars = [
      ...(currentRuntimeConfig.requiredEnvVars || []),
      ...(currentRuntimeConfig.optionalEnvVars || []),
    ];
    const currentRuntimeVariables = _.map(currentRuntimeVars, 'variable');

    // Get all variables from other runtimes
    const otherRuntimeVariables: string[] = [];
    _.forEach(RUNTIME_ENV_VAR_CONFIGS, (config, runtimeName) => {
      if (runtimeName !== runtimeVariant) {
        const vars = [
          ...(config.requiredEnvVars || []),
          ...(config.optionalEnvVars || []),
        ];
        otherRuntimeVariables.push(..._.map(vars, 'variable'));
      }
    });

    // If variable is defined in current runtime, it's valid
    if (_.includes(currentRuntimeVariables, variableName)) {
      return true;
    }

    // If variable is defined in other runtimes but not in current, it's invalid
    if (_.includes(otherRuntimeVariables, variableName)) {
      return false; // This will trigger the warning
    }

    // If variable is not defined in any runtime config, it's user-defined and valid
    return true;
  };

  // Handler for form values change
  const handleFormValuesChange = (
    changedValues: Partial<ServiceLauncherInput>,
    allValues: ServiceLauncherFormValue,
  ) => {
    if (changedValues.runtimeVariant) {
      setEnvironmentVariablesForRuntimeVariant(
        changedValues.runtimeVariant,
        allValues,
      );
    }
  };

  const endpoint = useFragment(
    graphql`
      fragment ServiceLauncherPageContentFragment on Endpoint {
        endpoint_id
        project
        desired_session_count @deprecatedSince(version: "24.12.0")
        replicas @since(version: "24.12.0")
        resource_group
        resource_slots
        resource_opts
        cluster_mode
        cluster_size
        open_to_public
        model
        model_mount_destination @since(version: "24.03.4")
        model_definition_path @since(version: "24.03.4")
        environ
        runtime_variant @since(version: "24.03.5") {
          name
          human_readable_name
        }
        extra_mounts @since(version: "24.03.4") {
          id
          row_id
          name
        }
        image_object @since(version: "23.09.9") {
          name @deprecatedSince(version: "24.12.0")
          namespace @since(version: "24.12.0")
          humanized_name
          tag
          registry
          architecture
          is_local
          digest
          resource_limits {
            key
            min
            max
          }
          labels {
            key
            value
          }
          size_bytes
          supported_accelerators
        }
        name
      }
    `,
    endpointFrgmt,
  );

  // Check if the endpoint belongs to a different project than the currently selected one
  const isProjectMismatch = endpoint
    ? endpoint.project !== currentProject.id
    : false;

  const { data: availableRuntimes } = useSuspenseTanQuery<{
    runtimes: { name: string; human_readable_name: string }[];
  }>({
    queryKey: ['baiClient.modelService.runtime.list'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/services/_/runtimes`,
      });
    },
    staleTime: 1000,
  });

  const checkManualImageAllowed = (
    isConfigAllowed = false,
    manualImageInput = '',
  ): boolean => {
    return (isConfigAllowed &&
      manualImageInput &&
      !_.isEmpty(manualImageInput)) as boolean;
  };

  const getImageInfoFromInputInEditing = (
    isManualImageEnabled = false,
    formInput: ServiceLauncherInput,
  ) => {
    return {
      image: {
        name: (isManualImageEnabled
          ? formInput.environments.manual?.split('@')[0]
          : formInput.environments.version.split('@')[0]) as string,
        architecture: (isManualImageEnabled
          ? formInput.environments.manual?.split('@')[1]
          : formInput.environments.image?.architecture) as string,
        registry: (isManualImageEnabled
          ? formInput.environments.manual?.split('/')[0]
          : formInput.environments.image?.registry) as string,
      },
    };
  };

  const getImageInfoFromInputInCreating = (
    isManualImageEnabled = false,
    formInput: ServiceLauncherInput,
  ) => {
    return {
      image: (isManualImageEnabled
        ? formInput.environments.manual?.split('@')[0]
        : formInput.environments.version?.split('@')[0]) as string,
      architecture: (isManualImageEnabled
        ? formInput.environments.manual?.split('@')[1]
        : formInput.environments.image?.architecture) as string,
    };
  };

  const mutationToCreateService = useTanMutation<
    unknown,
    ESMClientErrorResponse | undefined,
    ServiceLauncherFormValue
  >({
    mutationFn: async (values) => {
      const isCommandMode =
        values.runtimeVariant === 'custom' &&
        values.customDefinitionMode === 'command' &&
        values.startCommand;

      // "Paste Your Command": generate and upload model-definition.yaml before creating service
      if (isCommandMode) {
        // Check if model-definition.yaml already exists in the vfolder
        const filesRes = await baiClient.vfolder.list_files(
          '.',
          values.vFolderID,
        );
        const existingFiles: Array<{ name: string }> = filesRes?.items ?? [];
        const hasExistingYaml = existingFiles.some(
          (f) => f.name === 'model-definition.yaml',
        );

        if (hasExistingYaml) {
          const confirmed = await new Promise<boolean>((resolve) => {
            modal.confirm({
              title: t('modelService.OverwriteYamlTitle'),
              content: t('modelService.OverwriteYamlContent'),
              okText: t('button.Overwrite'),
              cancelText: t('button.Cancel'),
              onOk: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });
          if (!confirmed) {
            // Throw a cancellation error instead of returning void,
            // so TanStack Query does not trigger onSuccess.
            throw new DOMException('User cancelled overwrite', 'AbortError');
          }
        }

        const yamlContent = generateModelDefinitionYaml({
          startCommand: values.startCommand!,
          port: values.commandPort ?? 8000,
          healthCheckPath: values.commandHealthCheck ?? '/health',
          modelMountDestination: values.commandModelMount ?? '/models',
          initialDelay: values.commandInitialDelay ?? 60,
          maxRetries: values.commandMaxRetries ?? 10,
        });

        const blob = new Blob([yamlContent], { type: 'text/yaml' });
        const file = new File([blob], 'model-definition.yaml', {
          type: 'text/yaml',
        });

        const uploadUrl: string = await baiClient.vfolder.create_upload_session(
          'model-definition.yaml',
          file,
          values.vFolderID,
        );

        const response = await fetch(uploadUrl, {
          method: 'PATCH',
          headers: {
            'Upload-Offset': '0',
            'Content-Type': 'application/offset+octet-stream',
            'Tus-Resumable': '1.0.0',
          },
          body: blob,
        });

        if (!response.ok) {
          throw new Error(t('modelService.YamlUploadFailed'));
        }
      }

      const environ: { [key: string]: string } = {};
      if (values.envvars) {
        values.envvars
          .filter(
            (v: EnvVarFormListValue) => v != null && !!v.variable && !!v.value,
          )
          .forEach((v) => {
            environ[v.variable] = v.value;
          });
      }

      // Serialize runtime parameter UI values into environ (ENV + ARGS presets)
      serializeRuntimeParamsToEnviron(environ, values.runtimeVariant);

      // In command mode: force runtime_variant to 'custom', auto-set definition path and mount
      const normalizePath = (
        value: string | undefined | null,
        fallback: string,
      ) => {
        const trimmed = value?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : fallback;
      };
      // If user leaves modelDefinitionPath empty, send undefined instead of
      // hardcoding 'model-definition.yaml' so the server can infer the value.
      const modelDefinitionPath = isCommandMode
        ? 'model-definition.yaml'
        : values.modelDefinitionPath?.trim() || undefined;
      const modelMountDestination = isCommandMode
        ? normalizePath(values.commandModelMount, '/models')
        : normalizePath(values.modelMountDestination, '/models');

      const body: ServiceCreateType = {
        name: values.serviceName,
        // REST API does not support `replicas` field. To use `replicas` field, we need `create_endpoint` mutation.
        desired_session_count: values.replicas,
        ...getImageInfoFromInputInCreating(
          checkManualImageAllowed(
            baiClient._config.allow_manual_image_name_for_session,
            values.environments?.manual,
          ),
          values,
        ),
        runtime_variant: isCommandMode ? 'custom' : values.runtimeVariant,
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: values.cluster_size,
        // Convert multi-node x1 to single-node x1 since they are functionally
        // equivalent but multi-node requires overlay network which may not be
        // configured in all-in-one environments (FR-2381)
        cluster_mode:
          values.cluster_mode === 'multi-node' && values.cluster_size === 1
            ? 'single-node'
            : values.cluster_mode,
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderID,
          model_version: 1, // FIXME: hardcoded. change it with option later
          extra_mounts: _.reduce(
            values.mount_ids,
            (acc, key: string) => {
              acc[key] = {
                ...(values.mount_id_map?.[key] && {
                  mount_destination: values.mount_id_map[key],
                }),
                type: 'bind', // FIXME: hardcoded. change it with option later
              };
              return acc;
            },
            {} as Record<string, MountOptionType>,
          ),
          model_definition_path: modelDefinitionPath,
          model_mount_destination: modelMountDestination,
          environ, // FIXME: hardcoded. change it with option later
          scaling_group: values.resourceGroup,
          resources: {
            // FIXME: manually convert to string since server-side only allows [str,str] tuple
            cpu: values.resource.cpu?.toString(),
            mem: values.resource.mem,
            ...(values.resource?.acceleratorType &&
            values.resource?.accelerator &&
            values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    // FIXME: manually convert to string since server-side only allows [str,str] tuple
                    values.resource.accelerator?.toString(),
                }
              : undefined),
          },
          ...(values.resource.shmem && {
            resource_opts: {
              shmem:
                compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
                compareNumberWithUnits(values.resource.shmem, '1g') < 0
                  ? '1g'
                  : values.resource.shmem,
            },
          }),
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

  const { user } = useLazyLoadQuery<ServiceLauncherPageContent_UserInfoQuery>(
    graphql`
      query ServiceLauncherPageContent_UserInfoQuery(
        $domain_name: String
        $email: String
      ) {
        user(domain_name: $domain_name, email: $email) {
          id
          # https://github.com/lablup/backend.ai/pull/1354
          resource_policy @since(version: "23.09.0")
        }
      }
    `,
    {
      domain_name: useCurrentDomainValue(),
      email: baiClient?.email,
    },
  );

  const { user_resource_policy } =
    useLazyLoadQuery<ServiceLauncherPageContent_UserResourcePolicyQuery>(
      graphql`
        query ServiceLauncherPageContent_UserResourcePolicyQuery(
          $user_RP_name: String
        ) {
          user_resource_policy(name: $user_RP_name) @since(version: "23.09.6") {
            max_session_count_per_model_session
          }
        }
      `,
      {
        user_RP_name: user?.resource_policy,
      },
    );

  const isSupportAutoScalingRule = baiClient.supports('auto-scaling-rule');
  const shouldFetchAutoScalingRules = !!endpoint && isSupportAutoScalingRule;
  // Use `first: 1` with edges instead of `count` to check existence.
  // The `count` field is unreliable — it ignores the endpoint filter and returns
  // the total row count across all endpoints. See: https://lablup.atlassian.net/browse/BA-5009
  const { endpoint_auto_scaling_rules } =
    useLazyLoadQuery<ServiceLauncherPageContent_AutoScalingRulesQuery>(
      graphql`
        query ServiceLauncherPageContent_AutoScalingRulesQuery(
          $endpoint_id: String!
        ) {
          endpoint_auto_scaling_rules: endpoint_auto_scaling_rule_nodes(
            endpoint: $endpoint_id
            first: 1
          ) @since(version: "25.1.0") {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      {
        endpoint_id: endpoint?.endpoint_id ?? '',
      },
      {
        fetchPolicy: shouldFetchAutoScalingRules
          ? 'store-and-network'
          : 'store-only',
      },
    );
  const hasAutoScalingRules =
    (endpoint_auto_scaling_rules?.edges?.length ?? 0) > 0;

  const [
    commitModifyEndpoint,
    // inInFlightCommitModifyEndpoint
  ] = useMutation<ServiceLauncherPageContentModifyMutation>(graphql`
    mutation ServiceLauncherPageContentModifyMutation(
      $endpoint_id: UUID!
      $props: ModifyEndpointInput!
    ) {
      modify_endpoint(endpoint_id: $endpoint_id, props: $props) {
        ok
        msg
        endpoint {
          endpoint_id
          desired_session_count @deprecatedSince(version: "24.12.0")
          replicas @since(version: "24.12.0")
          resource_group
          resource_slots
          resource_opts
          cluster_mode
          cluster_size
          open_to_public
          model
          image_object @since(version: "23.09.9") {
            name @deprecatedSince(version: "24.12.0")
            namespace @since(version: "24.12.0")
            humanized_name
            tag
            registry
            architecture
            is_local
            digest
            resource_limits {
              key
              min
              max
            }
            labels {
              key
              value
            }
            size_bytes
            supported_accelerators
          }
          name
          model_definition_path @since(version: "24.03.4")
          model_mount_destination @since(version: "24.03.4")
          extra_mounts @since(version: "24.03.4") {
            id
            host
            quota_scope_id
            name
            user
            user_email
            group
            group_name
            creator
            unmanaged_path
            usage_mode
            permission
            ownership_type
            max_files
            max_size
            created_at
            last_used
            num_files
            cur_size
            cloneable
            status
          }
          runtime_variant @since(version: "24.03.5") {
            name
            human_readable_name
          }
        }
      }
    }
  `);

  // Apply any operation after clicking OK button
  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (endpoint) {
          // In edit mode with custom runtime command mode, upload
          // the generated model-definition.yaml before modifying.
          const isCommandMode =
            values.runtimeVariant === 'custom' &&
            values.customDefinitionMode === 'command' &&
            values.startCommand?.trim();

          // Preserve existing definition path in edit mode, default for new
          const definitionFilePath =
            endpoint?.model_definition_path || 'model-definition.yaml';

          if (isCommandMode) {
            // Show overwrite confirmation before uploading model-definition.yaml
            const confirmed = await new Promise<boolean>((resolve) => {
              modal.confirm({
                title: t('modelService.OverwriteYamlTitle'),
                content: t('modelService.OverwriteYamlContent'),
                okText: t('button.Overwrite'),
                cancelText: t('button.Cancel'),
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
              });
            });
            if (!confirmed) {
              return;
            }

            // In edit mode, use the endpoint's model_mount_destination
            const modelMountDestination = endpoint
              ? (endpoint.model_mount_destination ??
                values.commandModelMount ??
                '/models')
              : (values.commandModelMount ?? '/models');

            try {
              const yamlContent = generateModelDefinitionYaml({
                startCommand: values.startCommand!.trim(),
                port: values.commandPort ?? 8000,
                healthCheckPath: values.commandHealthCheck ?? '/health',
                modelMountDestination,
                initialDelay: values.commandInitialDelay ?? 60,
                maxRetries: values.commandMaxRetries ?? 10,
              });

              const blob = new Blob([yamlContent], { type: 'text/yaml' });
              const file = new File([blob], definitionFilePath, {
                type: 'text/yaml',
              });

              const uploadUrl: string =
                await baiClient.vfolder.create_upload_session(
                  definitionFilePath,
                  file,
                  values.vFolderID,
                );

              const response = await fetch(uploadUrl, {
                method: 'PATCH',
                headers: {
                  'Upload-Offset': '0',
                  'Content-Type': 'application/offset+octet-stream',
                  'Tus-Resumable': '1.0.0',
                },
                body: blob,
              });

              if (!response.ok) {
                message.error(t('modelService.YamlUploadFailed'));
                return;
              }
            } catch (e) {
              logger.error('Failed to upload model-definition.yaml:', e);
              message.error(t('modelService.YamlUploadFailed'));
              return;
            }
          }

          // In command mode, use the preserved definition path
          const modelDefinitionPath = isCommandMode
            ? definitionFilePath
            : values.modelDefinitionPath?.trim() || undefined;

          const mutationVariables: ServiceLauncherPageContentModifyMutation['variables'] =
            {
              endpoint_id: endpoint?.endpoint_id || '',
              props: {
                resource_slots: wantToChangeResource
                  ? JSON.stringify({
                      cpu: values.resource.cpu,
                      mem: values.resource.mem,
                      ...(values.resource?.acceleratorType &&
                      values.resource?.accelerator &&
                      values.resource.accelerator > 0
                        ? {
                            [values.resource.acceleratorType]:
                              values.resource.accelerator,
                          }
                        : undefined),
                    })
                  : endpoint.resource_slots,
                resource_opts: wantToChangeResource
                  ? JSON.stringify({
                      shmem: values.resource.shmem,
                    })
                  : endpoint.resource_opts,
                // FIXME: temporarily convert cluster mode string according to server-side type
                // Also convert multi-node x1 to single-node x1 (FR-2381)
                cluster_mode:
                  values.cluster_mode === 'single-node' ||
                  (values.cluster_mode === 'multi-node' &&
                    values.cluster_size === 1)
                    ? 'SINGLE_NODE'
                    : 'MULTI_NODE',
                cluster_size: values.cluster_size,
                ...(baiClient.supports('replicas')
                  ? { replicas: values.replicas }
                  : {
                      desired_session_count: values.replicas,
                    }),
                ...getImageInfoFromInputInEditing(
                  checkManualImageAllowed(
                    baiClient._config.allow_manual_image_name_for_session,
                    values.environments?.manual,
                  ),
                  values,
                ),
                extra_mounts: _.map(values.mount_ids, (vfolder) => {
                  return {
                    vfolder_id: vfolder,
                    ...(values.mount_id_map?.[vfolder] && {
                      mount_destination: values.mount_id_map[vfolder],
                    }),
                  };
                }),
                name: values.serviceName,
                resource_group: values.resourceGroup,
                model_definition_path: modelDefinitionPath,
                runtime_variant: values.runtimeVariant,
              },
            };
          const newEnvirons: { [key: string]: string } = {};
          if (values.envvars) {
            values.envvars
              .filter(
                (v: EnvVarFormListValue) =>
                  v != null && !!v.variable && !!v.value,
              )
              .forEach((v: EnvVarFormListValue) => {
                newEnvirons[v.variable] = v.value;
              });
          }

          // Serialize runtime parameter UI values into environ (ENV + ARGS presets)
          serializeRuntimeParamsToEnviron(newEnvirons, values.runtimeVariant);

          mutationVariables.props.environ = JSON.stringify(newEnvirons);
          commitModifyEndpoint({
            variables: mutationVariables,
            onCompleted: (res, errors) => {
              if (res.modify_endpoint?.ok) {
                const updatedEndpoint = res.modify_endpoint?.endpoint;
                message.success(
                  t('modelService.ServiceUpdated', {
                    name: updatedEndpoint?.name,
                  }),
                );
                webuiNavigate(`/serving/${endpoint?.endpoint_id}`);
                return;
              }

              if (res.modify_endpoint?.msg) {
                message.error(res.modify_endpoint?.msg);
              } else if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
              }
            },
            onError: (error) => {
              if (error.message) {
                message.error(error.message);
              } else {
                message.error(t('modelService.FailedToUpdateService'));
              }
            },
          });
        } else {
          // create service
          mutationToCreateService.mutate(values, {
            onSuccess: () => {
              // After creating service, navigate to serving page and set current resource group
              setCurrentGlobalResourceGroup(values.resourceGroup);
              // FIXME: temporally refer to mutate input to message
              message.success(
                t('modelService.ServiceCreated', { name: values.serviceName }),
              );
              webuiNavigate('/serving');
            },
            onError: (error) => {
              // Ignore user-initiated cancellation (e.g., overwrite confirmation dismissed)
              if (
                error instanceof DOMException &&
                error.name === 'AbortError'
              ) {
                return;
              }
              const defaultErrorMessage = endpoint
                ? t('modelService.FailedToUpdateService')
                : t('modelService.FailedToStartService');
              message.error(getErrorMessage(error, defaultErrorMessage));
            },
          });
        }
      })
      .catch((err) => {
        // Form has `scrollToFirstError` prop, but it doesn't work. So, we need to scroll manually.
        err?.errorFields?.[0]?.name &&
          form.scrollToField(err.errorFields[0].name, {
            behavior: 'smooth',
            block: 'center',
          });
        // this catch function only for form validation error and unhandled error in `form.validateFields()..then()`.
        // It's not for error handling in mutation.
      });
  };

  const [validateServiceData, setValidateServiceData] = useState<any>();
  const getAIAcceleratorWithStringifiedKey = (resourceSlot: any) => {
    if (Object.keys(resourceSlot).length <= 0) {
      return undefined;
    }
    const keyName: string = Object.keys(resourceSlot)[0];
    return {
      acceleratorType: keyName,
      // FIXME: temporally convert to number if the typeof accelerator is string
      accelerator:
        typeof resourceSlot[keyName] === 'string'
          ? keyName === 'cuda.shares'
            ? parseFloat(resourceSlot[keyName])
            : parseInt(resourceSlot[keyName])
          : resourceSlot[keyName],
    };
  };

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      // To sync the latest form values to URL,
      // 'trailing' is set to true, and get the form values here.
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.assign(
            _.omit(currentValue, [
              'environments.image',
              'environments.customizedTag',
              'vfoldersAliasMap',
              'envvars',
            ]),
            {
              envvars: sanitizeSensitiveEnv(form.getFieldValue('envvars')),
            },
          ),
        },
        'replaceIn',
      );
    },
    {
      leading: false,
      wait: 500,
      trailing: true,
    },
  );

  const INITIAL_FORM_VALUES = endpoint
    ? {
        serviceName: endpoint?.name,
        resourceGroup: endpoint?.resource_group,
        allocationPreset: 'custom',
        replicas: endpoint?.replicas ?? endpoint?.desired_session_count ?? 1,
        // FIXME: memory doesn't applied to resource allocation
        resource: {
          cpu: parseInt(JSON.parse(endpoint?.resource_slots || '{}')?.cpu),
          mem: convertToBinaryUnit(
            JSON.parse(endpoint?.resource_slots || '{}')?.mem,
            'g',
            3,
            true,
          )?.value,
          shmem: convertToBinaryUnit(
            JSON.parse(endpoint?.resource_opts || '{}')?.shmem ||
              AUTOMATIC_DEFAULT_SHMEM,
            'g',
            3,
            true,
          )?.value,
          ...getAIAcceleratorWithStringifiedKey(
            _.omit(JSON.parse(endpoint?.resource_slots || '{}'), [
              'cpu',
              'mem',
            ]),
          ),
        },
        cluster_mode:
          endpoint?.cluster_mode === 'MULTI_NODE'
            ? 'multi-node'
            : 'single-node',
        cluster_size: endpoint?.cluster_size,
        openToPublic: endpoint?.open_to_public,
        environments: {
          environment:
            endpoint?.image_object?.namespace ?? endpoint?.image_object?.name,
          version: `${endpoint?.image_object?.registry}/${endpoint?.image_object?.namespace ?? endpoint?.image_object?.name}:${endpoint?.image_object?.tag}@${endpoint?.image_object?.architecture}`,
          image: endpoint?.image_object,
        },
        vFolderID: endpoint?.model,
        mount_ids: _.map(endpoint?.extra_mounts, (item) =>
          item?.row_id?.replaceAll('-', ''),
        ),
        // TODO: implement mount_id_map. Now, it's impossible to get mount_destination from backend
        modelMountDestination: endpoint?.model_mount_destination,
        modelDefinitionPath: endpoint?.model_definition_path,
        runtimeVariant: endpoint?.runtime_variant?.name,
        // For custom runtime edit mode, pre-populate from latest revision if available,
        // otherwise fall back to static defaults.
        ...(endpoint?.runtime_variant?.name === 'custom' &&
          (() => {
            const svc = initialModelDef?.models?.[0]?.service;
            const rawCommand = svc?.startCommand;
            const startCommand = Array.isArray(rawCommand)
              ? rawCommand.join(' ')
              : rawCommand != null
                ? String(rawCommand)
                : undefined;
            return {
              customDefinitionMode: 'command' as CustomDefinitionMode,
              commandModelMount: endpoint?.model_mount_destination || '/models',
              ...(svc
                ? {
                    startCommand,
                    commandPort: svc.port ?? 8000,
                    commandHealthCheck: svc.healthCheck?.path ?? '/health',
                    commandInitialDelay: svc.healthCheck?.initialDelay ?? 60,
                    commandMaxRetries: svc.healthCheck?.maxRetries ?? 10,
                  }
                : {
                    commandPort: 8000,
                    commandHealthCheck: '/health',
                    commandInitialDelay: 60,
                    commandMaxRetries: 10,
                  }),
            };
          })()),
        // Pass environ as-is; managed keys are stripped at submit time
        // by serializeRuntimeParamsToEnviron after presets load from API.
        envvars: (() => {
          const parsed = JSON.parse(endpoint?.environ || '{}') as Record<
            string,
            string
          >;
          return _.map(parsed, (value, variable) => ({ variable, value }));
        })(),
      }
    : {
        replicas: 1,
        runtimeVariant: 'custom',
        commandModelMount: '/models',
        commandPort: 8000,
        commandHealthCheck: '/health',
        commandInitialDelay: 60,
        commandMaxRetries: 10,
        ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
        ...(baiClient._config?.default_session_environment && {
          environments: {
            environment: baiClient._config?.default_session_environment,
          },
        }),
        vFolderID: model
          ? model
          : _.get(formValuesFromQueryParams, 'vFolderID') || undefined,
        resourceGroup: currentGlobalResourceGroup,
        allocationPreset: 'auto-select',
        customDefinitionMode: 'command' as CustomDefinitionMode,
        // Initialize empty mount configuration for new services
        mount_ids: [],
        mount_id_map: {},
      };

  const mergedInitialValues = _.merge(
    {},
    INITIAL_FORM_VALUES,
    formValuesFromQueryParams,
  );

  const validateEffectEvent = useEffectEvent(() => {
    form.validateFields(['cluster_size']).catch(() => {});
  });
  useEffect(() => {
    validateEffectEvent();
  }, []);

  // Sync mount_ids from endpoint data to form.
  // initialValues is only applied on first Form mount, but with
  // fetchPolicy: 'store-and-network', the endpoint data may arrive after the
  // Form has already mounted with empty mount_ids.
  useEffect(() => {
    if (endpoint?.extra_mounts) {
      const mountIds = _.compact(
        _.map(endpoint.extra_mounts, (item) =>
          item?.row_id?.replaceAll('-', ''),
        ),
      );
      if (mountIds.length > 0) {
        form.setFieldsValue({ mount_ids: mountIds });
      }
    }
  }, [endpoint?.extra_mounts, form]);

  // Load model definition for edit mode via GraphQL (currentRevision.modelDefinition),
  // falling back to vfolder YAML parsing when GraphQL data is unavailable.
  const loadModelDefinitionForEdit = useEffectEvent(
    async (endpointId: string, vfolderId: string) => {
      const modelDefinitionQuery = graphql`
        query ServiceLauncherPageContent_ModelDefinitionQuery(
          $deploymentId: ID!
        ) {
          deployment(id: $deploymentId) {
            revisionHistory(
              limit: 1
              orderBy: [{ field: CREATED_AT, direction: DESC }]
            ) {
              edges {
                node {
                  modelDefinition {
                    models {
                      service {
                        startCommand
                        port
                        healthCheck {
                          path
                          initialDelay
                          maxRetries
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      // Attempt GraphQL-based load first
      try {
        const deploymentId = toGlobalId('ModelDeployment', endpointId);
        const data =
          await fetchQuery<ServiceLauncherPageContent_ModelDefinitionQuery>(
            relayEnv,
            modelDefinitionQuery,
            { deploymentId },
          ).toPromise();

        const modelDef =
          data?.deployment?.revisionHistory?.edges?.[0]?.node?.modelDefinition;
        if (modelDef?.models && modelDef.models.length > 0) {
          const firstModel = modelDef.models[0];
          const svc = firstModel?.service;
          if (svc) {
            const rawCommand = svc.startCommand;
            const startCommand = Array.isArray(rawCommand)
              ? rawCommand.join(' ')
              : rawCommand != null
                ? String(rawCommand)
                : undefined;
            form.setFieldsValue({
              startCommand,
              commandPort: svc.port,
              commandHealthCheck: svc.healthCheck?.path,
              // commandModelMount is intentionally omitted here — it comes from
              // endpoint.model_mount_destination in INITIAL_FORM_VALUES, not from modelDefinition.service
              commandInitialDelay: svc.healthCheck?.initialDelay,
              commandMaxRetries: svc.healthCheck?.maxRetries,
              customDefinitionMode: 'command' as CustomDefinitionMode,
            });
            return;
          }
        }
      } catch (e) {
        logger.debug(
          'GraphQL modelDefinition load failed; falling back to vfolder YAML parsing',
          e,
        );
      }

      // Fallback: download model-definition.yaml from vfolder and parse YAML
      try {
        const definitionPath =
          endpoint?.model_definition_path || 'model-definition.yaml';
        const tokenResponse = await baiClient.vfolder.request_download_token(
          definitionPath,
          vfolderId,
          false,
        );
        const downloadUrl = `${tokenResponse.url}?token=${tokenResponse.token}&archive=false`;
        const response = await fetch(downloadUrl);
        if (!response.ok) return;
        const yamlText = await response.text();
        const parsed = parseModelDefinitionYaml(yamlText);
        if (parsed) {
          form.setFieldsValue({
            startCommand: parsed.startCommand,
            commandPort: parsed.port,
            commandHealthCheck: parsed.healthCheckPath,
            commandModelMount: parsed.modelMountDestination,
            commandInitialDelay: parsed.initialDelay,
            commandMaxRetries: parsed.maxRetries,
            customDefinitionMode: 'command' as CustomDefinitionMode,
          });
        }
      } catch (e) {
        // If fallback also fails, keep the default values — user can fill manually
        logger.debug(
          'Failed to load model-definition.yaml for edit mode pre-population',
          e,
        );
      }
    },
  );

  const endpointId = endpoint?.endpoint_id;
  const endpointRuntimeVariant = endpoint?.runtime_variant?.name;
  const endpointModel = endpoint?.model;

  const maybeLoadModelDefinition = useEffectEvent(
    (id: string, model: string) => {
      // Skip async load when initialModelDef was already provided synchronously via props
      if (initialModelDef === undefined) {
        loadModelDefinitionForEdit(id, model);
      }
    },
  );

  useEffect(() => {
    if (endpointRuntimeVariant === 'custom' && endpointId && endpointModel) {
      maybeLoadModelDefinition(endpointId, endpointModel);
    }
  }, [endpointId, endpointRuntimeVariant, endpointModel]);

  return (
    <>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{ justifyContent: 'revert' }}
      >
        <BAIFlex direction="row" gap="md" align="start">
          <BAIFlex
            direction="column"
            align="stretch"
            style={{ flex: 1, maxWidth: 700 }}
            wrap="nowrap"
          >
            {isProjectMismatch && endpoint?.project && (
              <Alert
                title={t('modelService.NotInProject')}
                type="warning"
                showIcon
                style={{ marginBottom: token.marginMD }}
                action={<SwitchToProjectButton projectId={endpoint.project} />}
              />
            )}
            {_.filter(
              filterOutNullAndUndefined(endpoint?.extra_mounts),
              (vf) => vf?.name && !vf?.name.startsWith('.'),
            ).length > 0 && (
              <Alert
                title={t('modelService.ExtraMountsWarning')}
                type="warning"
                showIcon
                style={{ marginBottom: token.marginMD }}
              />
            )}
            <Form.Provider
              onFormChange={() => {
                // use OnFormChange instead of Form's onValuesChange,
                // because onValuesChange will not be triggered when form is changed programmatically
                syncFormToURLWithDebounce();
              }}
            >
              <Form
                form={form}
                disabled={
                  mutationToCreateService.isPending || isProjectMismatch
                }
                layout="vertical"
                labelCol={{ span: 12 }}
                initialValues={mergedInitialValues}
                onValuesChange={handleFormValuesChange}
                scrollToFirstError
              >
                <BAIFlex direction="column" gap={'md'} align="stretch">
                  <Card title={t('modelService.ModelAndServingConfiguration')}>
                    {(baiClient.supports('modify-endpoint') || !endpoint) && (
                      <>
                        <Form.Item
                          label={t('modelService.ServiceName')}
                          name="serviceName"
                          rules={endpoint ? [] : validationRules}
                        >
                          <Input disabled={!!endpoint} />
                        </Form.Item>
                        <Form.Item name="openToPublic" valuePropName="checked">
                          <Checkbox disabled={!!endpoint}>
                            {t('modelService.OpenToPublic')}
                          </Checkbox>
                        </Form.Item>
                        {!endpoint ? (
                          <Form.Item
                            name={'vFolderID'}
                            label={t('session.launcher.ModelStorageToMount')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <VFolderSelect
                              filter={(vf) =>
                                vf.usage_mode === 'model' &&
                                vf.status === 'ready' &&
                                vf.ownership_type !== 'group'
                              }
                              valuePropName="id"
                              autoSelectDefault={
                                !model && !formValuesFromQueryParams.vFolderID
                              }
                              disabled={!!endpoint}
                              showOpenButton
                              showCreateButton
                              showRefreshButton
                            />
                          </Form.Item>
                        ) : (
                          endpoint?.model && (
                            <Form.Item
                              name={'vFolderID'}
                              label={t('session.launcher.ModelStorageToMount')}
                              required
                            >
                              <BAIFlex gap="xs" align="center">
                                <Suspense fallback={<Skeleton.Input active />}>
                                  <VFolderLazyViewV2
                                    uuid={endpoint?.model}
                                    clickable
                                  />
                                </Suspense>
                              </BAIFlex>
                            </Form.Item>
                          )
                        )}
                        <Form.Item
                          name={'runtimeVariant'}
                          required
                          label={t('modelService.RuntimeVariant')}
                        >
                          <Select
                            defaultActiveFirstOption
                            showSearch
                            options={_.map(
                              availableRuntimes?.runtimes,
                              (runtime) => {
                                return {
                                  value: runtime.name,
                                  label: runtime.human_readable_name,
                                };
                              },
                            )}
                            onChange={(value) => {
                              // Prefill the environment search with the runtime variant keyword
                              const keyword = RUNTIME_SEARCH_KEYWORD_MAP[value];
                              setEnvSearchPrefill(keyword);

                              // Force re-validation of all environment variable fields after form state updates
                              queueMicrotask(() => {
                                const envvars =
                                  form.getFieldValue('envvars') || [];
                                const fieldNames = envvars.map(
                                  (_: string, index: number) => [
                                    'envvars',
                                    index,
                                    'variable',
                                  ],
                                );
                                if (fieldNames.length > 0) {
                                  form.validateFields(fieldNames);
                                }
                              });
                            }}
                          />
                        </Form.Item>
                        <ImageEnvironmentSelectFormItems
                          searchPrefill={envSearchPrefill}
                          // //TODO: test with real inference images
                          // filter={(image) => {
                          //   return !!_.find(image?.labels, (label) => {
                          //     return (
                          //       label?.key === "ai.backend.role" &&
                          //       label.value === "INFERENCE" //['COMPUTE', 'INFERENCE', 'SYSTEM']
                          //     );
                          //   });
                          // }}
                        />
                        <Form.Item dependencies={['runtimeVariant']} noStyle>
                          {({ getFieldValue }) => {
                            const variant = getFieldValue('runtimeVariant');
                            if (!variant || variant === 'custom') return null;

                            // Extract existing environ for edit mode reverse-mapping
                            const parsedEnviron = endpoint
                              ? (JSON.parse(
                                  endpoint?.environ || '{}',
                                ) as Record<string, string>)
                              : {};
                            const extraArgsEnvName =
                              getExtraArgsEnvVarName(variant);
                            const existingExtraArgs =
                              parsedEnviron[extraArgsEnvName] ?? '';

                            return (
                              <Suspense
                                fallback={
                                  <Skeleton active paragraph={{ rows: 4 }} />
                                }
                              >
                                <RuntimeParameterFormSection
                                  runtimeVariant={variant}
                                  onChange={handleRuntimeParamChange}
                                  onTouchedKeysChange={handleTouchedKeysChange}
                                  onGroupsLoaded={handleGroupsLoaded}
                                  initialExtraArgs={existingExtraArgs}
                                  initialEnvVars={
                                    endpoint ? parsedEnviron : undefined
                                  }
                                />
                              </Suspense>
                            );
                          }}
                        </Form.Item>
                        <Form.Item dependencies={['runtimeVariant']} noStyle>
                          {({ getFieldValue }) =>
                            getFieldValue('runtimeVariant') === 'custom' && (
                              // Both create and edit modes: Segmented "Enter Command" / "Use Config File"
                              <Card
                                size="small"
                                title={t('modelService.ModelDefinition')}
                                style={{
                                  marginBottom: token.marginMD,
                                }}
                              >
                                <Form.Item name="customDefinitionMode" noStyle>
                                  <Segmented
                                    options={[
                                      {
                                        label: t('modelService.EnterCommand'),
                                        value: 'command',
                                      },
                                      {
                                        label: t('modelService.UseConfigFile'),
                                        value: 'file',
                                      },
                                    ]}
                                    style={{
                                      marginBottom: token.marginMD,
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  dependencies={['customDefinitionMode']}
                                  noStyle
                                >
                                  {({ getFieldValue: getField }) =>
                                    getField('customDefinitionMode') ===
                                    'command' ? (
                                      <>
                                        <Form.Item
                                          name="startCommand"
                                          label={t('modelService.StartCommand')}
                                          tooltip={t(
                                            'modelService.StartCommandTooltip',
                                          )}
                                          rules={[
                                            {
                                              required: true,
                                              whitespace: true,
                                            },
                                          ]}
                                        >
                                          <Input.TextArea
                                            placeholder={t(
                                              'modelService.StartCommandPlaceholder',
                                            )}
                                            autoSize={{
                                              minRows: 2,
                                            }}
                                            onChange={(e) => {
                                              parseCommandWithDebounce(
                                                e.target.value,
                                              );
                                            }}
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          name="commandModelMount"
                                          label={t('modelService.ModelMount')}
                                          tooltip={t(
                                            'modelService.ModelMountTooltip',
                                          )}
                                        >
                                          <Input placeholder="/models" />
                                        </Form.Item>
                                        <BAIFlex
                                          direction="row"
                                          gap="sm"
                                          align="end"
                                        >
                                          <Form.Item
                                            name="commandPort"
                                            label={t('modelService.Port')}
                                            tooltip={t(
                                              'modelService.PortTooltip',
                                            )}
                                            style={{ flex: 1 }}
                                            labelCol={{
                                              style: { width: '100%' },
                                            }}
                                          >
                                            <InputNumber
                                              min={1}
                                              max={65535}
                                              style={{ width: '100%' }}
                                            />
                                          </Form.Item>
                                          <Form.Item
                                            name="commandHealthCheck"
                                            label={t(
                                              'modelService.HealthCheck',
                                            )}
                                            tooltip={t(
                                              'modelService.HealthCheckTooltip',
                                            )}
                                            style={{ flex: 1 }}
                                            labelCol={{
                                              style: { width: '100%' },
                                            }}
                                          >
                                            <Input placeholder="/health" />
                                          </Form.Item>
                                        </BAIFlex>
                                        <BAIFlex
                                          direction="row"
                                          gap="sm"
                                          align="end"
                                        >
                                          <Form.Item
                                            name="commandInitialDelay"
                                            label={t(
                                              'modelService.InitialDelay',
                                            )}
                                            tooltip={t(
                                              'modelService.InitialDelayTooltip',
                                            )}
                                            style={{ flex: 1 }}
                                            labelCol={{
                                              style: { width: '100%' },
                                            }}
                                          >
                                            <InputNumber
                                              min={0}
                                              step={0.5}
                                              style={{ width: '100%' }}
                                            />
                                          </Form.Item>
                                          <Form.Item
                                            name="commandMaxRetries"
                                            label={t('modelService.MaxRetries')}
                                            tooltip={t(
                                              'modelService.MaxRetriesTooltip',
                                            )}
                                            style={{ flex: 1 }}
                                            labelCol={{
                                              style: { width: '100%' },
                                            }}
                                          >
                                            <InputNumber
                                              min={0}
                                              style={{ width: '100%' }}
                                            />
                                          </Form.Item>
                                        </BAIFlex>
                                      </>
                                    ) : (
                                      <>
                                        <Form.Item
                                          name={'modelMountDestination'}
                                          label={t('modelService.ModelMount')}
                                          tooltip={t(
                                            'modelService.ModelMountTooltip',
                                          )}
                                        >
                                          <Input
                                            allowClear
                                            placeholder={'/models'}
                                            disabled={!!endpoint}
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          name={'modelDefinitionPath'}
                                          label={t(
                                            'modelService.ModelDefinitionPath',
                                          )}
                                          tooltip={t(
                                            'modelService.ModelDefinitionPathTooltip',
                                          )}
                                        >
                                          <Input
                                            allowClear
                                            placeholder={
                                              endpoint?.model_definition_path
                                                ? endpoint?.model_definition_path
                                                : 'model-definition.yaml'
                                            }
                                          />
                                        </Form.Item>
                                      </>
                                    )
                                  }
                                </Form.Item>
                              </Card>
                            )
                          }
                        </Form.Item>
                      </>
                    )}
                  </Card>
                  <Card title={t('modelService.ReplicasAndResources')}>
                    {(baiClient.supports('modify-endpoint') || !endpoint) && (
                      <>
                        <Form.Item
                          label={t('modelService.NumberOfReplicas')}
                          name={'replicas'}
                          extra={
                            hasAutoScalingRules
                              ? t(
                                  'modelService.ReplicaCountDisabledByAutoScalingRules',
                                )
                              : undefined
                          }
                          rules={[
                            {
                              required: true,
                            },
                            {
                              type: 'number',
                              min: 0,
                            },
                            {
                              type: 'number',
                              max:
                                user_resource_policy?.max_session_count_per_model_session ??
                                0,
                            },
                          ]}
                        >
                          <InputNumberWithSlider
                            inputContainerMinWidth={190}
                            min={0}
                            max={
                              user_resource_policy?.max_session_count_per_model_session ??
                              0
                            }
                            inputNumberProps={{
                              //TODO: change unit based on resource limit
                              suffix: '#',
                            }}
                            step={1}
                            disabled={hasAutoScalingRules}
                          />
                        </Form.Item>
                        {endpoint && !wantToChangeResource ? (
                          <Form.Item
                            label={
                              <>
                                {t('modelService.Resources')}
                                <BAIButton
                                  type="link"
                                  action={async () => {
                                    form.setFieldsValue({
                                      allocationPreset: baiClient._config
                                        .allowCustomResourceAllocation
                                        ? 'custom'
                                        : 'auto-select',
                                    });
                                    setWantToChangeResource(true);
                                  }}
                                >
                                  {t('general.Change')}
                                </BAIButton>
                              </>
                            }
                            required
                          >
                            <BAIFlex gap={'xs'}>
                              <Tooltip title={t('session.ResourceGroup')}>
                                <Tag>{endpoint?.resource_group}</Tag>
                              </Tooltip>
                              {_.map(
                                JSON.parse(endpoint?.resource_slots || '{}'),
                                (value: string, type) => {
                                  return (
                                    <BAIResourceNumberWithIcon
                                      key={type}
                                      type={type}
                                      value={value}
                                      opts={JSON.parse(
                                        endpoint?.resource_opts || '{}',
                                      )}
                                    />
                                  );
                                },
                              )}
                            </BAIFlex>
                          </Form.Item>
                        ) : (
                          <ResourceAllocationFormItems
                            enableResourcePresets
                            hideClusterFormItems
                            extraAcceleratorRules={
                              gpuHint
                                ? [
                                    {
                                      warningOnly: true,
                                      validator: async (
                                        _rule: unknown,
                                        value: number,
                                      ) => {
                                        if (
                                          gpuHint &&
                                          value > 0 &&
                                          value < gpuHint
                                        ) {
                                          return Promise.reject(
                                            t('modelService.GpuHint', {
                                              count: gpuHint,
                                            }),
                                          );
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]
                                : undefined
                            }
                          />
                        )}
                      </>
                    )}
                  </Card>
                  <Collapse
                    activeKey={advancedMode ? ['advanced'] : []}
                    onChange={(keys) => {
                      setQuery(
                        {
                          advancedMode: keys.includes('advanced') || undefined,
                        },
                        'replaceIn',
                      );
                    }}
                    items={[
                      {
                        key: 'advanced',
                        label: t('session.launcher.AdvancedSettings'),
                        forceRender: true,
                        children: (
                          <>
                            <Suspense fallback={<Skeleton active />}>
                              <ClusterModeFormItems />
                            </Suspense>
                            <Form.Item
                              dependencies={['runtimeVariant']}
                              noStyle
                            >
                              {({ getFieldValue }) => {
                                const runtimeVariant =
                                  getFieldValue('runtimeVariant');
                                const runtimeVariantConfig = runtimeVariant
                                  ? RUNTIME_ENV_VAR_CONFIGS[runtimeVariant]
                                  : null;

                                return (
                                  <Form.Item
                                    label={t(
                                      'session.launcher.EnvironmentVariable',
                                    )}
                                  >
                                    <EnvVarFormList
                                      name={'envvars'}
                                      requiredEnvVars={
                                        runtimeVariantConfig?.requiredEnvVars
                                      }
                                      optionalEnvVars={
                                        runtimeVariantConfig?.optionalEnvVars
                                      }
                                      formItemProps={{
                                        validateTrigger: ['onChange', 'onBlur'],
                                        rules: [
                                          {
                                            warningOnly: true,
                                            validator: async (
                                              _rule,
                                              value: string,
                                            ) => {
                                              if (!value) {
                                                return Promise.resolve();
                                              }

                                              if (
                                                !validateVariable(
                                                  runtimeVariant,
                                                  value,
                                                )
                                              ) {
                                                throw t(
                                                  'session.launcher.EnvironmentVariableNotForRuntime',
                                                );
                                              } else {
                                                return Promise.resolve();
                                              }
                                            },
                                          },
                                        ],
                                      }}
                                    />
                                  </Form.Item>
                                );
                              }}
                            </Form.Item>
                            <Suspense fallback={<Skeleton active />}>
                              <Form.Item noStyle dependencies={['vFolderID']}>
                                {({ getFieldValue }) => {
                                  const vFolderID = getFieldValue('vFolderID');
                                  return (
                                    <VFolderTableFormItem
                                      label={t('modelService.AdditionalMounts')}
                                      rowKey="id"
                                      tableProps={{
                                        scroll: { x: 'max-content', y: 300 },
                                      }}
                                      rowFilter={(vfolder) =>
                                        vfolder.usage_mode !== 'model' &&
                                        vfolder.status === 'ready' &&
                                        !vfolder.name?.startsWith('.') &&
                                        vfolder.id !== vFolderID
                                      }
                                    />
                                  );
                                }}
                              </Form.Item>
                            </Suspense>
                          </>
                        ),
                      },
                    ]}
                  />
                  <BAIFlex
                    direction="row"
                    justify="between"
                    align="end"
                    gap={'xs'}
                  >
                    <BAIFlex>
                      <Button
                        disabled={isProjectMismatch}
                        onClick={() => {
                          form
                            .validateFields()
                            .then((values) => {
                              setValidateServiceData(values);
                              setIsOpenServiceValidationModal(true);
                            })
                            .catch((err) => {
                              logger.error(err.message);
                              message.error(
                                t('modelService.FormValidationFailed'),
                              );
                            });
                        }}
                      >
                        {t('modelService.Validate')}
                      </Button>
                    </BAIFlex>
                    <BAIFlex gap={'sm'}>
                      <Button
                        type="primary"
                        disabled={isProjectMismatch}
                        onClick={handleOk}
                      >
                        {endpoint ? t('button.Update') : t('button.Create')}
                      </Button>
                    </BAIFlex>
                  </BAIFlex>
                </BAIFlex>
              </Form>
            </Form.Provider>
          </BAIFlex>
        </BAIFlex>
      </BAIFlex>
      <BAIModal
        width={1000}
        title={t('modelService.ValidationInfo')}
        open={isOpenServiceValidationModal}
        destroyOnHidden
        onCancel={() => {
          setIsOpenServiceValidationModal(!isOpenServiceValidationModal);
        }}
        okButtonProps={{
          style: { display: 'none' },
        }}
        cancelText={t('button.Close')}
        maskClosable={false}
      >
        <ServiceValidationView serviceData={validateServiceData} />
      </BAIModal>
    </>
  );
};

export default ServiceLauncherPageContent;
