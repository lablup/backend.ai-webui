/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DeploymentAddRevisionModalAddMutation,
  DeploymentAddRevisionModalAddMutation$data,
} from '../__generated__/DeploymentAddRevisionModalAddMutation.graphql';
import { DeploymentAddRevisionModalImageNameQuery } from '../__generated__/DeploymentAddRevisionModalImageNameQuery.graphql';
import type { DeploymentAddRevisionModalManualImageQuery } from '../__generated__/DeploymentAddRevisionModalManualImageQuery.graphql';
import type { DeploymentAddRevisionModalPresetCountQuery } from '../__generated__/DeploymentAddRevisionModalPresetCountQuery.graphql';
import type { DeploymentAddRevisionModalPresetDetailQuery } from '../__generated__/DeploymentAddRevisionModalPresetDetailQuery.graphql';
import type {
  DeploymentAddRevisionModalSelectedPresetQuery,
  DeploymentAddRevisionModalSelectedPresetQuery$data,
} from '../__generated__/DeploymentAddRevisionModalSelectedPresetQuery.graphql';
import type { DeploymentAddRevisionModalVariantDefaultQuery } from '../__generated__/DeploymentAddRevisionModalVariantDefaultQuery.graphql';
import type { DeploymentAddRevisionModal_deployment$key } from '../__generated__/DeploymentAddRevisionModal_deployment.graphql';
import type {
  DeploymentAddRevisionModal_revisionSource$data,
  DeploymentAddRevisionModal_revisionSource$key,
} from '../__generated__/DeploymentAddRevisionModal_revisionSource.graphql';
import { convertToBinaryUnit } from '../helper';
import {
  COMMAND_SHELL_OPTIONS,
  DEFAULT_MODEL_SERVICE_SHELL,
  type CommandExecutionMode,
  deriveCommandModeState,
  resolveCommandShell,
} from '../helper/modelServiceCommand';
import { tokenizeShellCommand } from '../helper/parseCliCommand';
import {
  modelDefinitionFromGraphQL,
  type ParsedModelDefinition,
} from '../helper/parseModelDefinitionYaml';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useModelDefinitionPlaceholders } from '../hooks/useModelDefinitionDefaults';
import {
  buildRuntimeVariantPresetValues,
  type RuntimeParameterGroup,
  type RuntimeVariantPresetValueEntry,
} from '../hooks/useRuntimeParameterSchema';
import DeploymentPresetDetailModal from './DeploymentPresetDetailModal';
import EnvVarFormList, { type EnvVarFormListValue } from './EnvVarFormList';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
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
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  AutoComplete,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
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
  BAIQuestionIconWithTooltip,
  BAIRuntimeVariantSelect,
  BAISelect,
  BAIVFolderSelect,
  BAIVFolderSelectRef,
  convertToUUID,
  safeDecodeUuid,
  toGlobalId,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { FolderOpenIcon, PlusIcon } from 'lucide-react';
