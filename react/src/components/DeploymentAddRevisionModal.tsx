/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAddRevisionModalAddMutation } from '../__generated__/DeploymentAddRevisionModalAddMutation.graphql';
import { DeploymentAddRevisionModalQuery } from '../__generated__/DeploymentAddRevisionModalQuery.graphql';
import { convertToBinaryUnit } from '../helper';
import {
  formatShellCommand,
  tokenizeShellCommand,
} from '../helper/parseCliCommand';
import {
  mergeExtraArgs,
  reverseMapExtraArgs,
} from '../helper/runtimeExtraArgsParser';
import {
  buildArgsSchemaKeySet,
  buildDefaultsMap,
  flattenPresets,
  getAllExtraArgsEnvVarNames,
  getExtraArgsEnvVarName,
  type RuntimeParameterGroup,
} from '../hooks/useRuntimeParameterSchema';
import EnvVarFormList, { type EnvVarFormListValue } from './EnvVarFormList';
import ImageEnvironmentSelectFormItems, {
  type ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import RuntimeParameterFormSection, {
  type RuntimeParameterValues,
} from './RuntimeParameterFormSection';
import ResourceAllocationFormItems, {
  AUTOMATIC_DEFAULT_SHMEM,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  type ResourceAllocationFormValue,
} from './SessionFormItems/ResourceAllocationFormItems';
import VFolderSelect from './VFolderSelect';
import VFolderTableFormItem, {
  type VFolderTableFormValues,
} from './VFolderTableFormItem';
import {
  App,
  Collapse,
  Divider,
  Form,
  type FormInstance,
  Input,
  InputNumber,
  Segmented,
  Select,
  Skeleton,
  Typography,
  theme,
} from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  convertToUUID,
  filterOutNullAndUndefined,
  isValidUUID,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  commitLocalUpdate,
  graphql,
  useLazyLoadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

/**
 * Resolve a UUID from either a raw UUID or a Strawberry global id like
 * `ImageV2:<uuid>`. `ImageInput.id` is declared as `ID!` but parsed as
 * `UUID!` server-side, so we decode the form value before submitting.
 * `toLocalId` calls `atob` which throws on non-base64 input — guard with
 * try/catch and verify the decoded value is a UUID.
 */
const safeDecodeUuid = (idOrGlobalId: string): string | undefined => {
  if (isValidUUID(idOrGlobalId)) return idOrGlobalId;
  try {
    const decoded = toLocalId(idOrGlobalId);
    return decoded && isValidUUID(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = theme.useToken();
  return (
    <Divider titlePlacement="left">
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {children}
      </Typography.Text>
    </Divider>
  );
};

interface DeploymentAddRevisionModalProps extends BAIModalProps {
  onSuccess: () => void;
  deploymentId: string;
}

type FormValues = ImageEnvironmentFormInput &
  ResourceAllocationFormValue &
  VFolderTableFormValues & {
    name?: string;
    runtimeVariantId: string;
    modelFolderId: string;
    mountDestination: string;
    definitionPath: string;
    customDefinitionMode?: 'command' | 'file';
    startCommand?: string;
    commandPort?: number;
    commandHealthCheck?: string;
    commandModelMount?: string;
    commandInitialDelay?: number;
    commandMaxRetries?: number;
    environ: EnvVarFormListValue[];
  };

interface DeploymentAddRevisionModalFormBodyProps {
  deploymentId: string;
  form: FormInstance<FormValues>;
  onSuccess: () => void;
  onIsAddingChange: (v: boolean) => void;
}

const DeploymentAddRevisionModalFormBody: React.FC<
  DeploymentAddRevisionModalFormBodyProps
> = ({ deploymentId, form, onSuccess, onIsAddingChange }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  // Runtime parameter refs — kept outside form state so slider/input changes
  // don't re-render the modal. Read at submit time via serializeRuntimeParamsToEnviron.
  const runtimeParamValuesRef = useRef<RuntimeParameterValues>({});
  const runtimeParamTouchedKeysRef = useRef<Set<string>>(new Set());
  const runtimeParamGroupsRef = useRef<RuntimeParameterGroup[] | null>(null);

  // Initial values fed into `RuntimeParameterFormSection` for non-custom
  // variants — split out of `currentRevision.modelRuntimeConfig.environ`
  // once at mount time so the runtime-parameter UI can reverse-map ARGS-
  // and ENV-typed presets back into their controls. State (not ref) so the
  // child re-renders with the right initial data after the body resolves.
  const [initialRuntimeExtraArgs, setInitialRuntimeExtraArgs] = useState('');
  const [initialRuntimeEnvVars, setInitialRuntimeEnvVars] = useState<
    Record<string, string> | undefined
  >(undefined);

  // Snapshot of prefilled `extraMounts.mountDestination`, keyed by the
  // dash-stripped vfolder id. Read at submit time as a fallback when
  // `values.mount_id_map` does not have the entry — VFolderTable's
  // `onChangeAliasMap` *replaces* (not merges) the alias map and only
  // surfaces aliases for rows that are visible in the current filtered
  // table view, so any extra mount that lives outside that view (e.g. a
  // vfolder owned by another user that the deployment was created with)
  // would lose its alias as soon as the user edits *any* visible row's
  // alias. The backend requires `mount_destination`, so without this
  // fallback the next submit fails with `ExtraVFolderMountInput.__init__()
  // missing 1 required keyword-only argument: 'mount_destination'`.
  const prefilledMountAliasesRef = useRef<Record<string, string>>({});

  const { deployment, runtimeVariants } =
    useLazyLoadQuery<DeploymentAddRevisionModalQuery>(
      graphql`
        query DeploymentAddRevisionModalQuery($deploymentId: ID!) {
          deployment(id: $deploymentId) {
            metadata {
              projectId
            }
            currentRevision {
              clusterConfig {
                mode
                size
              }
              resourceConfig {
                resourceGroupName
                resourceOpts {
                  entries {
                    name
                    value
                  }
                }
              }
              resourceSlots {
                slotName
                quantity
              }
              extraMounts {
                vfolderId
                mountDestination
              }
              modelRuntimeConfig {
                runtimeVariantId
                environ {
                  entries {
                    name
                    value
                  }
                }
              }
              modelMountConfig {
                vfolderId
                mountDestination
                definitionPath
              }
              modelDefinition {
                models {
                  name
                  modelPath
                  service {
                    startCommand
                    port
                    healthCheck {
                      path
                      maxRetries
                      initialDelay
                    }
                  }
                }
              }
              imageV2 {
                id
                identity {
                  canonicalName
                }
              }
            }
          }
          runtimeVariants {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `,
      { deploymentId },
      // `network-only` so that every fresh mount of the body refetches
      // the deployment's current revision instead of returning the
      // Relay store's previous snapshot — `addModelRevision` mutates
      // `deployment.currentRevisionId` server-side without writing the
      // new `currentRevision` sub-tree back into our local store, so
      // a `store-or-network` read on re-open would prefill from the
      // *previous* revision indefinitely.
      //
      // The historical concern that `network-only` could trigger an
      // unmount/remount loop (suspending nested children → body
      // tear-down → refetch → suspend again) does not apply here:
      //   1. Modern React Suspense (we're on 19.2) keeps suspended
      //      children mounted-but-paused rather than unmounting them,
      //      so a child suspending does not reset this hook.
      //   2. The closest Suspense boundary is the parent modal, not
      //      the body itself, so children's throws don't bubble back
      //      into the body.
      //   3. The parent passes `destroyOnHidden` to BAIModal so the
      //      body unmounts cleanly on close — re-open is a fresh mount,
      //      one fetch per open.
      { fetchPolicy: 'store-and-network' },
    );

  // Captured for the mutation `updater` below: after a successful add,
  // we need to mark the *parent deployment record* as invalid in the
  // Relay store so that the next reopen of the modal sees the freshly-
  // activated revision instead of the previously-cached one. The
  // `addModelRevision` mutation only returns the new revision; it
  // doesn't carry the deployment's updated `currentRevisionId`, so
  // Relay has no way to know the deployment is stale on its own.
  const relayEnvironment = useRelayEnvironment();

  const [commitAdd] = useMutation<DeploymentAddRevisionModalAddMutation>(
    graphql`
      mutation DeploymentAddRevisionModalAddMutation(
        $input: AddRevisionInput!
      ) {
        addModelRevision(input: $input) {
          revision {
            id
            name
            clusterConfig {
              mode
              size
            }
            resourceConfig {
              resourceGroupName
              resourceOpts {
                entries {
                  name
                  value
                }
              }
            }
            resourceSlots {
              slotName
              quantity
            }
            modelRuntimeConfig {
              runtimeVariantId
              environ {
                entries {
                  name
                  value
                }
              }
            }
            modelMountConfig {
              vfolderId
              mountDestination
              definitionPath
            }
            extraMounts {
              vfolderId
              mountDestination
            }
            modelDefinition {
              models {
                name
                modelPath
                service {
                  preStartActions {
                    action
                    args
                  }
                  startCommand
                  shell
                  port
                  healthCheck {
                    interval
                    path
                    maxRetries
                    maxWaitTime
                    expectedStatusCode
                    initialDelay
                  }
                }
              }
            }
            imageV2 {
              id
              identity {
                canonicalName
              }
            }
          }
        }
      }
    `,
  );

  const currentRevision = deployment?.currentRevision;

  const runtimeVariantOptions = filterOutNullAndUndefined(
    (runtimeVariants?.edges ?? []).map((e) => e?.node),
  ).map((node) => ({ value: toLocalId(node.id) ?? node.id, label: node.name }));

  // Pre-populate from current revision once when the modal opens.
  // Synchronization key is `open` only — the `currentRevision` object's
  // identity can shift across renders (type-asserted view of a Relay
  // result), and including it in deps causes the effect to fire every
  // render and feed back through `setFieldsValue` → re-render, which
  // surfaces as an infinite Suspense loop in the form body's nested
  // queries (`ResourceAllocationFormItems`, etc.). Read the latest value
  // through a `useEffectEvent` helper instead.
  const prefillFromCurrentRevision = useEffectEvent(() => {
    if (!currentRevision) return;
    const rev = currentRevision;

    const slots = rev.resourceSlots ?? [];
    const cpuSlot = slots.find((s) => s.slotName === 'cpu');
    const memSlot = slots.find((s) => s.slotName === 'mem');
    const acceleratorSlot = slots.find(
      (s) => s.slotName !== 'cpu' && s.slotName !== 'mem',
    );

    const shmemEntry = (rev.resourceConfig?.resourceOpts?.entries ?? []).find(
      (e) => e.name === 'shmem',
    );

    const variantName =
      runtimeVariantOptions.find(
        (o) => o.value === rev.modelRuntimeConfig?.runtimeVariantId,
      )?.label ?? '';
    const isCustom = variantName === 'custom';
    const service = rev.modelDefinition?.models?.[0]?.service;
    const customModelPath = rev.modelDefinition?.models?.[0]?.modelPath;
    // For custom + command mode: the saved revision carries a populated
    // `modelDefinition` with a `startCommand` token list. For custom +
    // file mode the form serializes to a null `modelDefinition`, so the
    // absence of `service.startCommand` indicates file mode.
    const hasCustomCommand =
      isCustom && !!service && (service.startCommand?.length ?? 0) > 0;

    prefilledMountAliasesRef.current = _.fromPairs(
      (rev.extraMounts ?? [])
        .filter((m) => !!m.mountDestination)
        .map((m) => [
          m.vfolderId.replace(/-/g, ''),
          m.mountDestination as string,
        ]),
    );

    // Split `environ` for non-custom variants: the runtime-parameter
    // section uses one designated env var (e.g. `BACKEND_VLLM_EXTRA_ARGS`)
    // to encode CLI-style ARGS presets, and individual env vars for ENV
    // presets. Build both sides and stash them so the child can reverse-map.
    const environRecord: Record<string, string> = Object.fromEntries(
      (rev.modelRuntimeConfig?.environ?.entries ?? []).map((e) => [
        e.name,
        e.value,
      ]),
    );
    if (!isCustom && variantName) {
      const extraArgsKey = getExtraArgsEnvVarName(variantName);
      const { [extraArgsKey]: extraArgsValue, ...envVarsWithoutArgs } =
        environRecord;
      setInitialRuntimeExtraArgs(extraArgsValue ?? '');
      setInitialRuntimeEnvVars(
        Object.keys(envVarsWithoutArgs).length > 0
          ? envVarsWithoutArgs
          : undefined,
      );
    }

    form.setFieldsValue({
      cluster_mode:
        rev.clusterConfig?.mode === 'SINGLE_NODE'
          ? 'single-node'
          : 'multi-node',
      cluster_size: rev.clusterConfig?.size ?? 1,
      resourceGroup: rev.resourceConfig?.resourceGroupName ?? '',
      // Keep `ResourceAllocationFormItems`' auto-preset effect from
      // clobbering the prefilled resource values. That effect runs when
      // `allocationPreset === 'auto-select'` (the default) and rewrites
      // cpu/mem to the first allocatable preset's values, which would
      // erase the cpu/mem we set just below.
      allocationPreset: 'custom',
      resource: {
        cpu: cpuSlot ? Number(cpuSlot.quantity) : 0,
        mem:
          convertToBinaryUnit(String(memSlot?.quantity ?? '0'), 'g', 3, true)
            ?.value ?? '0g',
        shmem:
          convertToBinaryUnit(
            shmemEntry?.value ?? AUTOMATIC_DEFAULT_SHMEM,
            'g',
            3,
            true,
          )?.value ?? AUTOMATIC_DEFAULT_SHMEM,
        ...(acceleratorSlot
          ? {
              acceleratorType: acceleratorSlot.slotName,
              accelerator:
                acceleratorSlot.slotName === 'cuda.shares'
                  ? parseFloat(String(acceleratorSlot.quantity))
                  : parseInt(String(acceleratorSlot.quantity), 10),
            }
          : {}),
      },
      enabledAutomaticShmem: !shmemEntry,
      // Same dash-stripping rationale as `modelFolderId` above: the
      // VFolderTable's `rowKey="id"` uses the 32-char-hex form, so
      // selectedRowKeys must match that shape for prefilled rows to
      // appear checked.
      mount_ids: (rev.extraMounts ?? []).map((m) =>
        m.vfolderId.replace(/-/g, ''),
      ),
      mount_id_map: _.fromPairs(
        (rev.extraMounts ?? [])
          .filter((m) => !!m.mountDestination)
          .map((m) => [
            m.vfolderId.replace(/-/g, ''),
            m.mountDestination as string,
          ]),
      ),
      runtimeVariantId: rev.modelRuntimeConfig?.runtimeVariantId ?? undefined,
      // VFolderSelect / VFolderTable's row data come from REST `/folders`
      // which exposes `id` as 32-char hex without dashes, while the
      // GraphQL `modelMountConfig.vfolderId` and `extraMounts.vfolderId`
      // come back as canonical UUIDs. Strip dashes here so the form
      // value matches existing options (and selectedRowKeys for the
      // additional-mounts table) directly — without it, VFolderTable
      // never highlights the prefilled rows and the alias map keys
      // can't be looked up. `convertToUUID` in the submit re-adds
      // dashes for the GraphQL input.
      modelFolderId: rev.modelMountConfig?.vfolderId
        ? rev.modelMountConfig.vfolderId.replace(/-/g, '')
        : undefined,
      mountDestination: rev.modelMountConfig?.mountDestination ?? '/models',
      definitionPath:
        rev.modelMountConfig?.definitionPath ?? 'model-definition.yaml',
      // `ImageEnvironmentSelectFormItems` matches the form's
      // `environments.version` against its image catalog by canonical
      // name; setting this is enough to drive the rest of the
      // environment selector (registry/namespace/tag) and ultimately
      // populate `environments.image.id`. Falling back to
      // `autoSelectDefault` (the previous behavior) only happened to
      // pick the right image when the test environment had a single
      // installed image.
      environments: rev.imageV2?.identity?.canonicalName
        ? { version: rev.imageV2.identity.canonicalName }
        : undefined,
      // EnvVarFormList stores entries as { variable, value } — translate
      // from the GraphQL `{ name, value }` shape on prefill. Only used
      // by the custom-variant branch; non-custom variants reverse-map
      // the same environ into `RuntimeParameterFormSection` via
      // `initialRuntimeExtraArgs` / `initialRuntimeEnvVars` above.
      environ: (rev.modelRuntimeConfig?.environ?.entries ?? []).map((e) => ({
        variable: e.name,
        value: e.value,
      })),
      // Custom variant + command mode: the saved revision's
      // `modelDefinition` carries the start command, port, health-check
      // path, retries and initial delay, and the per-model `modelPath`.
      // Reverse-map them into the modal's command-mode form fields so a
      // round-trip preserves user input. File-mode revisions have a
      // null `modelDefinition`, so we fall through to the default
      // command-mode initialValues.
      ...(hasCustomCommand && service
        ? {
            customDefinitionMode: 'command' as const,
            startCommand: formatShellCommand(service.startCommand ?? []),
            commandPort: service.port,
            commandHealthCheck: service.healthCheck?.path ?? undefined,
            commandModelMount: customModelPath ?? '/models',
            commandInitialDelay: service.healthCheck?.initialDelay ?? undefined,
            commandMaxRetries: service.healthCheck?.maxRetries ?? undefined,
          }
        : isCustom
          ? { customDefinitionMode: 'file' as const }
          : {}),
    });
  });

  useEffect(() => {
    prefillFromCurrentRevision();
  }, []);

  // Serialize runtime parameter UI values (from RuntimeParameterFormSection)
  // into an environ map — mirrors ServiceLauncherPageContent logic.
  const serializeRuntimeParamsToEnviron = (
    environ: Record<string, string>,
    runtimeVariant: string,
  ) => {
    const groups = runtimeParamGroupsRef.current;
    if (!groups || Object.keys(runtimeParamValuesRef.current).length === 0)
      return;

    const extraArgsEnvVar = getExtraArgsEnvVarName(runtimeVariant);
    for (const envName of getAllExtraArgsEnvVarNames()) {
      if (envName !== extraArgsEnvVar) delete environ[envName];
    }

    const touchedValues: Record<string, string> = {};
    for (const [key, val] of Object.entries(runtimeParamValuesRef.current)) {
      if (runtimeParamTouchedKeysRef.current.has(key)) touchedValues[key] = val;
    }

    const presets = flattenPresets(groups);
    const presetMap = new Map(presets.map((p) => [p.key, p]));
    const defaults = buildDefaultsMap(groups);
    const argsValues: Record<string, string> = {};
    const envValues: Record<string, string> = {};

    for (const [key, val] of Object.entries(touchedValues)) {
      if (val === '' || val === undefined) continue;
      const preset = presetMap.get(key);
      if (!preset) continue;
      if (preset.presetTarget === 'ENV') envValues[key] = val;
      else argsValues[key] = val;
    }

    const argsSchemaKeys = buildArgsSchemaKeySet(groups);
    if (environ[extraArgsEnvVar] && argsSchemaKeys.size > 0) {
      const { unmappedText } = reverseMapExtraArgs(
        environ[extraArgsEnvVar],
        argsSchemaKeys,
      );
      if (unmappedText) environ[extraArgsEnvVar] = unmappedText;
      else delete environ[extraArgsEnvVar];
    }

    for (const preset of presets) {
      if (preset.presetTarget === 'ENV') delete environ[preset.key];
    }

    if (Object.keys(argsValues).length > 0) {
      const manualArgs = environ[extraArgsEnvVar] ?? '';
      const merged = mergeExtraArgs(argsValues, manualArgs, defaults);
      if (merged) environ[extraArgsEnvVar] = merged;
      else delete environ[extraArgsEnvVar];
    }

    for (const [key, val] of Object.entries(envValues)) {
      const preset = presetMap.get(key);
      if (preset?.defaultValue !== null && preset?.defaultValue === val)
        continue;
      environ[key] = val;
    }
  };

  const handleFinish = (values: FormValues) => {
    // `setFields` raises an error programmatically — antd's
    // `scrollToFirstError` only fires from `onFinishFailed`, so we have
    // to nudge the scroll explicitly here.
    const flagImageRequired = () => {
      form.setFields([
        {
          name: ['environments', 'version'],
          errors: [t('modelService.ImageRequired')],
        },
      ]);
      form.scrollToField(['environments', 'version'], {
        behavior: 'smooth',
        block: 'center',
      });
    };

    const imageId = values.environments?.image?.id;
    if (!imageId) {
      flagImageRequired();
      return;
    }
    // `ImageInput.id` is declared as `ID!` but parsed as `UUID!`
    // server-side. The form provides a Strawberry global id
    // (`ImageV2:<uuid>` base64-encoded), so decode before submitting.
    const decodedImageId = safeDecodeUuid(imageId);
    if (!decodedImageId) {
      flagImageRequired();
      return;
    }

    // Build resource slots entries from form values directly. Mirrors the
    // ServiceLauncherPageContent pattern: cpu/mem are always present, plus an
    // optional accelerator slot keyed by `acceleratorType`.
    const slotEntries: { resourceType: string; quantity: string }[] = [
      { resourceType: 'cpu', quantity: String(values.resource.cpu) },
      { resourceType: 'mem', quantity: values.resource.mem },
    ];
    if (
      values.resource.acceleratorType &&
      values.resource.accelerator &&
      values.resource.accelerator > 0
    ) {
      slotEntries.push({
        resourceType: values.resource.acceleratorType,
        quantity: String(values.resource.accelerator),
      });
    }

    // Build resource opts entries — currently only shared memory.
    const optsEntries: { name: string; value: string }[] = [];
    if (values.resource.shmem) {
      optsEntries.push({ name: 'shmem', value: values.resource.shmem });
    }

    // Normalize cluster mode to schema enum. Match the FR-2381 convention
    // used by ServiceLauncherPageContent: multi-node + size==1 collapses to
    // SINGLE_NODE so the orchestrator skips inter-node setup.
    const clusterMode =
      values.cluster_mode === 'single-node' ||
      (values.cluster_mode === 'multi-node' && values.cluster_size === 1)
        ? 'SINGLE_NODE'
        : 'MULTI_NODE';

    // Build extraMounts — preserve per-folder mount destination from the
    // VFolderTable alias map. Same shape as ServiceLauncherPageContent.
    // VFolderTable returns vfolder ids as 32-char hex without dashes,
    // but ExtraVFolderMountInput.vfolderId is parsed as a UUID server-side.
    // Normalize to the canonical dashed form before submitting.
    //
    // `mount_destination` is required by the backend. The form's
    // `mount_id_map` is authoritative when present, but VFolderTable's
    // alias-map updates only carry entries for currently-visible rows —
    // editing any visible alias drops aliases for invisible mounts (e.g.
    // a vfolder owned by a different user that this deployment was
    // originally created with). Fall back through, in order:
    //   1. `values.mount_id_map[vfolderId]` — fresh user input.
    //   2. `prefilledMountAliasesRef.current[vfolderId]` — the original
    //      mount destination from the current revision.
    //   3. `vfoldersNameMap` →`/home/work/<name>` — same default the
    //      `mount_id_map` validator uses for un-aliased rows.
    //   4. `/home/work/<vfolderId>` — last-resort, never empty.
    const vfoldersNameMap: Record<string, string> =
      values.vfoldersNameMap ?? {};
    const extraMounts = (values.mount_ids ?? []).map((vfolderId) => {
      const mountDestination =
        values.mount_id_map?.[vfolderId] ||
        prefilledMountAliasesRef.current[vfolderId] ||
        (vfoldersNameMap[vfolderId]
          ? `/home/work/${vfoldersNameMap[vfolderId]}`
          : `/home/work/${vfolderId}`);
      return {
        vfolderId: convertToUUID(vfolderId),
        mountDestination,
      };
    });

    const variantName =
      runtimeVariantOptions.find((o) => o.value === values.runtimeVariantId)
        ?.label ?? '';
    const isCustom = variantName === 'custom';
    const isCommandMode = values.customDefinitionMode === 'command';

    // Build environ. The `EnvVarFormList` (`values.environ`) is the
    // user-controlled, free-form env-var input that the modal exposes
    // for *every* variant — so its entries always seed the record.
    // For non-custom variants `serializeRuntimeParamsToEnviron` then
    // layers the runtime-parameter section's *touched* presets on top
    // (it deletes the preset keys it owns before re-writing them, so
    // duplicates collapse predictably). Without this seed, a user who
    // typed a custom env var via "Add environment variables" on a
    // non-custom variant lost it on submit.
    const environRecord: Record<string, string> = {};
    for (const { variable, value } of values.environ ?? []) {
      if (variable) environRecord[variable] = value;
    }
    if (!isCustom) {
      serializeRuntimeParamsToEnviron(environRecord, variantName);
    }
    const environEntries = Object.entries(environRecord).map(
      ([name, value]) => ({ name, value }),
    );

    // Build modelDefinition for custom + command mode.
    // `ModelServiceConfigInput.startCommand` is `JSON!` in the schema but
    // the server-side Pydantic `ModelDefinition` validator requires a list
    // of shell tokens. Tokenize the user-typed command string the same
    // way `generateModelDefinitionYaml` does.
    const modelDefinition =
      isCustom && isCommandMode && values.startCommand
        ? {
            models: [
              {
                name: 'model',
                modelPath: values.commandModelMount ?? '/models',
                service: {
                  preStartActions: [],
                  startCommand: tokenizeShellCommand(values.startCommand),
                  port: values.commandPort ?? 8000,
                  healthCheck: values.commandHealthCheck
                    ? {
                        path: values.commandHealthCheck,
                        interval: 10,
                        maxRetries: values.commandMaxRetries ?? 10,
                        maxWaitTime: 15,
                      }
                    : null,
                },
              },
            ],
          }
        : null;

    const mountDestination =
      isCustom && isCommandMode
        ? (values.commandModelMount ?? '/models')
        : values.mountDestination || '/models';
    const definitionPath =
      isCustom && isCommandMode
        ? 'model-definition.yaml'
        : values.definitionPath || 'model-definition.yaml';

    onIsAddingChange(true);
    commitAdd({
      variables: {
        input: {
          deploymentId: toLocalId(deploymentId) ?? deploymentId,
          name: values.name || undefined,
          clusterConfig: {
            mode: clusterMode,
            size: values.cluster_size,
          },
          resourceConfig: {
            resourceGroup: { name: values.resourceGroup },
            resourceSlots: { entries: slotEntries },
            resourceOpts:
              optsEntries.length > 0 ? { entries: optsEntries } : null,
          },
          image: { id: decodedImageId },
          modelRuntimeConfig: {
            runtimeVariantId: values.runtimeVariantId,
            inferenceRuntimeConfig: null,
            environ:
              environEntries.length > 0 ? { entries: environEntries } : null,
          },
          modelMountConfig: {
            // VFolderSelect returns the vfolder id as 32-char hex
            // without dashes; the server parses this as a UUID, so
            // normalize before submitting (same as `extraMounts`).
            vfolderId: convertToUUID(values.modelFolderId),
            mountDestination,
            definitionPath,
          },
          modelDefinition,
          extraMounts: extraMounts.length > 0 ? extraMounts : null,
          options: { autoActivate: true },
        },
      },
      onCompleted: (_, errors) => {
        onIsAddingChange(false);
        if (errors && errors.length > 0) {
          const err = errors[0];
          const isInProgress = err?.message?.includes(
            'Another deployment is already in progress',
          );
          message.error(
            isInProgress
              ? t('deployment.AnotherDeploymentInProgress')
              : (err?.message ?? t('general.ErrorOccurred')),
          );
          return;
        }
        // Invalidate the deployment record so the next `useLazyLoadQuery`
        // (i.e. the next time the user opens Add Revision) treats it as
        // stale and refetches from the network even though we're on
        // `store-and-network`. Without this, Relay would hand back the
        // pre-mutation `currentRevision` sub-tree on the immediate
        // reopen and the modal would prefill from the *previous*
        // revision. We invalidate the deployment field at the root —
        // its arguments mirror what the body query asks for above —
        // so that the linked `currentRevision` is invalidated too.
        commitLocalUpdate(relayEnvironment, (store) => {
          const deploymentRecord = store
            .getRoot()
            .getLinkedRecord('deployment', { id: deploymentId });
          deploymentRecord?.invalidateRecord();
        });
        form.resetFields();
        onSuccess();
      },
      onError: (err) => {
        onIsAddingChange(false);
        const isInProgress = err.message?.includes(
          'Another deployment is already in progress',
        );
        message.error(
          isInProgress
            ? t('deployment.AnotherDeploymentInProgress')
            : (err.message ?? t('general.ErrorOccurred')),
        );
      },
    });
  };

  // antd's built-in `scrollToFirstError` walks `errorFields` in field
  // *registration* order, not DOM order. Because
  // `ResourceAllocationFormItems` lives inside a Suspense boundary, its
  // fields register *after* the top-level Form.Items rendered below it
  // in source — so the "first" errored field by registration ends up
  // being something like `runtimeVariantId`, even when `resourceGroup`
  // is visually higher and also errored. Walk the DOM instead and
  // scroll to whichever errored Form.Item is highest on screen.
  const handleFinishFailed = () => {
    requestAnimationFrame(() => {
      const firstErrorEl = document.querySelector<HTMLElement>(
        '.ant-modal-body .ant-form-item-has-error',
      );
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  };

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      style={{ marginTop: token.marginXS }}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      initialValues={_.merge({}, RESOURCE_ALLOCATION_INITIAL_FORM_VALUES, {
        mountDestination: '/models',
        definitionPath: 'model-definition.yaml',
        customDefinitionMode: 'command',
        commandPort: 8000,
        commandHealthCheck: '/health',
        commandModelMount: '/models',
        commandInitialDelay: 60,
        commandMaxRetries: 10,
        environ: [],
      })}
    >
      <Form.Item name="name" label={t('deployment.RevisionName')}>
        <Input placeholder={t('deployment.RevisionNamePlaceholder')} />
      </Form.Item>

      <SectionHeader>{t('deployment.step.ModelAndRuntime')}</SectionHeader>
      <Form.Item
        name="modelFolderId"
        label={t('deployment.ModelFolder')}
        rules={[{ required: true }]}
      >
        <VFolderSelect
          // `autoSelectDefault` runs a mount-time effect inside
          // VFolderSelect that writes the *first available* folder into
          // the form, which races with `prefillFromCurrentRevision` and
          // can clobber the deployment's actual model folder when more
          // than one is available. We always have the model folder from
          // the current revision here, so leave the field empty when
          // the revision somehow lacks one rather than auto-picking.
          valuePropName="id"
          filter={(vf) => vf.usage_mode === 'model' && vf.status === 'ready'}
          showOpenButton
          showCreateButton
          showRefreshButton
        />
      </Form.Item>
      <Form.Item
        name="runtimeVariantId"
        label={t('deployment.RuntimeVariant')}
        rules={[
          { required: true },
          {
            warningOnly: true,
            validator: async (_rule, value: string) => {
              const variantName = runtimeVariantOptions.find(
                (o) => o.value === value,
              )?.label;
              if (variantName && variantName !== 'custom') {
                return Promise.reject(
                  t('modelService.RuntimeVariantDefaultCommandAppliedNote'),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select options={runtimeVariantOptions} showSearch />
      </Form.Item>

      {/* Runtime parameter section — shown for non-custom variants */}
      <Form.Item dependencies={['runtimeVariantId']} noStyle>
        {({ getFieldValue }) => {
          const variantId = getFieldValue('runtimeVariantId');
          const variantName = runtimeVariantOptions.find(
            (o) => o.value === variantId,
          )?.label;
          if (!variantName || variantName === 'custom') return null;
          return (
            <div style={{ marginBottom: token.marginMD }}>
              <Suspense fallback={null}>
                <RuntimeParameterFormSection
                  runtimeVariant={variantName}
                  onChange={(values) => {
                    runtimeParamValuesRef.current = {
                      ...runtimeParamValuesRef.current,
                      ...values,
                    };
                  }}
                  onTouchedKeysChange={(keys) => {
                    runtimeParamTouchedKeysRef.current = keys;
                  }}
                  onGroupsLoaded={(groups) => {
                    runtimeParamGroupsRef.current = groups;
                  }}
                  initialExtraArgs={initialRuntimeExtraArgs}
                  initialEnvVars={initialRuntimeEnvVars}
                />
              </Suspense>
            </div>
          );
        }}
      </Form.Item>

      {/* Model definition — command vs file mode for custom variant */}
      <Form.Item dependencies={['runtimeVariantId']} noStyle>
        {({ getFieldValue }) => {
          const variantId = getFieldValue('runtimeVariantId');
          const variantName = runtimeVariantOptions.find(
            (o) => o.value === variantId,
          )?.label;
          if (variantName !== 'custom') {
            return null;
          }
          // Custom variant: Segmented command vs file mode
          return (
            <>
              <Form.Item name="customDefinitionMode" noStyle>
                <Segmented
                  options={[
                    {
                      label: t('modelService.EnterCommand'),
                      value: 'command',
                    },
                    { label: t('modelService.UseConfigFile'), value: 'file' },
                  ]}
                  style={{ marginBottom: token.marginMD }}
                />
              </Form.Item>
              <Form.Item dependencies={['customDefinitionMode']} noStyle>
                {({ getFieldValue: getField }) =>
                  getField('customDefinitionMode') === 'command' ? (
                    <>
                      <Form.Item
                        name="startCommand"
                        label={t('modelService.StartCommand')}
                        rules={[{ required: true, whitespace: true }]}
                      >
                        <Input.TextArea
                          placeholder={t(
                            'modelService.StartCommandPlaceholder',
                          )}
                          autoSize={{ minRows: 2 }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="commandModelMount"
                        label={t('modelService.ModelMountDestination')}
                      >
                        <Input placeholder="/models" allowClear />
                      </Form.Item>
                      <BAIFlex gap="sm">
                        <Form.Item
                          name="commandPort"
                          label={t('modelService.Port')}
                          style={{ flex: 1 }}
                        >
                          <InputNumber
                            min={1}
                            max={65535}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="commandHealthCheck"
                          label={t('modelService.HealthCheck')}
                          style={{ flex: 1 }}
                        >
                          <Input placeholder="/health" allowClear />
                        </Form.Item>
                      </BAIFlex>
                      <BAIFlex gap="sm">
                        <Form.Item
                          name="commandInitialDelay"
                          label={t('modelService.InitialDelay')}
                          style={{ flex: 1 }}
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
                          style={{ flex: 1 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </BAIFlex>
                    </>
                  ) : (
                    <BAIFlex gap="sm">
                      <Form.Item
                        name="mountDestination"
                        label={t('deployment.ModelMountDestination')}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                      >
                        <Input allowClear placeholder="/models" />
                      </Form.Item>
                      <Form.Item
                        name="definitionPath"
                        label={t('deployment.ModelDefinitionPath')}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                      >
                        <Input allowClear placeholder="model-definition.yaml" />
                      </Form.Item>
                    </BAIFlex>
                  )
                }
              </Form.Item>
            </>
          );
        }}
      </Form.Item>

      <SectionHeader>{t('session.launcher.Environments')}</SectionHeader>

      <ImageEnvironmentSelectFormItems />
      <EnvVarFormList
        name="environ"
        formItemProps={{
          validateTrigger: ['onChange', 'onBlur'],
        }}
      />

      <SectionHeader>{t('deployment.step.ClusterAndResources')}</SectionHeader>
      {/*
        `ResourceAllocationFormItems` internally uses several
        `useLazyLoadQuery` calls that suspend whenever the watched
        form values (resource group, image, allocation preset) change.
        Those throws are caught by the modal-level Suspense fallback
        above the form body — combined with the deployment query's
        default `store-or-network` policy, the body remounts re-read
        the cached deployment instead of re-fetching it, so the
        previously observed infinite-fetch loop does not recur.
      */}
      <ResourceAllocationFormItems enableResourcePresets />

      <Collapse
        items={[
          {
            key: 'advanced',
            label: t('session.launcher.AdvancedSettings'),
            children: (
              <>
                <Suspense fallback={<Skeleton active />}>
                  {/*
                    `mount_id_map` and `mount_ids` are explicit
                    dependencies in addition to `modelFolderId` because
                    `VFolderTableFormItem` passes
                    `aliasMap={form.getFieldValue('mount_id_map')}` —
                    an unsubscribed snapshot read — to `VFolderTable`.
                    Without these deps the wrapping render-prop would
                    not re-execute when `prefillFromCurrentRevision`
                    writes new aliases via `form.setFieldsValue`, so
                    `VFolderTable` would keep showing the previously
                    captured aliasMap (the user-visible symptom: extra
                    mount aliases appear stale on reopen even though
                    the underlying form value is correct).
                  */}
                  <Form.Item
                    noStyle
                    dependencies={[
                      'modelFolderId',
                      'mount_id_map',
                      'mount_ids',
                    ]}
                  >
                    {({ getFieldValue }) => {
                      const modelFolderId = getFieldValue('modelFolderId');
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
                            vfolder.id !== modelFolderId
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
    </Form>
  );
};

const DeploymentAddRevisionModal: React.FC<DeploymentAddRevisionModalProps> = ({
  open,
  onSuccess,
  deploymentId,
  ...restModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <BAIModal
      open={open}
      title={t('deployment.AddRevision')}
      width={720}
      okText={t('deployment.AddRevision')}
      okButtonProps={{
        type: 'primary',
      }}
      onOk={() => form.submit()}
      confirmLoading={isAdding}
      {...restModalProps}
    >
      <Suspense fallback={<Skeleton active />}>
        <DeploymentAddRevisionModalFormBody
          deploymentId={deploymentId}
          form={form}
          onSuccess={onSuccess}
          onIsAddingChange={setIsAdding}
        />
      </Suspense>
    </BAIModal>
  );
};

export default DeploymentAddRevisionModal;
