/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DeploymentAddRevisionModalAddMutation,
  DeploymentAddRevisionModalAddMutation$data,
} from '../__generated__/DeploymentAddRevisionModalAddMutation.graphql';
import type { DeploymentAddRevisionModalCardDetailQuery } from '../__generated__/DeploymentAddRevisionModalCardDetailQuery.graphql';
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
import { App } from '../app-shim';
import { Form } from '../form-engine';
import type { FormInstance } from '../form-engine';
import { convertToBinaryUnit } from '../helper';
import {
  DEFAULT_MODEL_SERVICE_SHELL,
  type CommandExecutionMode,
  deriveCommandModeState,
  resolveCommandShell,
} from '../helper/modelServiceCommand';
import { queryWithinOpenModal } from '../helper/openModalRoot';
import { tokenizeShellCommand } from '../helper/parseCliCommand';
import {
  modelDefinitionFromGraphQL,
  type ParsedModelDefinition,
} from '../helper/parseModelDefinitionYaml';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useModelDefinitionPlaceholders } from '../hooks/useModelDefinitionDefaults';
import {
  buildRuntimeVariantPresetValues,
  type RuntimeParameterGroup,
  type RuntimeVariantPresetValueEntry,
} from '../hooks/useRuntimeParameterSchema';
import { useCommonEnvVarConfigs } from '../hooks/useVariantConfigs';
import { theme } from '../theme-shim';
import type { ProjectContextOrNull } from '../types/projectContext';
import {
  type ModelHealthCheckFormValue,
  type PreStartActionFormValue,
} from './AdminDeploymentPresetFormTypes';
import BAIFormItem from './BAIFormItem';
import BAIRadioGroup from './BAIRadioGroup';
import DeploymentPresetDetailModal from './DeploymentPresetDetailModal';
import EnvVarFormList, { type EnvVarFormListValue } from './EnvVarFormList';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import ImageEnvironmentSelectFormItems, {
  type ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import ModelCardDrawer from './ModelCardDrawer';
import ModelCardSelect from './ModelCardSelect';
import ModelServiceHealthCheckFormItems from './ModelServiceFormItems/ModelServiceHealthCheckFormItems';
import PreStartActionsFormList from './ModelServiceFormItems/PreStartActionsFormList';
import ServiceConfigurationFormItems from './ModelServiceFormItems/ServiceConfigurationFormItems';
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
import { AstryxFormTextInput } from './astryxFormControls';
import './collapsible-section.css';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Divider } from '@astryxdesign/core/Divider';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  BAISkeleton,
  BAIAvailablePresetSelect,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIRuntimeVariantSelect,
  BAIComplexSelect,
  BAIVFolderPathPicker,
  BAIVFolderSelect,
  BAIVFolderSelectRef,
  convertToUUID,
  safeDecodeUuid,
  toGlobalId,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Info, RotateCw, FolderOpenIcon, PlusIcon } from 'lucide-react';
import React, {
  Suspense,
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
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
    // Start Command shell semantics (FR-3205). `execution` chooses Shell
    // (run `shell -c command`) vs Exec (argv, no shell); `shell` is the
    // shell binary for Shell execution.
    execution?: CommandExecutionMode;
    shell?: string;
    port?: number;
    enableHealthCheck?: boolean;
    // Shared with AdminDeploymentPresetSettingPageContent.tsx's ModelConfigFormValue
    // — the two forms' service-config leaf field names were unified (FR-3474),
    // so their value shapes are now genuinely identical, not just parallel.
    healthCheck?: ModelHealthCheckFormValue;
    preStartActions?: PreStartActionFormValue[];
    environ: EnvVarFormListValue[];
    /** Runtime-variant preset values, registered by RuntimeParameterFormSection. */
    runtimeParams?: RuntimeParameterValues;
  };

export type PresetModelSource = 'folder' | 'card';

