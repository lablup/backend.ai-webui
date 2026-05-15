/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAddRevisionModalAddMutation } from '../__generated__/DeploymentAddRevisionModalAddMutation.graphql';
import { DeploymentAddRevisionModalImageNameQuery } from '../__generated__/DeploymentAddRevisionModalImageNameQuery.graphql';
import type { DeploymentAddRevisionModalPresetCountQuery } from '../__generated__/DeploymentAddRevisionModalPresetCountQuery.graphql';
import type { DeploymentAddRevisionModalPresetDetailQuery } from '../__generated__/DeploymentAddRevisionModalPresetDetailQuery.graphql';
import type { DeploymentAddRevisionModalQuery } from '../__generated__/DeploymentAddRevisionModalQuery.graphql';
import type {
  DeploymentAddRevisionModalSelectedPresetQuery,
  DeploymentAddRevisionModalSelectedPresetQuery$data,
} from '../__generated__/DeploymentAddRevisionModalSelectedPresetQuery.graphql';
import { convertToBinaryUnit } from '../helper';
import {
  formatShellCommand,
  tokenizeShellCommand,
} from '../helper/parseCliCommand';
import {
  mergeExtraArgs,
  reverseMapExtraArgs,
} from '../helper/runtimeExtraArgsParser';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useModelStoreProject } from '../hooks/useModelStoreProject';
import {
  buildArgsSchemaKeySet,
  buildDefaultsMap,
  flattenPresets,
  getAllExtraArgsEnvVarNames,
  getExtraArgsEnvVarName,
  type RuntimeParameterGroup,
} from '../hooks/useRuntimeParameterSchema';
import DeploymentPresetDetailModal from './DeploymentPresetDetailModal';
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
import VFolderTableFormItem, {
  type VFolderTableFormValues,
} from './VFolderTableFormItem';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Segmented,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { FormInstance } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  BAIAvailablePresetSelect,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIProjectVfolderSelect,
  BAIRuntimeVariantSelect,
  convertToUUID,
  safeDecodeUuid,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

export type FormValues = ImageEnvironmentFormInput &
  ResourceAllocationFormValue &
  VFolderTableFormValues & {
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
    commandInterval?: number;
    commandMaxWaitTime?: number;
    environ: EnvVarFormListValue[];
  };

export type PresetFormValues = {
  revisionPresetId: string;
  modelFolderId: string;
};

interface DeploymentAddRevisionModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
  deploymentId: string;
  open?: boolean;
}

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

// Loader for the preset-detail modal in this paginated context. The Preset
// selector here (`BAIAvailablePresetSelect`) paginates independently of the
// modal's main query, so we cannot spread `DeploymentPresetDetailModalFragment`
// on a list edge. Instead, when the user opens the detail view, fire a tiny
// singular query keyed by the selected presetId and hand the fragment ref
// directly to `DeploymentPresetDetailModal`.
const PresetDetailLoader: React.FC<{
  presetId: string;
  onCancel: () => void;
}> = ({ presetId, onCancel }) => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentAddRevisionModalPresetDetailQuery>(
    graphql`
      query DeploymentAddRevisionModalPresetDetailQuery($id: UUID!) {
        deploymentRevisionPreset(id: $id) {
          ...DeploymentPresetDetailModalFragment
        }
      }
    `,
    { id: presetId },
  );
  return (
    <DeploymentPresetDetailModal
      open
      presetFrgmt={data.deploymentRevisionPreset}
      onCancel={onCancel}
    />
  );
};