import React, {
  Suspense,
  startTransition,
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

export type FormValues = ImageEnvironmentFormInput &
  ResourceAllocationFormValue &
  VFolderTableFormValues & {
    runtimeVariantId: string;
    modelFolderId: string;
    // Mount config for the selected model folder (FR-3205): the container mount
    // destination and an optional subpath inside the model folder, rendered as
    // plain inputs beneath the model folder selector. Replaces the former
    // per-mode `mountDestination` / `commandModelMount` fields.
    modelMountDestination?: string;
    modelSubpath?: string;
    // Path (within the model folder) to a model-definition YAML the backend
    // reads service config from as an alternative to the explicit Start
    // Command below; optional, so it can be set alone or alongside a command.
    definitionPath?: string;
    startCommand?: string;
    // Start Command shell semantics (FR-3205). `commandAdvanced` toggles the
    // Basic/Advanced controls; in Advanced mode `commandExecution` chooses
    // Shell (run `shell -c command`) vs Exec (argv, no shell) and
    // `commandShell` is the shell binary for Shell execution.
    commandAdvanced?: boolean;
    commandExecution?: CommandExecutionMode;
    commandShell?: string;
    commandPort?: number;
    commandEnableHealthCheck?: boolean;
    commandHealthCheck?: string;
    commandInitialDelay?: number;
    commandMaxRetries?: number;
    commandInterval?: number;
    commandMaxWaitTime?: number;
    commandExpectedStatusCode?: number;
    environ: EnvVarFormListValue[];
    /** Runtime-variant preset values, registered by RuntimeParameterFormSection. */
    runtimeParams?: RuntimeParameterValues;
  };

export type PresetFormValues = {
  revisionPresetId: string;
  modelFolderId: string;
};

// Fragment ref of the revision returned by `addModelRevision`. Derived from
// the mutation response — which already spreads `DeploymentRevisionDetail_revision`
// — instead of importing the fragment's generated `$key` directly. The ref type
// travels with the mutation, so consumers don't need to reach into the
// fragment's generated file (which also keeps this working when the fragment
// component lives in `backend.ai-ui`, where the `$key` isn't re-exported).
export type DeploymentAddRevisionModalCreatedRevision = NonNullable<
  DeploymentAddRevisionModalAddMutation$data['addModelRevision']
>['revision'];

interface DeploymentAddRevisionModalProps extends BAIModalProps {
  // `createdRevision` is the fragment ref of the revision just added (taken
  // straight from the `addModelRevision` mutation response). The caller uses
  // it to open the revision detail drawer right after a successful create
  // (FR-3005). It is undefined on cancel/close and on the create failure path.
  onRequestClose: (
    success?: boolean,
    createdRevision?: DeploymentAddRevisionModalCreatedRevision | null,
  ) => void;
  deploymentFrgmt: DeploymentAddRevisionModal_deployment$key;
  // Optional source revision. When provided (e.g. "Add new revision from
  // this" / "Duplicate as new revision" in the revision detail drawer), the
  // Custom form is pre-filled from this revision on first Custom-mode entry
  // and the "Load current revision" alert is suppressed; the Preset/Custom
  // toggle remains user-controlled and the modal still opens in the user's
  // persisted mode. When omitted, the modal behaves as a plain "Add revision"
  // entry — Custom mode shows the alert with a button that loads on demand.
  sourceRevisionFrgmt?: DeploymentAddRevisionModal_revisionSource$key | null;
  open?: boolean;
}

type RevisionPrefillData = DeploymentAddRevisionModal_revisionSource$data;

// Suspense-wrapped side query that resolves the selected runtime variant's DB
// `defaultModelDefinition` baseline (FR-3205/FR-3342) and pushes the parsed
// result up via `onLoaded`. Runs only when the variant reads the vfolder
// config files (Custom mode); rendered inside a `<Suspense fallback={null}>`
// so the modal chrome / form never blank while it resolves.
const VariantDefaultModelDefinitionLoader: React.FC<{
  variantId: string;
  onLoaded: (
    defaults: Partial<ParsedModelDefinition> | null,
    variantId: string,
  ) => void;
}> = ({ variantId, onLoaded }) => {
  'use memo';
  const uuid = convertToUUID(variantId);
  const data = useLazyLoadQuery<DeploymentAddRevisionModalVariantDefaultQuery>(
    graphql`
      query DeploymentAddRevisionModalVariantDefaultQuery(
        $id: UUID!
        $skip: Boolean!
      ) {
        runtimeVariant(id: $id) @skip(if: $skip) {
          id
          defaultModelDefinition @since(version: "26.8.0") {
            models {
              name
              modelPath
              service {
                command
                shell
                port
                healthCheck {
                  path
                  interval
                  maxRetries
                  maxWaitTime
                  expectedStatusCode
                  initialDelay
                }
              }
            }
          }
        }
      }
    `,
    { id: uuid, skip: !uuid },
    { fetchPolicy: 'store-or-network' },
  );

  // Push the parsed baseline (or null) up as soon as it resolves; re-fires when
  // the resolved struct changes (i.e., a different variant).
  const notifyLoaded = useEffectEvent(() => {
    onLoaded(
      modelDefinitionFromGraphQL(data.runtimeVariant?.defaultModelDefinition),
      variantId,
    );
  });
  useEffect(() => {
    notifyLoaded();
  }, [data.runtimeVariant?.defaultModelDefinition]);

  return null;
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
  deploymentFrgmt,
  sourceRevisionFrgmt,
  open,
  ...restModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const relayEnvironment = useRelayEnvironment();

  // Deployment-scoped data (resourceGroupName for resource defaults,
  // currentRevision for the optional "Load current" affordance). Fragment-
  // based instead of an in-modal lazy query so callers can drive what they
  // pass in and the modal does not pay a separate network round-trip.
  const deployment = useFragment(
    graphql`
      fragment DeploymentAddRevisionModal_deployment on ModelDeployment {
        id
        metadata {
          resourceGroupName
        }
        currentRevision @since(version: "26.4.3") {
          modelMountConfig {
            vfolderId
          }
          ...DeploymentAddRevisionModal_revisionSource
        }
      }
    `,
    deploymentFrgmt,
  );

  // Shared shape for the form-prefill source — used both for "Load current
  // revision" (current revision off the deployment fragment) and for the
  // "Add new revision from this" entry where an arbitrary source revision
  // is passed in via `sourceRevisionFrgmt`.
  const revisionPrefillFragment = graphql`
    fragment DeploymentAddRevisionModal_revisionSource on ModelRevision {
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
          readsVfolderConfigFiles @since(version: "26.8.0")
        }
        environ {
          entries {
            name
            value
          }
        }
        runtimeVariantPresetValues @since(version: "26.4.4rc9") {
          presetId
          value
        }
      }
      modelMountConfig {
        vfolderId
        mountDestination
        definitionPath
        subpath @since(version: "26.4.4")
      }
      modelDefinition {
        models {
          name
          modelPath
          service {
            command @since(version: "26.7.0")
            shell @since(version: "26.7.0")
            startCommand
            port
            healthCheck {
              enable @since(version: "26.4.4")
              path
              maxRetries
              initialDelay
              interval
              maxWaitTime
              expectedStatusCode
            }
          }
        }
      }
      imageV2 {
        id
        identity {
          canonicalName
          architecture
        }
      }
    }
  `;

  const currentRevision =
    useFragment<DeploymentAddRevisionModal_revisionSource$key>(
      revisionPrefillFragment,
      deployment?.currentRevision ?? null,
    );
  const sourceRevision =
    useFragment<DeploymentAddRevisionModal_revisionSource$key>(
      revisionPrefillFragment,
      sourceRevisionFrgmt ?? null,
    );
  // The model folder picker scopes to the user's current project so the
  // listing matches what the user has access to in the active project
  // context, consistent with the rest of the model-deployment UI
  // (ServiceLauncherPageContent, ModelCardDeployModal).
  const { id: currentProjectId } = useCurrentProjectValue();
  const { logger } = useBAILogger();
  const { open: openFolderExplorer } = useFolderExplorerOpener();
  const baiClient = useSuspendedBackendaiClient();
  // 26.4.4+ managers accept the `enable` flag on ModelHealthCheckInput;
  // older managers reject it, so we keep the legacy null-when-disabled shape.
  const supportsHealthCheckEnable = baiClient.supports(
    'model-health-check-enable',
  );
  // Managers from 26.4.4 (pinned to the rc9 staging tag) accept
  // `runtimeVariantPresetValues` on ModelRuntimeConfigInput (FR-3139); older
  // managers lack the field, so the key must be omitted from the mutation input
  // entirely. The matching @since directive on the query field uses the same
  // version string.
  const supportsRuntimeVariantPresetValues = baiClient.supports(
    'model-runtime-variant-preset-values',
  );
  // 26.7.0+ managers accept the single-string `command` + `shell` fields on
  // ModelServiceConfigInput (FR-3205); older managers only understand the
  // deprecated `startCommand` token list, so we fall back to sending that.
  const supportsCommandShell = baiClient.supports(
    'model-service-command-string',
  );
  // `ModelMountConfigInput.subpath` (mount a subfolder inside the model vfolder)
  // was added in 26.4.4 (FR-3205); older managers reject the unknown input
  // field, so the key is omitted from the mutation entirely on them.
  const supportsMountSubpath = baiClient.supports('model-mount-subpath');
  // 26.8.0+ managers report `readsVfolderConfigFiles` / `defaultModelDefinition`
  // on RuntimeVariant (FR-3342); older managers omit them, so the flag is only
  // authoritative when supported (otherwise the legacy `name === 'custom'`
  // heuristic decides).
  const supportsRuntimeVariantConfigReads = baiClient.supports(
    'model-runtime-variant-reads-vfolder-config-files',
  );

  // Refs to refetch each form's model folder select after creating a new
  // model-usage folder, or via the manual refresh button. Two refs because
  // the Preset and Custom forms each mount their own BAIVFolderSelect.
  const presetVFolderSelectRef = useRef<BAIVFolderSelectRef>(null);
  const customVFolderSelectRef = useRef<BAIVFolderSelectRef>(null);
  const [isModelFolderCreateModalOpen, setIsModelFolderCreateModalOpen] =
    useState(false);

  const [customForm] = Form.useForm<FormValues>();
  const [presetForm] = Form.useForm<PresetFormValues>();
  // FR-2862 feedback: hoist `autoActivate` from the Custom body into the
  // modal so it can be rendered in the modal footer. Both modes forward
  // the value via `AddRevisionOptions.autoActivate` on `addModelRevision`.
  const [autoActivate, setAutoActivate] = useState(true);

  // Resolving a manually entered image name to its registered image id
  // (Custom mode) is an async pre-step before the mutation; surface it in the
  // submit button loading state alongside `isAddInFlight`.
  const [isResolvingImage, setIsResolvingImage] = useState(false);

  const [mode, setMode] = useBAISettingUserState(
    'deploymentRevisionCreationMode',
  );
  const effectiveMode = mode ?? 'preset';

  // After the user clicks "Load current revision" the alert vanishes — there
  // is nothing else to load and the form already reflects the prefill.
  const [hasLoadedCurrent, setHasLoadedCurrent] = useState(false);
  // Apply the source-revision prefill exactly once on first Custom-mode
  // render so toggling Preset → Custom later does not re-stomp values the
  // user has since edited. When the modal opens in Preset mode (per the
  // user's saved preference), the prefill is deferred until they toggle
  // to Custom — the mode choice is always the user's, never forced by the
  // entry point.
  const [hasAppliedSourcePrefill, setHasAppliedSourcePrefill] = useState(false);
  // True between "user clicked Load current revision while in Preset mode"
  // and "the Custom form has mounted and we applied the prefill". setMode
  // is async, so we can't `setFieldsValue` on the Custom form synchronously
  // — it isn't mounted yet and antd Form drops calls made before
  // registration. The mode-transition effect picks this flag up and applies
  // once Custom is active.
  const [pendingLoadCurrent, setPendingLoadCurrent] = useState(false);

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

  // Map of runtime variant id → { name, readsVfolderConfigFiles }, populated by
  // `BAIRuntimeVariantSelect` as it resolves the currently selected value (via
  // its `runtimeVariant(id:)` point lookup) and the visible page of the
  // paginated list. Used by the form to branch on whether the variant reads the
  // vfolder config files (see the `readsVfolderConfigFiles` derivation sites)
  // and to look up the human-readable name at submit time, without owning the
  // variant list here.
  const [runtimeVariantMap, setRuntimeVariantMap] = useState<
    Record<string, { name: string; readsVfolderConfigFiles: boolean }>
  >({});

  // Runtime parameter values live in `customForm` under the `runtimeParams`
  // namespace (registered by RuntimeParameterFormSection), so required presets
  // participate in normal form validation. Touched keys and groups are kept in
  // refs since changing them must not re-render the modal — both are only read
  // at submit time to collect runtime-variant preset values.
  const runtimeParamTouchedKeysRef = useRef<Set<string>>(new Set());
  const runtimeParamGroupsRef = useRef<RuntimeParameterGroup[] | null>(null);

  // Initial preset values fed into `RuntimeParameterFormSection` for non-custom
  // variants in edit mode, keyed by preset id. State (not ref) so the child
  // re-renders with the right initial data after the revision body resolves.
  const [initialRuntimePresetValues, setInitialRuntimePresetValues] = useState<
    ReadonlyArray<RuntimeVariantPresetValueEntry> | undefined
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
  // point where the folder is locked in by context). Read off the deployment
  // fragment's current revision (rather than the prefill source) so the
  // Preset form's initial folder reflects the deployment, not whichever
  // source revision was passed in.
  const defaultModelFolderId = deployment?.currentRevision?.modelMountConfig
    ?.vfolderId
    ? toGlobalId(
        'VirtualFolderNode',
        deployment.currentRevision.modelMountConfig.vfolderId,
      )
    : undefined;

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

  // The `revision.deployment` selection (added in BA-6056) lets the mutation
  // update the parent deployment record in the Relay store atomically — so
  // row tags in the revision history table and the Configuration Section's
  // "current / deploying" panels stay consistent without a manual refresh.
  // `currentRevisionId` / `deployingRevisionId` aren't in any deployment
  // fragment yet (DeploymentRevisionHistoryTab reads them inline), so they
  // are selected explicitly here.
  const [commitAdd, isAddInFlight] =
    useMutation<DeploymentAddRevisionModalAddMutation>(graphql`
      mutation DeploymentAddRevisionModalAddMutation(
        $input: AddRevisionInput!
      ) {
        addModelRevision(input: $input) {
          revision {
            id
            ...DeploymentRevisionDetail_revision
            deployment @since(version: "26.4.4") {
              id
              currentRevisionId
              deployingRevisionId
              currentRevision @since(version: "26.4.3") {
                id
                ...DeploymentRevisionDetail_revision
              }
              deployingRevision @since(version: "26.4.3") {
                id
                ...DeploymentRevisionDetail_revision
              }
            }
          }
        }
      }
    `);

  // Build a Custom-form prefill object from a preset node read off the
  // singular `deploymentRevisionPreset(id:)` query (resolved via
  // `fetchPresetData`). The image full name is fetched async because
  // `ImageEnvironmentSelectFormItems` matches the form's `environments.version`
  // against image full names (`registry/namespace:tag@architecture`).
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

    // Full image name (`registry/namespace:tag@architecture`); the
    // architecture suffix is required so `ImageEnvironmentSelectFormItems`
    // exact-matches the original image instead of defaulting to the first
    // architecture in the sorted list.
    let imageFullName: string | undefined;
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
                    architecture
                  }
                }
              }
            `,
            { id: preset.execution.imageId },
            { fetchPolicy: 'store-or-network' },
          ).toPromise();
        const identity = result?.imageV2?.identity;
        imageFullName = identity?.canonicalName
          ? identity.architecture
            ? `${identity.canonicalName}@${identity.architecture}`
            : identity.canonicalName
          : undefined;
      } catch {
        imageFullName = undefined;
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
      ...(imageFullName ? { environments: { version: imageFullName } } : {}),
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

  // Build the form values that mirror a revision (either the deployment's
  // current revision via the "Load current revision" button, or the source
  // revision passed in via `sourceRevisionFrgmt`) and push them into the
  // Custom antd Form. The React Compiler handles memoization under the
  // `'use memo'` directive so a plain function suffices.
  const applyRevisionToCustomForm = (rev: RevisionPrefillData) => {
    const slots = rev.resourceSlots ?? [];
    const cpuSlot = slots.find((s) => s.slotName === 'cpu');
    const memSlot = slots.find((s) => s.slotName === 'mem');
    const acceleratorSlot = slots.find(
      (s) => s.slotName !== 'cpu' && s.slotName !== 'mem',
    );

    const shmemEntry = (rev.resourceConfig?.resourceOpts?.entries ?? []).find(
      (e) => e.name === 'shmem',
    );

    // The query selects `modelRuntimeConfig.runtimeVariant.name` and
    // `readsVfolderConfigFiles`, so the prefill path knows the variant metadata
    // without waiting for `BAIRuntimeVariantSelect` to resolve it.
    const variantName = rev.modelRuntimeConfig?.runtimeVariant?.name ?? '';
    // `readsVfolderConfigFiles` (26.8.0+) is stripped on older managers →
    // undefined. Fall back to the legacy `name === 'custom'` heuristic — NEVER
    // `?? false` — so pre-26.8.0 managers keep identical custom-variant
    // behavior.
    const readsVfolderConfigFiles =
      rev.modelRuntimeConfig?.runtimeVariant?.readsVfolderConfigFiles ??
      variantName === 'custom';
    // Seed `runtimeVariantMap` so submit and any other consumers can resolve
    // `runtimeVariantId → { name, readsVfolderConfigFiles }` immediately,
    // without waiting for `BAIRuntimeVariantSelect`'s point lookup to finish.
    const variantId = rev.modelRuntimeConfig?.runtimeVariantId;
    if (variantId && variantName) {
      setRuntimeVariantMap((prev) => ({
        ...prev,
        [variantId]: { name: variantName, readsVfolderConfigFiles },
      }));
    }
    const service = rev.modelDefinition?.models?.[0]?.service;
    // On 26.4.4+ a disabled source revision carries `enable: false`; treat
    // that as "no health check" for prefill so form fields stay empty. On older
    // managers `enable` is stripped (undefined), fall back to object presence.
    const healthCheck =
      service?.healthCheck && service.healthCheck.enable !== false
        ? service.healthCheck
        : undefined;
    // Command-mode prefill: ONLY for a source variant that reads the vfolder
    // config files — the Service Configuration (command) fields apply only to
    // those variants. Gate on the variant's capability
    // (`readsVfolderConfigFiles`, with the legacy `name === 'custom'` fallback)
    // so a non-reading variant's stored default command never prefills these
    // fields and then leaks across a later variant switch. Within that, key off
    // whether the revision actually carries a command (the single-string
    // `command` (26.7.0+) or the deprecated `startCommand` token list).
    const hasCustomCommand =
      readsVfolderConfigFiles &&
      !!service &&
      (!!service.command || (service.startCommand?.length ?? 0) > 0);
    // Reconstruct the command string and Basic/Advanced + Execution + Shell UI
    // state from whichever field the revision carries (FR-3205).
    const commandModeState = deriveCommandModeState({
      command: service?.command,
      shell: service?.shell,
      startCommand: service?.startCommand,
    });

    prefilledMountAliasesRef.current = _.fromPairs(
      (rev.extraMounts ?? [])
        .filter((m) => !!m.mountDestination)
        .map((m) => [
          m.vfolderId.replace(/-/g, ''),
          m.mountDestination as string,
        ]),
    );

    // Hydrate the runtime-parameter section from the revision's preset values
    // (non-custom variants). Preset values are their own field now — no longer
    // encoded into `environ` / EXTRA_ARGS — so we feed them through directly,
    // keyed by preset id.
    if (!readsVfolderConfigFiles && variantName) {
      const presetValues = rev.modelRuntimeConfig?.runtimeVariantPresetValues;
      setInitialRuntimePresetValues(
        presetValues && presetValues.length > 0
          ? presetValues.map((p) => ({ presetId: p.presetId, value: p.value }))
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
      modelFolderId: rev.modelMountConfig?.vfolderId
        ? toGlobalId('VirtualFolderNode', rev.modelMountConfig.vfolderId)
        : undefined,
      // Model-folder mount config (destination + subpath) for the plain inputs
      // beneath the folder selector (FR-3205).
      modelMountDestination:
        rev.modelMountConfig?.mountDestination ?? undefined,
      modelSubpath: rev.modelMountConfig?.subpath ?? undefined,
      definitionPath: rev.modelMountConfig?.definitionPath || undefined,
      // `ImageEnvironmentSelectFormItems` matches the form's
      // `environments.version` against its image catalog by full name
      // (`registry/namespace:tag@architecture`); the architecture suffix is
      // required so the exact-match step picks the originally-used image
      // instead of falling back to the first architecture in the sorted list
      // (e.g. aarch64 for an x86_64 deployment). Setting this drives the rest
      // of the environment selector and ultimately populates
      // `environments.image.id`.
      environments: rev.imageV2?.identity?.canonicalName
        ? {
            version: rev.imageV2.identity.architecture
              ? `${rev.imageV2.identity.canonicalName}@${rev.imageV2.identity.architecture}`
              : rev.imageV2.identity.canonicalName,
          }
        : undefined,
      // EnvVarFormList stores entries as { variable, value } — translate
      // from the GraphQL `{ name, value }` shape on prefill.
      environ: (rev.modelRuntimeConfig?.environ?.entries ?? []).map((e) => ({
        variable: e.name,
        value: e.value,
      })),
      // Health check prefill applies to every runtime variant and mode
      // (FR-3068): the checkbox + fields reflect the source revision's
      // health-check override regardless of how the definition is provided.
      commandEnableHealthCheck: !!healthCheck,
      commandHealthCheck: healthCheck?.path ?? undefined,
      commandInitialDelay: healthCheck?.initialDelay ?? undefined,
      commandMaxRetries: healthCheck?.maxRetries ?? undefined,
      commandInterval: healthCheck?.interval ?? undefined,
      commandMaxWaitTime: healthCheck?.maxWaitTime ?? undefined,
      commandExpectedStatusCode: healthCheck?.expectedStatusCode ?? undefined,
      ...(hasCustomCommand && service
        ? {
            startCommand: commandModeState.command,
            commandAdvanced: commandModeState.advanced,
            commandExecution: commandModeState.execution,
            commandShell: commandModeState.shell,
            commandPort: service.port,
          }
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

  // Apply the source-revision prefill exactly once on first Custom-mode
  // mount when the modal was opened with a `sourceRevisionFrgmt`. Tracked
  // via `hasAppliedSourcePrefill` so a subsequent Preset→Custom toggle
  // does not stomp the user's edits, and the work runs through
  // `useEffectEvent` so we read the latest closures without subscribing
  // the effect to them.
  const applySourcePrefillOnce = useEffectEvent(() => {
    if (hasAppliedSourcePrefill) return;
    if (!sourceRevision) return;
    applyRevisionToCustomForm(sourceRevision);
    setHasAppliedSourcePrefill(true);
  });

  // Pair with `handleLoadCurrent` below — when the user clicks "Load
  // current revision" while in Preset mode, we flip to Custom and queue the
  // apply via `pendingLoadCurrent`. This effect drains the queue once the
  // Custom form has actually mounted.
  const applyPendingLoadCurrent = useEffectEvent(() => {
    if (!pendingLoadCurrent) return;
    if (!currentRevision) return;
    applyRevisionToCustomForm(currentRevision);
    setPendingLoadCurrent(false);
    setHasLoadedCurrent(true);
    message.success(t('deployment.CurrentRevisionConfigurationLoaded'));
  });

  useEffect(() => {
    if (effectiveMode === 'custom') {
      // These prefill helpers call setFieldsValue on the freshly-mounted form
      // (which only sticks post-mount) alongside tracking-state updates, so they
      // must run in this mode-transition effect rather than during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- setState is coupled to post-mount form prefill and must run in this effect
      consumePresetTransferPrefill();
      applySourcePrefillOnce();
      applyPendingLoadCurrent();
    } else {
      consumeCustomTransferPrefill();
    }
  }, [effectiveMode]);

  // "Load current revision" entry point — visible mode-independently as the
  // alert above the modal forms. In Custom mode we apply immediately; in
  // Preset mode we flip to Custom first and let the mode-transition effect
  // drain the apply queue once the Custom form has mounted.
  const handleLoadCurrent = () => {
    if (!currentRevision) return;
    if (effectiveMode === 'custom') {
      applyRevisionToCustomForm(currentRevision);
      setHasLoadedCurrent(true);
      message.success(t('deployment.CurrentRevisionConfigurationLoaded'));
      return;
    }
    setPendingLoadCurrent(true);
    setMode('custom');
  };

  // Collect runtime-variant preset values as a standalone list keyed by preset
  // id (`{ presetId, value }`), kept separate from `environ`. Sent to the
  // backend as `modelRuntimeConfig.runtimeVariantPresetValues`. Reads from the
  // form's `runtimeParams` namespace (native-typed values), stringifying each
  // touched non-empty value before delegating to the schema helper.
  const collectRuntimeVariantPresetValues = (
    runtimeParams: RuntimeParameterValues | undefined,
  ): RuntimeVariantPresetValueEntry[] => {
    const groups = runtimeParamGroupsRef.current;
    if (!groups || !runtimeParams) return [];

    // Form values are native-typed (number/boolean/string); the backend's
    // preset value list works on the API's string encoding.
    const stringValues: Record<string, string> = {};
    for (const [key, val] of Object.entries(runtimeParams)) {
      if (val === undefined || val === null || val === '') continue;
      stringValues[key] = String(val);
    }

    return buildRuntimeVariantPresetValues(
      groups,
      stringValues,
      runtimeParamTouchedKeysRef.current,
    );
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

  const handleCustomFinish = async (values: FormValues): Promise<void> => {
    // Surface the image error on the field the user actually used — the
    // "Image Name (Manual)" input when they typed a name, otherwise the
    // Environments/Version dropdown. Both are owned by the shared
    // `ImageEnvironmentSelectFormItems`, so the modal raises the error with
    // `setFields` (it can't attach a `rules` validator to them) and scrolls that
    // specific field into view with antd's `scrollToField` (the setFields error
    // is raised post-submit, so `scrollToFirstError` never fires for it).
    const flagImageError = (
      name: ['environments', 'manual'] | ['environments', 'version'],
      messageKey: string,
    ) => {
      customForm.setFields([{ name, errors: [t(messageKey)] }]);
      customForm.scrollToField(name, { behavior: 'smooth', block: 'center' });
    };

    // The revision mutation only references an image by id (`ImageInput.id`).
    // The image field has two input modes (see `ImageEnvironmentSelectFormItems`):
    //   - picking from the Environments/Version dropdown populates
    //     `environments.image` (an object carrying `id`);
    //   - typing a name into the "Manual image name" field populates
    //     `environments.manual` (a string) and clears `environments.image`.
    // The mutation needs an id, so resolve the manually entered reference to a
    // registered image id here before committing (FR-3278).
    //
    // This client-side resolve is a workaround for the id-only mutation input;
    // the deeper fix is BA-6774 (accept an image by reference server-side),
    // after which this step can be dropped behind a manager-version gate.
    let imageId = values.environments?.image?.id;
    const manualImageName = values.environments?.manual?.trim();
    // Image errors are shown on the manual-name input if the user typed one,
    // otherwise on the Environments/Version dropdown.
    const imageFieldName:
      ['environments', 'manual'] | ['environments', 'version'] = manualImageName
      ? ['environments', 'manual']
      : ['environments', 'version'];
    if (!imageId && manualImageName) {
      // Manual names may carry an `@architecture` suffix; pass it through so the
      // lookup matches the exact image instead of the manager's default
      // architecture.
      const [reference, architecture] = manualImageName.split('@');
      setIsResolvingImage(true);
      try {
        const result =
          await fetchQuery<DeploymentAddRevisionModalManualImageQuery>(
            relayEnvironment,
            graphql`
              query DeploymentAddRevisionModalManualImageQuery(
                $reference: String!
                $architecture: String
              ) {
                image(reference: $reference, architecture: $architecture) {
                  id
                }
              }
            `,
            { reference, architecture: architecture || null },
            { fetchPolicy: 'network-only' },
          ).toPromise();
        imageId = result?.image?.id ?? undefined;
      } catch (error) {
        // A thrown error here is a transport/GraphQL failure — an unmatched
        // reference resolves to `null`, not an error. Surface and log it as a
        // generic failure so a transient error isn't mislabeled as
        // "image not found".
        logger.error(
          '[DeploymentAddRevisionModal] failed to resolve manual image reference',
          error,
        );
        message.error(t('general.ErrorOccurred'));
        return;
      } finally {
        setIsResolvingImage(false);
      }
      if (!imageId) {
        flagImageError(imageFieldName, 'modelService.ManualImageNotFound');
        return;
      }
    }

    if (!imageId) {
      flagImageError(imageFieldName, 'modelService.ImageRequired');
      return;
    }
    // `ImageInput.id` is declared as `ID!` but parsed as `UUID!` server-side.
    const decodedImageId = safeDecodeUuid(imageId);
    if (!decodedImageId) {
      flagImageError(imageFieldName, 'modelService.ImageRequired');
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

    const variant = runtimeVariantMap[values.runtimeVariantId];
    const variantName = variant?.name ?? '';
    // `readsVfolderConfigFiles` (26.8.0+) drives whether this variant reads the
    // vfolder config files (command / modelDefinition override). On pre-26.8.0
    // managers the field is stripped → undefined, so fall back to the legacy
    // `name === 'custom'` heuristic — NEVER `?? false` — to preserve behavior.
    const readsVfolderConfigFiles =
      variant?.readsVfolderConfigFiles ?? variantName === 'custom';

    // Resolve the model folder's mount destination + subpath from the plain
    // inputs beneath the folder selector (FR-3205). An empty destination falls
    // back to the conventional `/models` model mount root; the subpath is only
    // sent on managers that support it.
    const selectedModelFolderUuid = toLocalId(values.modelFolderId);
    const modelMountDestination =
      values.modelMountDestination?.trim() || '/models';
    const modelMountSubpath = supportsMountSubpath
      ? values.modelSubpath?.trim() || null
      : undefined;

    // `environ` now carries ONLY the user's manual Environment Variables —
    // runtime-variant preset values are no longer merged in here.
    const environRecord: Record<string, string> = {};
    for (const { variable, value } of values.environ ?? []) {
      if (variable) environRecord[variable] = value;
    }
    const environEntries = Object.entries(environRecord).map(
      ([name, value]) => ({ name, value }),
    );

    // Health check is opt-in via the explicit checkbox (FR-3068), shown for
    // every runtime variant and definition mode. When on, all health-check
    // fields are required in the UI (mirrors the preset form). For non-command
    // modes (non-custom runtimes and custom+file) we send a minimal
    // modelDefinition override containing only the health check when enabled.
    const healthCheckEnabled = !!values.commandEnableHealthCheck;
    const healthCheck = (() => {
      const configuredFields = {
        path: values.commandHealthCheck,
        interval: values.commandInterval,
        maxRetries: values.commandMaxRetries,
        maxWaitTime: values.commandMaxWaitTime,
        initialDelay: values.commandInitialDelay,
        expectedStatusCode: values.commandExpectedStatusCode,
      };
      if (!supportsHealthCheckEnable) {
        // Managers < 26.4.4: null disables the health check.
        return healthCheckEnabled ? configuredFields : null;
      }
      // 26.4.4+: always send the object so the server can seed defaults.
      return healthCheckEnabled
        ? { enable: true, ...configuredFields }
        : { enable: false };
    })();

    // Runtime-variant preset values are their own list (kept out of `environ`),
    // sent via `modelRuntimeConfig.runtimeVariantPresetValues`. Only collected
    // for variants that do NOT read the vfolder config files, on managers that
    // support the field.
    const runtimeVariantPresetValues =
      readsVfolderConfigFiles || !supportsRuntimeVariantPresetValues
        ? []
        : collectRuntimeVariantPresetValues(values.runtimeParams);

    // Start Command (FR-3205): on 26.7.0+ send the user's raw command string in
    // `command` plus a `shell` derived from the Basic/Advanced + Execution mode
    // (Basic → omitted so the backend applies its default shell, Advanced+Shell
    // → selected shell, Advanced+Exec → null). On older managers fall back to
    // the deprecated tokenized `startCommand`. Never send both — the backend
    // prefers `command`. `shell: undefined` is dropped from the request by
    // Relay, so the field is truly omitted.
    const rawCommand = values.startCommand ?? '';
    const commandServiceFields = supportsCommandShell
      ? {
          command: rawCommand,
          shell: resolveCommandShell({
            advanced: !!values.commandAdvanced,
            execution: values.commandExecution,
            shell: values.commandShell,
          }),
        }
      : { startCommand: tokenizeShellCommand(rawCommand) };

    const modelDefinition =
      readsVfolderConfigFiles && values.startCommand
        ? {
            models: [
              {
                name: 'model',
                modelPath: modelMountDestination,
                service: {
                  preStartActions: [],
                  ...commandServiceFields,
                  port: values.commandPort ?? 8000,
                  healthCheck,
                },
              },
            ],
          }
        : healthCheckEnabled
          ? { models: [{ service: { healthCheck } }] }
          : null;

    commitAdd({
      variables: {
        input: {
          deploymentId: toLocalId(deployment?.id ?? '') ?? deployment?.id ?? '',
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
            // Preset values are sent as their own field, keyed by preset id —
            // NOT folded into `environ`. The key is omitted entirely on
            // managers that predate the field (< 26.4.4), which would reject an
            // unknown input field.
            ...(supportsRuntimeVariantPresetValues && {
              runtimeVariantPresetValues:
                runtimeVariantPresetValues.length > 0
                  ? runtimeVariantPresetValues
                  : null,
            }),
          },
          modelMountConfig: {
            vfolderId: selectedModelFolderUuid,
            mountDestination: modelMountDestination,
            definitionPath: values.definitionPath?.trim() || null,
            // `subpath` (mount a subfolder inside the model vfolder) was added
            // in 26.4.4; omit the key entirely on older managers, which reject
            // unknown input fields.
            ...(supportsMountSubpath && { subpath: modelMountSubpath }),
          },
          modelDefinition,
          extraMounts: extraMounts.length > 0 ? extraMounts : null,
          options: { autoActivate },
        },
      },
      onCompleted: (response, errors) => {
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
        onRequestClose(true, response.addModelRevision?.revision);
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
          deploymentId: toLocalId(deployment?.id ?? '') ?? deployment?.id ?? '',
          revisionPresetId: values.revisionPresetId,
          modelMountConfig: {
            vfolderId: toLocalId(values.modelFolderId),
            mountDestination: '/models',
          },
          options: { autoActivate },
        },
      },
      onCompleted: (response, errors) => {
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
        onRequestClose(true, response.addModelRevision?.revision);
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

  // Watch the custom form's model folder + runtime variant so the placeholder
  // hook re-reads the definition file when the user changes either. `useWatch`
  // returns undefined until the field registers (Preset mode / before mount),
  // which naturally disables the read.
  const watchedModelFolderId = Form.useWatch('modelFolderId', customForm);
  const watchedRuntimeVariantId = Form.useWatch('runtimeVariantId', customForm);
  const watchedVariant = runtimeVariantMap[watchedRuntimeVariantId ?? ''];
  // Whether the watched variant reads the vfolder config files (command /
  // service-config fields, placeholders). `readsVfolderConfigFiles` (26.8.0+)
  // is stripped on older managers → undefined; fall back to the legacy
  // `name === 'custom'` heuristic — NEVER `?? false` — so pre-26.8.0 managers
  // keep identical custom-variant behavior.
  const readsVfolderConfigFiles =
    watchedVariant?.readsVfolderConfigFiles ??
    watchedVariant?.name === 'custom';

  // 26.8.0+ treats `readsVfolderConfigFiles` as authoritative in either Preset
  // or Custom mode. Pre-26.8.0 (field stripped → `name === 'custom'` fallback)
  // keeps the legacy Custom-mode-only gate.
  const readsVfolderConfigFilesInMode =
    readsVfolderConfigFiles &&
    (supportsRuntimeVariantConfigReads || effectiveMode === 'custom');

  // The "Model Definition File Path" (the vfolder path to model-definition.yaml)
  // only applies to variants that read the vfolder config files. Decide via the
  // client feature flag rather than a raw manager-version check: on 26.8.0+
  // (`supportsRuntimeVariantConfigReads`) use the authoritative
  // `readsVfolderConfigFiles` (hidden when false); on older managers (flag
  // absent) show it whenever the runtime variant is Custom.
  const showModelDefinitionPath = supportsRuntimeVariantConfigReads
    ? !!watchedVariant?.readsVfolderConfigFiles
    : watchedVariant?.name === 'custom';

  // Read the selected model folder's `model-definition.yaml` and use its parsed
  // values as placeholders (display-only hints) on the command fields. Enabled
  // only for a config-reading variant with a folder selected; failures fall
  // back to the DB baseline / static placeholders below.
  const { defaults: vfolderModelDefinitionDefaults } =
    useModelDefinitionPlaceholders(
      watchedModelFolderId,
      readsVfolderConfigFilesInMode,
    );

  // Low-priority placeholder layer: the runtime variant's DB
  // `defaultModelDefinition` baseline (always present). Loaded by
  // `VariantDefaultModelDefinitionLoader` (a Suspense-wrapped side query fired
  // only when the variant reads the vfolder config files) and pushed here via
  // `onLoaded`. Tagged with the loaded `variantId` so that while switching
  // between two config-reading variants — the new loader suspends but
  // `shouldLoadVariantDefault` stays true, so the clearing effect below never
  // fires — the merge can ignore the previous variant's stale baseline instead
  // of briefly showing its values as placeholders.
  const [dbModelDefinitionDefaults, setDbModelDefinitionDefaults] = useState<{
    variantId: string;
    defaults: Partial<ParsedModelDefinition> | null;
  } | null>(null);
  const shouldLoadVariantDefault =
    readsVfolderConfigFilesInMode && !!watchedRuntimeVariantId;
  // Use the loaded DB baseline only while it is still relevant: the variant must
  // still be config-reading in the current mode (`shouldLoadVariantDefault`) AND
  // the baseline must belong to the currently watched variant. Deriving
  // relevance here — rather than clearing the state in an effect — keeps a stale
  // baseline from a previous variant / mode from leaking into placeholders
  // without a setState-in-effect (the loader re-populates the state when active).
  const activeDbModelDefinitionDefaults =
    shouldLoadVariantDefault &&
    dbModelDefinitionDefaults &&
    dbModelDefinitionDefaults.variantId === watchedRuntimeVariantId
      ? dbModelDefinitionDefaults.defaults
      : null;

  // Placeholder precedence: DB `defaultModelDefinition` (low) < vfolder
  // `model-definition.yaml` (high). Merged field-by-field so the vfolder yaml
  // overrides only the fields it actually defines — the vfolder layer is a
  // *partial* parse (`parseModelDefinitionYamlPartial`), so a YAML that sets
  // only `start_command` keeps the DB baseline's port / health-check values
  // instead of stomping them with static defaults. The lower Advanced "Model
  // Definition File Path" field is intentionally NOT part of this read (its
  // value must not feed back into placeholders of fields above it). Keyed on
  // variantId + folderId, so placeholders update when either changes.
  const modelDefinitionDefaults: Partial<ParsedModelDefinition> | null =
    activeDbModelDefinitionDefaults || vfolderModelDefinitionDefaults
      ? {
          ...activeDbModelDefinitionDefaults,
          // `vfolderModelDefinitionDefaults` is a partial parse that omits
          // absent fields (never `undefined` values), so a plain spread already
          // overrides the DB baseline field-by-field without clobbering.
          ...vfolderModelDefinitionDefaults,
        }
      : null;

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
      title={
        <BAIFlex
          direction="row"
          align="center"
          justify="between"
          gap="md"
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
            style={{ fontWeight: 'normal' }}
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
            {t('deployment.AutoApply')}
          </Checkbox>
          <BAIFlex direction="row" align="center" gap="xs">
            <Button onClick={() => onRequestClose()}>
              {t('button.Cancel')}
            </Button>
            <Button
              type="primary"
              loading={isAddInFlight || isResolvingImage}
              onClick={handleOk}
              disabled={effectiveMode === 'preset' && hasNoPresets}
            >
              {t('deployment.AddRevision')}
            </Button>
          </BAIFlex>
        </BAIFlex>
      }
      onCancel={() => onRequestClose()}
      confirmLoading={isAddInFlight || isResolvingImage}
      destroyOnHidden
      {...restModalProps}
    >
      {/* "Load current revision" affordance — mode-independent, rendered
          above both the Preset and Custom forms. Only for the plain
          "Add revision" entry: when the modal opens with a source revision
          (`sourceRevisionFrgmt`) the form is already prefilled, so the alert
          would be redundant. After the user clicks Load once the alert
          vanishes — there is nothing left to load. In Preset mode the click
          flips to Custom first and applies once the form mounts (see
          `handleLoadCurrent`). */}
      {currentRevision && !sourceRevisionFrgmt && !hasLoadedCurrent ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title={t('deployment.CurrentRevisionAvailableDescription')}
          action={
            <Button size="small" onClick={handleLoadCurrent}>
              {t('deployment.LoadCurrentRevision')}
            </Button>
          }
        />
      ) : null}
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
                <Suspense fallback={<BAISelect loading style={{ flex: 1 }} />}>
                  <Form.Item
                    name="revisionPresetId"
                    noStyle
                    rules={[{ required: true }]}
                  >
                    <BAIAvailablePresetSelect style={{ flex: 1 }} />
                  </Form.Item>
                </Suspense>
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
              label={t('deployment.ModelFolder')}
              tooltip={t('deployment.ModelFolderTooltip')}
              required
            >
              <BAIFlex direction="row" gap="xs">
                <Suspense fallback={<BAISelect loading style={{ flex: 1 }} />}>
                  <Form.Item
                    name="modelFolderId"
                    label={t('deployment.ModelFolder')}
                    noStyle
                    rules={[{ required: true }]}
                  >
                    <BAIVFolderSelect
                      ref={presetVFolderSelectRef}
                      currentProjectId={currentProjectId ?? undefined}
                      disabled={!currentProjectId}
                      excludeDeleted
                      filter='usage_mode == "model"'
                      style={{ flex: 1 }}
                    />
                  </Form.Item>
                </Suspense>
                <Form.Item dependencies={['modelFolderId']} noStyle>
                  {({ getFieldValue }: FormInstance<PresetFormValues>) => {
                    const modelFolderId = getFieldValue('modelFolderId');
                    return (
                      <Space.Compact>
                        <Tooltip title={t('modelService.OpenFolder')}>
                          <Button
                            icon={<FolderOpenIcon />}
                            disabled={!modelFolderId}
                            onClick={() => {
                              if (modelFolderId) {
                                openFolderExplorer(toLocalId(modelFolderId));
                              }
                            }}
                          />
                        </Tooltip>
                        <Tooltip title={t('data.CreateANewStorageFolder')}>
                          <Button
                            icon={<PlusIcon />}
                            onClick={() =>
                              setIsModelFolderCreateModalOpen(true)
                            }
                          />
                        </Tooltip>
                        <Tooltip title={t('button.Refresh')}>
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                              startTransition(() => {
                                presetVFolderSelectRef.current?.refetch();
                              });
                            }}
                          />
                        </Tooltip>
                      </Space.Compact>
                    );
                  }}
                </Form.Item>
              </BAIFlex>
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
            commandAdvanced: false,
            commandExecution: 'shell',
            commandShell: DEFAULT_MODEL_SERVICE_SHELL,
            commandEnableHealthCheck: false,
            environ: [],
          })}
        >
          <SectionHeader>{t('deployment.step.ModelAndRuntime')}</SectionHeader>
          <Form.Item
            label={t('deployment.ModelFolder')}
            tooltip={t('deployment.ModelFolderTooltip')}
            required
          >
            <BAIFlex direction="row" gap="xs">
              <Suspense fallback={<BAISelect loading style={{ flex: 1 }} />}>
                <Form.Item
                  name="modelFolderId"
                  label={t('deployment.ModelFolder')}
                  noStyle
                  rules={[{ required: true }]}
                >
                  <BAIVFolderSelect
                    ref={customVFolderSelectRef}
                    currentProjectId={currentProjectId ?? undefined}
                    disabled={!currentProjectId}
                    excludeDeleted
                    filter='usage_mode == "model"'
                    style={{ flex: 1 }}
                  />
                </Form.Item>
              </Suspense>
              <Form.Item dependencies={['modelFolderId']} noStyle>
                {({ getFieldValue }: FormInstance<FormValues>) => {
                  const modelFolderId = getFieldValue('modelFolderId');
                  return (
                    <Space.Compact>
                      <Tooltip title={t('modelService.OpenFolder')}>
                        <Button
                          icon={<FolderOpenIcon />}
                          disabled={!modelFolderId}
                          onClick={() => {
                            if (modelFolderId) {
                              openFolderExplorer(toLocalId(modelFolderId));
                            }
                          }}
                        />
                      </Tooltip>
                      <Tooltip title={t('data.CreateANewStorageFolder')}>
                        <Button
                          icon={<PlusIcon />}
                          onClick={() => setIsModelFolderCreateModalOpen(true)}
                        />
                      </Tooltip>
                      <Tooltip title={t('button.Refresh')}>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            startTransition(() => {
                              customVFolderSelectRef.current?.refetch();
                            });
                          }}
                        />
                      </Tooltip>
                    </Space.Compact>
                  );
                }}
              </Form.Item>
            </BAIFlex>
          </Form.Item>
          {/* Model-folder mount config (FR-3205): the destination path and an
              optional subpath for the selected model folder. Replaces the
              per-mode mount-path inputs that used to live in the command /
              config-file sections. */}
          <BAIFlex gap="sm" align="start">
            <Form.Item
              name="modelMountDestination"
              label={t('modelService.ModelMountDestination')}
              tooltip={t('modelService.ModelMountTooltip')}
              style={{ flex: 1 }}
            >
              <Input
                allowClear
                placeholder={modelDefinitionDefaults?.modelMountDestination}
              />
            </Form.Item>
            {supportsMountSubpath && (
              <Form.Item
                name="modelSubpath"
                label={t('modelService.Subpath')}
                tooltip={t('modelService.SubpathTooltip')}
                style={{ flex: 1 }}
              >
                <Input allowClear />
              </Form.Item>
            )}
          </BAIFlex>
          <Suspense fallback={<BAISelect loading style={{ width: '100%' }} />}>
            <Form.Item
              name="runtimeVariantId"
              label={t('deployment.RuntimeVariant')}
              tooltip={t('deployment.RuntimeVariantTooltip')}
              rules={[
                { required: true },
                {
                  warningOnly: true,
                  validator: async (_rule, value: string) => {
                    const v = runtimeVariantMap[value];
                    // Warn for variants that do NOT read the vfolder config
                    // files: their default command is applied by the backend.
                    // Fall back to the legacy `name === 'custom'` heuristic on
                    // pre-26.8.0 managers (field stripped → undefined).
                    const reads =
                      v?.readsVfolderConfigFiles ?? v?.name === 'custom';
                    if (v && !reads) {
                      return Promise.reject(
                        t(
                          'modelService.RuntimeVariantDefaultCommandAppliedNote',
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <BAIRuntimeVariantSelect
                onResolvedVariantsChange={(map) =>
                  setRuntimeVariantMap((prev) => ({ ...prev, ...map }))
                }
              />
            </Form.Item>
          </Suspense>

          <Form.Item dependencies={['runtimeVariantId']} noStyle>
            {({ getFieldValue }: FormInstance<FormValues>) => {
              const variantId = getFieldValue('runtimeVariantId');
              const v = runtimeVariantMap[variantId];
              const variantName = v?.name;
              // Runtime-parameter presets apply only to variants that do NOT
              // read the vfolder config files. Legacy fallback on pre-26.8.0
              // managers: `name === 'custom'` (field stripped → undefined).
              const reads =
                v?.readsVfolderConfigFiles ?? variantName === 'custom';
              if (!variantName || reads) return null;
              return (
                <div style={{ marginBottom: token.marginMD }}>
                  <Suspense fallback={null}>
                    <RuntimeParameterFormSection
                      runtimeVariant={variantName}
                      onTouchedKeysChange={(keys) => {
                        runtimeParamTouchedKeysRef.current = keys;
                      }}
                      onGroupsLoaded={(groups) => {
                        runtimeParamGroupsRef.current = groups;
                      }}
                      initialPresetValues={initialRuntimePresetValues}
                    />
                  </Suspense>
                </div>
              );
            }}
          </Form.Item>

          <Form.Item dependencies={['runtimeVariantId']} noStyle>
            {({ getFieldValue }: FormInstance<FormValues>) => {
              const variantId = getFieldValue('runtimeVariantId');
              const v = runtimeVariantMap[variantId];
              // Service Configuration (command / port / etc.) is shown only for
              // variants that read the vfolder config files. Legacy fallback on
              // pre-26.8.0 managers: `name === 'custom'` (field stripped →
              // undefined).
              const reads = v?.readsVfolderConfigFiles ?? v?.name === 'custom';
              if (!reads) {
                return null;
              }
              return (
                <Collapse
                  size="small"
                  defaultActiveKey={['service-config']}
                  style={{ marginBottom: token.marginMD }}
                  // Center the header items vertically — the Basic/Advanced
                  // Segmented on the right makes the header row tall.
                  styles={{ header: { alignItems: 'center' } }}
                  items={[
                    {
                      key: 'service-config',
                      // Keep the panel mounted while collapsed so the command
                      // fields stay registered and validate on submit (FR-3205).
                      forceRender: true,
                      // Basic/Advanced Segmented lives on the right of the header
                      // (gated on the 26.7.0 command/shell API); stopPropagation
                      // keeps switching modes from toggling the collapse.
                      label: (
                        <BAIFlex
                          justify="between"
                          align="center"
                          gap="sm"
                          style={{ flex: 1 }}
                        >
                          <span>{t('modelService.ServiceConfiguration')}</span>
                          {supportsCommandShell && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <BAIFlex gap="xxs" align="center">
                                <Form.Item
                                  name="commandAdvanced"
                                  noStyle
                                  // Segmented uses 'basic' | 'advanced' strings;
                                  // map to/from the boolean form value so submit
                                  // and prefill keep the same semantics.
                                  getValueProps={(checked: boolean) => ({
                                    value: checked ? 'advanced' : 'basic',
                                  })}
                                  normalize={(mode: string) =>
                                    mode === 'advanced'
                                  }
                                >
                                  <Segmented
                                    size="small"
                                    options={[
                                      {
                                        label: t('general.Basic'),
                                        value: 'basic',
                                      },
                                      {
                                        label: t('general.Advanced'),
                                        value: 'advanced',
                                      },
                                    ]}
                                  />
                                </Form.Item>
                                <BAIQuestionIconWithTooltip
                                  title={t(
                                    'modelService.CommandAdvancedModeTooltip',
                                  )}
                                />
                              </BAIFlex>
                            </div>
                          )}
                        </BAIFlex>
                      ),
                      children: (
                        <>
                          {/* Basic/Advanced + Execution/Shell controls need
                              the 26.7.0 command/shell API; on older managers
                              only the plain command input below is shown. The
                              Basic/Advanced Segmented sits at the top of the
                              command config (FR-3205). */}
                          {supportsCommandShell && (
                            <>
                              {/* Advanced only: Execution (Shell | Exec) + Shell.
                                  The Basic/Advanced toggle lives in the Collapse
                                  header. */}
                              <Form.Item
                                dependencies={['commandAdvanced']}
                                noStyle
                              >
                                {({
                                  getFieldValue: getAdv,
                                }: FormInstance<FormValues>) =>
                                  getAdv('commandAdvanced') ? (
                                    <BAIFlex gap="sm" align="start">
                                      <Form.Item
                                        name="commandExecution"
                                        label={t('modelService.Execution')}
                                        tooltip={{
                                          // pre-line so the `\n` between the
                                          // Shell and Exec descriptions renders
                                          // as a line break.
                                          title: (
                                            <span
                                              style={{
                                                whiteSpace: 'pre-line',
                                              }}
                                            >
                                              {t(
                                                'modelService.ExecutionTooltip',
                                              )}
                                            </span>
                                          ),
                                        }}
                                        required
                                        rules={[{ required: true }]}
                                      >
                                        <Radio.Group
                                          options={[
                                            {
                                              label: t(
                                                'modelService.ExecutionShell',
                                              ),
                                              value: 'shell',
                                            },
                                            {
                                              label: t(
                                                'modelService.ExecutionExec',
                                              ),
                                              value: 'exec',
                                            },
                                          ]}
                                        />
                                      </Form.Item>
                                      <Form.Item
                                        dependencies={['commandExecution']}
                                        noStyle
                                      >
                                        {({
                                          getFieldValue: getExec,
                                        }: FormInstance<FormValues>) =>
                                          // Exec = no shell → hide the Shell
                                          // field entirely (submitted `shell`
                                          // is null).
                                          getExec('commandExecution') ===
                                          'exec' ? null : (
                                            <Form.Item
                                              name="commandShell"
                                              label={t('modelService.Shell')}
                                              tooltip={t(
                                                'modelService.ShellTooltip',
                                              )}
                                              style={{ flex: 1 }}
                                              required
                                              rules={[
                                                {
                                                  required: true,
                                                  whitespace: true,
                                                },
                                              ]}
                                            >
                                              <AutoComplete
                                                options={COMMAND_SHELL_OPTIONS}
                                                allowClear
                                              />
                                            </Form.Item>
                                          )
                                        }
                                      </Form.Item>
                                    </BAIFlex>
                                  ) : null
                                }
                              </Form.Item>
                            </>
                          )}
                          {/* Command input: multi-line textarea in Shell
                              mode (backend runs `shell -c command`, so
                              operators work); single-line input in Exec
                              mode (shell is null → command run directly as
                              argv, so operators do NOT work). Legacy
                              (<26.7.0) managers get a plain single-line
                              input that is tokenized on submit. */}
                          <Form.Item
                            dependencies={[
                              'commandAdvanced',
                              'commandExecution',
                            ]}
                            noStyle
                          >
                            {({
                              getFieldValue: getMode,
                            }: FormInstance<FormValues>) => {
                              const advanced = !!getMode('commandAdvanced');
                              const isExec =
                                advanced &&
                                getMode('commandExecution') === 'exec';
                              return (
                                <Form.Item
                                  name="startCommand"
                                  // Exec splits the input into an argv
                                  // vector, so label it "Command (argv)"
                                  // to distinguish it from a shell command.
                                  label={
                                    isExec
                                      ? t('modelService.CommandArgvLabel')
                                      : t('modelService.StartCommand')
                                  }
                                  tooltip={t(
                                    'modelService.StartCommandTooltip',
                                  )}
                                  extra={
                                    advanced
                                      ? isExec
                                        ? t('modelService.CommandExecHelper')
                                        : t('modelService.CommandShellHelper')
                                      : undefined
                                  }
                                  // The command is sent to the server as the
                                  // raw string the user typed; the WebUI does
                                  // not pre-validate shell operators (Exec runs
                                  // it via shlex.split, where quoted operators
                                  // are valid argv content). The Exec helper
                                  // text explains that unquoted operators are
                                  // not interpreted.
                                  rules={[{ whitespace: true }]}
                                >
                                  {!supportsCommandShell ? (
                                    // Legacy (<26.7.0): plain single-line
                                    // input, tokenized on submit.
                                    <Input
                                      placeholder={
                                        modelDefinitionDefaults?.startCommand
                                      }
                                    />
                                  ) : isExec ? (
                                    // Exec: argv example, no shell operators.
                                    <Input
                                      placeholder={
                                        modelDefinitionDefaults?.startCommand
                                      }
                                    />
                                  ) : (
                                    <Input.TextArea
                                      placeholder={
                                        modelDefinitionDefaults?.startCommand
                                      }
                                      autoSize={{ minRows: 2 }}
                                    />
                                  )}
                                </Form.Item>
                              );
                            }}
                          </Form.Item>
                          <Form.Item
                            name="commandPort"
                            label={t('modelService.Port')}
                            tooltip={t('modelService.PortTooltip')}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={2}
                              max={65535}
                              placeholder={modelDefinitionDefaults?.port?.toString()}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </>
                      ),
                    },
                  ]}
                />
              );
            }}
          </Form.Item>

          {/* Health check is shown for every runtime variant and definition
              mode (FR-3068); enabling it submits a health-check override. */}
          <Form.Item
            name="commandEnableHealthCheck"
            valuePropName="checked"
            style={{ marginBottom: token.marginXS }}
          >
            <Checkbox>{t('modelService.EnableHealthCheck')}</Checkbox>
          </Form.Item>
          <Form.Item dependencies={['commandEnableHealthCheck']} noStyle>
            {({ getFieldValue: getHc }: FormInstance<FormValues>) =>
              getHc('commandEnableHealthCheck') ? (
                <BAIFlex direction="column" align="stretch" gap="xs">
                  <Form.Item
                    name="commandHealthCheck"
                    label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
                    tooltip={t('modelService.HealthCheckTooltip')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={modelDefinitionDefaults?.healthCheckPath}
                      allowClear
                    />
                  </Form.Item>
                  <BAIFlex gap="md" wrap="wrap" align="end">
                    <Form.Item
                      name="commandInterval"
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckInterval',
                      )}
                      tooltip={t('modelService.IntervalTooltip')}
                      rules={[{ required: true }]}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      <InputNumber
                        min={1}
                        suffix={t('time.Sec')}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="commandMaxRetries"
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                      )}
                      tooltip={t('modelService.MaxRetriesTooltip')}
                      rules={[{ required: true }]}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      <InputNumber
                        min={1}
                        placeholder={modelDefinitionDefaults?.maxRetries?.toString()}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="commandMaxWaitTime"
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                      )}
                      tooltip={t('modelService.MaxWaitTimeTooltip')}
                      rules={[{ required: true }]}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      <InputNumber
                        min={1}
                        suffix={t('time.Sec')}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </BAIFlex>
                  <BAIFlex gap="md" wrap="wrap" align="end">
                    <Form.Item
                      name="commandExpectedStatusCode"
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                      )}
                      tooltip={t('modelService.ExpectedStatusTooltip')}
                      rules={[{ required: true }]}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      <InputNumber
                        min={101}
                        max={599}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="commandInitialDelay"
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                      )}
                      tooltip={t('modelService.InitialDelayTooltip')}
                      rules={[{ required: true }]}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      <InputNumber
                        min={0}
                        placeholder={modelDefinitionDefaults?.initialDelay?.toString()}
                        suffix={t('time.Sec')}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <div style={{ flex: 1, minWidth: 160 }} />
                  </BAIFlex>
                </BAIFlex>
              ) : null
            }
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
                    {showModelDefinitionPath && (
                      <Form.Item
                        name="definitionPath"
                        label={t('deployment.ModelDefinitionPath')}
                        tooltip={t('modelService.ModelDefinitionPathTooltip')}
                        rules={[{ whitespace: true }]}
                        preserve={false}
                      >
                        <Input allowClear placeholder="model-definition.yaml" />
                      </Form.Item>
                    )}
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
                          ? safeDecodeUuid(String(modelFolderId))?.replace(
                              /-/g,
                              '',
                            )
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
      {/* DB `defaultModelDefinition` baseline loader (FR-3205). Renders nothing;
          resolves the variant's built-in definition and pushes it into
          `dbModelDefinitionDefaults` for the placeholder merge. Keyed by
          variantId so switching variants remounts a fresh query. Wrapped in
          Suspense so the modal chrome / form never blank while it resolves. */}
      {shouldLoadVariantDefault && watchedRuntimeVariantId ? (
        <Suspense fallback={null}>
          <VariantDefaultModelDefinitionLoader
            key={watchedRuntimeVariantId}
            variantId={watchedRuntimeVariantId}
            onLoaded={(defaults, variantId) =>
              setDbModelDefinitionDefaults({ variantId, defaults })
            }
          />
        </Suspense>
      ) : null}
      <FolderCreateModalV2
        open={isModelFolderCreateModalOpen}
        initialValues={{ usage_mode: 'model' }}
        onRequestClose={(result) => {
          setIsModelFolderCreateModalOpen(false);
          if (result?.id) {
            // `createVfolderV2` returns a `VFolder` (Strawberry) global ID,
            // but BAIVFolderSelect's value query reads from `vfolder_nodes`
            // (`VirtualFolderNode`, Graphene). Both encode the same UUID
            // but with different `__typename:` prefixes, so the select's
            // option matching (`edge.node.id === value`) would fail if we
            // set the raw mutation id directly. Re-encode to the
            // VirtualFolderNode global ID form.
            const newFolderUuid = safeDecodeUuid(result.id);
            if (!newFolderUuid) return;
            const newFolderGlobalId = toGlobalId(
              'VirtualFolderNode',
              newFolderUuid,
            );
            const activeForm =
              effectiveMode === 'preset' ? presetForm : customForm;
            const activeRef =
              effectiveMode === 'preset'
                ? presetVFolderSelectRef
                : customVFolderSelectRef;
            activeForm.setFieldValue('modelFolderId', newFolderGlobalId);
            startTransition(() => {
              activeRef.current?.refetch();
            });
          }
        }}
      />
    </BAIModal>
  );
};

export default DeploymentAddRevisionModal;