export type PresetFormValues = {
  /** Which model source drives this preset revision. */
  presetModelSource: PresetModelSource;
  revisionPresetId: string;
  /**
   * The backing model VFolder. In `folder` mode the user picks it directly;
   * in `card` mode it is resolved from the selected model card's `vfolderId`,
   * so the submit path (`modelMountConfig.vfolderId`) is identical for both.
   */
  modelFolderId: string;
  /** Selected model card local id — only set in `card` mode. */
  modelCardId?: string;
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
  'use memo';
  // PILOT-DECISION: antd `Divider titlePlacement="left"` with a hand-styled
  // secondary/small Text label → Astryx `Divider label`. Astryx renders divider
  // labels centered with small secondary styling built in; there is no
  // placement prop, so the left placement (and the manual fontSizeSM Text) is
  // dropped per defaults-first.
  return <Divider label={children} />;
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

// Loader for the model-card detail drawer. The `ModelCardSelect` list query
// only loads a card's summary fields, so prefetch the full
// `ModelCardDrawerFragment` here and suspend until it lands. By the time
// `ModelCardDrawer` renders below, its own id-keyed query is a warm-cache hit,
// so the drawer opens fully populated instead of showing in-place "-"
// placeholders while its fetch is in flight. The `Suspense` boundary at the
// call site keeps that suspense local (it never bubbles up to blank the page).
const ModelCardDetailLoader: React.FC<{
  modelCardId: string;
  onClose: () => void;
}> = ({ modelCardId, onClose }) => {
  'use memo';
  useLazyLoadQuery<DeploymentAddRevisionModalCardDetailQuery>(
    graphql`
      query DeploymentAddRevisionModalCardDetailQuery($id: UUID!) {
        modelCardV2(id: $id) {
          ...ModelCardDrawerFragment
        }
      }
    `,
    { id: modelCardId },
  );
  return <ModelCardDrawer modelCardId={modelCardId} open onClose={onClose} />;
};

// Card-mode preset selector: the same self-fetching
// `BAIAvailablePresetSelect` used for the folder source, scoped to the
// selected model card's resource-compatible presets via `modelCardId`. That
// routes the list through the top-level `modelCardAvailablePresets` query (the
// same server-filtered subset `ModelCardDeployModal` deploys against,
// satisfying the card's minimum resource requirements), so no separate
// card-scoped select or fragment is needed. Disabled with a hint until a card
// is picked — the hint rides in the field's `description` slot (Astryx forbids
// wrapping a disabled control in a Tooltip).
const ModelCardPresetSelect: React.FC<
  {
    modelCardId?: string;
  } & Omit<React.ComponentProps<typeof BAIAvailablePresetSelect>, 'modelCardId'>
> = ({ modelCardId, ...selectProps }) => {
  'use memo';
  const { t } = useTranslation();
  const isDisabled = !modelCardId;
  return (
    <BAIAvailablePresetSelect
      modelCardId={modelCardId}
      isDisabled={isDisabled}
      description={
        isDisabled ? t('deployment.SelectModelCardFirst') : undefined
      }
      {...selectProps}
    />
  );
};

// Suspense fallback for the self-fetching selects: the same `BAIComplexSelect`
// they render, so the placeholder keeps their exact height and 100% width
// (`BAISelect` sits on Astryx `Selector` — taller, and it ignores `flex: 1`).
const SelectLoadingFallback: React.FC<{ label: string }> = ({ label }) => {
  'use memo';
  return <BAIComplexSelect label={label} isLabelHidden isLoading isDisabled />;
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
          projectId
          projectV2 @since(version: "26.4.3") {
            basicInfo {
              name
            }
          }
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
      revisionPresetId @since(version: "26.4.4")
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
        vfolder {
          id
          name
        }
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
            preStartActions {
              action
              args
            }
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
  // Display names for prefilled model folders the selector may not resolve
  // itself (deleted, or outside its project scope — e.g. a model-store
  // folder behind a card-born revision). Keyed by the folder's global id.
  const revisionFolderFallbackLabels: Record<string, string> = _.fromPairs(
    _.compact(
      [currentRevision, sourceRevision].map((rev) => {
        const vfolder = rev?.modelMountConfig?.vfolder;
        return vfolder?.id && vfolder.name ? [vfolder.id, vfolder.name] : null;
      }),
    ),
  );
  // ADR-0001 (FR-3411, derive-from-resource tier): adding a revision always
  // targets the deployment's own project — never the ambient header
  // selection. The id comes from the deployment metadata (`projectId`); the
  // name is resolved via `projectV2` (managers >= 26.4.3). It scopes the
  // model-folder picker, the resource-allocation form, and the in-modal
  // folder-creation flow. When the pair cannot be resolved (defensive:
  // missing metadata or a pre-26.4.3 manager without `projectV2`),
  // submission is visibly disabled instead of falling back to ambient.
  const deploymentProject: ProjectContextOrNull =
    deployment?.metadata?.projectId &&
    deployment?.metadata?.projectV2?.basicInfo?.name
      ? {
          id: deployment.metadata.projectId,
          name: deployment.metadata.projectV2.basicInfo.name,
        }
      : null;
  const { logger } = useBAILogger();
  const { open: openFolderExplorer } = useFolderExplorerOpener();
  const baiClient = useSuspendedBackendaiClient();
  const commonEnvVars = useCommonEnvVarConfigs();
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
  // The single-string `command` + `shell` fields exist on
  // ModelServiceConfigInput since 26.7.0, but the WebUI only uses them from
  // 26.8.0 — see the capability comment in `client.ts` (BA-6742). Below that,
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
  // One-shot guard for the Preset-form twin of the source prefill. Also set
  // when the source revision carries no `revisionPresetId` and we flip to
  // Custom instead, so toggling back to Preset does not re-trigger the flip.
  const [hasAppliedSourcePresetPrefill, setHasAppliedSourcePresetPrefill] =
    useState(false);
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
  // Drives the (i) button's loading spinner while the preset-detail prefetch
  // query is in flight (see the persistent Suspense boundary below).
  const [isPresetDetailPending, startPresetDetailTransition] = useTransition();
  // Model card detail drawer target — opens ModelCardDrawer when the user
  // clicks the (i) button next to the model-card selector.
  const [modelCardDetailId, setModelCardDetailId] = useState<string | null>(
    null,
  );
  // Drives the (i) button's loading spinner while the detail-drawer prefetch
  // query is in flight (see the persistent Suspense boundary below).
  const [isModelCardDetailPending, startModelCardDetailTransition] =
    useTransition();
  // In Preset mode's "model card" source, the selected card resolves to its
  // backing vfolder. We keep that vfolder id here so the submit path can reuse
  // the same `modelMountConfig.vfolderId` a model-folder selection would send.
  const [selectedCardVfolderId, setSelectedCardVfolderId] = useState<
    string | null
  >(null);

  // Map of runtime variant id → { name, readsVfolderConfigFiles }, populated by
  // `BAIRuntimeVariantSelect` as it resolves the currently selected value
  // (via its `runtimeVariant(id:)` point lookup) and the visible page of the
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
      // Custom mode only has a model folder, so force the Preset source back to
      // 'folder' and drop any leftover card selection. Otherwise a prior
      // `presetModelSource: 'card'` would persist and the carried folder would
      // be ignored at submit (which reads `selectedCardVfolderId` for cards).
      carryOver.presetModelSource = 'folder';
      carryOver.modelCardId = undefined;
      setSelectedCardVfolderId(null);
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
    // without waiting for `BAIRuntimeVariantSelect`'s point lookup to
    // finish.
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
    // Command-mode prefill applies only to variants that read the vfolder config
    // files, since they are the only ones that expose the Service Configuration
    // (command) fields. A variant that does not read them can still carry a
    // stored command; prefilling from it would load that command into fields the
    // user cannot see, and it would then follow along when they switch to a
    // variant that does show them. Within a reading variant, prefill only when
    // the revision actually carries a command — either as a single string or as
    // a token list, depending on the manager that wrote it.
    const hasCustomCommand =
      readsVfolderConfigFiles &&
      !!service &&
      (!!service.command || (service.startCommand?.length ?? 0) > 0);
    // Reconstruct the command string and Execution + Shell UI state from
    // whichever field the revision carries (FR-3205).
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
      enableHealthCheck: !!healthCheck,
      healthCheck: {
        path: healthCheck?.path ?? undefined,
        initialDelay: healthCheck?.initialDelay ?? undefined,
        maxRetries: healthCheck?.maxRetries ?? undefined,
        interval: healthCheck?.interval ?? undefined,
        maxWaitTime: healthCheck?.maxWaitTime ?? undefined,
        expectedStatusCode: healthCheck?.expectedStatusCode ?? undefined,
      },
      // Pre-start actions prefill (FR-3205): translate from the GraphQL shape
      // (args as object) to the form shape (args as JSON string).
      preStartActions:
        service?.preStartActions?.map((a) => ({
          action: a.action,
          args: JSON.stringify(a.args),
        })) ?? [],
      ...(hasCustomCommand && service
        ? {
            startCommand: commandModeState.command,
            execution: commandModeState.execution,
            shell: commandModeState.shell,
            port: service.port,
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

  // Preset-mode twin of the source prefill: restores `revisionPresetId` +
  // model folder. The model-CARD selection is NOT restored (skipped in this
  // scope): a revision records only the mounted vfolder UUID, not the card
  // it came from, so a card-born revision prefills as a 'folder' source
  // pointing at the card's backing folder. A revision without
  // `revisionPresetId` (custom-made, preset since deleted, or a pre-26.4.4
  // manager) cannot be represented in Preset mode at all, so flip to Custom
  // and let `applySourcePrefillOnce` take over — otherwise the "Add new
  // revision from this" entry silently does nothing when the modal
  // remembers Preset mode.
  const applySourcePresetPrefillOnce = useEffectEvent(() => {
    if (hasAppliedSourcePresetPrefill) return;
    if (!sourceRevision) return;
    setHasAppliedSourcePresetPrefill(true);
    if (!sourceRevision.revisionPresetId) {
      setMode('custom');
      return;
    }
    setSelectedCardVfolderId(null);
    presetForm.setFieldsValue({
      presetModelSource: 'folder',
      modelCardId: undefined,
      revisionPresetId: sourceRevision.revisionPresetId,
      modelFolderId: sourceRevision.modelMountConfig?.vfolderId
        ? toGlobalId(
            'VirtualFolderNode',
            sourceRevision.modelMountConfig.vfolderId,
          )
        : undefined,
    });
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
      applySourcePresetPrefillOnce();
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

  // `scrollToFirstError` walks `errorFields` in field *registration* order, not
  // DOM order, so DOM order is resolved by querying the document instead — the
  // first match is the errored item highest on screen. The status surface is
  // BAIFormItem's `data-status="error"` (see BAIFormItem.tsx, which aggregates
  // nested noStyle children's errors into the wrapper).
  const handleFinishFailed = () => {
    requestAnimationFrame(() => {
      const firstErrorEl = queryWithinOpenModal(
        '[data-bai-form-item][data-status="error"]',
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
    const healthCheckEnabled = !!values.enableHealthCheck;
    const healthCheck = (() => {
      const configuredFields = {
        path: values.healthCheck?.path,
        interval: values.healthCheck?.interval,
        maxRetries: values.healthCheck?.maxRetries,
        maxWaitTime: values.healthCheck?.maxWaitTime,
        initialDelay: values.healthCheck?.initialDelay,
        expectedStatusCode: values.healthCheck?.expectedStatusCode,
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

    // Start Command (FR-3205): when the command/shell path is enabled (26.8.0+
    // by client policy) send the user's raw command string in
    // `command` plus a `shell` derived from the Execution mode (Shell →
    // selected shell, Exec → null). On older managers fall back to the
    // deprecated tokenized `startCommand`. Never send both — the backend
    // prefers `command`.
    const rawCommand = values.startCommand ?? '';
    const commandServiceFields = supportsCommandShell
      ? {
          command: rawCommand,
          shell: resolveCommandShell({
            execution: values.execution,
            shell: values.shell,
          }),
        }
      : { startCommand: tokenizeShellCommand(rawCommand) };

    // Pre-start actions from the form (FR-3205). Parse the JSON `args` string
    // for each entry; fallback to `{}` on invalid JSON.
    const preStartActions = (values.preStartActions ?? [])
      .filter((a) => a.action)
      .map((a) => ({
        action: a.action,
        args: (() => {
          try {
            return JSON.parse(a.args || '{}');
          } catch {
            return {};
          }
        })(),
      }));

    // Build the model definition from the service config fields. Custom
    // variants (readsVfolderConfigFiles) expose command/port; all variants
    // expose health check and pre-start actions. The definition is sent
    // whenever any service field has data — not just when a command is typed.
    const hasServiceConfig =
      readsVfolderConfigFiles && (values.startCommand || values.port != null);
    const hasHealthOrPreStart =
      healthCheckEnabled || preStartActions.length > 0;

    const modelDefinition = hasServiceConfig
      ? {
          models: [
            {
              name: 'model',
              modelPath: modelMountDestination,
              service: {
                preStartActions,
                ...commandServiceFields,
                port: values.port ?? 8000,
                healthCheck,
              },
            },
          ],
        }
      : hasHealthOrPreStart
        ? {
            models: [
              {
                service: {
                  healthCheck,
                  ...(preStartActions.length > 0 ? { preStartActions } : {}),
                },
              },
            ],
          }
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
            // Only variants that read the vfolder config files expose this
            // field; anything left in the form store for the others is not
            // theirs to send.
            definitionPath: readsVfolderConfigFiles
              ? values.definitionPath?.trim() || null
              : null,
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
    // forwards the model mount source via `modelMountConfig` and the
    // `autoActivate` option. The mount vfolder comes either from the picked
    // model folder or — in "model card" source — from the card's backing
    // vfolder (already a raw UUID).
    // Both branches must resolve to a raw vfolder UUID. Card mode is gated on
    // a required model-card selection, which also records the card's backing
    // vfolder, so an empty id here means the selected card carried no vfolder.
    // Stop instead of sending an empty `vfolderId`, which the mutation would
    // either reject or turn into a revision with an unusable mount.
    const mountVfolderId =
      values.presetModelSource === 'card'
        ? selectedCardVfolderId
        : toLocalId(values.modelFolderId);
    if (!mountVfolderId) {
      message.error(t('deployment.ModelSourceMissingModelFolder'));
      return;
    }
    commitAdd({
      variables: {
        input: {
          deploymentId: toLocalId(deployment?.id ?? '') ?? deployment?.id ?? '',
          revisionPresetId: values.revisionPresetId,
          modelMountConfig: {
            vfolderId: mountVfolderId,
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

  // Read the selected model folder's `model-definition.yaml` and use its parsed
  // values as placeholders (display-only hints) on the command fields. Enabled
  // only for a config-reading variant with a folder selected; failures fall
  // back to the DB baseline / static placeholders below.
  const { defaults: vfolderModelDefinitionDefaults } =
    useModelDefinitionPlaceholders(
      watchedModelFolderId,
      readsVfolderConfigFilesInMode,
    );

  // Low-priority placeholder layer: the runtime variant's built-in
  // `defaultModelDefinition`, resolved by the Suspense-wrapped
  // `VariantDefaultModelDefinitionLoader` side query and pushed here via
  // `onLoaded`. It is stored together with the `variantId` it describes because
  // the loader for a newly selected variant suspends before it reports back:
  // without that tag, the previous variant's values would briefly show up as
  // this variant's placeholders.
  const [dbModelDefinitionDefaults, setDbModelDefinitionDefaults] = useState<{
    variantId: string;
    defaults: Partial<ParsedModelDefinition> | null;
  } | null>(null);
  const shouldLoadVariantDefault =
    readsVfolderConfigFilesInMode && !!watchedRuntimeVariantId;
  // A stored baseline counts only while it still describes the current form
  // state: the selected variant must read the vfolder config files in this mode,
  // and the baseline must be the one loaded for that same variant. Deriving this
  // on render — instead of resetting the state whenever either input changes —
  // keeps a stale baseline out of the placeholders without a state write.
  const activeDbModelDefinitionDefaults =
    shouldLoadVariantDefault &&
    dbModelDefinitionDefaults &&
    dbModelDefinitionDefaults.variantId === watchedRuntimeVariantId
      ? dbModelDefinitionDefaults.defaults
      : null;

  // Placeholder precedence: the variant's built-in default (low) < the mounted
  // vfolder's `model-definition.yaml` (high) — the yaml is what the server will
  // actually read, so it wins wherever it speaks. Both layers list only the
  // fields they define, so the merge is field-by-field: a yaml that sets just
  // `start_command` keeps the variant's port / health-check hints rather than
  // blanking them. The Advanced "Model Definition File Path" field is
  // deliberately not an input here — it selects which yaml is read, so feeding
  // it back would make the fields above it depend on their own hint source.
  const modelDefinitionDefaults: Partial<ParsedModelDefinition> | null =
    activeDbModelDefinitionDefaults || vfolderModelDefinitionDefaults
      ? {
          ...activeDbModelDefinitionDefaults,
          // Safe as a plain spread: both layers omit the fields they do not
          // define rather than carrying `undefined`, so the higher layer can
          // never blank a value the lower one supplied.
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
          {/* PILOT-DECISION: antd's `style={{fontWeight: 'normal'}}` counter-
              acted the modal title's bold leaking into the Segmented — Astryx
              SegmentedControl styles its own items, so the override is
              dropped. The `label` is aria-only; reuses an existing key. */}
          <SegmentedControl
            value={effectiveMode}
            onChange={(next) => {
              void handleModeChange(next as 'preset' | 'custom');
            }}
            label={t('deployment.AddRevision')}
          >
            <SegmentedControlItem
              value="preset"
              label={t('deployment.PresetMode')}
            />
            <SegmentedControlItem
              value="custom"
              label={t('deployment.CustomMode')}
            />
          </SegmentedControl>
        </BAIFlex>
      }
      width={800}
      footer={
        <BAIFlex direction="row" align="center" justify="between" gap="sm">
          {/* Standalone (non-form) checkbox → Astryx CheckboxInput: onChange
              receives the boolean value directly (no CheckboxChangeEvent). */}
          <CheckboxInput
            label={t('deployment.AutoApply')}
            value={autoActivate}
            onChange={(next) => setAutoActivate(next)}
            isDisabled={effectiveMode === 'preset' && hasNoPresets}
          />
          <BAIFlex direction="row" align="center" gap="xs">
            <Button
              label={t('button.Cancel')}
              onClick={() => onRequestClose()}
            />
            <Button
              variant="primary"
              label={t('deployment.AddRevision')}
              isLoading={isAddInFlight || isResolvingImage}
              onClick={handleOk}
              isDisabled={
                (effectiveMode === 'preset' && hasNoPresets) ||
                !deploymentProject
              }
            />
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
      {!deploymentProject ? (
        <Banner
          status="warning"
          style={{ marginBottom: token.marginMD }}
          title={t('deployment.CannotResolveDeploymentProject')}
        />
      ) : null}
      {currentRevision && !sourceRevisionFrgmt && !hasLoadedCurrent ? (
        // antd Alert → Astryx Banner (`showIcon` dropped: Banner always shows
        // the status icon; `action` → `endContent`).
        <Banner
          status="info"
          style={{ marginBottom: token.marginMD }}
          title={t('deployment.CurrentRevisionAvailableDescription')}
          endContent={
            <Button
              size="sm"
              label={t('deployment.LoadCurrentRevision')}
              onClick={handleLoadCurrent}
            />
          }
        />
      ) : null}
      {effectiveMode === 'preset' ? (
        hasNoPresets ? (
          // Empty-state: per spec, when no preset is available in Preset Mode,
          // guide the user to switch to Custom Mode.
          <Banner
            status="info"
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
            onValuesChange={(changed) => {
              // When the model source toggles, reset the other source's fields
              // so a stale selection can't leak into the submit payload.
              if (
                Object.prototype.hasOwnProperty.call(
                  changed,
                  'presetModelSource',
                )
              ) {
                const next = changed.presetModelSource as PresetModelSource;
                setSelectedCardVfolderId(null);
                presetForm.setFieldsValue({
                  revisionPresetId: undefined,
                  modelCardId: undefined,
                  modelFolderId:
                    next === 'folder' ? defaultModelFolderId : undefined,
                });
              }
            }}
            initialValues={{
              presetModelSource: 'folder',
              modelFolderId: defaultModelFolderId,
            }}
          >
            {/* 1) Choose the model source: a model folder or a model card. */}
            <BAIFormItem
              name="presetModelSource"
              label={t('deployment.ModelSource')}
              tooltip={t('deployment.ModelSourceTooltip')}
              required
              rules={[{ required: true }]}
            >
              <BAIRadioGroup
                label={t('deployment.ModelSource')}
                options={[
                  { label: t('deployment.ModelFolder'), value: 'folder' },
                  { label: t('deployment.ModelCard'), value: 'card' },
                ]}
              />
            </BAIFormItem>

            {/* 2) The source selector — model folder or model card. */}
            <BAIFormItem dependencies={['presetModelSource']} noStyle>
              {(form) => {
                // BAIFormItem render-prop children receive `unknown`
                // (antd typed this as FormInstance); narrow it back.
                const { getFieldValue } =
                  form as FormInstance<PresetFormValues>;
                const source = getFieldValue(
                  'presetModelSource',
                ) as PresetModelSource;
                return source === 'card' ? (
                  <BAIFormItem
                    label={t('deployment.ModelCard')}
                    tooltip={t('deployment.ModelCardTooltip')}
                    required
                  >
                    <BAIFlex direction="row" gap="xs">
                      <Suspense
                        fallback={
                          <SelectLoadingFallback
                            label={t('deployment.ModelCard')}
                          />
                        }
                      >
                        <BAIFormItem
                          name="modelCardId"
                          messageVariables={{
                            label: t('deployment.ModelCard'),
                          }}
                          noStyle
                          rules={[{ required: true }]}
                        >
                          <ModelCardSelect
                            label={t('deployment.ModelCard')}
                            isLabelHidden
                            onSelectCard={(card) => {
                              // A model card resolves to its backing vfolder;
                              // keep it for submit. Clear the preset since one
                              // compatible with the previous card may not exist
                              // for the new one.
                              setSelectedCardVfolderId(card?.vfolderId ?? null);
                              presetForm.setFieldsValue({
                                revisionPresetId: undefined,
                              });
                            }}
                          />
                        </BAIFormItem>
                      </Suspense>
                      <BAIFormItem dependencies={['modelCardId']} noStyle>
                        {(cardForm) => {
                          const { getFieldValue: getCardId } =
                            cardForm as FormInstance<PresetFormValues>;
                          const selectedCardId = getCardId('modelCardId');
                          return (
                            <IconButton
                              icon={<Info size="1em" />}
                              label={t('modelStore.ModelCardDetail')}
                              tooltip={t('modelStore.ModelCardDetail')}
                              isLoading={isModelCardDetailPending}
                              isDisabled={!selectedCardId}
                              onClick={() => {
                                if (selectedCardId)
                                  startModelCardDetailTransition(() => {
                                    setModelCardDetailId(selectedCardId);
                                  });
                              }}
                            />
                          );
                        }}
                      </BAIFormItem>
                    </BAIFlex>
                  </BAIFormItem>
                ) : (
                  <BAIFormItem
                    label={t('deployment.ModelFolder')}
                    tooltip={t('deployment.ModelFolderTooltip')}
                    required
                  >
                    <BAIFlex direction="row" gap="xs">
                      <Suspense
                        fallback={
                          <SelectLoadingFallback
                            label={t('deployment.ModelFolder')}
                          />
                        }
                      >
                        <BAIFormItem
                          name="modelFolderId"
                          // BAIFormItem drops `label` on noStyle items (the
                          // outer layout item renders it); keep antd's default
                          // required-message interpolation via
                          // messageVariables instead.
                          messageVariables={{
                            label: t('deployment.ModelFolder'),
                          }}
                          noStyle
                          rules={[{ required: true }]}
                        >
                          <BAIVFolderSelect
                            ref={presetVFolderSelectRef}
                            fallbackLabels={revisionFolderFallbackLabels}
                            label={t('deployment.ModelFolder')}
                            isLabelHidden
                            currentProjectId={deploymentProject?.id}
                            isDisabled={!deploymentProject}
                            excludeDeleted
                            filter='usage_mode == "model"'
                          />
                        </BAIFormItem>
                      </Suspense>
                      <BAIFormItem dependencies={['modelFolderId']} noStyle>
                        {(folderForm) => {
                          const { getFieldValue: getModelFolderId } =
                            folderForm as FormInstance<PresetFormValues>;
                          const modelFolderId =
                            getModelFolderId('modelFolderId');
                          // antd Space.Compact → Astryx ButtonGroup; per-button
                          // antd Tooltips become the Button's built-in
                          // `tooltip` prop. The group `label` is aria-only
                          // (existing key reused).
                          return (
                            <ButtonGroup label={t('deployment.ModelFolder')}>
                              <IconButton
                                icon={<FolderOpenIcon />}
                                label={t('modelService.OpenFolder')}
                                tooltip={t('modelService.OpenFolder')}
                                isDisabled={!modelFolderId}
                                onClick={() => {
                                  if (modelFolderId) {
                                    openFolderExplorer(
                                      toLocalId(modelFolderId),
                                    );
                                  }
                                }}
                              />
                              <IconButton
                                icon={<PlusIcon />}
                                label={t('data.CreateANewStorageFolder')}
                                tooltip={t('data.CreateANewStorageFolder')}
                                // Same gate as the BAIVFolderSelect above.
                                isDisabled={!deploymentProject}
                                onClick={() =>
                                  setIsModelFolderCreateModalOpen(true)
                                }
                              />
                              <IconButton
                                icon={<RotateCw size="1em" />}
                                label={t('button.Refresh')}
                                tooltip={t('button.Refresh')}
                                onClick={() => {
                                  startTransition(() => {
                                    presetVFolderSelectRef.current?.refetch();
                                  });
                                }}
                              />
                            </ButtonGroup>
                          );
                        }}
                      </BAIFormItem>
                    </BAIFlex>
                  </BAIFormItem>
                );
              }}
            </BAIFormItem>

            {/* 3) The preset selector for the chosen source. In card mode the
                options are scoped to the card's compatible presets. */}
            <BAIFormItem
              dependencies={['presetModelSource', 'modelCardId']}
              noStyle
            >
              {(form) => {
                const { getFieldValue } =
                  form as FormInstance<PresetFormValues>;
                const source = getFieldValue(
                  'presetModelSource',
                ) as PresetModelSource;
                const modelCardId = getFieldValue('modelCardId');
                return (
                  <BAIFormItem
                    label={t('modelStore.Preset')}
                    tooltip={t('modelStore.PresetTooltip')}
                    required
                  >
                    <BAIFlex direction="row" gap="xs">
                      <Suspense
                        fallback={
                          <SelectLoadingFallback
                            label={t('modelStore.Preset')}
                          />
                        }
                      >
                        <BAIFormItem
                          name="revisionPresetId"
                          messageVariables={{ label: t('modelStore.Preset') }}
                          noStyle
                          rules={[{ required: true }]}
                        >
                          {source === 'card' ? (
                            <ModelCardPresetSelect
                              modelCardId={modelCardId}
                              label={t('modelStore.Preset')}
                              isLabelHidden
                            />
                          ) : (
                            <BAIAvailablePresetSelect
                              label={t('modelStore.Preset')}
                              isLabelHidden
                            />
                          )}
                        </BAIFormItem>
                      </Suspense>
                      <BAIFormItem dependencies={['revisionPresetId']} noStyle>
                        {(presetIdForm) => {
                          const { getFieldValue: getPresetId } =
                            presetIdForm as FormInstance<PresetFormValues>;
                          const selectedId = getPresetId('revisionPresetId');
                          // PILOT-DECISION: antd `Space.Compact` around a
                          // SINGLE button carried no grouping — dropped, plain
                          // IconButton. The external antd Tooltip becomes the
                          // Button's built-in `tooltip` prop (Astryx forbids
                          // wrapping a disabled control in Tooltip).
                          return (
                            <IconButton
                              icon={<Info size="1em" />}
                              label={t('modelService.DeploymentPresetDetail')}
                              tooltip={t('modelService.DeploymentPresetDetail')}
                              isLoading={isPresetDetailPending}
                              isDisabled={!selectedId}
                              onClick={() => {
                                if (!selectedId) return;
                                startPresetDetailTransition(() => {
                                  setPresetDetailId(selectedId);
                                });
                              }}
                            />
                          );
                        }}
                      </BAIFormItem>
                    </BAIFlex>
                  </BAIFormItem>
                );
              }}
            </BAIFormItem>
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
            execution: 'shell',
            shell: DEFAULT_MODEL_SERVICE_SHELL,
            enableHealthCheck: false,
            environ: [],
          })}
        >
          <SectionHeader>{t('deployment.step.ModelAndRuntime')}</SectionHeader>
          <BAIFormItem
            label={t('deployment.ModelFolder')}
            tooltip={t('deployment.ModelFolderTooltip')}
            required
          >
            <BAIFlex direction="row" gap="xs">
              <Suspense
                fallback={
                  <SelectLoadingFallback label={t('deployment.ModelFolder')} />
                }
              >
                <BAIFormItem
                  name="modelFolderId"
                  // BAIFormItem drops `label` on noStyle items (the outer
                  // layout item renders it); keep antd's default required-
                  // message interpolation via messageVariables instead.
                  messageVariables={{ label: t('deployment.ModelFolder') }}
                  noStyle
                  rules={[{ required: true }]}
                >
                  <BAIVFolderSelect
                    ref={customVFolderSelectRef}
                    fallbackLabels={revisionFolderFallbackLabels}
                    label={t('deployment.ModelFolder')}
                    isLabelHidden
                    currentProjectId={deploymentProject?.id}
                    isDisabled={!deploymentProject}
                    excludeDeleted
                    filter='usage_mode == "model"'
                    onChange={() => {
                      // A subpath belongs to the folder it was picked from.
                      customForm.setFieldValue('modelSubpath', undefined);
                    }}
                  />
                </BAIFormItem>
              </Suspense>
              <BAIFormItem dependencies={['modelFolderId']} noStyle>
                {(form) => {
                  const { getFieldValue } = form as FormInstance<FormValues>;
                  const modelFolderId = getFieldValue('modelFolderId');
                  return (
                    <ButtonGroup label={t('deployment.ModelFolder')}>
                      <IconButton
                        icon={<FolderOpenIcon />}
                        label={t('modelService.OpenFolder')}
                        tooltip={t('modelService.OpenFolder')}
                        isDisabled={!modelFolderId}
                        onClick={() => {
                          if (modelFolderId) {
                            openFolderExplorer(toLocalId(modelFolderId));
                          }
                        }}
                      />
                      <IconButton
                        icon={<PlusIcon />}
                        label={t('data.CreateANewStorageFolder')}
                        tooltip={t('data.CreateANewStorageFolder')}
                        // Same gate as the BAIVFolderSelect above.
                        isDisabled={!deploymentProject}
                        onClick={() => setIsModelFolderCreateModalOpen(true)}
                      />
                      <IconButton
                        icon={<RotateCw size="1em" />}
                        label={t('button.Refresh')}
                        tooltip={t('button.Refresh')}
                        onClick={() => {
                          startTransition(() => {
                            customVFolderSelectRef.current?.refetch();
                          });
                        }}
                      />
                    </ButtonGroup>
                  );
                }}
              </BAIFormItem>
            </BAIFlex>
          </BAIFormItem>
          {/* Model-folder mount config (FR-3205): the destination path and an
              optional subpath for the selected model folder. Replaces the
              per-mode mount-path inputs that used to live in the command /
              config-file sections. */}
          <BAIFlex gap="sm" align="start">
            <BAIFormItem
              name="modelMountDestination"
              label={t('modelService.ModelMountDestination')}
              tooltip={t('modelService.ModelMountTooltip')}
              style={{ flex: 1 }}
            >
              <AstryxFormTextInput
                label={t('modelService.ModelMountDestination')}
                hasClear
                placeholder={modelDefinitionDefaults?.modelMountDestination}
              />
            </BAIFormItem>
            {supportsMountSubpath && (
              <BAIFormItem
                name="modelSubpath"
                label={t('modelService.Subpath')}
                tooltip={t('modelService.SubpathTooltip')}
                style={{ flex: 1 }}
              >
                <BAIVFolderPathPicker
                  vfolderUuid={
                    watchedModelFolderId
                      ? toLocalId(watchedModelFolderId)
                      : undefined
                  }
                  disabled={!watchedModelFolderId}
                />
              </BAIFormItem>
            )}
          </BAIFlex>
          <Suspense
            fallback={
              <SelectLoadingFallback label={t('deployment.RuntimeVariant')} />
            }
          >
            <BAIFormItem
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
                label={t('deployment.RuntimeVariant')}
                isLabelHidden
                onResolvedVariantsChange={(map) =>
                  setRuntimeVariantMap((prev) => ({ ...prev, ...map }))
                }
              />
            </BAIFormItem>
          </Suspense>

          <BAIFormItem dependencies={['runtimeVariantId']} noStyle>
            {(form) => {
              const { getFieldValue } = form as FormInstance<FormValues>;
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
          </BAIFormItem>

          <BAIFormItem dependencies={['runtimeVariantId']} noStyle>
            {(form) => {
              const { getFieldValue } = form as FormInstance<FormValues>;
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
                // No extra bottom margin: ServiceConfigurationFormItems owns
                // its own section-end gap.
                <div>
                  <ServiceConfigurationFormItems
                    namePrefix={[]}
                    placeholders={{
                      command: modelDefinitionDefaults?.startCommand,
                      port: modelDefinitionDefaults?.port?.toString(),
                    }}
                  />
                </div>
              );
            }}
          </BAIFormItem>

          {/* Health check is shown for every runtime variant and definition
              mode (FR-3068); enabling it submits a health-check override. */}
          <ModelServiceHealthCheckFormItems
            namePrefix={[]}
            placeholders={{
              path: modelDefinitionDefaults?.healthCheckPath,
              maxRetries: modelDefinitionDefaults?.maxRetries?.toString(),
              initialDelay: modelDefinitionDefaults?.initialDelay?.toString(),
            }}
          />

          {/* Pre-Start Actions — always visible regardless of runtime variant */}
          <PreStartActionsFormList namePrefix={[]} />

          <SectionHeader>{t('session.launcher.Environments')}</SectionHeader>

          <Suspense fallback={<BAISkeleton rows={2} />}>
            <ImageEnvironmentSelectFormItems />
          </Suspense>
          <EnvVarFormList
            name="environ"
            optionalEnvVars={commonEnvVars}
            formItemProps={{
              validateTrigger: ['onChange', 'onBlur'],
            }}
          />

          <SectionHeader>
            {t('deployment.step.ClusterAndResources')}
          </SectionHeader>
          {deploymentProject ? (
            <Suspense fallback={<BAISkeleton rows={4} />}>
              <ResourceAllocationFormItems
                project={deploymentProject}
                enableResourcePresets
                hideResourceGroupFormItem
              />
            </Suspense>
          ) : null}

          {/* PILOT-DECISION: antd Collapse (single bordered panel) → Astryx
              Collapsible: the boxed/bordered panel chrome is dropped (Astryx
              Collapsible is a flat "ghost" trigger + content — the design's
              default). `defaultIsOpen={false}` is required: antd panels start
              collapsed, Astryx Collapsible defaults to open. */}
          <Collapsible
            className="bai-collapsible-section"
            trigger={t('session.launcher.AdvancedSettings')}
            defaultIsOpen={false}
          >
            <Suspense fallback={<BAISkeleton />}>
              {/* The path points at the model-definition.yaml the server
                  will read, so the field means nothing for a variant that
                  does not read the vfolder config files. */}
              {readsVfolderConfigFiles && (
                <BAIFormItem
                  name="definitionPath"
                  label={t('deployment.ModelDefinitionPath')}
                  tooltip={t('modelService.ModelDefinitionPathTooltip')}
                  rules={[{ whitespace: true }]}
                  preserve={false}
                >
                  <AstryxFormTextInput
                    label={t('deployment.ModelDefinitionPath')}
                    hasClear
                    placeholder="model-definition.yaml"
                  />
                </BAIFormItem>
              )}
              <BAIFormItem
                noStyle
                dependencies={['modelFolderId', 'mount_id_map', 'mount_ids']}
              >
                {(form) => {
                  const { getFieldValue } = form as FormInstance<FormValues>;
                  const modelFolderId = getFieldValue('modelFolderId');
                  const modelFolderIdNoDash = modelFolderId
                    ? safeDecodeUuid(String(modelFolderId))?.replace(/-/g, '')
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
              </BAIFormItem>
            </Suspense>
          </Collapsible>
        </Form>
      )}
      {/*
        Kept mounted (not gated by `presetDetailId`) for the same reason as the
        model-card boundary below: revealing the preset modal recedes an
        already-resolved boundary, so the `startPresetDetailTransition` update
        holds `isPresetDetailPending` true and spins the (i) button while the
        detail prefetch loads instead of committing the null fallback.
      */}
      <Suspense fallback={null}>
        {presetDetailId && (
          <PresetDetailLoader
            presetId={presetDetailId}
            onCancel={() => setPresetDetailId(null)}
          />
        )}
      </Suspense>
      {/*
        The boundary stays mounted (not gated by `modelCardDetailId`) so opening
        the drawer recedes an already-resolved boundary. Inside the
        `startModelCardDetailTransition` update React then holds the prior UI and
        keeps `isModelCardDetailPending` true while the detail prefetch loads —
        driving the (i) button's spinner — instead of committing the null
        fallback immediately.
      */}
      <Suspense fallback={null}>
        {modelCardDetailId && (
          <ModelCardDetailLoader
            modelCardId={modelCardDetailId}
            onClose={() => setModelCardDetailId(null)}
          />
        )}
      </Suspense>
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
        // Never reach the `project={null}` tier from here: `onRequestClose`
        // would write back a folder this revision cannot mount.
        open={isModelFolderCreateModalOpen && !!deploymentProject}
        project={deploymentProject}
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
            // Programmatic setFieldValue skips the select's onChange, so drop
            // any subpath picked from the previously selected folder here.
            customForm.setFieldValue('modelSubpath', undefined);
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