const DeploymentAddRevisionModal: React.FC<DeploymentAddRevisionModalProps> = ({
  onRequestClose,
  deploymentId,
  open,
  ...restModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const relayEnvironment = useRelayEnvironment();
  // The model folder picker scopes to the MODEL_STORE project, not the
  // deployment's own project — model cards live in the domain-wide model
  // store regardless of which project owns the deployment.
  const { id: modelStoreProjectId } = useModelStoreProject();
  const { logger } = useBAILogger();

  // Defer `open` so the lazy query only fires once the modal has actually
  // committed to opening. `loading={deferredOpen !== open}` then lets the
  // modal show its built-in skeleton during the transition instead of an
  // inner Suspense fallback (FR-2862 review).
  const deferredOpen = useDeferredValue(open);

  const [customForm] = Form.useForm<FormValues>();
  const [presetForm] = Form.useForm<PresetFormValues>();
  // FR-2862 feedback: hoist `autoActivate` from the Custom body into the
  // modal so it can be rendered in the modal footer. Both modes forward
  // the value via `AddRevisionOptions.autoActivate` on `addModelRevision`.
  const [autoActivate, setAutoActivate] = useState(true);

  const [mode, setMode] = useBAISettingUserState(
    'deploymentRevisionCreationMode',
  );
  const effectiveMode = mode ?? 'preset';

  // One-shot carry-over consumed by the Custom body on mount. Set when the
  // user transitions Preset → Custom with a preset selected.
  const [presetTransferPrefill, setPresetTransferPrefill] =
    useState<Partial<FormValues> | null>(null);

  // One-shot carry-over consumed by the Preset body on mount. Set when the
  // user transitions Custom → Preset; carries the selected model folder so
  // the user does not have to re-pick it after switching modes.
  const [customTransferPrefill, setCustomTransferPrefill] =
    useState<Partial<PresetFormValues> | null>(null);

  // Preset detail modal target — opens DeploymentPresetDetailModal when the
  // user clicks the (i) button next to the preset selector. The modal owns
  // its own Relay query keyed by this id.
  const [presetDetailId, setPresetDetailId] = useState<string | null>(null);

  // Map of runtime variant id → name, populated by `BAIRuntimeVariantSelect`
  // as it resolves the currently selected value (via its `runtimeVariant(id:)`
  // point lookup) and the visible page of the paginated list. Used by the
  // form to branch on `variantName === 'custom'` and to look up the human-
  // readable name at submit time, without owning the variant list here.
  const [runtimeVariantNameMap, setRuntimeVariantNameMap] = useState<
    Record<string, string>
  >({});

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

  const data = useLazyLoadQuery<DeploymentAddRevisionModalQuery>(
    graphql`
      query DeploymentAddRevisionModalQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          metadata {
            projectId
            resourceGroupName
          }
          currentRevision {
            clusterConfig {
              mode
              size
            }
            resourceConfig {
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
              runtimeVariant {
                name
              }
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
                    interval
                    maxWaitTime
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
    { deploymentId },
    {
      // Skip the network round-trip until the modal has actually committed
      // to opening (`deferredOpen === open === true`); `store-and-network`
      // afterwards so re-opening after a successful `addModelRevision`
      // mutation pulls a fresh `currentRevision` instead of the cached one.
      fetchPolicy: deferredOpen && open ? 'store-and-network' : 'store-only',
    },
  );

  const deployment = data.deployment;
  const currentRevision = deployment?.currentRevision;

  // The preset "empty state" probe runs as a side-effect fetchQuery rather
  // than part of the main `useLazyLoadQuery`, because reading the count
  // from the lazy query throws a Suspense up to the nearest parent
  // boundary — which, with no inner boundary, lands in the deployment
  // detail page and blanks the whole page while the modal opens.
  // `undefined` means "still probing"; we render the form optimistically
  // until the answer arrives.
  const [hasNoPresets, setHasNoPresets] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchQuery<DeploymentAddRevisionModalPresetCountQuery>(
      relayEnvironment,
      graphql`
        query DeploymentAddRevisionModalPresetCountQuery {
          deploymentRevisionPresets(
            orderBy: [{ field: RANK, direction: "ASC" }]
            first: 1
          ) {
            count
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' },
    )
      .toPromise()
      .then((result) => {
        if (cancelled) return;
        setHasNoPresets((result?.deploymentRevisionPresets?.count ?? 0) === 0);
      })
      .catch(() => {
        if (cancelled) return;
        // On error, assume presets exist — the BAIAvailablePresetSelect's
        // own paginated query will surface a per-select empty state if it
        // also fails.
        setHasNoPresets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, relayEnvironment]);

  // The parent deployment's vfolder is the default Model Folder. Users can
  // override it in this mode (in contrast to the VFolder/ModelStore entry
  // point where the folder is locked in by context).
  const defaultModelFolderId =
    currentRevision?.modelMountConfig?.vfolderId ?? undefined;

  // The `BAIAvailablePresetSelect` paginates independently of this modal's
  // main query (it can scroll past the first page on demand), so the user
  // can select a preset that does not appear in any local list we hold.
  // Resolve the selected preset's full data on demand via the singular
  // `deploymentRevisionPreset(id:)` query — used by `handleModeChange` to
  // prefill the Custom form. A small in-memory cache avoids refetching when
  // the same preset is referenced multiple times during a session.
  const presetDataCacheRef = useRef<
    Map<
      string,
      NonNullable<
        DeploymentAddRevisionModalSelectedPresetQuery$data['deploymentRevisionPreset']
      >
    >
  >(new Map());
  const fetchPresetData = async (
    presetId: string,
  ): Promise<NonNullable<
    DeploymentAddRevisionModalSelectedPresetQuery$data['deploymentRevisionPreset']
  > | null> => {
    const cached = presetDataCacheRef.current.get(presetId);
    if (cached) return cached;
    const result =
      await fetchQuery<DeploymentAddRevisionModalSelectedPresetQuery>(
        relayEnvironment,
        graphql`
          query DeploymentAddRevisionModalSelectedPresetQuery($id: UUID!) {
            deploymentRevisionPreset(id: $id) {
              id
              runtimeVariantId
              cluster {
                clusterMode
                clusterSize
              }
              execution {
                imageId
                environ {
                  key
                  value
                }
              }
              resource {
                resourceOpts {
                  name
                  value
                }
              }
              resourceSlots {
                slotName
                quantity
              }
            }
          }
        `,
        { id: presetId },
        { fetchPolicy: 'store-or-network' },
      ).toPromise();
    const preset = result?.deploymentRevisionPreset ?? null;
    if (preset) {
      presetDataCacheRef.current.set(presetId, preset);
    }
    return preset;
  };

  const [commitAdd, isAddInFlight] =
    useMutation<DeploymentAddRevisionModalAddMutation>(graphql`
      mutation DeploymentAddRevisionModalAddMutation(
        $input: AddRevisionInput!
      ) {
        addModelRevision(input: $input) {
          revision {
            id
            clusterConfig {
              mode
              size
            }
            resourceConfig {
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
    `);

  // Build a Custom-form prefill object from a preset node read off the
  // singular `deploymentRevisionPreset(id:)` query (resolved via
  // `fetchPresetData`). `image canonicalName` is fetched async because
  // `ImageEnvironmentSelectFormItems` matches the form's `environments.version`
  // against canonical names.
  const buildPrefillFromPreset = async (
    preset: NonNullable<
      DeploymentAddRevisionModalSelectedPresetQuery$data['deploymentRevisionPreset']
    >,
  ): Promise<Partial<FormValues>> => {
    const slots = preset.resourceSlots ?? [];
    const cpuSlot = slots.find((s) => s.slotName === 'cpu');
    const memSlot = slots.find((s) => s.slotName === 'mem');
    const acceleratorSlot = slots.find(
      (s) => s.slotName !== 'cpu' && s.slotName !== 'mem',
    );

    const shmemEntry = (preset.resource?.resourceOpts ?? []).find(
      (e) => e.name === 'shmem',
    );

    const clusterMode =
      preset.cluster?.clusterMode === 'SINGLE_NODE'
        ? ('single-node' as const)
        : ('multi-node' as const);

    let imageCanonicalName: string | undefined;
    if (preset.execution?.imageId) {
      try {
        const result =
          await fetchQuery<DeploymentAddRevisionModalImageNameQuery>(
            relayEnvironment,
            graphql`
              query DeploymentAddRevisionModalImageNameQuery($id: ID!) {
                imageV2(id: $id) {
                  identity {
                    canonicalName
                  }
                }
              }
            `,
            { id: preset.execution.imageId },
            { fetchPolicy: 'store-or-network' },
          ).toPromise();
        imageCanonicalName =
          result?.imageV2?.identity?.canonicalName ?? undefined;
      } catch {
        imageCanonicalName = undefined;
      }
    }

    const environEntries = (preset.execution?.environ ?? []).map((e) => ({
      variable: e.key,
      value: e.value,
    }));

    // `setFieldsValue` accepts a deep partial structurally even though
    // FormValues' nested `environments` requires `environment` / `image`.
    // Build as a loosely-typed record and let antd handle merging.
    const prefill: Record<string, unknown> = {
      cluster_mode: clusterMode,
      cluster_size: preset.cluster?.clusterSize ?? 1,
      allocationPreset: 'custom',
      resource: {
        cpu: cpuSlot ? Number(cpuSlot.quantity) : 0,
        mem:
          convertToBinaryUnit(String(memSlot?.quantity ?? '0'), 'g', 2)
            ?.value ?? '0g',
        shmem:
          convertToBinaryUnit(
            shmemEntry?.value ?? AUTOMATIC_DEFAULT_SHMEM,
            'g',
            2,
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
      runtimeVariantId: preset.runtimeVariantId ?? undefined,
      environ: environEntries,
      ...(imageCanonicalName
        ? { environments: { version: imageCanonicalName } }
        : {}),
    };

    return prefill as Partial<FormValues>;
  };

  const handleModeChange = async (next: 'preset' | 'custom') => {
    if (next === effectiveMode) return;

    if (effectiveMode === 'preset' && next === 'custom') {
      // Carry the currently selected preset (if any) into the Custom form.
      // Also carry the model folder the user picked in Preset mode (spec (d)).
      //
      // Read the preset id from the form (source of truth for the selection,
      // since `BAIAvailablePresetSelect` is wrapped in a named `Form.Item`),
      // then resolve the preset's full data via the singular
      // `deploymentRevisionPreset(id:)` query so this works regardless of
      // which page the select scrolled to.
      const presetValues = presetForm.getFieldsValue();
      const selectedPresetId = presetValues.revisionPresetId;
      let prefill: Partial<FormValues> = {};
      if (selectedPresetId) {
        const preset = await fetchPresetData(selectedPresetId);
        if (preset) {
          prefill = await buildPrefillFromPreset(preset);
        }
      }
      if (presetValues.modelFolderId) {
        prefill.modelFolderId = presetValues.modelFolderId;
      }
      setPresetTransferPrefill(
        Object.keys(prefill).length > 0 ? prefill : null,
      );
      setMode('custom');
      return;
    }

    // Custom → Preset: discard custom edits (spec line 206), but carry over
    // the model folder the user picked in Custom mode so the selection is
    // not lost across mode switches (parallel to Preset → Custom carry-over).
    const customValues = customForm.getFieldsValue();
    const carryOver: Partial<PresetFormValues> = {};
    if (customValues.modelFolderId) {
      carryOver.modelFolderId = customValues.modelFolderId;
    }
    customForm.resetFields();
    setPresetTransferPrefill(null);
    setCustomTransferPrefill(
      Object.keys(carryOver).length > 0 ? carryOver : null,
    );
    setMode('preset');
  };

  // Build the form values that mirror the deployment's current revision and
  // push them into the Custom antd Form. Called from the "Load current
  // revision" button on the Alert; the React Compiler handles memoization
  // under the `'use memo'` directive so a plain function suffices.
  const prefillFromCurrentRevision = () => {
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

    // The query selects `modelRuntimeConfig.runtimeVariant.name`, so the
    // prefill path knows the variant name without waiting for
    // `BAIRuntimeVariantSelect` to resolve it.
    const variantName = rev.modelRuntimeConfig?.runtimeVariant?.name ?? '';
    const isCustom = variantName === 'custom';
    // Seed `runtimeVariantNameMap` so submit and any other consumers can
    // resolve `runtimeVariantId → name` immediately, without waiting for
    // `BAIRuntimeVariantSelect`'s point lookup to finish.
    const variantId = rev.modelRuntimeConfig?.runtimeVariantId;
    if (variantId && variantName) {
      setRuntimeVariantNameMap((prev) => ({
        ...prev,
        [variantId]: variantName,
      }));
    }
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

    customForm.setFieldsValue({
      cluster_mode:
        rev.clusterConfig?.mode === 'SINGLE_NODE'
          ? 'single-node'
          : 'multi-node',
      cluster_size: rev.clusterConfig?.size ?? 1,
      // Keep `ResourceAllocationFormItems`' auto-preset effect from
      // clobbering the prefilled resource values. That effect runs when
      // `allocationPreset === 'auto-select'` (the default) and rewrites
      // cpu/mem to the first allocatable preset's values, which would
      // erase the cpu/mem we set just below.
      allocationPreset: 'custom',
      resource: {
        cpu: cpuSlot ? Number(cpuSlot.quantity) : 0,
        mem:
          convertToBinaryUnit(String(memSlot?.quantity ?? '0'), 'g', 2)
            ?.value ?? '0g',
        shmem:
          convertToBinaryUnit(
            shmemEntry?.value ?? AUTOMATIC_DEFAULT_SHMEM,
            'g',
            2,
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
      // BAIProjectVfolderSelect returns the canonical dashed UUID, which
      // matches `rev.modelMountConfig.vfolderId` directly. `convertToUUID`
      // in the submit is idempotent on already-dashed values.
      modelFolderId: rev.modelMountConfig?.vfolderId ?? undefined,
      mountDestination: rev.modelMountConfig?.mountDestination ?? '/models',
      definitionPath: rev.modelMountConfig?.definitionPath ?? undefined,
      // `ImageEnvironmentSelectFormItems` matches the form's
      // `environments.version` against its image catalog by canonical
      // name; setting this is enough to drive the rest of the
      // environment selector (registry/namespace/tag) and ultimately
      // populate `environments.image.id`.
      environments: rev.imageV2?.identity?.canonicalName
        ? { version: rev.imageV2.identity.canonicalName }
        : undefined,
      // EnvVarFormList stores entries as { variable, value } — translate
      // from the GraphQL `{ name, value }` shape on prefill.
      environ: (rev.modelRuntimeConfig?.environ?.entries ?? []).map((e) => ({
        variable: e.name,
        value: e.value,
      })),
      ...(hasCustomCommand && service
        ? {
            customDefinitionMode: 'command' as const,
            startCommand: formatShellCommand(service.startCommand ?? []),
            commandPort: service.port,
            commandHealthCheck: service.healthCheck?.path ?? undefined,
            commandModelMount: customModelPath ?? '/models',
            commandInitialDelay: service.healthCheck?.initialDelay ?? undefined,
            commandMaxRetries: service.healthCheck?.maxRetries ?? undefined,
            commandInterval: service.healthCheck?.interval ?? undefined,
            commandMaxWaitTime: service.healthCheck?.maxWaitTime ?? undefined,
          }
        : isCustom
          ? { customDefinitionMode: 'file' as const }
          : {}),
    });
  };

  // One-shot consumption of preset-transfer prefill when the user transitions
  // to Custom mode. The Preset→Custom switch sets `presetTransferPrefill`;
  // here we apply it as soon as Custom mode is active, then clear it.
  const consumePresetTransferPrefill = useEffectEvent(() => {
    if (!presetTransferPrefill) return;
    customForm.setFieldsValue(presetTransferPrefill as FormValues);
    setPresetTransferPrefill(null);
  });

  // Mirror image of the above for Custom → Preset transitions. Applied after
  // the Preset form mounts, since `setFieldsValue` before the fields are
  // registered does not stick.
  const consumeCustomTransferPrefill = useEffectEvent(() => {
    if (!customTransferPrefill) return;
    presetForm.setFieldsValue(customTransferPrefill as PresetFormValues);
    setCustomTransferPrefill(null);
  });

  useEffect(() => {
    if (effectiveMode === 'custom') {
      consumePresetTransferPrefill();
    } else {
      consumeCustomTransferPrefill();
    }
  }, [effectiveMode]);

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

  const handleCustomFinish = (values: FormValues): void => {
    // `setFields` raises an error programmatically — antd's
    // `scrollToFirstError` only fires from `onFinishFailed`, so we have
    // to nudge the scroll explicitly here.
    const flagImageRequired = () => {
      customForm.setFields([
        {
          name: ['environments', 'version'],
          errors: [t('modelService.ImageRequired')],
        },
      ]);
      customForm.scrollToField(['environments', 'version'], {
        behavior: 'smooth',
        block: 'center',
      });
    };

    const imageId = values.environments?.image?.id;
    if (!imageId) {
      flagImageRequired();
      return;
    }
    // `ImageInput.id` is declared as `ID!` but parsed as `UUID!` server-side.
    const decodedImageId = safeDecodeUuid(imageId);
    if (!decodedImageId) {
      flagImageRequired();
      return;
    }

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

    const optsEntries: { name: string; value: string }[] = [];
    if (values.resource.shmem) {
      optsEntries.push({ name: 'shmem', value: values.resource.shmem });
    }

    const clusterMode =
      values.cluster_mode === 'single-node' ||
      (values.cluster_mode === 'multi-node' && values.cluster_size === 1)
        ? 'SINGLE_NODE'
        : 'MULTI_NODE';

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

    const variantName = runtimeVariantNameMap[values.runtimeVariantId] ?? '';
    const isCustom = variantName === 'custom';
    const isCommandMode = values.customDefinitionMode === 'command';

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
                        interval: values.commandInterval ?? 10,
                        maxRetries: values.commandMaxRetries ?? 10,
                        maxWaitTime: values.commandMaxWaitTime ?? 15,
                        initialDelay: values.commandInitialDelay,
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

    commitAdd({
      variables: {
        input: {
          deploymentId: toLocalId(deploymentId) ?? deploymentId,
          clusterConfig: {
            mode: clusterMode,
            size: values.cluster_size,
          },
          resourceConfig: {
            resourceSlots: { entries: slotEntries },
            resourceOpts:
              optsEntries.length > 0 ? { entries: optsEntries } : null,
          },
          image: { id: decodedImageId },
          modelRuntimeConfig: {
            runtimeVariantId: values.runtimeVariantId,
            environ:
              environEntries.length > 0 ? { entries: environEntries } : null,
          },
          modelMountConfig: {
            vfolderId: convertToUUID(values.modelFolderId),
            mountDestination,
            definitionPath: values.definitionPath,
          },
          modelDefinition,
          extraMounts: extraMounts.length > 0 ? extraMounts : null,
          options: { autoActivate },
        },
      },
      onCompleted: (_, errors) => {
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
        customForm.resetFields();
        message.success(t('deployment.RevisionAdded'));
        onRequestClose(true);
      },
      onError: (err) => {
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

  const handlePresetFinish = (values: PresetFormValues): void => {
    // Preset mode adds a revision to the current deployment using the
    // selected `revisionPresetId`. Cluster / resource / image / runtime
    // configs are derived server-side from the preset; the client only
    // forwards the user-picked model folder via `modelMountConfig` and the
    // `autoActivate` option.
    commitAdd({
      variables: {
        input: {
          deploymentId: toLocalId(deploymentId) ?? deploymentId,
          revisionPresetId: values.revisionPresetId,
          modelMountConfig: {
            vfolderId: convertToUUID(values.modelFolderId),
            mountDestination: '/models',
          },
          options: { autoActivate },
        },
      },
      onCompleted: (_, errors) => {
        if (errors && errors.length > 0) {
          const err = errors[0];
          const isInProgress = err?.message?.includes(
            'Another deployment is already in progress',
          );
          logger.error(
            '[DeploymentAddRevisionModal] addModelRevision (preset) returned errors',
            errors,
          );
          message.error(
            isInProgress
              ? t('deployment.AnotherDeploymentInProgress')
              : (err?.message ?? t('general.ErrorOccurred')),
          );
          return;
        }
        presetForm.resetFields();
        message.success(t('deployment.RevisionAdded'));
        onRequestClose(true);
      },
      onError: (error) => {
        const isInProgress = error.message?.includes(
          'Another deployment is already in progress',
        );
        logger.error(
          '[DeploymentAddRevisionModal] addModelRevision (preset) failed',
          error,
        );
        message.error(
          isInProgress
            ? t('deployment.AnotherDeploymentInProgress')
            : (error.message ?? t('general.ErrorOccurred')),
        );
      },
    });
  };

  // antd's built-in `scrollToFirstError` walks `errorFields` in field
  // *registration* order, not DOM order. Walk the DOM instead and scroll to
  // whichever errored Form.Item is highest on screen.
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

  const handleOk = async () => {
    // Explicitly `validateFields()` before triggering the mutation. The
    // subsequent `form.submit()` will also validate, but routing through
    // `onFinishFailed` only — without an awaitable pre-check here — would
    // silently kick off `commitAdd` paths that depend on the user having
    // first dismissed validation errors (project rule: always validate
    // before deploy/commit mutations).
    const activeForm = effectiveMode === 'preset' ? presetForm : customForm;
    try {
      await activeForm.validateFields();
    } catch {
      handleFinishFailed();
      return;
    }
    activeForm.submit();
  };

  return (
    <BAIModal
      open={open}
      loading={deferredOpen !== open}
      title={
        <BAIFlex
          direction="row"
          align="center"
          justify="between"
          gap="sm"
          wrap="wrap"
          style={{ paddingRight: token.paddingLG }}
        >
          <span>{t('deployment.AddRevision')}</span>
          <Segmented<'preset' | 'custom'>
            value={effectiveMode}
            onChange={handleModeChange}
            options={[
              { label: t('deployment.PresetMode'), value: 'preset' },
              { label: t('deployment.CustomMode'), value: 'custom' },
            ]}
          />
        </BAIFlex>
      }
      width={720}
      footer={
        <BAIFlex direction="row" align="center" justify="between" gap="sm">
          <Checkbox
            checked={autoActivate}
            onChange={(e: CheckboxChangeEvent) =>
              setAutoActivate(e.target.checked)
            }
            disabled={effectiveMode === 'preset' && hasNoPresets}
          >
            {t('deployment.AutoActivate')}
          </Checkbox>
          <BAIFlex direction="row" align="center" gap="xs">
            <Button onClick={() => onRequestClose()}>
              {t('button.Cancel')}
            </Button>
            <Button
              type="primary"
              loading={isAddInFlight}
              onClick={handleOk}
              disabled={effectiveMode === 'preset' && hasNoPresets}
            >
              {t('deployment.AddRevision')}
            </Button>
          </BAIFlex>
        </BAIFlex>
      }
      onCancel={() => onRequestClose()}
      confirmLoading={isAddInFlight}
      destroyOnHidden
      {...restModalProps}
    >
      {effectiveMode === 'preset' ? (
        hasNoPresets ? (
          // Empty-state: per spec, when no preset is available in Preset Mode,
          // guide the user to switch to Custom Mode.
          <Alert
            type="info"
            showIcon
            style={{ marginTop: token.marginXS }}
            title={t('deployment.NoPresetsAvailable')}
            description={t('deployment.NoPresetsAvailableSwitchToCustom')}
          />
        ) : (
          <Form<PresetFormValues>
            key="preset-form"
            form={presetForm}
            layout="vertical"
            style={{ marginTop: token.marginXS }}
            onFinish={handlePresetFinish}
            onFinishFailed={handleFinishFailed}
            initialValues={{
              modelFolderId: defaultModelFolderId,
            }}
          >
            <Form.Item
              label={t('modelStore.Preset')}
              tooltip={t('modelStore.PresetTooltip')}
              required
            >
              <BAIFlex direction="row" gap="xs">
                <Form.Item
                  name="revisionPresetId"
                  noStyle
                  rules={[{ required: true }]}
                >
                  <BAIAvailablePresetSelect style={{ flex: 1 }} />
                </Form.Item>
                <Form.Item dependencies={['revisionPresetId']} noStyle>
                  {({ getFieldValue }: FormInstance<PresetFormValues>) => {
                    const selectedId = getFieldValue('revisionPresetId');
                    return (
                      <Space.Compact>
                        <Tooltip
                          title={t('modelService.DeploymentPresetDetail')}
                        >
                          <Button
                            icon={<InfoCircleOutlined />}
                            disabled={!selectedId}
                            onClick={() => {
                              if (!selectedId) return;
                              setPresetDetailId(selectedId);
                            }}
                          />
                        </Tooltip>
                      </Space.Compact>
                    );
                  }}
                </Form.Item>
              </BAIFlex>
            </Form.Item>

            <Form.Item
              name="modelFolderId"
              label={t('deployment.ModelFolder')}
              tooltip={t('deployment.ModelFolderTooltip')}
              rules={[{ required: true }]}
            >
              <BAIProjectVfolderSelect
                projectId={modelStoreProjectId ?? ''}
                disabled={!modelStoreProjectId}
                filter={{
                  usageMode: { equals: 'MODEL' },
                  status: { equals: 'READY' },
                }}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        )
      ) : (
        <Form<FormValues>
          key="custom-form"
          form={customForm}
          layout="vertical"
          style={{ marginTop: token.marginXS }}
          onFinish={handleCustomFinish}
          onFinishFailed={handleFinishFailed}
          initialValues={_.merge({}, RESOURCE_ALLOCATION_INITIAL_FORM_VALUES, {
            resourceGroup: deployment?.metadata?.resourceGroupName,
            mountDestination: '/models',
            customDefinitionMode: 'command',
            commandPort: 8000,
            commandHealthCheck: '/health',
            commandModelMount: '/models',
            commandInitialDelay: 60,
            commandMaxRetries: 10,
            commandInterval: 10,
            commandMaxWaitTime: 15,
            environ: [],
          })}
        >
          {currentRevision ? (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: token.marginMD }}
              title={t('deployment.CurrentRevisionAvailableDescription')}
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={() => prefillFromCurrentRevision()}
                >
                  {t('deployment.LoadCurrentRevision')}
                </Button>
              }
            />
          ) : null}

          <SectionHeader>{t('deployment.step.ModelAndRuntime')}</SectionHeader>
          <Form.Item
            name="modelFolderId"
            label={t('deployment.ModelFolder')}
            tooltip={t('deployment.ModelFolderTooltip')}
            rules={[{ required: true }]}
          >
            <BAIProjectVfolderSelect
              projectId={modelStoreProjectId ?? ''}
              disabled={!modelStoreProjectId}
              filter={{
                usageMode: { equals: 'MODEL' },
                status: { equals: 'READY' },
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="runtimeVariantId"
            label={t('deployment.RuntimeVariant')}
            tooltip={t('deployment.RuntimeVariantTooltip')}
            rules={[
              { required: true },
              {
                warningOnly: true,
                validator: async (_rule, value: string) => {
                  const variantName = runtimeVariantNameMap[value];
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
            <BAIRuntimeVariantSelect
              onResolvedNamesChange={(map) =>
                setRuntimeVariantNameMap((prev) => ({ ...prev, ...map }))
              }
            />
          </Form.Item>

          <Form.Item dependencies={['runtimeVariantId']} noStyle>
            {({ getFieldValue }: FormInstance<FormValues>) => {
              const variantId = getFieldValue('runtimeVariantId');
              const variantName = runtimeVariantNameMap[variantId];
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

          <Form.Item dependencies={['runtimeVariantId']} noStyle>
            {({ getFieldValue }: FormInstance<FormValues>) => {
              const variantId = getFieldValue('runtimeVariantId');
              const variantName = runtimeVariantNameMap[variantId];
              if (variantName !== 'custom') {
                return null;
              }
              return (
                <>
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
                      style={{ marginBottom: token.marginMD }}
                    />
                  </Form.Item>
                  <Form.Item dependencies={['customDefinitionMode']} noStyle>
                    {({ getFieldValue: getField }: FormInstance<FormValues>) =>
                      getField('customDefinitionMode') === 'command' ? (
                        <>
                          <Form.Item
                            name="startCommand"
                            label={t('modelService.StartCommand')}
                            tooltip={t('modelService.StartCommandTooltip')}
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
                            tooltip={t('modelService.ModelMountTooltip')}
                          >
                            <Input placeholder="/models" allowClear />
                          </Form.Item>
                          <BAIFlex gap="sm">
                            <Form.Item
                              name="commandPort"
                              label={t('modelService.Port')}
                              tooltip={t('modelService.PortTooltip')}
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
                              tooltip={t('modelService.HealthCheckTooltip')}
                              style={{ flex: 1 }}
                            >
                              <Input placeholder="/health" allowClear />
                            </Form.Item>
                          </BAIFlex>
                          <BAIFlex gap="sm">
                            <Form.Item
                              name="commandInitialDelay"
                              label={t('modelService.InitialDelay')}
                              tooltip={t('modelService.InitialDelayTooltip')}
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
                              tooltip={t('modelService.MaxRetriesTooltip')}
                              style={{ flex: 1 }}
                            >
                              <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                          </BAIFlex>
                          <BAIFlex gap="sm">
                            <Form.Item
                              name="commandInterval"
                              label={t('modelService.Interval')}
                              tooltip={t('modelService.IntervalTooltip')}
                              style={{ flex: 1 }}
                            >
                              <InputNumber
                                min={1}
                                step={0.5}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                            <Form.Item
                              name="commandMaxWaitTime"
                              label={t('modelService.MaxWaitTime')}
                              tooltip={t('modelService.MaxWaitTimeTooltip')}
                              style={{ flex: 1 }}
                            >
                              <InputNumber
                                min={1}
                                step={0.5}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </BAIFlex>
                        </>
                      ) : (
                        <BAIFlex gap="sm">
                          <Form.Item
                            name="mountDestination"
                            label={t('deployment.ModelMountDestination')}
                            tooltip={t('modelService.ModelMountTooltip')}
                            rules={[{ required: true }]}
                            style={{ flex: 1 }}
                          >
                            <Input allowClear placeholder="/models" />
                          </Form.Item>
                          <Form.Item
                            name="definitionPath"
                            label={t('deployment.ModelDefinitionPath')}
                            tooltip={t(
                              'modelService.ModelDefinitionPathTooltip',
                            )}
                            style={{ flex: 1 }}
                          >
                            <Input
                              allowClear
                              placeholder="model-definition.yaml"
                            />
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

          <Suspense fallback={<Skeleton active paragraph={{ rows: 2 }} />}>
            <ImageEnvironmentSelectFormItems />
          </Suspense>
          <EnvVarFormList
            name="environ"
            formItemProps={{
              validateTrigger: ['onChange', 'onBlur'],
            }}
          />

          <SectionHeader>
            {t('deployment.step.ClusterAndResources')}
          </SectionHeader>
          <Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
            <ResourceAllocationFormItems
              enableResourcePresets
              hideResourceGroupFormItem
            />
          </Suspense>

          <Collapse
            items={[
              {
                key: 'advanced',
                label: t('session.launcher.AdvancedSettings'),
                children: (
                  <Suspense fallback={<Skeleton active />}>
                    <Form.Item
                      noStyle
                      dependencies={[
                        'modelFolderId',
                        'mount_id_map',
                        'mount_ids',
                      ]}
                    >
                      {({ getFieldValue }: FormInstance<FormValues>) => {
                        const modelFolderId = getFieldValue('modelFolderId');
                        const modelFolderIdNoDash = modelFolderId
                          ? String(modelFolderId).replace(/-/g, '')
                          : undefined;
                        return (
                          <VFolderTableFormItem
                            label={t('modelService.AdditionalMounts')}
                            tooltip={t('modelService.AdditionalMountsTooltip')}
                            rowKey="id"
                            tableProps={{
                              scroll: { x: 'max-content', y: 300 },
                            }}
                            rowFilter={(vfolder) =>
                              vfolder.usage_mode !== 'model' &&
                              vfolder.status === 'ready' &&
                              !vfolder.name?.startsWith('.') &&
                              vfolder.id !== modelFolderIdNoDash
                            }
                          />
                        );
                      }}
                    </Form.Item>
                  </Suspense>
                ),
              },
            ]}
          />
        </Form>
      )}
      {presetDetailId && (
        <Suspense fallback={null}>
          <PresetDetailLoader
            presetId={presetDetailId}
            onCancel={() => setPresetDetailId(null)}
          />
        </Suspense>
      )}
    </BAIModal>
  );
};

export default DeploymentAddRevisionModal;
